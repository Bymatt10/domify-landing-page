<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';
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

	// Extract data from server
	$: session = data?.session;
	$: user = data?.user;
	$: isProvider = data?.isProvider || false;
	$: isAdmin = data?.isAdmin || false;
	$: providerProfile = data?.providerProfile;

	// Debug: Log when isProvider changes
	$: if (browser) {
		// Debug logging removed
	}

	// Guardar el valor anterior de isAdmin
	let prevIsAdmin = isAdmin;

	// Reaccionar a cambios en isAdmin y forzar recarga si cambia
	$: if (browser && isAdmin !== prevIsAdmin) {
		prevIsAdmin = isAdmin;
		invalidateAll();
	}

	// Handle logout
	async function handleLogout() {
		try {
			const { error } = await supabase.auth.signOut();
			if (error) {
				console.error('❌ [Layout] Error during logout:', error);
			} else {
				await invalidateAll();
				goto('/');
			}
		} catch (error) {
			console.error('❌ [Layout] Error during logout:', error);
		}
	}

	onMount(async () => {
		// Inyectar Speed Insights
		injectSpeedInsights();

		// Listen for auth changes
		const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
			if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
				// Refresh the layout data
				await invalidateAll();
			}
		});

		// Cleanup listener on component destroy
		return () => {
			authListener?.subscription?.unsubscribe();
		};
	});
</script>

<svelte:head>
	<title>Domify - Marketplace de Servicios Profesionales en Nicaragua</title>
	<meta name="description" content="Encuentra y contrata los mejores proveedores de servicios profesionales en Nicaragua. Limpieza, jardinería, montaje, electricistas y más. Servicios verificados con garantía de calidad." />
	<meta name="keywords" content="servicios profesionales, Nicaragua, domify, limpieza, jardinería, montaje, electricistas, fontaneros, construcción, pintura, mudanzas, carpintería, tecnología, seguridad, albañilería" />
	<meta name="author" content="Domify" />
	<meta name="robots" content="index, follow" />
	<meta name="geo.region" content="NI" />
	<meta name="geo.placename" content="Nicaragua" />
	
	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://domify.app" />
	<meta property="og:title" content="Domify - Marketplace de Servicios Profesionales en Nicaragua" />
	<meta property="og:description" content="Encuentra y contrata los mejores proveedores de servicios profesionales en Nicaragua. Servicios verificados con garantía de calidad." />
	<meta property="og:image" content="https://domify.app/icon-domify.png" />
	<meta property="og:site_name" content="Domify" />
	<meta property="og:locale" content="es_NI" />
	
	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content="https://domify.app" />
	<meta name="twitter:title" content="Domify - Marketplace de Servicios Profesionales en Nicaragua" />
	<meta name="twitter:description" content="Encuentra y contrata los mejores proveedores de servicios profesionales en Nicaragua. Servicios verificados con garantía de calidad." />
	<meta name="twitter:image" content="https://domify.app/icon-domify.png" />
	<meta name="twitter:site" content="@domify_app" />
	<meta name="twitter:creator" content="@domify_app" />
	<meta name="twitter:image:alt" content="Domify - Marketplace de Servicios Profesionales en Nicaragua" />
	
	<!-- Facebook específico -->
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="Domify - Marketplace de Servicios Profesionales en Nicaragua" />
	<meta property="og:image:type" content="image/png" />
	<meta property="og:image:secure_url" content="https://domify.app/icon-domify.png" />
	
	<!-- WhatsApp específico -->
	<meta property="og:image:type" content="image/png" />
	<meta property="og:image:secure_url" content="https://domify.app/icon-domify.png" />
	
	<!-- Reddit específico -->
	<meta name="reddit:title" content="Domify - Marketplace de Servicios Profesionales en Nicaragua" />
	<meta name="reddit:description" content="Encuentra y contrata los mejores proveedores de servicios profesionales en Nicaragua. Servicios verificados con garantía de calidad." />
	<meta name="reddit:image" content="https://domify.app/icon-domify.png" />
	
	<!-- LinkedIn específico -->
	<meta property="og:image" content="https://domify.app/icon-domify.png" />
	<meta property="og:title" content="Domify - Marketplace de Servicios Profesionales en Nicaragua" />
	<meta property="og:description" content="Encuentra y contrata los mejores proveedores de servicios profesionales en Nicaragua. Servicios verificados con garantía de calidad." />
	
	<!-- Canonical URL -->
	<link rel="canonical" href="https://domify.app" />
	
	<!-- Structured Data -->
	<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "WebSite",
			"name": "Domify",
			"url": "https://domify.app",
			"description": "Marketplace de servicios profesionales en Nicaragua. Conecta con proveedores verificados de limpieza, jardinería, montaje y más.",
			"potentialAction": {
				"@type": "SearchAction",
				"target": "https://domify.app/services?search={search_term_string}",
				"query-input": "required name=search_term_string"
			}
		}
	</script>
</svelte:head>

<div class="flex flex-col min-h-screen bg-gray-50">
	<Navbar {session} {user} {isProvider} {isAdmin} {handleLogout} />
	<main class="flex-1 w-full bg-gray-50">
		<slot />
	</main>
	<NotificationContainer />
	<footer class="bg-primary-600 text-white py-12 border-t border-gray-200">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="grid grid-cols-1 md:grid-cols-4 gap-8">
				<div>
					<h3 class="text-lg font-semibold mb-4">Domify</h3>
					<p class="text-primary-100">
						Conectando proveedores de servicios con clientes en Nicaragua.
					</p>
				</div>
				<div>
					<h4 class="text-md font-medium mb-3">Servicios</h4>
					<ul class="space-y-2 text-primary-100">
						<li><a href="/services" class="hover:text-white transition-colors">Explorar servicios</a></li>
						<li><a href="/become-provider" class="hover:text-white transition-colors">Ser proveedor</a></li>
					</ul>
				</div>
				<div>
					<h4 class="text-md font-medium mb-3">Soporte</h4>
					<ul class="space-y-2 text-primary-100">
						<li><a href="/contact" class="hover:text-white transition-colors">Contacto</a></li>
						<li><a href="/about" class="hover:text-white transition-colors">Acerca de</a></li>
					</ul>
				</div>
				<div>
					<h4 class="text-md font-medium mb-3">Legal</h4>
					<ul class="space-y-2 text-primary-100">
						<li><a href="/terms" class="hover:text-white transition-colors">Términos</a></li>
						<li><a href="/privacy" class="hover:text-white transition-colors">Privacidad</a></li>
					</ul>
				</div>
			</div>
			<div class="border-t border-primary-500 mt-8 pt-8 text-center text-primary-100">
				<p>&copy; 2025 Domify. Todos los derechos reservados.</p>
			</div>
		</div>
	</footer>
</div>