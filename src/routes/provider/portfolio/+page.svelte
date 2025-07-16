<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';

	export let data: any;
	let { session, user } = data;
	$: ({ session, user } = data);

	let providerProfile: any = null;
	let portfolio: any[] = [];
	let loading = true;
	let showAddModal = false;
	let saving = false;
	let message = '';
	let messageType = '';

	// Form data for new portfolio item
	let newItem = {
		title: '',
		description: '',
		image_url: ''
	};

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

	async function addPortfolioItem() {
		if (!newItem.title.trim()) {
			showMessage('El título es requerido', 'error');
			return;
		}

		saving = true;
		try {
			// Crear nuevo item del portafolio
			const newPortfolioItem = {
				id: Date.now().toString(), // ID temporal
				title: newItem.title.trim(),
				description: newItem.description.trim(),
				image_url: newItem.image_url.trim()
			};

			// Agregar al array local
			const updatedPortfolio = [...portfolio, newPortfolioItem];

			// Actualizar en la base de datos
			const { error } = await supabase
				.from('provider_profiles')
				.update({
					portfolio: updatedPortfolio,
					updated_at: new Date().toISOString()
				})
				.eq('id', providerProfile.id);

			if (error) throw error;

			// Actualizar estado local
			portfolio = updatedPortfolio;
			
			// Limpiar formulario y cerrar modal
			newItem = { title: '', description: '', image_url: '' };
			showAddModal = false;
			
			showMessage('Trabajo agregado exitosamente', 'success');
		} catch (error) {
			console.error('Error adding portfolio item:', error);
			showMessage('Error al agregar el trabajo', 'error');
		} finally {
			saving = false;
		}
	}

	async function deletePortfolioItem(index: number) {
		if (!confirm('¿Estás seguro de que quieres eliminar este trabajo del portafolio?')) {
			return;
		}

		try {
			// Remover del array local
			const updatedPortfolio = portfolio.filter((_, i) => i !== index);

			// Actualizar en la base de datos
			const { error } = await supabase
				.from('provider_profiles')
				.update({
					portfolio: updatedPortfolio,
					updated_at: new Date().toISOString()
				})
				.eq('id', providerProfile.id);

			if (error) throw error;

			// Actualizar estado local
			portfolio = updatedPortfolio;
			
			showMessage('Trabajo eliminado exitosamente', 'success');
		} catch (error) {
			console.error('Error deleting portfolio item:', error);
			showMessage('Error al eliminar el trabajo', 'error');
		}
	}

	function showMessage(text: string, type: 'success' | 'error') {
		message = text;
		messageType = type;
		setTimeout(() => {
			message = '';
			messageType = '';
		}, 5000);
	}

	function openAddModal() {
		showAddModal = true;
		newItem = { title: '', description: '', image_url: '' };
	}

	function closeAddModal() {
		showAddModal = false;
		newItem = { title: '', description: '', image_url: '' };
	}
</script>

<svelte:head>
	<title>Portafolio - Panel Proveedor | Domify</title>
</svelte:head>

