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
		<p>Cargando perfil...</p>
	</div>
{:else}
	<div class="profile-page">
		<header class="page-header">
			<h1>Mi Perfil</h1>
			<p>Gestiona tu información personal y profesional</p>
		</header>

		{#if message}
			<div class="message {messageType}">
				{message}
			</div>
		{/if}

		<form on:submit|preventDefault={saveProfile} class="profile-form">
			<!-- Información Personal -->
			<section class="form-section">
				<h2>Información Personal</h2>
				<div class="form-grid">
					<div class="form-group">
						<label for="business_name">Nombre del Negocio/Persona *</label>
						<input
							id="business_name"
							type="text"
							bind:value={formData.business_name}
							required
							placeholder="Ej: Juan Pérez Servicios"
						/>
					</div>

					<div class="form-group">
						<label for="headline">Título Profesional *</label>
						<input
							id="headline"
							type="text"
							bind:value={formData.headline}
							required
							placeholder="Ej: Técnico en Ensamblaje y Montaje"
						/>
					</div>

					<div class="form-group full-width">
						<label for="bio">Descripción *</label>
						<textarea
							id="bio"
							bind:value={formData.bio}
							required
							rows="4"
							placeholder="Describe tus servicios, experiencia y especialidades..."
						></textarea>
					</div>

					<div class="form-group">
						<label for="phone">Teléfono *</label>
						<input
							id="phone"
							type="tel"
							bind:value={formData.phone}
							required
							placeholder="+505 8888 8888"
						/>
					</div>

					<div class="form-group">
						<label for="location">Ubicación *</label>
						<input
							id="location"
							type="text"
							bind:value={formData.location}
							required
							placeholder="Ej: Managua, Nicaragua"
						/>
					</div>

					<div class="form-group">
						<label for="hourly_rate">Tarifa por Hora (NIO) *</label>
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
				<h2>Categorías de Servicios</h2>
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
				<h2>Horarios de Trabajo</h2>
				<p class="section-description">Define tus horarios de disponibilidad</p>
				
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
									<span>a</span>
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
				<h2>Zonas de Cobertura</h2>
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
							>
								❌
							</button>
						</div>
					{/each}
					
					<button type="button" class="btn-add" on:click={addServiceArea}>
						➕ Agregar Zona
					</button>
				</div>
			</section>

			<!-- Documentación -->
			<section class="form-section">
				<h2>Documentación</h2>
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
							>
								❌
							</button>
						</div>
					{/each}
					
					<button type="button" class="btn-add" on:click={addDocument}>
						➕ Agregar Documento
					</button>
				</div>
			</section>

			<!-- Portafolio -->
			<section class="form-section">
				<h2>Portafolio</h2>
				<p class="section-description">Muestra ejemplos de tu trabajo</p>
				
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
								placeholder="Descripción del trabajo realizado"
								rows="3"
							></textarea>
							<input
								type="url"
								bind:value={formData.portfolio[index].image_url}
								placeholder="URL de la imagen"
							/>
							<button
								type="button"
								class="btn-remove"
								on:click={() => removePortfolioItem(index)}
							>
								❌
							</button>
						</div>
					{/each}
					
					<button type="button" class="btn-add" on:click={addPortfolioItem}>
						➕ Agregar Trabajo
					</button>
				</div>
			</section>

			<!-- Botones de Acción -->
			<section class="form-actions">
				<button type="submit" class="btn btn-primary" disabled={saving}>
					{saving ? 'Guardando...' : 'Guardar Cambios'}
				</button>
				<a href="/provider" class="btn btn-secondary">Cancelar</a>
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

	.profile-page {
		max-width: 800px;
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

	.message {
		padding: var(--spacing-md);
		border-radius: var(--border-radius-md);
		margin-bottom: var(--spacing-lg);
		font-weight: 500;
	}

	.message.success {
		background: #d1fae5;
		color: #065f46;
		border: 1px solid #10b981;
	}

	.message.error {
		background: #fee2e2;
		color: #991b1b;
		border: 1px solid #ef4444;
	}

	.profile-form {
		background: var(--color-background-white);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-2xl);
		box-shadow: var(--shadow-sm);
	}

	.form-section {
		margin-bottom: var(--spacing-3xl);
	}

	.form-section h2 {
		margin: 0 0 var(--spacing-md) 0;
		color: var(--color-text);
		font-size: var(--font-size-xl);
		font-weight: 600;
	}

	.section-description {
		margin: 0 0 var(--spacing-lg) 0;
		color: var(--color-text-light);
		font-size: var(--font-size-base);
	}

	.form-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: var(--spacing-lg);
	}

	.form-group {
		display: flex;
		flex-direction: column;
	}

	.form-group.full-width {
		grid-column: 1 / -1;
	}

	.form-group label {
		margin-bottom: var(--spacing-xs);
		color: var(--color-text);
		font-weight: 500;
		font-size: var(--font-size-sm);
	}

	.form-group input,
	.form-group select,
	.form-group textarea {
		padding: var(--spacing-sm);
		border: 1px solid var(--color-border-light, rgba(0, 0, 0, 0.1));
		border-radius: var(--border-radius-md);
		font-size: var(--font-size-base);
		transition: border-color var(--transition-fast);
	}

	.form-group input:focus,
	.form-group select:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
	}

	.categories-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--spacing-md);
	}

	.category-checkbox {
		display: flex;
		align-items: center;
		padding: var(--spacing-md);
		border: 1px solid var(--color-border-light, rgba(0, 0, 0, 0.1));
		border-radius: var(--border-radius-md);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.category-checkbox:hover {
		border-color: var(--color-primary);
		background: var(--color-background);
	}

	.category-checkbox input[type="checkbox"] {
		margin-right: var(--spacing-sm);
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}

	.category-icon {
		font-size: var(--font-size-lg);
	}

	.category-name {
		font-weight: 500;
	}

	.working-hours {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.day-schedule {
		display: flex;
		align-items: center;
		gap: var(--spacing-lg);
		padding: var(--spacing-md);
		border: 1px solid var(--color-border-light, rgba(0, 0, 0, 0.1));
		border-radius: var(--border-radius-md);
	}

	.day-header {
		min-width: 120px;
	}

	.day-checkbox {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		cursor: pointer;
	}

	.day-name {
		font-weight: 500;
	}

	.time-inputs {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}

	.time-inputs input {
		padding: var(--spacing-xs) var(--spacing-sm);
		border: 1px solid var(--color-border-light, rgba(0, 0, 0, 0.1));
		border-radius: var(--border-radius-sm);
	}

	.service-areas,
	.documents,
	.portfolio {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.area-input,
	.document-input,
	.portfolio-item {
		display: flex;
		gap: var(--spacing-sm);
		align-items: flex-start;
	}

	.area-input input,
	.document-input input,
	.portfolio-item input,
	.portfolio-item textarea {
		flex: 1;
		padding: var(--spacing-sm);
		border: 1px solid var(--color-border-light, rgba(0, 0, 0, 0.1));
		border-radius: var(--border-radius-md);
	}

	.btn-add {
		padding: var(--spacing-sm) var(--spacing-md);
		background: var(--color-primary-light);
		color: var(--color-primary);
		border: 1px solid var(--color-primary);
		border-radius: var(--border-radius-md);
		cursor: pointer;
		font-weight: 500;
		transition: all var(--transition-fast);
		align-self: flex-start;
	}

	.btn-add:hover {
		background: var(--color-primary);
		color: white;
	}

	.btn-remove {
		padding: var(--spacing-xs);
		background: none;
		border: none;
		cursor: pointer;
		font-size: var(--font-size-sm);
		opacity: 0.7;
		transition: opacity var(--transition-fast);
	}

	.btn-remove:hover {
		opacity: 1;
	}

	.form-actions {
		display: flex;
		gap: var(--spacing-md);
		justify-content: flex-end;
		padding-top: var(--spacing-lg);
		border-top: 1px solid var(--color-border-light, rgba(0, 0, 0, 0.1));
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

	.btn-primary:hover:not(:disabled) {
		background: var(--color-primary-hover);
		transform: translateY(-1px);
	}

	.btn-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-secondary {
		background: var(--color-background-card);
		color: var(--color-primary);
		border: 1px solid var(--color-primary);
	}

	.btn-secondary:hover {
		background: var(--color-primary);
		color: white;
		transform: translateY(-1px);
	}

	/* Responsive */
	@media (max-width: 768px) {
		.profile-form {
			padding: var(--spacing-lg);
		}

		.form-grid {
			grid-template-columns: 1fr;
		}

		.categories-grid {
			grid-template-columns: 1fr;
		}

		.day-schedule {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--spacing-sm);
		}

		.area-input,
		.document-input,
		.portfolio-item {
			flex-direction: column;
		}

		.form-actions {
			flex-direction: column;
		}
	}
</style> 