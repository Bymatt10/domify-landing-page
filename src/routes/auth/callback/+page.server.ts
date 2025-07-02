import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { getOrCreateUserProfile } from '$lib/auth-fixes'

export const load: PageServerLoad = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') ?? '/'

  if (code) {
    try {
      console.log('=== OAuth Callback Debug ===');
      console.log('Code recibido:', code ? 'SÍ' : 'NO');
      console.log('Next URL:', next);
      
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      console.log('exchangeCodeForSession resultado:', {
        hasData: !!data,
        hasUser: !!data?.user,
        hasSession: !!data?.session,
        error: error?.message || 'NO ERROR'
      });
      
      if (!error && data.user) {
        console.log('Usuario autenticado con OAuth:', {
          id: data.user.id,
          email: data.user.email,
          provider: data.user.app_metadata?.provider,
          userMetadata: data.user.user_metadata,
          appMetadata: data.user.app_metadata
        });
        
        // Preparar datos de usuario con fallbacks más robustos
        const firstName = data.user.user_metadata?.full_name?.split(' ')[0] 
          || data.user.user_metadata?.name?.split(' ')[0] 
          || data.user.user_metadata?.given_name 
          || 'Usuario';
          
        const lastName = data.user.user_metadata?.full_name?.split(' ').slice(1).join(' ')
          || data.user.user_metadata?.name?.split(' ').slice(1).join(' ')
          || data.user.user_metadata?.family_name
          || 'OAuth';
        
        console.log('Datos preparados para perfil:', { firstName, lastName });
        
        // Obtener o crear perfil usando función helper
        const { profile, created, error: profileError } = await getOrCreateUserProfile(
          supabase,
          data.user.id,
          {
            first_name: firstName,
            last_name: lastName
          }
        );

        console.log('Resultado getOrCreateUserProfile:', {
          hasProfile: !!profile,
          created,
          hasError: !!profileError
        });

        if (profileError) {
          console.error('Error manejando perfil de usuario:', profileError);
          console.error('Tipo de error:', typeof profileError);
          console.error('Error detallado:', JSON.stringify(profileError, null, 2));
          
          // Mejor manejo de serialización de errores de perfil
          let msg = 'Error creando perfil de usuario';
          if (profileError instanceof Error) {
            msg = profileError.message;
          } else if (typeof profileError === 'string') {
            msg = profileError;
          } else if (profileError && typeof profileError === 'object' && 'message' in profileError) {
            msg = String(profileError.message);
          }
          
          console.log('Redirigiendo con error de perfil:', msg);
          throw redirect(303, `/auth/login?error=profileError:${encodeURIComponent(msg)}`)
        } else if (created) {
          console.log('✅ Perfil de customer creado exitosamente para usuario OAuth:', data.user.email);
        } else {
          console.log('✅ Perfil de customer ya existe para usuario OAuth:', data.user.email);
        }
        
        console.log('✅ Redirigiendo exitosamente a:', next);
        console.log('✅ OAuth callback completado exitosamente para:', data.user.email);
        throw redirect(303, next)
      } else if (error) {
        console.error('❌ Error en OAuth callback:', error);
        console.error('Tipo de error OAuth:', typeof error);
        console.error('Error OAuth detallado:', JSON.stringify(error, null, 2));
        
        const msg = typeof error === 'object' && error !== null && 'message' in error ? String(error.message) : String(error);
        console.log('Redirigiendo con error OAuth:', msg);
        throw redirect(303, `/auth/login?error=oauthError:${encodeURIComponent(msg)}`)
      }
    } catch (e) {
      console.error('💥 Excepción inesperada en OAuth callback:', e);
      console.error('Tipo de excepción:', typeof e);
      console.error('Stack trace:', e instanceof Error ? e.stack : 'No stack trace');
      
      // Verificar si es un redirect válido que se capturó incorrectamente
      if (e && typeof e === 'object' && 'status' in e && 'location' in e) {
        const redirectData = e as { status?: number; location?: string };
        if (redirectData.status === 303 && redirectData.location) {
          console.log('✅ Redirect válido capturado, permitiendo el redirect a:', redirectData.location);
          // Re-lanzar el redirect correctamente
          throw redirect(303, redirectData.location);
        }
      }
      
      // Mejor manejo de serialización de errores
      let msg = 'Error inesperado durante la autenticación';
      if (e instanceof Error) {
        msg = e.message;
        console.log('Error message:', msg);
      } else if (typeof e === 'string') {
        msg = e;
      } else if (e && typeof e === 'object') {
        try {
          msg = JSON.stringify(e);
          console.log('Error serializado:', msg);
        } catch (jsonError) {
          // Si JSON.stringify falla (referencias circulares, etc)
          msg = 'Error complejo durante la autenticación';
          console.log('Error de serialización, usando mensaje genérico');
        }
      }
      
      console.log('🔄 Redirigiendo con excepción:', msg);
      throw redirect(303, `/auth/login?error=exception:${encodeURIComponent(msg)}`)
    }
  }

  // If there's an error or no code, redirect to login
  console.log('❌ No hay código OAuth, redirigiendo a login');
  throw redirect(303, '/auth/login?error=No se pudo autenticar al usuario.')
} 