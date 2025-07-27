import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { clearRateLimit, getClientIP } from '$lib/rate-limit';

export const POST: RequestHandler = async ({ request }) => {
	try {
		// Solo permitir en desarrollo
		if (process.env.NODE_ENV !== 'development') {
			return json({
				success: false,
				error: 'This endpoint is only available in development mode'
			}, { status: 403 });
		}

		const { key, config } = await request.json();
		const clientIP = getClientIP(request);

		if (!key && !config) {
			// Limpiar todos los rate limits para este IP
			const configs = ['auth', 'api', 'search', 'forms', 'webhooks'];
			const clearedKeys = [];

			for (const configName of configs) {
				const rateLimitKey = `${configName}:${clientIP}`;
				await clearRateLimit(rateLimitKey);
				clearedKeys.push(rateLimitKey);
			}

			return json({
				success: true,
				message: 'All rate limits cleared for this IP',
				clearedKeys,
				clientIP
			});
		}

		if (key) {
			// Limpiar rate limit específico
			await clearRateLimit(key);
			return json({
				success: true,
				message: `Rate limit cleared for key: ${key}`,
				clearedKey: key
			});
		}

		if (config) {
			// Limpiar rate limit para configuración específica
			const rateLimitKey = `${config}:${clientIP}`;
			await clearRateLimit(rateLimitKey);
			return json({
				success: true,
				message: `Rate limit cleared for config: ${config}`,
				clearedKey: rateLimitKey,
				clientIP
			});
		}

		return json({
			success: false,
			error: 'Invalid request. Provide either key or config parameter.'
		}, { status: 400 });

	} catch (error) {
		console.error('Error clearing rate limits:', error);
		return json({
			success: false,
			error: 'Failed to clear rate limits',
			message: error instanceof Error ? error.message : 'Unknown error'
		}, { status: 500 });
	}
}; 