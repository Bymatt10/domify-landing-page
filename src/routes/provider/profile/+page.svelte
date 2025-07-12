<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';

	export let data: any;
	let { session, user } = data;
	$: ({ session, user } = data);

	let providerProfile: any = null;
	let categories: any[] = [];
	let selectedCategories: number[] = [];
	let loading = true;
	let saving = false;
	let message = '';
	let messageType = '';

	// Form data
	let formData: any = {
		business_name: '',
		headline: '',
		bio: '',
		hourly_rate: 0,
		phone: '',
		location: '',
		provider_type: 'individual',
		working_hours: {
			monday: { start: '08:00', end: '18:00', available: true },
			tuesday: { start: '08:00', end: '18:00', available: true },
			wednesday: { start: '08:00', end: '18:00', available: true },
			thursday: { start: '08:00', end: '18:00', available: true },
			friday: { start: '08:00', end: '18:00', available: true },
			saturday: { start: '08:00', end: '14:00', available: true },
			sunday: { start: '08:00', end: '14:00', available: false }
		},
		service_areas: [] as string[],
		documents: [] as any[],
		portfolio: [] as any[]
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

			// Cargar categorías disponibles
			const { data: cats, error: catsError } = await supabase
				.from('categories')
				.select('*')
				.order('name');

			if (catsError) throw catsError;
			categories = cats || [];

			// Cargar categorías del proveedor
			const { data: providerCats, error: providerCatsError } = await supabase
				.from('provider_categories')
				.select('category_id')
				.eq('provider_profile_id', profile.id);

			if (providerCatsError) throw providerCatsError;
			selectedCategories = (providerCats || []).map(cat => cat.category_id);

			// Llenar formulario con datos existentes
			formData = {
				business_name: profile.business_name || '',
				headline: profile.headline || '',
				bio: profile.bio || '',
				hourly_rate: profile.hourly_rate || 0,
				phone: profile.phone || '',
				location: profile.location || '',
				provider_type: profile.provider_type || 'individual',
				working_hours: profile.working_hours || formData.working_hours,
				service_areas: profile.service_areas || [],
				documents: profile.documents || [],
				portfolio: profile.portfolio || []
			};

		} catch (error) {
			console.error('Error loading data:', error);
			showMessage('Error al cargar los datos', 'error');
		} finally {
			loading = false;
		}
	}

	async function saveProfile() {
		saving = true;
		message = '';

		try {
			// Actualizar perfil
			const { error: profileError } = await supabase
				.from('provider_profiles')
				.update({
					business_name: formData.business_name,
					headline: formData.headline,
					bio: formData.bio,
					hourly_rate: formData.hourly_rate,
					phone: formData.phone,
					location: formData.location,
					provider_type: formData.provider_type,
					working_hours: formData.working_hours,
					service_areas: formData.service_areas,
					documents: formData.documents,
					portfolio: formData.portfolio,
					updated_at: new Date().toISOString()
				})
				.eq('id', providerProfile.id);

			if (profileError) throw profileError;

			// Actualizar categorías
			await updateCategories();

			showMessage('Perfil actualizado exitosamente', 'success');
		} catch (error) {
			console.error('Error saving profile:', error);
			showMessage('Error al guardar el perfil', 'error');
		} finally {
			saving = false;
		}
	}

	async function updateCategories() {
		try {
			// Eliminar categorías existentes
			await supabase
				.from('provider_categories')
				.delete()
				.eq('provider_profile_id', providerProfile.id);

			// Agregar nuevas categorías
			if (selectedCategories.length > 0) {
				const categoryAssignments = selectedCategories.map(categoryId => ({
					provider_profile_id: providerProfile.id,
					category_id: categoryId
				}));

				await supabase
					.from('provider_categories')
					.insert(categoryAssignments);
			}
		} catch (error) {
			console.error('Error updating categories:', error);
			throw error;
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

	function addServiceArea() {
		formData.service_areas = [...formData.service_areas, ''];
	}

	function removeServiceArea(index: number) {
		formData.service_areas = formData.service_areas.filter((_: any, i: number) => i !== index);
	}

	function addDocument() {
		formData.documents = [...formData.documents, { name: '', url: '', type: '' }];
	}

	function removeDocument(index: number) {
		formData.documents = formData.documents.filter((_: any, i: number) => i !== index);
	}

	function addPortfolioItem() {
		formData.portfolio = [...formData.portfolio, { title: '', description: '', image_url: '' }];
	}

	function removePortfolioItem(index: number) {
		formData.portfolio = formData.portfolio.filter((_: any, i: number) => i !== index);
	}

	const daysOfWeek = [
		{ key: 'monday', label: 'Lunes' },
		{ key: 'tuesday', label: 'Martes' },
		{ key: 'wednesday', label: 'Miércoles' },
		{ key: 'thursday', label: 'Jueves' },
		{ key: 'friday', label: 'Viernes' },
		{ key: 'saturday', label: 'Sábado' },
		{ key: 'sunday', label: 'Domingo' }
	];
</script>

<svelte:head>
	<title>Mi Perfil - Panel Proveedor | Domify</title>
</svelte:head>

{#if loading}
	<div class="loading-container">
		<div class="loading-spinner"></div>
		<p class="text-gray-600">Cargando tu perfil...</p>
	</div>
{:else}
	<div class="profile-page">
		<header class="page-header">
			<h1>Mi Perfil</h1>
			<p>Gestiona tu información personal y profesional</p>
		</header>

		{#if message}
			<div class="message {messageType}">
				<span class="message-icon">
					{#if messageType === 'success'}
						✓
					{:else}
						⚠
					{/if}
				</span>
				{message}
			</div>
		{/if}

		<form on:submit|preventDefault={saveProfile} class="profile-form">
			<!-- Información Personal -->
			<section class="form-section">
				<h2>
					<span class="section-icon">👤</span>
					Información Personal
				</h2>
				<p class="section-description">Completa tu información básica para que los clientes te conozcan mejor</p>
				
				<div class="form-grid">
					<div class="form-group">
						<label for="business_name">
							Nombre del Negocio/Persona
							<span class="required">*</span>
						</label>
						<input
							id="business_name"
							type="text"
							bind:value={formData.business_name}
							required
							placeholder="Ej: Juan Pérez Servicios"
						/>
					</div>

					<div class="form-group">
						<label for="headline">
							Título Profesional
							<span class="required">*</span>
						</label>
						<input
							id="headline"
							type="text"
							bind:value={formData.headline}
							required
							placeholder="Ej: Técnico en Ensamblaje y Montaje"
						/>
					</div>

					<div class="form-group full-width">
						<label for="bio">
							Descripción
							<span class="required">*</span>
						</label>
						<textarea
							id="bio"
							bind:value={formData.bio}
							required
							rows="4"
							placeholder="Describe tus servicios, experiencia y especialidades..."
						></textarea>
						<span class="input-help">Sé específico y destaca tus habilidades principales</span>
					</div>

					<div class="form-group">
						<label for="phone">
							Teléfono
							<span class="required">*</span>
						</label>
						<input
							id="phone"
							type="tel"
							bind:value={formData.phone}
							required
							placeholder="+505 8888 8888"
						/>
					</div>

					<div class="form-group">
						<label for="location">
							Ubicación
							<span class="required">*</span>
						</label>
						<input
							id="location"
							type="text"
							bind:value={formData.location}
							required
							placeholder="Ej: Managua, Nicaragua"
						/>
					</div>

					<div class="form-group">
						<label for="hourly_rate">
							Tarifa por Hora (NIO)
							<span class="required">*</span>
						</label>
						<div class="input-with-icon">
							<span class="currency-symbol">C$</span>
							<input
								id="hourly_rate"
								type="number"
								bind:value={formData.hourly_rate}
								required
								min="0"
								step="0.01"
								placeholder="500"
							/>
						</div>
					</div>

					<div class="form-group">
						<label for="provider_type">Tipo de Proveedor</label>
						<select id="provider_type" bind:value={formData.provider_type}>
							<option value="individual">Individual</option>
							<option value="company">Empresa</option>
						</select>
					</div>
				</div>
			</section>

			<!-- Categorías de Servicios -->
			<section class="form-section">
				<h2>
					<span class="section-icon">🔧</span>
					Categorías de Servicios
				</h2>
				<p class="section-description">Selecciona las categorías en las que te especializas</p>
				
				<div class="categories-grid">
					{#each categories as category}
						<label class="category-checkbox">
							<input
								type="checkbox"
								value={category.id}
								bind:group={selectedCategories}
							/>
							<span class="checkbox-label">
								<span class="category-icon">{category.icon || '🛠️'}</span>
								<span class="category-name">{category.name}</span>
							</span>
						</label>
					{/each}
				</div>
			</section>

			<!-- Horarios de Trabajo -->
			<section class="form-section">
				<h2>
					<span class="section-icon">🕒</span>
					Horarios de Trabajo
				</h2>
				<p class="section-description">Define tus horarios de disponibilidad para cada día de la semana</p>
				
				<div class="working-hours">
					{#each daysOfWeek as day}
						<div class="day-schedule">
							<div class="day-header">
								<label class="day-checkbox">
									<input
										type="checkbox"
										bind:checked={formData.working_hours[day.key].available}
									/>
									<span class="day-name">{day.label}</span>
								</label>
							</div>
							
							{#if formData.working_hours[day.key].available}
								<div class="time-inputs">
									<input
										type="time"
										bind:value={formData.working_hours[day.key].start}
									/>
									<span class="time-separator">a</span>
									<input
										type="time"
										bind:value={formData.working_hours[day.key].end}
									/>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</section>

			<!-- Zonas de Cobertura -->
			<section class="form-section">
				<h2>
					<span class="section-icon">📍</span>
					Zonas de Cobertura
				</h2>
				<p class="section-description">Agrega las áreas donde prestas servicios</p>
				
				<div class="service-areas">
					{#each formData.service_areas as area, index}
						<div class="area-input">
							<input
								type="text"
								bind:value={formData.service_areas[index]}
								placeholder="Ej: Managua Centro, Carretera Sur"
							/>
							<button
								type="button"
								class="btn-remove"
								on:click={() => removeServiceArea(index)}
								title="Eliminar zona"
							>
								<span class="sr-only">Eliminar zona</span>
								✕
							</button>
						</div>
					{/each}
					
					<button type="button" class="btn-add" on:click={addServiceArea}>
						<span>➕</span>
						Agregar Zona
					</button>
				</div>
			</section>

			<!-- Documentación -->
			<section class="form-section">
				<h2>
					<span class="section-icon">📄</span>
					Documentación
				</h2>
				<p class="section-description">Agrega certificaciones, licencias y documentos importantes</p>
				
				<div class="documents">
					{#each formData.documents as doc, index}
						<div class="document-input">
							<input
								type="text"
								bind:value={formData.documents[index].name}
								placeholder="Nombre del documento"
							/>
							<input
								type="text"
								bind:value={formData.documents[index].type}
								placeholder="Tipo (certificación, licencia, etc.)"
							/>
							<input
								type="url"
								bind:value={formData.documents[index].url}
								placeholder="URL del documento"
							/>
							<button
								type="button"
								class="btn-remove"
								on:click={() => removeDocument(index)}
								title="Eliminar documento"
							>
								<span class="sr-only">Eliminar documento</span>
								✕
							</button>
						</div>
					{/each}
					
					<button type="button" class="btn-add" on:click={addDocument}>
						<span>➕</span>
						Agregar Documento
					</button>
				</div>
			</section>

			<!-- Portafolio -->
			<section class="form-section">
				<h2>
					<span class="section-icon">🖼️</span>
					Portafolio
				</h2>
				<p class="section-description">Muestra ejemplos de tu trabajo para atraer más clientes</p>
				
				<div class="portfolio">
					{#each formData.portfolio as item, index}
						<div class="portfolio-item">
							<input
								type="text"
								bind:value={formData.portfolio[index].title}
								placeholder="Título del trabajo"
							/>
							<textarea
								bind:value={formData.portfolio[index].description}
								placeholder="Describe el trabajo realizado, resultados y satisfacción del cliente"
								rows="3"
							></textarea>
							<input
								type="url"
								bind:value={formData.portfolio[index].image_url}
								placeholder="URL de la imagen del trabajo"
							/>
							<button
								type="button"
								class="btn-remove"
								on:click={() => removePortfolioItem(index)}
								title="Eliminar trabajo"
							>
								<span class="sr-only">Eliminar trabajo</span>
								✕
							</button>
						</div>
					{/each}
					
					<button type="button" class="btn-add" on:click={addPortfolioItem}>
						<span>➕</span>
						Agregar Trabajo
					</button>
				</div>
			</section>

			<!-- Botones de Acción -->
			<section class="form-actions">
				<button type="submit" class="btn btn-primary" disabled={saving}>
					{#if saving}
						<span class="loading-dots">Guardando</span>
					{:else}
						<span>💾</span>
						Guardar Cambios
					{/if}
				</button>
				<a href="/provider" class="btn btn-secondary">
					<span>↩</span>
					Cancelar
				</a>
			</section>
		</form>
	</div>
{/if}

<style>
	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
		gap: var(--spacing-md);
	}

	.loading-spinner {
		width: 48px;
		height: 48px;
		border: 4px solid #e2e8f0;
		border-top: 4px solid #3b82f6;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.profile-page {
		max-width: 900px;
		margin: 2rem auto;
		padding: 0 1rem;
	}

	.page-header {
		margin-bottom: 2.5rem;
		text-align: center;
		position: relative;
		padding-bottom: 1.5rem;
	}

	.page-header::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 60px;
		height: 4px;
		background: var(--color-primary);
		border-radius: 2px;
	}

	.page-header h1 {
		margin: 0 0 0.75rem 0;
		color: var(--color-text);
		font-size: 2.5rem;
		font-weight: 700;
		letter-spacing: -0.025em;
	}

	.page-header p {
		margin: 0;
		color: #64748b;
		font-size: 1.125rem;
	}

	.message {
		padding: 1rem;
		border-radius: 0.75rem;
		margin-bottom: 1.5rem;
		font-weight: 500;
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.message.success {
		background: #f0fdf4;
		color: #166534;
		border: 1px solid #4ade80;
	}

	.message.error {
		background: #fef2f2;
		color: #991b1b;
		border: 1px solid #f87171;
	}

	.profile-form {
		background: white;
		border-radius: 1rem;
		padding: 2rem;
		box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
	}

	.form-section {
		margin-bottom: 3rem;
		padding: 2rem;
		background: #f8fafc;
		border-radius: 0.75rem;
		border: 1px solid #e2e8f0;
	}

	.form-section:last-child {
		margin-bottom: 0;
	}

	.form-section h2 {
		margin: 0 0 1rem 0;
		color: #1e293b;
		font-size: 1.5rem;
		font-weight: 600;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.section-description {
		margin: 0 0 1.5rem 0;
		color: #64748b;
		font-size: 1rem;
		line-height: 1.5;
	}

	.form-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1.5rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.form-group.full-width {
		grid-column: 1 / -1;
	}

	.form-group label {
		color: #334155;
		font-weight: 500;
		font-size: 0.875rem;
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.form-group input,
	.form-group select,
	.form-group textarea {
		padding: 0.75rem;
		border: 1px solid #e2e8f0;
		border-radius: 0.5rem;
		font-size: 1rem;
		transition: all 0.2s;
		background: white;
	}

	.form-group input:hover,
	.form-group select:hover,
	.form-group textarea:hover {
		border-color: #cbd5e1;
	}

	.form-group input:focus,
	.form-group select:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.categories-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 1rem;
	}

	.category-checkbox {
		display: flex;
		align-items: center;
		padding: 1rem;
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 0.5rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.category-checkbox:hover {
		border-color: #3b82f6;
		background: #f8fafc;
		transform: translateY(-1px);
	}

	.category-checkbox input[type="checkbox"] {
		margin-right: 0.75rem;
		width: 1.25rem;
		height: 1.25rem;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.category-icon {
		font-size: 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		background: #f1f5f9;
		border-radius: 0.5rem;
	}

	.category-name {
		font-weight: 500;
		color: #334155;
	}

	.working-hours {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.day-schedule {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		padding: 1rem;
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 0.5rem;
		transition: all 0.2s;
	}

	.day-schedule:hover {
		border-color: #cbd5e1;
		background: #f8fafc;
	}

	.day-header {
		min-width: 140px;
	}

	.day-checkbox {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		cursor: pointer;
	}

	.day-checkbox input[type="checkbox"] {
		width: 1.25rem;
		height: 1.25rem;
	}

	.day-name {
		font-weight: 500;
		color: #334155;
	}

	.time-inputs {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex: 1;
	}

	.time-inputs input {
		padding: 0.5rem;
		border: 1px solid #e2e8f0;
		border-radius: 0.375rem;
		flex: 1;
		min-width: 120px;
	}

	.service-areas,
	.documents,
	.portfolio {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.area-input,
	.document-input,
	.portfolio-item {
		display: flex;
		gap: 0.75rem;
		align-items: flex-start;
		background: white;
		padding: 1rem;
		border-radius: 0.5rem;
		border: 1px solid #e2e8f0;
	}

	.area-input input,
	.document-input input,
	.portfolio-item input,
	.portfolio-item textarea {
		flex: 1;
		padding: 0.75rem;
		border: 1px solid #e2e8f0;
		border-radius: 0.375rem;
		min-width: 0;
	}

	.btn-add {
		padding: 0.75rem 1rem;
		background: #f1f5f9;
		color: #3b82f6;
		border: 1px solid #e2e8f0;
		border-radius: 0.5rem;
		cursor: pointer;
		font-weight: 500;
		transition: all 0.2s;
		align-self: flex-start;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.btn-add:hover {
		background: #3b82f6;
		color: white;
		border-color: #3b82f6;
		transform: translateY(-1px);
	}

	.btn-remove {
		padding: 0.5rem;
		background: #fee2e2;
		border: none;
		border-radius: 0.375rem;
		cursor: pointer;
		font-size: 1rem;
		color: #991b1b;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.btn-remove:hover {
		background: #fecaca;
		transform: scale(1.05);
	}

	.form-actions {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
		margin-top: 2rem;
		padding-top: 2rem;
		border-top: 1px solid #e2e8f0;
	}

	.btn {
		padding: 0.75rem 1.5rem;
		border-radius: 0.5rem;
		font-weight: 500;
		font-size: 1rem;
		transition: all 0.2s;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.btn-primary {
		background: #3b82f6;
		color: white;
		border: none;
	}

	.btn-primary:hover {
		background: #2563eb;
		transform: translateY(-1px);
	}

	.btn-primary:disabled {
		background: #93c5fd;
		cursor: not-allowed;
		transform: none;
	}

	.btn-secondary {
		background: white;
		color: #64748b;
		border: 1px solid #e2e8f0;
		text-decoration: none;
	}

	.btn-secondary:hover {
		background: #f8fafc;
		color: #334155;
		border-color: #cbd5e1;
	}

	@media (max-width: 640px) {
		.profile-page {
			margin: 1rem auto;
		}

		.page-header {
			text-align: left;
			margin-bottom: 2rem;
		}

		.page-header::after {
			left: 0;
			transform: none;
		}

		.form-section {
			padding: 1.5rem;
		}

		.form-grid {
			grid-template-columns: 1fr;
		}

		.working-hours {
			flex-direction: column;
		}

		.day-schedule {
			flex-direction: column;
			align-items: stretch;
		}

		.time-inputs {
			margin-top: 0.5rem;
		}

		.form-actions {
			flex-direction: column;
		}

		.btn {
			width: 100%;
			justify-content: center;
		}
	}

	.required {
		color: #ef4444;
		margin-left: 0.25rem;
	}

	.input-help {
		font-size: 0.875rem;
		color: #64748b;
		margin-top: 0.25rem;
	}

	.input-with-icon {
		position: relative;
		display: flex;
		align-items: center;
	}

	.currency-symbol {
		position: absolute;
		left: 0.75rem;
		color: #64748b;
		font-weight: 500;
	}

	.input-with-icon input {
		padding-left: 2.5rem;
	}

	.section-icon {
		font-size: 1.25rem;
		margin-right: 0.5rem;
	}

	.message-icon {
		font-size: 1.25rem;
	}

	.time-separator {
		color: #64748b;
		padding: 0 0.5rem;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.loading-dots::after {
		content: '...';
		animation: dots 1.5s steps(4, end) infinite;
	}

	@keyframes dots {
		0%, 20% { content: ''; }
		40% { content: '.'; }
		60% { content: '..'; }
		80%, 100% { content: '...'; }
	}
</style> 