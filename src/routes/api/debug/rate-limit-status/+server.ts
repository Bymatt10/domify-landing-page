import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { getRateLimitInfo, RATE_LIMIT_CONFIGS } from '$lib/rate-limit';

export const GET: RequestHandler = async ({ request }) => {
	try {
		const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
						request.headers.get('cf-connecting-ip') ||
						request.headers.get('x-real-ip') ||
						'unknown';

		// Obtener información de rate limit para diferentes configuraciones
		const rateLimitStatus = {
			clientIP,
			timestamp: new Date().toISOString(),
			configurations: {} as Record<string, any>
		};

		// Verificar cada configuración
		for (const [configName, config] of Object.entries(RATE_LIMIT_CONFIGS)) {
			const info = await getRateLimitInfo(request, configName as keyof typeof RATE_LIMIT_CONFIGS);
			
			rateLimitStatus.configurations[configName] = {
				limit: info?.limit || config.maxRequests,
				remaining: info?.remaining || config.maxRequests,
				reset: info?.reset || (Date.now() + config.windowMs),
				windowMs: config.windowMs,
				maxRequests: config.maxRequests,
				windowMinutes: Math.round(config.windowMs / (1000 * 60)),
				resetInMinutes: info ? Math.round((info.reset - Date.now()) / (1000 * 60)) : Math.round(config.windowMs / (1000 * 60))
			};
		}

		return json({
			success: true,
			data: rateLimitStatus
		});

	} catch (error) {
		console.error('Error getting rate limit status:', error);
		return json({
			success: false,
			error: 'Failed to get rate limit status',
			message: error instanceof Error ? error.message : 'Unknown error'
		}, { status: 500 });
	}
}; 