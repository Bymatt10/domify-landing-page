<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import SearchSuggestions from '$lib/components/SearchSuggestions.svelte';

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
	
	// Modal state
	let showCategoryModal = false;
	let categoryRequest = {
		name: '',
		email: '',
		categoryName: '',
		description: ''
	};
	let submittingCategory = false;
	
	// Notification state
	let showNotification = false;
	let notificationMessage = '';
	let notificationType = 'success'; // 'success' or 'error'

	// Mapeo de categorías a íconos SVG modernos y colores (actualizado para coincidir con el home)
	const categoryIcons: Record<string, { icon: string; color: string; bgColor: string }> = {
		'electricistas': {
			icon: 'M13 10V3L4 14h7v7l9-11h-7z',
			color: 'text-yellow-600',
			bgColor: 'bg-yellow-50'
		},
		'electricidad': {
			icon: 'M13 10V3L4 14h7v7l9-11h-7z',
			color: 'text-yellow-600',
			bgColor: 'bg-yellow-50'
		},
		'fontaneros': {
			icon: 'M15 8a3 3 0 11-6 0 3 3 0 016 0z M19 13a4 4 0 10-8 0v3H5v6h14v-6h-4v-3z',
			color: 'text-cyan-600',
			bgColor: 'bg-cyan-50'
		},
		'plomeria': {
			icon: 'M15 8a3 3 0 11-6 0 3 3 0 016 0z M19 13a4 4 0 10-8 0v3H5v6h14v-6h-4v-3z',
			color: 'text-cyan-600',
			bgColor: 'bg-cyan-50'
		},
		'plomeros': {
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
		'limpieza': {
			icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
			color: 'text-blue-600',
			bgColor: 'bg-blue-50'
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
		'ensamblaje': {
			icon: 'M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z',
			color: 'text-indigo-600',
			bgColor: 'bg-indigo-50'
		},
		'mudanza': {
			icon: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12',
			color: 'text-red-600',
			bgColor: 'bg-red-50'
		},
		'carpinteria': {
			icon: 'M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z',
			color: 'text-amber-600',
			bgColor: 'bg-amber-50'
		},
		'cerrajeros': {
			icon: 'M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z',
			color: 'text-gray-600',
			bgColor: 'bg-gray-50'
		},
		'tecnologia': {
			icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
			color: 'text-blue-600',
			bgColor: 'bg-blue-50'
		},
		'seguridad': {
			icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
			color: 'text-emerald-600',
			bgColor: 'bg-emerald-50'
		},
		'default': {
			icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v6l-8-6',
			color: 'text-gray-600',
			bgColor: 'bg-gray-50'
		},
		'albañileria': {
			icon: 'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zM3 6h18M8 6v4M16 6v4',
			color: 'text-orange-600',
			bgColor: 'bg-orange-50'
		},
		'albañil': {
			icon: 'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zM3 6h18M8 6v4M16 6v4',
			color: 'text-orange-600',
			bgColor: 'bg-orange-50'
		},
		'muebles': {
			icon: 'M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z',
			color: 'text-indigo-600',
			bgColor: 'bg-indigo-50'
		}
	};

	function getCategoryIcon(categoryName: string) {
		// Normalizar el nombre de la categoría
		const normalizedName = categoryName.toLowerCase()
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "")
			.replace(/[^a-z0-9\s]/g, "")
			.trim();
		
		// Looking for icon for category
		
		// Buscar coincidencias exactas primero
		if (categoryIcons[normalizedName]) {
			// Exact match found
			return categoryIcons[normalizedName];
		}
		
		// Buscar coincidencias parciales
		for (const [key, iconData] of Object.entries(categoryIcons)) {
			if (normalizedName.includes(key) || key.includes(normalizedName)) {
				// Partial match found
				return iconData;
			}
		}
		
		// Buscar por palabras clave
		const keywords = {
			'electric': 'electricistas',
			'plom': 'fontaneros',
			'fontan': 'fontaneros',
			'jardin': 'jardineria',
			'limpi': 'limpieza',
			'construc': 'construccion',
			'pint': 'pintura',
			'ensambl': 'ensamblaje',
			'mudanz': 'mudanza',
			'carpint': 'carpinteria',
			'cerraj': 'cerrajeros',
			'tech': 'tecnologia',
			'segur': 'seguridad',
			'albañil': 'albañileria',
			'muebl': 'muebles',
			'comput': 'tecnologia',
			'vigil': 'seguridad'
		};
		
		for (const [keyword, iconKey] of Object.entries(keywords)) {
			if (normalizedName.includes(keyword)) {
				// console.log removed
				return categoryIcons[iconKey];
			}
		}
		
		// console.log removed
		return categoryIcons['default'];
	}

	// Función para filtrar categorías
	function filterCategories() {
		// console.log removed
		// console.log removed
		
		if (!searchQuery.trim()) {
			filteredCategories = categories;
			// console.log removed
			return;
		}

		const query = searchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
		// console.log removed
		
		// Primero buscar coincidencias exactas
		const exactNameMatches = categories.filter(category => {
			const name = category.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
			const slug = category.slug.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
			const isExact = name === query || slug === query;
			if (isExact) // console.log removed
			return isExact;
		});

		// Si hay coincidencias exactas, mostrar solo esas
		if (exactNameMatches.length > 0) {
			filteredCategories = exactNameMatches;
			// console.log removed
			return;
		}

		// Segundo: buscar palabras que empiecen con la consulta
		const startsWithMatches = categories.filter(category => {
			const name = category.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
			const slug = category.slug.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
			const words = name.split(' ');
			const startsWith = words.some(word => word.startsWith(query)) || slug.startsWith(query);
			if (startsWith) // console.log removed
			return startsWith;
		});

		// Si hay coincidencias que empiecen con la consulta, mostrar esas
		if (startsWithMatches.length > 0) {
			filteredCategories = startsWithMatches;
			// console.log removed
			return;
		}

		// Tercero: buscar coincidencias parciales
		const partialMatches = categories.filter(category => {
			const name = category.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
			const slug = category.slug.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
			const description = category.description.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
			
			const hasPartial = name.includes(query) || slug.includes(query) || description.includes(query);
			if (hasPartial) // console.log removed
			return hasPartial;
		});

		filteredCategories = partialMatches;
		// console.log removed
	}

	// Función para limpiar búsqueda
	function clearSearch() {
		// console.log removed
		searchQuery = '';
		filteredCategories = categories;
		// console.log removed
	}

	// Función para manejar la búsqueda al presionar Enter
	function handleSearch() {
		// console.log removed
		// console.log removed
		
		if (!searchQuery.trim()) {
			// console.log removed
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
		// console.log removed
		if (event.key === 'Enter') {
			// console.log removed
			event.preventDefault();
			handleSearch();
		}
	}

	onMount(async () => {
		// console.log removed
		try {
			const res = await fetch('/api/categories');
			// console.log removed
			if (!res.ok) {
				throw new Error('No se pudieron cargar las categorías de servicios.');
			}
			const responseData = await res.json();
			// console.log removed
			categories = responseData.data.categories;
			filteredCategories = categories;
			// console.log removed
			// console.log removed
		} catch (e: any) {
			error = e.message;
			console.error('❌ Error fetching categories:', e);
		} finally {
			loading = false;
			// console.log removed
		}
	});

	function handleCategoryClick(slug: string) {
		goto(`/services/${slug}`);
	}

	// Función para abrir modal de solicitud de categoría
	function openCategoryModal() {
		showCategoryModal = true;
		// Reset form
		categoryRequest = {
			name: '',
			email: '',
			categoryName: '',
			description: ''
		};
	}

	// Función para cerrar modal
	function closeCategoryModal() {
		showCategoryModal = false;
	}

	// Función para mostrar notificación
	function showSuccessNotification(message: string) {
		notificationType = 'success';
		notificationMessage = message;
		showNotification = true;
		
		// Auto-hide after 5 seconds
		setTimeout(() => {
			showNotification = false;
		}, 5000);
	}

	function showErrorNotification(message: string) {
		notificationType = 'error';
		notificationMessage = message;
		showNotification = true;
		
		// Auto-hide after 5 seconds
		setTimeout(() => {
			showNotification = false;
		}, 5000);
	}

	// Función para enviar solicitud de nueva categoría
	async function submitCategoryRequest() {
		// Validaciones básicas
		if (!categoryRequest.name.trim() || !categoryRequest.email.trim() || !categoryRequest.categoryName.trim()) {
			showErrorNotification('Por favor, completa todos los campos obligatorios.');
			return;
		}

		// Validar email
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(categoryRequest.email)) {
			showErrorNotification('Por favor, ingresa un email válido.');
			return;
		}

		submittingCategory = true;

		try {
			const message = `
Solicitud de Nueva Categoría de Servicios

Nombre del solicitante: ${categoryRequest.name}
Email: ${categoryRequest.email}

Categoría solicitada: ${categoryRequest.categoryName}
Descripción: ${categoryRequest.description || 'No proporcionada'}

Fecha de solicitud: ${new Date().toLocaleString('es-ES', { timeZone: 'America/Managua' })}
			`.trim();

			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: categoryRequest.name,
					email: categoryRequest.email,
					subject: `Categoría Deseada: ${categoryRequest.categoryName}`,
					message: message,
					category_request: true
				})
			});

			if (response.ok) {
				showSuccessNotification('¡Gracias! Tu solicitud de nueva categoría ha sido enviada. Revisaremos tu sugerencia y te contactaremos si la agregamos.');
				closeCategoryModal();
			} else {
				showErrorNotification('Hubo un error al enviar tu solicitud. Por favor, intenta de nuevo.');
			}
		} catch (error) {
			console.error('Error sending category request:', error);
			showErrorNotification('Hubo un error al enviar tu solicitud. Por favor, intenta de nuevo.');
		} finally {
			submittingCategory = false;
		}
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

	<!-- Request New Category Section -->
	<section class="py-12 bg-white">
		<div class="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
			<div class="max-w-2xl mx-auto">
				<h3 class="text-2xl font-bold text-secondary-900 mb-4">
					¿No encuentras tu servicio?
				</h3>
				<p class="text-secondary-600 mb-6">
					Si no ves la categoría que buscas, podemos agregarla. ¡Solicítala aquí!
				</p>
				<button 
					on:click={openCategoryModal}
					class="inline-flex items-center justify-center px-6 py-3 bg-secondary-100 hover:bg-secondary-200 text-secondary-700 font-semibold rounded-xl transition-colors duration-200 shadow-md hover:shadow-lg"
				>
					<svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
					</svg>
					Solicitar Nueva Categoría
				</button>
			</div>
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

	<!-- Modal de Solicitud de Categoría -->
	{#if showCategoryModal}
		<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div class="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
				<!-- Header -->
				<div class="flex items-center justify-between p-6 border-b border-gray-200">
					<h3 class="text-xl font-bold text-gray-900">Solicitar Nueva Categoría</h3>
					<button 
						on:click={closeCategoryModal}
						class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
					>
						<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<!-- Form -->
				<form on:submit|preventDefault={submitCategoryRequest} class="p-6 space-y-4">
					<div>
						<label for="name" class="block text-sm font-medium text-gray-700 mb-2">
							Nombre completo *
						</label>
						<input
							type="text"
							id="name"
							bind:value={categoryRequest.name}
							required
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
							placeholder="Tu nombre completo"
						/>
					</div>

					<div>
						<label for="email" class="block text-sm font-medium text-gray-700 mb-2">
							Email *
						</label>
						<input
							type="email"
							id="email"
							bind:value={categoryRequest.email}
							required
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
							placeholder="tu@email.com"
						/>
					</div>

					<div>
						<label for="categoryName" class="block text-sm font-medium text-gray-700 mb-2">
							Nombre de la categoría *
						</label>
						<input
							type="text"
							id="categoryName"
							bind:value={categoryRequest.categoryName}
							required
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
							placeholder="Ej: Servicios de Limpieza Profunda"
						/>
					</div>

					<div>
						<label for="description" class="block text-sm font-medium text-gray-700 mb-2">
							Descripción (opcional)
						</label>
						<textarea
							id="description"
							bind:value={categoryRequest.description}
							rows="3"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 resize-none"
							placeholder="Describe brevemente qué tipo de servicios incluiría esta categoría..."
						></textarea>
					</div>

					<!-- Buttons -->
					<div class="flex gap-3 pt-4">
						<button
							type="button"
							on:click={closeCategoryModal}
							class="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200"
						>
							Cancelar
						</button>
						<button
							type="submit"
							disabled={submittingCategory}
							class="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
						>
							{#if submittingCategory}
								<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								Enviando...
							{:else}
								Enviar Solicitud
							{/if}
						</button>
					</div>
				</form>
			</div>
		</div>
	{/if}

	<!-- Notification Toast -->
	{#if showNotification}
		<div class="fixed top-4 right-4 z-[60] max-w-sm w-full">
			<div class="bg-white rounded-xl shadow-2xl border-l-4 {notificationType === 'success' ? 'border-green-500' : 'border-red-500'} p-4 transform transition-all duration-300 ease-out">
				<div class="flex items-start">
					<div class="flex-shrink-0">
						{#if notificationType === 'success'}
							<svg class="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						{:else}
							<svg class="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						{/if}
					</div>
					<div class="ml-3 flex-1">
						<p class="text-sm font-medium {notificationType === 'success' ? 'text-green-800' : 'text-red-800'}">
							{notificationType === 'success' ? '¡Éxito!' : 'Error'}
						</p>
						<p class="mt-1 text-sm {notificationType === 'success' ? 'text-green-700' : 'text-red-700'}">
							{notificationMessage}
						</p>
					</div>
					<div class="ml-4 flex-shrink-0">
						<button
							on:click={() => showNotification = false}
							class="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors duration-200"
						>
							<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div> 