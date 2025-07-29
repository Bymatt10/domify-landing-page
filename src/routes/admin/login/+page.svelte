<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { cleanPKCEState } from '$lib/auth';

	let email = '';
	let password = '';
	let loading = false;
	let error = '';

	// Esta variable viene desde el `load` de la página.
	export let data;
	let { formError } = data;

	onMount(() => {
		if (formError) {
			error = formError;
		}
	});

	async function handleAdminLogin() {
		try {
			loading = true;
			error = '';

			const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
				email,
				password
			});

			if (loginError) {
				error = loginError.message;
				return;
			}

			if (loginData.user) {
				// Después del login, verificamos el rol del usuario desde auth.users
				const userRole = loginData.user.user_metadata?.role;

				if (userRole === 'admin') {
					// Si es admin, lo redirigimos al dashboard de admin
					window.location.href = '/admin';
				} else {
					// Si no es admin, mostramos error y cerramos sesión
					error = 'Acceso denegado. No tienes permisos de administrador.';
					await supabase.auth.signOut();
				}
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Error inesperado durante el inicio de sesión.';
		} finally {
			loading = false;
		}
	}

	async function handleSignInWithGoogle() {
		try {
			loading = true;
			error = '';

			// Clean any existing PKCE state before starting new OAuth flow
			cleanPKCEState();

			// Use current environment URL for redirect
			const currentUrl = window.location.origin;
			const redirectUrl = `${currentUrl}/auth/callback?next=/admin`;

			// Al iniciar desde el panel de admin, nos aseguramos de que el callback
			// nos devuelva aquí para ser validados por el guardián del layout.
			const { data, error: googleError } = await supabase.auth.signInWithOAuth({
				provider: 'google',
				
				options: {
					redirectTo: redirectUrl
				}
			});

			if (googleError) {
				// Handle specific PKCE errors
				if (googleError.message.includes('code challenge') || googleError.message.includes('code verifier')) {
					error = 'Error de autenticación. Por favor, intenta de nuevo.';
					// Clean state and suggest retry
					cleanPKCEState();
				} else {
					error = googleError.message;
				}
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Error inesperado.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Admin Login - Domify</title>
</svelte:head>

<div class="auth-container">
	<div class="auth-card">
		<h1>Acceso de Administrador</h1>
		<p class="subtitle">Ingresa tus credenciales para administrar Domify</p>

		{#if error}
			<div class="error-message">
				{error}
			</div>
		{/if}

		<form on:submit|preventDefault={handleAdminLogin} class="auth-form">
			<div class="form-group">
				<label for="email">Email</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					placeholder="admin@email.com"
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
					placeholder="Tu contraseña"
					required
					disabled={loading}
				/>
			</div>

			<button type="submit" class="btn-primary" disabled={loading}>
				{loading ? 'Ingresando...' : 'Iniciar Sesión'}
			</button>
		</form>

		<div class="divider">
			<span>o</span>
		</div>

		<button class="btn-google" on:click={handleSignInWithGoogle} disabled={loading}>
			<svg width="20" height="20" viewBox="0 0 24 24">
				<path
					fill="#4285F4"
					d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
				/>
				<path
					fill="#34A853"
					d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
				/>
				<path
					fill="#FBBC05"
					d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
				/>
				<path
					fill="#EA4335"
					d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
				/>
			</svg>
			Continuar con Google
		</button>
	</div>
</div>

<style>
	/* Estilos copiados del login normal para consistencia visual */
	.auth-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #1a202c; /* Un fondo oscuro para la sección de admin */
	}

	.auth-card {
		background: var(--color-background-white);
		padding: 2.5rem;
		border-radius: var(--border-radius-lg);
		box-shadow: var(--shadow-lg);
		width: 100%;
		max-width: 400px;
		border-top: 4px solid var(--color-primary);
	}

	h1 {
		text-align: center;
		margin-bottom: 0.5rem;
		color: var(--color-text);
		font-size: 1.75rem;
		font-weight: 700;
	}

	.subtitle {
		text-align: center;
		color: var(--color-text-light);
		margin-bottom: 2rem;
	}

	.error-message {
		background: #fee;
		color: #c33;
		padding: 0.75rem;
		border-radius: var(--border-radius-sm);
		margin-bottom: 1.5rem;
		border: 1px solid #fcc;
		text-align: center;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		color: var(--color-text);
		font-weight: 500;
	}

	input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #e1e5e9;
		border-radius: var(--border-radius-sm);
		font-size: 1rem;
		transition: border-color 0.2s;
		box-sizing: border-box;
	}

	input:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
	}

	.btn-primary {
		width: 100%;
		padding: 0.85rem;
		background: var(--color-primary);
		color: var(--color-text-white);
		border: none;
		border-radius: var(--border-radius-sm);
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s;
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--color-primary-hover);
	}

	.btn-primary:disabled {
		background: #ccc;
		cursor: not-allowed;
	}

	.divider {
		text-align: center;
		margin: 1.5rem 0;
		position: relative;
		color: #ccc;
	}

	.divider::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 0;
		right: 0;
		height: 1px;
		background: #e1e5e9;
		z-index: 0;
	}

	.divider span {
		background: var(--color-background-white);
		padding: 0 1rem;
		position: relative;
		z-index: 1;
		color: var(--color-text-light);
	}

	.btn-google {
		width: 100%;
		padding: 0.75rem;
		background: var(--color-background-white);
		color: var(--color-text);
		border: 1px solid #e1e5e9;
		border-radius: var(--border-radius-sm);
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
	}

	.btn-google:hover:not(:disabled) {
		border-color: #ccc;
		background: #f7f7f7;
	}

	.btn-google:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style> 