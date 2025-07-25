import { json } from '@sveltejs/kit';
import { getSupabaseServiceRoleKey, getSupabaseUrl, getSupabaseAnonKey } from '$lib/env-utils';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const envCheck = {
		timestamp: new Date().toISOString(),
		environment: 'production',
		
		// Check what's available in different contexts
		import_meta_env: {
			PUBLIC_SUPABASE_URL: import.meta.env.PUBLIC_SUPABASE_URL ? 'set' : 'not set',
			PUBLIC_SUPABASE_ANON_KEY: import.meta.env.PUBLIC_SUPABASE_ANON_KEY ? 'set' : 'not set',
			SUPABASE_SERVICE_ROLE_KEY: import.meta.env.SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'not set',
			PRIVATE_SUPABASE_SERVICE_ROLE_KEY: import.meta.env.PRIVATE_SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'not set',
			PUBLIC_SUPABASE_SERVICE_ROLE_KEY: import.meta.env.PUBLIC_SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'not set'
		},
		
		process_env: {
			PUBLIC_SUPABASE_URL: process.env.PUBLIC_SUPABASE_URL ? 'set' : 'not set',
			PUBLIC_SUPABASE_ANON_KEY: process.env.PUBLIC_SUPABASE_ANON_KEY ? 'set' : 'not set',
			SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'not set',
			PRIVATE_SUPABASE_SERVICE_ROLE_KEY: process.env.PRIVATE_SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'not set',
			PUBLIC_SUPABASE_SERVICE_ROLE_KEY: process.env.PUBLIC_SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'not set'
		},
		
		// Test our utility functions
		utility_functions: {
			supabase_url: getSupabaseUrl() ? 'working' : 'failed',
			supabase_anon_key: getSupabaseAnonKey() ? 'working' : 'failed',
			supabase_service_role_key: getSupabaseServiceRoleKey() ? 'working' : 'failed'
		},
		
		// Check if keys are actually valid (without exposing them)
		key_validation: {
			supabase_url_valid: getSupabaseUrl().includes('supabase.co'),
			anon_key_valid: getSupabaseAnonKey().length > 50,
			service_role_key_valid: getSupabaseServiceRoleKey().length > 50
		},
		
		// All environment variables (be careful not to expose sensitive data)
		all_env_vars: Object.keys(process.env).filter(key => 
			key.includes('SUPABASE') || 
			key.includes('SMTP') || 
			key.includes('NODE_ENV') ||
			key.includes('PORT')
		).reduce((acc, key) => {
			acc[key] = process.env[key] ? 'set' : 'not set';
			return acc;
		}, {} as Record<string, string>)
	};

	return json(envCheck);
}; 