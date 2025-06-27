<script lang="ts">
import { page } from '$app/stores';
import { onMount } from 'svelte';

interface Provider {
	id: string;
	business_name: string;
	photo_url: string;
	rating: number;
	hourly_rate: number;
	description: string;
	total_reviews: number;
	provider_type: 'individual' | 'company';
	location?: string;
	phone?: string;
	users: {
		id: string;
		email: string;
		role: string;
	};
	provider_categories: Array<{
		category_id: number;
		categories: {
			id: number;
			name: string;
			path_imgage: string;
			description: string;
		};
	}>;
}

let category = '';
let providers: Provider[] = [];
let loading = true;
let error = '';

// Paginación
let currentPage = 1;
let itemsPerPage = 5;
let totalPages = 0;
$: totalPages = Math.ceil(providers.length / itemsPerPage);
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

function getPageNumbers() {
	const pages = [];
	const maxVisiblePages = 5;
	
	if (totalPages <= maxVisiblePages) {
		// Si hay 5 páginas o menos, mostrar todas
		for (let i = 1; i <= totalPages; i++) pages.push(i);
	} else {
		// Siempre mostrar primera página
		pages.push(1);
		
		// Calcular rango alrededor de la página actual
		let start = Math.max(2, currentPage - 1);
		let end = Math.min(totalPages - 1, currentPage + 1);
		
		// Ajustar si estamos cerca del inicio o final
		if (currentPage <= 2) end = 4;
		if (currentPage >= totalPages - 1) start = totalPages - 3;
		
		// Agregar elipsis si es necesario
		if (start > 2) pages.push('...');
		
		// Agregar páginas del medio
		for (let i = start; i <= end; i++) pages.push(i);
		
		// Agregar elipsis final si es necesario
		if (end < totalPages - 1) pages.push('...');
		
		// Siempre mostrar última página
		pages.push(totalPages);
	}
	
	return pages;
}

// Filtros
let selectedDate = 'week';
let selectedTimes: string[] = [];
let timeOfDay = {
	morning: false,
	afternoon: false,
	evening: false
};
let specificTime = '';
let priceRange = [10, 3000];
let selectedProviderType: 'all' | 'individual' | 'company' = 'all';

// Estado para el modal de filtros en mobile
let showFiltersModal = false;

const timeOptions = [
	"I'm Flexible",
	'8:00am', '8:30am', '9:00am', '9:30am', '10:00am', '10:30am', '11:00am', '11:30am',
	'12:00pm', '12:30pm', '1:00pm', '1:30pm', '2:00pm', '2:30pm', '3:00pm', '3:30pm',
	'4:00pm', '4:30pm', '5:00pm', '5:30pm', '6:00pm', '6:30pm', '7:00pm', '7:30pm',
	'8:00pm', '8:30pm', '9:00pm', '9:30pm'
];

// Mapeo de IDs a nombres de categoría
const categoryMapping: { [key: string]: string } = {
	'mounting': 'Montaje',
	'cleaning': 'Limpieza',
	'gardening': 'Jardinería',
	'moving': 'Mudanzas',
	'assembly': 'Ensamblaje',
	'ensamblaje': 'Ensamblaje'
};

// Mapeo inverso para obtener el ID de la categoría
const categoryIdMapping: { [key: string]: number } = {
	'mounting': 2, // Montaje
	'cleaning': 4, // Limpieza
	'gardening': 5, // Jardinería
	'moving': 3, // Mudanzas
	'assembly': 1,  // Ensamblaje
	'ensamblaje': 1 // Soporta slug en español
};

// Obtener la categoría de la URL
$: category = $page.params.category.charAt(0).toUpperCase() + $page.params.category.slice(1);

async function fetchProviders() {
	try {
		loading = true;
		error = '';
		
		console.log('🔍 [DEBUG] Starting fetchProviders');
		console.log('🔍 [DEBUG] Category from URL:', $page.params.category);
		
		const categoryId = categoryIdMapping[$page.params.category];
		console.log('🔍 [DEBUG] Category ID:', categoryId);
		
		if (!categoryId) {
			error = 'Categoría no encontrada';
			console.log('❌ [DEBUG] Category not found');
			return;
		}

		const params = new URLSearchParams({
			category_id: categoryId.toString(),
			limit: '50' // Obtener más proveedores para filtrar
		});

		if (selectedProviderType !== 'all') {
			params.append('provider_type', selectedProviderType);
		}

		const url = `/api/providers?${params}`;
		console.log('📡 [DEBUG] Fetching URL:', url);

		const response = await fetch(url);
		const result = await response.json();

		console.log('📊 [DEBUG] Response status:', response.status);
		console.log('📋 [DEBUG] Response data:', result);

		if (!response.ok) {
			throw new Error(result.message || 'Error al cargar proveedores');
		}

		console.log('🔍 [DEBUG] Original providers count:', result.data.providers.length);
		console.log('🔍 [DEBUG] Price range:', priceRange);

		// Aplicar filtros de precio
		let filteredProviders = result.data.providers.filter((provider: Provider) => {
			const inRange = provider.hourly_rate >= priceRange[0] && provider.hourly_rate <= priceRange[1];
			console.log(`🔍 [DEBUG] Provider ${provider.business_name}: $${provider.hourly_rate}/hr - ${inRange ? 'INCLUDED' : 'EXCLUDED'}`);
			return inRange;
		});

		console.log('✅ [DEBUG] Filtered providers count:', filteredProviders.length);

		// Ordenar por rating (más alto primero)
		filteredProviders.sort((a: Provider, b: Provider) => b.rating - a.rating);

		providers = filteredProviders;
		currentPage = 1; // Resetear a la primera página
		
		console.log('🎉 [DEBUG] Final providers set:', providers.length);
	} catch (err) {
		console.error('❌ [DEBUG] Error fetching providers:', err);
		error = err instanceof Error ? err.message : 'Error al cargar proveedores';
	} finally {
		loading = false;
		console.log('🏁 [DEBUG] fetchProviders completed. Loading:', loading);
	}
}

