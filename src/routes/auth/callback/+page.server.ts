import { redirect } from '@sveltejs/kit'

export const load = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get('code')

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      throw redirect(303, '/')
    }
  }

  // If there's an error or no code, redirect to login
  throw redirect(303, '/auth/login')
} 