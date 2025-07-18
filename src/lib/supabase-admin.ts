import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL } from '$env/static/private';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

if (!SUPABASE_URL) {
    throw new Error('SUPABASE_URL is not defined');
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined');
}

// Cliente administrativo con service role - bypass RLS
export const supabaseAdmin = createClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
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