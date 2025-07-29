import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from '$lib/env-utils';

// Get environment variables with fallbacks
const SUPABASE_URL = getSupabaseUrl();
const SUPABASE_ANON_KEY = getSupabaseAnonKey();
const SERVICE_ROLE_KEY = getSupabaseServiceRoleKey();

export const GET: RequestHandler = async ({ locals: { supabase }, url }) => {
  try {
    console.log('=== DEBUG: Verificando configuración OAuth ===');
    
    // Get current environment info
    const currentOrigin = url.origin;
    const currentHost = url.host;
    const currentProtocol = url.protocol;
    
    console.log('Entorno actual:', {
      origin: currentOrigin,
      host: currentHost,
      protocol: currentProtocol
    });
    
    // Verificar configuración de entorno
    const envVars = {
      SUPABASE_URL: SUPABASE_URL ? 'SET' : 'NOT SET',
      SUPABASE_ANON_KEY: SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
      SERVICE_ROLE_KEY: SERVICE_ROLE_KEY ? 'SET' : 'NOT SET'
    };
    
    console.log('Variables de entorno:', envVars);
    
    // Intentar obtener la configuración actual del usuario
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    console.log('Usuario actual:', user ? {
      id: user.id,
      email: user.email,
      provider: user.app_metadata?.provider,
      providers: user.app_metadata?.providers
    } : 'No autenticado');
    
    if (userError) {
      console.log('Error obteniendo usuario:', userError);
    }
    
    // Verificar si la tabla customers existe y está accesible
    const { data: customersCheck, error: customersError } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });
    
    console.log('Acceso a tabla customers:', customersError ? 'ERROR' : 'OK');
    if (customersError) {
      console.log('Error customers:', customersError);
    }

    // Check OAuth providers configuration
    const { data: authConfig, error: authConfigError } = await supabase.auth.getSession();
    
    console.log('Configuración de autenticación:', {
      hasSession: !!authConfig.session,
      sessionExpiry: authConfig.session?.expires_at,
      error: authConfigError?.message || 'NO ERROR'
    });

    // Check for any active OAuth flows or PKCE state
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    const oauthState = {
      hasSession: !!session,
      sessionProvider: session?.user?.app_metadata?.provider,
      sessionExpiry: session?.expires_at,
      sessionError: sessionError?.message || 'NO ERROR'
    };

    console.log('Estado de OAuth:', oauthState);

    return json({
      success: true,
      environment: {
        currentOrigin,
        currentHost,
        currentProtocol,
        envVars
      },
      user: user ? {
        id: user.id,
        email: user.email,
        provider: user.app_metadata?.provider,
        providers: user.app_metadata?.providers,
        emailVerified: user.email_confirmed_at ? true : false
      } : null,
      userError: userError?.message || null,
      customers: customersError ? 'ERROR' : 'OK',
      customersError: customersError?.message || null,
      oauth: oauthState,
      authConfig: {
        hasSession: !!authConfig.session,
        sessionExpiry: authConfig.session?.expires_at,
        error: authConfigError?.message || null
      },
      recommendations: [
        'Verifica que las variables de entorno estén configuradas correctamente',
        'Asegúrate de que Google OAuth esté habilitado en Supabase',
        'Verifica que las URLs de redirección en Google Cloud Console coincidan con las de Supabase',
        'Si hay errores PKCE, limpia el estado de autenticación e intenta de nuevo',
        `Para desarrollo local, asegúrate de que ${currentOrigin}/auth/callback esté configurado en Google Cloud Console`
      ]
    });
    
  } catch (error) {
    console.error('Error en check OAuth config:', error);
    return json({ 
      success: false,
      error: error instanceof Error ? error.message : String(error),
      details: 'Error general al verificar la configuración OAuth'
    });
  }
}; 