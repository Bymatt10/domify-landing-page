<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';

	let email = '';
	let password = '';
	let loading = false;
	let error = '';
	let showPassword = false;

	onMount(() => {
		// Check for errors in URL
		const urlError = $page.url.searchParams.get('error');
		if (urlError) {
			const decodedError = decodeURIComponent(urlError);
			error = decodedError;
		}
	});

	async function handleLogin() {
		try {
			loading = true;
			error = '';

			if (!email || !password) {
				error = 'Por favor completa todos los campos';
				return;
			}

			// Iniciando sesión con Supabase...

			const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
				email,
				password
			});

			if (loginError) {
				console.error('❌ Error en login:', loginError);
				error = getErrorMessage(loginError.message);
				return;
			}

			if (loginData.user) {
				// Login exitoso
				
				// Force refresh of all data
				await invalidateAll();
				
				// Redirect based on user role
				const userRole = loginData.user.user_metadata?.role;
				
				if (userRole === 'admin') {
					goto('/admin');
				} else if (userRole === 'provider') {
					goto('/provider');
				} else {
					goto('/');
				}
			}
		} catch (e) {
			console.error('💥 Error inesperado:', e);
			error = e instanceof Error ? e.message : 'Error inesperado durante el inicio de sesión.';
		} finally {
			loading = false;
		}
	}

	function getErrorMessage(message: string): string {
		if (message.includes('Invalid login credentials')) {
			return 'Email o contraseña incorrectos';
		}
		if (message.includes('Email not confirmed')) {
			return 'Por favor confirma tu email antes de iniciar sesión';
		}
		if (message.includes('Too many requests')) {
			return 'Demasiados intentos. Por favor espera un momento';
		}
		return message;
	}
</script>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-700 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full bg-white p-8 rounded-lg shadow-xl">
		<div class="text-center mb-8">
			<h1 class="text-3xl font-bold text-gray-900 mb-2">Iniciar Sesión</h1>
			<p class="text-gray-600">Bienvenido de vuelta a Domify</p>
		</div>

		{#if error}
			<div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
				<p class="text-sm text-red-800">{error}</p>
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
				<div class="relative">
					<input
						id="password"
						type={showPassword ? 'text' : 'password'}
						bind:value={password}
						placeholder="Tu contraseña"
						required
						disabled={loading}
						class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
					/>
					<button
						type="button"
						on:click={() => showPassword = !showPassword}
						class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
						aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
					>
						{#if showPassword}
							<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
							</svg>
						{:else}
							<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
							</svg>
						{/if}
					</button>
				</div>
			</div>

			<button 
				type="submit" 
				disabled={loading}
				class="w-full px-4 py-2 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
			</button>
		</form>

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