<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';

	export let data: any;
	let { session, user } = data;
	$: ({ session, user } = data);

	let providerProfile: any = null;
	let services: any[] = [];
	let categories: any[] = [];
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

			// Cargar servicios del proveedor
			const { data: svcs, error: svcsError } = await supabase
				.from('services')
				.select(`
					*,
					categories(*)
				`)
				.eq('provider_profile_id', profile.id)
				.order('created_at', { ascending: false });

			if (svcsError) throw svcsError;
			services = svcs || [];

			// Cargar categorías disponibles
			const { data: cats, error: catsError } = await supabase
				.from('categories')
				.select('*')
				.order('name');

			if (catsError) throw catsError;
			categories = cats || [];

		} catch (error) {
			console.error('Error loading data:', error);
		} finally {
			loading = false;
		}
	}

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('es-NI', {
			style: 'currency',
			currency: 'NIO'
		}).format(amount);
	}
</script>

<svelte:head>
	<title>Mis Servicios - Panel Proveedor | Domify</title>
</svelte:head>

{#if loading}
	<div class="loading-container">
		<div class="loading-spinner"></div>
		<p>Cargando servicios...</p>
	</div>
{:else}
	<div class="services-page">
		<header class="page-header">
			<h1>Mis Servicios</h1>
			<p>Gestiona los servicios que ofreces a tus clientes</p>
		</header>

		<div class="services-content">
			{#if services.length > 0}
				<div class="services-grid">
					{#each services as service}
						<div class="service-card">
							<div class="service-header">
								<h3>{service.title}</h3>
								<span class="service-category">{service.categories?.name}</span>
							</div>
							<p class="service-description">{service.description}</p>
							<div class="service-details">
								<span class="service-price">{formatCurrency(service.price)}</span>
								<span class="service-location">📍 {service.location || 'Sin ubicación'}</span>
							</div>
							<div class="service-status">
								<span class="status-badge {service.is_active ? 'active' : 'inactive'}">
									{service.is_active ? 'Activo' : 'Inactivo'}
								</span>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="empty-state">
					<div class="empty-icon">🛠️</div>
					<h3>No tienes servicios configurados</h3>
					<p>Comienza agregando los servicios que ofreces a tus clientes.</p>
					<button class="btn btn-primary">Agregar Primer Servicio</button>
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

	.services-page {
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

	.services-content {
		background: var(--color-background-white);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-2xl);
		box-shadow: var(--shadow-sm);
	}

	.services-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: var(--spacing-lg);
	}

	.service-card {
		border: 1px solid var(--color-border-light, rgba(0, 0, 0, 0.1));
		border-radius: var(--border-radius-md);
		padding: var(--spacing-lg);
		transition: all var(--transition-fast);
	}

	.service-card:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
		border-color: var(--color-primary);
	}

	.service-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: var(--spacing-md);
	}

	.service-header h3 {
		margin: 0;
		color: var(--color-text);
		font-size: var(--font-size-lg);
		font-weight: 600;
	}

	.service-category {
		background: var(--color-primary-light);
		color: var(--color-primary);
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: var(--border-radius-full);
		font-size: var(--font-size-xs);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.service-description {
		margin: 0 0 var(--spacing-md) 0;
		color: var(--color-text-light);
		font-size: var(--font-size-sm);
		line-height: 1.5;
	}

	.service-details {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-md);
	}

	.service-price {
		font-size: var(--font-size-lg);
		font-weight: 700;
		color: var(--color-primary);
	}

	.service-location {
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
	}

	.service-status {
		display: flex;
		justify-content: flex-end;
	}

	.status-badge {
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: var(--border-radius-full);
		font-size: var(--font-size-xs);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.status-badge.active {
		background: #d1fae5;
		color: #065f46;
	}

	.status-badge.inactive {
		background: #fee2e2;
		color: #991b1b;
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
		.services-content {
			padding: var(--spacing-lg);
		}

		.services-grid {
			grid-template-columns: 1fr;
		}

		.service-header {
			flex-direction: column;
			gap: var(--spacing-sm);
		}

		.service-details {
			flex-direction: column;
			gap: var(--spacing-sm);
			align-items: flex-start;
		}
	}
</style> 