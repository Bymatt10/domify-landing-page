import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js';
import type { Handle } from '@sveltejs/kit'
import { ExceptionHandler } from '$lib/exceptions';
import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from '$lib/env-utils';
import { rateLimitHandle } from '$lib/rate-limit-middleware';

// Get environment variables with fallbacks
const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();

// Supabase middleware (keep existing)
const supabaseHandle: Handle = async ({ event, resolve }) => {
	/**
	 * Creates a Supabase client specific to this server request.
	 *
	 * The Supabase client gets the Auth token from the request cookies.
	 */
	event.locals.supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
		db: {
			schema: 'public'
		},
		cookies: {
			get: (key) => event.cookies.get(key),
			/**
			 * SvelteKit's cookies API requires `path` to be explicitly set in
			 * the cookie options. Setting `path` to `/` replicates previous/
			 * standard behavior.
			 */
			set: (key, value, options) => {
				event.cookies.set(key, value, { ...options, path: '/' })
			},
			remove: (key, options) => {
				event.cookies.delete(key, { ...options, path: '/' })
			},
		}
	})

	/**
	 * Creates a Supabase admin client for administrative operations.
	 * Uses the service role key to bypass RLS policies.
	 */
	event.locals.supabaseAdmin = createClient(supabaseUrl, getSupabaseServiceRoleKey(), {
		auth: {
			autoRefreshToken: false,
			persistSession: false
		}
	})

	/**
	 * Unlike `supabase.auth.getSession()`, which returns the session _without_
	 * validating the JWT, this function also calls `getUser()` to validate the
	 * JWT before returning the session.
	 */
	event.locals.safeGetSession = async () => {
		const {
			data: { session },
		} = await event.locals.supabase.auth.getSession()
		if (!session) {
			return { session: null, user: null }
		}

		const {
			data: { user },
			error,
		} = await event.locals.supabase.auth.getUser()
		if (error) {
			// JWT validation has failed
			console.error('JWT validation failed:', error);
			return { session: null, user: null }
		}

		// Return the validated user and session
		return { session, user }
	}

	/**
	 * a convenience helper so we can just call await getSession()
	 */
	event.locals.getSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		return session;
	};

	/**
	 * Get the authenticated user with validation
	 */
	event.locals.getUser = async () => {
		const {
			data: { user },
			error,
		} = await event.locals.supabase.auth.getUser()
		if (error) {
			console.error('Error getting user:', error);
			return null;
		}
		return user;
	};

	// Aplicar rate limiting después de inicializar Supabase
	const rateLimitResponse = await rateLimitHandle({ event, resolve });
	if (rateLimitResponse instanceof Response) {
		return rateLimitResponse;
	}

	// Verificar si el usuario necesita cambiar contraseña (excepto en rutas específicas)
	const isPasswordChangeRoute = event.url.pathname.startsWith('/auth/change-password');
	const isAPIRoute = event.url.pathname.startsWith('/api/');
	const isAuthRoute = event.url.pathname.startsWith('/auth/');
	
	if (!isPasswordChangeRoute && !isAPIRoute && !isAuthRoute) {
		const { session, user } = await event.locals.safeGetSession();
		
		if (session && user && user.user_metadata?.requires_password_change === true) {
			return new Response(null, {
				status: 302,
				headers: {
					location: '/auth/change-password'
				}
			});
		}
	}

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			/**
			 * Supabase libraries use the `content-range` and `x-supabase-api-version`
			 * headers, so we need to tell SvelteKit to pass it through.
			 */
			return name === 'content-range' || name === 'x-supabase-api-version'
		},
	})
};

export const handle = supabaseHandle;

// Global error handler for API routes
export const handleError = async ({ error, event }: { error: any; event: any }) => {
	// Log the error for debugging
	console.error('Global error handler caught:', error);

	// Handle API routes specifically
	if (event.url.pathname.startsWith('/api/')) {
		const errorResponse = ExceptionHandler.handle(error);
		
		return new Response(JSON.stringify(errorResponse), {
			status: errorResponse.error.statusCode,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}

	// For non-API routes, return a generic error page
	return {
		message: 'An unexpected error occurred',
		status: 500
	};
}; 