import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, fetch }) => {
	try {
		// console.log removed

		// Get current session and user using getUser for security
		const { data: { user } } = await locals.supabase.auth.getUser();
		const { session } = await locals.safeGetSession();

		// Layout server load - Session info

		// Check if user is a provider
		let isProvider = false;
		let providerProfile = null;

		if (user) {
			// Check provider_profiles table
			const { data: provider, error: providerError } = await locals.supabase
				.from('provider_profiles')
				.select('*')
				.eq('user_id', user.id)
				.maybeSingle(); // Use maybeSingle to avoid errors if doesn't exist

			isProvider = !!provider;
			providerProfile = provider;

			if (providerError) {
				console.error('Error checking provider status:', providerError);
			}
		}

		// Check if user is admin - check both metadata and email
		const isAdmin = user?.user_metadata?.role === 'admin' || 
					   user?.email === 'matthewreyesvanegas46@gmail.com';

		// Layout server load - Admin check

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