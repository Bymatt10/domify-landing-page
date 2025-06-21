<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import type { Category } from '$lib/types';

	export let data: PageData;
	$: ({ session } = data);

	// @ts-expect-error - El linter a veces no detecta el tipo de `data` correctamente desde +page.server.ts, pero el código funciona.
	let categories: Category[] = data.categories || [];
	let selectedCategorySlug = '';
	let searchTerm = '';
	let showDropdown = false;
	let showSearchSuggestions = false;
	let searchBarWrapper: HTMLElement | null = null;

	$: filteredCategories = searchTerm
		? categories.filter((c: Category) => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
		: [];

	function handleSearch() {
		const categoryParam = selectedCategorySlug
			? `category=${encodeURIComponent(selectedCategorySlug)}`
			: '';
		const searchParam = searchTerm ? `search=${encodeURIComponent(searchTerm)}` : '';
		const query = [categoryParam, searchParam].filter(Boolean).join('&');
		goto(`/services?${query}`);
	}

	function selectCategory(slug: string, event?: MouseEvent) {
		if (event) event.stopPropagation();
		selectedCategorySlug = slug;
		showDropdown = false;
		const category = categories.find((c: Category) => c.slug === slug);
		if (category) {
			searchTerm = category.name;
		}
		handleSearch();
	}

	function getCategoryName(slug: string) {
		if (!slug) return 'Categoría';
		const category = categories.find((c: Category) => c.slug === slug);
		return category ? category.name : 'Categoría';
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleSearch();
		}
	}

	function handlePopularClick(slug: string, name: string) {
		selectedCategorySlug = slug;
		searchTerm = name;
		handleSearch();
	}

	onMount(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (searchBarWrapper && !searchBarWrapper.contains(event.target as Node)) {
				showDropdown = false;
				showSearchSuggestions = false;
			}
		};
		document.addEventListener('click', handleClickOutside);
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});

	const propertyTypes = [
		{
			id: 'houses',
			name: 'Casas',
			description: 'Servicios completos para casas unifamiliares',
			icon: '🏠',
			services: ['Limpieza profunda', 'Jardinería', 'Mantenimiento', 'Mudanzas']
		},
		{
			id: 'apartments',
			name: 'Apartamentos',
			description: 'Soluciones especializadas para espacios urbanos',
			icon: '🏢',
			services: ['Limpieza regular', 'Montaje de muebles', 'Instalaciones', 'Organización']
		},
		{
			id: 'commercial',
			name: 'Plazas Comerciales',
			description: 'Servicios corporativos y comerciales',
			icon: '🏪',
			services: ['Limpieza comercial', 'Mantenimiento', 'Logística', 'Seguridad']
		}
	];

	const testimonials = [
		{
			name: 'María González',
			location: 'Casa en Las Condes',
			rating: 5,
			comment: 'Excelente servicio de limpieza. Los profesionales fueron muy puntuales y dejaron mi casa impecable.',
			avatar: '👩‍💼'
		},
		{
			name: 'Carlos Rodríguez',
			location: 'Apartamento en Providencia',
			rating: 5,
			comment: 'El servicio de montaje de muebles fue perfecto. Muy recomendado para mudanzas.',
			avatar: '👨‍💼'
		},
		{
			name: 'Ana Silva',
			location: 'Oficina en Santiago Centro',
			rating: 5,
			comment: 'Contratamos limpieza comercial y quedamos muy satisfechos. Profesionales y confiables.',
			avatar: '👩‍💻'
		}
	];

	const stats = [
		{ number: '500+', label: 'Profesionales Verificados' },
		{ number: '2,000+', label: 'Servicios Completados' },
		{ number: '4.9', label: 'Calificación Promedio' },
		{ number: '24/7', label: 'Soporte Disponible' }
	];

	const sponsors = [
		{
			logo: '/img/bac.png',
			description: 'Banco de América Central'
		},
		{
			logo: '/img/lafise.png',
			description: 'Grupo Financiero Lafise'
		},
		{
			logo: '/img/cadur.png',
			description: 'Cadur Group'
		}
	];

	let searchQuery = '';
	let statsVisible = false;
	let animatedStats = {
		professionals: 0,
		services: 0,
		rating: 0,
		support: '0/0'
	};

	const finalStats = {
		professionals: 500,
		services: 2000,
		rating: 4.9,
		support: '24/7'
	};

	function handlePropertyTypeClick(propertyId: string) {
		goto(`/services?property=${propertyId}`);
	}

	function animateStats() {
		if (statsVisible) return;
		statsVisible = true;

		const professionalsInterval = setInterval(() => {
			animatedStats.professionals += 25;
			if (animatedStats.professionals >= finalStats.professionals) {
				animatedStats.professionals = finalStats.professionals;
				clearInterval(professionalsInterval);
			}
		}, 20);

		const servicesInterval = setInterval(() => {
			animatedStats.services += 100;
			if (animatedStats.services >= finalStats.services) {
				animatedStats.services = finalStats.services;
				clearInterval(servicesInterval);
			}
		}, 20);

		const ratingInterval = setInterval(() => {
			animatedStats.rating += 0.1;
			if (animatedStats.rating >= finalStats.rating) {
				animatedStats.rating = finalStats.rating;
				clearInterval(ratingInterval);
			}
		}, 50);

		setTimeout(() => {
			animatedStats.support = finalStats.support;
		}, 1000);
	}

	function intersectionObserver(node: HTMLElement, { threshold = 0.5, callback }: { threshold: number, callback: () => void }) {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						callback();
						observer.unobserve(node);
					}
				});
			},
			{ threshold }
		);

		observer.observe(node);

		return {
			destroy() {
				observer.unobserve(node);
			}
		};
	}
