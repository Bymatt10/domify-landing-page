import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }: { locals: any }) => {
	const { data: { session } } = await locals.supabase.auth.getSession();

	if (!session) {
		throw redirect(303, '/auth/login');
	}

	// Verificar si el usuario es proveedor
	if (session.user.user_metadata?.role !== 'provider') {
		throw redirect(303, '/become-provider');
	}

	return {
		session,
		user: session.user
	};
}; 