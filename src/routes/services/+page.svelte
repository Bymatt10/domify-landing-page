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

	// Función para manejar cambios en la búsqueda
	function handleSearchChange() {
		console.log('🔍 Search query changed:', searchQuery);
		filterCategories();
	}

	// Función para navegar a una categoría
	function navigateToCategory(categorySlug: string) {
		console.log('🚀 Navigating to category:', categorySlug);
		goto(`/services/${categorySlug}`);
	}

	onMount(async () => {
		console.log('🚀 Services page mounted');
		loading = true;
		error = null;

		try {
			// Mock data para categorías (reemplazar con fetch real)
			categories = [
				{
					id: 1,
					name: 'Limpieza',
					description: 'Servicios de limpieza profesional para hogares y oficinas',
					icon: '🧹',
					slug: 'limpieza'
				},
				{
					id: 2,
					name: 'Jardinería',
					description: 'Cuidado y mantenimiento de jardines y áreas verdes',
					icon: '🌿',
					slug: 'jardineria'
				},
				{
					id: 3,
					name: 'Ensamblaje',
					description: 'Ensamblaje de muebles y equipos electrónicos',
					icon: '🔧',
					slug: 'ensamblaje'
				},
				{
					id: 4,
					name: 'Montaje',
					description: 'Instalación de TV, estantes, cuadros y más',
					icon: '📺',
					slug: 'montaje'
				},
				{
					id: 5,
					name: 'Mudanza',
					description: 'Servicios de mudanza y traslados seguros',
					icon: '📦',
					slug: 'mudanza'
				},
				{
					id: 6,
					name: 'Plomería',
					description: 'Reparaciones e instalaciones de plomería',
					icon: '🚰',
					slug: 'plomeria'
				},
				{
					id: 7,
					name: 'Electricidad',
					description: 'Servicios eléctricos profesionales',
					icon: '⚡',
					slug: 'electricidad'
				},
				{
					id: 8,
					name: 'Construcción',
					description: 'Obras pequeñas y medianas',
					icon: '🏗️',
					slug: 'construccion'
				},
				{
					id: 9,
					name: 'Pintura',
					description: 'Servicios de pintura interior y exterior',
					icon: '🎨',
					slug: 'pintura'
				}
			];

			filteredCategories = categories;
			console.log('✅ Categories loaded:', categories.length);

		} catch (err) {
			console.error('❌ Error loading categories:', err);
			error = 'Error al cargar las categorías de servicios';
		} finally {
			loading = false;
		}
	});

	// Reactive statement para filtrar cuando cambie la búsqueda
	$: if (searchQuery !== undefined) {
		handleSearchChange();
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

<div class="services-container">
	<!-- Header Section -->
	<div class="services-header">
		<div class="header-content">
			<h1 class="main-title">Servicios Profesionales</h1>
			<p class="subtitle">Encuentra profesionales verificados para todos tus proyectos en Nicaragua</p>
			
			<!-- Search Bar -->
			<div class="search-container">
				<div class="search-box">
					<svg class="search-icon" width="20" height="20" viewBox="0 0 24 24">
						<path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" stroke-width="2" fill="none"/>
					</svg>
					<input 
						type="text" 
						placeholder="Buscar servicios..." 
						bind:value={searchQuery}
						class="search-input"
					/>
				</div>
			</div>
		</div>
	</div>

	<!-- Loading State -->
	{#if loading}
		<div class="loading-container">
			<LoadingSpinner />
			<p>Cargando servicios...</p>
		</div>
	{:else if error}
		<div class="error-container">
			<p class="error-message">{error}</p>
			<button class="retry-button" on:click={() => window.location.reload()}>
				Reintentar
			</button>
		</div>
	{:else}
		<!-- Services Grid -->
		<div class="services-grid">
			{#each filteredCategories as category}
				<div class="service-card" on:click={() => navigateToCategory(category.slug)}>
					<div class="service-icon">
						<span class="icon-emoji">{category.icon}</span>
					</div>
					<div class="service-content">
						<h3 class="service-title">{category.name}</h3>
						<p class="service-description">{category.description}</p>
					</div>
					<div class="service-arrow">
						<svg width="20" height="20" viewBox="0 0 24 24">
							<path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" fill="none"/>
						</svg>
					</div>
				</div>
			{/each}
		</div>

		<!-- No Results -->
		{#if filteredCategories.length === 0 && searchQuery.trim()}
			<div class="no-results">
				<p>No se encontraron servicios que coincidan con "{searchQuery}"</p>
				<button class="clear-search" on:click={() => searchQuery = ''}>
					Limpiar búsqueda
				</button>
			</div>
		{/if}
	{/if}
</div>

<style>
	.services-container {
		min-height: 100vh;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 2rem 1rem;
	}

	.services-header {
		text-align: center;
		margin-bottom: 3rem;
	}

	.header-content {
		max-width: 800px;
		margin: 0 auto;
	}

	.main-title {
		font-size: 3rem;
		font-weight: 700;
		color: white;
		margin-bottom: 1rem;
		text-shadow: 0 2px 4px rgba(0,0,0,0.3);
	}

	.subtitle {
		font-size: 1.25rem;
		color: rgba(255,255,255,0.9);
		margin-bottom: 2rem;
	}

	.search-container {
		max-width: 500px;
		margin: 0 auto;
	}

	.search-box {
		position: relative;
		background: white;
		border-radius: 50px;
		padding: 0.75rem 1.5rem;
		box-shadow: 0 4px 20px rgba(0,0,0,0.1);
		display: flex;
		align-items: center;
	}

	.search-icon {
		color: #6b7280;
		margin-right: 0.75rem;
	}

	.search-input {
		flex: 1;
		border: none;
		outline: none;
		font-size: 1rem;
		background: transparent;
	}

	.search-input::placeholder {
		color: #9ca3af;
	}

	.services-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.service-card {
		background: white;
		border-radius: 16px;
		padding: 2rem;
		box-shadow: 0 4px 20px rgba(0,0,0,0.1);
		transition: all 0.3s ease;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.service-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 30px rgba(0,0,0,0.15);
	}

	.service-icon {
		flex-shrink: 0;
		width: 60px;
		height: 60px;
		border-radius: 12px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.icon-emoji {
		font-size: 2rem;
	}

	.service-content {
		flex: 1;
	}

	.service-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: #1f2937;
		margin-bottom: 0.5rem;
	}

	.service-description {
		color: #6b7280;
		line-height: 1.5;
	}

	.service-arrow {
		color: #9ca3af;
		transition: transform 0.3s ease;
	}

	.service-card:hover .service-arrow {
		transform: translateX(4px);
	}

	.loading-container {
		text-align: center;
		padding: 4rem 2rem;
		color: white;
	}

	.error-container {
		text-align: center;
		padding: 4rem 2rem;
		color: white;
	}

	.error-message {
		font-size: 1.125rem;
		margin-bottom: 1rem;
	}

	.retry-button {
		background: white;
		color: #667eea;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.retry-button:hover {
		background: #f3f4f6;
	}

	.no-results {
		text-align: center;
		padding: 4rem 2rem;
		color: white;
	}

	.clear-search {
		background: white;
		color: #667eea;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		margin-top: 1rem;
		transition: all 0.3s ease;
	}

	.clear-search:hover {
		background: #f3f4f6;
	}

	@media (max-width: 768px) {
		.main-title {
			font-size: 2rem;
		}

		.subtitle {
			font-size: 1rem;
		}

		.services-grid {
			grid-template-columns: 1fr;
			padding: 0 1rem;
		}

		.service-card {
			padding: 1.5rem;
		}
	}
</style> 