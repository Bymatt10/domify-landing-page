// Utility functions for handling environment variables
// This provides fallbacks for different environments

// Import only public variables that are guaranteed to be available
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export function getSupabaseUrl(): string {
	// Try import.meta.env first (Vite way)
	if (import.meta.env.PUBLIC_SUPABASE_URL) {
		return import.meta.env.PUBLIC_SUPABASE_URL;
	}
	
	// Try $env/static/public (SvelteKit way)
	if (PUBLIC_SUPABASE_URL) {
		return PUBLIC_SUPABASE_URL;
	}
	
	throw new Error('PUBLIC_SUPABASE_URL is not defined');
}

export function getSupabaseAnonKey(): string {
	if (import.meta.env.PUBLIC_SUPABASE_ANON_KEY) {
		return import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
	}
	
	if (PUBLIC_SUPABASE_ANON_KEY) {
		return PUBLIC_SUPABASE_ANON_KEY;
	}
	
	throw new Error('PUBLIC_SUPABASE_ANON_KEY is not defined');
}

export function getSupabaseServiceRoleKey(): string {
	// Try import.meta.env first (Vite way) - check both possible names
	if (import.meta.env.SUPABASE_SERVICE_ROLE_KEY) {
		return import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
	}
	if (import.meta.env.PRIVATE_SUPABASE_SERVICE_ROLE_KEY) {
		return import.meta.env.PRIVATE_SUPABASE_SERVICE_ROLE_KEY;
	}
	
	// Try process.env as fallback - check both possible names
	if (typeof process !== 'undefined') {
		if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
			return process.env.SUPABASE_SERVICE_ROLE_KEY;
		}
		if (process.env.PRIVATE_SUPABASE_SERVICE_ROLE_KEY) {
			return process.env.PRIVATE_SUPABASE_SERVICE_ROLE_KEY;
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