<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import Navbar from '$lib/components/Navbar.svelte';
	import NotificationContainer from '$lib/components/NotificationContainer.svelte';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import { browser } from '$app/environment';
	import { 
		Facebook, Twitter, Instagram, Linkedin, 
		Mail, Phone, MapPin, ExternalLink, 
		Heart, ShieldCheck, Globe
	} from 'lucide-svelte';
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

	onMount(() => {
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
	<Navbar {session} {user} {isProvider} {isAdmin} />
	<main class="flex-1 w-full bg-gray-50">
		<slot />
	</main>
	<NotificationContainer />
	<footer class="bg-white border-t border-slate-100 font-inter relative overflow-hidden">
		<!-- Subtle decorative element -->
		<div class="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-[80px] -z-10 translate-x-1/2 -translate-y-1/2"></div>
		
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 relative z-10">
			<!-- Main Footer Content -->
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
				<!-- Brand & Mission -->
				<div class="space-y-6">
					<a href="/" class="flex items-center gap-2 group">
						<div class="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
							<span class="text-white font-outfit font-bold text-xl">D</span>
						</div>
						<span class="text-xl font-bold text-slate-900 font-outfit tracking-tight">Domify</span>
					</a>
					<p class="text-slate-500 text-sm leading-relaxed max-w-xs">
						La plataforma líder en Nicaragua para conectar expertos en servicios del hogar con quienes los necesitan. Excelencia, seguridad y confianza en cada clic.
					</p>
					<div class="flex items-center gap-3">
						<a href="/" class="w-10 h-10 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm">
							<Facebook size={18} />
						</a>
						<a href="/" class="w-10 h-10 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:bg-black hover:text-white hover:border-black transition-all shadow-sm">
							<Twitter size={18} />
						</a>
						<a href="/" class="w-10 h-10 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 hover:text-white hover:border-transparent transition-all shadow-sm">
							<Instagram size={18} />
						</a>
						<a href="/" class="w-10 h-10 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:bg-blue-700 hover:text-white hover:border-blue-700 transition-all shadow-sm">
							<Linkedin size={18} />
						</a>
					</div>
				</div>

				<!-- Quick Links -->
				<div>
					<h3 class="text-slate-900 font-bold font-outfit mb-6 uppercase tracking-wider text-xs">Servicios Populares</h3>
					<ul class="space-y-4">
						<li><a href="/services?category=limpieza" class="text-slate-500 hover:text-blue-600 text-sm transition-colors flex items-center gap-2">Limpieza Residencial</a></li>
						<li><a href="/services?category=electricistas" class="text-slate-500 hover:text-blue-600 text-sm transition-colors flex items-center gap-2">Electricistas Expertos</a></li>
						<li><a href="/services?category=jardineria" class="text-slate-500 hover:text-blue-600 text-sm transition-colors flex items-center gap-2">Mantenimiento de Jardines</a></li>
						<li><a href="/services" class="text-blue-600 font-semibold text-sm hover:underline flex items-center gap-1">Ver todos los servicios <ExternalLink size={12} /></a></li>
					</ul>
				</div>

				<!-- Company -->
				<div>
					<h3 class="text-slate-900 font-bold font-outfit mb-6 uppercase tracking-wider text-xs">Compañía</h3>
					<ul class="space-y-4">
						<li><a href="/about" class="text-slate-500 hover:text-blue-600 text-sm transition-colors">Quiénes somos</a></li>
						<li><a href="/become-provider" class="text-slate-500 hover:text-blue-600 text-sm transition-colors flex items-center gap-2">Ser Proveedor <span class="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded-full font-bold">UNIRSE</span></a></li>
						<li><a href="/contact" class="text-slate-500 hover:text-blue-600 text-sm transition-colors">Contáctanos</a></li>
						<li><a href="/privacy" class="text-slate-500 hover:text-blue-600 text-sm transition-colors">Términos & Privacidad</a></li>
					</ul>
				</div>

				<!-- Contact Info -->
				<div>
					<h3 class="text-slate-900 font-bold font-outfit mb-6 uppercase tracking-wider text-xs">Contacto Directo</h3>
					<ul class="space-y-5">
						<li class="flex items-start gap-4">
							<div class="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
								<Mail size={16} />
							</div>
							<div>
								<span class="block text-slate-400 text-[10px] font-bold uppercase tracking-tight">Soporte</span>
								<a href="mailto:hola@domify.app" class="text-slate-900 text-sm font-medium hover:text-blue-600 transition-colors">hola@domify.app</a>
							</div>
						</li>
						<li class="flex items-start gap-4">
							<div class="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
								<Phone size={16} />
							</div>
							<div>
								<span class="block text-slate-400 text-[10px] font-bold uppercase tracking-tight">Atención</span>
								<a href="tel:+50588888888" class="text-slate-900 text-sm font-medium hover:text-blue-600 transition-colors">+505 8888-8888</a>
							</div>
						</li>
						<li class="flex items-start gap-4">
							<div class="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
								<MapPin size={16} />
							</div>
							<div>
								<span class="block text-slate-400 text-[10px] font-bold uppercase tracking-tight">Ubicación</span>
								<span class="text-slate-900 text-sm font-medium">Managua, Nicaragua</span>
							</div>
						</li>
					</ul>
				</div>
			</div>

			<!-- Bottom Bar -->
			<div class="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
				<div class="flex items-center gap-6">
					<div class="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all cursor-default">
						<ShieldCheck size={16} />
						<span class="text-[10px] font-bold uppercase tracking-widest text-slate-900">Verificado por Domify</span>
					</div>
					<div class="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all cursor-default">
						<Globe size={16} />
						<span class="text-[10px] font-bold uppercase tracking-widest text-slate-900">Nicaragua</span>
					</div>
				</div>

				<p class="text-slate-400 text-[11px] font-medium flex items-center gap-1.5 order-last md:order-none">
					Hecho con <Heart size={12} class="text-red-500 fill-red-500 animate-pulse" /> por <span class="text-slate-900 font-bold">Domify Team</span> © 2026
				</p>

				<div class="flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-slate-400">
					<a href="/terms" class="hover:text-slate-900 transition-colors">Términos</a>
					<a href="/privacy" class="hover:text-slate-900 transition-colors">Seguridad</a>
				</div>
			</div>
		</div>
	</footer>
</div>