function applyFilters() {
	// Solo aplicar filtros si ya estamos en el cliente
	if (typeof window !== 'undefined') {
		fetchProviders();
		// Cerrar modal en mobile
		showFiltersModal = false;
	}
}

onMount(() => {
	fetchProviders();
});

// Observar cambios en los filtros solo en el cliente
$: if (typeof window !== 'undefined' && priceRange) {
	// Aplicar filtros automáticamente cuando cambie el rango de precio
	applyFilters();
}

$: if (typeof window !== 'undefined' && selectedProviderType) {
	applyFilters();
}
</script>

<div class="page-wrapper">
<div class="providers-layout">
	<!-- Botón de filtros para mobile -->
	<button class="mobile-filters-btn" on:click={() => showFiltersModal = true}>
		<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
			<path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/>
		</svg>
		Filtros
	</button>

	<!-- Sidebar para desktop -->
	<aside class="desktop-sidebar">
		<div class="filter-box">
			<h2>Filtrar</h2>
			<div class="filter-section">
				<fieldset>
					<legend class="filter-label">Fecha</legend>
					<div class="filter-date-btns">
						<button class:selected={selectedDate === 'today'} on:click={() => selectedDate = 'today'}>Hoy</button>
						<button class:selected={selectedDate === '3days'} on:click={() => selectedDate = '3days'}>3 días</button>
						<button class:selected={selectedDate === 'week'} on:click={() => selectedDate = 'week'}>Esta semana</button>
						<button class:selected={selectedDate === 'custom'} on:click={() => selectedDate = 'custom'}>Elegir fecha</button>
					</div>
				</fieldset>
			</div>
			<div class="filter-section">
				<fieldset>
					<legend class="filter-label">Tipo de proveedor</legend>
					<div class="filter-provider-type">
						<label for="all-providers-desktop">
							<input type="radio" id="all-providers-desktop" bind:group={selectedProviderType} value="all" />
							Todos
						</label>
						<label for="individual-providers-desktop">
							<input type="radio" id="individual-providers-desktop" bind:group={selectedProviderType} value="individual" />
							Individuos
						</label>
						<label for="company-providers-desktop">
							<input type="radio" id="company-providers-desktop" bind:group={selectedProviderType} value="company" />
							Empresas
						</label>
					</div>
				</fieldset>
			</div>
			<div class="filter-section">
				<fieldset>
					<legend class="filter-label">Hora del día</legend>
					<div class="filter-checkboxes compact-checkboxes">
						<label for="morning-checkbox-desktop">
							<input type="checkbox" id="morning-checkbox-desktop" bind:checked={timeOfDay.morning} />
							Mañana (7am - 12pm)
						</label>
						<label for="afternoon-checkbox-desktop">
							<input type="checkbox" id="afternoon-checkbox-desktop" bind:checked={timeOfDay.afternoon} />
							Tarde (12pm - 5pm)
						</label>
						<label for="evening-checkbox-desktop">
							<input type="checkbox" id="evening-checkbox-desktop" bind:checked={timeOfDay.evening} />
							Noche (5pm - 9pm)
						</label>
					</div>
					<select class="time-select compact-select" bind:value={specificTime} id="time-select-desktop">
						<option value="" disabled selected>Elegir hora específica</option>
						{#each Array.from({ length: 14 }, (_, i) => i + 7) as hour}
							<option value={hour}>
								{hour}:00 {hour < 12 ? 'AM' : 'PM'}
							</option>
						{/each}
					</select>
				</fieldset>
			</div>
			<div class="filter-section">
				<fieldset>
					<legend class="filter-label">Precio por hora</legend>
					<div class="filter-price-range">
						<div class="price-inputs">
							<div class="price-input-group">
								<label class="price-input-label" for="price-from-desktop">Desde</label>
								<input 
									id="price-from-desktop"
									type="number" 
									bind:value={priceRange[0]} 
									min="10" 
									max="3000" 
									class="price-input"
								/>
							</div>
							<span class="price-separator">-</span>
							<div class="price-input-group">
								<label class="price-input-label" for="price-to-desktop">Hasta</label>
								<input 
									id="price-to-desktop"
									type="number" 
									bind:value={priceRange[1]} 
									min="10" 
									max="3000" 
									class="price-input"
								/>
							</div>
						</div>
						<div class="price-separator">
							El precio promedio es <b>C$300/hr</b>
						</div>
					</div>
				</fieldset>
			</div>
		</div>
	</aside>

	<!-- Overlay para mobile -->
	{#if showFiltersModal}
		<div class="modal-overlay" on:click={() => showFiltersModal = false}></div>
	{/if}

	<!-- Modal para mobile -->
	<aside class="mobile-sidebar" class:show-mobile={showFiltersModal}>
		<div class="filter-box">
			<div class="filter-header">
				<h2>Filtrar</h2>
				<button class="close-filters-btn" on:click={() => showFiltersModal = false}>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
						<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
					</svg>
				</button>
			</div>
			<div class="filter-content">
				<div class="filter-section">
					<fieldset>
						<legend class="filter-label">Fecha</legend>
						<div class="filter-date-btns">
							<button class:selected={selectedDate === 'today'} on:click={() => selectedDate = 'today'}>Hoy</button>
							<button class:selected={selectedDate === '3days'} on:click={() => selectedDate = '3days'}>3 días</button>
							<button class:selected={selectedDate === 'week'} on:click={() => selectedDate = 'week'}>Esta semana</button>
							<button class:selected={selectedDate === 'custom'} on:click={() => selectedDate = 'custom'}>Elegir fecha</button>
						</div>
					</fieldset>
				</div>
				<div class="filter-section">
					<fieldset>
						<legend class="filter-label">Tipo de proveedor</legend>
						<div class="filter-provider-type">
							<label for="all-providers">
								<input type="radio" id="all-providers" bind:group={selectedProviderType} value="all" />
								Todos
							</label>
							<label for="individual-providers">
								<input type="radio" id="individual-providers" bind:group={selectedProviderType} value="individual" />
								Individuos
							</label>
							<label for="company-providers">
								<input type="radio" id="company-providers" bind:group={selectedProviderType} value="company" />
								Empresas
							</label>
						</div>
					</fieldset>
				</div>
				<div class="filter-section">
					<fieldset>
						<legend class="filter-label">Hora del día</legend>
						<div class="filter-checkboxes compact-checkboxes">
							<label for="morning-checkbox">
								<input type="checkbox" id="morning-checkbox" bind:checked={timeOfDay.morning} />
								Mañana (7am - 12pm)
							</label>
							<label for="afternoon-checkbox">
								<input type="checkbox" id="afternoon-checkbox" bind:checked={timeOfDay.afternoon} />
								Tarde (12pm - 5pm)
							</label>
							<label for="evening-checkbox">
								<input type="checkbox" id="evening-checkbox" bind:checked={timeOfDay.evening} />
								Noche (5pm - 9pm)
							</label>
						</div>
						<select class="time-select compact-select" bind:value={specificTime} id="time-select">
							<option value="" disabled selected>Elegir hora específica</option>
							{#each Array.from({ length: 14 }, (_, i) => i + 7) as hour}
								<option value={hour}>
									{hour}:00 {hour < 12 ? 'AM' : 'PM'}
								</option>
							{/each}
						</select>
					</fieldset>
				</div>
				<div class="filter-section">
					<fieldset>
						<legend class="filter-label">Precio por hora</legend>
						<div class="filter-price-range">
							<div class="price-inputs">
								<div class="price-input-group">
									<label class="price-input-label" for="price-from">Desde</label>
									<input 
										id="price-from"
										type="number" 
										bind:value={priceRange[0]} 
										min="10" 
										max="3000" 
										class="price-input"
									/>
								</div>
								<span class="price-separator">-</span>
								<div class="price-input-group">
									<label class="price-input-label" for="price-to">Hasta</label>
									<input 
										id="price-to"
										type="number" 
										bind:value={priceRange[1]} 
										min="10" 
										max="3000" 
										class="price-input"
									/>
								</div>
							</div>
							<div class="price-separator">
								El precio promedio es <b>C$300/hr</b>
							</div>
						</div>
					</fieldset>
				</div>
			</div>
			<button class="filter-apply-btn" on:click={applyFilters}>Aplicar filtros</button>
		</div>
	</aside>
	<main class="providers-main">
		<h1>Proveedores de {categoryMapping[$page.params.category] || category}</h1>
		
		{#if loading}
			<div class="loading-state">
				<div class="loading-spinner"></div>
				<p>Cargando proveedores...</p>
			</div>
		{:else if error}
			<div class="error-state">
				<p>Error: {error}</p>
				<button class="retry-btn" on:click={fetchProviders}>Intentar de nuevo</button>
			</div>
		{:else if providers.length === 0}
			<div class="empty-state">
				<p>No hay proveedores disponibles en esta categoría aún.</p>
				<p>¡Sé el primero en registrarte como proveedor!</p>
			</div>
		{:else}
			<div class="providers-count">
				Mostrando {Math.min(currentPage * itemsPerPage, providers.length)} de {providers.length} proveedores
			</div>
			<div class="providers-list">
				{#each paginatedProviders as p}
					<div class="provider-card">
						<img 
							src={p.photo_url || '/img/cleaning.png'} 
							alt={p.business_name} 
							class="provider-photo"
							on:error={(e) => {
								const target = e.target as HTMLImageElement;
								if (target) target.src = '/img/cleaning.png';
							}}
						/>
						<div class="provider-info">
							<div class="provider-header">
								<div class="provider-name-section">
									<h2>{p.business_name}</h2>
									<span class="provider-type-badge">
										{#if p.provider_type === 'individual'}
											<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="provider-icon">
												<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
											</svg>
											Individual
										{:else}
											<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="provider-icon">
												<path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
											</svg>
											Empresa
										{/if}
									</span>
								</div>
								<div class="provider-price">C${p.hourly_rate}/hr</div>
							</div>
							<div class="provider-rating">
								<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="rating-icon">
									<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
								</svg>
								{p.rating.toFixed(1)} ({p.total_reviews} reseñas)
							</div>
							<p class="provider-description">{p.description}</p>
							{#if p.location}
								<div class="provider-location">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="location-icon">
										<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
									</svg>
									{p.location}
								</div>
							{/if}
							<div class="provider-footer">
								<button class="contact-btn">Contactar</button>
								{#if p.phone}
									<button class="phone-btn">
										<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="phone-icon">
											<path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
										</svg>
										{p.phone}
									</button>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
			
			<!-- Paginación -->
			{#if totalPages > 1}
				<div class="pagination">
					<button 
						class="pagination-btn" 
						disabled={currentPage === 1}
						on:click={() => goToPage(currentPage - 1)}
					>
						Anterior
					</button>
					
					<div class="pagination-numbers">
						{#each getPageNumbers() as pageNum}
							{#if pageNum === '...'}
								<span class="pagination-ellipsis">...</span>
							{:else}
								<button 
									class="pagination-num" 
									class:active={currentPage === pageNum}
									on:click={() => typeof pageNum === 'number' && goToPage(pageNum)}
								>
									{pageNum}
								</button>
							{/if}
						{/each}
					</div>
					
					<button 
						class="pagination-btn"
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

<style>
.page-wrapper {
	min-height: 100vh;
	background-color: #f9f9f9;
}

.providers-layout {
	display: flex;
	gap: 2.5rem;
	align-items: flex-start;
	max-width: 1200px;
	margin: 0 auto;
	padding: 2rem 1.5rem;
	background-color: #f9f9f9;
}

.filter-box {
	position: sticky;
	top: 2rem;
	width: 300px;
	flex-shrink: 0;
	background: #fff;
	border-radius: 16px;
	box-shadow: 0 4px 16px rgba(12, 59, 46, 0.1);
	padding: 2rem;
	display: flex; /* Visible por defecto para desktop */
	flex-direction: column;
	gap: 2rem;
	margin-top: 7.2rem;
}

.filter-box h2 {
	color: #0C3B2E;
	font-size: 1.8rem;
	margin: 0;
	font-weight: 700;
	padding-bottom: 0.5rem;
	border-bottom: 2px solid #6D9773;
}

.filter-section {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.filter-label {
	color: #0C3B2E;
	font-weight: 600;
	font-size: 1.1rem;
	margin: 0;
	padding-bottom: 0.5rem;
}

.filter-date-btns {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 0.75rem;
	margin-bottom: 0.5rem;
}

.filter-date-btns button {
	width: 100%;
	background: #fff;
	border: 2px solid #6D9773;
	color: #0C3B2E;
	border-radius: 2rem;
	padding: 0.75rem 1rem;
	font-size: 0.95rem;
	cursor: pointer;
	transition: all 0.2s;
	font-weight: 500;
}

.filter-date-btns button.selected,
.filter-date-btns button:hover {
	background: #6D9773;
	color: #fff;
}

.filter-checkboxes {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	padding-left: 0.5rem;
}

.filter-checkboxes label {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	color: #0C3B2E;
	font-size: 1rem;
	cursor: pointer;
}

.filter-checkboxes input[type="checkbox"] {
	width: 18px;
	height: 18px;
	accent-color: #6D9773;
	cursor: pointer;
}

.filter-apply-btn {
	width: 100%;
	background: #0C3B2E;
	color: #fff;
	border: none;
	border-radius: 8px;
	padding: 1rem;
	font-size: 1.1rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s;
	margin-top: 1rem;
}

.filter-apply-btn:hover {
	background: #6D9773;
}

.providers-main {
	flex-grow: 1;
	max-width: 800px;
}

.providers-main h1 {
	color: #0C3B2E;
	font-size: 2.5rem;
	margin: 0 0 1rem 0;
	text-align: left;
}

.providers-count {
	color: #6D9773;
	font-weight: 500;
	margin: 0 0 2rem 0;
	font-size: 1rem;
}

.providers-list {
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
}

.provider-card {
	background: #fff;
	border-radius: 16px;
	box-shadow: 0 4px 16px rgba(12, 59, 46, 0.07);
	display: flex;
	gap: 2rem;
	padding: 2rem;
	align-items: center;
	transition: all 0.2s;
	width: 100%;
	border: 1px solid rgba(187, 138, 82, 0.1);
}

.provider-photo {
	width: 100px;
	height: 100px;
	border-radius: 50%;
	object-fit: cover;
	border: 3px solid #6D9773;
	flex-shrink: 0;
}

.provider-info {
	flex-grow: 1;
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}

.provider-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	gap: 1rem;
}

.provider-header h2 {
	margin: 0;
	font-size: 1.5rem;
	color: #0C3B2E;
}

.provider-rating {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	color: #FFBA00;
	font-weight: 600;
}

.provider-description {
	margin: 0;
	color: #666;
	line-height: 1.6;
	font-size: 1rem;
}

.provider-footer {
	display: flex;
	justify-content: flex-end;
	align-items: center;
	margin-top: 1rem;
	flex-wrap: wrap;
	gap: 0.5rem;
}

.provider-price {
	color: #BB8A52;
	font-weight: 700;
	font-size: 1.3rem;
}

.contact-btn {
	background: #0C3B2E;
	color: #fff;
	border: none;
	border-radius: 6px;
	padding: 0.5rem 1rem;
	font-size: 0.95rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s;
	min-width: 100px;
	width: fit-content;
}

.contact-btn:hover {
	background: #6D9773;
	transform: translateY(-1px);
}

.pagination {
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 1rem;
	margin-top: 3rem;
}

.pagination-numbers {
	display: flex;
	gap: 0.5rem;
	align-items: center;
}

.pagination-btn {
	background: #fff;
	border: 2px solid #6D9773;
	color: #0C3B2E;
	padding: 0.5rem 1rem;
	border-radius: 8px;
	cursor: pointer;
	font-weight: 600;
	transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
	background: #6D9773;
	color: #fff;
}

.pagination-btn:disabled {
	opacity: 0.5;
	cursor: not-allowed;
	border-color: #ccc;
	color: #999;
}

.pagination-num {
	min-width: 35px;
	height: 35px;
	border: none;
	background: #fff;
	border-radius: 8px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	font-weight: 500;
	transition: all 0.2s;
	color: #0C3B2E;
}

.pagination-num:hover {
	background: #6D9773;
	color: #fff;
}

.pagination-num.active {
	background: #0C3B2E;
	color: #fff;
}

.pagination-ellipsis {
	color: #666;
	padding: 0 0.3rem;
}

/* MÓVIL - mostrar botón, ocultar sidebar desktop */
@media (max-width: 1024px) {
	.providers-layout {
		flex-direction: column;
		align-items: stretch;
		gap: 1.5rem;
		padding: 1rem;
		width: 100%;
	}

	/* Ocultar sidebar desktop */
	.desktop-sidebar {
		display: none !important;
	}
	
	.desktop-sidebar .filter-box {
		display: none !important;
	}

	/* Mostrar botón filtros mobile */
	.mobile-filters-btn {
		display: flex !important;
		position: relative;
		z-index: 10;
		margin: 1rem 0;
		background: #0C3B2E !important;
		color: white !important;
		border: none !important;
		border-radius: 12px !important;
		padding: 1rem 1.5rem !important;
		font-size: 1rem !important;
		font-weight: 600 !important;
		cursor: pointer !important;
		align-items: center !important;
		gap: 0.75rem !important;
		width: 100% !important;
		justify-content: center !important;
		box-shadow: 0 4px 12px rgba(12, 59, 46, 0.3) !important;
	}

	/* Configurar modal mobile */
	.mobile-sidebar:not(.show-mobile) {
		display: none;
	}

	.mobile-sidebar {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%) scale(0);
		width: 90vw;
		max-width: 400px;
		max-height: 90vh;
		background: white;
		z-index: 1000;
		transition: all 0.3s ease;
		overflow: hidden;
		padding: 0;
		border-radius: 16px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
	}

	.mobile-sidebar.show-mobile {
		transform: translate(-50%, -50%) scale(1);
		display: block;
	}

	.modal-overlay {
		display: block;
	}

	.close-filters-btn {
		display: flex;
	}

	.filter-content {
		flex: 1;
		overflow-y: auto;
		padding: 0 1rem 0.25rem 1rem;
		min-height: 0;
		max-height: calc(90vh - 120px);
	}

	.filter-apply-btn {
		margin: 0rem 1rem 0.5rem 1rem;
		padding: 1rem 1.5rem;
		background: #0C3B2E;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		flex-shrink: 0;
		position: sticky;
		bottom: 0;
		z-index: 10;
	}

	.filter-apply-btn:hover {
		background: #6D9773;
	}

	/* Dark mode para modal */
	:global([data-theme="dark"]) .filter-sidebar {
		background: #1e293b;
	}

	:global([data-theme="dark"]) .filter-box {
		background: #1e293b;
	}

	:global([data-theme="dark"]) .filter-header {
		border-bottom-color: #334155;
	}

	:global([data-theme="dark"]) .filter-header h2 {
		color: white;
	}

	:global([data-theme="dark"]) .close-filters-btn {
		background: #334155;
		color: white;
	}

	:global([data-theme="dark"]) .close-filters-btn:hover {
		background: #475569;
	}

	:global([data-theme="dark"]) .filter-apply-btn {
		background: #10b981;
	}

	:global([data-theme="dark"]) .filter-apply-btn:hover {
		background: #059669;
	}

	:global([data-theme="dark"]) .filter-header {
		background: #1e293b;
	}




/* DESKTOP - mostrar sidebar, ocultar botón mobile */
@media (min-width: 1025px) {
	/* Mostrar sidebar desktop */
	.desktop-sidebar {
		display: block !important;
	}
	
	.desktop-sidebar .filter-box {
		display: flex !important;
	}
	
	/* Ocultar elementos mobile */
	.mobile-filters-btn {
		display: none !important;
	}
	
	.mobile-sidebar {
		display: none !important;
	}
	
	.modal-overlay {
		display: none !important;
	}
	
	/* Layout horizontal */
	.providers-layout {
		flex-direction: row;
		align-items: flex-start;
		padding: 1.5rem 1rem;
		gap: 1.5rem;
	}
}

	/* Estilos específicos para móviles pequeños */
	@media (max-width: 480px) {
		.mobile-sidebar {
			width: 95vw;
			max-height: 85vh;
		}
		
		.filter-header {
			padding: 0.75rem;
		}
		
		.filter-header h2 {
			font-size: 1.25rem;
		}
		
		.close-filters-btn {
			width: 36px;
			height: 36px;
		}
		
		.filter-content {
			padding: 0 0.75rem 0.25rem 0.75rem;
			max-height: calc(85vh - 120px);
		}
		
		.filter-apply-btn {
			margin: 0rem 0.75rem 0.5rem 0.75rem;
			padding: 0.875rem 1.25rem;
			font-size: 0.95rem;
		}
		
		.mobile-filters-btn {
			padding: 0.875rem 1.25rem !important;
			font-size: 0.95rem !important;
			margin: 0.5rem 0 !important;
		}
	}

/* Asegurar visibilidad en todos los móviles */
@media (max-width: 600px) {
	.mobile-filters-btn {
		display: flex !important;
		visibility: visible !important;
		opacity: 1 !important;
	}
}

	.filter-box {
		height: 100%;
		margin-top: 0;
		padding: 0;
		box-shadow: none;
		background: white;
		border-radius: 16px;
		display: flex;
		flex-direction: column;
		max-width: 100%;
		overflow: hidden;
	}

	.filter-apply-btn {
		margin-top: 1.5rem;
	}

	.providers-main {
		width: 100%;
		max-width: 100%;
	}
}

@media (max-width: 600px) {
	.providers-layout {
		margin: 1rem auto;
		padding: 0 0.8rem;
	}

	.provider-card {
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 1.2rem;
	}

	.provider-header {
		flex-direction: column;
		gap: 0.5rem;
		align-items: center;
	}

	.provider-photo {
		width: 100px;
		height: 100px;
	}

	.pagination {
		flex-wrap: wrap;
		gap: 0.8rem;
	}

	.filter-box {
		padding: 0.7rem 0.4rem;
		margin-top: 1rem;
		border-radius: 8px;
		box-shadow: 0 1px 4px rgba(12,59,46,0.05);
		gap: 0.7rem;
	}
	.filter-box h2 {
		font-size: 1.2rem;
		padding-bottom: 0.2rem;
		border-bottom-width: 1px;
	}
	.filter-label {
		font-size: 1rem;
		padding-bottom: 0.2rem;
	}
	.filter-section {
		gap: 0.4rem;
	}
	.filter-date-btns {
		gap: 0.3rem;
	}
	.filter-date-btns button {
		padding: 0.35rem 0.2rem;
		font-size: 0.85rem;
		border-radius: 0.7rem;
	}
	.compact-checkboxes label {
		font-size: 0.92rem;
		padding: 0.15rem 0;
	}
	.compact-checkboxes input[type="checkbox"] {
		width: 16px;
		height: 16px;
	}
	.filter-provider-type label {
		font-size: 0.92rem;
		gap: 0.4rem;
	}
	.filter-provider-type input[type="radio"] {
		width: 16px;
		height: 16px;
	}
	.compact-select {
		padding: 0.35rem 0.5rem;
		font-size: 0.92rem;
		border-radius: 6px;
	}
	.price-inputs {
		gap: 0.2rem;
		flex-direction: row;
	}
	.price-input-group {
		flex: 1;
	}
	.price-input-label {
		font-size: 0.85rem;
		margin-bottom: 0.1rem;
	}
	.price-input {
		padding: 0.3rem 0.5rem;
		font-size: 0.92rem;
		border-radius: 6px;
	}
	.price-separator {
		margin-top: 0.5rem;
		font-size: 0.9rem;
	}
	.filter-apply-btn {
		padding: 0.5rem 0.7rem;
		font-size: 0.95rem;
		border-radius: 6px;
		margin-top: 0.7rem;
	}
}

/* Estilos para los checkboxes */
.filter-checkboxes label {
	color: #0C3B2E;
}

.filter-checkboxes input[type="checkbox"] {
	accent-color: #6D9773;
}

/* Estilos para fieldset y legend */
fieldset {
	border: none;
	padding: 0;
	margin: 0;
}

legend.filter-label {
	color: #0C3B2E;
	font-weight: 600;
	font-size: 1.1rem;
	margin: 0;
	padding-bottom: 0.5rem;
	float: none;
	width: auto;
}

.filter-price-range {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	padding: 0.5rem;
}

.price-inputs {
	display: flex;
	align-items: center;
	gap: 0.75rem;
}

.price-input-group {
	flex: 1;
}

.price-input-label {
	font-size: 0.9rem;
	color: #666;
	margin-bottom: 0.4rem;
	display: block;
}

.price-input {
	width: 100%;
	padding: 0.6rem 1rem;
	border: 2px solid #6D9773;
	border-radius: 8px;
	font-size: 1rem;
	color: #0C3B2E;
	background: #fff;
}

.price-input:focus {
	outline: none;
	border-color: #0C3B2E;
}

.price-separator {
	margin-top: 1.5rem;
	color: #666;
	font-weight: 500;
}

.time-select {
	width: 100%;
	padding: 0.75rem 1rem;
	border: 2px solid #6D9773;
	border-radius: 8px;
	font-size: 1rem;
	color: #0C3B2E;
	background: #fff;
	cursor: pointer;
	appearance: none;
	background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236D9773' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
	background-repeat: no-repeat;
	background-position: right 1rem center;
	padding-right: 2.5rem;
}

.time-select:focus {
	outline: none;
	border-color: #0C3B2E;
}

.time-select::placeholder {
	color: #666;
}

/* Estilos para filtro de tipo de proveedor */
.filter-provider-type {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	padding-left: 0.5rem;
}

.filter-provider-type label {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	color: #0C3B2E;
	font-size: 1rem;
	cursor: pointer;
}

.filter-provider-type input[type="radio"] {
	width: 18px;
	height: 18px;
	accent-color: #6D9773;
	cursor: pointer;
}

/* Estados de carga y error */
.loading-state,
.error-state,
.empty-state {
	text-align: center;
	padding: 3rem 1rem;
	color: #666;
}

.loading-spinner {
	width: 40px;
	height: 40px;
	border: 4px solid #f3f3f3;
	border-top: 4px solid #6D9773;
	border-radius: 50%;
	animation: spin 1s linear infinite;
	margin: 0 auto 1rem;
}

@keyframes spin {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}

.retry-btn {
	background: #0C3B2E;
	color: #fff;
	border: none;
	border-radius: 8px;
	padding: 0.75rem 1.5rem;
	font-size: 1rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s;
	margin-top: 1rem;
}

.retry-btn:hover {
	background: #6D9773;
}

/* Mejoras en las tarjetas de proveedores */
.provider-name-section {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.provider-type-badge {
	background: #6D9773;
	color: #fff;
	font-size: 0.8rem;
	font-weight: 600;
	padding: 0.25rem 0.75rem;
	border-radius: 1rem;
	width: fit-content;
}

.provider-location {
	color: #666;
	font-size: 0.9rem;
	margin-top: 0.5rem;
}

.phone-btn {
	background: #BB8A52;
	color: #fff;
	border: none;
	border-radius: 6px;
	padding: 0.5rem 1rem;
	font-size: 0.9rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s;
	margin-left: 0.5rem;
}

.phone-btn:hover {
	background: #a67a45;
	transform: translateY(-1px);
}

/* Estilos para iconos SVG */
.provider-icon,
.rating-icon,
.location-icon,
.phone-icon {
	display: inline-block;
	vertical-align: middle;
	margin-right: 0.5rem;
}

.provider-type-badge {
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.provider-rating {
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.provider-location {
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.phone-btn {
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

/* Desktop - sidebar visible por defecto */
.desktop-sidebar {
	display: block;
}

/* Mobile - botón oculto por defecto */
.mobile-filters-btn {
	display: none;
	background: #0C3B2E;
	color: white;
	border: none;
	border-radius: 12px;
	padding: 1rem 1.5rem;
	font-size: 1rem;
	font-weight: 600;
	cursor: pointer;
	align-items: center;
	gap: 0.75rem;
	margin-bottom: 1.5rem;
	width: 100%;
	justify-content: center;
	transition: all 0.3s;
	box-shadow: 0 4px 12px rgba(12, 59, 46, 0.3);
	order: -1;
}

/* Mobile - modal oculto por defecto */
.mobile-sidebar {
	display: none;
}

.mobile-filters-btn:hover {
	background: #6D9773;
}

/* Modal overlay */
.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	background: rgba(0, 0, 0, 0.6);
	z-index: 999;
	display: none;
	backdrop-filter: blur(3px);
	-webkit-backdrop-filter: blur(3px);
}

/* Header de filtros con botón cerrar */
	.filter-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		padding: 1rem;
		padding-bottom: 1rem;
		border-bottom: 2px solid #e0e0e0;
		background: white;
		position: sticky;
		top: 0;
		z-index: 10;
	}

.filter-header h2 {
	margin: 0;
	color: #0C3B2E;
	font-size: 1.5rem;
	font-weight: 700;
}

.close-filters-btn {
	display: none;
	background: #f5f5f5;
	border: none;
	color: #666;
	cursor: pointer;
	padding: 0.5rem;
	border-radius: 50%;
	transition: all 0.2s;
	width: 40px;
	height: 40px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.close-filters-btn:hover {
	background: #e0e0e0;
	color: #333;
}

/* Dark mode styles */
:global(.dark) .page-wrapper {
	background-color: #0f172a;
}

:global(.dark) .providers-layout {
	background-color: #0f172a;
	color: white;
}

:global(.dark) .providers-main h1 {
	color: white;
}

:global(.dark) .providers-count {
	color: #cbd5e1;
}

:global(.dark) .filter-box {
	background: #334155;
	border: 1px solid #475569;
}

:global(.dark) .filter-box h2 {
	color: white;
	border-bottom-color: #10b981;
}

:global(.dark) .filter-label {
	color: white;
}

:global(.dark) legend.filter-label {
	color: white;
}

:global(.dark) .filter-date-btns button {
	background: #475569;
	color: white;
	border-color: #64748b;
}

:global(.dark) .filter-date-btns button.selected,
:global(.dark) .filter-date-btns button:hover {
	background: #10b981;
	color: white;
	border-color: #10b981;
}

:global(.dark) .filter-checkboxes label {
	color: white;
}

:global(.dark) .filter-checkboxes input[type="checkbox"] {
	accent-color: #10b981;
}

:global(.dark) .price-input-label {
	color: #cbd5e1;
}

:global(.dark) .price-input {
	background: #475569;
	border-color: #64748b;
	color: white;
}

:global(.dark) .price-input:focus {
	border-color: #10b981;
}

:global(.dark) .price-separator {
	color: #cbd5e1;
}

:global(.dark) .time-select {
	background: #475569;
	border-color: #64748b;
	color: white;
}

:global(.dark) .time-select:focus {
	border-color: #10b981;
}

:global(.dark) .filter-provider-type label {
	color: white;
}

:global(.dark) .filter-provider-type input[type="radio"] {
	accent-color: #10b981;
}

:global(.dark) .providers-list {
	background: transparent;
}

:global(.dark) .filter-apply-btn {
	background: #10b981;
	color: white;
}

:global(.dark) .filter-apply-btn:hover {
	background: #059669;
}

:global(.dark) .provider-card {
	background: #334155;
	border-color: #475569;
	color: white;
}

:global(.dark) .provider-card:hover {
	box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

:global(.dark) .provider-header h2 {
	color: white;
}

:global(.dark) .provider-rating {
	color: #cbd5e1;
}

:global(.dark) .provider-price {
	color: #10b981;
}

:global(.dark) .provider-description {
	color: #cbd5e1;
}

:global(.dark) .provider-type-badge {
	background: #10b981;
	color: white;
}

:global(.dark) .provider-location {
	color: #cbd5e1;
}

/* Iconos SVG en modo oscuro - blancos */
:global(.dark) .provider-icon,
:global(.dark) .rating-icon,
:global(.dark) .location-icon,
:global(.dark) .phone-icon {
	color: white;
}

:global(.dark) .provider-type-badge {
	background: #10b981;
	color: white;
}

:global(.dark) .provider-rating {
	color: #cbd5e1;
}

:global(.dark) .provider-rating .rating-icon {
	color: #fbbf24;
}

:global(.dark) .provider-location {
	color: #cbd5e1;
}

:global(.dark) .phone-btn {
	background: #10b981;
	color: white;
}

:global(.dark) .contact-btn {
	background: #10b981;
	color: white;
}

:global(.dark) .contact-btn:hover {
	background: #059669;
}

:global(.dark) .phone-btn {
	background: #10b981;
	color: white;
}

:global(.dark) .phone-btn:hover {
	background: #059669;
}

:global(.dark) .pagination {
	background: #334155;
	border: 1px solid #475569;
}

:global(.dark) .pagination-btn {
	background: #475569;
	color: white;
	border-color: #64748b;
}

:global(.dark) .pagination-btn:hover:not(:disabled) {
	background: #10b981;
	border-color: #10b981;
}

:global(.dark) .pagination-num {
	background: #475569;
	color: white;
	border: 1px solid #64748b;
}

:global(.dark) .pagination-num.active {
	background: #10b981;
	color: white;
	border-color: #10b981;
}

:global(.dark) .loading-state,
:global(.dark) .error-state,
:global(.dark) .empty-state {
	color: white;
}

:global(.dark) .loading-spinner {
	border-color: #475569;
	border-top-color: #10b981;
}

:global(.dark) .retry-btn {
	background: #10b981;
	color: white;
}

:global(.dark) .retry-btn:hover {
	background: #059669;
}

/* Estilos de modo oscuro para mobile modal */
:global(.dark) .mobile-filters-btn {
	background: #10b981;
	color: white;
}

:global(.dark) .mobile-filters-btn:hover {
	background: #059669;
}

:global(.dark) .filter-sidebar {
	background: #334155;
}

:global(.dark) .close-filters-btn {
	color: #cbd5e1;
}

:global(.dark) .close-filters-btn:hover {
	background: #475569;
	color: white;
}
</style> 