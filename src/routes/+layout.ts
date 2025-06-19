import { createBrowserClient, isBrowser } from '@supabase/ssr'
import { supabase } from '$lib/supabase'

export const load = async ({ data, depends }) => {
  /**
   * Declare a dependency so the layout can be invalidated, for example, on
   * session refresh.
   */
  depends('supabase:auth')

  return { 
    session: data?.session,
    supabase 
  }
} 