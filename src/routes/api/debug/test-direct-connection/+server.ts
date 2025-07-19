import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';

import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from '$lib/env-utils';

// Get environment variables with fallbacks
const SUPABASE_URL = getSupabaseUrl();
const SUPABASE_ANON_KEY = getSupabaseAnonKey();
const SERVICE_ROLE_KEY = getSupabaseServiceRoleKey();

export const GET: RequestHandler = async () => {
  try {
    console.log('=== DEBUGGING ENVIRONMENT VARIABLES ===');
    console.log('SUPABASE_URL:', SUPABASE_URL);
    console.log('SERVICE_ROLE_KEY (first 50 chars):', SERVICE_ROLE_KEY?.substring(0, 50));
    console.log('SERVICE_ROLE_KEY (length):', SERVICE_ROLE_KEY?.length);
    
    // Verificar que las variables no estén vacías
    if (!SUPABASE_URL) {
      return json({
        status: 'ERROR',
        message: 'SUPABASE_URL is empty or undefined'
      });
    }
    
    if (!SERVICE_ROLE_KEY) {
      return json({
        status: 'ERROR',
        message: 'SERVICE_ROLE_KEY is empty or undefined'
      });
    }
    
    // Método 1: Fetch directo (como el curl que funciona)
    console.log('Testing direct fetch...');
    try {
      const fetchResponse = await fetch(`${SUPABASE_URL}/rest/v1/provider_applications?limit=2`, {
        headers: {
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'apikey': SERVICE_ROLE_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      if (fetchResponse.ok) {
        const fetchData = await fetchResponse.json();
        return json({
          status: 'SUCCESS',
          method: 'DIRECT_FETCH',
          message: 'Direct fetch works!',
          recordCount: fetchData?.length || 0,
          data: fetchData
        });
      } else {
        console.log('Direct fetch failed:', fetchResponse.status, fetchResponse.statusText);
        const errorText = await fetchResponse.text();
        console.log('Error response:', errorText);
      }
    } catch (fetchError) {
      console.error('Direct fetch exception:', fetchError);
    }
    
    // Método 2: Cliente Supabase
    console.log('Testing Supabase client...');
    
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { data, error } = await supabaseAdmin
      .from('provider_applications')
      .select('*')
      .limit(2);
    
    if (error) {
      console.error('Supabase client error:', error);
      return json({
        status: 'ERROR',
        method: 'SUPABASE_CLIENT',
        message: 'Supabase client failed',
        error: error.message,
        details: error,
        env_info: {
          url: SUPABASE_URL,
          key_prefix: SERVICE_ROLE_KEY?.substring(0, 20),
          key_length: SERVICE_ROLE_KEY?.length
        }
      });
    }

    return json({
      status: 'SUCCESS',
      method: 'SUPABASE_CLIENT',
      message: 'Supabase client works!',
      recordCount: data?.length || 0,
      data: data
    });

  } catch (error) {
    console.error('Exception in direct connection test:', error);
    return json({
      status: 'EXCEPTION',
      message: 'Exception occurred',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 