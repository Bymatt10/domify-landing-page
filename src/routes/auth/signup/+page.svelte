<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import { handleEmailConfirmationError } from '$lib/auth-helpers';

	let email = '';
	let password = '';
	let confirmPassword = '';
	let firstName = '';
	let lastName = '';
	let loading = false;
	let error = '';
	let success = '';

	async function handleSignup() {
		try {
			loading = true;
			error = '';
			success = '';

			// Validations
			if (password !== confirmPassword) {
				error = 'Las contraseñas no coinciden';
				return;
			}

			if (password.length < 6) {
				error = 'La contraseña debe tener al menos 6 caracteres';
				return;
			}

			// Create marketplace user first with provider role as default
			const { data: marketplaceUser, error: marketplaceError } = await supabase
				.from('users')
				.insert({
					email: email,
					password: 'temp_password', // Will be updated by auth
					role: 'provider' // Always default to provider
				})
				.select()
				.single();

			if (marketplaceError) {
				error = `Error creando perfil: ${marketplaceError.message}`;
				return;
			}

			// Create customer profile
			const { error: customerError } = await supabase
				.from('customers')
				.insert({
					user_id: marketplaceUser.id,
					first_name: firstName,
					last_name: lastName
				});

			if (customerError) {
				console.log('Customer creation error:', customerError);
			}

			// Now sign up with Supabase Auth
			const { data, error: signupError } = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: {
						first_name: firstName,
						last_name: lastName,
						marketplace_user_id: marketplaceUser.id,
						role: 'provider' // Ensure role is set in auth metadata too
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

		<div class="auth-links">
			<p>¿Ya tienes cuenta? <a href="/auth/login">Inicia Sesión</a></p>
		</div>
	</div>
</div>

<style>
	.auth-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 1rem;
	}

	.auth-card {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
		width: 100%;
		max-width: 450px;
	}

	h1 {
		text-align: center;
		margin-bottom: 0.5rem;
		color: #333;
		font-size: 2rem;
		font-weight: 700;
	}

	.subtitle {
		text-align: center;
		color: #666;
		margin-bottom: 2rem;
	}

	.error-message {
		background: #fee;
		color: #c33;
		padding: 0.75rem;
		border-radius: 6px;
		margin-bottom: 1rem;
		border: 1px solid #fcc;
	}

	.success-message {
		background: #efe;
		color: #363;
		padding: 0.75rem;
		border-radius: 6px;
		margin-bottom: 1rem;
		border: 1px solid #cfc;
	}

	.auth-form {
		margin-bottom: 1.5rem;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-row .form-group {
		margin-bottom: 0;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		color: #333;
		font-weight: 500;
	}

	input {
		width: 100%;
		padding: 0.75rem;
		border: 2px solid #e1e5e9;
		border-radius: 6px;
		font-size: 1rem;
		transition: border-color 0.2s;
		box-sizing: border-box;
	}

	input:focus {
		outline: none;
		border-color: #667eea;
	}

	input:disabled {
		background: #f5f5f5;
		cursor: not-allowed;
	}

	.btn-primary {
		width: 100%;
		padding: 0.75rem;
		background: #667eea;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s;
	}

	.btn-primary:hover:not(:disabled) {
		background: #5a6fd8;
	}

	.btn-primary:disabled {
		background: #ccc;
		cursor: not-allowed;
	}

	.divider {
		text-align: center;
		margin: 1.5rem 0;
		position: relative;
	}

	.divider::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 0;
		right: 0;
		height: 1px;
		background: #e1e5e9;
	}

	.divider span {
		background: white;
		padding: 0 1rem;
		color: #666;
	}

	.btn-google {
		width: 100%;
		padding: 0.75rem;
		background: white;
		color: #333;
		border: 2px solid #e1e5e9;
		border-radius: 6px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: border-color 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}

	.btn-google:hover:not(:disabled) {
		border-color: #ccc;
	}

	.btn-google:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.auth-links {
		text-align: center;
	}

	.auth-links p {
		margin: 0.5rem 0;
		color: #666;
	}

	.auth-links a {
		color: #667eea;
		text-decoration: none;
		font-weight: 500;
	}

	.auth-links a:hover {
		text-decoration: underline;
	}
</style> 