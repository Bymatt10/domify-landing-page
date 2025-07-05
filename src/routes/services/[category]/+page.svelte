<script lang="ts">
	import { page } from '$app/stores';
	import { onMount, onDestroy } from 'svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import { getTemplatesByCategoryName, type ServiceTemplate } from '$lib/service-templates';

	type Provider = {
		id: string;
		business_name: string;
		description: string;
		hourly_rate: number;
		rating: number;
		photo_url: string;
		location: string; // Campo de texto simple
		phone?: string;
		total_reviews?: number;
		provider_type?: string;
		users?: {
			id: string;
			email: string;
			role: string;
		};
		provider_categories?: any[];
		// Nuevos campos para el modal expandido
		bio?: string; // Biografía personal
		portfolio?: Array<{
			id: string;
			image_url: string;
			title: string;
			description?: string;
		}>;
		reviews?: Array<{
			id: string;
			rating: number;
			comment: string;
			reviewer_name: string;
			created_at: string;
			can_review: boolean; // Si el usuario actual puede hacer review
		}>;
	};

	let category = $page.params.category;
	let providers: Provider[] = [];
	let loading = true;
	let error: string | null = null;
	let showFiltersModal = false;
	let showProfileModal = false;
	let selectedProvider: Provider | null = null;
	let categoryServices: ServiceTemplate[] = [];

	// Filtros
	let selectedDate = '';
	let selectedProviderType = 'all';
	let selectedTime = '';
	let selectedDepartment = '';
	let selectedCity = '';
	let priceRange = [50, 1000];

	// Datos geográficos de Nicaragua
	const departments = [
		{ name: 'Managua', cities: ['Managua', 'Ciudad Sandino', 'El Crucero', 'San Francisco Libre', 'Tipitapa', 'Villa Carlos Fonseca'] },
		{ name: 'León', cities: ['León', 'La Paz Centro', 'Nagarote', 'Quezalguaque', 'Santa Rosa del Peñón', 'Telica'] },
		{ name: 'Granada', cities: ['Granada', 'Diriá', 'Diriomo', 'Nandaime'] },
		{ name: 'Masaya', cities: ['Masaya', 'Catarina', 'La Concepción', 'Masatepe', 'Nandasmo', 'Nindirí', 'Niquinohomo', 'San Juan de Oriente', 'Tisma'] },
		{ name: 'Carazo', cities: ['Jinotepe', 'Diriamba', 'Dolores', 'El Rosario', 'La Conquista', 'La Paz de Carazo', 'San Marcos', 'Santa Teresa'] },
		{ name: 'Chinandega', cities: ['Chinandega', 'Chichigalpa', 'Corinto', 'El Realejo', 'El Viejo', 'Posoltega', 'Puerto Morazán', 'San Francisco del Norte', 'San Pedro del Norte', 'Santo Tomás del Norte', 'Somotillo', 'Villanueva'] },
		{ name: 'Rivas', cities: ['Rivas', 'Altagracia', 'Belén', 'Buenos Aires', 'Cárdenas', 'Moyogalpa', 'Potosí', 'San Jorge', 'San Juan del Sur', 'Tola'] },
		{ name: 'Boaco', cities: ['Boaco', 'Camoapa', 'San José de los Remates', 'San Lorenzo', 'Santa Lucía', 'Teustepe'] },
		{ name: 'Chontales', cities: ['Juigalpa', 'Acoyapa', 'Comalapa', 'El Coral', 'La Libertad', 'San Francisco de Cuapa', 'San Pedro de Lóvago', 'Santo Domingo', 'Santo Tomás', 'Villa Sandino'] },
		{ name: 'Jinotega', cities: ['Jinotega', 'El Cuá', 'La Concordia', 'San José de Bocay', 'San Rafael del Norte', 'San Sebastián de Yalí', 'Santa María de Pantasma', 'Wiwilí de Jinotega'] },
		{ name: 'Matagalpa', cities: ['Matagalpa', 'Ciudad Darío', 'El Tuma - La Dalia', 'Esquipulas', 'Matiguás', 'Muy Muy', 'Rancho Grande', 'Río Blanco', 'San Dionisio', 'San Isidro', 'San Ramón', 'Sébaco', 'Terrabona'] },
		{ name: 'Nueva Segovia', cities: ['Ocotal', 'Ciudad Antigua', 'Dipilto', 'El Jícaro', 'Jalapa', 'Macuelizo', 'Mozonte', 'Murra', 'Quilalí', 'San Fernando', 'Santa María', 'Wiwilí de Nueva Segovia'] },
		{ name: 'Estelí', cities: ['Estelí', 'Condega', 'La Trinidad', 'Pueblo Nuevo', 'San Juan de Limay', 'San Nicolás'] },
		{ name: 'Madriz', cities: ['Somoto', 'Las Sabanas', 'Palacagüina', 'San José de Cusmapa', 'San Lucas', 'Telpaneca', 'Totogalpa', 'Yalagüina'] },
		{ name: 'Río San Juan', cities: ['San Carlos', 'El Almendro', 'El Castillo', 'Morrito', 'San Miguelito'] },
		{ name: 'RACCS', cities: ['Bluefields', 'Corn Island', 'Desembocadura de la Cruz de Río Grande', 'El Ayote', 'El Rama', 'El Tortuguero', 'Kukra Hill', 'La Cruz de Río Grande', 'Laguna de Perlas', 'Muelle de los Bueyes', 'Nueva Guinea', 'Paiwas'] },
		{ name: 'RACCN', cities: ['Bilwi', 'Bonanza', 'Mulukukú', 'Prinzapolka', 'Rosita', 'Siuna', 'Waslala', 'Waspam'] }
	];

	$: availableCities = selectedDepartment ? departments.find(d => d.name === selectedDepartment)?.cities || [] : [];

	// Paginación
	let currentPage = 1;
	let itemsPerPage = 5;
	let totalPages = 1;

	// Contador de filtros activos
	$: activeFiltersCount = [
		selectedProviderType !== 'all',
		priceRange[0] > 10 || priceRange[1] < 3000,
		selectedDepartment,
		selectedCity,
		selectedTime
	].filter(Boolean).length;

	$: {
		totalPages = Math.ceil(providers.length / itemsPerPage);
	}

	$: paginatedProviders = providers.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	function goToPage(page: number) {
		if (page >= 1 && page <= totalPages) {
			currentPage = page;
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}

	async function fetchProviders() {
		loading = true;
		error = null;
		
		try {
			const url = `/api/providers?category=${encodeURIComponent(category)}`;
			const response = await fetch(url);
			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.message || 'Error al cargar proveedores');
			}

			// Aplicar todos los filtros
			let filteredProviders = result.data.providers.filter((provider: Provider) => {
				// Filtro de precio
				const priceMatch = provider.hourly_rate >= priceRange[0] && provider.hourly_rate <= priceRange[1];
				
				// Filtro de tipo de proveedor
				const typeMatch = selectedProviderType === 'all' || provider.provider_type === selectedProviderType;
				
				// Filtro de departamento (búsqueda flexible en el campo location)
				const departmentMatch = !selectedDepartment || 
					(provider.location && provider.location.toLowerCase().includes(selectedDepartment.toLowerCase()));
				
				// Filtro de ciudad (búsqueda flexible en el campo location)
				const cityMatch = !selectedCity || 
					(provider.location && provider.location.toLowerCase().includes(selectedCity.toLowerCase()));

				return priceMatch && typeMatch && departmentMatch && cityMatch;
			});

			// Ordenar por rating (más alto primero)
			filteredProviders.sort((a: Provider, b: Provider) => b.rating - a.rating);

			providers = filteredProviders;
			currentPage = 1;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Error al cargar proveedores';
		} finally {
			loading = false;
		}
	}

	function applyFilters() {
		if (typeof window !== 'undefined') {
			fetchProviders();
			showFiltersModal = false;
		}
	}

	function clearFilters() {
		selectedProviderType = 'all';
		priceRange = [10, 3000];
		selectedDepartment = '';
		selectedCity = '';
		selectedTime = '';
		applyFilters();
	}

	function openProfileModal(provider: Provider) {
		// Agregar datos de ejemplo para demostración (en implementación real vendrían de la API)
		const enhancedProvider = {
			...provider,
			bio: provider.bio || `Soy un profesional con más de 5 años de experiencia en ${formatCategoryName(category).toLowerCase()}. Me especializo en brindar servicios de alta calidad, siempre enfocado en la satisfacción del cliente. Trabajo con materiales de primera calidad y utilizo las mejores técnicas del mercado.`,
			portfolio: provider.portfolio || [
				{
					id: '1',
					image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
					title: 'Renovación de cocina',
					description: 'Proyecto completo de remodelación'
				},
				{
					id: '2', 
					image_url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop',
					title: 'Instalación eléctrica',
					description: 'Sistema eléctrico residencial'
				},
				{
					id: '3',
					image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop', 
					title: 'Trabajo de plomería',
					description: 'Reparación de tubería principal'
				},
				{
					id: '4',
					image_url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=300&fit=crop',
					title: 'Limpieza profunda',
					description: 'Servicio post-construcción'
				},
				{
					id: '5',
					image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
					title: 'Jardinería y paisajismo',
					description: 'Diseño de jardín completo'
				},
				{
					id: '6',
					image_url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop',
					title: 'Pintura exterior',
					description: 'Fachada de casa residencial'
				},
				{
					id: '7',
					image_url: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=300&fit=crop',
					title: 'Carpintería fina',
					description: 'Muebles a medida'
				},
				{
					id: '8',
					image_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
					title: 'Instalación de pisos',
					description: 'Piso laminado de alta calidad'
				}
			],
			reviews: provider.reviews || [
				{
					id: '1',
					rating: 5,
					comment: 'Excelente trabajo, muy profesional y puntual. Recomiendo 100%.',
					reviewer_name: 'María González',
					created_at: '2024-01-15T10:30:00Z',
					can_review: false
				},
				{
					id: '2',
					rating: 4,
					comment: 'Buen servicio, llegó a tiempo y completó el trabajo como esperaba.',
					reviewer_name: 'Carlos Mendoza',
					created_at: '2024-01-10T14:20:00Z',
					can_review: false
				},
				{
					id: '3',
					rating: 5,
					comment: 'Superó mis expectativas. Trabajo de muy alta calidad y precio justo.',
					reviewer_name: 'Ana Rodríguez',
					created_at: '2024-01-05T16:45:00Z',
					can_review: false
				}
			]
		};
		
		selectedProvider = enhancedProvider;
		showProfileModal = true;
		// Prevenir scroll del body cuando el modal está abierto
		document.body.style.overflow = 'hidden';
	}

	function closeProfileModal() {
		showProfileModal = false;
		selectedProvider = null;
		showReviewForm = false;
		showAllPortfolio = false;
		newReview = { rating: 5, comment: '' };
		// Restaurar scroll del body
		document.body.style.overflow = 'auto';
	}

	function toggleReviewForm() {
		showReviewForm = !showReviewForm;
		if (showReviewForm) {
			newReview = { rating: 5, comment: '' };
		}
	}

	async function submitReview() {
		if (!selectedProvider || !newReview.comment.trim()) return;
		
		submittingReview = true;
		try {
			// Aquí iría la llamada a la API para enviar el review
			// Por ahora simulamos el comportamiento
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			// Agregar el review localmente (en una implementación real vendría de la API)
			const newReviewData = {
				id: Date.now().toString(),
				rating: newReview.rating,
				comment: newReview.comment,
				reviewer_name: 'Usuario Actual', // En implementación real vendría del usuario logueado
				created_at: new Date().toISOString(),
				can_review: false
			};
			
			if (selectedProvider.reviews) {
				selectedProvider.reviews = [newReviewData, ...selectedProvider.reviews];
			} else {
				selectedProvider.reviews = [newReviewData];
			}
			
			// Recalcular rating promedio
			if (selectedProvider.reviews.length > 0) {
				const avgRating = selectedProvider.reviews.reduce((sum, review) => sum + review.rating, 0) / selectedProvider.reviews.length;
				selectedProvider.rating = Math.round(avgRating * 10) / 10;
				selectedProvider.total_reviews = selectedProvider.reviews.length;
			}
			
			// Resetear formulario
			showReviewForm = false;
			newReview = { rating: 5, comment: '' };
			
		} catch (error) {
			console.error('Error submitting review:', error);
		} finally {
			submittingReview = false;
		}
	}

	function formatDate(dateString: string) {
		const date = new Date(dateString);
		return date.toLocaleDateString('es-ES', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function formatCategoryName(slug: string): string {
		return slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');
	}

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('es-NI', {
			style: 'currency',
			currency: 'NIO'
		}).format(amount);
	}

	function getStarRating(rating: number) {
		const fullStars = Math.floor(rating);
		const hasHalfStar = rating % 1 >= 0.5;
		const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
		
		return {
			full: fullStars,
			half: hasHalfStar,
			empty: emptyStars
		};
	}

	// Sistema de comentarios
	let showReviewForm = false;
	let newReview = {
		rating: 5,
		comment: ''
	};
	let submittingReview = false;

	// Sistema de portafolio
	let showAllPortfolio = false;

	// 1. Remove the general category services section (from the markup)
	// 2. Add a reactive variable to store provider services
	let providerServicesMap: Record<string, any[]> = {};

	// 3. Fetch services for each provider after fetching providers
	async function fetchProviderServices(providerId: string) {
		try {
			const url = `/api/services?provider_profile_id=${providerId}`;
			const response = await fetch(url);
			const result = await response.json();
			if (response.ok && result.data && result.data.services) {
				providerServicesMap[providerId] = result.data.services;
			} else {
				providerServicesMap[providerId] = [];
			}
		} catch (e) {
			providerServicesMap[providerId] = [];
		}
	}

	// 4. After fetching providers, fetch their services
	$: if (!loading && providers.length > 0) {
		providers.forEach((provider) => {
			if (!providerServicesMap[provider.id]) {
				fetchProviderServices(provider.id);
			}
		});
	}

	onMount(() => {
		fetchProviders();
		loadCategoryServices();
	});

	function loadCategoryServices() {
		// Cargar servicios específicos de la categoría
		categoryServices = getTemplatesByCategoryName(formatCategoryName(category));
	}

	// Limpiar body scroll al desmontar el componente
	onDestroy(() => {
		document.body.style.overflow = 'auto';
	});

	// Manejar tecla Escape para cerrar modal
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && showProfileModal) {
			closeProfileModal();
		}
	}

	$: if (typeof window !== 'undefined' && priceRange) {
		applyFilters();
	}

	$: if (typeof window !== 'undefined' && selectedProviderType) {
		applyFilters();
	}

	$: if (typeof window !== 'undefined' && selectedDepartment) {
		applyFilters();
	}

	$: if (typeof window !== 'undefined' && selectedCity) {
		applyFilters();
	}

	$: if (typeof window !== 'undefined' && selectedTime) {
		applyFilters();
	}

	function togglePortfolio() {
		showAllPortfolio = !showAllPortfolio;
	}
