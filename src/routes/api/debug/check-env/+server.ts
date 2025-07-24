import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from '$lib/env-utils';

export const GET: RequestHandler = async () => {
    try {
        const supabaseUrl = getSupabaseUrl();
        const supabaseAnonKey = getSupabaseAnonKey();
        const supabaseServiceRoleKey = getSupabaseServiceRoleKey();

        const envStatus = {
            supabase: {
                url: supabaseUrl,
                url_valid: supabaseUrl !== 'https://fallback.supabase.co',
                anon_key: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 10)}...` : 'NOT_SET',
                anon_key_valid: supabaseAnonKey !== 'fallback-anon-key',
                service_role_key: supabaseServiceRoleKey ? `${supabaseServiceRoleKey.substring(0, 10)}...` : 'NOT_SET',
                service_role_key_valid: supabaseServiceRoleKey !== 'fallback-service-role-key'
            },
            environment: {
                node_env: process.env.NODE_ENV || 'development',
                is_production: process.env.NODE_ENV === 'production',
                is_development: process.env.NODE_ENV === 'development' || !process.env.NODE_ENV
            },
            import_meta_env: {
                has_public_supabase_url: !!import.meta.env.PUBLIC_SUPABASE_URL,
                has_public_supabase_anon_key: !!import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
                has_supabase_service_role_key: !!import.meta.env.SUPABASE_SERVICE_ROLE_KEY
            },
            process_env: {
                has_public_supabase_url: !!process.env.PUBLIC_SUPABASE_URL,
                has_public_supabase_anon_key: !!process.env.PUBLIC_SUPABASE_ANON_KEY,
                has_supabase_service_role_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY
            }
        };

        return json({
            data: envStatus,
            message: 'Environment variables status',
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