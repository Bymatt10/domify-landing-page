import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const { session, user } = await locals.safeGetSession();
    
    if (!session || !user) {
      return json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!user.user_metadata?.requires_password_change) {
      return json({ error: 'No es necesario cambiar la contraseña' }, { status: 400 });
    }

    const { newPassword } = await request.json();

    if (!newPassword || newPassword.length < 6) {
      return json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 });
    }

    // Cambiar la contraseña
    const { error: passwordError } = await locals.supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { 
        password: newPassword,
        user_metadata: {
          ...user.user_metadata,
          requires_password_change: false, // Quitar la bandera
          password_changed_at: new Date().toISOString()
        }
      }
    );

    if (passwordError) {
      console.error('Error updating password:', passwordError);
      return json({ error: 'Error al cambiar la contraseña' }, { status: 500 });
    }

    return json({ 
      success: true, 
      message: 'Contraseña cambiada exitosamente' 
    });

  } catch (error) {
    console.error('Error in password change:', error);
    return json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}; 