<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import SearchBox from '$lib/components/SearchBox.svelte';
	import StatsCard from '$lib/components/StatsCard.svelte';

	export let data: PageData;

	let { session } = data;
	$: ({ session } = data);

	const categories = [
		{
			id: 'cleaning',
			name: 'Limpieza',
			description: 'Servicios profesionales de limpieza para tu hogar u oficina',
			icon: '/img/cleaning.png',
			gradient: 'from-blue-500 to-blue-600'
		},
		{
			id: 'moving',
			name: 'Mudanza',
			description: 'Ayuda profesional para tu mudanza, empaque y transporte',
			icon: '/img/moving.png',
			gradient: 'from-blue-600 to-blue-700'
		},
		{
			id: 'gardening',
			name: 'Jardinería',
			description: 'Mantenimiento y diseño de jardines por expertos',
			icon: '/img/gardening.png',
			gradient: 'from-blue-500 to-blue-600'
		},
		{
			id: 'assembly',
			name: 'Ensamblaje',
			description: 'Montaje de muebles y equipos por profesionales',
			icon: '/img/assembly.png',
			gradient: 'from-blue-600 to-blue-700'
		},
		{
			id: 'mounting',
			name: 'Montaje',
			description: 'Instalación profesional de TV, cuadros y más',
			icon: '/img/mounting.png',
			gradient: 'from-blue-500 to-blue-600'
		}
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

	const testimonials = [
		{
			name: 'María González',
			location: 'Casa en Las Condes',
			rating: 5,
			comment: 'Excelente servicio de limpieza. Los profesionales fueron muy puntuales y dejaron mi casa impecable.',
			avatar: '👩‍💼'
		},
		{
			name: 'Carlos Rodríguez',
			location: 'Apartamento en Providencia',
			rating: 5,
			comment: 'El servicio de montaje de muebles fue perfecto. Muy recomendado para mudanzas.',
			avatar: '👨‍💼'
		},
		{
			name: 'Ana Silva',
			location: 'Oficina en Santiago Centro',
			rating: 5,
			comment: 'Contratamos limpieza comercial y quedamos muy satisfechos. Profesionales y confiables.',
			avatar: '👩‍💻'
		}
	];

	function handleCategoryClick(categoryId: string) {
		goto(`/services/${categoryId}`);
	}
</script>

<svelte:head>
	<title>Domify - Encuentra Servicios Locales de Confianza</title>
	<meta name="description" content="Domify es el marketplace líder para encontrar y contratar servicios de limpieza, mudanza, jardinería, ensamblaje y más en tu ciudad. Profesionales verificados y soporte 24/7." />
</svelte:head>

<!-- Hero Section -->
<section class="relative bg-gradient-to-br from-blue-50 via-white to-blue-50 min-h-screen flex items-center">
	<!-- Background Pattern -->
	<div class="absolute inset-0 bg-grid-pattern opacity-5"></div>
	
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
					{#each categories.slice(0, 3) as category}
						<button 
							class="px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium hover:bg-primary-100 transition-colors duration-200"
							on:click={() => handleCategoryClick(category.id)}
						>
							{category.name}
						</button>
					{/each}
				</div>
			</div>

			<!-- Stats -->
			<div class="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
				<StatsCard number="500+" label="Profesionales Verificados" delay={0} icon="👥" />
				<StatsCard number="2000+" label="Servicios Completados" delay={200} icon="✅" />
				<StatsCard number="4.9" label="Calificación Promedio" delay={400} icon="⭐" />
				<StatsCard number="24/7" label="Soporte Disponible" delay={600} icon="🕒" />
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

		<div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
			{#each categories as category}
				<button 
					class="group bg-white rounded-2xl p-6 shadow-soft border border-secondary-100 transition-all duration-300 text-left"
					on:click={() => handleCategoryClick(category.id)}
				>
					<div class="flex flex-col items-center text-center">
						<div class="w-16 h-16 bg-gradient-to-br {category.gradient} rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300">
							<img src={category.icon} alt={category.name} class="w-8 h-8 object-contain filter brightness-0 invert" />
						</div>
						<h3 class="text-lg font-bold text-secondary-900 mb-2">{category.name}</h3>
						<p class="text-sm text-secondary-600 leading-relaxed">{category.description}</p>
					</div>
				</button>
			{/each}
		</div>
	</div>
</section>

<!-- Testimonials Section -->
<section class="py-20 bg-white">
	<div class="container mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center mb-16">
			<h2 class="text-4xl sm:text-5xl font-bold text-secondary-900 mb-6">
				Lo que dicen nuestros clientes
			</h2>
		</div>

		<div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
			{#each testimonials as testimonial}
				<div class="bg-white rounded-2xl p-8 shadow-soft border border-secondary-100">
					<div class="flex items-center mb-4">
						<div class="text-3xl mr-4">{testimonial.avatar}</div>
						<div>
							<h4 class="font-bold text-secondary-900">{testimonial.name}</h4>
							<p class="text-sm text-secondary-600">{testimonial.location}</p>
						</div>
					</div>
					<div class="flex mb-4">
						{#each Array(testimonial.rating) as _}
							<svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
								<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
							</svg>
						{/each}
					</div>
					<p class="text-secondary-700 italic">"{testimonial.comment}"</p>
				</div>
			{/each}
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
	html {
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