</script>

<div class="home">
	<section class="hero">
		<div class="hero-content">
			<h1>Encuentra los mejores servicios locales</h1>
			<p>Conectamos personas con profesionales confiables para todas tus necesidades del hogar</p>
			
			<div class="search-bar-wrapper" bind:this={searchBarWrapper}>
				<div class="search-bar">
					<input
						type="text"
						bind:value={searchTerm}
						placeholder="¿Qué servicio necesitas?"
						class="search-input"
						on:focus={() => (showSearchSuggestions = true)}
						on:keydown={handleKeyPress}
					/>
					<div class="category-selector">
						<button
							class="dropdown-toggle"
							on:click|stopPropagation={() => (showDropdown = !showDropdown)}
						>
							<span>{getCategoryName(selectedCategorySlug)}</span>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="chevron-icon"
								class:rotated={showDropdown}
							>
								<path d="m6 9 6 6 6-6" />
							</svg>
						</button>
						{#if showDropdown}
							<div class="dropdown-menu">
								<button class="dropdown-item" on:click={(e) => selectCategory('', e)}>
									Todas las categorías
								</button>
								{#each categories as category}
									<button
										class="dropdown-item"
										on:click={(e) => selectCategory(category.slug, e)}
									>
										{category.name}
									</button>
								{/each}
							</div>
						{/if}
					</div>
					<button class="search-button" on:click={handleSearch}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="search-icon"
						>
							<circle cx="11" cy="11" r="8"/>
							<path d="m21 21-4.35-4.35"/>
						</svg>
					</button>
				</div>
				
				{#if showSearchSuggestions && searchTerm && filteredCategories.length > 0}
					<div class="search-suggestions" role="listbox" aria-label="Sugerencias de búsqueda">
						{#each filteredCategories.slice(0, 3) as category}
							<button
								class="suggestion-item"
								role="option"
								on:click={() => selectCategory(category.slug)}
							>
								<img src={category.icon || '/img/cleaning.png'} alt="" class="suggestion-icon" />
								<div class="suggestion-content">
									<div class="suggestion-title">{category.name}</div>
									<div class="suggestion-desc">{category.description}</div>
								</div>
							</button>
						{/each}
					</div>
				{/if}
			</div>
			
			<div class="popular-searches">
				<span class="popular-label">Búsquedas populares:</span>
				{#each categories.slice(0, 3) as category}
					<button class="popular-tag" on:click={() => handlePopularClick(category.slug, category.name)}>
						{category.name}
					</button>
				{/each}
			</div>
		</div>
	</section>

	<section class="stats" use:intersectionObserver={{ threshold: 0.5, callback: animateStats }}>
		<div class="container">
			<div class="stats-grid">
				<div class="stat-item">
					<div class="stat-number">{animatedStats.professionals}+</div>
					<div class="stat-label">Profesionales Verificados</div>
				</div>
				<div class="stat-item">
					<div class="stat-number">{animatedStats.services}+</div>
					<div class="stat-label">Servicios Completados</div>
				</div>
				<div class="stat-item">
					<div class="stat-number">{animatedStats.rating.toFixed(1)}</div>
					<div class="stat-label">Calificación Promedio</div>
				</div>
				<div class="stat-item">
					<div class="stat-number">{animatedStats.support}</div>
					<div class="stat-label">Soporte Disponible</div>
				</div>
			</div>
		</div>
	</section>

	<section class="property-types">
		<div class="container">
			<h2>Servicios para Todo Tipo de Propiedades</h2>
			<p class="section-subtitle">Soluciones especializadas según tus necesidades</p>
			<div class="property-grid">
				{#each propertyTypes as property}
					<button 
						class="property-card"
						on:click={() => handlePropertyTypeClick(property.id)}
						on:keydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								handlePropertyTypeClick(property.id);
							}
						}}
					>
						<div class="property-icon" aria-hidden="true">{property.icon}</div>
						<h3>{property.name}</h3>
						<p>{property.description}</p>
						<div class="property-services">
							{#each property.services as service}
								<span class="service-tag">{service}</span>
							{/each}
						</div>
					</button>
				{/each}
			</div>
		</div>
	</section>

	<section class="categories-section">
		<div class="container">
			<h2>Nuestros Servicios</h2>
			<p>Explora la amplia gama de servicios que ofrecemos para tu hogar y negocio.</p>
			<div class="category-grid">
				{#each categories as category (category.id)}
					<button
						class="category-card"
						on:click={() => goto(`/services/${category.slug}`)}
						on:keydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								goto(`/services/${category.slug}`);
							}
						}}
					>
						<img
							src={category.icon || '/img/cleaning.png'}
							alt={`Ícono de ${category.name}`}
							class="category-icon"
						/>
						<h3>{category.name}</h3>
						<p>{category.description}</p>
					</button>
				{/each}
			</div>
		</div>
	</section>

	<section class="testimonials">
		<div class="container">
			<h2>Lo que dicen nuestros clientes</h2>
			<div class="testimonials-grid">
				{#each testimonials as testimonial}
					<div class="testimonial-card">
						<div class="testimonial-header">
							<div class="testimonial-avatar">{testimonial.avatar}</div>
							<div class="testimonial-info">
								<div class="testimonial-name">{testimonial.name}</div>
								<div class="testimonial-location">{testimonial.location}</div>
								<div class="testimonial-rating">
									{#each Array.from({ length: testimonial.rating }) as _}
										⭐
									{/each}
								</div>
							</div>
						</div>
						<p class="testimonial-comment">"{testimonial.comment}"</p>
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
					<div class="feature-icon">✅</div>
					<h3>Profesionales Verificados</h3>
					<p>Todos nuestros proveedores pasan por un riguroso proceso de verificación.</p>
				</div>
				<div class="feature-card">
					<div class="feature-icon">💰</div>
					<h3>Precios Transparentes</h3>
					<p>Sin sorpresas ni costos ocultos. Conoce el precio antes de contratar.</p>
				</div>
				<div class="feature-card">
					<div class="feature-icon">🛡️</div>
					<h3>Servicio Garantizado</h3>
					<p>Satisfacción garantizada en todos nuestros servicios.</p>
				</div>
				<div class="feature-card">
					<div class="feature-icon">⚡</div>
					<h3>Respuesta Rápida</h3>
					<p>Conectamos con profesionales disponibles en tu zona en minutos.</p>
				</div>
			</div>
		</div>
	</section>

	<section class="sponsors">
		<div class="container">
			<h2>Nuestros Aliados Estratégicos</h2>
			<p class="section-subtitle">Trabajamos con las mejores instituciones financieras</p>
			<div class="sponsors-grid">
				{#each sponsors as sponsor}
					<div class="sponsor-card">
						<div class="sponsor-logo">
							<img src={sponsor.logo} alt="Sponsor logo" />
						</div>
						<p>{sponsor.description}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<section class="cta-section">
		<div class="container">
			<div class="cta-content">
				<div class="cta-group">
					<h2>¿Necesitas un servicio?</h2>
					<p>Únete a miles de clientes satisfechos que confían en Domify</p>
					<div class="cta-buttons">
						<a href="/auth/signup" class="cta-button primary">Registrarse</a>
						<a href="/services" class="cta-button secondary">Explorar Servicios</a>
					</div>
				</div>

				<div class="cta-divider"></div>

				<div class="cta-group">
					<h2>¿Eres un profesional?</h2>
					<p>Únete a nuestra red de proveedores y haz crecer tu negocio</p>
					<div class="cta-buttons">
						<a href="/become-provider" class="cta-button primary">Conviértete en Domifito</a>
						<a href="/provider-benefits" class="cta-button secondary">Conoce los beneficios</a>
					</div>
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

	.search-bar-wrapper {
		position: relative;
		max-width: 700px;
		margin: 0 auto;
	}

	.search-bar {
		display: flex;
		align-items: center;
		background-color: white;
		border-radius: 999px;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
		overflow: hidden;
		width: 100%;
		height: 60px;
		border: 1px solid #e2e8f0;
	}

	.search-input {
		flex-grow: 1;
		border: none;
		outline: none;
		padding: 0 24px;
		font-size: 1rem;
		background: transparent;
		color: #4a5568;
	}

	.search-input::placeholder {
		color: #a0aec0;
	}

	.category-selector {
		position: relative;
		height: 100%;
	}

	.dropdown-toggle {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 100%;
		background-color: #f7fafc;
		border: none;
		border-left: 1px solid #e2e8f0;
		padding: 0 20px;
		cursor: pointer;
		min-width: 150px;
		font-size: 1rem;
		color: #2d3748;
		transition: background-color 0.2s;
	}

	.dropdown-toggle:hover {
		background-color: #edf2f7;
	}

	.chevron-icon {
		transition: transform 0.2s ease-in-out;
	}

	.chevron-icon.rotated {
		transform: rotate(180deg);
	}

	.dropdown-menu {
		position: absolute;
		top: calc(100% + 5px);
		left: 0;
		right: 0;
		background-color: white;
		border-radius: 8px;
		box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
		border: 1px solid #e2e8f0;
		z-index: 10;
		overflow: hidden;
	}

	.dropdown-item {
		display: block;
		width: 100%;
		text-align: left;
		padding: 12px 20px;
		border: none;
		background: none;
		cursor: pointer;
		font-size: 1rem;
		color: #4a5568;
	}

	.dropdown-item:hover {
		background-color: #f7fafc;
		color: var(--primary-color, #2d3748);
	}

	.search-button {
		background-color: var(--accent-color, #f59e0b);
		color: white;
		border: none;
		padding: 0 20px;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.search-button:hover {
		background-color: #d97706;
	}

	.search-button svg {
		width: 20px;
		height: 20px;
	}

	.search-suggestions {
		position: absolute;
		top: calc(100% + 5px);
		left: 0;
		right: 0;
		background-color: white;
		border-radius: 8px;
		box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
		border: 1px solid #e2e8f0;
		z-index: 10;
		overflow: hidden;
	}

	.suggestion-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		width: 100%;
		text-align: left;
		padding: 12px 20px;
		border: none;
		background: none;
		cursor: pointer;
		border-bottom: 1px solid #f0f0f0;
	}

	.suggestion-item:last-child {
		border-bottom: none;
	}

	.suggestion-item:hover {
		background-color: #f7fafc;
	}

	.suggestion-icon {
		width: 40px;
		height: 40px;
		object-fit: contain;
	}

	.suggestion-content {
		flex: 1;
	}

	.suggestion-title {
		font-weight: 500;
		color: #2d3748;
	}

	.suggestion-desc {
		font-size: 0.9rem;
		color: #718096;
	}

	.popular-searches {
		margin-top: 1rem;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.popular-label {
		font-size: 0.9rem;
		color: #cbd5e0;
	}

	.popular-tag {
		background: rgba(255, 255, 255, 0.1);
		color: white;
		border: 1px solid rgba(255, 255, 255, 0.2);
		padding: 0.5rem 1rem;
		border-radius: 999px;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.popular-tag:hover {
		background: rgba(255, 255, 255, 0.2);
	}

	/* Stats Section */
	.stats {
		background-color: var(--color-primary-dark);
		padding: var(--spacing-3xl) 0;
		color: var(--color-text-white);
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--spacing-2xl);
	}

	.stat-item {
		text-align: center;
	}

	.stat-number {
		font-size: var(--font-size-4xl);
		font-weight: 700;
		color: var(--color-highlight);
	}

	.stat-label {
		font-size: var(--font-size-lg);
		margin-top: var(--spacing-sm);
		opacity: 0.9;
	}

	/* Property Types Section */
	.property-types {
		padding: var(--spacing-3xl) 0;
		background: var(--color-background);
	}

	.section-subtitle {
		text-align: center;
		color: var(--color-text-light);
		font-size: var(--font-size-lg);
		margin-bottom: var(--spacing-2xl);
	}

	.property-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: var(--spacing-xl);
	}

	.property-card {
		background: var(--color-background-white);
		padding: var(--spacing-xl);
		border-radius: var(--border-radius-lg);
		text-align: center;
		cursor: pointer;
		transition: all var(--transition-fast);
		border: 1px solid rgba(0, 0, 0, 0.1);
		box-shadow: var(--shadow-sm);
	}

	.property-card:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-lg);
		border-color: var(--color-primary-light);
	}

	.property-icon {
		font-size: 3rem;
		margin-bottom: var(--spacing-md);
	}

	.property-card h3 {
		color: var(--color-primary);
		font-size: var(--font-size-xl);
		margin: 0 0 var(--spacing-sm);
	}

	.property-card p {
		color: var(--color-text-light);
		margin: 0 0 var(--spacing-lg);
		line-height: 1.5;
	}

	.property-services {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-sm);
		justify-content: center;
	}

	.service-tag {
		background: var(--color-primary-light);
		color: var(--color-text-white);
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: var(--border-radius-full);
		font-size: var(--font-size-xs);
		font-weight: 500;
	}

	/* Categories Section */
	.categories-section {
		padding: var(--spacing-3xl) 0;
		background: var(--color-background-white);
	}

	.categories-section h2 {
		text-align: center;
		color: var(--color-primary);
		font-size: var(--font-size-3xl);
		margin-bottom: var(--spacing-md);
	}

	.categories-section p {
		text-align: center;
		color: var(--color-text-light);
		max-width: 600px;
		margin: 0 auto var(--spacing-xl);
	}

	.category-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--spacing-lg);
	}

	.category-card {
		background: var(--color-background-white);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-lg);
		text-align: center;
		border: 1px solid #e2e8f0;
		transition: all var(--transition-fast);
		cursor: pointer;
	}

	.category-card:hover {
		transform: translateY(-5px);
		box-shadow: var(--shadow-lg);
		border-color: var(--color-highlight);
	}

	.category-icon {
		width: 60px;
		height: 60px;
		margin: 0 auto var(--spacing-md);
		object-fit: contain;
	}

	.category-card h3 {
		font-size: var(--font-size-xl);
		color: var(--color-primary);
		margin-bottom: var(--spacing-sm);
	}

	.category-card p {
		color: var(--color-text-light);
		font-size: var(--font-size-md);
		line-height: 1.5;
	}

	/* Testimonials Section */
	.testimonials {
		padding: var(--spacing-3xl) 0;
		background: var(--color-background);
	}

	.testimonials h2 {
		text-align: center;
		color: var(--color-primary);
		font-size: var(--font-size-3xl);
		margin: 0 0 var(--spacing-2xl);
	}

	.testimonials-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: var(--spacing-xl);
	}

	.testimonial-card {
		background: var(--color-background-white);
		padding: var(--spacing-xl);
		border-radius: var(--border-radius-lg);
		box-shadow: var(--shadow-sm);
		border: 1px solid rgba(0, 0, 0, 0.1);
	}

	.testimonial-header {
		display: flex;
		align-items: center;
		margin-bottom: var(--spacing-md);
	}

	.testimonial-avatar {
		font-size: 2rem;
		margin-right: var(--spacing-md);
	}

	.testimonial-name {
		font-weight: 600;
		color: var(--color-text);
		margin-bottom: 2px;
	}

	.testimonial-location {
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
		margin-bottom: var(--spacing-xs);
	}

	.testimonial-rating {
		font-size: var(--font-size-sm);
	}

	.testimonial-comment {
		color: var(--color-text);
		line-height: 1.6;
		font-style: italic;
		margin: 0;
	}

	/* Features Section */
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
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: var(--spacing-xl);
	}

	.feature-card {
		text-align: center;
		padding: var(--spacing-lg);
	}

	.feature-icon {
		font-size: 2.5rem;
		margin-bottom: var(--spacing-md);
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

	/* Sponsors Section */
	.sponsors {
		padding: var(--spacing-2xl) 0;
		background: var(--color-background-white);
		border-top: 1px solid rgba(0, 0, 0, 0.1);
	}

	.sponsors h2 {
		text-align: center;
		color: var(--color-primary);
		font-size: var(--font-size-3xl);
		margin: 0 0 var(--spacing-md);
	}

	.sponsors .section-subtitle {
		text-align: center;
		color: var(--color-text-light);
		font-size: var(--font-size-lg);
		margin-bottom: var(--spacing-xl);
	}

	.sponsors-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--spacing-lg);
	}

	.sponsor-card {
		background: transparent;
		padding: var(--spacing-lg);
		border-radius: var(--border-radius-md);
		text-align: center;
		border: none;
	}

	.sponsor-logo {
		width: 140px;
		height: 80px;
		margin: 0 auto var(--spacing-sm);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.sponsor-logo img {
		width: 140px;
		height: 80px;
		object-fit: contain;
		filter: grayscale(100%);
	}

	.sponsor-card p {
		color: var(--color-text);
		margin: 0;
		font-size: var(--font-size-sm);
		line-height: 1.4;
		font-weight: 500;
	}

	/* CTA Section */
	.cta-section {
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
		color: var(--color-text-white);
		padding: var(--spacing-3xl) 0;
		text-align: center;
	}

	.cta-content {
		display: flex;
		justify-content: center;
		align-items: stretch;
		gap: var(--spacing-3xl);
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 var(--spacing-lg);
	}

	.cta-group {
		flex: 1;
		max-width: 500px;
	}

	.cta-divider {
		width: 1px;
		background: rgba(255, 255, 255, 0.2);
		margin: 0 var(--spacing-xl);
	}

	.cta-content h2 {
		font-size: var(--font-size-3xl);
		margin: 0 0 var(--spacing-md);
	}

	.cta-content p {
		font-size: var(--font-size-lg);
		margin: 0 0 var(--spacing-2xl);
		opacity: 0.9;
	}

	.cta-buttons {
		display: flex;
		gap: var(--spacing-lg);
		justify-content: center;
		flex-wrap: wrap;
	}

	.cta-button {
		padding: var(--spacing-md) var(--spacing-2xl);
		border-radius: var(--border-radius-full);
		text-decoration: none;
		font-weight: 600;
		font-size: var(--font-size-lg);
		transition: all var(--transition-fast);
		display: inline-block;
	}

	.cta-button.primary {
		background: var(--color-highlight);
		color: var(--color-primary);
	}

	.cta-button.primary:hover {
		background: #e6a800;
		transform: translateY(-2px);
	}

	.cta-button.secondary {
		background: transparent;
		color: var(--color-text-white);
		border: 2px solid var(--color-text-white);
	}

	.cta-button.secondary:hover {
		background: var(--color-text-white);
		color: var(--color-primary);
		transform: translateY(-2px);
	}

	@media (max-width: 768px) {
		.hero h1 {
			font-size: var(--font-size-3xl);
		}

		.hero p {
			font-size: var(--font-size-lg);
		}

		.search-bar {
			flex-direction: column;
		}

		.category-selector {
			border-left: none;
			border-top: 1px solid rgba(255, 255, 255, 0.2);
		}

		.popular-searches {
			flex-direction: column;
			gap: var(--spacing-sm);
		}

		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: var(--spacing-lg);
		}

		.stat-number {
			font-size: var(--font-size-3xl);
		}

		.property-grid {
			grid-template-columns: 1fr;
		}

		.category-grid {
			grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
			gap: var(--spacing-md);
		}

		.category-card {
			padding: var(--spacing-md);
		}

		.category-icon {
			width: 50px;
			height: 50px;
			margin-bottom: var(--spacing-sm);
		}

		.category-card h3 {
			font-size: var(--font-size-base);
		}

		.category-card p {
			font-size: var(--font-size-xs);
		}

		.testimonials-grid {
			grid-template-columns: 1fr;
		}

		.features-grid {
			grid-template-columns: 1fr;
			gap: var(--spacing-lg);
		}

		.cta-content {
			flex-direction: column;
			gap: var(--spacing-2xl);
		}

		.cta-divider {
			width: 100%;
			height: 1px;
			margin: var(--spacing-lg) 0;
		}

		.cta-group {
			max-width: none;
		}

		.cta-buttons {
			flex-direction: column;
			align-items: center;
		}

		.cta-button {
			width: 100%;
			max-width: 300px;
		}

		.sponsors-grid {
			grid-template-columns: repeat(3, 1fr);
			gap: var(--spacing-lg);
		}

		.sponsor-logo {
			width: 100px;
			height: 60px;
		}

		.sponsor-logo img {
			width: 100px;
			height: 60px;
		}

		.sponsor-card p {
			font-size: var(--font-size-xs);
			font-weight: 500;
		}
	}
</style> 