import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
  try {
    console.log('=== PRODUCTION OAUTH DIAGNOSTIC ===');
    
    const currentOrigin = url.origin;
    const currentHost = url.host;
    const currentProtocol = url.protocol;
    
    // Test basic Supabase connection
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    // Test OAuth configuration
    const oauthTest = {
      currentUrl: currentOrigin,
      expectedCallbackUrl: `${currentOrigin}/auth/callback`,
      supabaseUrl: process.env.PUBLIC_SUPABASE_URL || 'NOT SET',
      hasAnonKey: !!process.env.PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.PRIVATE_SUPABASE_SERVICE_ROLE_KEY,
      sessionExists: !!session,
      sessionError: sessionError?.message || null
    };
    
    // Test if we can initiate OAuth flow
    let oauthInitTest = null;
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${currentOrigin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });
      
      oauthInitTest = {
        success: !error,
        error: error?.message || null,
        hasData: !!data,
        url: data?.url || null
      };
    } catch (e) {
      oauthInitTest = {
        success: false,
        error: e instanceof Error ? e.message : String(e),
        hasData: false,
        url: null
      };
    }
    
    return json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: {
        origin: currentOrigin,
        host: currentHost,
        protocol: currentProtocol,
        nodeEnv: process.env.NODE_ENV || 'development'
      },
      oauth: oauthTest,
      oauthInitTest,
      recommendations: [
        '1. Verifica que las URLs de redirección en Google Cloud Console incluyan:',
        `   - ${currentOrigin}/auth/callback`,
        '   - https://tu-proyecto.supabase.co/auth/v1/callback',
        '2. Asegúrate de que Google OAuth esté habilitado en Supabase Dashboard',
        '3. Verifica que las variables de entorno estén configuradas en producción',
        '4. Revisa los logs del servidor para errores específicos',
        '5. Si el problema persiste, prueba con un navegador en modo incógnito'
      ]
    });
    
  } catch (error) {
    console.error('Error en OAuth production test:', error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
  }
}; 