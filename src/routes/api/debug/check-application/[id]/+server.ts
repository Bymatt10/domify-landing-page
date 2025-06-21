import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params, locals }) => {
  try {
    const applicationId = params.id;

    // Usar el cliente admin para evitar problemas de RLS
    const { data, error } = await locals.supabaseAdmin
      .from('provider_applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (error) {
      return json({
        error: {
          message: 'Error accessing application',
          details: error.message,
          code: error.code
        }
      }, { status: 500 });
    }

    return json({
      success: true,
      application: data,
      exists: !!data
    });

  } catch (error) {
    return json({
      error: {
        message: 'Failed to check application',
        details: error instanceof Error ? error.message : String(error)
      }
    }, { status: 500 });
  }
}; 