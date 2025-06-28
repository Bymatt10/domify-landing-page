<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	type Category = {
		id: number;
		name: string;
		description: string;
		icon: string;
		slug: string;
	};

	let categories: Category[] = [];
	let loading = true;
	let error: string | null = null;

	onMount(async () => {
		try {
			const res = await fetch('/api/categories');
			if (!res.ok) {
				throw new Error('No se pudieron cargar las categorías de servicios.');
			}
			const responseData = await res.json();
			categories = responseData.data.categories;
		} catch (e: any) {
			error = e.message;
			console.error('Error fetching categories:', e);
		} finally {
			loading = false;
		}
	});

	function handleCategoryClick(slug: string) {
		goto(`/services/${slug}`);
	}
</script>

<div class="services-page">
	<section class="hero">
		<div class="container">
			<h1>Explora Nuestros Servicios</h1>
			<p>
				Encuentra la solución perfecta para tu hogar o negocio. Profesionales verificados y de
				confianza a tu alcance.
			</p>
		</div>
	</section>

	<div class="container page-content">
		{#if loading}
			<div class="loading-state">
				<div class="spinner"></div>
				<p>Cargando servicios...</p>
			</div>
		{:else if error}
			<div class="error-state">
				<h2>Ha ocurrido un error</h2>
				<p>{error}</p>
			</div>
		{:else if categories.length === 0}
			<div class="empty-state">
				<h2>No hay servicios disponibles</h2>
				<p>Actualmente no tenemos servicios para mostrar. Vuelve a intentarlo más tarde.</p>
			</div>
		{:else}
			<div class="services-grid">
				{#each categories as category (category.id)}
					<button class="service-card" on:click={() => handleCategoryClick(category.slug)}>
						<div class="card-content">
							<div class="service-icon">
								{category.icon}
							</div>
							<div class="service-info">
								<h2>{category.name}</h2>
								<p>{category.description}</p>
							</div>
						</div>
						<div class="card-footer">
							<span>Ver profesionales</span>
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
								class="arrow-icon"
								><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg
							>
						</div>
					</button>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.services-page {
		background-color: var(--color-background-light, #f8f9fa);
		min-height: 100vh;
	}

	.hero {
		background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
		color: var(--color-text-white);
		padding: 4rem 1.5rem;
		text-align: center;
	}

	.hero h1 {
		font-size: var(--font-size-4xl);
		margin-bottom: 1rem;
		font-weight: 700;
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
		color: #fff !important;
	}

	.hero p {
		font-size: var(--font-size-xl);
		max-width: 700px;
		margin: 0 auto;
		opacity: 0.95;
		color: #fff !important;
	}

	.page-content {
		padding-top: 3rem;
		padding-bottom: 3rem;
	}

	.services-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 2rem;
	}

	.service-card {
		background-color: var(--color-background-white, #fff);
		border-radius: var(--border-radius-lg, 12px);
		box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
		overflow: hidden;
		transition: all 0.3s ease;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		text-align: left;
		padding: 1.5rem;
	}

	.service-card:hover {
		transform: translateY(-5px);
		box-shadow: var(--shadow-lg, 0 10px 15px rgba(0, 0, 0, 0.1));
	}

	.card-content {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.service-icon {
		width: 60px;
		height: 60px;
		background-color: var(--color-primary-light, #e0f0e3);
		border-radius: var(--border-radius-md, 8px);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2.5rem;
		color: var(--color-primary);
	}

	.service-info h2 {
		font-size: var(--font-size-xl);
		color: var(--color-text-dark, #333);
		margin: 0 0 0.5rem;
	}

	.service-info p {
		color: var(--color-text-light, #666);
		line-height: 1.6;
		margin: 0;
	}

	.card-footer {
		margin-top: 1.5rem;
		padding-top: 1rem;
		border-top: 1px solid #eee;
		display: flex;
		align-items: center;
		justify-content: space-between;
		color: var(--color-primary);
		font-weight: 600;
		transition: color 0.3s ease;
	}

	.service-card:hover .card-footer {
		color: var(--color-primary-hover);
	}

	.arrow-icon {
		transition: transform 0.3s ease;
	}

	.service-card:hover .arrow-icon {
		transform: translateX(5px);
	}

	.loading-state,
	.error-state,
	.empty-state {
		text-align: center;
		padding: 4rem 1rem;
		min-height: 50vh;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.spinner {
		width: 50px;
		height: 50px;
		border: 5px solid var(--color-primary-light, #e0f0e3);
		border-top-color: var(--color-primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 1rem;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* Dark mode styles */
	:global(.dark) .services-page {
		background-color: #0f172a;
	}

	:global(.dark) .hero {
		background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
	}

	:global(.dark) .hero h1 {
		color: white;
	}

	:global(.dark) .hero p {
		color: white;
	}

	:global(.dark) .service-card {
		background-color: #334155;
		border: 1px solid #475569;
		color: white;
	}

	:global(.dark) .service-card:hover {
		box-shadow: 0 10px 15px rgba(0, 0, 0, 0.3);
	}

	:global(.dark) .service-icon {
		background-color: #475569;
		color: #10b981;
	}

	:global(.dark) .service-info h2 {
		color: white;
	}

	:global(.dark) .service-info p {
		color: #cbd5e1;
	}

	:global(.dark) .card-footer {
		border-top-color: #475569;
		color: #10b981;
	}

	:global(.dark) .service-card:hover .card-footer {
		color: #059669;
	}

	:global(.dark) .loading-state,
	:global(.dark) .error-state,
	:global(.dark) .empty-state {
		color: white;
	}

	:global(.dark) .spinner {
		border-color: #475569;
		border-top-color: #10b981;
	}
</style> 