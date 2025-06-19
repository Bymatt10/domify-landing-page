<script lang="ts">
import { page } from '$app/stores';
import { onMount } from 'svelte';

interface Provider {
	name: string;
	photo: string;
	rating: number;
	price: number;
	description: string;
	reviews: number;
}

let category = '';
let providers: Provider[] = [];

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

// Filtros visuales (sin lógica funcional aún)
let selectedDate = 'week';
let selectedTimes: string[] = [];
let timeOfDay = {
	morning: false,
	afternoon: false,
	evening: false
};
let specificTime = '';
let priceRange = [20, 100];

const timeOptions = [
	"I'm Flexible",
	'8:00am', '8:30am', '9:00am', '9:30am', '10:00am', '10:30am', '11:00am', '11:30am',
	'12:00pm', '12:30pm', '1:00pm', '1:30pm', '2:00pm', '2:30pm', '3:00pm', '3:30pm',
	'4:00pm', '4:30pm', '5:00pm', '5:30pm', '6:00pm', '6:30pm', '7:00pm', '7:30pm',
	'8:00pm', '8:30pm', '9:00pm', '9:30pm'
];

// Datos simulados de ejemplo (10 por categoría)
const allProviders: Record<string, Provider[]> = {
	'Limpieza': [
		{
			name: 'Ana López',
			photo: '/img/cleaning.png',
			rating: 4.9,
			price: 15,
			description: 'Especialista en limpieza de casas y oficinas. Rápida, confiable y detallista.',
			reviews: 120
		},
		{
			name: 'Carlos Pérez',
			photo: '/img/cleaning.png',
			rating: 4.7,
			price: 13,
			description: 'Limpieza profunda y ecológica. ¡Tu espacio reluciente!',
			reviews: 98
		},
		{
			name: 'María García',
			photo: '/img/cleaning.png',
			rating: 4.8,
			price: 14,
			description: 'Limpieza profesional de departamentos y oficinas.',
			reviews: 110
		},
		{
			name: 'Luis Fernández',
			photo: '/img/cleaning.png',
			rating: 4.6,
			price: 12,
			description: 'Servicio rápido y eficiente, especializado en limpiezas profundas.',
			reviews: 87
		},
		{
			name: 'Sofía Ramírez',
			photo: '/img/cleaning.png',
			rating: 4.9,
			price: 16,
			description: 'Limpieza ecológica y detallada. Garantía de satisfacción.',
			reviews: 134
		},
		{
			name: 'Jorge Castillo',
			photo: '/img/cleaning.png',
			rating: 4.5,
			price: 11,
			description: 'Limpieza básica y mantenimiento semanal.',
			reviews: 76
		},
		{
			name: 'Valeria Torres',
			photo: '/img/cleaning.png',
			rating: 4.8,
			price: 15,
			description: 'Especialista en limpieza de cocinas y baños.',
			reviews: 102
		},
		{
			name: 'Miguel Díaz',
			photo: '/img/cleaning.png',
			rating: 4.7,
			price: 13,
			description: 'Limpieza rápida para mudanzas y eventos.',
			reviews: 91
		},
		{
			name: 'Lucía Herrera',
			photo: '/img/cleaning.png',
			rating: 4.9,
			price: 17,
			description: 'Limpieza profunda y desinfección.',
			reviews: 128
		},
		{
			name: 'Pedro Morales',
			photo: '/img/cleaning.png',
			rating: 4.6,
			price: 12,
			description: 'Limpieza de alfombras y tapizados.',
			reviews: 83
		}
	],
	'Mudanzas': [
		{
			name: 'María Torres',
			photo: '/img/moving.png',
			rating: 4.8,
			price: 20,
			description: 'Mudanzas rápidas y seguras. Cuidamos tus pertenencias.',
			reviews: 80
		},
		{
			name: 'Juan Pérez',
			photo: '/img/moving.png',
			rating: 4.7,
			price: 19,
			description: 'Servicio de mudanza local y nacional.',
			reviews: 75
		},
		{
			name: 'Sergio Gómez',
			photo: '/img/moving.png',
			rating: 4.9,
			price: 22,
			description: 'Mudanzas con embalaje profesional.',
			reviews: 92
		},
		{
			name: 'Andrea Ruiz',
			photo: '/img/moving.png',
			rating: 4.8,
			price: 21,
			description: 'Mudanzas familiares y de oficinas.',
			reviews: 88
		},
		{
			name: 'Carlos Mendoza',
			photo: '/img/moving.png',
			rating: 4.6,
			price: 18,
			description: 'Transporte seguro y puntual.',
			reviews: 70
		},
		{
			name: 'Patricia Salas',
			photo: '/img/moving.png',
			rating: 4.7,
			price: 20,
			description: 'Mudanzas económicas y confiables.',
			reviews: 77
		},
		{
			name: 'Roberto Castro',
			photo: '/img/moving.png',
			rating: 4.8,
			price: 23,
			description: 'Especialista en mudanzas de objetos delicados.',
			reviews: 85
		},
		{
			name: 'Elena Vargas',
			photo: '/img/moving.png',
			rating: 4.9,
			price: 22,
			description: 'Mudanzas rápidas para estudiantes.',
			reviews: 90
		},
		{
			name: 'David Herrera',
			photo: '/img/moving.png',
			rating: 4.7,
			price: 19,
			description: 'Mudanzas y fletes en toda la ciudad.',
			reviews: 73
		},
		{
			name: 'Sonia Ríos',
			photo: '/img/moving.png',
			rating: 4.8,
			price: 21,
			description: 'Mudanzas con seguro incluido.',
			reviews: 82
		}
	],
	'Jardinería': [
		{
			name: 'Pedro Flores',
			photo: '/img/gardening.png',
			rating: 4.9,
			price: 18,
			description: 'Jardines hermosos y bien cuidados. Experto en plantas.',
			reviews: 65
		},
		{
			name: 'Laura Ramos',
			photo: '/img/gardening.png',
			rating: 4.8,
			price: 17,
			description: 'Diseño y mantenimiento de jardines.',
			reviews: 60
		},
		{
			name: 'José Martínez',
			photo: '/img/gardening.png',
			rating: 4.7,
			price: 16,
			description: 'Poda de árboles y arbustos.',
			reviews: 58
		},
		{
			name: 'Marta Castillo',
			photo: '/img/gardening.png',
			rating: 4.9,
			price: 19,
			description: 'Jardinería ecológica y orgánica.',
			reviews: 67
		},
		{
			name: 'Andrés Suárez',
			photo: '/img/gardening.png',
			rating: 4.8,
			price: 18,
			description: 'Instalación de sistemas de riego.',
			reviews: 62
		},
		{
			name: 'Cecilia Vega',
			photo: '/img/gardening.png',
			rating: 4.7,
			price: 17,
			description: 'Decoración de jardines y terrazas.',
			reviews: 59
		},
		{
			name: 'Ricardo Díaz',
			photo: '/img/gardening.png',
			rating: 4.8,
			price: 18,
			description: 'Mantenimiento mensual de jardines.',
			reviews: 64
		},
		{
			name: 'Paula Morales',
			photo: '/img/gardening.png',
			rating: 4.9,
			price: 20,
			description: 'Jardinería para eventos y fiestas.',
			reviews: 69
		},
		{
			name: 'Felipe Navarro',
			photo: '/img/gardening.png',
			rating: 4.7,
			price: 16,
			description: 'Cuidado de césped y plantas.',
			reviews: 57
		},
		{
			name: 'Natalia Paredes',
			photo: '/img/gardening.png',
			rating: 4.8,
			price: 19,
			description: 'Jardinería creativa y personalizada.',
			reviews: 63
		}
	],
	'Ensamblaje': [
		{
			name: 'Lucía Gómez',
			photo: '/img/assembly.png',
			rating: 4.8,
			price: 17,
			description: 'Montaje y ensamblaje de muebles con garantía.',
			reviews: 54
		},
		{
			name: 'Mario Torres',
			photo: '/img/assembly.png',
			rating: 4.7,
			price: 16,
			description: 'Ensamblaje rápido y profesional.',
			reviews: 49
		},
		{
			name: 'Sandra Ruiz',
			photo: '/img/assembly.png',
			rating: 4.9,
			price: 18,
			description: 'Especialista en muebles de oficina.',
			reviews: 58
		},
		{
			name: 'Javier Díaz',
			photo: '/img/assembly.png',
			rating: 4.8,
			price: 17,
			description: 'Montaje de muebles a domicilio.',
			reviews: 52
		},
		{
			name: 'Patricia Herrera',
			photo: '/img/assembly.png',
			rating: 4.7,
			price: 16,
			description: 'Ensamblaje de muebles infantiles.',
			reviews: 47
		},
		{
			name: 'Fernando Salas',
			photo: '/img/assembly.png',
			rating: 4.8,
			price: 18,
			description: 'Montaje de escritorios y estanterías.',
			reviews: 55
		},
		{
			name: 'Gabriela Castro',
			photo: '/img/assembly.png',
			rating: 4.9,
			price: 19,
			description: 'Ensamblaje con herramientas propias.',
			reviews: 60
		},
		{
			name: 'Raúl Mendoza',
			photo: '/img/assembly.png',
			rating: 4.7,
			price: 16,
			description: 'Montaje de muebles para mudanzas.',
			reviews: 48
		},
		{
			name: 'Elena Vargas',
			photo: '/img/assembly.png',
			rating: 4.8,
			price: 17,
			description: 'Ensamblaje y reparación de muebles.',
			reviews: 53
		},
		{
			name: 'Tomás Ríos',
			photo: '/img/assembly.png',
			rating: 4.8,
			price: 18,
			description: 'Montaje profesional y seguro.',
			reviews: 56
		}
	],
	'Montaje': [
		{
			name: 'Juan Martínez',
			photo: '/img/mounting.png',
			rating: 4.7,
			price: 16,
			description: 'Montaje profesional de cuadros, TV y más.',
			reviews: 42
		},
		{
			name: 'Sofía López',
			photo: '/img/mounting.png',
			rating: 4.8,
			price: 17,
			description: 'Montaje de estanterías y repisas.',
			reviews: 45
		},
		{
			name: 'Diego Ramírez',
			photo: '/img/mounting.png',
			rating: 4.9,
			price: 18,
			description: 'Montaje seguro y rápido.',
			reviews: 50
		},
		{
			name: 'Valentina Torres',
			photo: '/img/mounting.png',
			rating: 4.8,
			price: 17,
			description: 'Montaje de muebles y decoración.',
			reviews: 47
		},
		{
			name: 'Martín Díaz',
			photo: '/img/mounting.png',
			rating: 4.7,
			price: 16,
			description: 'Montaje de soportes para TV.',
			reviews: 43
		},
		{
			name: 'Camila Herrera',
			photo: '/img/mounting.png',
			rating: 4.8,
			price: 18,
			description: 'Montaje de cuadros y espejos.',
			reviews: 48
		},
		{
			name: 'Andrés Salas',
			photo: '/img/mounting.png',
			rating: 4.9,
			price: 19,
			description: 'Montaje profesional para oficinas.',
			reviews: 51
		},
		{
			name: 'Paula Mendoza',
			photo: '/img/mounting.png',
			rating: 4.7,
			price: 16,
			description: 'Montaje de muebles infantiles.',
			reviews: 44
		},
		{
			name: 'Felipe Castro',
			photo: '/img/mounting.png',
			rating: 4.8,
			price: 17,
			description: 'Montaje de estanterías metálicas.',
			reviews: 46
		},
		{
			name: 'Natalia Ríos',
			photo: '/img/mounting.png',
			rating: 4.8,
			price: 18,
			description: 'Montaje y organización de espacios.',
			reviews: 49
		}
	]
};

