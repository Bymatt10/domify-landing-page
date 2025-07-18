import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	try {
		const session = await locals.getSession();
		
		if (!session?.user) {
			return json({ authenticated: false }, { status: 401 });
		}

		return json({
			authenticated: true,
            user: {
				id: session.user.id,
				email: session.user.email,
				role: session.user.user_metadata?.role || 'customer'
			}
		});

    } catch (error) {
		console.error('Error in GET /api/me:', error);
		return json({ authenticated: false }, { status: 500 });
    }
}; 