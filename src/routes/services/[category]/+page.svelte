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
let priceRange = [200, 1000];
let selectedProviderType: 'all' | 'individual' | 'company' = 'all';

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
	'assembly': 'Ensamblaje'
};

// Mapeo inverso para obtener el ID de la categoría
const categoryIdMapping: { [key: string]: number } = {
	'mounting': 2, // Montaje
	'cleaning': 4, // Limpieza
	'gardening': 5, // Jardinería
	'moving': 3, // Mudanzas
	'assembly': 1  // Ensamblaje
};

// Obtener la categoría de la URL
$: category = $page.params.category.charAt(0).toUpperCase() + $page.params.category.slice(1);

async function fetchProviders() {
	try {
		loading = true;
		error = '';
		
		const categoryId = categoryIdMapping[$page.params.category];
		if (!categoryId) {
			error = 'Categoría no encontrada';
			return;
		}

		const params = new URLSearchParams({
			category_id: categoryId.toString(),
			limit: '50' // Obtener más proveedores para filtrar
		});

		if (selectedProviderType !== 'all') {
			params.append('provider_type', selectedProviderType);
		}

		const response = await fetch(`/api/providers?${params}`);
		const result = await response.json();

		if (!response.ok) {
			throw new Error(result.message || 'Error al cargar proveedores');
		}

		// Aplicar filtros de precio
		let filteredProviders = result.data.providers.filter((provider: Provider) => {
			return provider.hourly_rate >= priceRange[0] && provider.hourly_rate <= priceRange[1];
		});

		// Ordenar por rating (más alto primero)
		filteredProviders.sort((a: Provider, b: Provider) => b.rating - a.rating);

		providers = filteredProviders;
		currentPage = 1; // Resetear a la primera página
	} catch (err) {
		console.error('Error fetching providers:', err);
		error = err instanceof Error ? err.message : 'Error al cargar proveedores';
	} finally {
		loading = false;
	}
}

function applyFilters() {
	// Solo aplicar filtros si ya estamos en el cliente
	if (typeof window !== 'undefined') {
		fetchProviders();
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

<div class="providers-layout">
	<aside class="filter-sidebar">
		<div class="filter-box">
			<div class="filter-content">
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
						<div class="filter-checkboxes">
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
						<div class="filter-or">o</div>
						<select class="time-select" bind:value={specificTime} id="time-select">
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
										min="100" 
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
										min="100" 
										max="3000" 
										class="price-input"
									/>
								</div>
							</div>
							<div class="price-separator">
								El precio promedio es <b>C$500/hr</b>
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
										{p.provider_type === 'individual' ? '👤 Individual' : '🏢 Empresa'}
									</span>
								</div>
								<div class="provider-price">C${p.hourly_rate}/hr</div>
							</div>
							<div class="provider-rating">
								⭐ {p.rating.toFixed(1)} ({p.total_reviews} reseñas)
							</div>
							<p class="provider-description">{p.description}</p>
							{#if p.location}
								<div class="provider-location">
									📍 {p.location}
								</div>
							{/if}
							<div class="provider-footer">
								<button class="contact-btn">Contactar</button>
								{#if p.phone}
									<button class="phone-btn">📞 {p.phone}</button>
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

<style>
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
	display: flex;
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

@media (max-width: 900px) {
	.providers-layout {
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
		padding: 0 1rem;
	}

	.filter-box {
		height: auto;
	}

	.filter-apply-btn {
		margin-top: 1.5rem;
	}

	.filter-sidebar {
		position: static;
		width: 100%;
		max-width: 600px;
	}

	.providers-main {
		width: 100%;
		max-width: 600px;
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
</style> 