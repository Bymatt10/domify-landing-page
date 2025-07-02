<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { supabase } from '$lib/supabase';
	import Navbar from '$lib/components/Navbar.svelte';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import '../app.css';

	export let data: any;

	let { session, user, isProvider, isAdmin } = data;
	$: ({ session, user, isProvider, isAdmin } = data);

	onMount(() => {
		// Inyectar Speed Insights
		injectSpeedInsights();

		const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidateAll();
			}
		});

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
	<footer class="bg-primary-600 text-white py-12 border-t border-gray-200">
		<div class="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
			<div class="flex flex-col gap-4">
				<h3 class="text-2xl font-bold text-white">Domify</h3>
				<p class="text-white/90 leading-relaxed">Conectando personas con los mejores servicios locales.</p>
			</div>
			<div class="flex flex-col gap-4">
				<h4 class="text-lg font-semibold text-white">Servicios</h4>
				<a href="/services/cleaning" class="text-white/80 hover:text-yellow-400 hover:translate-x-1 transition-all duration-200 font-medium">Limpieza</a>
				<a href="/services/moving" class="text-white/80 hover:text-yellow-400 hover:translate-x-1 transition-all duration-200 font-medium">Mudanza</a>
				<a href="/services/gardening" class="text-white/80 hover:text-yellow-400 hover:translate-x-1 transition-all duration-200 font-medium">Jardinería</a>
				<a href="/services/assembly" class="text-white/80 hover:text-yellow-400 hover:translate-x-1 transition-all duration-200 font-medium">Ensamblaje</a>
				<a href="/services/mounting" class="text-white/80 hover:text-yellow-400 hover:translate-x-1 transition-all duration-200 font-medium">Montaje</a>
			</div>
			<div class="flex flex-col gap-4">
				<h4 class="text-lg font-semibold text-white">Compañía</h4>
				<a href="/about" class="text-white/80 hover:text-yellow-400 hover:translate-x-1 transition-all duration-200 font-medium">Sobre Nosotros</a>
				<a href="/contact" class="text-white/80 hover:text-yellow-400 hover:translate-x-1 transition-all duration-200 font-medium">Contacto</a>
				<a href="/privacy" class="text-white/80 hover:text-yellow-400 hover:translate-x-1 transition-all duration-200 font-medium">Privacidad</a>
				<a href="/terms" class="text-white/80 hover:text-yellow-400 hover:translate-x-1 transition-all duration-200 font-medium">Términos</a>
			</div>
			<div class="flex flex-col gap-4">
				<h4 class="text-lg font-semibold text-white">Síguenos</h4>
				<div class="flex gap-4">
					<a href="https://facebook.com/domifyy" target="_blank" rel="noopener noreferrer" aria-label="Síguenos en Facebook" class="text-white/80 hover:text-yellow-400 hover:-translate-y-1 transition-all duration-200 p-2 rounded-md hover:bg-white/10">Facebook</a>
					<a href="https://twitter.com/domify" target="_blank" rel="noopener noreferrer" aria-label="Síguenos en Twitter" class="text-white/80 hover:text-yellow-400 hover:-translate-y-1 transition-all duration-200 p-2 rounded-md hover:bg-white/10">Twitter</a>
					<a href="https://instagram.com/domify" target="_blank" rel="noopener noreferrer" aria-label="Síguenos en Instagram" class="text-white/80 hover:text-yellow-400 hover:-translate-y-1 transition-all duration-200 p-2 rounded-md hover:bg-white/10">Instagram</a>
				</div>
			</div>
		</div>
		<div class="max-w-7xl mx-auto mt-8 pt-6 px-6 border-t border-white/10 text-center">
			<p class="text-white/70 text-sm">&copy; 2025 Domify. Todos los derechos reservados.</p>
		</div>
	</footer>
</div>

 