import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  try {
    // Verificar autenticación usando safeGetSession
    const { session, user } = await locals.safeGetSession();
    if (!session || !user) {
      return json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar si es administrador usando user_metadata
    const role = user.user_metadata?.role;
    if (role !== 'admin') {
      return json({ error: 'Acceso denegado' }, { status: 403 });
    }

    // Obtener estadísticas usando supabaseAdmin para evitar problemas de RLS
    const { data: applications, error } = await locals.supabaseAdmin
      .from('provider_applications')
      .select('status');

    if (error) {
      console.error('Error fetching applications:', error);
      return json({ error: 'Error al obtener estadísticas' }, { status: 500 });
    }

    // Calcular estadísticas
    const stats = {
      total: applications.length,
      pending: applications.filter(app => app.status === 'submitted').length,
      in_review: applications.filter(app => app.status === 'in_review').length,
      approved: applications.filter(app => app.status === 'approved').length,
      rejected: applications.filter(app => app.status === 'rejected').length
    };

    return json(stats);
  } catch (error) {
    console.error('Error in stats endpoint:', error);
    return json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}; 