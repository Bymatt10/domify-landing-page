import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals: { supabase } }) => {
  try {
    console.log('=== DEBUG: Verificando perfil de usuario ===');
    
    // Check session and user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (!session || !user) {
      return json({
        success: false,
        isAuthenticated: false,
        message: 'Usuario no autenticado',
        errors: {
          session: sessionError?.message || 'No session',
          user: userError?.message || 'No user'
        }
      });
    }

    // Extract profile image information
    const userMetadata = user.user_metadata || {};
    const avatarUrl = userMetadata.avatar_url;
    const pictureUrl = userMetadata.picture;
    
    // Test image URLs
    let avatarTest = null;
    let pictureTest = null;
    
    if (avatarUrl) {
      try {
        const response = await fetch(avatarUrl, { method: 'HEAD' });
        avatarTest = {
          url: avatarUrl,
          status: response.status,
          ok: response.ok,
          contentType: response.headers.get('content-type')
        };
      } catch (error) {
        avatarTest = {
          url: avatarUrl,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
    
    if (pictureUrl) {
      try {
        const response = await fetch(pictureUrl, { method: 'HEAD' });
        pictureTest = {
          url: pictureUrl,
          status: response.status,
          ok: response.ok,
          contentType: response.headers.get('content-type')
        };
      } catch (error) {
        pictureTest = {
          url: pictureUrl,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }

    const profileInfo = {
      success: true,
      isAuthenticated: true,
      user: {
        id: user.id,
        email: user.email,
        role: userMetadata.role || 'customer',
        name: userMetadata.full_name || userMetadata.name || userMetadata.first_name,
        firstName: userMetadata.first_name,
        lastName: userMetadata.last_name
      },
      profileImages: {
        avatarUrl,
        pictureUrl,
        avatarTest,
        pictureTest,
        recommendedUrl: avatarUrl || pictureUrl
      },
      userMetadata: {
        ...userMetadata,
        // Remove sensitive data
        sub: undefined,
        iss: undefined,
        provider_id: undefined
      },
      message: '✅ Perfil de usuario obtenido correctamente'
    };

    console.log('Perfil de usuario:', profileInfo);
    return json(profileInfo);
    
  } catch (error) {
    console.error('Error en user profile debug:', error);
    return json({ 
      success: false,
      isAuthenticated: false,
      error: error instanceof Error ? error.message : String(error),
      message: '❌ Error al verificar perfil de usuario'
    });
  }
}; 