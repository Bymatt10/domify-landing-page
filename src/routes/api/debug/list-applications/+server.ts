import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
  try {
    // Usar el cliente admin para evitar problemas de RLS
    const { data, error } = await locals.supabaseAdmin
      .from('provider_applications')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      return json({
        error: {
          message: 'Error accessing applications',
          details: error.message,
          code: error.code
        }
      }, { status: 500 });
    }

    return json({
      success: true,
      applications: data || [],
      total: data ? data.length : 0
    });

  } catch (error) {
    return json({
      error: {
        message: 'Failed to list applications',
        details: error instanceof Error ? error.message : String(error)
      }
    }, { status: 500 });
  }
}; 