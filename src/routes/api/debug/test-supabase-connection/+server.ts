import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from '$lib/env-utils';

export const GET: RequestHandler = async () => {
    try {
        const supabaseUrl = getSupabaseUrl();
        const supabaseAnonKey = getSupabaseAnonKey();
        const supabaseServiceRoleKey = getSupabaseServiceRoleKey();

        const results: any = {
            timestamp: new Date().toISOString(),
            environment: {
                url: supabaseUrl,
                url_valid: supabaseUrl !== 'https://fallback.supabase.co',
                anon_key_valid: supabaseAnonKey !== 'fallback-anon-key',
                service_role_key_valid: supabaseServiceRoleKey !== 'fallback-service-role-key'
            },
            tests: {}
        };

        // Test 1: Anon key connection
        if (supabaseAnonKey !== 'fallback-anon-key') {
            try {
                const anonResponse = await fetch(`${supabaseUrl}/rest/v1/categories?select=id,name&limit=1`, {
                    headers: {
                        'Authorization': `Bearer ${supabaseAnonKey}`,
                        'apikey': supabaseAnonKey,
                        'Content-Type': 'application/json'
                    }
                });

                results.tests.anon_key = {
                    success: anonResponse.ok,
                    status: anonResponse.status,
                    statusText: anonResponse.statusText,
                    data: anonResponse.ok ? await anonResponse.json() : null,
                    error: !anonResponse.ok ? await anonResponse.text() : null
                };
            } catch (error) {
                results.tests.anon_key = {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                };
            }
        } else {
            results.tests.anon_key = {
                success: false,
                error: 'Anon key not configured'
            };
        }

        // Test 2: Service role key connection
        if (supabaseServiceRoleKey !== 'fallback-service-role-key') {
            try {
                const serviceResponse = await fetch(`${supabaseUrl}/rest/v1/categories?select=id,name&limit=1`, {
                    headers: {
                        'Authorization': `Bearer ${supabaseServiceRoleKey}`,
                        'apikey': supabaseServiceRoleKey,
                        'Content-Type': 'application/json'
                    }
                });

                results.tests.service_role_key = {
                    success: serviceResponse.ok,
                    status: serviceResponse.status,
                    statusText: serviceResponse.statusText,
                    data: serviceResponse.ok ? await serviceResponse.json() : null,
                    error: !serviceResponse.ok ? await serviceResponse.text() : null
                };
            } catch (error) {
                results.tests.service_role_key = {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                };
            }
        } else {
            results.tests.service_role_key = {
                success: false,
                error: 'Service role key not configured'
            };
        }

        // Test 3: Auth endpoint (requires service role)
        if (supabaseServiceRoleKey !== 'fallback-service-role-key') {
            try {
                const authResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users?per_page=1`, {
                    headers: {
                        'Authorization': `Bearer ${supabaseServiceRoleKey}`,
                        'apikey': supabaseServiceRoleKey,
                        'Content-Type': 'application/json'
                    }
                });

                results.tests.auth_endpoint = {
                    success: authResponse.ok,
                    status: authResponse.status,
                    statusText: authResponse.statusText,
                    error: !authResponse.ok ? await authResponse.text() : null
                };
            } catch (error) {
                results.tests.auth_endpoint = {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                };
            }
        } else {
            results.tests.auth_endpoint = {
                success: false,
                error: 'Service role key not configured'
            };
        }

        return json({
            data: results,
            message: 'Supabase connection tests completed',
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