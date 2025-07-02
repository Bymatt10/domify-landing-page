import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getOrCreateUserProfile } from '$lib/auth-fixes';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
  try {
    console.log('=== DEBUG: Simulando proceso OAuth callback ===');
    
    // Primero verificar si hay un usuario autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log('Error obteniendo usuario:', userError);
      return json({
        success: false,
        step: 'getUser',
        error: userError.message,
        details: 'No se pudo obtener el usuario autenticado'
      });
    }
    
    if (!user) {
      return json({
        success: false,
        step: 'getUser',
        error: 'No hay usuario autenticado',
        details: 'Necesitas estar autenticado para probar este endpoint'
      });
    }
    
    console.log('Usuario encontrado:', {
      id: user.id,
      email: user.email,
      provider: user.app_metadata?.provider,
      userMetadata: user.user_metadata,
      appMetadata: user.app_metadata
    });
    
    // Simular el proceso de getOrCreateUserProfile
    try {
      console.log('Intentando obtener/crear perfil...');
      
      const { profile, created, error: profileError } = await getOrCreateUserProfile(
        supabase,
        user.id,
        {
          first_name: user.user_metadata?.full_name?.split(' ')[0] || user.user_metadata?.name?.split(' ')[0] || 'Usuario',
          last_name: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || user.user_metadata?.name?.split(' ').slice(1).join(' ') || 'OAuth'
        }
      );
      
      if (profileError) {
        console.error('Error en getOrCreateUserProfile:', profileError);
        return json({
          success: false,
          step: 'getOrCreateUserProfile',
          error: profileError instanceof Error ? profileError.message : String(profileError),
          details: 'Error al obtener o crear perfil de usuario',
          userData: {
            userId: user.id,
            firstName: user.user_metadata?.full_name?.split(' ')[0] || user.user_metadata?.name?.split(' ')[0] || 'Usuario',
            lastName: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || user.user_metadata?.name?.split(' ').slice(1).join(' ') || 'OAuth'
          }
        });
      }
      
      console.log('Perfil obtenido/creado exitosamente:', { profile, created });
      
      return json({
        success: true,
        step: 'completed',
        user: {
          id: user.id,
          email: user.email,
          provider: user.app_metadata?.provider,
          userMetadata: user.user_metadata,
          appMetadata: user.app_metadata
        },
        profile,
        created,
        message: created ? 'Perfil creado exitosamente' : 'Perfil ya existía'
      });
      
    } catch (profileException) {
      console.error('Excepción en getOrCreateUserProfile:', profileException);
      return json({
        success: false,
        step: 'getOrCreateUserProfile_exception',
        error: profileException instanceof Error ? profileException.message : String(profileException),
        details: 'Excepción durante la creación/obtención del perfil'
      });
    }
    
  } catch (error) {
    console.error('Error general en test OAuth callback:', error);
    return json({ 
      success: false,
      step: 'general_exception',
      error: error instanceof Error ? error.message : String(error),
      details: 'Error general en el proceso de simulación'
    });
  }
}; 