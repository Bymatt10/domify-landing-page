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
    console.error('Available env vars:', {
      NODE_ENV: process.env.NODE_ENV,
      hasSupabaseUrl: !!process.env.PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.PUBLIC_SUPABASE_ANON_KEY,
      supabaseUrlLength: process.env.PUBLIC_SUPABASE_URL?.length || 0
    });
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

// Timeout configurations - optimized for production (Cloudflare) vs development
const isProduction = process.env.NODE_ENV === 'production';
const CODE_EXCHANGE_TIMEOUT = isProduction ? 2000 : 3000; // Even faster for production
const PROFILE_CREATION_TIMEOUT = isProduction ? 2000 : 4000; // Faster for production

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
  
  // Execute callback without timeout wrapper - let redirects work naturally
  try {
    // Validate environment first to prevent configuration-related 502 errors
    const envValidation = validateOAuthEnvironment();
    if (!envValidation.valid) {
      console.error(`[${requestId}] ❌ Environment validation failed:`, envValidation.missing);
      throw redirect(302, `/auth/login?error=configError:${encodeURIComponent('Error de configuración del servidor. Contacta soporte.')}`);
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
      throw redirect(302, `/auth/login?error=oauthError:${encodeURIComponent(errorDescription || error)}`)
    }

    // Validate code format - OAuth codes should be substantial
    if (code && code.length < 20) {
      console.warn(`[${requestId}] ⚠️ OAuth code seems unusually short:`, code);
    }

    if (code) {
    
    try {
      // Skip health check for faster callback - proceed directly to code exchange

      console.log(`[${requestId}] 🔄 Attempting to exchange code for session...`);
      const exchangeStartTime = Date.now();
      
      const { data, error } = await withTimeout(
        supabase.auth.exchangeCodeForSession(code),
        CODE_EXCHANGE_TIMEOUT, // 3 seconds for code exchange
        'exchangeCodeForSession'
      )
      
      // CRITICAL: Ensure session is properly set in cookies after OAuth
      if (data?.session) {
        console.log(`[${requestId}] 🍪 Setting session in cookies for user:`, data.user.email);
        
        // Force set the session to ensure it's properly stored in cookies
        const { error: sessionError } = await supabase.auth.setSession(data.session);
        if (sessionError) {
          console.error(`[${requestId}] ❌ Error setting session:`, sessionError);
        } else {
          console.log(`[${requestId}] ✅ Session successfully set in cookies`);
        }
        
        // Wait a moment for session to be persisted
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Verify session was set correctly
        const { data: { session: verifySession } } = await supabase.auth.getSession();
        console.log(`[${requestId}] 🔍 Session verification:`, {
          hasSession: !!verifySession,
          sessionUserId: verifySession?.user?.id,
          expectedUserId: data.user.id,
          sessionExpiry: verifySession?.expires_at
        });
      }
      
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
          throw redirect(302, `/auth/login?error=expiredCode:${encodeURIComponent('Código OAuth expirado. Por favor, intenta de nuevo.')}`)
        }
        
        if (error.status === 422 || error.status === 400) {
          console.error(`[${requestId}] ❌ OAuth configuration error:`, msg);
          throw redirect(302, `/auth/login?error=configError:${encodeURIComponent('Error de configuración OAuth. Contacta soporte.')}`)
        }
        
        console.log(`[${requestId}] 🔄 Redirecting with OAuth error:`, msg);
        throw redirect(302, `/auth/login?error=oauthError:${encodeURIComponent(msg)}`)
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
      
      // CIRCUIT BREAKER: Skip profile creation entirely for faster OAuth callback
      console.log(`[${requestId}] ⚡ Circuit breaker activated: skipping profile creation for speed`);
      
      // Let database triggers handle profile creation asynchronously
      // Or user can complete profile setup later from the UI
      console.log(`[${requestId}] 📝 Profile creation will be handled by:`)
      console.log(`  - Database triggers (if configured)`)
      console.log(`  - User profile setup page (manual fallback)`)
      
      // Continue immediately without profile creation
      
      const totalTime = Date.now() - startTime;
      console.log(`[${requestId}] ✅ OAuth callback completed in FAST MODE in ${totalTime}ms for:`, data.user.email);
      console.log(`[${requestId}] 🔄 Redirecting to:`, next);
      
      // Final session check before redirect
      const { data: { session: finalSession } } = await supabase.auth.getSession();
      if (!finalSession) {
        console.error(`[${requestId}] ❌ No session found before redirect! This will cause layout issues`);
        // Try to set session one more time
        if (data?.session) {
          await supabase.auth.setSession(data.session);
          console.log(`[${requestId}] 🔄 Retried setting session before redirect`);
        }
      } else {
        console.log(`[${requestId}] ✅ Session confirmed before redirect for user:`, finalSession.user.email);
      }
      
      // Use 302 redirect with proper cache headers to ensure session is maintained
      throw redirect(302, next + (next.includes('?') ? '&' : '?') + 'oauth_success=true');
      
    } catch (e) {
      // Solo manejar errores reales, no redirects exitosos
      if (e && typeof e === 'object' && 'status' in e && 'location' in e) {
        const redirectData = e as { status?: number; location?: string };
        if ((redirectData.status === 303 || redirectData.status === 302) && redirectData.location) {
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
    console.log(`[${requestId}] 🔍 Debug info:`, {
      url: url.toString(),
      searchParams: Object.fromEntries(url.searchParams.entries()),
      hasCode: !!url.searchParams.get('code'),
      hasError: !!url.searchParams.get('error'),
      hasState: !!url.searchParams.get('state'),
      origin: url.origin,
      pathname: url.pathname
    });
    throw redirect(303, '/auth/login?error=No se pudo autenticar al usuario.')
  
  } catch (globalError) {
    // Catch any unhandled errors at the top level
    const totalTime = Date.now() - startTime;
    
    // If it's a redirect, re-throw it immediately (don't log as error)
    if (globalError && typeof globalError === 'object' && 'status' in globalError && 'location' in globalError) {
      const redirectData = globalError as { status?: number; location?: string };
      if ((redirectData.status === 302 || redirectData.status === 303) && redirectData.location) {
        console.log(`[GLOBAL] ✅ Valid redirect detected after ${totalTime}ms, redirecting to:`, redirectData.location);
        throw globalError; // Re-throw the redirect
      }
    }
    
    console.error(`[GLOBAL] 💥 Unhandled error in OAuth callback after ${totalTime}ms:`, {
      error: globalError,
      stack: globalError instanceof Error ? globalError.stack : null,
      url: url.toString()
    });
    
    // Otherwise, redirect with error
    const msg = globalError instanceof Error ? globalError.message : 'Error crítico del servidor';
    throw redirect(303, `/auth/login?error=serverError:${encodeURIComponent(msg)}`);
  }
} 