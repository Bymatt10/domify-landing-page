import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { PRIVATE_SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

export const GET: RequestHandler = async ({ locals }) => {
  try {
    const results: any = {
      timestamp: new Date().toISOString(),
      environment_check: {
        supabase_url: {
          exists: !!PUBLIC_SUPABASE_URL,
          value: PUBLIC_SUPABASE_URL || 'NOT SET',
          is_localhost: PUBLIC_SUPABASE_URL?.includes('localhost') || false
        },
        anon_key: {
          exists: !!PUBLIC_SUPABASE_ANON_KEY,
          prefix: PUBLIC_SUPABASE_ANON_KEY ? PUBLIC_SUPABASE_ANON_KEY.substring(0, 20) + '...' : 'NOT SET',
          length: PUBLIC_SUPABASE_ANON_KEY ? PUBLIC_SUPABASE_ANON_KEY.length : 0
        },
        service_role_key: {
          exists: !!PRIVATE_SUPABASE_SERVICE_ROLE_KEY,
          prefix: PRIVATE_SUPABASE_SERVICE_ROLE_KEY ? PRIVATE_SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...' : 'NOT SET',
          length: PRIVATE_SUPABASE_SERVICE_ROLE_KEY ? PRIVATE_SUPABASE_SERVICE_ROLE_KEY.length : 0,
          is_service_role: PRIVATE_SUPABASE_SERVICE_ROLE_KEY ? PRIVATE_SUPABASE_SERVICE_ROLE_KEY.includes('service_role') : false
        }
      }
    };

    // Test a simple query with supabaseAdmin
    try {
      const { data: testData, error: testError } = await locals.supabaseAdmin
        .from('categories')
        .select('id, name')
        .limit(1);

      results.supabaseAdmin_test = {
        success: !testError,
        data: testData,
        error: testError?.message,
        error_code: testError?.code
      };
    } catch (error) {
      results.supabaseAdmin_test = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Test auth with supabaseAdmin
    try {
      const { data: authData, error: authError } = await locals.supabaseAdmin.auth.admin.listUsers();
      
      results.auth_test = {
        success: !authError,
        user_count: authData?.users?.length || 0,
        error: authError?.message
      };
    } catch (error) {
      results.auth_test = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    return json(results);

  } catch (error) {
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}; 