import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, fetch }) => {
	try {
		// Get current session and user using getUser for security
		const { data: { user } } = await locals.supabase.auth.getUser();
		const { session } = await locals.safeGetSession();

		console.log('Layout server load - Session:', {
			hasSession: !!session,
			hasUser: !!user,
			userEmail: user?.email,
			userRole: user?.user_metadata?.role
		});

		// Check if user is a provider
		let isProvider = false;
		let providerProfile = null;

		if (user) {
			// Verificar en la tabla correcta: provider_profiles
			const { data: provider, error: providerError } = await locals.supabase
				.from('provider_profiles')
				.select('*')
				.eq('user_id', user.id)
				.maybeSingle(); // Usar maybeSingle para evitar errores si no existe

			isProvider = !!provider;
			providerProfile = provider;

			if (providerError) {
				console.error('Error checking provider status:', providerError);
			}
		}

		// Check if user is admin
		const isAdmin = user?.user_metadata?.role === 'admin';

		return {
			session,
			user,
			isProvider,
			isAdmin,
			providerProfile
		};
	} catch (error) {
		console.error('Error in layout server load:', error);
		return {
			session: null,
			user: null,
			isProvider: false,
			isAdmin: false,
			providerProfile: null
		};
	}
}; 