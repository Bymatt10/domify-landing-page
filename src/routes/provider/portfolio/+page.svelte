<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';

	export let data: any;
	let { session, user } = data;
	$: ({ session, user } = data);

	let providerProfile: any = null;
	let portfolio: any[] = [];
	let services: any[] = [];
	let categories: any[] = [];
	let loading = true;
	let showAddModal = false;
	let saving = false;
	let message = '';
	let messageType = '';

	// Form data for new portfolio item
	let newItem = {
		title: '',
		description: '',
		image_url: '',
		media_type: 'image', // 'image' or 'video'
		service_id: '', // ID del servicio asociado
		category_id: '' // ID de la categoría asociada
	};

	// File upload state
	let selectedFile: File | null = null;
	let uploadProgress = 0;
	let isUploading = false;
	let uploadError = '';

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

			// Cargar servicios del proveedor (sin duplicados)
			const { data: svcs, error: svcsError } = await supabase
				.from('services')
				.select(`
					id,
					title,
					description,
					price,
					category_id,
					categories(id, name, slug)
				`)
				.eq('provider_profile_id', profile.id)
				.order('title');

			if (svcsError) throw svcsError;
			
			// Eliminar duplicados por ID
			const uniqueServices = svcs ? svcs.filter((service, index, self) => 
				index === self.findIndex(s => s.id === service.id)
			) : [];
			
			services = uniqueServices;

			// Cargar categorías disponibles
			const { data: cats, error: catsError } = await supabase
				.from('categories')
				.select('*')
				.order('name');

			if (catsError) throw catsError;
			
			// Eliminar duplicados por ID
			const uniqueCategories = cats ? cats.filter((category, index, self) => 
				index === self.findIndex(c => c.id === category.id)
			) : [];
			
			categories = uniqueCategories;

		} catch (error) {
			console.error('Error loading data:', error);
		} finally {
			loading = false;
		}
	}

	async function uploadFile(file: File): Promise<string> {
		const fileExt = file.name.split('.').pop();
		const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
		const filePath = `providers/${user.id}/portfolio/${fileName}`;

		const { data, error } = await supabase.storage
			.from('domify')
			.upload(filePath, file, {
				cacheControl: '3600',
				upsert: false
			});

		if (error) {
			throw new Error(`Error uploading file: ${error.message}`);
		}

		// Get public URL
		const { data: urlData } = supabase.storage
			.from('domify')
			.getPublicUrl(filePath);

		return urlData.publicUrl;
	}

	async function addPortfolioItem() {
		if (!newItem.title.trim()) {
			showMessage('El título es requerido', 'error');
			return;
		}

		saving = true;
		isUploading = false;
		uploadProgress = 0;
		uploadError = '';

		try {
			let mediaUrl = '';

			// Upload file if selected
			if (selectedFile) {
				isUploading = true;
				uploadProgress = 10;
				
				try {
					mediaUrl = await uploadFile(selectedFile);
					uploadProgress = 100;
				} catch (uploadError: any) {
					console.error('Upload error:', uploadError);
					const uploadErrorMessage = uploadError.message || uploadError.details || 'Error desconocido';
					showMessage(`Error al subir el archivo: ${uploadErrorMessage}`, 'error');
					return;
				} finally {
					isUploading = false;
				}
			} else {
				showMessage('Debes seleccionar un archivo para subir', 'error');
				return;
			}

			let updatedPortfolio;

			if (editingItemId) {
				// Editing existing item
				updatedPortfolio = portfolio.map(item => 
					item.id === editingItemId 
						? {
							...item,
							title: newItem.title.trim(),
							description: newItem.description.trim(),
							image_url: mediaUrl,
							media_type: newItem.media_type,
							service_id: newItem.service_id,
							category_id: newItem.category_id,
							updated_at: new Date().toISOString()
						}
						: item
				);
			} else {
				// Creating new item
				const newPortfolioItem = {
					id: Date.now().toString(),
					title: newItem.title.trim(),
					description: newItem.description.trim(),
					image_url: mediaUrl,
					media_type: newItem.media_type,
					service_id: newItem.service_id,
					category_id: newItem.category_id,
					created_at: new Date().toISOString()
				};
				updatedPortfolio = [...portfolio, newPortfolioItem];
			}

			// Update in database
			const { error } = await supabase
				.from('provider_profiles')
				.update({
					portfolio: updatedPortfolio,
					updated_at: new Date().toISOString()
				})
				.eq('id', providerProfile.id);

			if (error) throw error;

			// Update local state
			portfolio = updatedPortfolio;
			
			// Clear form and close modal
			resetForm();
			showAddModal = false;
			editingItemId = null;
			
			showMessage(editingItemId ? 'Trabajo actualizado exitosamente' : 'Trabajo agregado exitosamente', 'success');
		} catch (error: any) {
			console.error('Error saving portfolio item:', error);
			const errorMessage = error.message || error.details || 'Error desconocido';
			showMessage(`Error al guardar el trabajo: ${errorMessage}`, 'error');
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

	function resetForm() {
		newItem = { 
			title: '', 
			description: '', 
			image_url: '', // Mantener para compatibilidad pero no se usa
			media_type: 'image',
			service_id: '',
			category_id: ''
		};
		selectedFile = null;
		uploadProgress = 0;
		isUploading = false;
		uploadError = '';
		editingItemId = null;
	}

	function openAddModal() {
		showAddModal = true;
		resetForm();
	}

	function closeAddModal() {
		showAddModal = false;
		resetForm();
	}

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			const file = target.files[0];
			const maxSize = 50 * 1024 * 1024; // 50MB
			
			if (file.size > maxSize) {
				uploadError = 'El archivo es demasiado grande. Máximo 50MB.';
				return;
			}

			// Validate file type
			const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
			const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
			const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes];

			if (!allowedTypes.includes(file.type)) {
				uploadError = 'Tipo de archivo no soportado. Usa imágenes (JPG, PNG, WebP) o videos (MP4, WebM, OGG).';
				return;
			}

			selectedFile = file;
			uploadError = '';
			
			// Auto-detect media type
			if (allowedImageTypes.includes(file.type)) {
				newItem.media_type = 'image';
			} else {
				newItem.media_type = 'video';
			}
		}
	}

	function removeSelectedFile() {
		selectedFile = null;
		uploadError = '';
	}

	// Función para agrupar trabajos por servicio
	function getPortfolioByService() {
		const grouped: Record<string, any> = {};
		
		portfolio.forEach(item => {
			const serviceId = item.service_id || 'sin-servicio';
			const serviceName = services.find(s => s.id === item.service_id)?.title || 'Sin servicio asignado';
			
			if (!grouped[serviceId]) {
				grouped[serviceId] = {
					serviceName,
					serviceId,
					items: []
				};
			}
			grouped[serviceId].items.push(item);
		});
		
		return Object.values(grouped);
	}

	// Función para editar un trabajo existente
	function editPortfolioItem(item: any) {
		newItem = {
			title: item.title || '',
			description: item.description || '',
			image_url: '', // No se usa en el formulario
			media_type: item.media_type || 'image',
			service_id: item.service_id || '',
			category_id: item.category_id || ''
		};
		selectedFile = null;
		showAddModal = true;
		// Marcar que estamos editando
		editingItemId = item.id;
	}

	// Variable para controlar si estamos editando
	let editingItemId: string | null = null;
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
					<div class="stat-item">
						<span class="stat-number">{getPortfolioByService().length}</span>
						<span class="stat-label">Servicios</span>
					</div>
				</div>

				{#each getPortfolioByService() as serviceGroup}
					<div class="service-portfolio-section">
						<div class="service-header">
							<h3 class="service-title">📋 {serviceGroup.serviceName}</h3>
							<span class="service-count">{serviceGroup.items.length} trabajo{serviceGroup.items.length !== 1 ? 's' : ''}</span>
				</div>

				<div class="portfolio-grid">
					{#each serviceGroup.items as item, index}
						<div class="portfolio-item">
							<div class="portfolio-actions">
								<button 
									class="btn-edit" 
									on:click={() => editPortfolioItem(item)}
									title="Editar trabajo"
								>
									<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
									</svg>
								</button>
								<button 
									class="btn-delete" 
									on:click={() => deletePortfolioItem(portfolio.indexOf(item))}
									title="Eliminar trabajo"
								>
									<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
									</svg>
								</button>
							</div>
							{#if item.image_url}
										<div class="portfolio-media">
											{#if item.media_type === 'video'}
												<video src={item.image_url} controls preload="metadata" class="portfolio-video">
													<track kind="captions" />
												</video>
											{:else}
												<img src={item.image_url} alt={item.title} loading="lazy" class="portfolio-image" />
											{/if}
											<div class="media-overlay">
												<span class="view-text">
													{#if item.media_type === 'video'}
														Reproducir video
													{:else}
														Ver trabajo
													{/if}
												</span>
									</div>
								</div>
							{:else}
								<div class="portfolio-placeholder">
									<svg class="placeholder-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
									</svg>
											<span class="placeholder-text">Sin medio</span>
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
					</div>
				{/each}
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
						{#if editingItemId}
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
						{:else}
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
						{/if}
					</svg>
					<h2>{editingItemId ? 'Editar Trabajo' : 'Agregar Trabajo al Portafolio'}</h2>
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
					<label for="service_id">
						<svg class="label-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
						</svg>
						Servicio asociado
					</label>
					<select id="service_id" bind:value={newItem.service_id}>
						<option value="">Selecciona un servicio</option>
						{#each services as service}
							<option value={service.id}>
								{service.title} - {service.categories?.name || 'Sin categoría'}
							</option>
						{/each}
					</select>
					<small class="form-help">Selecciona el servicio al que pertenece este trabajo</small>
				</div>

				<div class="form-group">
					<label for="category_id">
						<svg class="label-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
						</svg>
						Categoría
					</label>
					<select id="category_id" bind:value={newItem.category_id}>
						<option value="">Selecciona una categoría</option>
						{#each categories as category}
							<option value={category.id}>
								{category.icon} {category.name}
							</option>
						{/each}
					</select>
					<small class="form-help">Selecciona la categoría principal del trabajo</small>
				</div>

				<div class="form-group">
					<label for="media_type">
						<svg class="label-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
						</svg>
						Tipo de medio
					</label>
					<select id="media_type" bind:value={newItem.media_type}>
						<option value="image">Imagen</option>
						<option value="video">Video</option>
					</select>
				</div>

				<div class="form-group">
					<label for="file_upload">
						<svg class="label-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
						</svg>
						Subir archivo *
					</label>
					
					{#if selectedFile}
						<div class="file-preview">
							<div class="file-info">
								<svg class="file-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									{#if newItem.media_type === 'image'}
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
									{:else}
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
									{/if}
						</svg>
								<div class="file-details">
									<span class="file-name">{selectedFile.name}</span>
									<span class="file-size">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
								</div>
								<button type="button" class="btn-remove-file" on:click={removeSelectedFile}>
									<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
									</svg>
								</button>
							</div>
						</div>
					{:else}
						<div class="file-upload-area" on:click={() => document.getElementById('file_input')?.click()}>
							<svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
							</svg>
							<p class="upload-text">Haz clic para seleccionar un archivo</p>
							<p class="upload-hint">Imágenes: JPG, PNG, WebP | Videos: MP4, WebM, OGG | Máximo 50MB</p>
						</div>
					{/if}

					<input
						id="file_input"
						type="file"
						accept="image/*,video/*"
						on:change={handleFileSelect}
						style="display: none;"
					/>

					{#if uploadError}
						<div class="upload-error">
							<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
							</svg>
							<span>{uploadError}</span>
						</div>
					{/if}

					{#if isUploading}
						<div class="upload-progress">
							<div class="progress-bar">
								<div class="progress-fill" style="width: {uploadProgress}%"></div>
							</div>
							<span class="progress-text">Subiendo archivo... {uploadProgress}%</span>
						</div>
					{/if}

					<small class="form-help">Sube una imagen o video que muestre el resultado del trabajo. El archivo se guardará en nuestro servidor seguro. <strong>Este campo es obligatorio.</strong></small>
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
							{editingItemId ? 'Actualizar Trabajo' : 'Guardar Trabajo'}
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
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 2rem;
		padding: 1rem 0;
	}

	/* Portfolio item styles */
	.portfolio-item {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 1.5rem;
		overflow: hidden;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.portfolio-item:hover {
		transform: translateY(-8px) scale(1.02);
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
		border-color: #3b82f6;
	}

	.portfolio-actions {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		z-index: 10;
		display: flex;
		gap: 0.5rem;
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.portfolio-item:hover .portfolio-actions {
		opacity: 1;
	}

	.btn-edit,
	.btn-delete {
		background: rgba(255, 255, 255, 0.95);
		color: #374151;
		border: none;
		border-radius: 50%;
		width: 40px;
		height: 40px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
		backdrop-filter: blur(8px);
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	.btn-edit:hover {
		background: #3b82f6;
		color: white;
		transform: scale(1.1);
	}

	.btn-delete:hover {
		background: #ef4444;
		color: white;
		transform: scale(1.1);
	}

	.btn-edit svg,
	.btn-delete svg {
		width: 18px;
		height: 18px;
	}

	/* Media styles */
	.portfolio-media {
		width: 100%;
		height: 250px;
		overflow: hidden;
		position: relative;
		flex-shrink: 0;
	}

	.portfolio-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.portfolio-video {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.portfolio-item:hover .portfolio-image,
	.portfolio-item:hover .portfolio-video {
		transform: scale(1.1);
	}

	.media-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.9) 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: opacity 0.3s ease;
		backdrop-filter: blur(2px);
	}

	.portfolio-item:hover .media-overlay {
		opacity: 1;
	}

	.view-text {
		color: white;
		font-weight: 700;
		font-size: 1rem;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	/* Placeholder styles */
	.portfolio-placeholder {
		width: 100%;
		height: 250px;
		background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		border: 2px dashed #cbd5e1;
	}

	.placeholder-icon {
		width: 64px;
		height: 64px;
		color: #94a3b8;
	}

	.placeholder-text {
		color: #64748b;
		font-size: 1rem;
		font-weight: 600;
	}

	/* Info styles */
	.portfolio-info {
		padding: 1.5rem;
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.portfolio-title {
		margin: 0 0 0.75rem 0;
		color: #1f2937;
		font-size: 1.25rem;
		font-weight: 700;
		line-height: 1.3;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.portfolio-description {
		margin: 0 0 1rem 0;
		color: #6b7280;
		font-size: 0.875rem;
		line-height: 1.6;
		flex: 1;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
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
	.form-group textarea,
	.form-group select {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		transition: all 0.2s ease;
		background: white;
	}

	.form-group input:hover,
	.form-group textarea:hover,
	.form-group select:hover {
		border-color: #9ca3af;
	}

	.form-group input:focus,
	.form-group textarea:focus,
	.form-group select:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	/* File upload styles */
	.file-upload-area {
		border: 2px dashed #d1d5db;
		border-radius: 0.5rem;
		padding: 2rem;
		text-align: center;
		cursor: pointer;
		transition: all 0.2s ease;
		background: #f9fafb;
	}

	.file-upload-area:hover {
		border-color: #3b82f6;
		background: #eff6ff;
	}

	.upload-icon {
		width: 48px;
		height: 48px;
		color: #6b7280;
		margin: 0 auto 1rem;
	}

	.upload-text {
		margin: 0 0 0.5rem 0;
		color: #374151;
		font-weight: 600;
		font-size: 1rem;
	}

	.upload-hint {
		margin: 0;
		color: #6b7280;
		font-size: 0.875rem;
	}

	/* File preview styles */
	.file-preview {
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		padding: 1rem;
		background: white;
	}

	.file-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.file-icon {
		width: 32px;
		height: 32px;
		color: #3b82f6;
		flex-shrink: 0;
	}

	.file-details {
		flex: 1;
		min-width: 0;
	}

	.file-name {
		display: block;
		color: #374151;
		font-weight: 600;
		font-size: 0.875rem;
		margin-bottom: 0.25rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.file-size {
		color: #6b7280;
		font-size: 0.75rem;
	}

	.btn-remove-file {
		background: #fee2e2;
		color: #dc2626;
		border: none;
		border-radius: 50%;
		width: 32px;
		height: 32px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
		flex-shrink: 0;
	}

	.btn-remove-file:hover {
		background: #fecaca;
		transform: scale(1.1);
	}

	.btn-remove-file svg {
		width: 16px;
		height: 16px;
	}

	/* Upload error styles */
	.upload-error {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem;
		background: #fee2e2;
		color: #dc2626;
		border-radius: 0.5rem;
		margin-top: 0.5rem;
		font-size: 0.875rem;
	}

	.upload-error svg {
		width: 20px;
		height: 20px;
		flex-shrink: 0;
	}

	/* Service portfolio section styles */
	.service-portfolio-section {
		margin-bottom: 2rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.75rem;
		overflow: hidden;
		background: white;
	}

	.service-header {
		background: #f8fafc;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid #e5e7eb;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.service-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: #374151;
		margin: 0;
	}

	.service-count {
		background: #3b82f6;
		color: white;
		padding: 0.25rem 0.75rem;
		border-radius: 1rem;
		font-size: 0.875rem;
		font-weight: 500;
	}

	/* Upload progress styles */
	.upload-progress {
		margin-top: 0.5rem;
	}

	.progress-bar {
		width: 100%;
		height: 8px;
		background: #e5e7eb;
		border-radius: 4px;
		overflow: hidden;
		margin-bottom: 0.5rem;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
		transition: width 0.3s ease;
	}

	.progress-text {
		color: #6b7280;
		font-size: 0.75rem;
		font-weight: 500;
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
			gap: 1.5rem;
		}

		.portfolio-stats {
			flex-direction: column;
			gap: 1rem;
			text-align: center;
		}

		.portfolio-actions {
			opacity: 1;
		}

		.portfolio-media {
			height: 200px;
		}

		.portfolio-placeholder {
			height: 200px;
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

	@media (max-width: 480px) {
		.portfolio-grid {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.portfolio-info {
			padding: 1rem;
		}

		.portfolio-title {
			font-size: 1.125rem;
		}

		.portfolio-description {
			font-size: 0.8125rem;
		}
	}
</style> 