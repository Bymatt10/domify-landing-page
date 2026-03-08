<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import SearchBox from '$lib/components/SearchBox.svelte';
	import StatsCard from '$lib/components/StatsCard.svelte';
	import { 
		Zap, Droplets, Leaf, Home, 
		Building2, LayoutGrid, CheckCircle2, 
		ArrowRight, Search, UserCheck, 
		Users, Star, Clock 
	} from 'lucide-svelte';

	export let data: PageData;

	let { session } = data;
	$: ({ session } = data);

	const categories = [
		{ id: 'electricistas', name: 'Electricistas', description: 'Instalaciones y reparaciones eléctricas', icon: Zap, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
		{ id: 'fontaneros', name: 'Fontaneros / Plomeros', description: 'Reparación e instalación de sistemas de agua', icon: Droplets, color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
		{ id: 'jardineria', name: 'Jardinería', description: 'Cuidado y diseño de áreas verdes', icon: Leaf, color: 'text-green-600', bgColor: 'bg-green-50' },
		{ id: 'limpieza-casas', name: 'Limpieza de Casas', description: 'Limpieza general y profunda del hogar', icon: Home, color: 'text-blue-600', bgColor: 'bg-blue-50' }
	];

	const propertyTypes = [
		{
			id: 'houses',
			name: 'Residencial',
			description: 'Servicios integrales para mantener tu hogar en perfectas condiciones.',
			icon: Home,
			services: ['Limpieza profunda', 'Jardinería', 'Mantenimiento', 'Mudanzas']
		},
		{
			id: 'apartments',
			name: 'Apartamentos',
			description: 'Soluciones optimizadas para espacios urbanos y condominios.',
			icon: Building2,
			services: ['Limpieza regular', 'Montaje de muebles', 'Instalaciones', 'Organización']
		},
		{
			id: 'commercial',
			name: 'Corporativo',
			description: 'Mantenimiento preventivo y correctivo para oficinas y plazas comerciales.',
			icon: LayoutGrid,
			services: ['Limpieza comercial', 'Mantenimiento', 'Logística', 'Seguridad']
		}
	];

	const popularSlugs = [
		{ name: 'Electricistas', slug: 'electricistas' },
		{ name: 'Fontaneros', slug: 'fontaneros' },
		{ name: 'Jardinería', slug: 'jardineria' },
		{ name: 'Limpieza', slug: 'limpieza-casas' }
	];

	const slugMap: Record<string, string> = {
		'electricistas': 'electricistas',
		'fontaneros': 'fontaneros',
		'jardineria': 'jardineria',
		'limpieza-casas': 'limpieza-casas'
	};

	function handleCategoryClick(categoryId: string) {
		const slug = slugMap[categoryId] || categoryId;
		goto(`/services/${slug}`);
	}
</script>

<svelte:head>
	<title>Domify - Encuentra Servicios Locales de Confianza</title>
	<meta name="description" content="Domify es el marketplace líder para encontrar y contratar servicios de limpieza, mudanza, jardinería, ensamblaje y más en tu ciudad. Profesionales verificados y soporte 24/7." />
</svelte:head>

<!-- Hero Section -->
<section class="relative bg-slate-50 min-h-screen flex items-center overflow-hidden pt-20">
	<!-- Dynamic Background Elements -->
	<div class="absolute inset-0 z-0">
		<div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGg0MHY0MEgwVjB6bTIwIDIwYzAgMTEuMDQ2LTguOTU0IDIwLTIwIDIwdjFDMTEuNTk4IDQxIDIxIDMxLjU5OCAyMSAyMFYwaC0xdjIweiIgZmlsbD0icmdiYSgwLCAwLCAwLCAwLjAzKSIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+')] opacity-60"></div>
		<div class="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-100 rounded-full blur-[150px] opacity-40 -z-10 translate-x-1/3 -translate-y-1/3"></div>
		<div class="absolute bottom-1/4 left-0 w-[600px] h-[600px] bg-indigo-100 rounded-full blur-[130px] opacity-40 -z-10 -translate-x-1/4"></div>
	</div>
	
	<div class="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20 lg:py-32">
		<div class="max-w-5xl mx-auto text-center">
			<!-- Badge -->
			<div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-slate-200/60 backdrop-blur-md mb-8 shadow-sm animate-fade-in-up">
				<span class="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
				<span class="text-sm font-medium text-slate-700 font-outfit uppercase tracking-wider">Tu hogar en las mejores manos</span>
			</div>

			<!-- Main Heading -->
			<h1 class="text-5xl sm:text-6xl lg:text-8xl font-bold text-slate-900 mb-8 leading-[1.1] font-outfit tracking-tight">
				La forma inteligente de <br class="hidden lg:block"/>
				<span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
					cuidar tu espacio
				</span>
			</h1>
			
			<!-- Subtitle -->
			<p class="text-xl sm:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
				Domify te conecta con los mejores profesionales locales verificados para que disfrutes de tu tiempo libre.
			</p>

			<!-- Search Box Container -->
			<div class="max-w-3xl mx-auto mb-16 relative">
				<div class="relative group">
					<div class="p-2 bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-slate-200/60 shadow-2xl">
						<SearchBox {categories} />
					</div>
				</div>
				
				<!-- Popular Searches -->
				<div class="mt-8 flex flex-wrap justify-center items-center gap-4">
					<span class="text-slate-400 font-medium text-sm font-outfit uppercase tracking-widest">Sugerencias:</span>
					{#each popularSlugs as item}
						<button
							class="px-5 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-2xl text-sm font-medium hover:bg-slate-50 hover:border-blue-400 hover:text-blue-600 transition-all duration-300 shadow-sm font-outfit"
							on:click={() => goto(`/services/${item.slug}`)}
							type="button"
						>
							{item.name}
						</button>
					{/each}
				</div>
			</div>

			<!-- Stats -->
			<div class="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-8 max-w-5xl mx-auto pt-16 border-t border-slate-200/60">
				<div class="p-6 rounded-3xl bg-white/40 border border-slate-100 backdrop-blur-sm">
					<div class="text-3xl lg:text-4xl font-bold text-slate-900 mb-1 font-outfit">500+</div>
					<div class="text-slate-500 text-sm font-medium uppercase tracking-tighter sm:tracking-normal">Expertos Verificados</div>
				</div>
				<div class="p-6 rounded-3xl bg-white/40 border border-slate-100 backdrop-blur-sm">
					<div class="text-3xl lg:text-4xl font-bold text-slate-900 mb-1 font-outfit">2k+</div>
					<div class="text-slate-500 text-sm font-medium uppercase tracking-tighter sm:tracking-normal">Servicios Exitosos</div>
				</div>
				<div class="p-6 rounded-3xl bg-white/40 border border-slate-100 backdrop-blur-sm">
					<div class="text-3xl lg:text-4xl font-bold text-slate-900 mb-1 font-outfit">4.9/5</div>
					<div class="text-slate-500 text-sm font-medium uppercase tracking-tighter sm:tracking-normal">Satisfacción Promedio</div>
				</div>
				<div class="p-6 rounded-3xl bg-white/40 border border-slate-100 backdrop-blur-sm">
					<div class="text-3xl lg:text-4xl font-bold text-slate-900 mb-1 font-outfit">24/7</div>
					<div class="text-slate-500 text-sm font-medium uppercase tracking-tighter sm:tracking-normal">Soporte Continúo</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Services Section (Property Types) -->
<section class="py-24 relative bg-white border-y border-slate-200">
	<div class="container mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center mb-16 lg:mb-20">
			<h2 class="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 font-outfit tracking-tight">
				Soluciones para cada <span class="text-blue-600">necesidad</span>
			</h2>
			<p class="text-lg text-slate-600 max-w-2xl mx-auto font-light leading-relaxed">
				Desde hogares particulares hasta espacios corporativos, tenemos la infraestructura para atenderte.
			</p>
		</div>

		<div class="grid md:grid-cols-3 gap-8 lg:gap-10 max-w-6xl mx-auto">
			{#each propertyTypes as property}
				<div class="group relative bg-slate-50 border border-slate-200 rounded-[2.5rem] p-10 hover:bg-white hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden">
					<div class="absolute -inset-px bg-gradient-to-b from-blue-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md -z-10"></div>
					
					<div class="text-center relative z-10">
						<!-- Icon -->
						<div class="w-20 h-20 bg-white shadow-sm border border-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-8 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
							<svelte:component this={property.icon} size={36} class="text-blue-600" />
						</div>
						
						<h3 class="text-2xl font-bold text-slate-900 mb-4 font-outfit">{property.name}</h3>
						<p class="text-slate-600 mb-8 font-light text-sm leading-relaxed">{property.description}</p>
						
						<!-- Services List -->
						<div class="space-y-3 pt-6 border-t border-slate-200/60">
							{#each property.services as service}
								<div class="flex items-center justify-center text-sm text-slate-700 font-medium">
									<CheckCircle2 size={16} class="text-blue-500 mr-2 shrink-0" />
									{service}
								</div>
							{/each}
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Categories Section -->
<section class="py-24 bg-slate-50 relative overflow-hidden">
    <!-- Decorator -->
    <div class="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-100 rounded-full blur-[80px] pointer-events-none opacity-40"></div>
    
	<div class="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
		<div class="text-center mb-16 lg:mb-20">
			<h2 class="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 font-outfit tracking-tight">
				Categorías <span class="text-blue-600">Populares</span>
			</h2>
			<p class="text-lg text-slate-600 max-w-2xl mx-auto font-light leading-relaxed">
				Contamos con expertos calificados en las áreas más solicitadas por nuestros usuarios.
			</p>
		</div>

		<div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
			{#each categories as category}
				<button 
					class="group relative bg-white border border-slate-200 rounded-[2rem] p-8 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left overflow-hidden"
					on:click={() => handleCategoryClick(category.id)}
				>
					<div class="flex flex-col items-center text-center relative z-10">
						<div class="w-16 h-16 {category.bgColor} rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-sm border border-slate-100">
							<svelte:component this={category.icon} size={28} class={category.color} />
						</div>
						<h3 class="text-xl font-bold text-slate-900 mb-3 font-outfit group-hover:text-blue-600 transition-colors">{category.name}</h3>
						<p class="text-slate-600 text-sm leading-relaxed font-light">{category.description}</p>
					</div>
                    
                    <div class="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
				</button>
			{/each}
		</div>

		<!-- View More Button -->
		<div class="flex justify-center mt-12">
			<a href="/services" class="group inline-flex items-center justify-center px-10 py-5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg rounded-2xl transition-all duration-300 shadow-xl hover:shadow-slate-900/20 font-outfit">
				Ver todas las categorías
				<ArrowRight size={20} class="ml-2 group-hover:translate-x-1 transition-transform" />
			</a>
		</div>
	</div>
</section>

<!-- How It Works Section -->
<section class="py-24 bg-white relative">
	<div class="container mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center mb-16 lg:mb-20">
			<h2 class="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 font-outfit tracking-tight">
				¿Cómo funciona <span class="text-blue-600">Domify</span>?
			</h2>
			<p class="text-lg text-slate-600 max-w-2xl mx-auto font-light leading-relaxed">
				Tu seguridad y satisfacción son nuestra prioridad. Así es como logramos resultados excelentes.
			</p>
		</div>

		<div class="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto relative">
			<!-- Visual Connector Line -->
			<div class="hidden md:block absolute top-[100px] left-[15%] right-[15%] h-1 bg-slate-100 -z-0">
				<div class="h-full w-1/3 bg-blue-500 rounded-full animate-pulse"></div>
			</div>
			
			<!-- Step 1 -->
			<div class="relative z-10 group">
				<div class="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 text-center">
					<div class="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 text-white shadow-[0_15px_30px_-5px_rgba(37,99,235,0.4)] group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
						<Search size={32} />
					</div>
					<h3 class="text-2xl font-bold text-slate-900 mb-4 font-outfit">1. Busca el servicio</h3>
					<p class="text-slate-600 font-light text-sm leading-relaxed">
						Usa nuestro buscador inteligente para encontrar expertos en limpieza, electricidad, plomería y más.
					</p>
                    <div class="mt-6 inline-flex items-center text-blue-600 font-bold font-outfit text-xs uppercase tracking-widest">Paso Inicial</div>
				</div>
			</div>

			<!-- Step 2 -->
			<div class="relative z-10 group">
				<div class="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 text-center">
					<div class="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 text-white shadow-[0_15px_30px_-5px_rgba(79,70,229,0.4)] group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
						<UserCheck size={32} />
					</div>
					<h3 class="text-2xl font-bold text-slate-900 mb-4 font-outfit">2. Elige tu experto</h3>
					<p class="text-slate-600 font-light text-sm leading-relaxed">
						Compara perfiles verificados, reseñas reales y tarifas transparentes. Tú tienes el control total.
					</p>
                    <div class="mt-6 inline-flex items-center text-indigo-600 font-bold font-outfit text-xs uppercase tracking-widest">Confianza Total</div>
				</div>
			</div>

			<!-- Step 3 -->
			<div class="relative z-10 group">
				<div class="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 text-center">
					<div class="w-20 h-20 bg-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 text-white shadow-[0_15px_30px_-5px_rgba(147,51,234,0.4)] group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
						<CheckCircle2 size={32} />
					</div>
					<h3 class="text-2xl font-bold text-slate-900 mb-4 font-outfit">3. Contrata y relájate</h3>
					<p class="text-slate-600 font-light text-sm leading-relaxed">
						Coordina tu servicio y disfruta de la tranquilidad de un trabajo bien hecho por profesionales.
					</p>
                    <div class="mt-6 inline-flex items-center text-purple-600 font-bold font-outfit text-xs uppercase tracking-widest">Éxito Garantizado</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Bottom CTA Section -->
<section class="relative py-24 overflow-hidden bg-slate-900 border-t border-white/5">
    <!-- Glows -->
    <div class="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
    <div class="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none"></div>

	<div class="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
		<h2 class="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-8 font-outfit tracking-tight leading-tight">
			¿Listo para transformar <br class="hidden sm:block"/>
            tu <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">experiencia</span>?
		</h2>
		<p class="text-xl text-slate-300 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
			Únete a los miles de usuarios que ya simplificaron su vida con Domify. Es rápido, seguro y confiable.
		</p>
		<div class="flex flex-col sm:flex-row gap-6 justify-center items-center">
			<a 
				href="/services" 
				class="w-full sm:w-auto px-12 py-5 bg-white text-slate-900 font-bold text-lg rounded-2xl hover:bg-slate-50 transition-all duration-300 shadow-xl hover:scale-105 font-outfit"
			>
				Explorar Servicios
			</a>
			<a 
				href="/become-provider" 
				class="w-full sm:w-auto px-12 py-5 bg-slate-800 text-white font-bold text-lg rounded-2xl border border-white/10 hover:bg-slate-700 transition-all duration-300 shadow-xl hover:scale-105 font-outfit flex items-center justify-center gap-2"
			>
				Quiero ser un proveedor
                <ArrowRight size={20} />
			</a>
		</div>
	</div>
</section>

<!-- Additional CSS for effects -->
<style>
	.bg-grid-pattern {
		background-image: radial-gradient(circle, #e5e7eb 1px, transparent 1px);
		background-size: 20px 20px;
	}
	
	/* Parallax effect for hero section */
	@media (prefers-reduced-motion: no-preference) {
		.hero-parallax {
			transform: translateY(var(--scroll-y, 0) * 0.5px);
		}
	}
	
	/* Smooth scroll behavior */
	:global(html) {
		scroll-behavior: smooth;
	}
	
	/* Custom scrollbar */
	::-webkit-scrollbar {
		width: 8px;
	}
	
	::-webkit-scrollbar-track {
		background: #f1f5f9;
	}
	
	::-webkit-scrollbar-thumb {
		background: linear-gradient(to bottom, #3b82f6, #2563eb);
		border-radius: 4px;
	}
	
	::-webkit-scrollbar-thumb:hover {
		background: linear-gradient(to bottom, #2563eb, #1d4ed8);
	}
</style>
