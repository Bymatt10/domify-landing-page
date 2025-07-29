import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals: { supabase }, url }) => {
  try {
    console.log('=== DEBUG: Verificando estado de sesión ===');
    
    // Get current environment info
    const currentOrigin = url.origin;
    
    // Check session status (using safe method)
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    console.log('Estado de sesión:', {
      hasSession: !!session,
      sessionExpiry: session?.expires_at,
      sessionError: sessionError?.message || 'NO ERROR'
    });

    console.log('Estado de usuario:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      userProvider: user?.app_metadata?.provider,
      userError: userError?.message || 'NO ERROR'
    });

    // Check if user has a customer profile
    let customerProfile = null;
    let customerError = null;
    
    if (user) {
      const { data: customer, error: custError } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      customerProfile = customer;
      customerError = custError;
      
      console.log('Perfil de customer:', {
        hasProfile: !!customer,
        customerError: custError?.message || 'NO ERROR'
      });
    }

    // Check authentication state
    const authState = {
      isAuthenticated: !!session && !!user,
      sessionValid: session && session.expires_at ? {
        expiresAt: session.expires_at,
        expiresAtDate: new Date(session.expires_at * 1000).toISOString(),
        currentTime: new Date().toISOString(),
        isValid: new Date(session.expires_at * 1000) > new Date()
      } : false,
      hasCustomerProfile: !!customerProfile,
      environment: currentOrigin
    };

    console.log('Estado de autenticación:', authState);

    return json({
      success: true,
      authState,
      session: session ? {
        id: session.access_token ? 'PRESENT' : 'MISSING',
        expiresAt: session.expires_at,
        expiresIn: session.expires_at ? Math.floor((new Date(session.expires_at).getTime() - new Date().getTime()) / 1000) : null,
        isValid: session.expires_at ? new Date(session.expires_at) > new Date() : false
      } : null,
      user: user ? {
        id: user.id,
        email: user.email,
        provider: user.app_metadata?.provider,
        emailVerified: user.email_confirmed_at ? true : false,
        userMetadata: user.user_metadata
      } : null,
      customerProfile: customerProfile ? {
        id: customerProfile.id,
        firstName: customerProfile.first_name,
        lastName: customerProfile.last_name,
        phone: customerProfile.phone
      } : null,
      errors: {
        session: sessionError?.message || null,
        user: userError?.message || null,
        customer: customerError?.message || null
      },
      recommendations: [
        authState.isAuthenticated ? '✅ Usuario autenticado correctamente' : '❌ Usuario no autenticado',
        authState.sessionValid ? '✅ Sesión válida' : '❌ Sesión expirada o inválida',
        authState.hasCustomerProfile ? '✅ Perfil de customer encontrado' : '❌ Perfil de customer no encontrado',
        'Si hay problemas, verifica las cookies y el estado de autenticación'
      ]
    });
    
  } catch (error) {
    console.error('Error en session status:', error);
    return json({ 
      success: false,
      error: error instanceof Error ? error.message : String(error),
      details: 'Error al verificar el estado de la sesión'
    });
  }
}; 