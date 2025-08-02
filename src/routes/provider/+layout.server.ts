import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }: { locals: any }) => {
	// Provider Guard - Checking Supabase provider access

	// Get current session and user
	const { data: { user } } = await locals.supabase.auth.getUser();
	const { session } = await locals.safeGetSession();

	// If no session or user, redirect to login
	if (!session || !user) {
		throw redirect(303, '/auth/login');
	}

	// Check if user is provider or admin (admin can access provider routes)
	const isProvider = user.user_metadata?.role === 'provider';
	const isAdmin = user.user_metadata?.role === 'admin' || 
				   user.email === 'matthewreyesvanegas46@gmail.com';

	if (!isProvider && !isAdmin) {
		throw redirect(303, '/become-provider');
	}

	// Access granted for provider

	return {
		session,
		user
	};
};