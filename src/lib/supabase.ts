import { createClient } from '@supabase/supabase-js'
import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr'
import { getSupabaseUrl, getSupabaseAnonKey } from './env-utils'

const supabaseUrl = getSupabaseUrl()
const supabaseAnonKey = getSupabaseAnonKey()

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