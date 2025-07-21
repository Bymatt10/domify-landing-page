import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check if the API is running and healthy
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: 'ok'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *                   example: '1.0.0'
 *                 message:
 *                   type: string
 *                   example: 'Domify API is running!'
 *                 environment:
 *                   type: string
 *                   example: 'production'
 *                 uptime:
 *                   type: number
 *                   description: Server uptime in seconds
 */
export const GET: RequestHandler = async ({ locals }) => {
	try {
		// Basic health check data
		const healthData = {
			status: 'ok',
			timestamp: new Date().toISOString(),
			version: '1.0.0',
			message: 'Domify API is running!',
			environment: process.env.NODE_ENV || 'development',
			uptime: process.uptime(),
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
			
			healthData.services.database = error ? 'error' : 'ok';
		} catch (dbError) {
			healthData.services.database = 'error';
		}

		// Test auth service
		try {
			const { data: { user }, error } = await locals.supabase.auth.getUser();
			healthData.services.auth = error ? 'error' : 'ok';
		} catch (authError) {
			healthData.services.auth = 'error';
		}

		return json(healthData);
	} catch (error) {
		console.error('Health check error:', error);
		return json({
			status: 'error',
			timestamp: new Date().toISOString(),
			message: 'Health check failed',
			error: error instanceof Error ? error.message : 'Unknown error'
		}, { status: 500 });
	}
}; 