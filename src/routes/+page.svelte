<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import SearchBox from '$lib/components/SearchBox.svelte';
	import StatsCard from '$lib/components/StatsCard.svelte';

	export let data: PageData;

	let { session } = data;
	$: ({ session } = data);

	const categories = [
		{ id: 'electricistas', name: 'Electricistas', description: 'Instalaciones y reparaciones eléctricas', icon: '💡', gradient: 'from-blue-500 to-blue-600' },
		{ id: 'fontaneros', name: 'Fontaneros / Plomeros', description: 'Reparación e instalación de sistemas de agua', icon: '🚰', gradient: 'from-blue-600 to-blue-700' },
		{ id: 'jardineria', name: 'Jardinería', description: 'Cuidado y diseño de áreas verdes', icon: '🌳', gradient: 'from-blue-500 to-blue-600' },
		{ id: 'limpieza-casas', name: 'Limpieza de Casas', description: 'Limpieza general y profunda del hogar', icon: '🏠', gradient: 'from-blue-600 to-blue-700' }
	];

	const propertyTypes = [
		{
			id: 'houses',
			name: 'Casas',
			description: 'Servicios completos para casas unifamiliares',
			services: ['Limpieza profunda', 'Jardinería', 'Mantenimiento', 'Mudanzas']
		},
		{
			id: 'apartments',
			name: 'Apartamentos',
			description: 'Soluciones especializadas para espacios urbanos',
			services: ['Limpieza regular', 'Montaje de muebles', 'Instalaciones', 'Organización']
		},
		{
			id: 'commercial',
			name: 'Plazas Comerciales',
			description: 'Servicios corporativos y comerciales',
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

	// Professional SVG icons mapping (Heroicons outline paths)
	const categoryIcons: Record<string, { icon: string; color: string; bgColor: string }> = {
		'electricistas': {
			icon: 'M13 10V3L4 14h7v7l9-11h-7z',
			color: 'text-yellow-600',
			bgColor: 'bg-yellow-50'
		},
		'fontaneros': {
			icon: 'M15 8a3 3 0 11-6 0 3 3 0 016 0z M19 13a4 4 0 10-8 0v3H5v6h14v-6h-4v-3z',
			color: 'text-cyan-600',
			bgColor: 'bg-cyan-50'
		},
		'jardineria': {
			icon: 'M12 2l3.09 6.26L22 9l-5 4.87L18.18 22 12 18.27 5.82 22 7 13.87 2 9l6.91-.74L12 2z',
			color: 'text-green-600',
			bgColor: 'bg-green-50'
		},
		'limpieza-casas': {
			icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
			color: 'text-blue-600',
			bgColor: 'bg-blue-50'
		},
		'default': {
			icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v6l-8-6',
			color: 'text-gray-600',
			bgColor: 'bg-gray-50'
		}
	};

	function getCatIcon(slug: string) {
		return categoryIcons[slug] || categoryIcons['default'];
	}
</script>

<svelte:head>
	<title>Domify - Encuentra Servicios Locales de Confianza</title>
	<meta name="description" content="Domify es el marketplace líder para encontrar y contratar servicios de limpieza, mudanza, jardinería, ensamblaje y más en tu ciudad. Profesionales verificados y soporte 24/7." />
</svelte:head>

<!-- Hero Section -->
<section class="relative bg-gradient-to-br from-blue-50 via-white to-blue-50 min-h-screen flex items-center">
	<!-- Background Pattern -->
	<div class="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
	
	<div class="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
		<div class="max-w-4xl mx-auto text-center">
			<!-- Main Heading -->
			<h1 class="text-5xl sm:text-6xl lg:text-7xl font-bold text-secondary-900 mb-6 leading-tight">
				Encuentra los mejores 
				<span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-700">
					servicios locales
				</span>
			</h1>
			
			<!-- Subtitle -->
			<p class="text-xl sm:text-2xl text-secondary-600 mb-12 max-w-3xl mx-auto leading-relaxed">
				Conectamos personas con profesionales confiables para todas tus necesidades del hogar
			</p>

			<!-- Search Box -->
			<div class="mb-16">
				<SearchBox {categories} />
				
				<!-- Popular Searches -->
				<div class="mt-6 flex flex-wrap justify-center gap-3">
					<span class="text-secondary-500 font-medium">Búsquedas populares:</span>
					{#each popularSlugs as item}
						<button
							class="px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium hover:bg-primary-100 transition-colors duration-200"
							on:click={() => goto(`/services/${item.slug}`)}
							type="button"
						>
							{item.name}
						</button>
					{/each}
				</div>
			</div>

			<!-- Stats -->
			<div class="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
				<StatsCard number="500+" label="Profesionales Verificados" delay={0} iconName="users" />
				<StatsCard number="2000+" label="Servicios Completados" delay={200} iconName="check" />
				<StatsCard number="4.9" label="Calificación Promedio" delay={400} iconName="star" />
				<StatsCard number="24/7" label="Soporte Disponible" delay={600} iconName="clock" />
			</div>
		</div>
	</div>
</section>

<!-- Services Section -->
<section class="py-20 bg-white">
	<div class="container mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center mb-16">
			<h2 class="text-4xl sm:text-5xl font-bold text-secondary-900 mb-6">
				Servicios para Todo Tipo de Propiedades
			</h2>
			<p class="text-xl text-secondary-600 max-w-3xl mx-auto">
				Soluciones especializadas según tus necesidades
			</p>
		</div>

		<div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
			{#each propertyTypes as property}
				<div class="group bg-white rounded-2xl p-8 shadow-soft border border-secondary-100 transition-all duration-300">
					<div class="text-center">
						<!-- Icon -->
						<div class="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-transform duration-300">
							{#if property.id === 'houses'}
								<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
								</svg>
							{:else if property.id === 'apartments'}
								<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
								</svg>
							{:else}
								<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
								</svg>
							{/if}
						</div>
						
						<h3 class="text-2xl font-bold text-secondary-900 mb-3">{property.name}</h3>
						<p class="text-secondary-600 mb-6">{property.description}</p>
						
						<!-- Services List -->
						<div class="space-y-2">
							{#each property.services as service}
								<div class="flex items-center justify-center text-sm text-secondary-600">
									<svg class="w-4 h-4 text-primary-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
									</svg>
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
<section class="py-20 bg-gradient-to-br from-secondary-50 to-primary-50">
	<div class="container mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center mb-16">
			<h2 class="text-4xl sm:text-5xl font-bold text-secondary-900 mb-6">
				Nuestros Servicios
			</h2>
			<p class="text-xl text-secondary-600 max-w-3xl mx-auto">
				Profesionales verificados en cada categoría
			</p>
		</div>

		<div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto justify-center">
			{#each categories as category}
				<button 
					class="group bg-white rounded-2xl p-6 shadow-soft border border-secondary-100 transition-all duration-300 text-left"
					on:click={() => handleCategoryClick(category.id)}
				>
					<div class="flex flex-col items-center text-center">
						<div class="w-16 h-16 {getCatIcon(category.id).bgColor} rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
							<svg class="w-8 h-8 {getCatIcon(category.id).color}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={getCatIcon(category.id).icon}></path>
							</svg>
						</div>
						<h3 class="text-lg font-bold text-secondary-900 mb-2">{category.name}</h3>
						<p class="text-sm text-secondary-600 leading-relaxed">{category.description}</p>
					</div>
				</button>
			{/each}
		</div>

		<!-- View More Button -->
		<div class="flex justify-center mt-8">
			<a href="/services" class="px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors duration-200">
				Ver todos los servicios
			</a>
		</div>
	</div>
</section>

<!-- How It Works Section -->
<section class="py-20 bg-gradient-to-br from-gray-50 to-white">
	<div class="container mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center mb-16">
			<h2 class="text-4xl sm:text-5xl font-bold text-secondary-900 mb-6">
				¿Cómo funciona?
			</h2>
			<p class="text-xl text-secondary-600 max-w-3xl mx-auto">
				Encuentra y contrata servicios de forma rápida y segura
			</p>
		</div>

		<div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
			<!-- Paso 1 -->
			<div class="relative">
				<!-- Línea conectora -->
				<div class="hidden md:block absolute top-20 left-full w-full h-0.5 bg-gradient-to-r from-primary-500 to-primary-600 z-0"></div>
				
				<div class="relative bg-white rounded-2xl p-8 shadow-soft border border-secondary-100 text-center z-10">
					<!-- Número del paso -->
					<div class="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-lg">
						1
					</div>
					
					<!-- Icono -->
					<div class="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
						<svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
						</svg>
					</div>
					
					<h3 class="text-2xl font-bold text-secondary-900 mb-4">Busca tu servicio</h3>
					<p class="text-secondary-600 leading-relaxed">
						Explora nuestras categorías de servicios o usa el buscador para encontrar exactamente lo que necesitas en tu área.
					</p>
				</div>
			</div>

			<!-- Paso 2 -->
			<div class="relative">
				<!-- Línea conectora -->
				<div class="hidden md:block absolute top-20 left-full w-full h-0.5 bg-gradient-to-r from-primary-500 to-primary-600 z-0"></div>
				
				<div class="relative bg-white rounded-2xl p-8 shadow-soft border border-secondary-100 text-center z-10">
					<!-- Número del paso -->
					<div class="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-lg">
						2
					</div>
					
					<!-- Icono -->
					<div class="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
						<svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
						</svg>
					</div>
					
					<h3 class="text-2xl font-bold text-secondary-900 mb-4">Revisa proveedores</h3>
					<p class="text-secondary-600 leading-relaxed">
						Ve perfiles detallados, calificaciones, reseñas y precios de profesionales verificados en tu zona.
					</p>
				</div>
			</div>

			<!-- Paso 3 -->
			<div class="relative">
				<div class="relative bg-white rounded-2xl p-8 shadow-soft border border-secondary-100 text-center z-10">
					<!-- Número del paso -->
					<div class="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-lg">
						3
					</div>
					
					<!-- Icono -->
					<div class="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
						<svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
						</svg>
					</div>
					
					<h3 class="text-2xl font-bold text-secondary-900 mb-4">Contacta y contrata</h3>
					<p class="text-secondary-600 leading-relaxed">
						Contacta directamente al proveedor que elijas por teléfono o WhatsApp y coordina tu servicio de forma segura.
					</p>
				</div>
			</div>
		</div>

		<!-- Call to Action -->
		<div class="text-center mt-12">
			<div class="bg-white rounded-2xl p-8 shadow-soft border border-secondary-100 max-w-2xl mx-auto">
				<h3 class="text-2xl font-bold text-secondary-900 mb-4">¿Listo para empezar?</h3>
				<p class="text-secondary-600 mb-6">
					Únete a miles de clientes satisfechos que ya confían en Domify para sus servicios
				</p>
				<a 
					href="/services" 
					class="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-lg hover:shadow-xl"

				>
					Buscar servicios ahora
					<svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
					</svg>
				</a>
			</div>
		</div>
	</div>
</section>

<!-- CTA Section -->
<section class="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
	<div class="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
		<h2 class="text-4xl sm:text-5xl font-bold text-white mb-6">
			¿Necesitas un servicio?
		</h2>
		<p class="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
			Únete a miles de clientes satisfechos que confían en Domify
		</p>
		<div class="flex flex-col sm:flex-row gap-4 justify-center">
			<a 
				href="/services" 
				class="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-colors duration-200"
			>
				Explorar Servicios
			</a>
			<a 
				href="/become-provider" 
				class="inline-flex items-center justify-center px-8 py-4 bg-primary-800 text-white font-semibold rounded-xl hover:bg-primary-900 transition-colors duration-200"
			>
				Quiero ser un proveedor
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
