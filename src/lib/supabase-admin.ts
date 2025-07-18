import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { PRIVATE_SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

if (!PUBLIC_SUPABASE_URL) {
    throw new Error('PUBLIC_SUPABASE_URL is not defined');
}

if (!PRIVATE_SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('PRIVATE_SUPABASE_SERVICE_ROLE_KEY is not defined');
}

// Cliente administrativo con service role - bypass RLS
export const supabaseAdmin = createClient(
    PUBLIC_SUPABASE_URL,
    PRIVATE_SUPABASE_SERVICE_ROLE_KEY,
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