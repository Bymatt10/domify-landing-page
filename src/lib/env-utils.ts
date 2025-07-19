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