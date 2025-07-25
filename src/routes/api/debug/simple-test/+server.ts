import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	return json({
		message: 'Simple test endpoint working!',
		timestamp: new Date().toISOString(),
		status: 'ok'
	});
}; 