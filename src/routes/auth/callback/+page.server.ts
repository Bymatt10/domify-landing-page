import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { getOrCreateUserProfile } from '$lib/auth-fixes'

// Environment validation
function validateOAuthEnvironment() {
  const required = [
    'PUBLIC_SUPABASE_URL',
    'PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  const missing = required.filter(env => !process.env[env]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    return { valid: false, missing };
  }
  
  // Validate URL format
  const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
  if (supabaseUrl && !supabaseUrl.startsWith('http')) {
    console.error('❌ Invalid SUPABASE_URL format:', supabaseUrl);
    return { valid: false, missing: ['Valid PUBLIC_SUPABASE_URL'] };
  }
  
  return { valid: true, missing: [] };
}

// Timeout configurations
const CALLBACK_TIMEOUT = 25000; // 25 seconds - well under most server timeouts
const PROFILE_CREATION_TIMEOUT = 15000; // 15 seconds for profile operations

// Helper function to create a timeout promise
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, operation: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms in ${operation}`)), timeoutMs)
    )
  ]);
}

export const load: PageServerLoad = async ({ url, locals: { supabase } }) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  // Wrap the entire callback in a timeout to prevent 502 errors
  return await withTimeout(
    (async () => {
      try {
    // Validate environment first to prevent configuration-related 502 errors
    const envValidation = validateOAuthEnvironment();
    if (!envValidation.valid) {
      console.error(`[${requestId}] ❌ Environment validation failed:`, envValidation.missing);
      throw redirect(303, `/auth/login?error=configError:${encodeURIComponent('Error de configuración del servidor. Contacta soporte.')}`);
    }

    const code = url.searchParams.get('code')
    const next = url.searchParams.get('next') ?? '/'
    const error = url.searchParams.get('error')
    const errorDescription = url.searchParams.get('error_description')

    console.log(`[${requestId}] === OAuth Callback Debug ===`);
    console.log(`[${requestId}] Environment validation: ✅ PASSED`);
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
      // Quick health check of Supabase client before proceeding
      console.log(`[${requestId}] 🏥 Performing Supabase health check...`);
      try {
        const healthCheckStart = Date.now();
        await supabase.from('customers').select('id').limit(1);
        const healthCheckTime = Date.now() - healthCheckStart;
        console.log(`[${requestId}] ✅ Supabase health check passed in ${healthCheckTime}ms`);
      } catch (healthError) {
        console.error(`[${requestId}] ❌ Supabase health check failed:`, healthError);
        throw redirect(303, `/auth/login?error=dbError:${encodeURIComponent('Error de conexión con la base de datos. Intenta de nuevo.')}`);
      }

      console.log(`[${requestId}] 🔄 Attempting to exchange code for session...`);
      const exchangeStartTime = Date.now();
      
      const { data, error } = await withTimeout(
        supabase.auth.exchangeCodeForSession(code),
        10000, // 10 seconds for code exchange
        'exchangeCodeForSession'
      )
      
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
      
      const { profile, created, error: profileError } = await withTimeout(
        getOrCreateUserProfile(
          supabase,
          data.user.id,
          {
            first_name: firstName,
            last_name: lastName
          }
        ),
        PROFILE_CREATION_TIMEOUT,
        'getOrCreateUserProfile'
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
        
        // Try a simple fallback approach - allow user to continue without profile creation
        // They can create their profile later from the app
        console.log(`[${requestId}] 🔄 Attempting fallback: continue without profile creation...`);
        
        try {
          // Just verify the session is valid and continue
          const { data: { user: sessionUser } } = await supabase.auth.getUser();
          if (sessionUser && sessionUser.id === data.user.id) {
            console.log(`[${requestId}] ✅ Session valid, proceeding without profile. User can create profile later.`);
            
            const totalTime = Date.now() - startTime;
            console.log(`[${requestId}] ✅ OAuth callback completed with fallback in ${totalTime}ms for:`, data.user.email);
            console.log(`[${requestId}] 🔄 Redirecting to profile completion page`);
            
            // Redirect to a profile setup page where user can complete their profile
            return redirect(303, `/profile/info?setup=true&error=profile_creation_failed`);
          }
        } catch (fallbackError) {
          console.error(`[${requestId}] ❌ Fallback also failed:`, fallbackError);
        }
        
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
        if (e.message.includes('Timeout after') || e.message.includes('timeout')) {
          msg = 'La autenticación está tardando más de lo esperado. Por favor, intenta de nuevo.';
        } else if (e.message.includes('Connection') || e.message.includes('ECONNRESET')) {
          msg = 'Error de conexión con el servidor. Intenta de nuevo.';
        } else if (e.message.includes('Database') || e.message.includes('relation')) {
          msg = 'Error de base de datos. Contacta soporte.';
        } else if (e.message.includes('getOrCreateUserProfile')) {
          msg = 'Error creando tu perfil. La autenticación fue exitosa, pero hay un problema con la configuración del perfil.';
        } else if (e.message.includes('exchangeCodeForSession')) {
          msg = 'Error intercambiando código de autenticación. Por favor, intenta iniciar sesión de nuevo.';
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
    })(),
    CALLBACK_TIMEOUT,
    'OAuth callback'
  ).catch((timeoutError) => {
    console.error(`[${requestId}] ⏰ CALLBACK TIMEOUT after ${CALLBACK_TIMEOUT}ms:`, timeoutError);
    throw redirect(303, '/auth/login?error=timeout:La autenticación tardó demasiado tiempo. Por favor, intenta de nuevo.');
  });
} 