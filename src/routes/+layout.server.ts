import type { LayoutServerLoad } from './$types';
import { isAuthenticated, getUser } from '$lib/auth0-server';

export const load: LayoutServerLoad = async ({ locals, request }) => {
	try {
		// Get Auth0 user info
		const auth0User = getUser(request);
		const isAuth0Authenticated = isAuthenticated(request);

		console.log('Layout server load - Auth0 Session:', {
			hasSession: isAuth0Authenticated,
			hasUser: !!auth0User,
			userEmail: auth0User?.email,
			userSub: auth0User?.sub
		});

		// If Auth0 user exists, sync with Supabase
		let supabaseUser = null;
		let isProvider = false;
		let providerProfile = null;
		let isAdmin = false;

		if (auth0User) {
			// Try to get or create Supabase user
			const { data: { user }, error } = await locals.supabase.auth.getUser();
			
			if (error || !user) {
				// Create Supabase user from Auth0 data
				const { data: signUpData, error: signUpError } = await locals.supabase.auth.signUp({
					email: auth0User.email,
					password: crypto.randomUUID(), // Generate random password
					options: {
						data: {
							auth0_id: auth0User.sub,
							name: auth0User.name,
							picture: auth0User.picture,
							email_verified: auth0User.email_verified
						}
					}
				});

				if (signUpData?.user) {
					supabaseUser = signUpData.user;
				}
			} else {
				supabaseUser = user;
			}

			// Check provider status
			if (supabaseUser) {
				const { data: provider, error: providerError } = await locals.supabase
					.from('provider_profiles')
					.select('*')
					.eq('user_id', supabaseUser.id)
					.maybeSingle();

				isProvider = !!provider;
				providerProfile = provider;

				if (providerError) {
					console.error('Error checking provider status:', providerError);
				}
			}

			// Check admin status
			isAdmin = auth0User['https://domify.app/roles']?.includes('admin') || false;
		}

		return {
			session: isAuth0Authenticated ? { user: auth0User } : null,
			user: auth0User,
			supabaseUser,
			isProvider,
			isAdmin,
			providerProfile
		};
	} catch (error) {
		console.error('Error in layout server load:', error);
		return {
			session: null,
			user: null,
			supabaseUser: null,
			isProvider: false,
			isAdmin: false,
			providerProfile: null
		};
	}
}; 