import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

/**
 * Simple root API endpoint for basic application info
 * This helps with health checks and diagnostics
 */
export const GET: RequestHandler = async ({ request }) => {
	// Check if this is a JSON/API request vs browser request
	const acceptHeader = request.headers.get('accept') || '';
	const userAgent = request.headers.get('user-agent') || '';
	
	// If it's a curl/API request or explicitly asking for JSON, return JSON
	if (acceptHeader.includes('application/json') || 
	    userAgent.includes('curl') || 
	    userAgent.includes('wget') ||
	    request.url.includes('api=true')) {
		
		return json({
			status: 'ok',
			message: 'Domify API is running',
			version: '1.0.0',
			timestamp: new Date().toISOString(),
			endpoints: {
				health: '/api/health',
				swagger: '/api/swagger.json',
				docs: '/api/docs'
			},
			note: 'For detailed health information, visit /api/health'
		});
	}
	
	// For browser requests, let SvelteKit handle the normal page rendering
	// This will fall through to the +page.svelte
	return new Response(null, { status: 404 });
}; 