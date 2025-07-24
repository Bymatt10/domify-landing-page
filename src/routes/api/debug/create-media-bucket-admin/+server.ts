import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '$lib/env-utils';

export const POST: RequestHandler = async () => {
    try {
        const supabaseUrl = getSupabaseUrl();
        const serviceRoleKey = getSupabaseServiceRoleKey();

        // Check if we have service role key
        if (serviceRoleKey === 'fallback-service-role-key') {
            return json({
                error: {
                    message: 'Service role key not configured. Cannot create bucket without admin privileges.',
                    statusCode: 403,
                    timestamp: new Date().toISOString()
                }
            }, { status: 403 });
        }

        const results: any = {
            timestamp: new Date().toISOString(),
            bucket_creation: {}
        };

        try {
            // Create bucket using admin API
            const createResponse = await fetch(`${supabaseUrl}/rest/v1/storage/buckets`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    id: 'media',
                    name: 'media',
                    public: true,
                    allowed_mime_types: ['image/*', 'video/*'],
                    file_size_limit: 52428800 // 50MB
                })
            });

            if (createResponse.ok) {
                const bucketData = await createResponse.json();
                results.bucket_creation.status = 'created';
                results.bucket_creation.data = bucketData;
                results.bucket_creation.message = 'Media bucket created successfully';
                results.bucket_creation.success = true;
            } else {
                const errorText = await createResponse.text();
                results.bucket_creation.status = 'creation_failed';
                results.bucket_creation.error = errorText;
                results.bucket_creation.success = false;
            }
        } catch (error) {
            results.bucket_creation.status = 'error';
            results.bucket_creation.error = error instanceof Error ? error.message : 'Unknown error';
            results.bucket_creation.success = false;
        }

        return json({
            data: results,
            message: 'Media bucket creation completed',
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