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
			icon: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5L12 4l9 7.5V20a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-4h-4v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V11.5z"/><path d="M9 21V12h6v9"/></svg>`,
			services: ['Limpieza profunda', 'Jardinería', 'Mantenimiento', 'Mudanzas']
		},
		{
			id: 'apartments',
			name: 'Apartamentos',
			description: 'Soluciones especializadas para espacios urbanos',
			icon: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="7" height="13" rx="2"/><rect x="14" y="3" width="7" height="17" rx="2"/><path d="M7.5 10.5h.01M7.5 14.5h.01M18.5 7.5h.01M18.5 11.5h.01M18.5 15.5h.01"/></svg>`,
			services: ['Limpieza regular', 'Montaje de muebles', 'Instalaciones', 'Organización']
		},
		{
			id: 'commercial',
			name: 'Plazas Comerciales',
			description: 'Servicios corporativos y comerciales',
			icon: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="13" rx="2"/><path d="M6 7V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3"/><path d="M9 21V12h6v9"/><path d="M12 17h.01"/></svg>`,
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

<svelte:head>
	<title>Domify - Encuentra Servicios Locales de Confianza</title>
	<meta name="description" content="Domify es el marketplace líder para encontrar y contratar servicios de limpieza, mudanza, jardinería, ensamblaje y más en tu ciudad. Profesionales verificados y soporte 24/7." />
	<meta name="keywords" content="servicios, marketplace, limpieza, mudanza, jardinería, ensamblaje, proveedores, Domify, contratar, hogar, profesionales" />
	<meta property="og:title" content="Domify - Encuentra Servicios Locales de Confianza" />
	<meta property="og:description" content="Domify es el marketplace líder para encontrar y contratar servicios de limpieza, mudanza, jardinería, ensamblaje y más en tu ciudad." />
	<meta property="og:image" content="https://domify.app/img/og-image.png" />
	<meta property="og:url" content="https://domify.app/" />
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Domify - Encuentra Servicios Locales de Confianza" />
	<meta name="twitter:description" content="Domify es el marketplace líder para encontrar y contratar servicios de limpieza, mudanza, jardinería, ensamblaje y más en tu ciudad." />
	<meta name="twitter:image" content="https://domify.app/img/og-image.png" />
</svelte:head>

<div class="home">
	<div class="home-layout">
		<!-- Sidebar izquierdo para anuncios -->
		<aside class="ad-sidebar ad-sidebar-left">
			<div class="ad-space">
				<!-- Ejemplo 1: Google AdSense -->
				<div class="ad-example">
					<div class="ad-header">
						<span class="ad-badge">Anuncio</span>
						<span class="ad-provider">Google AdSense</span>
					</div>
					<div class="ad-content">
						<!-- CÓDIGO REAL DE GOOGLE ADSENSE:
						<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-TU_PUBLISHER_ID"
						     crossorigin="anonymous"></script>
						<ins class="adsbygoogle"
						     style="display:block"
						     data-ad-client="ca-pub-TU_PUBLISHER_ID"
						     data-ad-slot="TU_AD_SLOT"
						     data-ad-format="auto"
						     data-full-width-responsive="true"></ins>
						<script>
						     (adsbygoogle = window.adsbygoogle || []).push({});
						</script>
						-->
						<div class="ad-image-placeholder google-style">
							<div class="ad-image-content">
								<div class="ad-image-icon">🧹</div>
								<div class="ad-image-text">Servicios Profesionales</div>
							</div>
						</div>
						<div class="ad-text">
							<h4>Servicios de Limpieza Profesional</h4>
							<p>Limpieza de casas y oficinas con garantía de calidad. Profesionales verificados y precios transparentes.</p>
							<div class="ad-cta">Ver más</div>
						</div>
					</div>
				</div>

				<!-- Ejemplo 2: Anuncio personalizado -->
				<div class="ad-space" style="margin-top: var(--spacing-lg);">
					<div class="ad-example custom-ad">
						<div class="ad-header">
							<span class="ad-badge">Patrocinado</span>
							<span class="ad-provider">Domify Premium</span>
						</div>
						<div class="ad-content">
							<div class="ad-icon">🏠</div>
							<div class="ad-text">
								<h4>Conviértete en Proveedor Premium</h4>
								<p>Accede a más clientes y mejores tarifas</p>
								<button class="ad-button">Aplicar Ahora</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</aside>

		<!-- Contenido principal -->
		<main class="main-content">
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
								<div class="property-icon" aria-hidden="true">{@html property.icon}</div>
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
							<div class="feature-icon">{@html `<svg width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='10'/><path d='M16 10l-4.5 4.5L8 12'/></svg>`}</div>
							<h3>Profesionales Verificados</h3>
							<p>Todos nuestros proveedores pasan por un riguroso proceso de verificación.</p>
						</div>
						<div class="feature-card">
							<div class="feature-icon">{@html `<svg width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><rect x='2' y='7' width='20' height='13' rx='2'/><path d='M6 7V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3'/></svg>`}</div>
							<h3>Precios Transparentes</h3>
							<p>Sin sorpresas ni costos ocultos. Conoce el precio antes de contratar.</p>
						</div>
						<div class="feature-card">
							<div class="feature-icon">{@html `<svg width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><path d='M12 2l2 7h7l-5.5 4 2 7-5.5-4-5.5 4 2-7L3 9h7z'/></svg>`}</div>
							<h3>Servicio Garantizado</h3>
							<p>Satisfacción garantizada en todos nuestros servicios.</p>
						</div>
						<div class="feature-card">
							<div class="feature-icon">{@html `<svg width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><path d='M13 2v8h8'/><path d='M2 12a10 10 0 1 0 10-10'/></svg>`}</div>
							<h3>Respuesta Rápida</h3>
							<p>Conectamos con profesionales disponibles en tu zona en minutos.</p>
						</div>
					</div>
				</div>
			</section>


		</main>

		<!-- Sidebar derecho para anuncios -->
		<aside class="ad-sidebar ad-sidebar-right">
			<div class="ad-space">
				<!-- Ejemplo 3: Anuncio de Facebook Ads -->
				<div class="ad-example facebook-ad">
					<div class="ad-header">
						<span class="ad-badge">Anuncio</span>
						<span class="ad-provider">Facebook Ads</span>
					</div>
					<div class="ad-content">
						<div class="ad-image-placeholder facebook-style">
							<div class="ad-image-content">
								<div class="ad-image-icon">📦</div>
								<div class="ad-image-text">Oferta Especial</div>
							</div>
						</div>
						<div class="ad-text">
							<h4>20% de Descuento en Mudanzas</h4>
							<p>Válido solo este mes. ¡Reserva ahora y ahorra en tu próxima mudanza!</p>
							<div class="ad-cta">Obtener Descuento</div>
						</div>
					</div>
				</div>

				<!-- Ejemplo 4: Anuncio de afiliado -->
				<div class="ad-space" style="margin-top: var(--spacing-lg);">
					<div class="ad-example affiliate-ad">
						<div class="ad-header">
							<span class="ad-badge">Recomendado</span>
							<span class="ad-provider">Aliado Estratégico</span>
						</div>
						<div class="ad-content">
							<div class="ad-icon">🛡️</div>
							<div class="ad-text">
								<h4>Seguro para el Hogar</h4>
								<p>Protege tu propiedad con las mejores coberturas</p>
								<button class="ad-button secondary">Cotizar</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</aside>
	</div>

	<!-- CTA Section - Full Width -->
	<section class="cta-section">
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
	</section>
</div>

<style>
	.home {
		background-color: var(--color-background);
	}

	/* Layout de tres columnas */
	.home-layout {
		display: grid;
		grid-template-columns: 300px 1fr 300px;
		gap: var(--spacing-xl);
		max-width: 1800px;
		margin: 0 auto;
		padding: 0 var(--spacing-lg);
	}

	/* Sidebars para anuncios */
	.ad-sidebar {
		position: sticky;
		top: var(--spacing-xl);
		height: fit-content;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xl);
	}

	.ad-space {
		background: var(--color-background-white);
		border-radius: var(--border-radius-lg);
		box-shadow: var(--shadow-md);
		overflow: hidden;
		transition: all var(--transition-fast);
	}

	.ad-space:hover {
		box-shadow: var(--shadow-lg);
		transform: translateY(-2px);
	}

	/* Estilos para ejemplos de anuncios */
	.ad-example {
		background: var(--color-background-white);
		border-radius: var(--border-radius-lg);
		overflow: hidden;
		transition: all var(--transition-fast);
	}

	.ad-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-sm) var(--spacing-md);
		background: var(--color-background);
		border-bottom: 1px solid rgba(0, 0, 0, 0.05);
	}

	.ad-badge {
		background: var(--color-highlight);
		color: var(--color-primary);
		padding: 2px var(--spacing-sm);
		border-radius: var(--border-radius-sm);
		font-size: var(--font-size-xs);
		font-weight: 600;
	}

	.ad-provider {
		font-size: var(--font-size-xs);
		color: var(--color-text-light);
		font-weight: 500;
	}

	.ad-content {
		padding: var(--spacing-md);
	}

	.ad-icon {
		font-size: 2.5rem;
		text-align: center;
		margin-bottom: var(--spacing-md);
	}

	.ad-text h4 {
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: var(--color-text);
		margin: 0 0 var(--spacing-sm);
		line-height: 1.3;
	}

	.ad-text p {
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
		margin: 0 0 var(--spacing-md);
		line-height: 1.4;
	}

	.ad-cta {
		background: var(--color-primary);
		color: var(--color-text-white);
		padding: var(--spacing-sm) var(--spacing-md);
		border-radius: var(--border-radius-md);
		text-align: center;
		font-weight: 600;
		font-size: var(--font-size-sm);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.ad-cta:hover {
		background: var(--color-primary-dark);
		transform: translateY(-1px);
	}

	.ad-button {
		width: 100%;
		padding: var(--spacing-sm) var(--spacing-md);
		border: none;
		border-radius: var(--border-radius-md);
		font-weight: 600;
		font-size: var(--font-size-sm);
		cursor: pointer;
		transition: all var(--transition-fast);
		background: var(--color-highlight);
		color: #fff;
	}

	.ad-button:hover {
		background: #e6a800;
		transform: translateY(-1px);
	}

	.ad-button.secondary {
		background: var(--color-primary);
		color: var(--color-text-white);
	}

	.ad-button.secondary:hover {
		background: var(--color-primary-dark);
	}

	:global(.dark) .ad-button {
		color: #fff;
	}

	/* Estilos específicos para diferentes tipos de anuncios */
	.custom-ad {
		border: 2px solid var(--color-highlight);
	}

	.facebook-ad {
		border: 2px solid #1877F2;
	}

	.affiliate-ad {
		border: 2px solid var(--color-primary);
	}

	/* Contenido principal */
	.main-content {
		min-width: 0; /* Permite que el contenido se ajuste */
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 var(--spacing-lg);
	}

	.hero {
		background: linear-gradient(135deg, #0C3B2E 0%, #1a5d47 100%);
		color: white;
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
		color: white;
	}

	.hero p {
		font-size: var(--font-size-xl);
		margin: 0 0 var(--spacing-2xl);
		opacity: 0.9;
		color: white;
	}

	.search-container {
		max-width: 600px;
		margin: 0 auto;
	}

	.search-box {
		margin-bottom: var(--spacing-lg);
	}

	.search-input-group {
		display: flex;
		flex-direction: row !important;
		border-radius: 999px;
		background: #fff;
		box-shadow: none;
		border: none;
		overflow: hidden;
		align-items: stretch;
		width: 100%;
		max-width: 100%;
	}

	.search-input {
		flex: 1;
		padding: 0 1.25rem;
		height: 56px;
		border: none;
		font-size: 1.25rem;
		background: transparent;
		color: #222;
		border-radius: 999px 0 0 999px;
		outline: none;
	}

	.search-input::placeholder {
		color: #888;
		opacity: 1;
	}

	.search-button {
		width: 56px;
		height: 56px;
		background: linear-gradient(135deg, #f7b955 0%, #f7a13d 100%);
		border: none;
		border-radius: 0 999px 999px 0;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.2s;
		box-shadow: none;
	}

	.search-button:active, .search-button:focus {
		background: linear-gradient(135deg, #f7a13d 0%, #f7b955 100%);
		outline: none;
	}

	.search-icon {
		color: var(--color-text-white);
	}

	:global(.dark) .search-input-group {
		background: #232b36;
	}
	:global(.dark) .search-input {
		background-color: #232b36;
		color: var(--color-text-white);
		border-radius: 999px 0 0 999px;
	}
	:global(.dark) .search-input::placeholder {
		color: var(--color-text-white);
		opacity: 0.7;
	}

	.search-spinner {
		color: var(--color-text-white);
	}

	:global(.dark) .search-spinner {
		color: var(--color-text-white);
	}

	@media (max-width: 600px) {
		.search-input {
			font-size: 1rem;
			height: 44px;
			padding: 0 1rem;
		}
		.search-button {
			width: 44px;
			height: 44px;
		}
		.search-input-group {
			flex-direction: row !important;
			border-radius: 22px;
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

	.property-types .container {
		text-align: center;
	}

	.property-types h2 {
		text-align: center;
		color: var(--color-primary);
		font-size: var(--font-size-3xl);
		margin: 0 0 var(--spacing-md);
		line-height: 1.2;
	}

	.property-types .section-subtitle {
		text-align: center;
		color: var(--color-text-light);
		font-size: var(--font-size-lg);
		margin: 0 0 var(--spacing-2xl);
		max-width: 600px;
		margin-left: auto;
		margin-right: auto;
		line-height: 1.5;
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
		font-size: 2rem;
		margin-bottom: var(--spacing-md);
		color: var(--color-primary);
	}

	:global(.dark) .feature-icon {
		color: var(--color-primary);
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

	/* CTA Section - estilos para modo claro y oscuro */
	.cta-section {
		background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
		color: var(--color-text);
		padding: var(--spacing-3xl) 0;
		text-align: center;
		border-top: 1px solid var(--color-border-light, rgba(0, 0, 0, 0.1));
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
		background: var(--color-border, rgba(0, 0, 0, 0.1));
		margin: 0 var(--spacing-xl);
	}

	.cta-content h2 {
		font-size: var(--font-size-3xl);
		margin: 0 0 var(--spacing-md);
		color: var(--color-primary);
		font-weight: 700;
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
		background: var(--color-primary);
		color: white;
	}

	.cta-button.primary:hover {
		background: var(--color-primary-hover);
		transform: translateY(-2px);
	}

	.cta-button.secondary {
		background: transparent;
		color: var(--color-primary);
		border: 2px solid var(--color-primary);
	}

	.cta-button.secondary:hover {
		background: var(--color-primary);
		color: white;
		transform: translateY(-2px);
	}

	/* Responsive design */
	@media (min-width: 1400px) {
		.home-layout {
			grid-template-columns: 250px 1fr 250px;
			gap: var(--spacing-lg);
		}
		
		.hero h1 {
			font-size: var(--font-size-4xl);
		}
		
		.hero p {
			font-size: var(--font-size-xl);
		}
	}

	@media (max-width: 1200px) {
		.home-layout {
			grid-template-columns: 200px 1fr 200px;
			gap: var(--spacing-md);
		}
		
		.hero h1 {
			font-size: var(--font-size-3xl);
		}
		
		.hero p {
			font-size: var(--font-size-lg);
		}
	}

	@media (max-width: 1024px) {
		.home-layout {
			grid-template-columns: 1fr;
			gap: 0;
			padding: 0 var(--spacing-md);
		}

		.ad-sidebar {
			display: none; /* Ocultar sidebars en pantallas pequeñas */
		}

		.main-content {
			width: 100%;
		}
		
		.hero {
			padding: var(--spacing-2xl) 0;
		}
		
		.hero h1 {
			font-size: var(--font-size-3xl);
		}
		
		.hero p {
			font-size: var(--font-size-lg);
		}
		
		.search-container {
			max-width: 600px;
		}
		
		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: var(--spacing-lg);
		}
		
		.categories-grid {
			grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
			gap: var(--spacing-lg);
		}
		
		.testimonials-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: var(--spacing-lg);
		}
		
		.features-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: var(--spacing-xl);
		}
	}

	@media (max-width: 768px) {
		.home-layout {
			padding: 0 var(--spacing-sm);
		}
		
		.hero {
			padding: var(--spacing-xl) 0;
		}
		
		.hero h1 {
			font-size: var(--font-size-2xl);
			line-height: 1.2;
		}

		.hero p {
			font-size: var(--font-size-base);
			margin-bottom: var(--spacing-lg);
		}
		
		.search-container {
			max-width: 100%;
		}

		.search-input-group {
			flex-direction: column;
			border-radius: var(--border-radius-lg);
			gap: 0;
		}

		.search-button {
			border-radius: 0 0 var(--border-radius-lg) var(--border-radius-lg);
			height: 50px;
		}
		
		.search-input {
			height: 50px;
			font-size: var(--font-size-base);
		}

		.popular-searches {
			flex-direction: column;
			gap: var(--spacing-sm);
			align-items: center;
		}
		
		.popular-searches span {
			font-size: var(--font-size-sm);
		}

		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: var(--spacing-md);
		}
		
		.stat-card {
			padding: var(--spacing-lg);
		}

		.stat-number {
			font-size: var(--font-size-2xl);
		}
		
		.stat-label {
			font-size: var(--font-size-sm);
		}

		.property-grid {
			grid-template-columns: 1fr;
			gap: var(--spacing-lg);
		}
		
		.property-card {
			padding: var(--spacing-lg);
		}

		.categories-grid {
			grid-template-columns: repeat(2, 1fr);
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
			gap: var(--spacing-lg);
		}
		
		.testimonial-card {
			padding: var(--spacing-lg);
		}

		.features-grid {
			grid-template-columns: 1fr;
			gap: var(--spacing-lg);
		}
		
		.feature-card {
			padding: var(--spacing-lg);
		}

		.cta-content {
			flex-direction: column;
			gap: var(--spacing-2xl);
			padding: 0 var(--spacing-md);
		}

		.cta-divider {
			width: 100%;
			height: 1px;
			margin: var(--spacing-lg) 0;
		}

		.cta-group {
			max-width: none;
		}
		
		.cta-group h2 {
			font-size: var(--font-size-2xl);
		}
		
		.cta-group p {
			font-size: var(--font-size-base);
		}

		.cta-buttons {
			flex-direction: column;
			align-items: center;
			gap: var(--spacing-md);
		}

		.cta-button {
			width: 100%;
			max-width: 300px;
			padding: var(--spacing-md) var(--spacing-xl);
			font-size: var(--font-size-base);
		}
	}
	
	@media (max-width: 480px) {
		.home-layout {
			padding: 0 var(--spacing-xs);
		}
		
		.hero {
			padding: var(--spacing-lg) 0;
		}
		
		.hero h1 {
			font-size: var(--font-size-xl);
			line-height: 1.3;
		}
		
		.hero p {
			font-size: var(--font-size-sm);
		}
		
		.search-input-group {
			border-radius: var(--border-radius-md);
		}
		
		.search-button {
			border-radius: 0 0 var(--border-radius-md) var(--border-radius-md);
			height: 45px;
		}
		
		.search-input {
			height: 45px;
			font-size: var(--font-size-sm);
		}
		
		.stats-grid {
			grid-template-columns: 1fr;
			gap: var(--spacing-md);
		}
		
		.stat-card {
			padding: var(--spacing-md);
		}
		
		.stat-number {
			font-size: var(--font-size-xl);
		}
		
		.categories-grid {
			grid-template-columns: 1fr;
			gap: var(--spacing-md);
		}
		
		.category-card {
			padding: var(--spacing-md);
		}
		
		.category-icon {
			width: 40px;
			height: 40px;
		}
		
		.category-card h3 {
			font-size: var(--font-size-sm);
		}
		
		.category-card p {
			font-size: var(--font-size-xs);
		}
		
		.testimonial-card {
			padding: var(--spacing-md);
		}
		
		.feature-card {
			padding: var(--spacing-md);
		}
		
		.cta-content {
			padding: 0 var(--spacing-sm);
		}
		
		.cta-group h2 {
			font-size: var(--font-size-xl);
		}
		
		.cta-group p {
			font-size: var(--font-size-sm);
		}
		
		.cta-button {
			padding: var(--spacing-sm) var(--spacing-lg);
			font-size: var(--font-size-sm);
		}
		
		.section-subtitle {
			font-size: var(--font-size-base);
			padding: 0 var(--spacing-sm);
		}
	}
	
	/* Landscape orientation for mobile */
	@media (max-width: 768px) and (orientation: landscape) {
		.hero {
			padding: var(--spacing-lg) 0;
		}
		
		.hero h1 {
			font-size: var(--font-size-2xl);
		}
		
		.stats-grid {
			grid-template-columns: repeat(4, 1fr);
			gap: var(--spacing-sm);
		}
		
		.stat-card {
			padding: var(--spacing-sm);
		}
		
		.stat-number {
			font-size: var(--font-size-lg);
		}
		
		.stat-label {
			font-size: var(--font-size-xs);
		}
	}
	
	/* High DPI displays */
	@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
		.category-icon {
			image-rendering: -webkit-optimize-contrast;
			image-rendering: crisp-edges;
		}
	}
	
	/* Reduced motion for accessibility */
	@media (prefers-reduced-motion: reduce) {
		* {
			animation-duration: 0.01ms !important;
			animation-iteration-count: 1 !important;
			transition-duration: 0.01ms !important;
		}
	}
	
	/* Dark mode support */
	:global(.dark) .home {
		background-color: var(--color-background);
	}
	
	:global(.dark) .ad-space {
		background: var(--color-background-card);
		border: 1px solid var(--color-border);
	}
	
	:global(.dark) .ad-example {
		background: var(--color-background-card);
		border: 1px solid var(--color-border);
	}
	
	:global(.dark) .hero {
		background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
		color: white;
	}

	:global(.dark) .hero h1 {
		color: white;
	}

	:global(.dark) .hero p {
		color: white;
	}
	
	:global(.dark) .search-input {
		background-color: var(--color-background-white);
		border-color: var(--color-border);
		color: var(--color-text);
	}
	
	:global(.dark) .search-input:focus {
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
	}
	
	:global(.dark) .search-button {
		background-color: var(--color-primary);
		color: var(--color-text-white);
	}
	
	:global(.dark) .search-button:hover {
		background-color: var(--color-primary-hover);
	}
	
	:global(.dark) .search-suggestions {
		background-color: var(--color-background-white);
		border: 1px solid var(--color-border);
		box-shadow: var(--shadow-lg);
	}
	
	:global(.dark) .suggestion-item {
		border-bottom: 1px solid var(--color-border);
	}
	
	:global(.dark) .suggestion-item:hover {
		background-color: var(--color-background);
	}
	
	:global(.dark) .popular-tag {
		background-color: var(--color-background-card);
		color: var(--color-text);
		border: 1px solid var(--color-border);
	}
	
	:global(.dark) .popular-tag:hover {
		background-color: var(--color-primary);
		color: var(--color-text-white);
		border-color: var(--color-primary);
	}
	
	:global(.dark) .stat-card {
		background-color: var(--color-background-card);
		border: 1px solid var(--color-border);
		box-shadow: var(--shadow-md);
	}
	
	:global(.dark) .stat-number {
		color: var(--color-primary);
	}
	
	:global(.dark) .stat-label {
		color: var(--color-text-light);
	}
	
	:global(.dark) .property-card {
		background-color: var(--color-background-card);
		border: 1px solid var(--color-border);
		box-shadow: var(--shadow-md);
	}
	
	:global(.dark) .property-card:hover {
		box-shadow: var(--shadow-lg);
		border-color: var(--color-primary);
	}
	
	:global(.dark) .category-card {
		background-color: var(--color-background-card);
		border: 1px solid var(--color-border);
		box-shadow: var(--shadow-md);
	}
	
	:global(.dark) .category-card:hover {
		box-shadow: var(--shadow-lg);
		border-color: var(--color-primary);
		transform: translateY(-2px);
	}
	
	:global(.dark) .testimonial-card {
		background-color: var(--color-background-card);
		border: 1px solid var(--color-border);
		box-shadow: var(--shadow-md);
	}
	
	:global(.dark) .testimonial-card:hover {
		box-shadow: var(--shadow-lg);
		border-color: var(--color-primary);
	}
	
	:global(.dark) .feature-card {
		background-color: var(--color-background-card);
		border: 1px solid var(--color-border);
		box-shadow: var(--shadow-md);
	}
	
	:global(.dark) .feature-card:hover {
		box-shadow: var(--shadow-lg);
		border-color: var(--color-primary);
		transform: translateY(-2px);
	}
	
		:global(.dark) .cta-section {
		background: #1e293b;
		color: var(--color-text-white);
		border-top: 1px solid var(--color-border);
	}

	:global(.dark) .cta-divider {
		background: rgba(255, 255, 255, 0.2);
	}

	:global(.dark) .cta-content h2 {
		color: var(--color-text-white);
	}

	:global(.dark) .cta-button.primary {
		background: var(--color-highlight);
		color: white;
	}

	:global(.dark) .cta-button.primary:hover {
		background: var(--color-accent);
		transform: translateY(-2px);
	}

	:global(.dark) .cta-button.secondary {
		background: transparent;
		color: white;
		border: 2px solid white;
	}

	:global(.dark) .cta-button.secondary:hover {
		background: white;
		color: var(--color-primary);
		transform: translateY(-2px);
	}
	
	:global(.dark) .section-subtitle {
		color: var(--color-text-light);
	}
	
	:global(.dark) .ad-image-placeholder {
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
	}
	
	:global(.dark) .ad-image-placeholder.google-style {
		background: linear-gradient(135deg, var(--color-info) 0%, var(--color-primary) 100%);
	}
	
	:global(.dark) .ad-image-placeholder.facebook-style {
		background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-highlight) 100%);
	}
	
	/* Nuevo diseño para placeholder de imagen */
	.ad-image-placeholder {
		width: 100%;
		height: 200px;
		margin-bottom: var(--spacing-md);
		border-radius: var(--border-radius-md);
		overflow: hidden;
		background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	.ad-image-placeholder::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
		opacity: 0.3;
	}

	.ad-image-content {
		text-align: center;
		color: white;
		z-index: 1;
		position: relative;
	}

	.ad-image-icon {
		font-size: 3rem;
		margin-bottom: var(--spacing-sm);
		filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
	}

	.ad-image-text {
		font-size: var(--font-size-lg);
		font-weight: 600;
		text-shadow: 0 2px 4px rgba(0,0,0,0.3);
	}

	/* Estilo general para section-subtitle */
	.section-subtitle {
		text-align: center;
		color: var(--color-text-light);
		font-size: var(--font-size-lg);
		margin: 0 0 var(--spacing-2xl);
		max-width: 600px;
		margin-left: auto;
		margin-right: auto;
		line-height: 1.5;
	}

	.feature-icon svg,
	.property-icon svg {
		color: var(--color-primary);
		stroke: var(--color-primary);
	}

	:global(.dark) .feature-icon svg,
	:global(.dark) .property-icon svg {
		color: #fff !important;
		stroke: #fff !important;
	}

	/* Si hay iconos de img en .category-icon, invertirlos en dark mode */
	:global(.dark) .category-icon img {
		filter: brightness(0) invert(1);
	}
</style> 