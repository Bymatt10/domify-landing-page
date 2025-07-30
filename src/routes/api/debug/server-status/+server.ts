import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateEnvironment, getServerConfig } from '$lib/env-utils';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	try {
		// Verificar variables de entorno críticas
		const envValidation = validateEnvironment();
		const serverConfig = getServerConfig();
		
		const envCheck = {
			valid: envValidation.valid,
			missing: envValidation.missing,
			PUBLIC_SUPABASE_URL: !!process.env.PUBLIC_SUPABASE_URL,
			PUBLIC_SUPABASE_ANON_KEY: !!process.env.PUBLIC_SUPABASE_ANON_KEY,
			PRIVATE_SUPABASE_SERVICE_ROLE_KEY: !!process.env.PRIVATE_SUPABASE_SERVICE_ROLE_KEY,
			NODE_ENV: serverConfig.nodeEnv,
			PORT: serverConfig.port,
			HOST: serverConfig.host,
			isProduction: serverConfig.isProduction
		};

		// Verificar conexión a Supabase
		let supabaseStatus = 'unknown';
		try {
			const { data, error } = await supabase.auth.getSession();
			supabaseStatus = error ? 'error' : 'connected';
		} catch (e) {
			supabaseStatus = 'failed';
		}

		// Información del servidor
		const serverInfo = {
			timestamp: new Date().toISOString(),
			url: url.toString(),
			hostname: url.hostname,
			protocol: url.protocol,
			port: url.port || (url.protocol === 'https:' ? '443' : '80'),
			userAgent: url.searchParams.get('userAgent') || 'not provided'
		};

		// Verificar si el servidor está respondiendo
		const healthStatus = {
			server: 'running',
			supabase: supabaseStatus,
			environment: envCheck,
			serverInfo
		};

		return json(healthStatus);
	} catch (error) {
		return json({
			error: 'Server status check failed',
			message: error instanceof Error ? error.message : 'Unknown error',
			timestamp: new Date().toISOString()
		}, { status: 500 });
	}
}; 