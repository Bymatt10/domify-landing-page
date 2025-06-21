import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  try {
    // Verificar autenticación
    const session = await locals.getSession();
    if (!session) {
      return json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener la aplicación del usuario
    const { data, error } = await locals.supabase
      .from('provider_applications')
      .select(`
        *,
        categories:provider_categories(id, name)
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return json({ data: null, message: 'No application found' });
      }
      throw new Error(error.message);
    }

    return json({ 
      data, 
      message: 'Application retrieved successfully' 
    });
  } catch (error) {
    console.error('Error in my-application endpoint:', error);
    return json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}; 