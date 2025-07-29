import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	try {
		const { data: { user } } = await locals.supabase.auth.getUser();
		const { session } = await locals.safeGetSession();
		
		if (!session || !user) {
			return json({ authenticated: false }, { status: 401 });
		}

		return json({
			authenticated: true,
            user: {
				id: user.id,
				email: user.email,
				role: user.user_metadata?.role || 'customer'
			}
		});

    } catch (error) {
		console.error('Error in GET /api/me:', error);
		return json({ authenticated: false }, { status: 500 });
    }
}; 