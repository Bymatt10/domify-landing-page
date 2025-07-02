<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import { handleEmailConfirmationError } from '$lib/auth-helpers';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let email = '';
	let password = '';
	let confirmPassword = '';
	let firstName = '';
	let lastName = '';
	let loading = false;
	let error = '';
	let success = '';

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

	async function handleSignup() {
		try {
			loading = true;
			error = '';
			success = '';

			// Validate passwords match
			if (password !== confirmPassword) {
				error = 'Las contraseñas no coinciden';
				return;
			}

			// Sign up with Supabase Auth (this will trigger the database trigger to create customer profile)
			const { data, error: signupError } = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: {
						first_name: firstName,
						last_name: lastName,
						role: 'customer' // Default role is now customer
					}
				}
			});

			if (signupError) {
				// Handle email confirmation errors gracefully
				const emailError = handleEmailConfirmationError(signupError);
				if (emailError.isEmailError) {
					success = emailError.message;
					
					// Try to sign in automatically after a short delay
					setTimeout(async () => {
						try {
							const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
								email,
								password
							});
							
							if (signInData.user) {
								goto('/');
							} else {
								// If auto sign-in fails, redirect to login
								setTimeout(() => goto('/auth/login'), 2000);
							}
						} catch (e) {
							console.log('Auto sign-in failed, redirecting to login');
							setTimeout(() => goto('/auth/login'), 2000);
						}
					}, 2000);
				} else {
					error = signupError.message;
				}
				return;
			}

			if (data.user) {
				success = 'Cuenta creada exitosamente. Redirigiendo...';
				
				// Redirect after a short delay
				setTimeout(() => {
					goto('/');
				}, 2000);
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
					redirectTo: `${window.location.origin}/auth/callback`,
					queryParams: {
						access_type: 'offline',
						prompt: 'consent',
					}
				}
			});

			if (googleError) {
				error = googleError.message;
			} else {
				// El usuario será redirigido a Google para autenticación
				// No necesitamos hacer nada más aquí, el callback manejará el resto
				console.log('Redirigiendo a Google OAuth...');
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Error inesperado';
			console.log( ' 111 error con el signup', e);
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

<div class="auth-container">
	<div class="auth-card">
		<h1>Crear Cuenta</h1>
		<p class="subtitle">Únete a la comunidad de Domify</p>

		{#if error}
			<div class="error-message">
				{error}
			</div>
		{/if}

		{#if success}
			<div class="success-message">
				{success}
			</div>
		{/if}

		<form on:submit|preventDefault={handleSignup} class="auth-form">
			<div class="form-row">
				<div class="form-group">
					<label for="firstName">Nombre</label>
					<input
						id="firstName"
						type="text"
						bind:value={firstName}
						placeholder="Tu nombre"
						required
						disabled={loading}
					/>
				</div>

				<div class="form-group">
					<label for="lastName">Apellido</label>
					<input
						id="lastName"
						type="text"
						bind:value={lastName}
						placeholder="Tu apellido"
						required
						disabled={loading}
					/>
				</div>
			</div>

			<div class="form-group">
				<label for="email">Email</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					placeholder="tu@email.com"
					required
					disabled={loading}
				/>
			</div>

			<div class="form-group">
				<label for="password">Contraseña</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					placeholder="Mínimo 6 caracteres"
					required
					disabled={loading}
				/>
			</div>

			<div class="form-group">
				<label for="confirmPassword">Confirmar Contraseña</label>
				<input
					id="confirmPassword"
					type="password"
					bind:value={confirmPassword}
					placeholder="Repite tu contraseña"
					required
					disabled={loading}
				/>
			</div>

			<button type="submit" class="btn-primary" disabled={loading}>
				{loading ? 'Creando cuenta...' : 'Crear Cuenta'}
			</button>
		</form>

		<div class="divider">
			<span>o</span>
		</div>

		<button class="btn-google" on:click={handleSignInWithGoogle} disabled={loading}>
			<svg width="20" height="20" viewBox="0 0 24 24">
				<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
				<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
				<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
				<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
			</svg>
			Continuar con Google
		</button>

		<button class="btn-facebook" on:click={handleSignInWithFacebook} disabled={loading}>
			<svg width="20" height="20" viewBox="0 0 24 24">
				<path fill="#1877F3" d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/>
			</svg>
			Continuar con Facebook
		</button>

		<div class="auth-links">
			<p>¿Ya tienes cuenta? <a href="/auth/login">Inicia Sesión</a></p>
		</div>
	</div>
</div>

