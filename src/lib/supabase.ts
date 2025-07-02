import { createClient } from '@supabase/supabase-js'
import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr'

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

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
})

export const createSupabaseServerClient = (fetch: typeof globalThis.fetch) => {
    return createServerClient(supabaseUrl, supabaseAnonKey, {
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
            },
            remove(key, options) {
            },
        }
    })
} 