</script>

<svelte:head>
	<title>{formatCategoryName(category)} - Proveedores | Domify</title>
	<meta name="description" content="Encuentra los mejores proveedores de {formatCategoryName(category)} en tu área. Profesionales verificados y calificados." />
</svelte:head>

<svelte:window on:keydown={handleKeydown} />

<div class="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50">
	<!-- Hero Section -->
	<section class="bg-gradient-to-r from-primary-600 to-primary-700 py-16">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="text-center">
				<h1 class="text-4xl lg:text-5xl font-bold text-white mb-4">
					Proveedores de {formatCategoryName(category)}
				</h1>
				<p class="text-xl text-primary-100 max-w-3xl mx-auto">
					Encuentra profesionales verificados y experimentados para tus proyectos de {formatCategoryName(category).toLowerCase()}
				</p>
			</div>
		</div>
	</section>

	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<div class="flex flex-col lg:flex-row gap-8">
			<!-- Filtros Mobile Button -->
			{#if !loading && providers.length > 0}
				<div class="lg:hidden">
					<button 
						class="w-full flex items-center justify-center gap-2 bg-white border border-secondary-300 rounded-lg px-4 py-3 text-secondary-700 font-medium hover:bg-secondary-50 transition-colors duration-200 relative"
						on:click={() => showFiltersModal = true}
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"></path>
						</svg>
						Filtros
						{#if activeFiltersCount > 0}
							<span class="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
								{activeFiltersCount}
							</span>
						{/if}
					</button>
				</div>
			{/if}

			<!-- Sidebar Filtros Desktop -->
			{#if !loading && providers.length > 0}
				<aside class="hidden lg:block w-80 flex-shrink-0">
				<div class="bg-white rounded-2xl shadow-soft border border-secondary-200 p-6 sticky top-8">
					<h2 class="text-xl font-bold text-secondary-900 mb-6 pb-3 border-b border-secondary-200">
						Filtros
					</h2>

					<!-- Tipo de Proveedor -->
					<div class="mb-6">
						<h3 class="text-sm font-semibold text-secondary-700 mb-3">Tipo de Proveedor</h3>
						<div class="space-y-2">
							<label class="flex items-center">
								<input type="radio" bind:group={selectedProviderType} value="all" class="text-primary-600 focus:ring-primary-500" />
								<span class="ml-3 text-sm text-secondary-700">Todos</span>
							</label>
							<label class="flex items-center">
								<input type="radio" bind:group={selectedProviderType} value="individual" class="text-primary-600 focus:ring-primary-500" />
								<span class="ml-3 text-sm text-secondary-700">Individuos</span>
							</label>
							<label class="flex items-center">
								<input type="radio" bind:group={selectedProviderType} value="company" class="text-primary-600 focus:ring-primary-500" />
								<span class="ml-3 text-sm text-secondary-700">Empresas</span>
							</label>
						</div>
					</div>

					<!-- Rango de Precio -->
					<div class="mb-6">
						<h3 class="text-sm font-semibold text-secondary-700 mb-3">Precio por Hora</h3>
						<div class="flex items-center gap-3 mb-2">
							<div class="flex-1">
								<label class="block text-xs text-secondary-600 mb-1">Desde</label>
								<input 
									type="number" 
									bind:value={priceRange[0]} 
									min="10" 
									max="3000" 
									class="w-full px-3 py-2 border border-secondary-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
								/>
							</div>
							<span class="text-secondary-400 mt-5">-</span>
							<div class="flex-1">
								<label class="block text-xs text-secondary-600 mb-1">Hasta</label>
								<input 
									type="number" 
									bind:value={priceRange[1]} 
									min="10" 
									max="3000" 
									class="w-full px-3 py-2 border border-secondary-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
								/>
							</div>
						</div>
						<p class="text-xs text-secondary-500">Precio promedio: C$300/hr</p>
					</div>

					<!-- Ubicación Geográfica -->
					<div class="mb-6">
						<h3 class="text-sm font-semibold text-secondary-700 mb-3">Ubicación</h3>
						<div class="space-y-3">
							<div>
								<label class="block text-xs text-secondary-600 mb-1">Departamento</label>
								<select 
									bind:value={selectedDepartment} 
									on:change={() => selectedCity = ''}
									class="w-full px-3 py-2 border border-secondary-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
								>
									<option value="">Todos los departamentos</option>
									{#each departments as dept}
										<option value={dept.name}>{dept.name}</option>
									{/each}
								</select>
							</div>
							{#if selectedDepartment}
								<div>
									<label class="block text-xs text-secondary-600 mb-1">Ciudad</label>
									<select 
										bind:value={selectedCity} 
										class="w-full px-3 py-2 border border-secondary-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
									>
										<option value="">Todas las ciudades</option>
										{#each availableCities as city}
											<option value={city}>{city}</option>
										{/each}
									</select>
								</div>
							{/if}
						</div>
					</div>

					<!-- Hora del Día -->
					<div class="mb-6">
						<h3 class="text-sm font-semibold text-secondary-700 mb-3">Hora Preferida</h3>
						<select 
							bind:value={selectedTime} 
							class="w-full px-3 py-2 border border-secondary-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
						>
							<option value="">Cualquier hora</option>
							<option value="07:00">7:00 AM</option>
							<option value="08:00">8:00 AM</option>
							<option value="09:00">9:00 AM</option>
							<option value="10:00">10:00 AM</option>
							<option value="11:00">11:00 AM</option>
							<option value="12:00">12:00 PM</option>
							<option value="13:00">1:00 PM</option>
							<option value="14:00">2:00 PM</option>
							<option value="15:00">3:00 PM</option>
							<option value="16:00">4:00 PM</option>
							<option value="17:00">5:00 PM</option>
							<option value="18:00">6:00 PM</option>
							<option value="19:00">7:00 PM</option>
							<option value="20:00">8:00 PM</option>
							<option value="21:00">9:00 PM</option>
						</select>
					</div>

					<div class="space-y-3">
						<button 
							class="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200"
							on:click={applyFilters}
						>
							Aplicar Filtros
						</button>
						
						{#if activeFiltersCount > 0}
							<button 
								class="w-full bg-secondary-100 text-secondary-700 py-2 px-4 rounded-lg font-medium hover:bg-secondary-200 transition-colors duration-200"
								on:click={clearFilters}
							>
								Limpiar Filtros ({activeFiltersCount})
							</button>
						{/if}
					</div>
				</div>
			</aside>
			{/if}

			<!-- Contenido Principal -->
			<main class="flex-1 min-w-0" id="providers">
				<!-- Información de resultados -->
				{#if !loading && !error}
					<div class="mb-6">
						<div class="flex items-center justify-between">
							<p class="text-secondary-600">
								{#if activeFiltersCount > 0}
									Se encontraron <span class="font-semibold text-secondary-900">{providers.length}</span> proveedores con los filtros aplicados
								{:else}
									Mostrando <span class="font-semibold text-secondary-900">{providers.length}</span> proveedores disponibles
								{/if}
								{#if totalPages > 1}
									<span class="text-sm text-secondary-500 ml-2">
										(Página {currentPage} de {totalPages} - {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, providers.length)} de {providers.length})
									</span>
								{/if}
							</p>
							{#if activeFiltersCount > 0}
								<button 
									class="text-sm text-primary-600 hover:text-primary-700 font-medium"
									on:click={clearFilters}
								>
									Limpiar filtros
								</button>
							{/if}
						</div>
					</div>
				{/if}

				{#if loading}
					<div class="flex items-center justify-center py-16">
						<LoadingSpinner size="lg" color="primary" text="Cargando proveedores..." />
					</div>
				{:else if error}
					<div class="text-center py-16">
						<div class="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
							<svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
							</svg>
						</div>
						<h3 class="text-xl font-semibold text-secondary-900 mb-2">Error al cargar proveedores</h3>
						<p class="text-secondary-600 mb-6">{error}</p>
						<button 
							class="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
							on:click={fetchProviders}
						>
							Intentar de nuevo
						</button>
					</div>
				{:else if providers.length === 0}
					<div class="text-center py-20 max-w-2xl mx-auto">
						<div class="inline-flex items-center justify-center w-20 h-20 bg-secondary-100 rounded-full mb-6">
							<svg class="w-10 h-10 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0118 12a8 8 0 10-8 8 7.962 7.962 0 014.709-1.291M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
							</svg>
						</div>
						<h3 class="text-2xl font-bold text-secondary-900 mb-4">
							¡Ups! No hay proveedores disponibles
						</h3>
						<p class="text-lg text-secondary-600 mb-8 leading-relaxed">
							Actualmente no tenemos proveedores de <strong>{formatCategoryName(category).toLowerCase()}</strong> en tu área. 
							<br />Pero no te preocupes, ¡estamos creciendo cada día!
						</p>
						
						<div class="flex flex-col sm:flex-row gap-4 justify-center">
							<button 
								class="px-8 py-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center gap-2"
								on:click={() => window.location.href = '/'}
							>
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
								</svg>
								Ir a Inicio
							</button>
							<button 
								class="px-8 py-4 border-2 border-primary-600 text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors duration-200 flex items-center justify-center gap-2"
								on:click={() => window.location.href = '/become-provider'}
							>
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
								</svg>
								Convertirse en Proveedor
							</button>
						</div>

						<div class="mt-12 p-6 bg-primary-50 rounded-xl border border-primary-200">
							<h4 class="text-lg font-semibold text-primary-900 mb-2">
								¿Eres un profesional de {formatCategoryName(category).toLowerCase()}?
							</h4>
							<p class="text-primary-700 mb-4">
								Únete a nuestra plataforma y sé el primero en ofrecer este servicio en tu área.
							</p>
							<button 
								class="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200"
								on:click={() => window.location.href = '/become-provider'}
							>
								Registrarse como Proveedor
							</button>
						</div>
					</div>
				{:else}
					<!-- Lista de Proveedores -->
					<div class="space-y-6">
						{#each paginatedProviders as provider (provider.id)}
							{@const stars = getStarRating(provider.rating ?? 0)}
							<div class="bg-white rounded-2xl shadow-soft border border-secondary-200 p-6 hover:shadow-lg transition-shadow duration-300">
								<div class="flex flex-col sm:flex-row gap-6">
									<!-- Foto del Proveedor -->
									<div class="flex-shrink-0 self-center sm:self-start">
										<div class="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-primary-200">
											{#if provider.photo_url}
												<img 
													src={provider.photo_url} 
													alt={provider.business_name}
													class="w-full h-full object-cover"
												/>
											{:else}
												<div class="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
													<span class="text-white text-2xl font-bold">
														{provider.business_name.charAt(0)}
													</span>
												</div>
											{/if}
										</div>
									</div>

									<!-- Información del Proveedor -->
									<div class="flex-1 min-w-0">
										<div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
											<div>
												<h3 class="text-xl font-bold text-secondary-900 mb-2">
													{provider.business_name}
												</h3>
												
												<!-- Rating -->
												<div class="flex items-center gap-2 mb-2">
													<div class="flex items-center">
														{#each Array(stars.full) as _}
															<svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
																<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
															</svg>
														{/each}
														{#if stars.half}
															<svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
																<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" opacity="0.5"></path>
															</svg>
														{/if}
														{#each Array(stars.empty) as _}
															<svg class="w-5 h-5 text-secondary-300" fill="currentColor" viewBox="0 0 20 20">
																<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
															</svg>
														{/each}
													</div>
													<span class="text-sm font-medium text-secondary-600">
														{provider.rating.toFixed(1)}
													</span>
												</div>

												<!-- Ubicación -->
												<div class="flex items-center gap-1 text-sm text-secondary-600 mb-3">
													<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
													</svg>
													{provider.location || 'Ubicación no especificada'}
												</div>
											</div>

											<!-- Precio -->
											<div class="text-right">
												<div class="text-2xl font-bold text-primary-600">
													C${provider.hourly_rate}
												</div>
												<div class="text-sm text-secondary-600">por hora</div>
											</div>
										</div>

										<!-- Descripción -->
										<p class="text-secondary-700 mb-4 line-clamp-2">
											{provider.description}
										</p>

										<!-- Servicios específicos del proveedor -->
										<div class="mb-4">
											<h4 class="text-md font-semibold text-primary-700 mb-2">Servicios que ofrece:</h4>
											{#if providerServicesMap[provider.id] && providerServicesMap[provider.id].length > 0}
												<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
													{#each providerServicesMap[provider.id] as service}
														<div class="flex items-center gap-2 border border-gray-100 rounded-lg px-3 py-2 bg-gray-50">
															<span class="text-xl">{service.icon || '🛠️'}</span>
															<div>
																<div class="font-medium text-gray-900">{service.title}</div>
																<div class="text-xs text-gray-600">{service.description}</div>
																<div class="text-sm font-bold text-blue-600 mt-1">{formatCurrency(service.price)}</div>
															</div>
														</div>
													{/each}
												</div>
											{:else}
												<div class="text-sm text-gray-500 italic">Este proveedor aún no ha agregado servicios específicos.</div>
											{/if}
										</div>

										<!-- Reseñas -->
										{#if provider.total_reviews && provider.total_reviews > 0}
											<div class="flex items-center gap-1 text-sm text-secondary-600 mb-4">
												<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-2.248-.307l-3.5 2.151.643-2.818A8.003 8.003 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"></path>
												</svg>
												{provider.total_reviews} reseñas
											</div>
										{/if}

										<!-- Botones de Acción -->
										<div class="flex flex-col sm:flex-row gap-3">
											<button 
												class="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200"
												on:click={() => openProfileModal(provider)}
											>
												Ver Perfil
											</button>
											<button class="flex-1 border-2 border-primary-600 text-primary-600 py-3 px-6 rounded-lg font-semibold hover:bg-primary-50 transition-colors duration-200">
												Contactar
											</button>
										</div>
									</div>
								</div>
							</div>
						{/each}
					</div>

					<!-- Paginación -->
					{#if totalPages > 1}
						<div class="flex items-center justify-center gap-2 mt-8">
							<button 
								class="px-4 py-2 border border-secondary-300 rounded-lg text-secondary-600 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
								disabled={currentPage === 1}
								on:click={() => goToPage(currentPage - 1)}
							>
								Anterior
							</button>
							
							{#each Array.from({ length: totalPages }, (_, i) => i + 1) as pageNum}
								{#if pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)}
									<button 
										class="px-4 py-2 rounded-lg font-medium transition-colors duration-200 border"
										class:bg-primary-600={pageNum === currentPage}
										class:text-white={pageNum === currentPage}
										class:border-primary-600={pageNum === currentPage}
										class:text-secondary-600={pageNum !== currentPage}
										class:hover:bg-secondary-50={pageNum !== currentPage}
										class:border-secondary-300={pageNum !== currentPage}
										on:click={() => goToPage(pageNum)}
									>
										{pageNum}
									</button>
								{:else if pageNum === currentPage - 2 || pageNum === currentPage + 2}
									<span class="px-2 text-secondary-400">...</span>
								{/if}
							{/each}
							
							<button 
								class="px-4 py-2 border border-secondary-300 rounded-lg text-secondary-600 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
								disabled={currentPage === totalPages}
								on:click={() => goToPage(currentPage + 1)}
							>
								Siguiente
							</button>
						</div>
					{/if}
				{/if}
			</main>
		</div>
	</div>
</div>

<!-- Modal de Filtros Mobile -->
{#if showFiltersModal}
	<div class="fixed inset-0 z-50 lg:hidden">
		<!-- Overlay -->
		<div class="fixed inset-0 bg-black bg-opacity-50" on:click={() => showFiltersModal = false}></div>
		
		<!-- Modal -->
		<div class="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl">
			<div class="flex flex-col h-full">
				<!-- Header -->
				<div class="flex items-center justify-between p-6 border-b border-secondary-200">
					<h2 class="text-lg font-semibold text-secondary-900">Filtros</h2>
					<button 
						class="p-2 hover:bg-secondary-100 rounded-lg transition-colors duration-200"
						on:click={() => showFiltersModal = false}
					>
						<svg class="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
						</svg>
					</button>
				</div>
				
				<!-- Content -->
				<div class="flex-1 overflow-y-auto p-6 space-y-6">
					<!-- Tipo de Proveedor -->
					<div>
						<h3 class="text-sm font-semibold text-secondary-700 mb-3">Tipo de Proveedor</h3>
						<div class="space-y-2">
							<label class="flex items-center">
								<input type="radio" bind:group={selectedProviderType} value="all" class="text-primary-600 focus:ring-primary-500" />
								<span class="ml-3 text-sm text-secondary-700">Todos</span>
							</label>
							<label class="flex items-center">
								<input type="radio" bind:group={selectedProviderType} value="individual" class="text-primary-600 focus:ring-primary-500" />
								<span class="ml-3 text-sm text-secondary-700">Individuos</span>
							</label>
							<label class="flex items-center">
								<input type="radio" bind:group={selectedProviderType} value="company" class="text-primary-600 focus:ring-primary-500" />
								<span class="ml-3 text-sm text-secondary-700">Empresas</span>
							</label>
						</div>
					</div>

					<!-- Rango de Precio -->
					<div>
						<h3 class="text-sm font-semibold text-secondary-700 mb-3">Precio por Hora</h3>
						<div class="flex items-center gap-3 mb-2">
							<div class="flex-1">
								<label class="block text-xs text-secondary-600 mb-1">Desde</label>
								<input 
									type="number" 
									bind:value={priceRange[0]} 
									min="10" 
									max="3000" 
									class="w-full px-3 py-2 border border-secondary-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
								/>
							</div>
							<span class="text-secondary-400 mt-5">-</span>
							<div class="flex-1">
								<label class="block text-xs text-secondary-600 mb-1">Hasta</label>
								<input 
									type="number" 
									bind:value={priceRange[1]} 
									min="10" 
									max="3000" 
									class="w-full px-3 py-2 border border-secondary-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
								/>
							</div>
						</div>
						<p class="text-xs text-secondary-500">Precio promedio: C$300/hr</p>
					</div>

					<!-- Ubicación Geográfica -->
					<div>
						<h3 class="text-sm font-semibold text-secondary-700 mb-3">Ubicación</h3>
						<div class="space-y-3">
							<div>
								<label class="block text-xs text-secondary-600 mb-1">Departamento</label>
								<select 
									bind:value={selectedDepartment} 
									on:change={() => selectedCity = ''}
									class="w-full px-3 py-2 border border-secondary-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
								>
									<option value="">Todos los departamentos</option>
									{#each departments as dept}
										<option value={dept.name}>{dept.name}</option>
									{/each}
								</select>
							</div>
							{#if selectedDepartment}
								<div>
									<label class="block text-xs text-secondary-600 mb-1">Ciudad</label>
									<select 
										bind:value={selectedCity} 
										class="w-full px-3 py-2 border border-secondary-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
									>
										<option value="">Todas las ciudades</option>
										{#each availableCities as city}
											<option value={city}>{city}</option>
										{/each}
									</select>
								</div>
							{/if}
						</div>
					</div>

					<!-- Hora del Día -->
					<div>
						<h3 class="text-sm font-semibold text-secondary-700 mb-3">Hora Preferida</h3>
						<select 
							bind:value={selectedTime} 
							class="w-full px-3 py-2 border border-secondary-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
						>
							<option value="">Cualquier hora</option>
							<option value="07:00">7:00 AM</option>
							<option value="08:00">8:00 AM</option>
							<option value="09:00">9:00 AM</option>
							<option value="10:00">10:00 AM</option>
							<option value="11:00">11:00 AM</option>
							<option value="12:00">12:00 PM</option>
							<option value="13:00">1:00 PM</option>
							<option value="14:00">2:00 PM</option>
							<option value="15:00">3:00 PM</option>
							<option value="16:00">4:00 PM</option>
							<option value="17:00">5:00 PM</option>
							<option value="18:00">6:00 PM</option>
							<option value="19:00">7:00 PM</option>
							<option value="20:00">8:00 PM</option>
							<option value="21:00">9:00 PM</option>
						</select>
					</div>
				</div>
				
				<!-- Footer -->
				<div class="p-6 border-t border-secondary-200 space-y-3">
					<button 
						class="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200"
						on:click={applyFilters}
					>
						Aplicar Filtros
					</button>
					
					{#if activeFiltersCount > 0}
						<button 
							class="w-full bg-secondary-100 text-secondary-700 py-2 px-4 rounded-lg font-medium hover:bg-secondary-200 transition-colors duration-200"
							on:click={clearFilters}
						>
							Limpiar Filtros ({activeFiltersCount})
						</button>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- Modal de Perfil del Proveedor -->
{#if showProfileModal && selectedProvider}
	{@const stars = getStarRating(selectedProvider.rating ?? 0)}
	<div class="fixed inset-0 z-50 overflow-y-auto">
		<!-- Overlay -->
		<div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" on:click={closeProfileModal}></div>
		
		<!-- Modal -->
		<div class="flex min-h-full items-center justify-center p-4">
			<div class="relative bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
				<!-- Header -->
				<div class="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
					<div class="flex items-center justify-between">
						<h2 class="text-2xl font-bold text-white">Perfil del Proveedor</h2>
						<button 
							class="p-2 hover:bg-primary-500 rounded-lg transition-colors duration-200"
							on:click={closeProfileModal}
						>
							<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
							</svg>
						</button>
					</div>
				</div>
				
				<!-- Content -->
				<div class="overflow-y-auto max-h-[calc(90vh-80px)]">
					<div class="p-6">
						<!-- Información Principal -->
						<div class="flex flex-col lg:flex-row gap-8 mb-8">
							<!-- Foto y Info Básica -->
							<div class="flex-shrink-0">
								<div class="text-center">
									<div class="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-primary-200 mb-4">
										{#if selectedProvider.photo_url}
											<img 
												src={selectedProvider.photo_url} 
												alt={selectedProvider.business_name}
												class="w-full h-full object-cover"
											/>
										{:else}
											<div class="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
												<span class="text-white text-3xl font-bold">
													{selectedProvider.business_name.charAt(0)}
												</span>
											</div>
										{/if}
									</div>
									
									<!-- Rating -->
									<div class="flex items-center justify-center gap-2 mb-2">
										<div class="flex items-center">
											{#each Array(stars.full) as _}
												<svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
													<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
												</svg>
											{/each}
											{#if stars.half}
												<svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
													<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" opacity="0.5"></path>
												</svg>
											{/if}
											{#each Array(stars.empty) as _}
												<svg class="w-5 h-5 text-secondary-300" fill="currentColor" viewBox="0 0 20 20">
													<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
												</svg>
											{/each}
										</div>
										<span class="text-lg font-semibold text-secondary-600">
											{selectedProvider.rating.toFixed(1)}
										</span>
									</div>
									
									{#if selectedProvider.total_reviews && selectedProvider.total_reviews > 0}
										<p class="text-sm text-secondary-600 mb-4">
											{selectedProvider.total_reviews} reseñas
										</p>
									{/if}
									
									<!-- Precio -->
									<div class="bg-primary-50 rounded-xl p-4 mb-4">
										<div class="text-3xl font-bold text-primary-600 mb-1">
											C${selectedProvider.hourly_rate}
										</div>
										<div class="text-sm text-primary-700">por hora</div>
									</div>
								</div>
							</div>
							
							<!-- Información Detallada -->
							<div class="flex-1">
								<h1 class="text-3xl font-bold text-secondary-900 mb-4">
									{selectedProvider.business_name}
								</h1>
								
								<!-- Tipo de Proveedor -->
								<div class="flex items-center gap-2 mb-4">
									<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
										{#if selectedProvider.provider_type === 'individual'}
											👤 Individual
										{:else}
											🏢 Empresa
										{/if}
									</span>
								</div>
								
								<!-- Ubicación -->
								<div class="flex items-center gap-2 text-secondary-600 mb-6">
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
									</svg>
									<span class="text-lg">{selectedProvider.location || 'Ubicación no especificada'}</span>
								</div>
								
								<!-- Biografía -->
								{#if selectedProvider.bio}
									<div class="mb-6">
										<h3 class="text-xl font-semibold text-secondary-900 mb-3">Biografía</h3>
										<p class="text-secondary-700 leading-relaxed">
											{selectedProvider.bio}
										</p>
									</div>
								{/if}
								
								<!-- Descripción del Servicio -->
								<div class="mb-6">
									<h3 class="text-xl font-semibold text-secondary-900 mb-3">Acerca del Servicio</h3>
									<p class="text-secondary-700 leading-relaxed">
										{selectedProvider.description || 'Sin descripción disponible.'}
									</p>
								</div>
								
								<!-- Información de Contacto (SIN EMAIL) -->
								{#if selectedProvider.phone}
									<div class="mb-6">
										<h3 class="text-xl font-semibold text-secondary-900 mb-3">Información de Contacto</h3>
										<div class="flex items-center gap-3">
											<div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
												<svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
												</svg>
											</div>
											<div>
												<p class="font-medium text-secondary-900">Teléfono</p>
												<p class="text-secondary-600">{selectedProvider.phone}</p>
											</div>
										</div>
									</div>
								{/if}
							</div>
						</div>
						
						<!-- Portafolio de Trabajos -->
						{#if selectedProvider.portfolio && selectedProvider.portfolio.length > 0}
							<div class="mb-8">
								<div class="flex items-center justify-between mb-4">
									<h3 class="text-2xl font-semibold text-secondary-900">
										Trabajos Realizados ({selectedProvider.portfolio.length})
									</h3>
									{#if selectedProvider.portfolio.length > 5}
										<button 
											class="text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors duration-200"
											on:click={togglePortfolio}
										>
											{showAllPortfolio ? 'Ver menos' : `Ver más (${selectedProvider.portfolio.length - 5})`}
										</button>
									{/if}
								</div>
								
								<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
									{#each (showAllPortfolio ? selectedProvider.portfolio : selectedProvider.portfolio.slice(0, 5)) as work}
										<div class="bg-secondary-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300">
											<div class="aspect-video overflow-hidden">
												<img 
													src={work.image_url} 
													alt={work.title}
													class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
													loading="lazy"
												/>
											</div>
											<div class="p-3">
												<h4 class="font-medium text-secondary-900 mb-1 text-sm">{work.title}</h4>
												{#if work.description}
													<p class="text-xs text-secondary-600 line-clamp-2">{work.description}</p>
												{/if}
											</div>
										</div>
									{/each}
								</div>
								
								<!-- Botón Ver Más centrado (alternativo) -->
								{#if selectedProvider.portfolio.length > 5 && !showAllPortfolio}
									<div class="text-center mt-4">
										<button 
											class="bg-primary-100 text-primary-700 px-6 py-3 rounded-lg font-medium hover:bg-primary-200 transition-colors duration-200 inline-flex items-center gap-2"
											on:click={togglePortfolio}
										>
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
											</svg>
											Ver {selectedProvider.portfolio.length - 5} fotos más
										</button>
									</div>
								{/if}
							</div>
						{/if}
						
						<!-- Sección de Comentarios y Reviews -->
						<div class="mb-8">
							<div class="flex items-center justify-between mb-4">
								<h3 class="text-2xl font-semibold text-secondary-900">
									Comentarios ({selectedProvider.reviews?.length || 0})
								</h3>
								<button 
									class="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200"
									on:click={toggleReviewForm}
								>
									{showReviewForm ? 'Cancelar' : 'Escribir Comentario'}
								</button>
							</div>
							
							<!-- Formulario de Nuevo Comentario -->
							{#if showReviewForm}
								<div class="bg-secondary-50 rounded-xl p-6 mb-6">
									<h4 class="font-semibold text-secondary-900 mb-4">Escribir un comentario</h4>
									
									<!-- Rating -->
									<div class="mb-4">
										<label class="block text-sm font-medium text-secondary-700 mb-2">Calificación</label>
										<div class="flex items-center gap-2">
											{#each Array(5) as _, i}
												<button 
													class="text-2xl transition-colors duration-200"
													class:text-yellow-400={i < newReview.rating}
													class:text-secondary-300={i >= newReview.rating}
													on:click={() => newReview.rating = i + 1}
												>
													★
												</button>
											{/each}
											<span class="ml-2 text-sm text-secondary-600">({newReview.rating} estrella{newReview.rating !== 1 ? 's' : ''})</span>
										</div>
									</div>
									
									<!-- Comentario -->
									<div class="mb-4">
										<label class="block text-sm font-medium text-secondary-700 mb-2">Comentario</label>
										<textarea 
											bind:value={newReview.comment}
											placeholder="Escribe tu experiencia con este proveedor..."
											class="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
											rows="4"
										></textarea>
									</div>
									
									<!-- Botones -->
									<div class="flex gap-3">
										<button 
											class="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50"
											disabled={submittingReview || !newReview.comment.trim()}
											on:click={submitReview}
										>
											{#if submittingReview}
												Enviando...
											{:else}
												Enviar Comentario
											{/if}
										</button>
										<button 
											class="border border-secondary-300 text-secondary-700 px-6 py-2 rounded-lg font-medium hover:bg-secondary-50 transition-colors duration-200"
											on:click={toggleReviewForm}
										>
											Cancelar
										</button>
									</div>
								</div>
							{/if}
							
							<!-- Lista de Comentarios -->
							{#if selectedProvider.reviews && selectedProvider.reviews.length > 0}
								<div class="space-y-4">
									{#each selectedProvider.reviews as review}
										<div class="bg-white border border-secondary-200 rounded-xl p-6">
											<div class="flex items-start justify-between mb-3">
												<div>
													<h5 class="font-semibold text-secondary-900">{review.reviewer_name}</h5>
													<p class="text-sm text-secondary-500">{formatDate(review.created_at)}</p>
												</div>
												<div class="flex items-center gap-1">
													{#each Array(5) as _, i}
														<svg 
															class="w-4 h-4"
															class:text-yellow-400={i < review.rating}
															class:text-secondary-300={i >= review.rating}
															fill="currentColor" 
															viewBox="0 0 20 20"
														>
															<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
															</svg>
													{/each}
												</div>
											</div>
											<p class="text-secondary-700 leading-relaxed">{review.comment}</p>
										</div>
									{/each}
								</div>
							{:else}
								<div class="text-center py-8">
									<div class="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
										<svg class="w-8 h-8 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-2.248-.307l-3.5 2.151.643-2.818A8.003 8.003 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"></path>
										</svg>
									</div>
									<p class="text-secondary-600">Aún no hay comentarios para este proveedor.</p>
									<p class="text-sm text-secondary-500 mt-1">¡Sé el primero en dejar un comentario!</p>
								</div>
							{/if}
						</div>
						
						<!-- Botones de Acción -->
						<div class="border-t border-secondary-200 pt-6">
							<div class="flex flex-col sm:flex-row gap-4">
								<button class="flex-1 bg-green-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2">
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
									</svg>
									Llamar Ahora
								</button>
								<button class="flex-1 bg-primary-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center gap-2">
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-2.248-.307l-3.5 2.151.643-2.818A8.003 8.003 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"></path>
									</svg>
									Enviar Mensaje
								</button>
								<button class="flex-1 border-2 border-primary-600 text-primary-600 py-4 px-6 rounded-xl font-semibold hover:bg-primary-50 transition-colors duration-200 flex items-center justify-center gap-2">
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a4 4 0 118 0v4m-4 6v4m-6-2h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path>
									</svg>
									Solicitar Cotización
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if} 