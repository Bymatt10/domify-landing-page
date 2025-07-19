import { createServerClient } from '@supabase/ssr'
import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from '$lib/env-utils'

// Get environment variables with fallbacks
const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();

// Cliente con service role para operaciones administrativas
export const createSupabaseAdminClient = (fetch: typeof globalThis.fetch) => {
    const supabaseServiceRoleKey = getSupabaseServiceRoleKey();
    
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