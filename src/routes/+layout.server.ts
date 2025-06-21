import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { safeGetSession } }) => {
	const { session, user } = await safeGetSession();

	// Log for debugging
	if (user) {
		console.log('User authenticated via safeGetSession:', { 
			id: user.id, 
			email: user.email, 
			role: user.user_metadata?.role 
		});
	} else {
		console.log('No authenticated user');
	}

	return {
		session,
		user
	};
}; 