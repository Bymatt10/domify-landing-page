import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	// Admin Guard - Checking Supabase admin access

	// Get current session and user
	const { data: { user } } = await locals.supabase.auth.getUser();
	const { session } = await locals.safeGetSession();

	// If no session or user, redirect to admin login
	if (!session || !user) {
		throw redirect(303, '/admin/login?error=Acceso denegado. Debes iniciar sesión.');
	}

	// Check if user is admin
	const isAdmin = user.user_metadata?.role === 'admin' || 
				   user.email === 'matthewreyesvanegas46@gmail.com';

	if (!isAdmin) {
		throw redirect(303, '/admin/login?error=Acceso denegado. Se requieren permisos de administrador.');
	}

	// Access granted for admin

	return {
		user: {
			id: user.id,
			email: user.email,
			role: 'admin'
		},
		profile: {
			role: 'admin'
		}
	};
};