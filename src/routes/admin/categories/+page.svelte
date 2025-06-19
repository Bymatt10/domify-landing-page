<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let categories: any[] = [];
	let loading = true;
	let error = '';
	let showCreateForm = false;
	let showSeedButton = true;

	// Form data
	let newCategory = {
		name: '',
		path_image: '',
		description: ''
	};

	// Computed property to check if we can create subcategories
	$: canCreateSubcategories = categories.length > 0;

	async function loadCategories() {
		try {
			loading = true;
			const response = await fetch('/api/categories');
			if (response.ok) {
				const data = await response.json();
				categories = data.data?.categories || [];
			} else {
				const errorData = await response.json();
				error = errorData.error?.message || `Error loading categories: ${response.status}`;
			}
		} catch (err) {
			error = `Error: ${err instanceof Error ? err.message : String(err)}`;
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
			error = '';
			
			// Validate form data
			if (!newCategory.name.trim()) {
				error = 'Category name is required';
				return;
			}
			
			if (!newCategory.path_image.trim()) {
				error = 'Image path is required';
				return;
			}

			const requestData = {
				...newCategory
			};

			console.log('Creating category with data:', requestData);

			const response = await fetch('/api/categories', {
				method: 'POST',
				headers: {
					'Authorization': 'Bearer demo-token-12345',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(requestData)
			});

			if (response.ok) {
				showCreateForm = false;
				newCategory = { name: '', path_image: '', description: '' };
				await loadCategories();
			} else {
				const data = await response.json();
				console.error('Category creation failed:', data);
				error = data.error?.message || 'Error creating category';
			}
		} catch (err) {
			console.error('Category creation error:', err);
			error = `Error: ${err instanceof Error ? err.message : String(err)}`;
		}
	}

	async function deleteCategory(id: number) {
		if (!confirm('Are you sure you want to delete this category?')) return;

		try {
			const response = await fetch(`/api/categories/${id}`, {
				method: 'DELETE',
				headers: {
					'Authorization': 'Bearer demo-token-12345'
				}
			});

			if (response.ok) {
				await loadCategories();
			} else {
				const data = await response.json();
				error = data.error?.message || 'Error deleting category';
			}
		} catch (err) {
			error = `Error: ${err instanceof Error ? err.message : String(err)}`;
		}
	}

	onMount(() => {
		loadCategories();
	});
</script>

<svelte:head>
	<title>Categories Management - Domify Admin</title>
</svelte:head>

<div class="admin-container">
	<div class="header">
		<h1>Categories Management</h1>
		<p>Manage service categories for the Domify marketplace</p>
	</div>

	{#if error}
		<div class="error-banner">
			<p>{error}</p>
			<button on:click={() => error = ''} class="btn-close">×</button>
		</div>
	{/if}

	<div class="actions">
		{#if showSeedButton}
			<button on:click={seedCategories} class="btn-primary">
				🌱 Seed Initial Categories
			</button>
		{/if}
		<button on:click={() => showCreateForm = !showCreateForm} class="btn-secondary">
			{showCreateForm ? 'Cancel' : '+ Add Category'}
		</button>
	</div>

	{#if categories.length === 0 && !loading}
		<div class="info-banner">
			<p>💡 <strong>Getting Started:</strong> First, seed the initial categories or create your first category.</p>
		</div>
	{/if}

	{#if showCreateForm}
		<div class="form-card">
			<h3>Create New Category</h3>
			<form on:submit|preventDefault={createCategory}>
				<div class="form-group">
					<label for="name">Name *</label>
					<input
						id="name"
						type="text"
						bind:value={newCategory.name}
						placeholder="e.g., Ensamblaje"
						required
					/>
				</div>

				<div class="form-group">
					<label for="path_image">Image Path *</label>
					<input
						id="path_image"
						type="text"
						bind:value={newCategory.path_image}
						placeholder="e.g., /img/assembly.png"
						required
					/>
				</div>

				<div class="form-group">
					<label for="description">Description</label>
					<textarea
						id="description"
						bind:value={newCategory.description}
						placeholder="Describe the category..."
						rows="3"
					></textarea>
				</div>

				<div class="form-actions">
					<button type="submit" class="btn-primary">Create Category</button>
					<button type="button" on:click={() => showCreateForm = false} class="btn-secondary">
						Cancel
					</button>
				</div>
			</form>
		</div>
	{/if}

	<div class="content">
		{#if loading}
			<div class="loading">
				<div class="spinner"></div>
				<p>Loading categories...</p>
			</div>
		{:else if categories.length === 0}
			<div class="empty-state">
				<h3>No Categories Found</h3>
				<p>Get started by seeding initial categories or creating your first category.</p>
				{#if showSeedButton}
					<button on:click={seedCategories} class="btn-primary">
						🌱 Seed Initial Categories
					</button>
				{/if}
			</div>
		{:else}
			<div class="categories-grid">
				{#each categories as category}
					<div class="category-card">
						<div class="category-header">
							<img src={category.path_image} alt={category.name} class="category-icon" />
							<div class="category-info">
								<h3>{category.name}</h3>
								{#if category.description}
									<p class="description">{category.description}</p>
								{/if}
							</div>
						</div>
						<div class="category-actions">
							<button
								on:click={() => deleteCategory(category.id)}
								class="btn-danger"
								title="Delete category"
							>
								🗑️ Delete
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.admin-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.header h1 {
		font-size: 2.5rem;
		color: #333;
		margin-bottom: 0.5rem;
	}

	.header p {
		color: #666;
		font-size: 1.1rem;
	}

	.error-banner {
		background: #fee;
		border: 1px solid #fcc;
		color: #c33;
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.info-banner {
		background: #e3f2fd;
		border: 1px solid #bbdefb;
		color: #1565c0;
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 1rem;
	}

	.info-banner p {
		margin: 0;
		line-height: 1.5;
	}

	.btn-close {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		color: #c33;
	}

	.actions {
		display: flex;
		gap: 1rem;
		margin-bottom: 2rem;
		justify-content: center;
	}

	.btn-primary {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		cursor: pointer;
		font-size: 1rem;
		transition: transform 0.2s;
	}

	.btn-primary:hover {
		transform: translateY(-2px);
	}

	.btn-secondary {
		background: #f8f9fa;
		color: #333;
		border: 1px solid #ddd;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		cursor: pointer;
		font-size: 1rem;
		transition: all 0.2s;
	}

	.btn-secondary:hover {
		background: #e9ecef;
	}

	.form-card {
		background: white;
		border: 1px solid #ddd;
		border-radius: 12px;
		padding: 2rem;
		margin-bottom: 2rem;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.form-card h3 {
		margin-bottom: 1.5rem;
		color: #333;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 600;
		color: #333;
	}

	.form-group input,
	.form-group textarea,
	.form-group select {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 6px;
		font-size: 1rem;
		transition: border-color 0.2s;
	}

	.form-group input:focus,
	.form-group textarea:focus,
	.form-group select:focus {
		outline: none;
		border-color: #667eea;
	}

	.form-group input:disabled,
	.form-group textarea:disabled,
	.form-group select:disabled {
		background-color: #f5f5f5;
		color: #999;
		cursor: not-allowed;
	}

	.form-help {
		display: block;
		margin-top: 0.25rem;
		font-size: 0.875rem;
		color: #666;
	}

	.form-actions {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
	}

	.loading {
		text-align: center;
		padding: 3rem;
	}

	.spinner {
		border: 4px solid #f3f3f3;
		border-top: 4px solid #667eea;
		border-radius: 50%;
		width: 40px;
		height: 40px;
		animation: spin 1s linear infinite;
		margin: 0 auto 1rem;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.empty-state {
		text-align: center;
		padding: 3rem;
		color: #666;
	}

	.empty-state h3 {
		margin-bottom: 1rem;
		color: #333;
	}

	.categories-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	.category-card {
		background: white;
		border: 1px solid #ddd;
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.category-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
	}

	.category-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.category-icon {
		width: 48px;
		height: 48px;
		object-fit: contain;
		border-radius: 8px;
		background: #f8f9fa;
		padding: 0.5rem;
	}

	.category-info h3 {
		margin: 0 0 0.5rem 0;
		color: #333;
		font-size: 1.2rem;
	}

	.description {
		margin: 0;
		color: #666;
		font-size: 0.9rem;
		line-height: 1.4;
	}

	.category-actions {
		display: flex;
		justify-content: flex-end;
	}

	.btn-danger {
		background: #dc3545;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.9rem;
		transition: background-color 0.2s;
	}

	.btn-danger:hover {
		background: #c82333;
	}

	@media (max-width: 768px) {
		.admin-container {
			padding: 1rem;
		}

		.header h1 {
			font-size: 2rem;
		}

		.actions {
			flex-direction: column;
		}

		.categories-grid {
			grid-template-columns: 1fr;
		}

		.form-actions {
			flex-direction: column;
		}
	}
</style> 