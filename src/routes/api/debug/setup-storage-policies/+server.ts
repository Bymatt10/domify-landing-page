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
                    message: 'Service role key not configured. Cannot set up policies without admin privileges.',
                    statusCode: 403,
                    timestamp: new Date().toISOString()
                }
            }, { status: 403 });
        }

        const results: any = {
            timestamp: new Date().toISOString(),
            policies_setup: {}
        };

        // SQL policies to create
        const policies = [
            {
                name: 'Public read access to domify bucket',
                sql: `CREATE POLICY "Public read access to domify bucket" ON storage.objects
                      FOR SELECT USING (bucket_id = 'domify');`
            },
            {
                name: 'Users can upload files to their own folder',
                sql: `CREATE POLICY "Users can upload files to their own folder" ON storage.objects
                      FOR INSERT WITH CHECK (
                        bucket_id = 'domify' AND 
                        auth.uid()::text = (storage.foldername(name))[2]
                      );`
            },
            {
                name: 'Users can delete their own files',
                sql: `CREATE POLICY "Users can delete their own files" ON storage.objects
                      FOR DELETE USING (
                        bucket_id = 'domify' AND 
                        auth.uid()::text = (storage.foldername(name))[2]
                      );`
            },
            {
                name: 'Users can update their own files',
                sql: `CREATE POLICY "Users can update their own files" ON storage.objects
                      FOR UPDATE USING (
                        bucket_id = 'domify' AND 
                        auth.uid()::text = (storage.foldername(name))[2]
                      );`
            }
        ];

        // Execute each policy
        for (const policy of policies) {
            try {
                const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        sql: policy.sql
                    })
                });

                if (response.ok) {
                    results.policies_setup[policy.name] = {
                        success: true,
                        message: 'Policy created successfully'
                    };
                } else {
                    const errorText = await response.text();
                    results.policies_setup[policy.name] = {
                        success: false,
                        error: errorText,
                        message: 'Policy creation failed'
                    };
                }
            } catch (error) {
                results.policies_setup[policy.name] = {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    message: 'Policy creation failed'
                };
            }
        }

        return json({
            data: results,
            message: 'Storage policies setup completed',
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