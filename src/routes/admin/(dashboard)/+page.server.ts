import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  // Usar el helper seguro
  const { session, user } = await locals.safeGetSession();
  
  if (!session || !user) {
    throw redirect(302, '/auth/login');
  }

  // Verificar si el usuario es administrador
  const role = user.user_metadata?.role;
  if (role !== 'admin') {
    throw redirect(302, '/');
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      first_name: user.user_metadata?.first_name,
      last_name: user.user_metadata?.last_name,
      role
    }
  };
}; 