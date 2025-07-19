// Utility functions for handling environment variables
// This provides fallbacks for different environments

export function getSupabaseUrl(): string {
	// Try $env/static/public first (SvelteKit way)
	try {
		const { PUBLIC_SUPABASE_URL } = require('$env/static/public');
		if (PUBLIC_SUPABASE_URL) return PUBLIC_SUPABASE_URL;
	} catch (e) {
		// Fallback to import.meta.env (Vite way)
		if (import.meta.env.PUBLIC_SUPABASE_URL) {
			return import.meta.env.PUBLIC_SUPABASE_URL;
		}
	}
	
	throw new Error('PUBLIC_SUPABASE_URL is not defined');
}

export function getSupabaseAnonKey(): string {
	try {
		const { PUBLIC_SUPABASE_ANON_KEY } = require('$env/static/public');
		if (PUBLIC_SUPABASE_ANON_KEY) return PUBLIC_SUPABASE_ANON_KEY;
	} catch (e) {
		if (import.meta.env.PUBLIC_SUPABASE_ANON_KEY) {
			return import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
		}
	}
	
	throw new Error('PUBLIC_SUPABASE_ANON_KEY is not defined');
}

export function getSupabaseServiceRoleKey(): string {
	try {
		const { PRIVATE_SUPABASE_SERVICE_ROLE_KEY } = require('$env/static/private');
		if (PRIVATE_SUPABASE_SERVICE_ROLE_KEY) return PRIVATE_SUPABASE_SERVICE_ROLE_KEY;
	} catch (e) {
		if (import.meta.env.PRIVATE_SUPABASE_SERVICE_ROLE_KEY) {
			return import.meta.env.PRIVATE_SUPABASE_SERVICE_ROLE_KEY;
		}
	}
	
	throw new Error('PRIVATE_SUPABASE_SERVICE_ROLE_KEY is not defined');
}

export function getSiteUrl(): string {
	try {
		const { PUBLIC_SITE_URL } = require('$env/static/public');
		if (PUBLIC_SITE_URL) return PUBLIC_SITE_URL;
	} catch (e) {
		if (import.meta.env.PUBLIC_SITE_URL) {
			return import.meta.env.PUBLIC_SITE_URL;
		}
	}
	
	// Default fallback
	return 'http://localhost:3000';
}

// SMTP environment variables
export function getSmtpHost(): string {
	try {
		const { SMTP_HOST } = require('$env/static/private');
		if (SMTP_HOST) return SMTP_HOST;
	} catch (e) {
		if (import.meta.env.SMTP_HOST) {
			return import.meta.env.SMTP_HOST;
		}
	}
	
	throw new Error('SMTP_HOST is not defined');
}

export function getSmtpPort(): string {
	try {
		const { SMTP_PORT } = require('$env/static/private');
		if (SMTP_PORT) return SMTP_PORT;
	} catch (e) {
		if (import.meta.env.SMTP_PORT) {
			return import.meta.env.SMTP_PORT;
		}
	}
	
	throw new Error('SMTP_PORT is not defined');
}

export function getSmtpUser(): string {
	try {
		const { SMTP_USER } = require('$env/static/private');
		if (SMTP_USER) return SMTP_USER;
	} catch (e) {
		if (import.meta.env.SMTP_USER) {
			return import.meta.env.SMTP_USER;
		}
	}
	
	throw new Error('SMTP_USER is not defined');
}

export function getSmtpPass(): string {
	try {
		const { SMTP_PASS } = require('$env/static/private');
		if (SMTP_PASS) return SMTP_PASS;
	} catch (e) {
		if (import.meta.env.SMTP_PASS) {
			return import.meta.env.SMTP_PASS;
		}
	}
	
	throw new Error('SMTP_PASS is not defined');
}

export function getFromEmail(): string {
	try {
		const { FROM_EMAIL } = require('$env/static/private');
		if (FROM_EMAIL) return FROM_EMAIL;
	} catch (e) {
		if (import.meta.env.FROM_EMAIL) {
			return import.meta.env.FROM_EMAIL;
		}
	}
	
	// Default fallback
	return 'noreply@domify.app';
} 