import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { PRIVATE_SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

export const GET: RequestHandler = async ({ locals: { supabase } }) => {
  try {
    console.log('=== DEBUG: Verificando configuración OAuth ===');
    
    // Verificar configuración de entorno
    const envVars = {
      PUBLIC_SUPABASE_URL: PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
      PUBLIC_SUPABASE_ANON_KEY: PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
      PRIVATE_SUPABASE_SERVICE_ROLE_KEY: PRIVATE_SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET'
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
      .select('count(*)')
      .limit(1);
    
    console.log('Acceso a tabla customers:', customersError ? 'ERROR' : 'OK');
    if (customersError) {
      console.log('Error customers:', customersError);
    }
    
    return json({
      success: true,
      debug: {
        envVars,
        user: user ? {
          id: user.id,
          email: user.email,
          provider: user.app_metadata?.provider || 'unknown',
          providers: user.app_metadata?.providers || [],
          userMetadata: user.user_metadata,
          appMetadata: user.app_metadata
        } : null,
        userError: userError?.message || null,
        customersTableAccess: customersError ? 'ERROR' : 'OK',
        customersError: customersError?.message || null,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error en debug OAuth:', error);
    return json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
  }
}; 