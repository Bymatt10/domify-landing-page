import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';

export const GET: RequestHandler = async () => {
    try {
        const results: any = {
            timestamp: new Date().toISOString(),
            storage_check: {}
        };

        // Check if domify bucket exists
        try {
            const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
            
            results.storage_check.buckets = {
                success: !bucketsError,
                data: buckets,
                error: bucketsError?.message,
                has_domify_bucket: buckets?.some((bucket: any) => bucket.name === 'domify')
            };
        } catch (error) {
            results.storage_check.buckets = {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }

        // Check domify bucket specifically
        try {
            const { data: domifyFiles, error: domifyError } = await supabase.storage
                .from('domify')
                .list('providers', { limit: 1 });

            results.storage_check.domify_bucket = {
                success: !domifyError,
                data: domifyFiles,
                error: domifyError?.message,
                can_access: !domifyError
            };
        } catch (error) {
            results.storage_check.domify_bucket = {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                can_access: false
            };
        }

        // Test upload permissions (without actually uploading)
        try {
            const { data: uploadTest, error: uploadError } = await supabase.storage
                .from('domify')
                .list('providers/test', { limit: 1 });

            results.storage_check.upload_permissions = {
                success: !uploadError,
                error: uploadError?.message,
                can_upload: !uploadError || uploadError.message.includes('not found') // "not found" means we can create folders
            };
        } catch (error) {
            results.storage_check.upload_permissions = {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                can_upload: false
            };
        }

        return json({
            data: results,
            message: 'Storage bucket check completed',
            statusCode: 200,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        return json({
            error: {
                message: error instanceof Error ? error.message : 'Unknown error',
                statusCode: 500,
                timestamp: new Date().toISOString()
            }
        }, { status: 500 });
    }
}; 