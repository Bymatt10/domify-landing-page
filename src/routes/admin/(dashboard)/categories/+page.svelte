<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	interface Category {
		id: string;
		name: string;
		description: string;
		icon: string;
		created_at: string;
	}

	let categories: Category[] = [];
	let loading = true;
	let error = '';
	let showCreateForm = false;
	let showSeedButton = true;
	

	// Form data
	let newCategory = {
		name: '',
		description: '',
		icon: '🏷️'
	};

	// Computed property to check if we can create subcategories
	$: canCreateSubcategories = categories.length > 0;

	async function loadCategories() {
		try {
			loading = true;
			const response = await fetch('/api/categories');
			if (response.ok) {
				const result = await response.json();
				categories = result.data.categories;
			} else {
				error = 'Error al cargar las categorías';
			}
		} catch (err) {
			error = 'Error de conexión';
			console.error('Error loading categories:', err);
		} finally {
			loading = false;
		}
	}

	async function seedCategories() {
		try {
			error = '';
			const response = await fetch('/api/categories/seed', {
				method: 'POST',
				headers: {
					'Authorization': 'Bearer demo-token-12345',
					'Content-Type': 'application/json'
				}
			});

			if (response.ok) {
				showSeedButton = false;
				await loadCategories();
			} else {
				const data = await response.json();
				error = data.error?.message || 'Error seeding categories';
			}
		} catch (err) {
			error = `Error: ${err instanceof Error ? err.message : String(err)}`;
		}
	}

	async function createCategory() {
		try {
			const response = await fetch('/api/categories', {
				method: 'POST',
				headers: {
					'Authorization': 'Bearer demo-token-12345',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(newCategory)
			});

			if (response.ok) {
				showCreateForm = false;
				newCategory = { name: '', description: '', icon: '🏷️' };
				await loadCategories();
			} else {
				const errorData = await response.json();
				error = errorData.message || 'Error al crear la categoría';
			}
		} catch (err) {
			error = 'Error de conexión al crear la categoría';
		}
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('es-ES', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	onMount(async () => {
		await loadCategories();
	});
</script>

<svelte:head>
	<title>Categories Management - Domify Admin</title>
</svelte:head>

<div class="admin-categories">
	<!-- Header -->
	<header class="page-header">
		<div class="header-content">
			<h1>Gestionar Categorías</h1>
			<p>Administra las categorías de servicios disponibles</p>
		</div>
		<button class="btn btn-primary" on:click={() => showCreateForm = !showCreateForm}>
			{showCreateForm ? 'Cancelar' : 'Crear Categoría'}
		</button>
	</header>

	<!-- Formulario de Creación -->
	{#if showCreateForm}
		<div class="form-container">
			<form on:submit|preventDefault={createCategory} class="create-form">
				<div class="form-header">
					<h3>Nueva Categoría</h3>
					<p>Completa los datos para agregar una nueva categoría.</p>
				</div>
				
				<div class="form-group">
					<label for="name">Nombre</label>
					<input id="name" type="text" bind:value={newCategory.name} required placeholder="Ej: Limpieza del Hogar" />
				</div>
				
				<div class="form-group">
					<label for="description">Descripción</label>
					<textarea id="description" bind:value={newCategory.description} rows="3" placeholder="Describe brevemente la categoría..."></textarea>
				</div>

				<div class="form-group">
					<label for="icon">Icono (Emoji)</label>
					<input id="icon" type="text" bind:value={newCategory.icon} required placeholder="Ej: 🧹" />
				</div>

				<div class="form-actions">
					<button type="submit" class="btn btn-primary">Guardar Categoría</button>
					<button type="button" class="btn btn-secondary" on:click={() => showCreateForm = false}>Cancelar</button>
				</div>
			</form>
		</div>
	{/if}

	<!-- Error Message -->
	{#if error}
		<div class="error-message">
			<p>{error}</p>
			<button class="btn btn-secondary" on:click={() => { error = ''; loadCategories(); }}>
				Reintentar
			</button>
		</div>
	{/if}

	<!-- Loading State -->
	{#if loading}
		<div class="loading-state">
			<div class="spinner"></div>
			<p>Cargando categorías...</p>
		</div>
	{:else if categories.length === 0}
		<div class="empty-state">
			<svg class="empty-icon" viewBox="0 0 24 24">
				<path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
			</svg>
			<h3>No hay categorías</h3>
			<p>No se encontraron categorías de servicios.</p>
		</div>
	{:else}
		<!-- Categories Grid -->
		<div class="categories-grid">
			{#each categories as category}
				<div class="category-card">
					<div class="category-header">
						<div class="category-icon">
							{#if category.icon && (category.icon.startsWith('/') || category.icon.startsWith('http'))}
								<img src="{category.icon}" alt="{category.name} icon" class="icon-image" />
							{:else}
								{category.icon || '🏷️'}
							{/if}
						</div>
						<div class="category-info">
							<h3>{category.name}</h3>
							<p class="category-description">{category.description}</p>
						</div>
					</div>
					
					<div class="category-meta">
						<span class="created-date">
							Creado: {formatDate(category.created_at)}
						</span>
					</div>

					<div class="category-actions">
						<button class="btn btn-secondary">
							Editar
						</button>
						<button class="btn btn-danger">
							Eliminar
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.admin-categories {
		/* Eliminado max-width para que ocupe todo el ancho */
	}

	.page-header {
		margin-bottom: 2rem;
	}

	.page-header h1 {
		font-size: 2.5rem;
		font-weight: 700;
		color: #0C3B2E;
		margin: 0 0 0.5rem 0;
	}

	.page-header p {
		font-size: 1.1rem;
		color: #6D9773;
		margin: 0;
	}

	.error-message {
		background: #FEF2F2;
		border: 1px solid #FECACA;
		color: #DC2626;
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 2rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem 2rem;
		text-align: center;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 4px solid #E2E8F0;
		border-top: 4px solid #6D9773;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 1rem;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
	}

	.empty-icon {
		width: 64px;
		height: 64px;
		color: #6D9773;
		margin-bottom: 1rem;
	}

	.empty-state h3 {
		font-size: 1.5rem;
		color: #0C3B2E;
		margin: 0 0 0.5rem 0;
	}

	.empty-state p {
		color: #6D9773;
		margin: 0;
	}

	.categories-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		gap: 1.5rem;
	}

	.category-card {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 1px 3px rgba(12, 59, 46, 0.1);
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.category-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(12, 59, 46, 0.15);
	}

	.category-header {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.category-icon {
		font-size: 2rem;
		width: 60px;
		height: 60px;
		background: #F0F9F4;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.icon-image {
		width: 40px;
		height: 40px;
		object-fit: contain;
	}

	.category-info {
		flex: 1;
	}

	.category-info h3 {
		font-size: 1.25rem;
		font-weight: 600;
		color: #0C3B2E;
		margin: 0 0 0.5rem 0;
	}

	.category-description {
		font-size: 0.875rem;
		color: #6D9773;
		margin: 0;
		line-height: 1.5;
	}

	.category-meta {
		margin-bottom: 1rem;
	}

	.created-date {
		font-size: 0.75rem;
		color: #6D9773;
	}

	.category-actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-secondary {
		background: #F0F9F4;
		color: #0C3B2E;
	}

	.btn-secondary:hover {
		background: #E2F3E8;
	}

	.btn-danger {
		background: #FEF2F2;
		color: #DC2626;
	}

	.btn-danger:hover {
		background: #FECACA;
	}

	@media (max-width: 768px) {
		.categories-grid {
			grid-template-columns: 1fr;
		}

		.page-header h1 {
			font-size: 2rem;
		}

		.category-card {
			padding: 1rem;
		}
	}

	.form-container {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		margin-bottom: 2rem;
		box-shadow: 0 4px 12px rgba(12, 59, 46, 0.05);
	}

	.form-header {
		margin-bottom: 1.5rem;
	}

	.form-header h3 {
		font-size: 1.5rem;
		color: #0C3B2E;
		margin: 0 0 0.5rem 0;
	}

	.form-header p {
		color: #6D9773;
		margin: 0;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-group label {
		display: block;
		font-weight: 500;
		margin-bottom: 0.5rem;
		color: #0C3B2E;
	}

	.form-group input,
	.form-group textarea {
		width: 100%;
		padding: 0.75rem 1rem;
		border-radius: 8px;
		border: 1px solid #B8D4BA;
		font-size: 1rem;
		transition: all 0.2s;
	}

	.form-group input:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: #6D9773;
		box-shadow: 0 0 0 3px rgba(109, 151, 115, 0.2);
	}

	.form-actions {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
		margin-top: 1.5rem;
	}
</style> 