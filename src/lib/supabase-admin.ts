import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '$lib/env-utils';

// Get environment variables with fallbacks
const SUPABASE_URL = getSupabaseUrl();
const SERVICE_ROLE_KEY = getSupabaseServiceRoleKey();

// Cliente administrativo con service role - bypass RLS
export const supabaseAdmin = createClient(
    SUPABASE_URL,
    SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        },
        db: {
            schema: 'public'
        }
    }
);

// Función para verificar la conexión del admin
export async function testAdminConnection() {
    try {
        const { data, error } = await supabaseAdmin
            .from('provider_applications')
            .select('count(*)', { count: 'exact', head: true });
        
        if (error) {
            console.error('Admin connection test failed:', error);
            return false;
        }
        
        console.log('✅ Admin connection successful');
        return true;
    } catch (error) {
        console.error('Admin connection test error:', error);
        return false;
    }
} 