{#if loading}
	<div class="loading-container">
		<div class="loading-spinner"></div>
		<p class="loading-text">Cargando portafolio...</p>
	</div>
{:else}
	<div class="portfolio-page">
		<header class="page-header">
			<div class="header-content">
				<div class="header-text">
					<h1>🖼️ Portafolio</h1>
					<p>Muestra ejemplos de tu trabajo a los clientes y destaca tu experiencia</p>
				</div>
				<button class="btn btn-primary" on:click={openAddModal}>
					<svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
					</svg>
					Agregar Trabajo
				</button>
			</div>
		</header>

		{#if message}
			<div class="message message-{messageType}">
				<div class="message-icon">
					{#if messageType === 'success'}✅{:else}⚠️{/if}
				</div>
				<span>{message}</span>
			</div>
		{/if}

		<div class="portfolio-content">
			{#if portfolio.length > 0}
				<div class="portfolio-stats">
					<div class="stat-item">
						<span class="stat-number">{portfolio.length}</span>
						<span class="stat-label">Trabajos</span>
					</div>
					<div class="stat-item">
						<span class="stat-number">{portfolio.filter(item => item.image_url).length}</span>
						<span class="stat-label">Con Imágenes</span>
					</div>
				</div>

				<div class="portfolio-grid">
					{#each portfolio as item, index}
						<div class="portfolio-item">
							<div class="portfolio-actions">
								<button 
									class="btn-delete" 
									on:click={() => deletePortfolioItem(index)}
									title="Eliminar trabajo"
								>
									<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
									</svg>
								</button>
							</div>
							{#if item.image_url}
								<div class="portfolio-image">
									<img src={item.image_url} alt={item.title} loading="lazy" />
									<div class="image-overlay">
										<span class="view-text">Ver trabajo</span>
									</div>
								</div>
							{:else}
								<div class="portfolio-placeholder">
									<svg class="placeholder-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
									</svg>
									<span class="placeholder-text">Sin imagen</span>
								</div>
							{/if}
							<div class="portfolio-info">
								<h3 class="portfolio-title">{item.title || 'Sin título'}</h3>
								<p class="portfolio-description">{item.description || 'Sin descripción'}</p>
								<div class="portfolio-meta">
									<span class="meta-item">
										<svg class="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
										</svg>
										Trabajo completado
									</span>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="empty-state">
					<div class="empty-icon">
						<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
						</svg>
					</div>
					<h3>No tienes trabajos en tu portafolio</h3>
					<p>Agrega ejemplos de tu trabajo para mostrar a los clientes y aumentar tus oportunidades de contratación.</p>
					<button class="btn btn-primary" on:click={openAddModal}>
						<svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
						</svg>
						Agregar Primer Trabajo
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}

<!-- Modal para agregar trabajo -->
{#if showAddModal}
	<div class="modal-overlay" on:click={closeAddModal}>
		<div class="modal-content" on:click|stopPropagation>
			<div class="modal-header">
				<div class="modal-title">
					<svg class="modal-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
					</svg>
					<h2>Agregar Trabajo al Portafolio</h2>
				</div>
				<button class="modal-close" on:click={closeAddModal}>
					<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
					</svg>
				</button>
			</div>
			
			<form class="modal-form" on:submit|preventDefault={addPortfolioItem}>
				<div class="form-group">
					<label for="title">
						<svg class="label-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
						</svg>
						Título del trabajo *
					</label>
					<input
						id="title"
						type="text"
						bind:value={newItem.title}
						placeholder="Ej: Renovación de cocina completa"
						required
					/>
				</div>

				<div class="form-group">
					<label for="description">
						<svg class="label-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
						</svg>
						Descripción
					</label>
					<textarea
						id="description"
						bind:value={newItem.description}
						placeholder="Describe el trabajo realizado, resultados y satisfacción del cliente"
						rows="4"
					></textarea>
				</div>

				<div class="form-group">
					<label for="image_url">
						<svg class="label-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
						</svg>
						URL de la imagen
					</label>
					<input
						id="image_url"
						type="url"
						bind:value={newItem.image_url}
						placeholder="https://ejemplo.com/imagen.jpg"
					/>
					<small class="form-help">Opcional: Agrega una imagen que muestre el resultado del trabajo</small>
				</div>

				<div class="modal-actions">
					<button type="button" class="btn btn-secondary" on:click={closeAddModal}>
						Cancelar
					</button>
					<button type="submit" class="btn btn-primary" disabled={saving}>
						{#if saving}
							<div class="loading-spinner-small"></div>
							<span>Guardando...</span>
						{:else}
							<svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
							</svg>
							Guardar Trabajo
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	/* Loading styles */
	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 50vh;
		gap: 1rem;
	}

	.loading-spinner {
		width: 48px;
		height: 48px;
		border: 4px solid #e5e7eb;
		border-top: 4px solid #3b82f6;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	.loading-spinner-small {
		width: 16px;
		height: 16px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top: 2px solid white;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	.loading-text {
		color: #6b7280;
		font-size: 1rem;
		font-weight: 500;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	/* Page layout */
	.portfolio-page {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	/* Header styles */
	.page-header {
		margin-bottom: 2rem;
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 2rem;
	}

	.header-text h1 {
		margin: 0 0 0.5rem 0;
		color: #1f2937;
		font-size: 2.25rem;
		font-weight: 700;
		background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.header-text p {
		margin: 0;
		color: #6b7280;
		font-size: 1.125rem;
		line-height: 1.6;
	}

	/* Message styles */
	.message {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem 1.5rem;
		border-radius: 0.75rem;
		margin-bottom: 1.5rem;
		font-weight: 500;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.message-success {
		background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
		color: #065f46;
		border: 1px solid #10b981;
	}

	.message-error {
		background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
		color: #991b1b;
		border: 1px solid #ef4444;
	}

	.message-icon {
		font-size: 1.25rem;
	}

	/* Content styles */
	.portfolio-content {
		background: white;
		border-radius: 1rem;
		padding: 2rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
		border: 1px solid #e5e7eb;
	}

	/* Stats section */
	.portfolio-stats {
		display: flex;
		gap: 2rem;
		margin-bottom: 2rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
	}

	.stat-number {
		font-size: 2rem;
		font-weight: 700;
		color: #3b82f6;
	}

	.stat-label {
		font-size: 0.875rem;
		color: #6b7280;
		font-weight: 500;
	}

	/* Grid styles */
	.portfolio-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: 1.5rem;
	}

	/* Portfolio item styles */
	.portfolio-item {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 1rem;
		overflow: hidden;
		transition: all 0.3s ease;
		position: relative;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.portfolio-item:hover {
		transform: translateY(-4px);
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
		border-color: #3b82f6;
	}

	.portfolio-actions {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		z-index: 10;
	}

	.btn-delete {
		background: rgba(239, 68, 68, 0.9);
		color: white;
		border: none;
		border-radius: 50%;
		width: 36px;
		height: 36px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
		backdrop-filter: blur(4px);
	}

	.btn-delete:hover {
		background: #ef4444;
		transform: scale(1.1);
	}

	.btn-delete svg {
		width: 18px;
		height: 18px;
	}

	/* Image styles */
	.portfolio-image {
		width: 100%;
		height: 200px;
		overflow: hidden;
		position: relative;
	}

	.portfolio-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s ease;
	}

	.portfolio-item:hover .portfolio-image img {
		transform: scale(1.05);
	}

	.image-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(59, 130, 246, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.portfolio-item:hover .image-overlay {
		opacity: 1;
	}

	.view-text {
		color: white;
		font-weight: 600;
		font-size: 0.875rem;
	}

	/* Placeholder styles */
	.portfolio-placeholder {
		width: 100%;
		height: 200px;
		background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	.placeholder-icon {
		width: 48px;
		height: 48px;
		color: #9ca3af;
	}

	.placeholder-text {
		color: #6b7280;
		font-size: 0.875rem;
		font-weight: 500;
	}

	/* Info styles */
	.portfolio-info {
		padding: 1.5rem;
	}

	.portfolio-title {
		margin: 0 0 0.75rem 0;
		color: #1f2937;
		font-size: 1.25rem;
		font-weight: 600;
		line-height: 1.4;
	}

	.portfolio-description {
		margin: 0 0 1rem 0;
		color: #6b7280;
		font-size: 0.875rem;
		line-height: 1.6;
	}

	.portfolio-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.meta-item {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		color: #10b981;
		font-size: 0.75rem;
		font-weight: 500;
	}

	.meta-icon {
		width: 14px;
		height: 14px;
	}

	/* Empty state styles */
	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
	}

	.empty-icon {
		width: 80px;
		height: 80px;
		margin: 0 auto 1.5rem;
		color: #9ca3af;
	}

	.empty-state h3 {
		margin: 0 0 0.75rem 0;
		color: #1f2937;
		font-size: 1.5rem;
		font-weight: 600;
	}

	.empty-state p {
		margin: 0 0 2rem 0;
		color: #6b7280;
		font-size: 1rem;
		line-height: 1.6;
		max-width: 500px;
		margin-left: auto;
		margin-right: auto;
	}

	/* Button styles */
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		border-radius: 0.75rem;
		font-size: 0.875rem;
		font-weight: 600;
		text-decoration: none;
		transition: all 0.2s ease;
		border: none;
		cursor: pointer;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.btn-primary {
		background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
		color: white;
		border: 1px solid #2563eb;
	}

	.btn-primary:hover:not(:disabled) {
		background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(37, 99, 235, 0.3);
	}

	.btn-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	.btn-secondary {
		background: white;
		color: #374151;
		border: 1px solid #d1d5db;
	}

	.btn-secondary:hover {
		background: #f9fafb;
		border-color: #9ca3af;
		transform: translateY(-1px);
	}

	.btn-icon {
		width: 18px;
		height: 18px;
	}

	/* Modal styles */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
		backdrop-filter: blur(4px);
	}

	.modal-content {
		background: white;
		border-radius: 1rem;
		max-width: 500px;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
		border: 1px solid #e5e7eb;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.modal-title {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.modal-icon {
		width: 24px;
		height: 24px;
		color: #3b82f6;
	}

	.modal-header h2 {
		margin: 0;
		color: #1f2937;
		font-size: 1.25rem;
		font-weight: 600;
	}

	.modal-close {
		background: none;
		border: none;
		color: #6b7280;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 0.5rem;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.modal-close:hover {
		background: #f3f4f6;
		color: #374151;
	}

	.modal-close svg {
		width: 20px;
		height: 20px;
	}

	.modal-form {
		padding: 1.5rem;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-group label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
		color: #374151;
		font-weight: 600;
		font-size: 0.875rem;
	}

	.label-icon {
		width: 16px;
		height: 16px;
		color: #6b7280;
	}

	.form-group input,
	.form-group textarea {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		transition: all 0.2s ease;
		background: white;
	}

	.form-group input:hover,
	.form-group textarea:hover {
		border-color: #9ca3af;
	}

	.form-group input:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.form-help {
		display: block;
		margin-top: 0.25rem;
		color: #6b7280;
		font-size: 0.75rem;
		line-height: 1.4;
	}

	.modal-actions {
		display: flex;
		gap: 0.75rem;
		justify-content: flex-end;
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid #e5e7eb;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.header-content {
			flex-direction: column;
			align-items: stretch;
			gap: 1rem;
		}

		.header-text h1 {
			font-size: 1.875rem;
		}

		.portfolio-content {
			padding: 1.5rem;
		}

		.portfolio-grid {
			grid-template-columns: 1fr;
		}

		.portfolio-stats {
			flex-direction: column;
			gap: 1rem;
			text-align: center;
		}

		.modal-overlay {
			padding: 0.5rem;
		}

		.modal-actions {
			flex-direction: column;
		}

		.empty-state {
			padding: 3rem 1rem;
		}
	}
</style> 