<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

	type Category = {
		id: number;
		name: string;
		description: string;
		icon: string;
		slug: string;
	};

	let categories: Category[] = [];
	let filteredCategories: Category[] = [];
	let loading = true;
	let error: string | null = null;
	let searchQuery = '';

	// Mapeo de categorías a íconos SVG modernos y colores
	const categoryIcons: Record<string, { icon: string; color: string; bgColor: string }> = {
		'limpieza': {
			icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
			color: 'text-blue-600',
			bgColor: 'bg-blue-50'
		},
		'plomeria': {
			icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v-2m6-6V4m6 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m0 4v2m0-6V4',
			color: 'text-cyan-600',
			bgColor: 'bg-cyan-50'
		},
		'electricidad': {
			icon: 'M13 10V3L4 14h7v7l9-11h-7z',
			color: 'text-yellow-600',
			bgColor: 'bg-yellow-50'
		},
		'jardineria': {
			icon: 'M12 2l3.09 6.26L22 9l-5 4.87L18.18 22 12 18.27 5.82 22 7 13.87 2 9l6.91-.74L12 2z',
			color: 'text-green-600',
			bgColor: 'bg-green-50'
		},
		'construccion': {
			icon: 'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zM3 6h18M8 6v4M16 6v4',
			color: 'text-orange-600',
			bgColor: 'bg-orange-50'
		},
		'pintura': {
			icon: 'M15.5 2.25a.75.75 0 01.75-.75h5.5a.75.75 0 01.75.75v5.5a.75.75 0 01-.75.75h-5.5a.75.75 0 01-.75-.75V2.25z',
			color: 'text-purple-600',
			bgColor: 'bg-purple-50'
		},
		'default': {
			icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v6l-8-6',
			color: 'text-gray-600',
			bgColor: 'bg-gray-50'
		}
	};

	function getCategoryIcon(categoryName: string) {
		const key = categoryName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
		return categoryIcons[key] || categoryIcons['default'];
	}

	// Función para filtrar categorías
	function filterCategories() {
		console.log('🔍 Filtering categories with query:', searchQuery);
		console.log('📋 Total categories:', categories.length);
		
		if (!searchQuery.trim()) {
			filteredCategories = categories;
			console.log('✅ No query, showing all categories:', filteredCategories.length);
			return;
		}

		const query = searchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
		console.log('🔤 Processed query:', query);
		
		// Primero buscar coincidencias exactas
		const exactNameMatches = categories.filter(category => {
			const name = category.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
			const slug = category.slug.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
			const isExact = name === query || slug === query;
			if (isExact) console.log('🎯 Exact match found:', category.name);
			return isExact;
		});

		// Si hay coincidencias exactas, mostrar solo esas
		if (exactNameMatches.length > 0) {
			filteredCategories = exactNameMatches;
			console.log('✅ Using exact matches:', exactNameMatches.length);
			return;
		}

		// Segundo: buscar palabras que empiecen con la consulta
		const startsWithMatches = categories.filter(category => {
			const name = category.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
			const slug = category.slug.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
			const words = name.split(' ');
			const startsWith = words.some(word => word.startsWith(query)) || slug.startsWith(query);
			if (startsWith) console.log('🚀 Starts with match:', category.name);
			return startsWith;
		});

		// Si hay coincidencias que empiecen con la consulta, mostrar esas
		if (startsWithMatches.length > 0) {
			filteredCategories = startsWithMatches;
			console.log('✅ Using starts with matches:', startsWithMatches.length);
			return;
		}

		// Tercero: buscar coincidencias parciales
		const partialMatches = categories.filter(category => {
			const name = category.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
			const slug = category.slug.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
			const description = category.description.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
			
			const hasPartial = name.includes(query) || slug.includes(query) || description.includes(query);
			if (hasPartial) console.log('🔍 Partial match found:', category.name);
			return hasPartial;
		});

		filteredCategories = partialMatches;
		console.log('✅ Using partial matches:', partialMatches.length);
	}

	// Función para limpiar búsqueda
	function clearSearch() {
		console.log('🧹 Clearing search');
		searchQuery = '';
		filteredCategories = categories;
		console.log('✅ Search cleared, showing all categories:', filteredCategories.length);
	}

	// Función para manejar la búsqueda al presionar Enter
	function handleSearch() {
		console.log('🎯 handleSearch called with query:', searchQuery);
		console.log('📊 Current filtered categories:', filteredCategories.length);
		
		if (!searchQuery.trim()) {
			console.log('🔄 Empty query, scrolling to all services');
			// Si no hay búsqueda, hacer scroll a todos los servicios
			const resultsSection = document.querySelector('#results-section');
			if (resultsSection) {
				resultsSection.scrollIntoView({ 
					behavior: 'smooth',
					block: 'start'
				});
			}
			return;
		}
		
		// Si solo hay un resultado, navegar directamente a él
		if (filteredCategories.length === 1) {
			handleCategoryClick(filteredCategories[0].slug);
			return;
		}
		
		// Si hay múltiples resultados, hacer scroll hasta la sección de resultados
		if (filteredCategories.length > 0) {
			const resultsSection = document.querySelector('#results-section');
			if (resultsSection) {
				resultsSection.scrollIntoView({ 
					behavior: 'smooth',
					block: 'start'
				});
			}
		}
		// Si no hay resultados, también hacer scroll para mostrar el mensaje "no encontrado"
		else {
			const resultsSection = document.querySelector('#results-section');
			if (resultsSection) {
				resultsSection.scrollIntoView({ 
					behavior: 'smooth',
					block: 'start'
				});
			}
		}
	}

	// Función para manejar tecla Enter
	function handleKeydown(event: KeyboardEvent) {
		console.log('⌨️ Key pressed:', event.key);
		if (event.key === 'Enter') {
			console.log('🎯 Enter key detected, calling handleSearch');
			event.preventDefault();
			handleSearch();
		}
	}

	onMount(async () => {
		console.log('🚀 Component mounting, loading categories...');
		try {
			const res = await fetch('/api/categories');
			console.log('📡 API response status:', res.status, res.ok);
			if (!res.ok) {
				throw new Error('No se pudieron cargar las categorías de servicios.');
			}
			const responseData = await res.json();
			console.log('📦 Raw API response:', responseData);
			categories = responseData.data.categories;
			filteredCategories = categories;
			console.log('✅ Categories loaded successfully:', categories.length);
			console.log('📋 First few categories:', categories.slice(0, 3));
		} catch (e: any) {
			error = e.message;
			console.error('❌ Error fetching categories:', e);
		} finally {
			loading = false;
			console.log('🏁 Loading completed, loading state:', loading);
		}
	});

	function handleCategoryClick(slug: string) {
		goto(`/services/${slug}`);
	}

	// Reactive statement para filtrar cuando cambie la búsqueda
	$: if (searchQuery !== undefined) {
		filterCategories();
	}
