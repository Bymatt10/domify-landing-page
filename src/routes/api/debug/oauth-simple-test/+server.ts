import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const currentOrigin = url.origin;
    const currentHost = url.host;
    const currentProtocol = url.protocol;
    
    return json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: {
        origin: currentOrigin,
        host: currentHost,
        protocol: currentProtocol,
        nodeEnv: process.env.NODE_ENV || 'development'
      },
      oauth: {
        currentUrl: currentOrigin,
        expectedCallbackUrl: `${currentOrigin}/auth/callback`,
        supabaseUrl: process.env.PUBLIC_SUPABASE_URL || 'NOT SET',
        hasAnonKey: !!process.env.PUBLIC_SUPABASE_ANON_KEY,
        hasServiceKey: !!process.env.PRIVATE_SUPABASE_SERVICE_ROLE_KEY
      },
      recommendations: [
        '1. Verifica que las URLs de redirección en Google Cloud Console incluyan:',
        `   - ${currentOrigin}/auth/callback`,
        '   - https://zdlwmjpviualqyikgzlz.supabase.co/auth/v1/callback',
        '2. Asegúrate de que Google OAuth esté habilitado en Supabase Dashboard',
        '3. Verifica que las variables de entorno estén configuradas en producción',
        '4. Revisa los logs del servidor para errores específicos'
      ]
    });
    
  } catch (error) {
    console.error('Error en OAuth simple test:', error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
  }
}; 