<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';

	let email = '';
	let password = '';
	let confirmPassword = '';
	let firstName = '';
	let lastName = '';
	let phone = '';
	let loading = false;
	let error = '';
	let success = '';

	onMount(() => {
		// Check for errors in URL
		const urlError = $page.url.searchParams.get('error');
		if (urlError) {
			const decodedError = decodeURIComponent(urlError);
			error = decodedError;
		}
	});

	async function handleSignup() {
		try {
			loading = true;
			error = '';
			success = '';

			// Validation
			if (!email || !password || !confirmPassword || !firstName || !lastName) {
				error = 'Por favor completa todos los campos obligatorios';
				return;
			}

			if (password !== confirmPassword) {
				error = 'Las contraseñas no coinciden';
				return;
			}

			if (password.length < 6) {
				error = 'La contraseña debe tener al menos 6 caracteres';
				return;
			}

			// Registrando usuario con Supabase...

			const { data: signupData, error: signupError } = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: {
						first_name: firstName,
						last_name: lastName,
						phone: phone || null,
						role: 'customer' // Default role
					}
				}
			});

			if (signupError) {
				console.error('❌ Error en registro:', signupError);
				error = getErrorMessage(signupError.message);
				return;
			}

			if (signupData.user) {
				// Registro exitoso
				
				success = 'Cuenta creada exitosamente. Por favor revisa tu email para confirmar tu cuenta.';
				
				// Clear form
				email = '';
				password = '';
				confirmPassword = '';
				firstName = '';
				lastName = '';
				phone = '';
			}
		} catch (e) {
			console.error('💥 Error inesperado:', e);
			error = e instanceof Error ? e.message : 'Error inesperado durante el registro.';
		} finally {
			loading = false;
		}
	}

	function getErrorMessage(message: string): string {
		if (message.includes('User already registered')) {
			return 'Ya existe una cuenta con este email';
		}
		if (message.includes('Password should be at least')) {
			return 'La contraseña debe tener al menos 6 caracteres';
		}
		if (message.includes('Invalid email')) {
			return 'Por favor ingresa un email válido';
		}
		return message;
	}
</script>

<svelte:head>
	<title>Registro - Domify</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-700 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full bg-white p-8 rounded-lg shadow-xl">
		<div class="text-center mb-8">
			<h1 class="text-3xl font-bold text-gray-900 mb-2">Crear Cuenta</h1>
			<p class="text-gray-600">Únete a Domify y encuentra los mejores servicios</p>
		</div>

		{#if error}
			<div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
				<p class="text-sm text-red-800">{error}</p>
			</div>
		{/if}

		{#if success}
			<div class="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
				<p class="text-sm text-green-800">{success}</p>
			</div>
		{/if}

		<form on:submit|preventDefault={handleSignup} class="space-y-4 mb-6">
			<div class="grid grid-cols-2 gap-4">
				<div>
					<label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
					<input
						id="firstName"
						type="text"
						bind:value={firstName}
						placeholder="Tu nombre"
						required
						disabled={loading}
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
					/>
				</div>

				<div>
					<label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
					<input
						id="lastName"
						type="text"
						bind:value={lastName}
						placeholder="Tu apellido"
						required
						disabled={loading}
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
					/>
				</div>
			</div>

			<div>
				<label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
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
				<label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
				<input
					id="phone"
					type="tel"
					bind:value={phone}
					placeholder="+505 8888-9999"
					disabled={loading}
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
				/>
			</div>

			<div>
				<label for="password" class="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					placeholder="Mínimo 6 caracteres"
					required
					disabled={loading}
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
				/>
			</div>

			<div>
				<label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña *</label>
				<input
					id="confirmPassword"
					type="password"
					bind:value={confirmPassword}
					placeholder="Repite tu contraseña"
					required
					disabled={loading}
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
				/>
			</div>

			<button 
				type="submit" 
				disabled={loading}
				class="w-full px-4 py-2 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{loading ? 'Creando cuenta...' : 'Crear Cuenta'}
			</button>
		</form>

		<div class="text-center space-y-2">
			<p class="text-sm text-gray-600">
				¿Ya tienes cuenta? 
				<a href="/auth/login" class="text-primary-600 hover:text-primary-500 font-medium transition-colors duration-200">
					Inicia sesión
				</a>
			</p>
			<p class="text-xs text-gray-500">
				Al crear una cuenta aceptas nuestros 
				<a href="/terms" class="text-primary-600 hover:text-primary-500">Términos de Servicio</a>
				y 
				<a href="/privacy" class="text-primary-600 hover:text-primary-500">Política de Privacidad</a>
			</p>
		</div>
	</div>
</div>