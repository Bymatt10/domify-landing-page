<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';
	import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-svelte';

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
				await invalidateAll();
				
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
			return 'Tu cuenta aún no está confirmada. Por favor verifica tu bandeja de entrada o contacta a soporte.';
		}
		if (message.includes('Too many requests')) {
			return 'Demasiados intentos. Por favor espera un momento';
		}
		return message;
	}
</script>

<div class="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden font-inter py-12 px-4 sm:px-6 lg:px-8">
	<!-- Background Elements -->
	<div class="absolute inset-0 z-0">
		<div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGg0MHY0MEgwVjB6bTIwIDIwYzAgMTEuMDQ2LTguOTU0IDIwLTIwIDIwdjFDMTEuNTk4IDQxIDIxIDMxLjU5OCAyMSAyMFYwaC0xdjIweiIgZmlsbD0icmdiYSgwLCAwLCAwLCAwLjAzKSIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+')] opacity-60"></div>
		<div class="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100 rounded-full blur-[120px] opacity-40 -z-10 translate-x-1/4 -translate-y-1/4"></div>
		<div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100 rounded-full blur-[120px] opacity-40 -z-10 -translate-x-1/4 translate-y-1/4"></div>
	</div>

	<div class="max-w-md w-full relative z-10">
		<!-- Brand Logo/Home Link -->
		<div class="text-center mb-10">
			<a href="/" class="inline-flex items-center gap-2 mb-8 group">
				<div class="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
					<span class="text-white font-outfit font-bold text-2xl">D</span>
				</div>
				<span class="text-2xl font-bold text-slate-900 font-outfit tracking-tight">Domify</span>
			</a>
			<h1 class="text-4xl font-bold text-slate-900 mb-3 font-outfit tracking-tight">Bienvenido de vuelta</h1>
			<p class="text-slate-500 font-light">Gestiona tus servicios y profesionales hoy mismo.</p>
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

			<form on:submit|preventDefault={handleLogin} class="space-y-6">
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
							class="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-slate-800 font-outfit disabled:opacity-50"
						/>
					</div>
				</div>

				<!-- Password Field -->
				<div class="space-y-2">
					<div class="flex items-center justify-between ml-1">
						<label for="password" class="block text-sm font-semibold text-slate-700 font-outfit">Contraseña</label>
						<a href="/auth/reset-password" class="text-xs font-semibold text-blue-600 hover:text-blue-700 font-outfit">¿Olvidaste tu contraseña?</a>
					</div>
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
							class="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-slate-800 font-outfit disabled:opacity-50"
						/>
						<button
							type="button"
							on:click={() => showPassword = !showPassword}
							class="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
						>
							{#if showPassword}
								<EyeOff size={18} />
							{:else}
								<Eye size={18} />
							{/if}
						</button>
					</div>
				</div>

				<!-- Submit Button -->
				<button 
					type="submit" 
					disabled={loading}
					class="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-xl hover:shadow-slate-900/20 disabled:opacity-50 disabled:cursor-wait font-outfit flex items-center justify-center gap-2 group"
				>
					{#if loading}
						<svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						Iniciando sesión...
					{:else}
						Ingresar a mi cuenta
						<ArrowRight size={18} class="group-hover:translate-x-1 transition-transform" />
					{/if}
				</button>
			</form>

			<div class="mt-8 pt-8 border-t border-slate-100 text-center">
				<p class="text-slate-600 text-sm">
					¿No tienes una cuenta aún? 
					<a href="/auth/signup" class="text-blue-600 font-bold hover:underline decoration-2 underline-offset-4 ml-1">Crea una gratis</a>
				</p>
			</div>
		</div>

		<!-- Trust Footer -->
		<div class="mt-8 flex items-center justify-center gap-4 opacity-50">
			<div class="flex items-center gap-1.5 grayscale">
				<ShieldCheck size={16} />
				<span class="text-xs font-medium uppercase tracking-widest font-outfit">Sesión Segura</span>
			</div>
			<div class="h-1 w-1 bg-slate-300 rounded-full"></div>
			<span class="text-xs font-medium uppercase tracking-widest font-outfit">Domify © 2026</span>
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
</style> 