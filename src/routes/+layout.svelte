<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { supabase } from '$lib/supabase';
	import Navbar from '$lib/components/Navbar.svelte';
	import NotificationContainer from '$lib/components/NotificationContainer.svelte';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import { browser } from '$app/environment';
	import '../app.css';

	// Función para manejar eventos de teclado en enlaces (accesibilidad)
	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			(event.currentTarget as HTMLElement).click();
		}
	}

	export let data: any;

	// Ensure boolean values are properly handled
	$: session = data?.session;
	$: user = data?.user;
	$: isProvider = data?.isProvider || user?.user_metadata?.role === 'provider';
	$: isAdmin = data?.isAdmin || user?.user_metadata?.role === 'admin';
	$: providerProfile = data?.providerProfile;

	// Debug: Log when isProvider changes
	$: if (browser) {
		console.log('🔄 [Layout] Estado del proveedor:', {
			isProvider,
			type: typeof isProvider,
			data_isProvider: data?.isProvider,
			data_type: typeof data?.isProvider,
			has_provider_profile: !!providerProfile,
			provider_profile: providerProfile,
			session_exists: !!session,
			user_exists: !!user,
			user_role: user?.user_metadata?.role,
			final_value: isProvider === true
		});
	}

	// Guardar el valor anterior de isAdmin
	let prevIsAdmin = isAdmin;

	// Reaccionar a cambios en isAdmin y forzar recarga si cambia
	$: if (browser && isAdmin !== prevIsAdmin) {
		console.log('🔄 [Layout] Admin status changed, invalidating all');
		prevIsAdmin = isAdmin;
		invalidateAll();
	}

	onMount(() => {
		// Inyectar Speed Insights
		injectSpeedInsights();

		// Verificar el usuario actual usando getUser() que es más seguro
		supabase.auth.getUser().then(({ data: userData, error: userError }) => {
			if (userError) {
				console.error('Error obteniendo usuario autenticado:', userError);
			}
		});

		const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
			// Don't use newSession.user directly to avoid security warning
			if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' || 
			    newSession?.expires_at !== session?.expires_at) {
				console.log('🔄 [Layout] Auth state changed, invalidating all. Event:', event);
				invalidateAll();
			}
		});

		// Check for OAuth success and force a session refresh
		const urlParams = new URLSearchParams(window.location.search);
		if (urlParams.get('oauth_success') === 'true') {
			console.log('🔄 [Layout] OAuth success detected, forcing session refresh');
			setTimeout(() => {
				invalidateAll();
			}, 100);
		}

		return () => {
			subscription.unsubscribe();
		};
	});
</script>

<svelte:head>
	<title>Domify - Marketplace de Servicios</title>
	<meta name="description" content="Conecta con proveedores de servicios locales en Domify" />
</svelte:head>

<div class="flex flex-col min-h-screen bg-gray-50">
	<Navbar {session} {user} {isProvider} {isAdmin} />
	<main class="flex-1 w-full bg-gray-50">
		<slot />
	</main>
	<NotificationContainer />
	<footer class="bg-primary-600 text-white py-12 border-t border-gray-200">
		<div class="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
			<div class="flex flex-col gap-4">
				<h3 class="text-2xl font-bold text-white">Domify</h3>
				<p class="text-white/90 leading-relaxed">Conectando personas con los mejores servicios locales.</p>
			</div>
			<div class="flex flex-col gap-4">
				<h4 class="text-lg font-semibold text-white">Servicios</h4>
				<a href="/services/cleaning" class="text-white/80 hover:text-yellow-400 hover:translate-x-1 transition-all duration-200 font-medium" on:keydown={handleKeyPress} tabindex="0">Limpieza</a>
				<a href="/services/moving" class="text-white/80 hover:text-yellow-400 hover:translate-x-1 transition-all duration-200 font-medium" on:keydown={handleKeyPress} tabindex="0">Mudanza</a>
				<a href="/services/gardening" class="text-white/80 hover:text-yellow-400 hover:translate-x-1 transition-all duration-200 font-medium" on:keydown={handleKeyPress} tabindex="0">Jardinería</a>
				<a href="/services/assembly" class="text-white/80 hover:text-yellow-400 hover:translate-x-1 transition-all duration-200 font-medium" on:keydown={handleKeyPress} tabindex="0">Ensamblaje</a>
				<a href="/services/mounting" class="text-white/80 hover:text-yellow-400 hover:translate-x-1 transition-all duration-200 font-medium" on:keydown={handleKeyPress} tabindex="0">Montaje</a>
			</div>
			<div class="flex flex-col gap-4">
				<h4 class="text-lg font-semibold text-white">Compañía</h4>
				<a href="/about" class="text-white/80 hover:text-yellow-400 hover:translate-x-1 transition-all duration-200 font-medium" on:keydown={handleKeyPress} tabindex="0">Sobre Nosotros</a>
				<a href="/contact" class="text-white/80 hover:text-yellow-400 hover:translate-x-1 transition-all duration-200 font-medium" on:keydown={handleKeyPress} tabindex="0">Contacto</a>
				<a href="/privacy" class="text-white/80 hover:text-yellow-400 hover:translate-x-1 transition-all duration-200 font-medium" on:keydown={handleKeyPress} tabindex="0">Privacidad</a>
				<a href="/terms" class="text-white/80 hover:text-yellow-400 hover:translate-x-1 transition-all duration-200 font-medium" on:keydown={handleKeyPress} tabindex="0">Términos</a>
			</div>
			<div class="flex flex-col gap-4">
				<h4 class="text-lg font-semibold text-white">Síguenos</h4>
				<div class="flex gap-4">
					<a href="https://facebook.com/domifyy" target="_blank" rel="noopener noreferrer" aria-label="Síguenos en Facebook" class="text-white/80 hover:text-yellow-400 hover:-translate-y-1 transition-all duration-200 p-2 rounded-md hover:bg-white/10" on:keydown={handleKeyPress} tabindex="0">Facebook</a>
					<a href="https://twitter.com/domify" target="_blank" rel="noopener noreferrer" aria-label="Síguenos en Twitter" class="text-white/80 hover:text-yellow-400 hover:-translate-y-1 transition-all duration-200 p-2 rounded-md hover:bg-white/10" on:keydown={handleKeyPress} tabindex="0">Twitter</a>
					<a href="https://instagram.com/domify" target="_blank" rel="noopener noreferrer" aria-label="Síguenos en Instagram" class="text-white/80 hover:text-yellow-400 hover:-translate-y-1 transition-all duration-200 p-2 rounded-md hover:bg-white/10" on:keydown={handleKeyPress} tabindex="0">Instagram</a>
				</div>
			</div>
		</div>
		<div class="max-w-7xl mx-auto mt-8 pt-6 px-6 border-t border-white/10 text-center">
			<p class="text-white/70 text-sm">&copy; 2025 Domify. Todos los derechos reservados.</p>
		</div>
	</footer>
</div>

 