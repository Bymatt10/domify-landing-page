// Utility functions for handling environment variables
// This provides fallbacks for different environments

export function getSupabaseUrl(): string {
	// Try import.meta.env first (Vite way)
	if (import.meta.env.PUBLIC_SUPABASE_URL) {
		return import.meta.env.PUBLIC_SUPABASE_URL;
	}
	
	// Try process.env as fallback
	if (typeof process !== 'undefined' && process.env.PUBLIC_SUPABASE_URL) {
		return process.env.PUBLIC_SUPABASE_URL;
	}
	
	// Try to access the variable directly (will be replaced at build time)
	try {
		// @ts-ignore - This will be replaced by SvelteKit at build time
		if (typeof PUBLIC_SUPABASE_URL !== 'undefined' && PUBLIC_SUPABASE_URL) {
			// @ts-ignore
			return PUBLIC_SUPABASE_URL;
		}
	} catch (e) {
		// Ignore errors
	}
	
	// Always return a fallback to prevent build errors
	console.warn('⚠️ PUBLIC_SUPABASE_URL not found. Using fallback value.');
	return 'https://fallback.supabase.co';
}

export function getSupabaseAnonKey(): string {
	if (import.meta.env.PUBLIC_SUPABASE_ANON_KEY) {
		return import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
	}
	
	// Try process.env as fallback
	if (typeof process !== 'undefined' && process.env.PUBLIC_SUPABASE_ANON_KEY) {
		return process.env.PUBLIC_SUPABASE_ANON_KEY;
	}
	
	try {
		// @ts-ignore - This will be replaced by SvelteKit at build time
		if (typeof PUBLIC_SUPABASE_ANON_KEY !== 'undefined' && PUBLIC_SUPABASE_ANON_KEY) {
			// @ts-ignore
			return PUBLIC_SUPABASE_ANON_KEY;
		}
	} catch (e) {
		// Ignore errors
	}
	
	// Always return a fallback to prevent build errors
	console.warn('⚠️ PUBLIC_SUPABASE_ANON_KEY not found. Using fallback value.');
	return 'fallback-anon-key';
}

export function getSupabaseServiceRoleKey(): string {
	// Try import.meta.env first (Vite way) - check all possible names
	if (import.meta.env.SUPABASE_SERVICE_ROLE_KEY) {
		return import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
	}
	if (import.meta.env.PRIVATE_SUPABASE_SERVICE_ROLE_KEY) {
		return import.meta.env.PRIVATE_SUPABASE_SERVICE_ROLE_KEY;
	}
	if (import.meta.env.PUBLIC_SUPABASE_SERVICE_ROLE_KEY) {
		return import.meta.env.PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
	}
	
	// Try process.env as fallback - check all possible names
	if (typeof process !== 'undefined') {
		if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
			return process.env.SUPABASE_SERVICE_ROLE_KEY;
		}
		if (process.env.PRIVATE_SUPABASE_SERVICE_ROLE_KEY) {
			return process.env.PRIVATE_SUPABASE_SERVICE_ROLE_KEY;
		}
		if (process.env.PUBLIC_SUPABASE_SERVICE_ROLE_KEY) {
			return process.env.PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
		}
	}
	
	// Try to access the variable directly (will be replaced at build time)
	try {
		// @ts-ignore - This will be replaced by SvelteKit at build time
		if (typeof SUPABASE_SERVICE_ROLE_KEY !== 'undefined' && SUPABASE_SERVICE_ROLE_KEY) {
			// @ts-ignore
			return SUPABASE_SERVICE_ROLE_KEY;
		}
		// @ts-ignore - Try the private version too
		if (typeof PRIVATE_SUPABASE_SERVICE_ROLE_KEY !== 'undefined' && PRIVATE_SUPABASE_SERVICE_ROLE_KEY) {
			// @ts-ignore
			return PRIVATE_SUPABASE_SERVICE_ROLE_KEY;
		}
		// @ts-ignore - Try the public version too
		if (typeof PUBLIC_SUPABASE_SERVICE_ROLE_KEY !== 'undefined' && PUBLIC_SUPABASE_SERVICE_ROLE_KEY) {
			// @ts-ignore
			return PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
		}
	} catch (e) {
		// Ignore errors
	}
	
	// Always return a fallback to prevent build errors
	console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY not found. Using fallback value.');
	return 'fallback-service-role-key';
}

export function getSiteUrl(): string {
	if (import.meta.env.PUBLIC_SITE_URL) {
		return import.meta.env.PUBLIC_SITE_URL;
	}
	
	try {
		// @ts-ignore - This will be replaced by SvelteKit at build time
		if (typeof PUBLIC_SITE_URL !== 'undefined' && PUBLIC_SITE_URL) {
			// @ts-ignore
			return PUBLIC_SITE_URL;
		}
	} catch (e) {
		// Ignore errors
	}
	
	// Default fallback
	return 'http://localhost:3000';
}

