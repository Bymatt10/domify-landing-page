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

		if (startsWithMatches.length > 0) {
			filteredCategories = startsWithMatches;
			console.log('✅ Using starts with matches:', startsWithMatches.length);
			return;
		}

		// Tercero: buscar palabras que contengan la consulta
		const containsMatches = categories.filter(category => {
			const name = category.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
			const slug = category.slug.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
			const contains = name.includes(query) || slug.includes(query);
			if (contains) console.log('📝 Contains match:', category.name);
			return contains;
		});

		if (containsMatches.length > 0) {
			filteredCategories = containsMatches;
			console.log('✅ Using contains matches:', containsMatches.length);
			return;
		}

		// Si no hay coincidencias exactas, buscar en descripción
		filteredCategories = categories.filter(category => {
			const name = category.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
			const description = category.description.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
			const slug = category.slug.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
			
			// Buscar palabras parciales
			const queryWords = query.split(' ').filter(word => word.length > 2);
			const found = queryWords.some(word => 
				name.includes(word) || description.includes(word) || slug.includes(word)
			);
			if (found) console.log('📄 Description match:', category.name);
			return found;
		});
		
		console.log('🎯 Final filtered results:', filteredCategories.length);
	}

	// Función reactiva para filtrar cuando cambie la consulta
	$: {
		console.log('🔄 Reactive update triggered');
		console.log('📊 Categories loaded:', categories.length);
		console.log('🔍 Search query:', searchQuery);
		if (categories.length > 0) {
			console.log('✅ Calling filterCategories');
			filterCategories();
		} else {
			console.log('❌ No categories loaded yet');
		}
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
</script>

<svelte:head>
	<title>Servicios - Domify</title>
	<meta name="description" content="Encuentra profesionales verificados para todos tus servicios del hogar. Limpieza, plomería, electricidad y más." />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50">
	<!-- Hero Section -->
	<section class="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
		<!-- Background Pattern -->
		<div class="absolute inset-0 opacity-10">
			<div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, white 1px, transparent 0); background-size: 20px 20px;"></div>
		</div>
		
		<div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
			<div class="text-center">
				<h1 class="text-4xl lg:text-6xl font-bold text-white mb-6">
					Servicios para tu
					<span class="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
						Hogar
					</span>
				</h1>
				<p class="text-xl lg:text-2xl text-primary-100 max-w-3xl mx-auto mb-8">
					Encuentra profesionales verificados y de confianza para todos tus proyectos. 
					Calidad garantizada, precios justos.
				</p>

				<!-- Search Box -->
				<div class="max-w-2xl mx-auto">
					<form on:submit|preventDefault={handleSearch} class="relative group">
						<div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
							<svg class="h-5 w-5 text-gray-400 group-focus-within:text-primary-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
							</svg>
						</div>
						<input
							type="text"
							placeholder="¿Qué servicio necesitas? (ej: limpieza, plomería, electricidad...)"
							bind:value={searchQuery}
							on:keydown={handleKeydown}
							class="w-full pl-12 pr-32 py-4 bg-white rounded-2xl border border-white/20 shadow-lg focus:outline-none focus:ring-4 focus:ring-white/30 focus:border-white text-gray-900 placeholder-gray-500 text-lg"
						/>
						<div class="absolute inset-y-0 right-0 flex items-center gap-1 pr-2">
							{#if searchQuery}
								<button
									type="button"
									on:click={clearSearch}
									class="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
									aria-label="Limpiar búsqueda"
								>
									<svg class="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
									</svg>
								</button>
							{/if}
							<button
								type="submit"
								class="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors duration-200 font-medium"
							>
								Buscar
							</button>
						</div>
					</form>
					
					{#if searchQuery && !loading}
						<div class="text-white/80 text-sm mt-3">
							{#if filteredCategories.length === 0}
								No se encontraron servicios para "{searchQuery}"
							{:else if filteredCategories.length === 1}
								1 servicio encontrado
							{:else}
								{filteredCategories.length} servicios encontrados
							{/if}
						</div>
					{/if}
				</div>
			</div>
		</div>
	</section>

	<!-- Services Section -->
	<section id="results-section" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
		<div class="text-center mb-12">
			<h2 class="text-3xl lg:text-4xl font-bold text-secondary-900 mb-4">
				{#if searchQuery}
					Resultados de búsqueda
				{:else}
					Nuestros Servicios
				{/if}
			</h2>
			<p class="text-lg text-secondary-600 max-w-2xl mx-auto">
				{#if searchQuery}
					Servicios que coinciden con tu búsqueda "{searchQuery}"
					{#if !loading}
						<span class="block mt-2 text-sm font-medium text-primary-600">
							{#if filteredCategories.length === 0}
								Sin resultados encontrados
							{:else if filteredCategories.length === 1}
								1 servicio encontrado
							{:else}
								{filteredCategories.length} servicios encontrados
							{/if}
						</span>
					{/if}
				{:else}
					Explora nuestra amplia gama de servicios profesionales. Cada categoría cuenta con expertos verificados.
				{/if}
			</p>
		</div>

		{#if loading}
			<div class="flex items-center justify-center py-16">
				<LoadingSpinner size="lg" color="primary" text="Cargando servicios..." />
			</div>
		{:else if error}
			<div class="text-center py-16">
				<div class="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
					<svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
					</svg>
				</div>
				<h3 class="text-xl font-semibold text-secondary-900 mb-2">Error al cargar servicios</h3>
				<p class="text-secondary-600 mb-6">{error}</p>
				<button 
					class="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
					on:click={() => window.location.reload()}
				>
					Intentar de nuevo
				</button>
			</div>
		{:else if filteredCategories.length === 0 && searchQuery}
			<div class="text-center py-16">
				<div class="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
					<svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
					</svg>
				</div>
				<h3 class="text-xl font-semibold text-secondary-900 mb-2">
					No se encontraron resultados
				</h3>
				<p class="text-secondary-600 mb-6">
					No encontramos servicios que coincidan con "{searchQuery}". Intenta con otros términos o explora todas las categorías.
				</p>
				<button 
					class="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
					on:click={clearSearch}
				>
					Ver todos los servicios
				</button>
			</div>
		{:else if categories.length === 0}
			<div class="text-center py-16">
				<div class="inline-flex items-center justify-center w-16 h-16 bg-secondary-100 rounded-full mb-4">
					<svg class="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
					</svg>
				</div>
				<h3 class="text-xl font-semibold text-secondary-900 mb-2">
					No hay servicios disponibles
				</h3>
				<p class="text-secondary-600 mb-6">
					Actualmente no tenemos servicios para mostrar. Vuelve a intentarlo más tarde.
				</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
				{#each filteredCategories as category (category.id)}
					{@const iconData = getCategoryIcon(category.name)}
					<button 
						class="group bg-white rounded-2xl shadow-sm border border-secondary-200 p-6 lg:p-8 hover:shadow-xl hover:scale-105 transition-all duration-300 text-left"
						on:click={() => handleCategoryClick(category.slug)}
					>
						<!-- Icon -->
						<div class="flex items-center justify-center w-16 h-16 {iconData.bgColor} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
							{#if category.icon}
								{#if category.icon.startsWith('/') || category.icon.startsWith('http')}
									<img src={category.icon} alt={category.name} class="w-8 h-8 object-contain" />
								{:else}
									<span class="text-3xl select-none">{category.icon}</span>
								{/if}
							{:else}
								<svg class="w-8 h-8 {iconData.color}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={iconData.icon}></path>
								</svg>
							{/if}
						</div>

						<!-- Content -->
						<div class="mb-6">
							<h3 class="text-xl font-bold text-secondary-900 mb-3 group-hover:text-primary-600 transition-colors duration-300">
								{category.name}
							</h3>
							<p class="text-secondary-600 leading-relaxed">
								{category.description}
							</p>
						</div>

						<!-- Footer -->
						<div class="flex items-center justify-between pt-4 border-t border-secondary-100">
							<span class="text-sm font-medium text-primary-600 group-hover:text-primary-700">
								Ver profesionales
							</span>
							<div class="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-full group-hover:bg-primary-600 transition-colors duration-300">
								<svg class="w-4 h-4 text-primary-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
								</svg>
							</div>
						</div>
					</button>
				{/each}
			</div>
		{/if}
	</section>

	<!-- CTA Section -->
	<section class="bg-gradient-to-r from-primary-600 to-primary-700 py-16">
		<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
			<h2 class="text-3xl lg:text-4xl font-bold text-white mb-4">
				¿Eres un profesional?
			</h2>
			<p class="text-xl text-primary-100 mb-8">
				Únete a nuestra plataforma y conecta con miles de clientes que necesitan tus servicios.
			</p>
			<div class="flex flex-col sm:flex-row gap-4 justify-center">
				<button 
					class="px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold hover:bg-primary-50 transition-colors duration-200"
					on:click={() => goto('/become-provider')}
				>
					Convertirse en Proveedor
				</button>
				<button 
					class="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-primary-600 transition-colors duration-200"
					on:click={() => goto('/about')}
				>
					Saber más
				</button>
			</div>
		</div>
	</section>
</div> 