import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
	try {
		const status = {
			app: 'running',
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
			environment: {
				NODE_ENV: process.env.NODE_ENV || 'not set',
				PORT: process.env.PORT || 'not set',
				HOSTNAME: process.env.HOSTNAME || 'not set'
			},
			supabase: {
				url: process.env.PUBLIC_SUPABASE_URL ? 'set' : 'not set',
				anonKey: process.env.PUBLIC_SUPABASE_ANON_KEY ? 'set' : 'not set',
				serviceKey: process.env.PRIVATE_SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'not set'
			},
			smtp: {
				host: process.env.SMTP_HOST ? 'set' : 'not set',
				port: process.env.SMTP_PORT ? 'set' : 'not set',
				user: process.env.SMTP_USER ? 'set' : 'not set',
				pass: process.env.SMTP_PASS ? 'set' : 'not set',
				from: process.env.FROM_EMAIL ? 'set' : 'not set'
			},
			services: {
				database: 'unknown',
				auth: 'unknown'
			}
		};

		// Test database connection
		try {
			const { data, error } = await locals.supabase
				.from('categories')
				.select('count(*)', { count: 'exact', head: true });
			
			status.services.database = error ? 'error' : 'ok';
		} catch (dbError) {
			status.services.database = 'error';
		}

		// Test auth service
		try {
			const { data: { user }, error } = await locals.supabase.auth.getUser();
			status.services.auth = error ? 'error' : 'ok';
		} catch (authError) {
			status.services.auth = 'error';
		}

		return json(status);
	} catch (error) {
		console.error('App status error:', error);
		return json({
			app: 'error',
			timestamp: new Date().toISOString(),
			message: 'App status check failed',
			error: error instanceof Error ? error.message : 'Unknown error'
		}, { status: 500 });
	}
}; 