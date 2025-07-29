import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals: { supabase } }) => {
  try {
    console.log('=== DEBUG: Verificando estado de autenticación ===');
    
    // Check user status (more secure)
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    // Check session status
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    const isAuthenticated = !!session && !!user;
    
    console.log('Estado de autenticación:', {
      isAuthenticated,
      hasSession: !!session,
      hasUser: !!user,
      userEmail: user?.email,
      sessionError: sessionError?.message || 'NO ERROR',
      userError: userError?.message || 'NO ERROR'
    });

    return json({
      success: true,
      isAuthenticated,
      user: user ? {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name,
        role: user.user_metadata?.role || 'customer',
        provider: user.app_metadata?.provider
      } : null,
      session: session ? {
        expiresAt: session.expires_at,
        expiresAtDate: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
        isValid: session.expires_at ? new Date(session.expires_at * 1000) > new Date() : false
      } : null,
      errors: {
        session: sessionError?.message || null,
        user: userError?.message || null
      },
      message: isAuthenticated ? '✅ Usuario autenticado correctamente' : '❌ Usuario no autenticado'
    });
    
  } catch (error) {
    console.error('Error en auth status:', error);
    return json({ 
      success: false,
      isAuthenticated: false,
      error: error instanceof Error ? error.message : String(error),
      message: '❌ Error al verificar autenticación'
    });
  }
};
