<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';

	export let data: any;
	let { session, user } = data;
	$: ({ session, user } = data);

	let providerProfile: any = null;
	let documents: any[] = [];
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

			// Cargar documentos del proveedor
			documents = profile.documents || [];

		} catch (error) {
			console.error('Error loading data:', error);
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Documentos - Panel Proveedor | Domify</title>
</svelte:head>

{#if loading}
	<div class="loading-container">
		<div class="loading-spinner"></div>
		<p>Cargando documentos...</p>
	</div>
{:else}
	<div class="documents-page">
		<header class="page-header">
			<h1>Documentos</h1>
			<p>Gestiona tus certificaciones, licencias y documentos importantes</p>
		</header>

		<div class="documents-content">
			{#if documents.length > 0}
				<div class="documents-list">
					{#each documents as doc, index}
						<div class="document-card">
							<div class="document-icon">📋</div>
							<div class="document-info">
								<h3>{doc.name || 'Documento sin nombre'}</h3>
								<p class="document-type">{doc.type || 'Sin tipo especificado'}</p>
								{#if doc.url}
									<a href={doc.url} target="_blank" class="document-link">
										Ver documento →
									</a>
								{:else}
									<span class="no-url">Sin enlace</span>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="empty-state">
					<div class="empty-icon">📋</div>
					<h3>No tienes documentos agregados</h3>
					<p>Agrega certificaciones, licencias y otros documentos importantes.</p>
					<a href="/provider/profile" class="btn btn-primary">Agregar Documentos</a>
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

	.documents-page {
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

	.documents-content {
		background: var(--color-background-white);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-2xl);
		box-shadow: var(--shadow-sm);
	}

	.documents-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.document-card {
		display: flex;
		align-items: center;
		gap: var(--spacing-lg);
		padding: var(--spacing-lg);
		border: 1px solid var(--color-border-light, rgba(0, 0, 0, 0.1));
		border-radius: var(--border-radius-md);
		transition: all var(--transition-fast);
	}

	.document-card:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
		border-color: var(--color-primary);
	}

	.document-icon {
		font-size: var(--font-size-3xl);
		width: 60px;
		height: 60px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-primary-light);
		border-radius: var(--border-radius-lg);
		flex-shrink: 0;
	}

	.document-info {
		flex: 1;
	}

	.document-info h3 {
		margin: 0 0 var(--spacing-xs) 0;
		color: var(--color-text);
		font-size: var(--font-size-lg);
		font-weight: 600;
	}

	.document-type {
		margin: 0 0 var(--spacing-sm) 0;
		color: var(--color-text-light);
		font-size: var(--font-size-sm);
	}

	.document-link {
		color: var(--color-primary);
		text-decoration: none;
		font-size: var(--font-size-sm);
		font-weight: 500;
		transition: color var(--transition-fast);
	}

	.document-link:hover {
		color: var(--color-primary-hover);
		text-decoration: underline;
	}

	.no-url {
		color: var(--color-text-light);
		font-size: var(--font-size-sm);
		font-style: italic;
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
		.documents-content {
			padding: var(--spacing-lg);
		}

		.document-card {
			flex-direction: column;
			text-align: center;
			gap: var(--spacing-md);
		}
	}
</style> 