</script>

<svelte:head>
	<title>Servicios Profesionales en Nicaragua | Domify - Encuentra Proveedores Confiables</title>
	<meta name="description" content="Encuentra servicios profesionales en Nicaragua: limpieza, jardinería, ensamblaje, plomería, electricidad y más. Contrata proveedores verificados con tarifas transparentes." />
	<meta name="keywords" content="servicios Nicaragua, limpieza, jardinería, ensamblaje, plomería, electricidad, construcción, pintura, domify, proveedores" />
	
	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://domify.app/services" />
	<meta property="og:title" content="Servicios Profesionales en Nicaragua | Domify" />
	<meta property="og:description" content="Encuentra servicios profesionales en Nicaragua: limpieza, jardinería, ensamblaje, plomería, electricidad y más." />
	<meta property="og:image" content="https://domify.app/img/domify-services.jpg" />
	
	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content="https://domify.app/services" />
	<meta property="twitter:title" content="Servicios Profesionales en Nicaragua | Domify" />
	<meta property="twitter:description" content="Encuentra servicios profesionales en Nicaragua: limpieza, jardinería, ensamblaje, plomería, electricidad y más." />
	<meta property="twitter:image" content="https://domify.app/img/domify-services.jpg" />
	
	<!-- Schema.org structured data -->
	<script type="application/ld+json">
		{JSON.stringify({
			"@context": "https://schema.org",
			"@type": "WebSite",
			"name": "Domify - Servicios Profesionales",
			"description": "Plataforma para encontrar servicios profesionales en Nicaragua",
			"url": "https://domify.app/services",
			"potentialAction": {
				"@type": "SearchAction",
				"target": "https://domify.app/services?search={search_term_string}",
				"query-input": "required name=search_term_string"
			},
			"offers": {
				"@type": "AggregateOffer",
				"priceCurrency": "NIO",
				"availability": "https://schema.org/InStock",
				"description": "Servicios profesionales en Nicaragua"
			}
		})}
	</script>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50">
	<!-- Hero Section -->
	<section class="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
		<!-- Background Pattern -->
		<div class="absolute inset-0 opacity-10">
			<div class="absolute inset-0" style="background-image: radial-gradient(circle at 25% 25%, white 2px, transparent 2px), radial-gradient(circle at 75% 75%, white 2px, transparent 2px); background-size: 50px 50px;"></div>
		</div>
		
		<div class="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
			<div class="text-center max-w-4xl mx-auto">
				<h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
					Encuentra el profesional
					<span class="block text-primary-200">perfecto para tu proyecto</span>
				</h1>
				<p class="text-xl sm:text-2xl text-primary-100 mb-8 max-w-2xl mx-auto">
					Conectamos clientes con profesionales verificados y confiables en Nicaragua
				</p>
				
				<!-- Search Bar -->
				<div class="max-w-2xl mx-auto mb-8">
					<div class="relative">
						<div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
							<svg class="h-6 w-6 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
						</div>
						<input
							type="text"
							bind:value={searchQuery}
							on:keydown={handleKeydown}
							placeholder="Buscar servicios: limpieza, plomería, electricidad..."
							class="w-full pl-12 pr-4 py-4 text-lg bg-white rounded-2xl shadow-lg border-0 focus:ring-4 focus:ring-primary-300 focus:outline-none transition-all duration-200"
						/>
						<button
							on:click={handleSearch}
							class="absolute inset-y-0 right-0 px-6 flex items-center bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-r-2xl transition-colors duration-200"
						>
							Buscar
						</button>
					</div>
				</div>
				
				<!-- Quick Stats -->
				<div class="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
					<div class="text-center">
						<div class="text-3xl font-bold text-white mb-2">500+</div>
						<div class="text-primary-200">Profesionales</div>
					</div>
					<div class="text-center">
						<div class="text-3xl font-bold text-white mb-2">10+</div>
						<div class="text-primary-200">Categorías</div>
					</div>
					<div class="text-center">
						<div class="text-3xl font-bold text-white mb-2">1000+</div>
						<div class="text-primary-200">Proyectos</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Services Section -->
	<section id="results-section" class="py-16 lg:py-24">
		<div class="container mx-auto px-4 sm:px-6 lg:px-8">
			<!-- Section Header -->
			<div class="text-center mb-12 lg:mb-16">
				<h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary-900 mb-4">
					Servicios Disponibles
				</h2>
				<p class="text-lg text-secondary-600 max-w-2xl mx-auto">
					Explora nuestras categorías de servicios y encuentra el profesional que necesitas
				</p>
			</div>

			<!-- Loading State -->
			{#if loading}
				<div class="flex flex-col items-center justify-center py-16">
					<LoadingSpinner />
					<p class="mt-4 text-secondary-600">Cargando servicios...</p>
				</div>
			{:else if error}
				<div class="text-center py-16">
					<div class="text-red-500 text-lg mb-4">{error}</div>
					<button 
						on:click={() => window.location.reload()} 
						class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
					>
						Reintentar
					</button>
				</div>
			{:else}
				<!-- Services Grid -->
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
					{#each filteredCategories as category}
						{@const iconData = getCategoryIcon(category.name)}
						<button 
							class="group bg-white rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-secondary-100 hover:border-primary-200 text-left w-full"
							on:click={() => handleCategoryClick(category.slug)}
							on:keydown={(e) => e.key === 'Enter' && handleCategoryClick(category.slug)}
							aria-label="Ver servicios de {category.name}"
						>
							<!-- Icon -->
							<div class="flex items-center justify-center w-16 h-16 rounded-xl {iconData.bgColor} mb-6 group-hover:scale-110 transition-transform duration-300">
								<svg class="w-8 h-8 {iconData.color}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={iconData.icon} />
								</svg>
							</div>
							
							<!-- Content -->
							<div class="text-center">
								<h3 class="text-xl font-bold text-secondary-900 mb-3 group-hover:text-primary-600 transition-colors duration-200">
									{category.name}
								</h3>
								<p class="text-secondary-600 mb-6 leading-relaxed">
									{category.description}
								</p>
								
								<!-- Arrow -->
								<div class="flex justify-center">
									<div class="w-10 h-10 rounded-full bg-primary-100 group-hover:bg-primary-200 flex items-center justify-center transition-colors duration-200">
										<svg class="w-5 h-5 text-primary-600 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
										</svg>
									</div>
								</div>
							</div>
						</button>
					{/each}
				</div>

				<!-- No Results -->
				{#if filteredCategories.length === 0 && searchQuery.trim()}
					<div class="text-center py-16">
						<div class="text-secondary-400 text-6xl mb-4">🔍</div>
						<h3 class="text-2xl font-bold text-secondary-900 mb-4">
							No se encontraron servicios
						</h3>
						<p class="text-secondary-600 mb-6">
							No encontramos servicios que coincidan con "{searchQuery}"
						</p>
						<button 
							on:click={clearSearch}
							class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
						>
							Ver todos los servicios
						</button>
					</div>
				{/if}
			{/if}
		</div>
	</section>

	<!-- CTA Section -->
	<section class="bg-gradient-to-r from-primary-600 to-primary-700 py-16 lg:py-20">
		<div class="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
			<h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
				¿Eres un profesional?
			</h2>
			<p class="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
				Únete a nuestra plataforma y comienza a recibir clientes
			</p>
			<a 
				href="/become-provider"
				class="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-colors duration-200 shadow-lg hover:shadow-xl"
			>
				Registrarse como Proveedor
			</a>
		</div>
	</section>
</div> 