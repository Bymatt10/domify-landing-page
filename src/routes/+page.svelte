<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';

	export let data: PageData;

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

	let selectedCategory = categories[0].id;
	let searchQuery = '';
	let showSearchSuggestions = false;
	let statsVisible = false;
	let isSearching = false;
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

	async function handleSearch() {
		if (searchQuery.trim()) {
			isSearching = true;
			await new Promise(resolve => setTimeout(resolve, 300));
			goto(`/services/${selectedCategory}?search=${encodeURIComponent(searchQuery.trim())}`);
		} else {
			isSearching = true;
			await new Promise(resolve => setTimeout(resolve, 300));
			goto(`/services/${selectedCategory}`);
		}
	}

	function handleCategoryClick(categoryId: string) {
		goto(`/services/${categoryId}`);
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleSearch();
		}
	}

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

	$: filteredCategories = categories.filter(category =>
		category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
		category.description.toLowerCase().includes(searchQuery.toLowerCase())
	);

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
			
			<div class="search-container">
				<div class="search-box">
					<div class="search-input-group">
						<input
							type="text"
							placeholder="¿Qué servicio necesitas?"
							bind:value={searchQuery}
							on:keypress={handleKeyPress}
							on:focus={() => showSearchSuggestions = true}
							class="search-input"
							aria-label="Buscar servicio"
						/>
						<button 
							on:click={handleSearch} 
							class="search-button"
							class:searching={isSearching}
							type="button"
							aria-label="Buscar"
							disabled={isSearching}
						>
							{#if isSearching}
								<div class="search-spinner">
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
										<circle cx="12" cy="12" r="10" stroke-dasharray="31.416" stroke-dashoffset="31.416" class="spinner-circle"/>
									</svg>
								</div>
							{:else}
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" class="search-icon">
									<circle cx="11" cy="11" r="8"/>
									<path d="m21 21-4.35-4.35"/>
								</svg>
							{/if}
						</button>
					</div>
					
					{#if showSearchSuggestions && searchQuery && filteredCategories.length > 0}
						<div 
							class="search-suggestions" 
							role="listbox"
							aria-label="Sugerencias de búsqueda"
						>
							{#each filteredCategories.slice(0, 3) as category}
								<button 
									class="suggestion-item"
									role="option"
									aria-selected={selectedCategory === category.id}
									on:click={() => {
										selectedCategory = category.id;
										searchQuery = category.name;
										showSearchSuggestions = false;
										handleSearch();
									}}
									on:keydown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											selectedCategory = category.id;
											searchQuery = category.name;
											showSearchSuggestions = false;
											handleSearch();
										}
									}}
								>
									<img src={category.icon} alt="" class="suggestion-icon" />
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
						<button 
							class="popular-tag"
							on:click={() => {
								selectedCategory = category.id;
								searchQuery = category.name;
								handleSearch();
							}}
						>
							{category.name}
						</button>
					{/each}
				</div>
			</div>
		</div>
	</section>

	<section class="stats-section" use:intersectionObserver={{ threshold: 0.5, callback: animateStats }}>
		<div class="container">
			<div class="stats-grid">
				<div class="stat-card">
					<div class="stat-number">{animatedStats.professionals}+</div>
					<div class="stat-label">Profesionales Verificados</div>
				</div>
				<div class="stat-card">
					<div class="stat-number">{animatedStats.services}+</div>
					<div class="stat-label">Servicios Completados</div>
				</div>
				<div class="stat-card">
					<div class="stat-number">{animatedStats.rating.toFixed(1)}</div>
					<div class="stat-label">Calificación Promedio</div>
				</div>
				<div class="stat-card">
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

	<section class="categories">
		<div class="container">
			<h2>Nuestros Servicios</h2>
			<div class="categories-grid">
				{#each categories as category}
					<button 
						class="category-card"
						on:click={() => handleCategoryClick(category.id)}
						on:keydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								handleCategoryClick(category.id);
							}
						}}
					>
						<div class="category-icon">
							<img src={category.icon} alt="" aria-hidden="true" />
						</div>
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

	.search-container {
		max-width: 600px;
		margin: 0 auto;
	}

	.search-box {
		position: relative;
		margin-bottom: var(--spacing-lg);
	}

	.search-input-group {
		display: flex;
		background: var(--color-background-white);
		border-radius: var(--border-radius-full);
		overflow: hidden;
		box-shadow: var(--shadow-lg);
		border: 2px solid transparent;
		transition: all var(--transition-fast);
		position: relative;
	}

	.search-input-group:focus-within {
		border-color: var(--color-highlight);
		box-shadow: 0 8px 25px rgba(230, 168, 0, 0.3);
		transform: translateY(-1px);
	}

	.search-input-group::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 2px;
		background: linear-gradient(90deg, var(--color-highlight), var(--color-primary));
		transform: scaleX(0);
		transition: transform 0.3s ease;
	}

	.search-input-group:focus-within::after {
		transform: scaleX(1);
	}

	.search-input {
		flex: 1;
		padding: var(--spacing-md) var(--spacing-lg);
		border: none;
		font-size: var(--font-size-lg);
		outline: none;
		background: transparent;
		transition: all var(--transition-fast);
	}

	.search-input:focus {
		background: rgba(230, 168, 0, 0.05);
	}

	.search-input::placeholder {
		color: var(--color-text-light);
		opacity: 0.7;
		transition: opacity var(--transition-fast);
	}

	.search-input:focus::placeholder {
		opacity: 0.5;
	}

	.search-button {
		padding: var(--spacing-md) var(--spacing-lg);
		background: var(--color-highlight);
		color: var(--color-primary);
		border: none;
		cursor: pointer;
		transition: all var(--transition-fast);
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		overflow: hidden;
		min-width: 60px;
	}

	.search-button::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: 0;
		height: 0;
		background: rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		transform: translate(-50%, -50%);
		transition: width 0.3s ease, height 0.3s ease;
	}

	.search-button:hover::before {
		width: 100px;
		height: 100px;
	}

	.search-button:hover {
		background: #e6a800;
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(230, 168, 0, 0.4);
	}

	.search-button:active {
		transform: translateY(0);
		box-shadow: 0 2px 8px rgba(230, 168, 0, 0.4);
	}

	.search-button:focus {
		outline: none;
		box-shadow: 0 0 0 3px rgba(230, 168, 0, 0.5);
	}

	.search-button.searching {
		background: #d4a000;
		cursor: not-allowed;
		animation: pulse 1.5s infinite;
	}

	.search-icon {
		transition: transform 0.2s ease;
	}

	.search-button:hover .search-icon {
		transform: scale(1.1);
	}

	.search-spinner {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.spinner-circle {
		animation: spin 1s linear infinite;
		transform-origin: center;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes pulse {
		0%, 100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.05);
		}
	}

	.search-suggestions {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		background: var(--color-background-white);
		border-radius: var(--border-radius-lg);
		box-shadow: var(--shadow-lg);
		margin-top: var(--spacing-sm);
		z-index: 10;
		overflow: hidden;
		animation: slideDown 0.3s ease-out;
		border: 1px solid rgba(0, 0, 0, 0.1);
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.suggestion-item {
		display: flex;
		align-items: center;
		padding: var(--spacing-md) var(--spacing-lg);
		cursor: pointer;
		transition: all var(--transition-fast);
		border-bottom: 1px solid rgba(0, 0, 0, 0.05);
		position: relative;
	}

	.suggestion-item:last-child {
		border-bottom: none;
	}

	.suggestion-item::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 3px;
		background: var(--color-highlight);
		transform: scaleY(0);
		transition: transform 0.2s ease;
	}

	.suggestion-item:hover {
		background: var(--color-background);
		transform: translateX(4px);
	}

	.suggestion-item:hover::before {
		transform: scaleY(1);
	}

	.suggestion-item:active {
		background: rgba(230, 168, 0, 0.1);
		transform: translateX(2px);
	}

	.suggestion-icon {
		width: 32px;
		height: 32px;
		margin-right: var(--spacing-md);
		object-fit: contain;
	}

	.suggestion-content {
		flex: 1;
	}

	.suggestion-title {
		font-weight: 600;
		color: var(--color-text);
		margin-bottom: 2px;
	}

	.suggestion-desc {
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
	}

	.popular-searches {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-md);
		flex-wrap: wrap;
	}

	.popular-label {
		font-size: var(--font-size-sm);
		opacity: 0.8;
	}

	.popular-tag {
		background: rgba(255, 255, 255, 0.1);
		color: var(--color-text-white);
		border: 1px solid rgba(255, 255, 255, 0.2);
		padding: var(--spacing-sm) var(--spacing-md);
		border-radius: var(--border-radius-full);
		font-size: var(--font-size-sm);
		cursor: pointer;
		transition: all var(--transition-fast);
		position: relative;
		overflow: hidden;
	}

	.popular-tag::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: 0;
		height: 0;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 50%;
		transform: translate(-50%, -50%);
		transition: width 0.3s ease, height 0.3s ease;
	}

	.popular-tag:hover::before {
		width: 100px;
		height: 100px;
	}

	.popular-tag:hover {
		background: rgba(255, 255, 255, 0.2);
		border-color: var(--color-highlight);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
	}

	.popular-tag:active {
		transform: translateY(0);
		box-shadow: 0 2px 8px rgba(255, 255, 255, 0.2);
	}

	/* Stats Section */
	.stats-section {
		background: var(--color-background-white);
		padding: var(--spacing-3xl) 0;
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--spacing-xl);
	}

	.stat-card {
		text-align: center;
		padding: var(--spacing-lg);
		opacity: 0;
		transform: translateY(20px);
		animation: fadeInUp 0.6s ease-out forwards;
	}

	.stat-card:nth-child(1) { animation-delay: 0.1s; }
	.stat-card:nth-child(2) { animation-delay: 0.2s; }
	.stat-card:nth-child(3) { animation-delay: 0.3s; }
	.stat-card:nth-child(4) { animation-delay: 0.4s; }

	@keyframes fadeInUp {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.stat-number {
		font-size: var(--font-size-4xl);
		font-weight: 700;
		color: var(--color-primary);
		margin-bottom: var(--spacing-sm);
		transition: all 0.3s ease;
	}

	.stat-label {
		font-size: var(--font-size-lg);
		color: var(--color-text-light);
		font-weight: 500;
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
	.categories {
		padding: var(--spacing-3xl) 0;
		background: var(--color-background-white);
	}

	.categories h2 {
		text-align: center;
		color: var(--color-primary);
		font-size: var(--font-size-3xl);
		margin: 0 0 var(--spacing-2xl);
	}

	.categories-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--spacing-lg);
	}

	.category-card {
		background-color: var(--color-background-white);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-lg);
		text-align: center;
		cursor: pointer;
		transition: all var(--transition-fast);
		border: 1px solid rgba(0, 0, 0, 0.1);
	}

	.category-card:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
		border-color: var(--color-primary-light);
	}

	.category-icon {
		width: 60px;
		height: 60px;
		margin: 0 auto var(--spacing-md);
	}

	.category-icon img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.category-card h3 {
		color: var(--color-primary);
		font-size: var(--font-size-lg);
		margin: 0 0 var(--spacing-sm);
	}

	.category-card p {
		color: var(--color-text-light);
		margin: 0;
		line-height: 1.4;
		font-size: var(--font-size-sm);
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

		.search-input-group {
			flex-direction: column;
			border-radius: var(--border-radius-lg);
		}

		.search-button {
			border-radius: 0 0 var(--border-radius-lg) var(--border-radius-lg);
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

		.categories-grid {
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