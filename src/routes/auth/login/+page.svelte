<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';

	let email = '';
	let password = '';
	let loading = false;
	let error = '';

	// Capturar error de URL (desde OAuth callback)
	onMount(() => {
		const urlError = $page.url.searchParams.get('error');
		if (urlError) {
			// Decodificar y limpiar el mensaje de error
			const decodedError = decodeURIComponent(urlError);
			
			if (decodedError.includes('exception:')) {
				error = 'Error en la autenticación con Google. Por favor, inténtalo de nuevo.';
			} else if (decodedError.includes('oauthError:')) {
				error = decodedError.replace('oauthError:', '');
			} else if (decodedError.includes('profileError:')) {
				error = 'Error creando tu perfil. Por favor, inténtalo de nuevo.';
			} else {
				error = decodedError;
			}
		}
	});

	async function handleLogin() {
		try {
			loading = true;
			error = '';

			// Use Supabase auth directly for session management
			const { data, error: loginError } = await supabase.auth.signInWithPassword({
				email,
				password
			});

			if (loginError) {
				error = loginError.message;
				return;
			}

			if (data.user) {
				console.log('Login successful:', data.user);
				// Invalidate all to refresh the session
				await invalidateAll();
				// Redirect to home or intended page with full reload
				const redirectTo = $page.url.searchParams.get('redirectTo') || '/';
				window.location.href = redirectTo;
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Error inesperado';
		} finally {
			loading = false;
		}
	}

	async function handleSignInWithGoogle() {
		try {
			loading = true;
			error = '';

			const { data, error: googleError } = await supabase.auth.signInWithOAuth({
				provider: 'google',
				options: {
					redirectTo: `${window.location.origin}/auth/callback`
				}
			});

			if (googleError) {
				error = googleError.message;
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Error inesperado';
		} finally {
			loading = false;
		}
	}

	async function handleSignInWithFacebook() {
		try {
			loading = true;
			error = '';
			const { data, error: fbError } = await supabase.auth.signInWithOAuth({
				provider: 'facebook',
				options: {
					redirectTo: `${window.location.origin}/auth/callback`
				}
			});
			if (fbError) {
				error = fbError.message;
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Error inesperado';
		} finally {
			loading = false;
		}
	}
</script>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-700 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full bg-white p-8 rounded-lg shadow-xl">
		<div class="text-center mb-8">
			<h1 class="text-3xl font-bold text-gray-900 mb-2">Iniciar Sesión</h1>
			<p class="text-gray-600">Bienvenido de vuelta a Domify</p>
		</div>

		{#if error}
			<div class="error-message mb-4">
				{error}
			</div>
		{/if}

		<form on:submit|preventDefault={handleLogin} class="space-y-6 mb-6">
			<div>
				<label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					placeholder="tu@email.com"
					required
					disabled={loading}
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
				/>
			</div>

			<div>
				<label for="password" class="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					placeholder="Tu contraseña"
					required
					disabled={loading}
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
				/>
			</div>

			<button type="submit" class="btn-primary w-full" disabled={loading}>
				{loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
			</button>
		</form>

		<div class="relative my-6">
			<div class="absolute inset-0 flex items-center">
				<div class="w-full border-t border-gray-300"></div>
			</div>
			<div class="relative flex justify-center text-sm">
				<span class="bg-white px-3 text-gray-500">o</span>
			</div>
		</div>

		<div class="space-y-3 mb-6">
			<button 
				class="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
				on:click={handleSignInWithGoogle} 
				disabled={loading}
			>
				<svg width="20" height="20" viewBox="0 0 24 24">
					<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
					<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
					<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
					<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
				</svg>
				Continuar con Google
			</button>

			<button 
				class="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
				on:click={handleSignInWithFacebook} 
				disabled={loading}
			>
				<svg width="20" height="20" viewBox="0 0 24 24">
					<path fill="#1877F3" d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/>
				</svg>
				Continuar con Facebook
			</button>
		</div>

		<div class="text-center space-y-2">
			<p class="text-sm text-gray-600">
				¿No tienes cuenta? 
				<a href="/auth/signup" class="text-primary-600 hover:text-primary-500 font-medium transition-colors duration-200">
					Regístrate
				</a>
			</p>
			<p class="text-sm">
				<a href="/auth/reset-password" class="text-primary-600 hover:text-primary-500 font-medium transition-colors duration-200">
					¿Olvidaste tu contraseña?
				</a>
			</p>
		</div>
	</div>
</div>

<!-- CSS convertido a clases de Tailwind --> 