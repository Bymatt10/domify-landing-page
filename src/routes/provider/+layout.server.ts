import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }: { locals: any }) => {
	const { data: { user } } = await locals.supabase.auth.getUser();
	const { session } = await locals.safeGetSession();

	if (!session || !user) {
		throw redirect(303, '/auth/login');
	}

	// Verificar si el usuario es proveedor
	if (user.user_metadata?.role !== 'provider') {
		throw redirect(303, '/become-provider');
	}

	return {
		session,
		user
	};
}; 