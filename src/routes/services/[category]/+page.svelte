<script lang="ts">
	import { page } from '$app/stores';
	import { navigating } from '$app/stores';
	import { onMount, onDestroy } from 'svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import { getTemplatesByCategoryName, type ServiceTemplate } from '$lib/service-templates';
	import { generateCategoryMetaTags, generateCategoryJSONLD, generateBreadcrumbJSONLD } from '$lib/seo-utils';
	import type { PageData } from './$types';

	export let data: PageData;

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
		bio?: string; // Biografía personal
		settings?: {
			business?: {
				workingHours?: {
					[key: string]: {
						enabled: boolean;
						start: string;
						end: string;
					};
				};
				timezone?: string;
				currency?: string;
			};
		};
		portfolio?: Array<{
			id: string;
			image_url: string;
			title: string;
			description?: string;
			media_type?: 'image' | 'video';
			service_id?: string;
			category_id?: string;
		}>;
		reviews?: Array<{
			id: string;
			rating: number;
			comment: string;
			reviewer_name: string;
			created_at: string;
			updated_at?: string;
			reviewer_user_id?: string;
			can_review: boolean;
		}>;
	};

	let category = $page.params.category;
	
	// Generate SEO data for category
	$: categorySEOData = data.category ? {
		name: data.category.name,
		slug: data.category.slug,
		description: data.category.description,
		providers_count: providers.length,
		average_rate: providers.length > 0 ? providers.reduce((sum, p) => sum + (p.rating || 0), 0) / providers.length : undefined,
		services: categoryServices.map(s => s.title),
		parent_category: data.category.parent_category
	} : null;

	$: metaTags = categorySEOData ? generateCategoryMetaTags(categorySEOData) : null;
	$: jsonLd = categorySEOData ? generateCategoryJSONLD(categorySEOData) : null;
	$: breadcrumbData = categorySEOData ? generateBreadcrumbJSONLD([
		{ name: 'Inicio', url: 'https://domify.app' },
		{ name: 'Servicios', url: 'https://domify.app/services' },
		{ name: categorySEOData.name, url: `https://domify.app/services/${categorySEOData.slug}` }
	]) : null;
	let providers: Provider[] = [];
	
	// Initialize providers from server data if available
	$: if (data.providers && data.providers.length > 0 && providers.length === 0) {
		providers = data.providers.map((p: any) => ({
			...p,
			description: p.bio || p.description || 'Sin descripción',
			rating: p.average_rating || p.rating || 0,
			photo_url: p.photo_url || '/img/cleaning.png',
			users: p.users || { id: p.user_id, email: '', role: 'provider' }
		}));
		// console.log removed
	}
	let loading = !data.preloaded; // Solo loading si no hay preload
	let error: string | null = null;
	let showFiltersModal = false;
	let showProfileModal = false;
	let selectedProvider: any = null;
	let categoryServices: ServiceTemplate[] = [];

	// Filtros
	let selectedDate = '';
	let selectedProviderType = 'all';
	let selectedTime = '';
	let selectedDepartment = '';
	let selectedCity = '';
	let priceRange = [50, 1000];
	
	// Mini buscador
	let searchQuery = '';
	let searchResults: Array<{type: 'service' | 'provider', data: any}> = [];
	let showSearchResults = true;
	let isSearching = false;

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

	// Paginación con carga optimizada
	let currentPage = 1;
	let itemsPerPage = 8; // Aumentamos para mostrar más resultados por página
	let totalPages = 1;
	// Estado para seguimiento de carga
	let loadingNextPage = false;

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
		0, // Siempre desde el inicio
		currentPage * itemsPerPage // Hasta la página actual × elementos por página
	); // Esto implementa un "load more" en lugar de paginación tradicional

	function goToPage(page: number) {
		if (page >= 1 && page <= totalPages) {
			if (page > currentPage) {
				// Si estamos cargando más contenido
				loadingNextPage = true;
				// Simular un pequeño delay para feedback visual
				setTimeout(() => {
					currentPage = page;
					loadingNextPage = false;
				}, 300);
			} else {
				// Si estamos volviendo a una página anterior
				currentPage = page;
				window.scrollTo({ top: 0, behavior: 'smooth' });
			}
		}
	}

	// Función para cargar más resultados (reemplaza paginación tradicional)
	function loadMore() {
		if (currentPage < totalPages) {
			goToPage(currentPage + 1);
		}
	}

	// Implementación optimizada con debounce y filtrado en el servidor cuando es posible
	let fetchTimeout: ReturnType<typeof setTimeout> | null = null;

	async function fetchProviders() {
		// console.log removed
		
		// Cancelar solicitud anterior si existe
		if (fetchTimeout) {
			// console.log removed
			clearTimeout(fetchTimeout);
		}

		// Implementar debounce de 300ms para evitar múltiples llamadas
		fetchTimeout = setTimeout(async () => {
			// console.log removed
			loading = true;
			error = null;

			try {
				// Construir parámetros de URL para mover filtrado al servidor cuando sea posible
				const params = new URLSearchParams();
				params.append('category', category);

				// Añadir parámetros de filtrado que puedan procesarse en servidor
				if (selectedProviderType !== 'all') {
					params.append('provider_type', selectedProviderType);
				}
				params.append('min_price', priceRange[0].toString());
				params.append('max_price', priceRange[1].toString());
				params.append('limit', (itemsPerPage * 3).toString()); // Obtener más resultados para filtrado local

				const url = `/api/providers?${params.toString()}`;
				const response = await fetch(url);
				const result = await response.json();

				if (!response.ok) {
					throw new Error(result.message || 'Error al cargar proveedores');
				}

				// Aplicar filtros que no se pudieron hacer en servidor
				let filteredProviders = result.data.providers.filter((provider: Provider) => {
					// Filtro de departamento (búsqueda flexible en el campo location)
					const departmentMatch = !selectedDepartment || 
						(provider.location && provider.location.toLowerCase().includes(selectedDepartment.toLowerCase()));

					// Filtro de ciudad (búsqueda flexible en el campo location)
					const cityMatch = !selectedCity || 
						(provider.location && provider.location.toLowerCase().includes(selectedCity.toLowerCase()));

					return departmentMatch && cityMatch;
				});

				// Ordenar por rating (más alto primero)
				filteredProviders.sort((a: Provider, b: Provider) => b.rating - a.rating);

				providers = filteredProviders;
				currentPage = 1;
			} catch (err) {
				error = err instanceof Error ? err.message : 'Error al cargar proveedores';
			} finally {
				loading = false;
				fetchTimeout = null;
			}
		}, 300);
	}

	function applyFilters() {
		if (typeof window !== 'undefined') {
			// console.log removed
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

	async function openProfileModal(provider: any) {
		// Mostrar modal inmediatamente con datos disponibles para mejorar percepción de velocidad
		selectedProvider = {
			id: provider.id || '',
			business_name: provider.business_name || '',
			description: provider.description || provider.bio || 'Sin descripción',
			hourly_rate: provider.hourly_rate || 0,
			rating: provider.rating || provider.average_rating || 0,
			photo_url: provider.photo_url || '/img/cleaning.png',
			location: provider.location || '',
			phone: provider.phone,
			total_reviews: provider.total_reviews,
			provider_type: provider.provider_type,
			users: provider.users,
			provider_categories: provider.provider_categories,
			bio: provider.bio || `Soy un profesional con más de 5 años de experiencia en ${formatCategoryName(category).toLowerCase()}. Me especializo en brindar servicios de alta calidad, siempre enfocado en la satisfacción del cliente.`,
			settings: provider.settings,
			portfolio: provider.portfolio || [],
			reviews: provider.reviews || []
		};
		showProfileModal = true;
		if (typeof window !== 'undefined') {
			document.body.style.overflow = 'hidden';
		}

		// Cargar datos adicionales en paralelo después de mostrar el modal
		try {
			const [providerDetails, reviewsData] = await Promise.all([
				// Solo hacer fetch si no tenemos settings
				provider.settings ? Promise.resolve({provider}) : fetch(`/api/providers/${provider.id}`).then(res => res.json()),
				// Cargar reseñas
				fetch(`/api/reviews?provider_id=${provider.id}&limit=5`).then(res => res.json())
			]);

			// Actualizar datos del proveedor si se obtuvieron
			if (providerDetails && providerDetails.success && providerDetails.provider) {
				selectedProvider = { ...selectedProvider, ...providerDetails.provider };
			}

			// Actualizar reseñas si se obtuvieron
			if (reviewsData && reviewsData.data?.reviews) {
				// Formatear las reseñas para mostrar
				const formattedReviews = reviewsData.data.reviews.map((review: any) => ({
					...review,
					reviewer_name: `${review.reviewer?.first_name || ''} ${review.reviewer?.last_name || ''}`.trim() || 'Usuario Anónimo'
				}));
				selectedProvider = { ...selectedProvider, reviews: formattedReviews };
			}
		} catch (error) {
			console.error('Error loading additional provider data:', error);
			// No mostramos error al usuario ya que tenemos datos básicos visibles
		}
	}

	function closeProfileModal() {
		// Si hay un comentario en progreso, preguntar antes de cerrar
		if (showReviewForm && newReview.comment.trim()) {
			if (confirm('¿Estás seguro de que quieres cerrar? Perderás el comentario que estabas escribiendo.')) {
				closeModalConfirmed();
			}
		} else {
			closeModalConfirmed();
		}
	}

	function closeModalConfirmed() {
		showProfileModal = false;
		selectedProvider = null;
		showReviewForm = false;
		showAllPortfolio = false;
		hasContactedProvider = false; // Resetear el estado de contacto solo al cerrar completamente
		newReview = { rating: 5, comment: '' };
		// Restaurar scroll del body
		if (typeof window !== 'undefined') {
			document.body.style.overflow = 'auto';
		}
	}

	function handleContactProvider() {
		hasContactedProvider = true;
		// Aquí puedes agregar lógica adicional para el contacto
		// Por ejemplo, abrir WhatsApp, llamar, o mostrar un formulario de contacto
		// console.log removed
	}

	function toggleReviewForm() {
		showReviewForm = !showReviewForm;
		if (showReviewForm) {
			newReview = { rating: 5, comment: '' };
		} else {
			// Al cancelar el formulario, mantener el estado de contacto pero limpiar el comentario
			newReview = { rating: 5, comment: '' };
		}
	}

	async function submitReview() {
		if (!selectedProvider || !newReview.comment.trim()) return;
		
		submittingReview = true;
		try {
			const response = await fetch('/api/reviews', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					provider_id: selectedProvider.id,
					rating: newReview.rating,
					comment: newReview.comment
				})
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Error al enviar la reseña');
			}

			// Agregar la nueva reseña al inicio de la lista
			const newReviewData = {
				...result.data.review,
				reviewer_name: `${result.data.review.reviewer?.first_name || ''} ${result.data.review.reviewer?.last_name || ''}`.trim() || 'Usuario Anónimo'
			};
			
			if (selectedProvider.reviews) {
				selectedProvider.reviews = [newReviewData, ...selectedProvider.reviews];
			} else {
				selectedProvider.reviews = [newReviewData];
			}
			
			// Actualizar estadísticas del proveedor
			selectedProvider.rating = result.data.review.provider_profile?.average_rating || selectedProvider.rating;
			selectedProvider.total_reviews = result.data.review.provider_profile?.total_reviews || selectedProvider.total_reviews;
			
			// Resetear formulario
			showReviewForm = false;
			newReview = { rating: 5, comment: '' };
			
			// Mostrar mensaje de éxito
			notifications.success('¡Reseña enviada exitosamente!');
			
		} catch (error) {
			console.error('Error submitting review:', error);
			notifications.error(error instanceof Error ? error.message : 'Error al enviar la reseña');
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

	// Función para editar una reseña
	function editReview(review: any) {
		editingReview = {
			id: review.id,
			rating: review.rating,
			comment: review.comment
		};
	}

	// Función para actualizar una reseña
	async function updateReview(reviewId: string) {
		if (!editingReview || !editingReview.comment.trim()) return;
		
		submittingReview = true;
		try {
			const response = await fetch(`/api/reviews/${reviewId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					rating: editingReview.rating,
					comment: editingReview.comment
				})
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Error al actualizar la reseña');
			}

			// Actualizar la reseña en la lista
			if (selectedProvider?.reviews) {
				const reviewIndex = selectedProvider.reviews.findIndex((r: any) => r.id === reviewId);
				if (reviewIndex !== -1) {
					selectedProvider.reviews[reviewIndex] = {
						...selectedProvider.reviews[reviewIndex],
						rating: editingReview.rating,
						comment: editingReview.comment,
						updated_at: new Date().toISOString()
					};
				}
			}
			
			// Resetear formulario de edición
			editingReview = null;
			
			// Mostrar mensaje de éxito
			notifications.success('¡Reseña actualizada exitosamente!');
			
		} catch (error) {
			console.error('Error updating review:', error);
			notifications.error(error instanceof Error ? error.message : 'Error al actualizar la reseña');
		} finally {
			submittingReview = false;
		}
	}

	// Función para eliminar una reseña
	async function deleteReview(reviewId: string) {
		if (!confirm('¿Estás seguro de que quieres eliminar esta reseña? Esta acción no se puede deshacer.')) {
			return;
		}
		
		try {
			const response = await fetch(`/api/reviews/${reviewId}`, {
				method: 'DELETE'
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Error al eliminar la reseña');
			}

			// Eliminar la reseña de la lista
			if (selectedProvider?.reviews) {
				selectedProvider.reviews = selectedProvider.reviews.filter((r: any) => r.id !== reviewId);
			}
			
			// Mostrar mensaje de éxito
			notifications.success('¡Reseña eliminada exitosamente!');
			
		} catch (error) {
			console.error('Error deleting review:', error);
			notifications.error(error instanceof Error ? error.message : 'Error al eliminar la reseña');
		}
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

	function formatWorkingHours(settings: any) {
		if (!settings?.business?.workingHours) {
			return null;
		}

		const workingHours = settings.business.workingHours;
		const dayNames: Record<string, string> = {
			monday: 'Lunes',
			tuesday: 'Martes',
			wednesday: 'Miércoles',
			thursday: 'Jueves',
			friday: 'Viernes',
			saturday: 'Sábado',
			sunday: 'Domingo'
		};

		const enabledDays = Object.entries(workingHours)
			.filter(([_, day]) => (day as any).enabled)
			.map(([day, dayData]) => ({
				name: dayNames[day] || day,
				start: (dayData as any).start,
				end: (dayData as any).end
			}));

		if (enabledDays.length === 0) {
			return null;
		}

		// Agrupar días por horarios
		const groups: Array<{days: string[], start: string, end: string}> = [];
		
		enabledDays.forEach(day => {
			const existingGroup = groups.find(g => g.start === day.start && g.end === day.end);
			if (existingGroup) {
				existingGroup.days.push(day.name);
			} else {
				groups.push({
					days: [day.name],
					start: day.start,
					end: day.end
				});
			}
		});

		// Formatear grupos de forma resumida
		return groups.map(group => {
			if (group.days.length === 1) {
				return `${group.days[0]} de ${group.start} a ${group.end}`;
			} else {
				// Ordenar días para crear rangos
				const dayOrder = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
				const sortedDays = group.days.sort((a, b) => 
					dayOrder.indexOf(a) - dayOrder.indexOf(b)
				);
				
				// Crear rangos consecutivos
				const ranges: string[] = [];
				let start = sortedDays[0];
				let end = sortedDays[0];
				
				for (let i = 1; i < sortedDays.length; i++) {
					const currentDay = sortedDays[i];
					const currentIndex = dayOrder.indexOf(currentDay);
					const endIndex = dayOrder.indexOf(end);
					
					if (currentIndex === endIndex + 1) {
						end = currentDay;
					} else {
						if (start === end) {
							ranges.push(start);
						} else {
							ranges.push(`${start} a ${end}`);
						}
						start = currentDay;
						end = currentDay;
					}
				}
				
				if (start === end) {
					ranges.push(start);
				} else {
					ranges.push(`${start} a ${end}`);
				}
				
				return `${ranges.join(', ')} de ${group.start} a ${group.end}`;
			}
		}).join(', ');
	}

	// Sistema de comentarios
	let showReviewForm = false;
	let newReview = {
		rating: 5,
		comment: ''
	};
	let submittingReview = false;
	let hasContactedProvider = false; // Nuevo estado para rastrear si el usuario ha contactado al proveedor
	let isAuthenticated = false; // Estado para verificar si el usuario está autenticado
	let editingReview: any = null; // Para editar reseñas
	let currentUser: any = null; // Usuario actual

	// Importar el store de notificaciones
	import { notifications } from '$lib/stores/notifications';

	// Sistema de portafolio
	let showAllPortfolio = false;

	// 1. Remove the general category services section (from the markup)
	// 2. Add a reactive variable to store provider services
	let providerServicesMap: Record<string, any[]> = {};

	// 3. Fetch all services for the category at once
	async function fetchCategoryServices() {
		try {
			const cacheBuster = Date.now();
			const url = `/api/services?category=${encodeURIComponent(category)}&v=${cacheBuster}`;
			const response = await fetch(url);
			const result = await response.json();
			if (response.ok && result.data && result.data.services) {
				// Group services by provider
				const servicesByProvider: Record<string, any[]> = {};
				result.data.services.forEach((service: any) => {
					const providerId = service.provider_profile_id;
					if (!servicesByProvider[providerId]) {
						servicesByProvider[providerId] = [];
					}
					servicesByProvider[providerId].push(service);
				});
				providerServicesMap = servicesByProvider;
			} else {
				providerServicesMap = {};
			}
		} catch (e) {
			providerServicesMap = {};
		}
	}

	// 4. After fetching providers, fetch their services - only once
	let servicesFetched = false;
	$: if (!loading && providers.length > 0 && !servicesFetched && !initialLoad) {
		// console.log removed
		servicesFetched = true;
		fetchCategoryServices();
	}

	onMount(async () => {
		// console.log removed
		// console.log removed
		// console.log removed
		
		// Only fetch if not preloaded from server
		if (!data.preloaded) {
			// console.log removed
			fetchProviders();
		} else {
			// console.log removed
		}
		
		loadCategoryServices();
		
		// Verificar si el usuario está autenticado y obtener información (sin cache buster para evitar reloads)
		try {
			const response = await fetch('/api/me');
			if (response.ok) {
				const userData = await response.json();
				isAuthenticated = true;
				currentUser = userData.user;
			}
		} catch (error) {
			console.error('Error checking authentication:', error);
		}
		
		// Mark initial load as complete after a short delay
		setTimeout(() => {
			initialLoad = false;
			filtersInitialized = true;
			// console.log removed
		}, 100);
	});

	function loadCategoryServices() {
		// Cargar servicios específicos de la categoría
		categoryServices = getTemplatesByCategoryName(formatCategoryName(category));
	}

	// Limpiar body scroll al desmontar el componente
	onDestroy(() => {
		if (typeof window !== 'undefined') {
			document.body.style.overflow = 'auto';
		}
		// Clear any pending timeouts
		if (filterTimeout) {
			clearTimeout(filterTimeout);
		}
		if (searchTimeout) {
			clearTimeout(searchTimeout);
		}
	});

	// Manejar tecla Escape para cerrar modal
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && showProfileModal) {
			closeProfileModal();
		}
	}

	// Función para manejar teclas en el buscador
	function handleSearchKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && searchQuery.trim()) {
			// Si hay resultados, seleccionar el primero
			if (searchResults.length > 0) {
				selectSearchResult(searchResults[0]);
			}
		} else if (event.key === 'Escape') {
			clearSearch();
		}
	}

	// Debounced filter application to prevent multiple API calls
	let filterTimeout: any;
	let initialLoad = true;
	let lastFilterState = '';
	let filtersInitialized = false;
	
	$: {
		if (typeof window !== 'undefined' && !initialLoad && filtersInitialized) {
			const currentFilterState = JSON.stringify({
				priceRange: priceRange,
				selectedProviderType,
				selectedDepartment,
				selectedCity,
				selectedTime
			});
			
			if (currentFilterState !== lastFilterState && lastFilterState !== '') {
				// console.log removed
				// console.log removed
				// console.log removed
				lastFilterState = currentFilterState;
				clearTimeout(filterTimeout);
				filterTimeout = setTimeout(() => {
					applyFilters();
				}, 300); // 300ms debounce
			} else if (lastFilterState === '') {
				// First time initialization - just save the state, don't apply filters
				lastFilterState = currentFilterState;
				// console.log removed
			}
		}
	}

	function togglePortfolio() {
		showAllPortfolio = !showAllPortfolio;
	}

	// Función para buscar servicios y proveedores
	async function performSearch() {
		if (!searchQuery.trim()) {
			searchResults = [];
			showSearchResults = false;
			return;
		}

		isSearching = true;
		try {
			// Buscar servicios
			const servicesResponse = await fetch(`/api/services?search=${encodeURIComponent(searchQuery)}&limit=5`);
			const servicesData = await servicesResponse.json();
			
			// Buscar proveedores
			const providersResponse = await fetch(`/api/admin/providers?search=${encodeURIComponent(searchQuery)}&limit=5`);
			const providersData = await providersResponse.json();

			const results: Array<{type: 'service' | 'provider', data: any}> = [];

			// Agregar servicios encontrados
			if (servicesData.data?.services) {
				servicesData.data.services.forEach((service: any) => {
					results.push({
						type: 'service',
						data: {
							id: service.id,
							title: service.title,
							description: service.description,
							provider_name: service.provider_profiles?.business_name || 'Proveedor',
							category_slug: service.categories?.slug || '',
							price: service.price
						}
					});
				});
			}

			// Agregar proveedores encontrados
			if (providersData.providers) {
				providersData.providers.forEach((provider: any) => {
					results.push({
						type: 'provider',
						data: {
							id: provider.id,
							name: provider.business_name,
							description: provider.description,
							rating: provider.rating,
							hourly_rate: provider.hourly_rate,
							location: provider.location,
							photo_url: provider.photo_url
						}
					});
				});
			}

			searchResults = results;
			showSearchResults = results.length > 0;
		} catch (error) {
			console.error('Error searching:', error);
			searchResults = [];
			showSearchResults = false;
		} finally {
			isSearching = false;
		}
	}

	// Función para manejar la selección de un resultado
	function selectSearchResult(result: {type: 'service' | 'provider', data: any}) {
		if (result.type === 'service') {
			// Navegar a la categoría del servicio si es diferente a la actual
			if (result.data.category_slug && result.data.category_slug !== category) {
				window.location.href = `/services/${result.data.category_slug}`;
			}
		} else if (result.type === 'provider') {
			// Navegar al perfil del proveedor
			window.location.href = `/provider/${result.data.id}`;
		}
		
		// Limpiar búsqueda
		searchQuery = '';
		searchResults = [];
		showSearchResults = false;
	}

	// Función para limpiar búsqueda
	function clearSearch() {
		searchQuery = '';
		searchResults = [];
		showSearchResults = false;
	}

	// Debounced search to prevent multiple API calls
	let searchTimeout: any;
	$: if (searchQuery.length > 2) {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			performSearch();
		}, 300); // 300ms debounce
	} else if (searchQuery.length === 0) {
		clearTimeout(searchTimeout);
		searchResults = [];
		showSearchResults = false;
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
				<div class="bg-white rounded-2xl shadow-soft border border-secondary-200 p-6 z-30"
					 style="position:sticky; top:0; max-height:100vh; overflow-y:auto;">
					<h2 class="text-xl font-bold text-secondary-900 mb-6 pb-3 border-b border-secondary-200">
						Filtros
					</h2>

					<!-- Mini Buscador -->
					<div class="mb-6 relative">
						<h3 class="text-sm font-semibold text-secondary-700 mb-3">Buscar otros servicios</h3>
						<div class="relative">
							<input
								type="text"
								placeholder="Buscar servicios o proveedores..."
								bind:value={searchQuery}
								class="w-full px-3 py-2 pl-10 pr-8 border border-secondary-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
								on:focus={() => showSearchResults = searchResults.length > 0}
								on:blur={() => setTimeout(() => showSearchResults = false, 200)}
								on:keydown={handleSearchKeydown}
							/>
							<!-- Search Icon -->
							<div class="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
								<svg class="w-4 h-4 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
								</svg>
							</div>
							<!-- Clear Button -->
							{#if searchQuery}
								<button
									on:click={clearSearch}
									class="absolute right-2 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
									aria-label="Limpiar búsqueda"
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
									</svg>
								</button>
							{/if}
							<!-- Loading Spinner -->
							{#if isSearching}
								<div class="absolute right-2 top-1/2 transform -translate-y-1/2">
									<svg class="animate-spin w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24">
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
										<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
								</div>
							{/if}
						</div>

						<!-- Search Results Dropdown -->
						{#if showSearchResults && searchResults.length > 0}
							<div class="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-secondary-200 z-50 max-h-64 overflow-y-auto">
								{#each searchResults as result, index}
									<button
										on:click={() => selectSearchResult(result)}
										class="w-full p-3 flex items-start gap-3 hover:bg-primary-50 transition-colors duration-150 text-left border-b border-secondary-100 last:border-b-0"
									>
										<!-- Icon based on type -->
										<div class="flex-shrink-0 mt-1">
											{#if result.type === 'service'}
												<div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
													<svg class="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
													</svg>
												</div>
											{:else}
												<div class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
													<svg class="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
													</svg>
												</div>
											{/if}
										</div>
										
										<!-- Content -->
										<div class="flex-1 min-w-0">
											{#if result.type === 'service'}
												<div class="font-medium text-sm text-secondary-900 truncate">
													{result.data.title}
												</div>
												<div class="text-xs text-secondary-600 truncate">
													{result.data.provider_name}
												</div>
												{#if result.data.price}
													<div class="text-xs text-primary-600 font-medium">
														C${result.data.price}
													</div>
												{/if}
											{:else}
												<div class="font-medium text-sm text-secondary-900 truncate">
													{result.data.name}
												</div>
												<div class="text-xs text-secondary-600 truncate">
													{result.data.location || 'Sin ubicación'}
												</div>
												<div class="text-xs text-primary-600 font-medium">
													C${result.data.hourly_rate}/hr
												</div>
											{/if}
										</div>
									</button>
								{/each}
							</div>
						{/if}
					</div>

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
													loading="lazy"
													decoding="async"
													class="w-full h-full object-cover"
												/>
											{:else}
												<img 
													src="/img/avatars/307ce493-b254-4b2d-8ba4-d12c080d6651.jpg" 
													alt="Avatar por defecto"
													loading="lazy"
													decoding="async"
													class="w-full h-full object-cover"
												/>
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
												<div class="flex items-center gap-1 text-sm text-secondary-600 mb-2">
													<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
													</svg>
													{provider.location || 'Ubicación no especificada'}
												</div>

												<!-- Horarios de Atención -->
												{#if formatWorkingHours(provider.settings)}
													<div class="flex items-center gap-1 text-sm text-secondary-600 mb-3">
														<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
														</svg>
														<span class="font-medium text-primary-600">Horarios:</span>
														{formatWorkingHours(provider.settings)}
													</div>
												{/if}
											</div>

											<!-- Precio - OCULTO -->
											<!-- <div class="text-right">
												<div class="text-2xl font-bold text-primary-600">
													C${provider.hourly_rate}
												</div>
												<div class="text-sm text-secondary-600">por hora</div>
											</div> -->
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
					<!-- Mini Buscador Mobile -->
					<div class="relative">
						<h3 class="text-sm font-semibold text-secondary-700 mb-3">Buscar otros servicios</h3>
						<div class="relative">
							<input
								type="text"
								placeholder="Buscar servicios o proveedores..."
								bind:value={searchQuery}
								class="w-full px-3 py-2 pl-10 pr-8 border border-secondary-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
								on:focus={() => showSearchResults = searchResults.length > 0}
								on:blur={() => setTimeout(() => showSearchResults = false, 200)}
								on:keydown={handleSearchKeydown}
							/>
							<!-- Search Icon -->
							<div class="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
								<svg class="w-4 h-4 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
								</svg>
							</div>
							<!-- Clear Button -->
							{#if searchQuery}
								<button
									on:click={clearSearch}
									class="absolute right-2 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
									aria-label="Limpiar búsqueda"
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
									</svg>
								</button>
							{/if}
							<!-- Loading Spinner -->
							{#if isSearching}
								<div class="absolute right-2 top-1/2 transform -translate-y-1/2">
									<svg class="animate-spin w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24">
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
										<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
								</div>
							{/if}
						</div>

						<!-- Search Results Dropdown Mobile -->
						{#if showSearchResults && searchResults.length > 0}
							<div class="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-secondary-200 z-50 max-h-48 overflow-y-auto">
								{#each searchResults as result, index}
									<button
										on:click={() => selectSearchResult(result)}
										class="w-full p-3 flex items-start gap-3 hover:bg-primary-50 transition-colors duration-150 text-left border-b border-secondary-100 last:border-b-0"
									>
										<!-- Icon based on type -->
										<div class="flex-shrink-0 mt-1">
											{#if result.type === 'service'}
												<div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
													<svg class="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
													</svg>
												</div>
											{:else}
												<div class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
													<svg class="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
													</svg>
												</div>
											{/if}
										</div>
										
										<!-- Content -->
										<div class="flex-1 min-w-0">
											{#if result.type === 'service'}
												<div class="font-medium text-sm text-secondary-900 truncate">
													{result.data.title}
												</div>
												<div class="text-xs text-secondary-600 truncate">
													{result.data.provider_name}
												</div>
												{#if result.data.price}
													<div class="text-xs text-primary-600 font-medium">
														C${result.data.price}
													</div>
												{/if}
											{:else}
												<div class="font-medium text-sm text-secondary-900 truncate">
													{result.data.name}
												</div>
												<div class="text-xs text-secondary-600 truncate">
													{result.data.location || 'Sin ubicación'}
												</div>
												<div class="text-xs text-primary-600 font-medium">
													C${result.data.hourly_rate}/hr
												</div>
											{/if}
										</div>
									</button>
								{/each}
							</div>
						{/if}
					</div>

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
											<img 
												src="/img/avatars/307ce493-b254-4b2d-8ba4-d12c080d6651.jpg" 
												alt="Avatar por defecto"
												class="w-full h-full object-cover"
											/>
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
									
									<!-- Precio - OCULTO -->
									<!-- <div class="bg-primary-50 rounded-xl p-4 mb-4">
										<div class="text-3xl font-bold text-primary-600 mb-1">
											C${selectedProvider.hourly_rate}
										</div>
										<div class="text-sm text-primary-700">por hora</div>
									</div> -->
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
								<div class="flex items-center gap-2 text-secondary-600 mb-4">
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
									</svg>
									<span class="text-lg">{selectedProvider.location || 'Ubicación no especificada'}</span>
								</div>

								<!-- Horarios de Atención -->
								{#if formatWorkingHours(selectedProvider.settings)}
									<div class="flex items-center gap-2 text-secondary-600 mb-6">
										<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
										</svg>
										<div>
											<span class="text-lg font-medium text-primary-600">Horarios de Atención:</span>
											<span class="text-lg ml-2">{formatWorkingHours(selectedProvider.settings)}</span>
										</div>
									</div>
								{/if}
								
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
												{#if work.media_type === 'video' && work.image_url}
													<video 
														src={work.image_url} 
														controls 
														preload="metadata"
														class="w-full h-full object-cover"
													>
														<track kind="captions" />
													</video>
												{:else if work.image_url}
													<img 
														src={work.image_url} 
														alt={work.title}
														class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
														loading="lazy"
													/>
												{:else}
													<div class="w-full h-full bg-gray-200 flex items-center justify-center">
														<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
														</svg>
													</div>
												{/if}
											</div>
											<div class="p-3">
												
												<h4 class="font-medium text-secondary-900 mb-1 text-sm">{work.title}</h4>
												{#if work.description}
													<p class="text-xs text-secondary-600 line-clamp-2">{work.description}</p>
												{/if}
												{#if work.media_type === 'video'}
													<div class="flex items-center gap-1 mt-1">
														<svg class="w-3 h-3 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
														</svg>
														<span class="text-xs text-primary-600 font-medium">Video</span>
													</div>
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
								{#if !isAuthenticated}
									<div class="flex items-center justify-between bg-orange-50 p-3 rounded-lg">
										<div class="flex items-center gap-2 text-orange-600 text-sm">
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
											</svg>
											Debes iniciar sesión para poder comentar
										</div>
										<a href="/auth/login" class="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700 transition-colors">
											Iniciar Sesión
										</a>
									</div>
								{:else if hasContactedProvider}
									<button 
										class="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200 flex items-center gap-2"
										on:click={toggleReviewForm}
									>
										{#if showReviewForm}
											Cancelar
										{:else}
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
											</svg>
											Escribir Comentario
										{/if}
									</button>
								{:else}
									<div class="flex items-center gap-2 text-secondary-600 text-sm">
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
										</svg>
										Contacta al proveedor para poder comentar
									</div>
								{/if}
								
								{#if hasContactedProvider}
									<div class="flex items-center gap-2 text-green-600 text-sm mt-2 bg-green-50 p-2 rounded-lg">
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
										</svg>
										¡Ya puedes comentar sobre este proveedor! Tu comentario se mantendrá mientras el perfil esté abierto.
									</div>
								{/if}
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
											Cancelar (mantener contacto)
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
													<p class="text-sm text-secondary-500">
														{formatDate(review.created_at)}
														{#if review.updated_at && review.updated_at !== review.created_at}
															<span class="text-xs text-secondary-400 ml-2">(editado)</span>
														{/if}
													</p>
												</div>
												<div class="flex items-center gap-2">
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
													
													<!-- Botones de editar/eliminar solo para el autor -->
													{#if isAuthenticated && review.reviewer_user_id === currentUser?.id}
														<div class="flex items-center gap-1 ml-2">
															<button 
																class="text-secondary-400 hover:text-primary-600 transition-colors p-1"
																on:click={() => editReview(review)}
																title="Editar comentario"
															>
																<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																	<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
																</svg>
															</button>
															<button 
																class="text-secondary-400 hover:text-red-600 transition-colors p-1"
																on:click={() => deleteReview(review.id)}
																title="Eliminar comentario"
															>
																<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																	<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
																</svg>
															</button>
														</div>
													{/if}
												</div>
											</div>
											
											<!-- Mostrar formulario de edición o comentario normal -->
											{#if editingReview && editingReview.id === review.id}
												<div class="bg-secondary-50 rounded-lg p-4 mb-3">
													<h6 class="font-medium text-secondary-900 mb-3">Editar comentario</h6>
													
													<!-- Rating -->
													<div class="mb-3">
														<label class="block text-sm font-medium text-secondary-700 mb-1">Calificación</label>
														<div class="flex items-center gap-1">
															{#each Array(5) as _, i}
																<button 
																	class="text-xl transition-colors duration-200"
																	class:text-yellow-400={i < editingReview.rating}
																	class:text-secondary-300={i >= editingReview.rating}
																	on:click={() => editingReview.rating = i + 1}
																>
																	★
																</button>
															{/each}
															<span class="ml-2 text-sm text-secondary-600">({editingReview.rating} estrella{editingReview.rating !== 1 ? 's' : ''})</span>
														</div>
													</div>
													
													<!-- Comentario -->
													<div class="mb-3">
														<label class="block text-sm font-medium text-secondary-700 mb-1">Comentario</label>
														<textarea 
															bind:value={editingReview.comment}
															placeholder="Escribe tu experiencia con este proveedor..."
															class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
															rows="3"
														></textarea>
													</div>
													
													<!-- Botones -->
													<div class="flex gap-2">
														<button 
															class="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50"
															disabled={submittingReview || !editingReview.comment.trim()}
															on:click={() => updateReview(review.id)}
														>
															{#if submittingReview}
																Guardando...
															{:else}
																Guardar Cambios
															{/if}
														</button>
														<button 
															class="border border-secondary-300 text-secondary-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary-50 transition-colors duration-200"
															on:click={() => editingReview = null}
														>
															Cancelar
														</button>
													</div>
												</div>
											{:else}
												<p class="text-secondary-700 leading-relaxed">{review.comment}</p>
											{/if}
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
								{#if selectedProvider?.phone}
									<button 
										class="flex-1 bg-green-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2"
										on:click={() => {
											handleContactProvider();
											if (selectedProvider?.phone) {
												window.location.href = `tel:${selectedProvider.phone}`;
											}
										}}
									>
										<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
										</svg>
										Llamar Ahora
									</button>
								{/if}
								<button 
									class="flex-1 bg-primary-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center gap-2"
									on:click={() => {
										handleContactProvider();
										// Aquí puedes agregar lógica para WhatsApp o mensaje
										if (selectedProvider?.phone && selectedProvider?.business_name) {
											const message = `Hola ${selectedProvider.business_name}, me interesa contratar sus servicios. ¿Podría proporcionarme más información?`;
											const encodedMessage = encodeURIComponent(message);
											window.open(`https://wa.me/${selectedProvider.phone.replace(/[^0-9]/g, '')}?text=${encodedMessage}`, '_blank');
										}
									}}
								>
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-2.248-.307l-3.5 2.151.643-2.818A8.003 8.003 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"></path>
									</svg>
									{hasContactedProvider ? '✓ Contactado' : 'Contactar'}
								</button>
								<button 
									class="flex-1 border-2 border-primary-600 text-primary-600 py-4 px-6 rounded-xl font-semibold hover:bg-primary-50 transition-colors duration-200 flex items-center justify-center gap-2"
									on:click={handleContactProvider}
								>
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a4 4 0 118 0v4m-4 6v4m-6-2h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path>
									</svg>
									{hasContactedProvider ? '✓ Cotización Solicitada' : 'Solicitar Cotización'}
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

