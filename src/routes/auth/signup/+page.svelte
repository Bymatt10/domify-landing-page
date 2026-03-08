<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';
	import { 
		User, Mail, Phone, Lock, Eye, EyeOff, 
		ArrowRight, ShieldCheck, CheckCircle2 
	} from 'lucide-svelte';

	let email = '';
	let password = '';
	let confirmPassword = '';
	let firstName = '';
	let lastName = '';
	let phone = '';
	let loading = false;
	let error = '';
	let success = '';
	let showPassword = false;
	let showConfirmPassword = false;

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
				success = '¡Cuenta creada! Por favor revisa tu email para confirmar tu registro.';
				
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

<div class="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden font-inter py-12 px-4 sm:px-6 lg:px-8">
	<!-- Background Elements -->
	<div class="absolute inset-0 z-0">
		<div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGg0MHY0MEgwVjB6bTIwIDIwYzAgMTEuMDQ2LTguOTU0IDIwLTIwIDIwdjFDMTEuNTk4IDQxIDIxIDMxLjU5OCAyMSAyMFYwaC0xdjIweiIgZmlsbD0icmdiYSgwLCAwLCAwLCAwLjAzKSIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+')] opacity-60"></div>
		<div class="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100 rounded-full blur-[120px] opacity-40 -z-10 translate-x-1/4 -translate-y-1/4"></div>
		<div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100 rounded-full blur-[120px] opacity-40 -z-10 -translate-x-1/4 translate-y-1/4"></div>
	</div>

	<div class="max-w-xl w-full relative z-10">
		<!-- Brand Logo/Home Link -->
		<div class="text-center mb-8">
			<a href="/" class="inline-flex items-center gap-2 mb-6 group">
				<div class="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
					<span class="text-white font-outfit font-bold text-2xl">D</span>
				</div>
				<span class="text-2xl font-bold text-slate-900 font-outfit tracking-tight">Domify</span>
			</a>
			<h1 class="text-4xl font-bold text-slate-900 mb-2 font-outfit tracking-tight">Crea tu cuenta</h1>
			<p class="text-slate-500 font-light">Únete a la red de servicios más confiable de Nicaragua.</p>
		</div>

		<div class="bg-white/80 backdrop-blur-xl p-8 lg:p-10 rounded-[2.5rem] shadow-2xl border border-white">
			{#if error}
				<div class="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-shake">
					<div class="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
						<span class="text-red-600 text-xs font-bold font-outfit">!</span>
					</div>
					<p class="text-sm text-red-700 font-medium">{error}</p>
				</div>
			{/if}

			{#if success}
				<div class="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3 animate-fade-in">
					<div class="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
						<CheckCircle2 size={14} class="text-emerald-600" />
					</div>
					<p class="text-sm text-emerald-700 font-medium">{success}</p>
				</div>
			{/if}

			<form on:submit|preventDefault={handleSignup} class="space-y-5">
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
					<!-- Name Field -->
					<div class="space-y-2">
						<label for="firstName" class="block text-sm font-semibold text-slate-700 font-outfit ml-1">Nombre</label>
						<div class="relative group">
							<div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
								<User size={18} class="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
							</div>
							<input
								id="firstName"
								type="text"
								bind:value={firstName}
								placeholder="Tu nombre"
								required
								disabled={loading}
								class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-slate-800 font-outfit disabled:opacity-50"
							/>
						</div>
					</div>

					<!-- Last Name Field -->
					<div class="space-y-2">
						<label for="lastName" class="block text-sm font-semibold text-slate-700 font-outfit ml-1">Apellido</label>
						<div class="relative group">
							<div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
								<User size={18} class="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
							</div>
							<input
								id="lastName"
								type="text"
								bind:value={lastName}
								placeholder="Tu apellido"
								required
								disabled={loading}
								class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-slate-800 font-outfit disabled:opacity-50"
							/>
						</div>
					</div>
				</div>

				<!-- Email Field -->
				<div class="space-y-2">
					<label for="email" class="block text-sm font-semibold text-slate-700 font-outfit ml-1">Correo Electrónico</label>
					<div class="relative group">
						<div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
							<Mail size={18} class="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
						</div>
						<input
							id="email"
							type="email"
							bind:value={email}
							placeholder="ejemplo@domify.com"
							required
							disabled={loading}
							class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-slate-800 font-outfit disabled:opacity-50"
						/>
					</div>
				</div>

				<!-- Phone Field -->
				<div class="space-y-2">
					<label for="phone" class="block text-sm font-semibold text-slate-700 font-outfit ml-1">Teléfono (Opcional)</label>
					<div class="relative group">
						<div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
							<Phone size={18} class="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
						</div>
						<input
							id="phone"
							type="tel"
							bind:value={phone}
							placeholder="+505 8888-8888"
							disabled={loading}
							class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-slate-800 font-outfit disabled:opacity-50"
						/>
					</div>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
					<!-- Password Field -->
					<div class="space-y-2">
						<label for="password" class="block text-sm font-semibold text-slate-700 font-outfit ml-1">Contraseña</label>
						<div class="relative group">
							<div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
								<Lock size={18} class="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
							</div>
							<input
								id="password"
								type={showPassword ? 'text' : 'password'}
								bind:value={password}
								placeholder="••••••••"
								required
								disabled={loading}
								class="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-slate-800 font-outfit disabled:opacity-50"
							/>
							<button
								type="button"
								on:click={() => showPassword = !showPassword}
								class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
							>
								{#if showPassword}
									<EyeOff size={16} />
								{:else}
									<Eye size={16} />
								{/if}
							</button>
						</div>
					</div>

					<!-- Confirm Password Field -->
					<div class="space-y-2">
						<label for="confirmPassword" class="block text-sm font-semibold text-slate-700 font-outfit ml-1">Confirmar</label>
						<div class="relative group">
							<div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
								<Lock size={18} class="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
							</div>
							<input
								id="confirmPassword"
								type={showConfirmPassword ? 'text' : 'password'}
								bind:value={confirmPassword}
								placeholder="••••••••"
								required
								disabled={loading}
								class="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-slate-800 font-outfit disabled:opacity-50"
							/>
							<button
								type="button"
								on:click={() => showConfirmPassword = !showConfirmPassword}
								class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
							>
								{#if showConfirmPassword}
									<EyeOff size={16} />
								{:else}
									<Eye size={16} />
								{/if}
							</button>
						</div>
					</div>
				</div>

				<!-- Submit Button -->
				<button 
					type="submit" 
					disabled={loading}
					class="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-xl hover:shadow-slate-900/20 disabled:opacity-50 disabled:cursor-wait font-outfit flex items-center justify-center gap-2 group mt-4"
				>
					{#if loading}
						<svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						Creando tu cuenta...
					{:else}
						Empezar ahora gratis
						<ArrowRight size={18} class="group-hover:translate-x-1 transition-transform" />
					{/if}
				</button>
			</form>

			<div class="mt-8 pt-8 border-t border-slate-100 text-center">
				<p class="text-slate-600 text-sm">
					¿Ya tienes una cuenta? 
					<a href="/auth/login" class="text-blue-600 font-bold hover:underline decoration-2 underline-offset-4 ml-1">Inicia sesión</a>
				</p>
			</div>
		</div>

		<!-- Footer Links -->
		<div class="mt-8 text-center space-y-4">
			<p class="text-[10px] uppercase tracking-widest font-bold text-slate-400">
				Al registrarte, aceptas nuestros 
				<a href="/terms" class="text-slate-600 hover:text-slate-900 mx-1">Términos</a>
				y 
				<a href="/privacy" class="text-slate-600 hover:text-slate-900 ml-1">Privacidad</a>
			</p>
			
			<div class="flex items-center justify-center gap-4 opacity-40">
				<div class="flex items-center gap-1.5 grayscale">
					<ShieldCheck size={14} />
					<span class="text-[10px] font-bold uppercase tracking-widest font-outfit">Protección de Datos</span>
				</div>
				<div class="h-1 w-1 bg-slate-300 rounded-full"></div>
				<span class="text-[10px] font-bold uppercase tracking-widest font-outfit">Domify © 2026</span>
			</div>
		</div>
	</div>
</div>

<style>
	@keyframes shake {
		0%, 100% { transform: translateX(0); }
		25% { transform: translateX(-4px); }
		75% { transform: translateX(4px); }
	}
	.animate-shake {
		animation: shake 0.4s ease-in-out;
	}
	@keyframes fade-in {
		from { opacity: 0; transform: translateY(10px); }
		to { opacity: 1; transform: translateY(0); }
	}
	.animate-fade-in {
		animation: fade-in 0.3s ease-out forwards;
	}
</style>