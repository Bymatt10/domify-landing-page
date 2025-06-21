import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  try {
    const { session, user } = await locals.safeGetSession();
    
    if (!session || !user) {
      return json({ requiresChange: false }, { status: 401 });
    }

    // Verificar si el usuario necesita cambiar contraseña
    const requiresChange = user.user_metadata?.requires_password_change === true;

    return json({
      requiresChange,
      user: requiresChange ? {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata
      } : null
    });

  } catch (error) {
    console.error('Error checking password change requirement:', error);
    return json({ requiresChange: false }, { status: 500 });
  }
}; 