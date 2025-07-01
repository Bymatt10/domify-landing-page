<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';

	export let data: any;
	let { session, user } = data;
	$: ({ session, user } = data);

	let providerProfile: any = null;
	let portfolio: any[] = [];
	let loading = true;

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		try {
			// Cargar perfil del proveedor
			const { data: profile, error: profileError } = await supabase
				.from('provider_profiles')
				.select('*')
				.eq('user_id', user.id)
				.single();

			if (profileError) throw profileError;
			providerProfile = profile;

			// Cargar portafolio del proveedor
			portfolio = profile.portfolio || [];

		} catch (error) {
			console.error('Error loading data:', error);
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Portafolio - Panel Proveedor | Domify</title>
</svelte:head>

{#if loading}
	<div class="loading-container">
		<div class="loading-spinner"></div>
		<p>Cargando portafolio...</p>
	</div>
{:else}
	<div class="portfolio-page">
		<header class="page-header">
			<h1>Portafolio</h1>
			<p>Muestra ejemplos de tu trabajo a los clientes</p>
		</header>

		<div class="portfolio-content">
			{#if portfolio.length > 0}
				<div class="portfolio-grid">
					{#each portfolio as item, index}
						<div class="portfolio-item">
							{#if item.image_url}
								<div class="portfolio-image">
									<img src={item.image_url} alt={item.title} />
								</div>
							{:else}
								<div class="portfolio-placeholder">
									<span>🖼️</span>
								</div>
							{/if}
							<div class="portfolio-info">
								<h3>{item.title || 'Sin título'}</h3>
								<p>{item.description || 'Sin descripción'}</p>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="empty-state">
					<div class="empty-icon">🖼️</div>
					<h3>No tienes trabajos en tu portafolio</h3>
					<p>Agrega ejemplos de tu trabajo para mostrar a los clientes.</p>
					<a href="/provider/profile" class="btn btn-primary">Editar Portafolio</a>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 50vh;
		gap: var(--spacing-md);
	}

	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 4px solid var(--color-primary-light);
		border-top: 4px solid var(--color-primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.portfolio-page {
		max-width: 1200px;
		margin: 0 auto;
	}

	.page-header {
		margin-bottom: var(--spacing-2xl);
	}

	.page-header h1 {
		margin: 0 0 var(--spacing-sm) 0;
		color: var(--color-text);
		font-size: var(--font-size-3xl);
		font-weight: 700;
	}

	.page-header p {
		margin: 0;
		color: var(--color-text-light);
		font-size: var(--font-size-lg);
	}

	.portfolio-content {
		background: var(--color-background-white);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-2xl);
		box-shadow: var(--shadow-sm);
	}

	.portfolio-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: var(--spacing-lg);
	}

	.portfolio-item {
		border: 1px solid var(--color-border-light, rgba(0, 0, 0, 0.1));
		border-radius: var(--border-radius-md);
		overflow: hidden;
		transition: all var(--transition-fast);
	}

	.portfolio-item:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
		border-color: var(--color-primary);
	}

	.portfolio-image {
		width: 100%;
		height: 200px;
		overflow: hidden;
	}

	.portfolio-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.portfolio-placeholder {
		width: 100%;
		height: 200px;
		background: var(--color-background);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--font-size-4xl);
		color: var(--color-text-light);
	}

	.portfolio-info {
		padding: var(--spacing-lg);
	}

	.portfolio-info h3 {
		margin: 0 0 var(--spacing-sm) 0;
		color: var(--color-text);
		font-size: var(--font-size-lg);
		font-weight: 600;
	}

	.portfolio-info p {
		margin: 0;
		color: var(--color-text-light);
		font-size: var(--font-size-sm);
		line-height: 1.5;
	}

	.empty-state {
		text-align: center;
		padding: var(--spacing-3xl) var(--spacing-lg);
	}

	.empty-icon {
		font-size: var(--font-size-4xl);
		margin-bottom: var(--spacing-md);
	}

	.empty-state h3 {
		margin: 0 0 var(--spacing-sm) 0;
		color: var(--color-text);
		font-size: var(--font-size-xl);
		font-weight: 600;
	}

	.empty-state p {
		margin: 0 0 var(--spacing-lg) 0;
		color: var(--color-text-light);
		font-size: var(--font-size-base);
	}

	.btn {
		padding: var(--spacing-sm) var(--spacing-lg);
		border-radius: var(--border-radius-md);
		font-size: var(--font-size-base);
		font-weight: 600;
		text-decoration: none;
		transition: all var(--transition-fast);
		border: none;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.btn-primary {
		background: var(--color-primary);
		color: white;
	}

	.btn-primary:hover {
		background: var(--color-primary-hover);
		transform: translateY(-1px);
	}

	/* Responsive */
	@media (max-width: 768px) {
		.portfolio-content {
			padding: var(--spacing-lg);
		}

		.portfolio-grid {
			grid-template-columns: 1fr;
		}
	}
</style> 