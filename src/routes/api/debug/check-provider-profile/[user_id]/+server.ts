import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params, locals }) => {
  try {
    const { user_id } = params;

    if (!user_id) {
      return json({
        error: {
          message: 'User ID is required'
        }
      }, { status: 400 });
    }

    // Verificar si existe un perfil de proveedor
    const { data: providerProfile, error: providerError } = await locals.supabaseAdmin
      .from('provider_profiles')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (providerError && providerError.code !== 'PGRST116') {
      return json({
        error: {
          message: 'Error checking provider profile',
          details: providerError.message
        }
      }, { status: 500 });
    }

    return json({
      success: true,
      user_id,
      provider_profile: providerProfile || null,
      has_provider_profile: !!providerProfile
    });

  } catch (error) {
    return json({
      error: {
        message: 'Failed to check provider profile',
        details: error instanceof Error ? error.message : String(error)
      }
    }, { status: 500 });
  }
}; 