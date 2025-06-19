import { createServerClient } from '@supabase/ssr'
import type { Handle } from '@sveltejs/kit'
import { ExceptionHandler } from '$lib/exceptions';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY!

export const handle: Handle = async ({ event, resolve }) => {
	/**
	 * Creates a Supabase client specific to this server request.
	 *
	 * The Supabase client gets the Auth token from the request cookies.
	 */
	event.locals.supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
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
			return { session: null, user: null }
		}

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

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			/**
			 * Supabase libraries use the `content-range` and `x-supabase-api-version`
			 * headers, so we need to tell SvelteKit to pass it through.
			 */
			return name === 'content-range' || name === 'x-supabase-api-version'
		},
	})
}

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