// SMTP environment variables
export function getSmtpHost(): string {
	// Try import.meta.env first (Vite way)
	if (import.meta.env.SMTP_HOST) {
		return import.meta.env.SMTP_HOST;
	}
	
	// Try process.env as fallback
	if (typeof process !== 'undefined' && process.env.SMTP_HOST) {
		return process.env.SMTP_HOST;
	}
	
	// Try to access the variable directly (will be replaced at build time)
	try {
		// @ts-ignore - This will be replaced by SvelteKit at build time
		if (typeof SMTP_HOST !== 'undefined' && SMTP_HOST) {
			// @ts-ignore
			return SMTP_HOST;
		}
	} catch (e) {
		// Ignore errors
	}
	
	// Return fallback to prevent build errors
	return 'localhost';
}

export function getSmtpPort(): string {
	if (import.meta.env.SMTP_PORT) {
		return import.meta.env.SMTP_PORT;
	}
	
	if (typeof process !== 'undefined' && process.env.SMTP_PORT) {
		return process.env.SMTP_PORT;
	}
	
	try {
		// @ts-ignore - This will be replaced by SvelteKit at build time
		if (typeof SMTP_PORT !== 'undefined' && SMTP_PORT) {
			// @ts-ignore
			return SMTP_PORT;
		}
	} catch (e) {
		// Ignore errors
	}
	
	// Return fallback to prevent build errors
	return '587';
}

export function getSmtpUser(): string {
	if (import.meta.env.SMTP_USER) {
		return import.meta.env.SMTP_USER;
	}
	
	if (typeof process !== 'undefined' && process.env.SMTP_USER) {
		return process.env.SMTP_USER;
	}
	
	try {
		// @ts-ignore - This will be replaced by SvelteKit at build time
		if (typeof SMTP_USER !== 'undefined' && SMTP_USER) {
			// @ts-ignore
			return SMTP_USER;
		}
	} catch (e) {
		// Ignore errors
	}
	
	// Return fallback to prevent build errors
	return 'fallback-user';
}

export function getSmtpPass(): string {
	if (import.meta.env.SMTP_PASS) {
		return import.meta.env.SMTP_PASS;
	}
	
	if (typeof process !== 'undefined' && process.env.SMTP_PASS) {
		return process.env.SMTP_PASS;
	}
	
	try {
		// @ts-ignore - This will be replaced by SvelteKit at build time
		if (typeof SMTP_PASS !== 'undefined' && SMTP_PASS) {
			// @ts-ignore
			return SMTP_PASS;
		}
	} catch (e) {
		// Ignore errors
	}
	
	// Return fallback to prevent build errors
	return 'fallback-password';
}

export function getFromEmail(): string {
	if (import.meta.env.FROM_EMAIL) {
		return import.meta.env.FROM_EMAIL;
	}
	
	if (typeof process !== 'undefined' && process.env.FROM_EMAIL) {
		return process.env.FROM_EMAIL;
	}
	
	try {
		// @ts-ignore - This will be replaced by SvelteKit at build time
		if (typeof FROM_EMAIL !== 'undefined' && FROM_EMAIL) {
			// @ts-ignore
			return FROM_EMAIL;
		}
	} catch (e) {
		// Ignore errors
	}
	
	// Default fallback
	return 'noreply@domify.app';
} 

/**
 * Verifica que todas las variables de entorno críticas estén configuradas
 */
export function validateEnvironment(): { valid: boolean; missing: string[] } {
	const requiredVars = [
		'PUBLIC_SUPABASE_URL',
		'PUBLIC_SUPABASE_ANON_KEY',
		'PRIVATE_SUPABASE_SERVICE_ROLE_KEY'
	];

	const missing: string[] = [];

	for (const varName of requiredVars) {
		if (!process.env[varName]) {
			missing.push(varName);
		}
	}

	return {
		valid: missing.length === 0,
		missing
	};
}

/**
 * Obtiene la configuración del servidor
 */
export function getServerConfig() {
	return {
		port: process.env.PORT || '4000',
		host: process.env.HOST || '0.0.0.0',
		nodeEnv: process.env.NODE_ENV || 'development',
		isProduction: process.env.NODE_ENV === 'production'
	};
}

export function getGoogleSheetsCredentials(): string | null {
	if (import.meta.env.GOOGLE_SHEETS_CREDENTIALS) {
		return import.meta.env.GOOGLE_SHEETS_CREDENTIALS;
	}
	
	if (typeof process !== 'undefined' && process.env.GOOGLE_SHEETS_CREDENTIALS) {
		return process.env.GOOGLE_SHEETS_CREDENTIALS;
	}
	
	try {
		// @ts-ignore - This will be replaced by SvelteKit at build time
		if (typeof GOOGLE_SHEETS_CREDENTIALS !== 'undefined' && GOOGLE_SHEETS_CREDENTIALS) {
			// @ts-ignore
			return GOOGLE_SHEETS_CREDENTIALS;
		}
	} catch (e) {
		// Ignore errors
	}
	
	return null;
}

export function getAdminEmail(): string {
	if (import.meta.env.ADMIN_EMAIL) {
		return import.meta.env.ADMIN_EMAIL;
	}
	
	if (typeof process !== 'undefined' && process.env.ADMIN_EMAIL) {
		return process.env.ADMIN_EMAIL;
	}
	
	try {
		// @ts-ignore - This will be replaced by SvelteKit at build time
		if (typeof ADMIN_EMAIL !== 'undefined' && ADMIN_EMAIL) {
			// @ts-ignore
			return ADMIN_EMAIL;
		}
	} catch (e) {
		// Ignore errors
	}
	
	// Default fallback
	return 'admin@domify.app';
} 