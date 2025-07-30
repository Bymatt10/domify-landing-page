import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { getOrCreateUserProfile } from '$lib/auth-fixes'
export const load: PageServerLoad = async ({ url, locals: { supabase } }) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    const code = url.searchParams.get('code')
    const next = url.searchParams.get('next') ?? '/'
    const error = url.searchParams.get('error')
    const errorDescription = url.searchParams.get('error_description')

    console.log(`[${requestId}] === OAuth Callback Debug ===`);
    console.log(`[${requestId}] Code received:`, code ? `YES (length: ${code.length})` : 'NO');
    console.log(`[${requestId}] Next URL:`, next);
    console.log(`[${requestId}] Full URL:`, url.toString());
    console.log(`[${requestId}] Environment:`, {
      nodeEnv: process.env.NODE_ENV,
      origin: url.origin,
      hasSupabaseUrl: !!process.env.PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.PUBLIC_SUPABASE_ANON_KEY
    });

    // Handle OAuth errors from Google/Facebook
    if (error) {
      console.error(`[${requestId}] ❌ OAuth Error:`, { error, errorDescription });
      throw redirect(303, `/auth/login?error=oauthError:${encodeURIComponent(errorDescription || error)}`)
    }

    // Validate code format - OAuth codes should be substantial
    if (code && code.length < 20) {
      console.warn(`[${requestId}] ⚠️ OAuth code seems unusually short:`, code);
    }

    if (code) {
    
    try {
      console.log(`[${requestId}] 🔄 Attempting to exchange code for session...`);
      const exchangeStartTime = Date.now();
      
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      const exchangeTime = Date.now() - exchangeStartTime;
      console.log(`[${requestId}] 📊 exchangeCodeForSession completed in ${exchangeTime}ms:`, {
        hasData: !!data,
        hasUser: !!data?.user,
        hasSession: !!data?.session,
        error: error?.message || 'NO ERROR',
        errorCode: error?.status || 'NO CODE',
        errorDetails: error
      });
      
      if (error) {
        console.error(`[${requestId}] ❌ Error in OAuth callback:`, {
          message: error.message,
          status: error.status,
          code: error.code,
          details: error
        });
        
        const msg = typeof error === 'object' && error !== null && 'message' in error ? String(error.message) : String(error);
        
        // Handle specific error types
        if (msg.includes('code challenge') || msg.includes('code verifier')) {
          console.error(`[${requestId}] ❌ PKCE error detected:`, msg);
          throw redirect(303, `/auth/login?error=pkceError:${encodeURIComponent('Error de autenticación PKCE. Por favor, intenta de nuevo.')}`)
        }
        
        if (msg.includes('invalid_code') || msg.includes('code has expired')) {
          console.error(`[${requestId}] ❌ Invalid/expired code:`, msg);
          throw redirect(303, `/auth/login?error=expiredCode:${encodeURIComponent('Código OAuth expirado. Por favor, intenta de nuevo.')}`)
        }
        
        if (error.status === 422 || error.status === 400) {
          console.error(`[${requestId}] ❌ OAuth configuration error:`, msg);
          throw redirect(303, `/auth/login?error=configError:${encodeURIComponent('Error de configuración OAuth. Contacta soporte.')}`)
        }
        
        console.log(`[${requestId}] 🔄 Redirecting with OAuth error:`, msg);
        throw redirect(303, `/auth/login?error=oauthError:${encodeURIComponent(msg)}`)
      }
      
      if (!data?.user) {
        console.error(`[${requestId}] ❌ No user obtained from OAuth callback`);
        throw redirect(303, '/auth/login?error=No se pudo obtener información del usuario.')
      }

      console.log(`[${requestId}] ✅ User authenticated with OAuth:`, {
        id: data.user.id,
        email: data.user.email,
        provider: data.user.app_metadata?.provider,
        userMetadata: data.user.user_metadata,
        appMetadata: data.user.app_metadata,
        createdAt: data.user.created_at
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
      
      console.log(`[${requestId}] 📋 Prepared profile data:`, { firstName, lastName });
      
      // Obtener o crear perfil usando función helper
      console.log(`[${requestId}] 🔄 Attempting to get/create user profile...`);
      const profileStartTime = Date.now();
      
      const { profile, created, error: profileError } = await getOrCreateUserProfile(
        supabase,
        data.user.id,
        {
          first_name: firstName,
          last_name: lastName
        }
      );

      const profileTime = Date.now() - profileStartTime;
      console.log(`[${requestId}] 📊 getOrCreateUserProfile completed in ${profileTime}ms:`, {
        hasProfile: !!profile,
        created,
        hasError: !!profileError,
        profileId: profile?.id || 'N/A'
      });

      if (profileError) {
        console.error(`[${requestId}] ❌ Error handling user profile:`, {
          error: profileError,
          userId: data.user.id,
          email: data.user.email,
          profileData: { firstName, lastName }
        });
        
        let msg = 'Error creando perfil de usuario';
        if (profileError instanceof Error) {
          msg = profileError.message;
        } else if (typeof profileError === 'string') {
          msg = profileError;
        } else if (profileError && typeof profileError === 'object' && 'message' in profileError) {
          msg = String(profileError.message);
        }
        
        console.log(`[${requestId}] 🔄 Redirecting with profile error:`, msg);
        throw redirect(303, `/auth/login?error=profileError:${encodeURIComponent(msg)}`)
      }
      
      if (created) {
        console.log(`[${requestId}] ✅ Customer profile created successfully for OAuth user:`, data.user.email);
      } else {
        console.log(`[${requestId}] ✅ Customer profile already exists for OAuth user:`, data.user.email);
      }
      
      // Verificar que la sesión se estableció correctamente antes del redirect
      const { data: { user: finalUser } } = await supabase.auth.getUser();
      const { data: { session: finalSession }, error: finalSessionError } = await supabase.auth.getSession();
      console.log(`[${requestId}] 📊 Final session before redirect:`, {
        hasUser: !!finalUser,
        hasSession: !!finalSession,
        sessionExpiry: finalSession?.expires_at,
        sessionError: finalSessionError?.message || 'NO ERROR'
      });
      
      const totalTime = Date.now() - startTime;
      console.log(`[${requestId}] ✅ OAuth callback completed successfully in ${totalTime}ms for:`, data.user.email);
      console.log(`[${requestId}] 🔄 Redirecting to:`, next);
      
      // Redirect exitoso - no capturar como excepción
      return redirect(303, next);
      
    } catch (e) {
      // Solo manejar errores reales, no redirects exitosos
      if (e && typeof e === 'object' && 'status' in e && 'location' in e) {
        const redirectData = e as { status?: number; location?: string };
        if (redirectData.status === 303 && redirectData.location) {
          console.log(`[${requestId}] ✅ Valid redirect detected, allowing redirect to:`, redirectData.location);
          throw e; // Re-lanzar el redirect
        }
      }
      
      const totalTime = Date.now() - startTime;
      console.error(`[${requestId}] 💥 Real error in OAuth callback after ${totalTime}ms:`, {
        error: e,
        stack: e instanceof Error ? e.stack : null,
        type: typeof e,
        code: code?.substring(0, 20) + '...' || 'NO CODE'
      });
      
      let msg = 'Error inesperado durante la autenticación';
      if (e instanceof Error) {
        msg = e.message;
        // Add more specific error handling
        if (e.message.includes('Connection') || e.message.includes('timeout')) {
          msg = 'Error de conexión con el servidor. Intenta de nuevo.';
        } else if (e.message.includes('Database') || e.message.includes('relation')) {
          msg = 'Error de base de datos. Contacta soporte.';
        }
      } else if (typeof e === 'string') {
        msg = e;
      } else if (e && typeof e === 'object') {
        try {
          msg = JSON.stringify(e);
        } catch (jsonError) {
          msg = 'Error complejo durante la autenticación';
        }
      }
      
      console.log(`[${requestId}] 🔄 Redirecting with real error:`, msg);
      throw redirect(303, `/auth/login?error=exception:${encodeURIComponent(msg)}`)
    }
  }

  // If there's an error or no code, redirect to login
  console.log(`[${requestId}] ❌ No OAuth code found, redirecting to login`);
  throw redirect(303, '/auth/login?error=No se pudo autenticar al usuario.')
  
  } catch (globalError) {
    // Catch any unhandled errors at the top level
    const totalTime = Date.now() - startTime;
    console.error(`[GLOBAL] 💥 Unhandled error in OAuth callback after ${totalTime}ms:`, {
      error: globalError,
      stack: globalError instanceof Error ? globalError.stack : null,
      url: url.toString()
    });
    
    // If it's a redirect, re-throw it
    if (globalError && typeof globalError === 'object' && 'status' in globalError && 'location' in globalError) {
      throw globalError;
    }
    
    // Otherwise, redirect with error
    const msg = globalError instanceof Error ? globalError.message : 'Error crítico del servidor';
    throw redirect(303, `/auth/login?error=serverError:${encodeURIComponent(msg)}`);
  }
} 