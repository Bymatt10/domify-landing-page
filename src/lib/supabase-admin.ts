import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Instancia lazy: se crea solo cuando se necesita en runtime, no en el análisis de SvelteKit
let _supabaseAdmin: SupabaseClient | null = null;

function getSupabaseAdminClient(): SupabaseClient {
    if (_supabaseAdmin) return _supabaseAdmin;

    const url = process.env.PUBLIC_SUPABASE_URL || '';
    const key =
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.PRIVATE_SUPABASE_SERVICE_ROLE_KEY ||
        process.env.PUBLIC_SUPABASE_SERVICE_ROLE_KEY ||
        '';

    if (!url || !key) {
        console.warn('⚠️ supabaseAdmin: Variables de Supabase no configuradas en runtime.');
    }

    _supabaseAdmin = createClient(url || 'https://fallback.supabase.co', key || 'fallback-key', {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        },
        db: {
            schema: 'public'
        }
    });

    return _supabaseAdmin;
}

// Proxy para mantener compatibilidad con el código existente que usa `supabaseAdmin.from(...)`
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
    get(_target, prop) {
        return (getSupabaseAdminClient() as any)[prop];
    }
});

// Función para verificar la conexión del admin
export async function testAdminConnection() {
    try {
        const { data, error } = await getSupabaseAdminClient()
            .from('provider_applications')
            .select('count(*)', { count: 'exact', head: true });

        if (error) {
            console.error('Admin connection test failed:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Admin connection test error:', error);
        return false;
    }
}