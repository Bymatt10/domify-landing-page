import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';

export const POST: RequestHandler = async () => {
    try {
        const results: any = {
            timestamp: new Date().toISOString(),
            bucket_creation: {}
        };

        // Check if media bucket already exists
        try {
            const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
            
            const mediaBucketExists = buckets?.some((bucket: any) => bucket.name === 'media');
            
            if (mediaBucketExists) {
                results.bucket_creation.status = 'already_exists';
                results.bucket_creation.message = 'Media bucket already exists';
                results.bucket_creation.success = true;
            } else {
                // Create the media bucket
                const { data: newBucket, error: createError } = await supabase.storage.createBucket('media', {
                    public: true,
                    allowedMimeTypes: ['image/*', 'video/*'],
                    fileSizeLimit: 52428800 // 50MB
                });

                if (createError) {
                    results.bucket_creation.status = 'creation_failed';
                    results.bucket_creation.error = createError.message;
                    results.bucket_creation.success = false;
                } else {
                    results.bucket_creation.status = 'created';
                    results.bucket_creation.data = newBucket;
                    results.bucket_creation.message = 'Media bucket created successfully';
                    results.bucket_creation.success = true;
                }
            }
        } catch (error) {
            results.bucket_creation.status = 'error';
            results.bucket_creation.error = error instanceof Error ? error.message : 'Unknown error';
            results.bucket_creation.success = false;
        }

        return json({
            data: results,
            message: 'Media bucket creation check completed',
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