// Obtener la categoría de la URL
$: category = $page.params.category.charAt(0).toUpperCase() + $page.params.category.slice(1);

onMount(() => {
	providers = allProviders[category] ?? [];
});
</script>

<div class="providers-layout">
	<aside class="filter-sidebar">
		<div class="filter-box">
			<div class="filter-content">
				<h2>Filtrar</h2>
				<div class="filter-section">
					<label class="filter-label">Fecha</label>
					<div class="filter-date-btns">
						<button class:selected={selectedDate === 'today'} on:click={() => selectedDate = 'today'}>Hoy</button>
						<button class:selected={selectedDate === '3days'} on:click={() => selectedDate = '3days'}>3 días</button>
						<button class:selected={selectedDate === 'week'} on:click={() => selectedDate = 'week'}>Esta semana</button>
						<button class:selected={selectedDate === 'custom'} on:click={() => selectedDate = 'custom'}>Elegir fecha</button>
					</div>
				</div>
				<div class="filter-section">
					<label class="filter-label">Hora del día</label>
					<div class="filter-checkboxes">
						<label>
							<input type="checkbox" bind:checked={timeOfDay.morning} />
							Mañana (8am - 12pm)
						</label>
						<label>
							<input type="checkbox" bind:checked={timeOfDay.afternoon} />
							Tarde (12pm - 5pm)
						</label>
						<label>
							<input type="checkbox" bind:checked={timeOfDay.evening} />
							Noche (5pm - 9:30pm)
						</label>
					</div>
					<div class="filter-or">o</div>
					<select class="time-select" bind:value={specificTime}>
						<option value="" disabled selected>Elegir hora específica</option>
						{#each Array.from({ length: 14 }, (_, i) => i + 8) as hour}
							<option value={hour}>
								{hour}:00 {hour < 12 ? 'AM' : 'PM'}
							</option>
						{/each}
					</select>
				</div>
				<div class="filter-section">
					<label class="filter-label">Precio por hora</label>
					<div class="filter-price-range">
						<div class="price-inputs">
							<div class="price-input-group">
								<label class="price-input-label">Desde</label>
								<input 
									type="number" 
									bind:value={priceRange[0]} 
									min="10" 
									max="150" 
									class="price-input"
								/>
							</div>
							<span class="price-separator">-</span>
							<div class="price-input-group">
								<label class="price-input-label">Hasta</label>
								<input 
									type="number" 
									bind:value={priceRange[1]} 
									min="10" 
									max="150" 
									class="price-input"
								/>
							</div>
						</div>
						<div class="price-separator">
							El precio promedio es <b>$50/hr</b>
						</div>
					</div>
				</div>
			</div>
			<button class="filter-apply-btn">Aplicar filtros</button>
		</div>
	</aside>
	<main class="providers-main">
		<h1>Proveedores de {category}</h1>
		{#if providers.length === 0}
			<p>No hay proveedores disponibles en esta categoría aún.</p>
		{:else}
			<div class="providers-count">
				Mostrando {Math.min(currentPage * itemsPerPage, providers.length)} de {providers.length} proveedores
			</div>
			<div class="providers-list">
				{#each paginatedProviders as p}
					<div class="provider-card">
						<img src={p.photo} alt={p.name} class="provider-photo" />
						<div class="provider-info">
							<div class="provider-header">
								<h2>{p.name}</h2>
								<div class="provider-price">${p.price}/hr</div>
							</div>
							<div class="provider-rating">
								⭐ {p.rating} ({p.reviews} reseñas)
							</div>
							<p class="provider-description">{p.description}</p>
							<div class="provider-footer">
								<button class="contact-btn">Contactar</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
			
			<!-- Paginación -->
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

.filter-select {
	width: 100%;
	padding: 0.75rem 1rem;
	border-radius: 0.5rem;
	border: 2px solid #6D9773;
	font-size: 1rem;
	color: #0C3B2E;
	background-color: #fff;
	cursor: pointer;
	transition: all 0.2s;
}

.filter-select:focus {
	outline: none;
	border-color: #0C3B2E;
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

.provider-list {
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

.provider-rating span {
	color: #666;
	font-size: 0.9rem;
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
</style> 