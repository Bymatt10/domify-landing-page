import { createServerClient } from '@supabase/ssr'
import { PRIVATE_SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private'

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
    console.error('PUBLIC_SUPABASE_URL no está definida en las variables de entorno');
    throw new Error('PUBLIC_SUPABASE_URL no está definida');
}

if (!supabaseAnonKey) {
    console.error('PUBLIC_SUPABASE_ANON_KEY no está definida en las variables de entorno');
    throw new Error('PUBLIC_SUPABASE_ANON_KEY no está definida');
}

// Cliente con service role para operaciones administrativas
export const createSupabaseAdminClient = (fetch: typeof globalThis.fetch) => {
    const supabaseServiceRoleKey = PRIVATE_SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseServiceRoleKey) {
        console.error('PRIVATE_SUPABASE_SERVICE_ROLE_KEY no está definida en las variables de entorno');
        throw new Error('PRIVATE_SUPABASE_SERVICE_ROLE_KEY no está definida');
    }
    
    return createServerClient(supabaseUrl, supabaseServiceRoleKey, {
        global: {
            fetch,
        },
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        },
        cookies: {
            get(key) {
                return undefined
            },
            set(key, value, options) {
                // Server-side cookie setting will be handled by hooks
            },
            remove(key, options) {
                // Server-side cookie removal will be handled by hooks
            },
        }
    })
} 