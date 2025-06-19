<script lang="ts">
	import { goto } from '$app/navigation';
	export let data: any;
	
	let { session } = data;
	$: ({ session } = data);

	const categories = [
		{
			id: 'cleaning',
			name: 'Limpieza',
			description: 'Servicios profesionales de limpieza para tu hogar u oficina',
			icon: '/img/cleaning.png'
		},
		{
			id: 'moving',
			name: 'Mudanza',
			description: 'Ayuda profesional para tu mudanza, empaque y transporte',
			icon: '/img/moving.png'
		},
		{
			id: 'gardening',
			name: 'Jardinería',
			description: 'Mantenimiento y diseño de jardines por expertos',
			icon: '/img/gardening.png'
		},
		{
			id: 'assembly',
			name: 'Ensamblaje',
			description: 'Montaje de muebles y equipos por profesionales',
			icon: '/img/assembly.png'
		},
		{
			id: 'mounting',
			name: 'Montaje',
			description: 'Instalación profesional de TV, cuadros y más',
			icon: '/img/mounting.png'
		}
	];

	let selectedCategory = categories[0].name;
	let searchQuery = '';

	function selectCategory(name: string) {
		goto(`/services/${encodeURIComponent(name.toLowerCase())}`);
	}

	// function handleSearch() {
	// 	// Aquí puedes redirigir o filtrar resultados
	// 	alert(`Buscar: ${searchQuery} en ${selectedCategory}`);
	// }

	function handleCategoryClick(categoryId: string) {
		goto(`/services/${categoryId}`);
	}
</script>

<div class="home">
	<section class="hero">
		<div class="hero-content">
			<h1>Encuentra los mejores servicios locales</h1>
			<p>Conectamos personas con profesionales confiables para todas tus necesidades del hogar</p>
			<a href="/services" class="cta-button">Explorar Servicios</a>
		</div>
	</section>

	<section class="categories">
		<div class="container">
			<h2>Nuestros Servicios</h2>
			<div class="categories-grid">
				{#each categories as category}
					<div class="category-card" on:click={() => handleCategoryClick(category.id)}>
						<div class="category-icon">
							<img src={category.icon} alt={category.name} />
						</div>
						<h3>{category.name}</h3>
						<p>{category.description}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<section class="features">
		<div class="container">
			<h2>¿Por qué elegir Domify?</h2>
			<div class="features-grid">
				<div class="feature-card">
					<h3>Profesionales Verificados</h3>
					<p>Todos nuestros proveedores pasan por un riguroso proceso de verificación.</p>
				</div>
				<div class="feature-card">
					<h3>Precios Transparentes</h3>
					<p>Sin sorpresas ni costos ocultos. Conoce el precio antes de contratar.</p>
				</div>
				<div class="feature-card">
					<h3>Servicio Garantizado</h3>
					<p>Satisfacción garantizada en todos nuestros servicios.</p>
				</div>
			</div>
		</div>
	</section>
</div>

<style>
	.home {
		background-color: var(--color-background);
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 var(--spacing-lg);
	}

	.hero {
		background-color: var(--color-primary);
		color: var(--color-text-white);
		padding: var(--spacing-3xl) 0;
		text-align: center;
	}

	.hero-content {
		max-width: 800px;
		margin: 0 auto;
		padding: 0 var(--spacing-lg);
	}

	.hero h1 {
		font-size: var(--font-size-4xl);
		margin: 0 0 var(--spacing-lg);
		line-height: 1.2;
	}

	.hero p {
		font-size: var(--font-size-xl);
		margin: 0 0 var(--spacing-2xl);
		opacity: 0.9;
	}

	.cta-button {
		display: inline-block;
		background-color: var(--color-highlight);
		color: var(--color-primary);
		padding: var(--spacing-md) var(--spacing-2xl);
		border-radius: var(--border-radius-full);
		text-decoration: none;
		font-weight: 600;
		font-size: var(--font-size-lg);
		transition: transform 0.2s;
	}

	.cta-button:hover {
		transform: translateY(-2px);
	}

	.categories {
		padding: var(--spacing-3xl) 0;
	}

	.categories h2 {
		text-align: center;
		color: var(--color-primary);
		font-size: var(--font-size-3xl);
		margin: 0 0 var(--spacing-2xl);
	}

	.categories-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: var(--spacing-xl);
	}

	.category-card {
		background-color: var(--color-background-white);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-xl);
		text-align: center;
		cursor: pointer;
		transition: all 0.2s;
		border: 1px solid rgba(0, 0, 0, 0.1);
	}

	.category-card:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-md);
		border-color: var(--color-primary-light);
	}

	.category-icon {
		width: 80px;
		height: 80px;
		margin: 0 auto var(--spacing-lg);
	}

	.category-icon img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.category-card h3 {
		color: var(--color-primary);
		font-size: var(--font-size-xl);
		margin: 0 0 var(--spacing-sm);
	}

	.category-card p {
		color: var(--color-text-light);
		margin: 0;
		line-height: 1.5;
	}

	.features {
		background-color: var(--color-background-white);
		padding: var(--spacing-3xl) 0;
		border-top: 1px solid rgba(0, 0, 0, 0.1);
	}

	.features h2 {
		text-align: center;
		color: var(--color-primary);
		font-size: var(--font-size-3xl);
		margin: 0 0 var(--spacing-2xl);
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: var(--spacing-xl);
	}

	.feature-card {
		text-align: center;
		padding: var(--spacing-xl);
	}

	.feature-card h3 {
		color: var(--color-primary);
		font-size: var(--font-size-xl);
		margin: 0 0 var(--spacing-md);
	}

	.feature-card p {
		color: var(--color-text-light);
		margin: 0;
		line-height: 1.6;
	}

	@media (max-width: 768px) {
		.hero h1 {
			font-size: var(--font-size-3xl);
		}

		.hero p {
			font-size: var(--font-size-lg);
		}

		.categories-grid {
			grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		}

		.features-grid {
			grid-template-columns: 1fr;
			gap: var(--spacing-lg);
		}
	}
</style> 