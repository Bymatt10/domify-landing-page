import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { getOrCreateUserProfile } from '$lib/auth-fixes'
export const load: PageServerLoad = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') ?? '/'
  const error = url.searchParams.get('error')
  const errorDescription = url.searchParams.get('error_description')

  // Handle OAuth errors from Google
  if (error) {
    console.error('❌ OAuth Error from Google:', { error, errorDescription });
    throw redirect(303, `/auth/login?error=oauthError:${encodeURIComponent(errorDescription || error)}`)
  }

  if (code) {
    console.log('=== OAuth Callback Debug ===');
    console.log('Code recibido:', code ? 'SÍ' : 'NO');
    console.log('Next URL:', next);
    console.log('URL completa:', url.toString());
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      console.log('exchangeCodeForSession resultado:', {
        hasData: !!data,
        hasUser: !!data?.user,
        hasSession: !!data?.session,
        error: error?.message || 'NO ERROR'
      });
      
      if (error) {
        console.error('❌ Error en OAuth callback:', error);
        const msg = typeof error === 'object' && error !== null && 'message' in error ? String(error.message) : String(error);
        
        // Handle specific PKCE errors
        if (msg.includes('code challenge') || msg.includes('code verifier')) {
          console.error('❌ Error PKCE detectado:', msg);
          throw redirect(303, `/auth/login?error=pkceError:${encodeURIComponent('Error de autenticación. Por favor, intenta de nuevo.')}`)
        }
        
        console.log('Redirigiendo con error OAuth:', msg);
        throw redirect(303, `/auth/login?error=oauthError:${encodeURIComponent(msg)}`)
      }
      
      if (!data?.user) {
        console.error('❌ No se obtuvo usuario del OAuth callback');
        throw redirect(303, '/auth/login?error=No se pudo obtener información del usuario.')
      }

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
      }
      
      if (created) {
        console.log('✅ Perfil de customer creado exitosamente para usuario OAuth:', data.user.email);
      } else {
        console.log('✅ Perfil de customer ya existe para usuario OAuth:', data.user.email);
      }
      
      console.log('✅ Redirigiendo exitosamente a:', next);
      console.log('✅ OAuth callback completado exitosamente para:', data.user.email);
      
      // Verificar que la sesión se estableció correctamente antes del redirect
      const { data: { user: finalUser } } = await supabase.auth.getUser();
      const { data: { session: finalSession }, error: finalSessionError } = await supabase.auth.getSession();
      console.log('Sesión final antes del redirect:', {
        hasUser: !!finalUser,
        hasSession: !!finalSession,
        sessionExpiry: finalSession?.expires_at,
        sessionError: finalSessionError?.message || 'NO ERROR'
      });
      
      // Redirect exitoso - no capturar como excepción
      return redirect(303, next);
      
    } catch (e) {
      // Solo manejar errores reales, no redirects exitosos
      if (e && typeof e === 'object' && 'status' in e && 'location' in e) {
        const redirectData = e as { status?: number; location?: string };
        if (redirectData.status === 303 && redirectData.location) {
          console.log('✅ Redirect válido detectado, permitiendo el redirect a:', redirectData.location);
          throw e; // Re-lanzar el redirect
        }
      }
      
      console.error('💥 Error real en OAuth callback:', e);
      let msg = 'Error inesperado durante la autenticación';
      if (e instanceof Error) {
        msg = e.message;
      } else if (typeof e === 'string') {
        msg = e;
      } else if (e && typeof e === 'object') {
        try {
          msg = JSON.stringify(e);
        } catch (jsonError) {
          msg = 'Error complejo durante la autenticación';
        }
      }
      
      console.log('🔄 Redirigiendo con error real:', msg);
      throw redirect(303, `/auth/login?error=exception:${encodeURIComponent(msg)}`)
    }
  }

  // If there's an error or no code, redirect to login
  console.log('❌ No hay código OAuth, redirigiendo a login');
  throw redirect(303, '/auth/login?error=No se pudo autenticar al usuario.')
} 