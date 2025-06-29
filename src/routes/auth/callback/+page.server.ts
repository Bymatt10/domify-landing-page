import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { getOrCreateUserProfile } from '$lib/auth-fixes'

export const load: PageServerLoad = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') ?? '/'

  if (code) {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error && data.user) {
        console.log('Usuario autenticado con OAuth:', data.user.email);
        
        // Obtener o crear perfil usando función helper
        const { profile, created, error: profileError } = await getOrCreateUserProfile(
          supabase,
          data.user.id,
          {
            first_name: data.user.user_metadata?.full_name?.split(' ')[0] || 'Usuario',
            last_name: data.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || 'Nuevo',
            role: 'customer'
          }
        );

        if (profileError) {
          console.error('Error manejando perfil de usuario:', profileError);
          const msg = typeof profileError === 'object' && profileError !== null && 'message' in profileError ? String(profileError.message) : String(profileError);
          throw redirect(303, `/auth/login?error=profileError:${encodeURIComponent(msg)}`)
        } else if (created) {
          console.log('Perfil de customer creado exitosamente');
        } else {
          console.log('Perfil de customer ya existe');
        }
        throw redirect(303, next)
      } else if (error) {
        console.error('Error en OAuth callback:', error);
        const msg = typeof error === 'object' && error !== null && 'message' in error ? String(error.message) : String(error);
        throw redirect(303, `/auth/login?error=oauthError:${encodeURIComponent(msg)}`)
      }
    } catch (e) {
      console.error('Excepción inesperada en OAuth callback:', e);
      const msg = e instanceof Error ? e.message : String(e);
      throw redirect(303, `/auth/login?error=exception:${encodeURIComponent(msg)}`)
    }
  }

  // If there's an error or no code, redirect to login
  throw redirect(303, '/auth/login?error=No se pudo autenticar al usuario.')
} 