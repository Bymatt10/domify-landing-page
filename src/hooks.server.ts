import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js';
import type { Handle } from '@sveltejs/kit'
import { ExceptionHandler } from '$lib/exceptions';
import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from '$lib/env-utils';
import { rateLimitHandle } from '$lib/rate-limit-middleware';

// Get environment variables with fallbacks
const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();
const isMockMode = !supabaseUrl || supabaseUrl.includes('placeholder') || supabaseUrl.includes('fallback') || supabaseUrl.includes('localhost');

// Supabase middleware
const supabaseHandle: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
		db: { schema: 'public' },
		cookies: {
			get: (key) => event.cookies.get(key),
			set: (key, value, options) => {
				event.cookies.set(key, value, { ...options, path: '/' })
			},
			remove: (key, options) => {
				event.cookies.delete(key, { ...options, path: '/' })
			},
		}
	})

	event.locals.supabaseAdmin = createClient(supabaseUrl, getSupabaseServiceRoleKey(), {
		auth: {
			autoRefreshToken: false,
			persistSession: false
		}
	})

	const mockUser = {
		id: 'mock-user-id',
		email: 'admin@domify.app',
		user_metadata: {
			role: 'admin',
			first_name: 'Admin',
			last_name: 'Mock'
		},
		aud: 'authenticated',
		role: 'authenticated'
	};
	const mockSession = {
		access_token: 'mock-token',
		token_type: 'bearer',
		expires_in: 3600,
		user: mockUser
	};

	event.locals.safeGetSession = async () => {
		if (isMockMode) return { session: mockSession, user: mockUser };
		const { data: { session } } = await event.locals.supabase.auth.getSession()
		if (!session) return { session: null, user: null }
		const { data: { user }, error } = await event.locals.supabase.auth.getUser()
		if (error) return { session: null, user: null }
		return { session, user }
	}

	event.locals.getSession = async () => {
		if (isMockMode) return mockSession;
		const { data: { session } } = await event.locals.supabase.auth.getSession();
		return session;
	};

	event.locals.getUser = async () => {
		if (isMockMode) return mockUser;
		const { data: { user }, error } = await event.locals.supabase.auth.getUser()
		if (error) return null;
		return user;
	};

	// Aplicar rate limiting
	const rateLimitResponse = await rateLimitHandle({ event, resolve });
	if (rateLimitResponse instanceof Response) {
		return rateLimitResponse;
	}

	const isPasswordChangeRoute = event.url.pathname.startsWith('/auth/change-password');
	const isAPIRoute = event.url.pathname.startsWith('/api/');
	const isAuthRoute = event.url.pathname.startsWith('/auth/');

	// Bypass password change check in mock mode to avoid unwanted redirects
	if (!isMockMode && !isPasswordChangeRoute && !isAPIRoute && !isAuthRoute) {
		const { session, user } = await event.locals.safeGetSession();
		if (session && user && user.user_metadata?.requires_password_change === true) {
			return new Response(null, {
				status: 302,
				headers: { location: '/auth/change-password' }
			});
		}
	}

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version'
		},
	})
};

export const handle = supabaseHandle;

export const handleError = async ({ error, event }: { error: any; event: any }) => {
	console.error('Global error handler caught:', error);


	if (event.url.pathname.startsWith('/api/')) {
		const errorResponse = ExceptionHandler.handle(error);
		return new Response(JSON.stringify(errorResponse), {
			status: errorResponse.error.statusCode,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	return {
		message: 'An unexpected error occurred',
		status: 500
	};
};