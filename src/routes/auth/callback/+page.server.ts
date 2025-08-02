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
  
  // console.log removed
  // console.log removed
  // console.log removed
  
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

    // console.log removed
    // console.log removed
    // console.log removed
    // console.log removed
    // console.log removed
    console.log(`[${requestId}] Request headers:`, {
      userAgent: url.searchParams.get('user_agent') || 'not provided',
      referer: url.searchParams.get('referer') || 'not provided'
    });
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

    if (!code) {
      console.error(`[${requestId}] ❌ No OAuth code found in callback URL`);
      console.error(`[${requestId}] URL search params:`, Object.fromEntries(url.searchParams.entries()));
      console.error(`[${requestId}] Full URL:`, url.toString());
      console.error(`[${requestId}] Origin:`, url.origin);
      console.error(`[${requestId}] Pathname:`, url.pathname);
      throw redirect(302, `/auth/login?error=noCode:${encodeURIComponent('No se recibió código de autenticación. Verifica la configuración de Google OAuth.')}`)
    }

    // Handle PKCE state issues in production
    // console.log removed
    
    let exchangeAttempts = 0;
    const maxAttempts = 2;
    let lastError = null;
    
    while (exchangeAttempts < maxAttempts) {
      try {
        exchangeAttempts++;
        // console.log removed
        
        const exchangeStartTime = Date.now();
        const { data, error } = await withTimeout(
          supabase.auth.exchangeCodeForSession(code),
          CODE_EXCHANGE_TIMEOUT,
          'exchangeCodeForSession'
        );
        
        if (error) {
          lastError = error;
          console.error(`[${requestId}] ❌ Exchange attempt ${exchangeAttempts} failed:`, error.message);
          
          // If it's a PKCE state error, try to clean state and retry
          if (error.message.includes('invalid flow state') || error.message.includes('no valid flow state') || 
              error.message.includes('code verifier') || error.message.includes('pkce')) {
            // console.log removed
            // console.log removed
            
            // Wait longer before retry for PKCE issues
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          
          // For other errors, don't retry
          break;
        }
        
        // Success!
        // console.log removed
        
        // CRITICAL: Ensure session is properly set in cookies after OAuth
        if (data?.session) {
          // console.log removed
          
          // Force set the session to ensure it's properly stored in cookies
          const { error: sessionError } = await supabase.auth.setSession(data.session);
          if (sessionError) {
            console.error(`[${requestId}] ❌ Error setting session:`, sessionError);
          } else {
            // console.log removed
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
          error: 'NO ERROR',
          errorCode: 'NO CODE',
          errorDetails: null
        });
        
        if (!data?.user) {
          console.error(`[${requestId}] ❌ No user obtained from OAuth callback`);
          throw redirect(302, '/auth/login?error=No se pudo obtener información del usuario.')
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
        
        // console.log removed
        
        // CIRCUIT BREAKER: Skip profile creation entirely for faster OAuth callback
        // console.log removed
        
        // Let database triggers handle profile creation asynchronously
        // Or user can complete profile setup later from the UI
        console.log(`[${requestId}] 📝 Profile creation will be handled by:`)
        console.log(`  - Database triggers (if configured)`)
        console.log(`  - User profile setup page (manual fallback)`)
        
        // Continue immediately without profile creation
        
        const totalTime = Date.now() - startTime;
        // console.log removed
        // console.log removed
        
        // Final session check before redirect
        const { data: { session: finalSession } } = await supabase.auth.getSession();
        if (!finalSession) {
          console.error(`[${requestId}] ❌ No session found before redirect! This will cause layout issues`);
          // Try to set session one more time
          if (data?.session) {
            await supabase.auth.setSession(data.session);
            // console.log removed
          }
        } else {
          // console.log removed
        }
        
        // Use 302 redirect with proper cache headers to ensure session is maintained
        throw redirect(302, next + (next.includes('?') ? '&' : '?') + 'oauth_success=true');
        
      } catch (timeoutError) {
        lastError = timeoutError;
        console.error(`[${requestId}] ❌ Timeout on attempt ${exchangeAttempts}:`, timeoutError);
        break;
      }
    }
    
    // All attempts failed
    console.error(`[${requestId}] ❌ All ${maxAttempts} exchange attempts failed`);
    throw redirect(302, `/auth/login?error=pkceError:${encodeURIComponent('Error de autenticación PKCE. Por favor, intenta de nuevo.')}`);
    
     } catch (error) {
     // Handle redirects properly - don't treat them as errors
     if (error instanceof Response && (error.status === 302 || error.status === 303)) {
       // console.log removed
       throw error; // Re-throw redirects as-is
     }
     
     console.error(`[${requestId}] 💥 Unhandled error in OAuth callback after ${Date.now() - startTime}ms:`, {
       error: error instanceof Error ? error.message : String(error),
       stack: error instanceof Error ? error.stack : null,
       url: url.toString()
     });
     
     // Better error message handling
     let errorMessage = 'Error inesperado durante la autenticación';
     
     if (error instanceof Error) {
       errorMessage = error.message;
     } else if (typeof error === 'string') {
       errorMessage = error;
     } else if (error && typeof error === 'object') {
       try {
         errorMessage = JSON.stringify(error);
       } catch (jsonError) {
         errorMessage = 'Error complejo durante la autenticación';
       }
     }
     
     // Ensure error message is safe for URL encoding
     const safeErrorMessage = errorMessage.replace(/[^\w\s\-\.]/g, ' ').substring(0, 100);
     
     // console.log removed
     throw redirect(302, `/auth/login?error=callbackError:${encodeURIComponent(safeErrorMessage)}`);
   }
} 