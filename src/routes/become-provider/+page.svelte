<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let categories: any[] = [];
	let nicaraguaDepartments = [
		'Boaco',
		'Carazo',
		'Chinandega',
		'Chontales',
		'Estelí',
		'Granada',
		'Jinotega',
		'León',
		'Madriz',
		'Managua',
		'Masaya',
		'Matagalpa',
		'Nueva Segovia',
		'Río San Juan',
		'Rivas',
		'Región Autónoma de la Costa Caribe Norte (RACCN)',
		'Región Autónoma de la Costa Caribe Sur (RACCS)'
	];
	
	let formData = {
		// Información personal
		first_name: '',
		last_name: '',
		email: '',
		phone: '',
		
		// Dirección
		department: '',
		city: '',
		address: '',
		
		// Información del servicio
		headline: '',
		bio: '',
		hourly_rate: '',
		experience_years: '',
		categories: [] as number[],
		availability: {
			monday: { morning: false, afternoon: false, evening: false },
			tuesday: { morning: false, afternoon: false, evening: false },
			wednesday: { morning: false, afternoon: false, evening: false },
			thursday: { morning: false, afternoon: false, evening: false },
			friday: { morning: false, afternoon: false, evening: false },
			saturday: { morning: false, afternoon: false, evening: false },
			sunday: { morning: false, afternoon: false, evening: false }
		} as Record<string, Record<string, boolean>>
	};

	let isSubmitting = false;
	let submitMessage = '';
	let submitError = '';

	onMount(async () => {
		// Cargar categorías disponibles
		await loadCategories();
	});

	async function loadCategories() {
		try {
			const response = await fetch('/api/categories');
			if (response.ok) {
				const result = await response.json();
				categories = result.data?.categories || [];
			}
		} catch (error) {
			console.error('Error loading categories:', error);
		}
	}

	async function handleSubmit() {
		isSubmitting = true;
		submitMessage = '';
		submitError = '';

		try {
			// Validar campos requeridos
			if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone ||
				!formData.department || !formData.city || !formData.address ||
				!formData.headline || !formData.bio || !formData.hourly_rate || 
				formData.categories.length === 0) {
				submitError = 'Por favor, completa todos los campos requeridos.';
				isSubmitting = false;
				return;
			}

			// Validar formato de email
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(formData.email)) {
				submitError = 'Por favor, ingresa un email válido.';
				isSubmitting = false;
				return;
			}

			// Preparar datos para la API
			const applicationData = {
				first_name: formData.first_name,
				last_name: formData.last_name,
				email: formData.email,
				phone: formData.phone,
				department: formData.department,
				city: formData.city,
				address: formData.address,
				headline: formData.headline,
				bio: formData.bio,
				hourly_rate: parseFloat(formData.hourly_rate),
				experience_years: parseInt(formData.experience_years) || 0,
				categories: formData.categories,
				availability: formData.availability
			};

			// Enviar la aplicación
			const response = await fetch('/api/become-provider', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(applicationData)
			});

			if (response.ok) {
				submitMessage = '¡Tu aplicación ha sido enviada exitosamente! Te contactaremos pronto para revisar tu solicitud.';
				// Limpiar formulario
				formData = {
					first_name: '',
					last_name: '',
					email: '',
					phone: '',
					department: '',
					city: '',
					address: '',
					headline: '',
					bio: '',
					hourly_rate: '',
					experience_years: '',
					categories: [],
					availability: {
						monday: { morning: false, afternoon: false, evening: false },
						tuesday: { morning: false, afternoon: false, evening: false },
						wednesday: { morning: false, afternoon: false, evening: false },
						thursday: { morning: false, afternoon: false, evening: false },
						friday: { morning: false, afternoon: false, evening: false },
						saturday: { morning: false, afternoon: false, evening: false },
						sunday: { morning: false, afternoon: false, evening: false }
					}
				};
			} else {
				const errorData = await response.json();
				submitError = errorData.error?.message || 'Hubo un error al enviar la aplicación. Por favor, intenta de nuevo.';
			}
		} catch (error) {
			submitError = 'Error de conexión. Por favor, intenta de nuevo.';
		} finally {
			isSubmitting = false;
		}
	}

	function toggleCategory(categoryId: number) {
		const index = formData.categories.indexOf(categoryId);
		if (index > -1) {
			formData.categories = formData.categories.filter(id => id !== categoryId);
		} else {
			formData.categories = [...formData.categories, categoryId];
		}
	}

	function toggleAvailability(day: string, time: string) {
		formData.availability[day][time] = !formData.availability[day][time];
		formData.availability = { ...formData.availability };
	}

	function markAllAvailable() {
		const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
		const times = ['morning', 'afternoon', 'evening'];
		
		days.forEach(day => {
			times.forEach(time => {
				formData.availability[day][time] = true;
			});
		});
		
		formData.availability = { ...formData.availability };
	}

	function markWeekdaysAvailable() {
		const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
		const times = ['morning', 'afternoon', 'evening'];
		
		weekdays.forEach(day => {
			times.forEach(time => {
				formData.availability[day][time] = true;
			});
		});
		
		formData.availability = { ...formData.availability };
	}

	function clearAllAvailability() {
		const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
		const times = ['morning', 'afternoon', 'evening'];
		
		days.forEach(day => {
			times.forEach(time => {
				formData.availability[day][time] = false;
			});
		});
		
		formData.availability = { ...formData.availability };
	}
</script>

<svelte:head>
	<title>Ser Domifito - Domify</title>
	<meta name="description" content="Únete a nuestra comunidad de proveedores de servicios en Domify" />
</svelte:head>

<div class="container">
	<div class="form-container">
		<div class="header">
			<h1>¡Únete a Domify!</h1>
			<p>Conviértete en un proveedor de servicios y gana dinero ofreciendo tus habilidades</p>
		</div>

		<form on:submit|preventDefault={handleSubmit} class="provider-form">
			<!-- Información Básica -->
			<div class="form-section">
				<h3>Información del Servicio</h3>
				
				<div class="form-group">
					<label for="headline">Título de tu servicio *</label>
					<input
						type="text"
						id="headline"
						bind:value={formData.headline}
						required
						placeholder="Ej: Servicios de Limpieza Profesional"
					/>
				</div>

				<div class="form-group">
					<label for="bio">Descripción de tu servicio *</label>
					<textarea
						id="bio"
						bind:value={formData.bio}
						required
						rows="4"
						placeholder="Describe tu servicio, experiencia y lo que ofreces..."
					></textarea>
				</div>

				<div class="form-row">
					<div class="form-group">
						<label for="hourly_rate">Precio por hora (C$) *</label>
						<input
							type="number"
							id="hourly_rate"
							bind:value={formData.hourly_rate}
							required
							min="50"
							max="2000"
							step="10"
							placeholder="500"
						/>
					</div>

					<div class="form-group">
						<label for="experience_years">Años de experiencia</label>
						<input
							type="number"
							id="experience_years"
							bind:value={formData.experience_years}
							min="0"
							max="50"
							placeholder="5"
						/>
					</div>
				</div>
			</div>

			<!-- Información de Contacto -->
			<div class="form-section">
				<h3>Información de Contacto</h3>
				
				<div class="form-row">
					<div class="form-group">
						<label for="first_name">Nombre *</label>
						<input
							type="text"
							id="first_name"
							bind:value={formData.first_name}
							required
							placeholder="Tu nombre"
						/>
					</div>

					<div class="form-group">
						<label for="last_name">Apellido *</label>
						<input
							type="text"
							id="last_name"
							bind:value={formData.last_name}
							required
							placeholder="Tu apellido"
						/>
					</div>
				</div>

				<div class="form-row">
					<div class="form-group">
						<label for="email">Email *</label>
						<input
							type="email"
							id="email"
							bind:value={formData.email}
							required
							placeholder="tu@email.com"
						/>
					</div>

					<div class="form-group">
						<label for="phone">Teléfono *</label>
						<input
							type="tel"
							id="phone"
							bind:value={formData.phone}
							required
							placeholder="+505 8888 8888"
						/>
					</div>
				</div>

				<div class="form-row">
					<div class="form-group">
						<label for="department">Departamento *</label>
						<select
							id="department"
							bind:value={formData.department}
							required
						>
							<option value="">Selecciona tu departamento</option>
							{#each nicaraguaDepartments as department}
								<option value={department}>{department}</option>
							{/each}
						</select>
					</div>

					<div class="form-group">
						<label for="city">Ciudad *</label>
						<input
							type="text"
							id="city"
							bind:value={formData.city}
							required
							placeholder="Tu ciudad"
						/>
					</div>
				</div>

				<div class="form-group">
					<label for="address">Dirección completa *</label>
					<textarea
						id="address"
						bind:value={formData.address}
						required
						rows="3"
						placeholder="Dirección exacta: barrio, calle, número de casa, puntos de referencia..."
					></textarea>
				</div>
			</div>

			<!-- Categorías -->
			<div class="form-section">
				<h3>Categorías de Servicio *</h3>
				<p class="section-description">Selecciona las categorías en las que ofreces servicios:</p>
				
				{#if categories.length === 0}
					<div class="loading-categories">
						<p>Cargando categorías...</p>
					</div>
				{:else}
					<div class="categories-grid" role="group" aria-labelledby="categories-label">
						{#each categories as category}
							<label class="category-checkbox" for="category-{category.id}">
								<input
									type="checkbox"
									id="category-{category.id}"
									checked={formData.categories.includes(category.id)}
									on:change={() => toggleCategory(category.id)}
									aria-describedby="category-desc-{category.id}"
								/>
								<div class="category-content">
									<span class="category-label">{category.name}</span>
									{#if category.description}
										<span class="category-description" id="category-desc-{category.id}">
											{category.description}
										</span>
									{/if}
								</div>
							</label>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Disponibilidad -->
			<div class="form-section">
				<h3>Disponibilidad</h3>
				<p class="section-description">Marca los horarios en los que estás disponible:</p>
				
				<div class="availability-actions">
					<button type="button" class="action-btn primary" on:click={markAllAvailable}>
						📅 Disponible todos los días
					</button>
					<button type="button" class="action-btn secondary" on:click={markWeekdaysAvailable}>
						💼 Solo días laborables
					</button>
					<button type="button" class="action-btn clear" on:click={clearAllAvailability}>
						🗑️ Limpiar todo
					</button>
				</div>
				
				<div class="availability-grid">
					<div class="availability-header">
						<div class="day-header">Día</div>
						<div class="time-header">
							<span>Mañana</span>
							<small>7:00 - 12:00</small>
						</div>
						<div class="time-header">
							<span>Tarde</span>
							<small>12:00 - 17:00</small>
						</div>
						<div class="time-header">
							<span>Noche</span>
							<small>17:00 - 21:00</small>
						</div>
					</div>
					
					{#each Object.entries(formData.availability) as [day, times]}
						<div class="availability-row">
							<div class="day-label">
								{day === 'monday' ? 'Lunes' : 
								day === 'tuesday' ? 'Martes' : 
								day === 'wednesday' ? 'Miércoles' : 
								day === 'thursday' ? 'Jueves' : 
								day === 'friday' ? 'Viernes' : 
								day === 'saturday' ? 'Sábado' : 'Domingo'}
							</div>
							{#each Object.entries(times) as [time, available]}
								<label class="time-checkbox" for="time-{day}-{time}">
									<input
										type="checkbox"
										id="time-{day}-{time}"
										checked={available}
										on:change={() => toggleAvailability(day, time)}
									/>
									<span class="checkmark"></span>
								</label>
							{/each}
						</div>
					{/each}
				</div>
			</div>

			<button type="submit" disabled={isSubmitting} class="submit-btn">
				{isSubmitting ? 'Enviando aplicación...' : 'Enviar aplicación'}
			</button>
		</form>

		{#if submitMessage}
			<div class="success-message">
				{submitMessage}
			</div>
		{/if}

		{#if submitError}
			<div class="error-message">
				{submitError}
			</div>
		{/if}
	</div>
</div>

<style>
	:global(:root) {
		--color-primary: #0C3B2E;
		--color-primary-hover: #0a2f25;
		--color-primary-light: #6D9773;
		--color-primary-light-hover: #5d8163;
		--color-accent: #BB8A52;
		--color-accent-hover: #a67b47;
		--color-highlight: #FFBA00;
		--color-background-white: #ffffff;
		--color-text: #0C3B2E;
		--color-text-secondary: #666666;
		--color-border: #e0e0e0;
		--shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.1);
	}

	.container {
		min-height: 100vh;
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-highlight) 100%);
		padding: 4rem 1rem;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		box-sizing: border-box;
	}

	.form-container {
		background: var(--color-background-white);
		border-radius: 16px;
		padding: 3rem 2rem;
		box-shadow: var(--shadow-lg);
		max-width: 800px;
		width: 100%;
		box-sizing: border-box;
	}

	.header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.header h1 {
		color: var(--color-primary);
		font-size: 2.5rem;
		font-weight: 700;
		margin-bottom: 0.5rem;
		line-height: 1.2;
	}

	.header p {
		color: var(--color-text-secondary);
		font-size: 1.1rem;
		line-height: 1.6;
	}

	.auth-notice {
		text-align: center;
		padding: 2rem;
		background: #f8f9fa;
		border-radius: 8px;
		margin-bottom: 2rem;
	}

	.auth-notice p {
		margin-bottom: 1rem;
		color: var(--color-text);
		font-size: 1.1rem;
	}

	.auth-buttons {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.login-btn, .signup-btn {
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		text-decoration: none;
		font-weight: 600;
		transition: all 0.2s;
	}

	.login-btn {
		background: var(--color-primary);
		color: white;
	}

	.login-btn:hover {
		background: var(--color-primary-hover);
	}

	.signup-btn {
		background: var(--color-highlight);
		color: var(--color-primary);
		border: 2px solid var(--color-primary);
	}

	.signup-btn:hover {
		background: var(--color-primary);
		color: white;
	}

	.provider-form {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.form-section {
		border: 1px solid var(--color-border);
		border-radius: 12px;
		padding: 1.5rem;
		background: #fafafa;
	}

	.form-section h3 {
		color: var(--color-primary);
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 1rem;
	}

	.section-description {
		color: var(--color-text-secondary);
		font-size: 0.9rem;
		margin-bottom: 1rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.form-group label {
		font-weight: 600;
		color: var(--color-text);
		font-size: 1rem;
	}

	.form-group input,
	.form-group select,
	.form-group textarea {
		padding: 0.75rem 1rem;
		border: 2px solid var(--color-border);
		border-radius: 8px;
		font-size: 1rem;
		transition: border-color 0.2s;
	}

	.form-group input:focus,
	.form-group select:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: var(--color-primary);
	}

	.loading-categories {
		text-align: center;
		padding: 2rem;
		color: var(--color-text-secondary);
	}

	.categories-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;
	}

	.category-checkbox {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		padding: 1rem;
		border: 2px solid var(--color-border);
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.2s;
		background: white;
	}

	.category-checkbox:hover {
		border-color: var(--color-primary);
		background: #f8f9ff;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.category-checkbox input[type="checkbox"] {
		width: 20px;
		height: 20px;
		margin-top: 0.25rem;
		accent-color: var(--color-primary);
	}

	.category-content {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		flex: 1;
	}

	.category-label {
		font-weight: 600;
		color: var(--color-text);
		font-size: 1rem;
	}

	.category-description {
		font-size: 0.85rem;
		color: var(--color-text-secondary);
		line-height: 1.4;
	}

	.availability-actions {
		display: flex;
		gap: 1rem;
		margin-bottom: 1rem;
		flex-wrap: wrap;
	}

	.action-btn {
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		border: none;
		font-weight: 600;
		transition: all 0.2s;
		cursor: pointer;
		flex: 1;
		min-width: 0;
		white-space: nowrap;
	}

	.primary {
		background: var(--color-primary);
		color: white;
	}

	.primary:hover {
		background: var(--color-primary-hover);
	}

	.secondary {
		background: var(--color-primary-light);
		color: white;
	}

	.secondary:hover {
		background: var(--color-primary-light-hover);
	}

	.clear {
		background: var(--color-accent);
		color: white;
	}

	.clear:hover {
		background: var(--color-accent-hover);
	}

	.availability-grid {
		border: 1px solid var(--color-border);
		border-radius: 12px;
		overflow: hidden;
		background: white;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.availability-header {
		display: grid;
		grid-template-columns: 120px 1fr 1fr 1fr;
		background: var(--color-primary);
		color: white;
		font-weight: 600;
	}

	.availability-header > div {
		padding: 1rem 0.75rem;
		text-align: center;
		border-right: 1px solid rgba(255, 255, 255, 0.2);
	}

	.availability-header > div:last-child {
		border-right: none;
	}

	.day-header {
		font-size: 1.1rem;
	}

	.time-header {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.time-header span {
		font-size: 1rem;
	}

	.time-header small {
		font-size: 0.75rem;
		opacity: 0.9;
		font-weight: 400;
	}

	.availability-row {
		display: grid;
		grid-template-columns: 120px 1fr 1fr 1fr;
		border-bottom: 1px solid var(--color-border);
		transition: background-color 0.2s;
	}

	.availability-row:hover {
		background: #f8f9ff;
	}

	.availability-row:last-child {
		border-bottom: none;
	}

	.day-label {
		padding: 1rem 0.75rem;
		font-weight: 600;
		background: #f8f9fa;
		display: flex;
		align-items: center;
		justify-content: center;
		border-right: 1px solid var(--color-border);
		color: var(--color-text);
	}

	.time-checkbox {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem 0.75rem;
		cursor: pointer;
		transition: background-color 0.2s;
		border-right: 1px solid var(--color-border);
		position: relative;
	}

	.time-checkbox:last-child {
		border-right: none;
	}

	.time-checkbox:hover {
		background: #f0f8ff;
	}

	.time-checkbox input[type="checkbox"] {
		width: 24px;
		height: 24px;
		accent-color: var(--color-primary);
		cursor: pointer;
	}

	.checkmark {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 24px;
		height: 24px;
		background: var(--color-primary);
		border-radius: 4px;
		opacity: 0;
		transition: opacity 0.2s;
		pointer-events: none;
	}

	.time-checkbox input[type="checkbox"]:checked + .checkmark {
		opacity: 1;
	}

	.submit-btn {
		background: var(--color-primary);
		color: white;
		border: none;
		padding: 1rem 2rem;
		border-radius: 8px;
		font-size: 1.1rem;
		font-weight: 600;
		cursor: pointer;
		transition: background-color 0.2s;
		margin-top: 1rem;
	}

	.submit-btn:hover:not(:disabled) {
		background: var(--color-primary-hover);
	}

	.submit-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.success-message {
		background: #d4edda;
		color: #155724;
		padding: 1rem;
		border-radius: 8px;
		margin-top: 1rem;
		text-align: center;
		font-weight: 600;
	}

	.error-message {
		background: #f8d7da;
		color: #721c24;
		padding: 1rem;
		border-radius: 8px;
		margin-top: 1rem;
		text-align: center;
		font-weight: 600;
	}

	@media (max-width: 768px) {
		.container {
			padding: 1rem 0.5rem;
			align-items: flex-start;
		}

		.form-container {
			padding: 1.5rem 1rem;
			max-width: 100%;
			max-height: none;
			border-radius: 12px;
			margin: 1rem 0;
		}

		.header h1 {
			font-size: 2rem;
		}

		.header p {
			font-size: 1rem;
		}

		.form-section {
			padding: 1rem;
			margin-bottom: 1rem;
		}

		.form-section h3 {
			font-size: 1.1rem;
		}

		.form-group {
			margin-bottom: 1rem;
		}

		.form-row {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.form-group input,
		.form-group select,
		.form-group textarea {
			padding: 0.75rem;
			font-size: 16px; /* Evita zoom en iOS */
		}

		.categories-grid {
			grid-template-columns: 1fr;
			gap: 0.75rem;
		}

		.category-checkbox {
			padding: 0.75rem;
			flex-direction: row;
			align-items: center;
		}

		.category-label {
			font-size: 0.95rem;
		}

		.category-description {
			font-size: 0.8rem;
		}

		.availability-actions {
			flex-direction: column;
			gap: 0.5rem;
			margin-bottom: 1rem;
		}

		.action-btn {
			padding: 0.75rem 1rem;
			font-size: 0.9rem;
			width: 100%;
			text-align: center;
		}

		.availability-grid {
			border-radius: 8px;
			overflow-x: auto;
		}

		.availability-header,
		.availability-row {
			grid-template-columns: 90px 1fr 1fr 1fr;
			min-width: 400px;
		}

		.day-header,
		.day-label {
			font-size: 0.85rem;
			padding: 0.75rem 0.5rem;
		}

		.time-header {
			padding: 0.75rem 0.5rem;
		}

		.time-header span {
			font-size: 0.8rem;
		}

		.time-header small {
			font-size: 0.65rem;
		}

		.time-checkbox {
			padding: 0.75rem 0.5rem;
		}

		.time-checkbox input[type="checkbox"] {
			width: 18px;
			height: 18px;
		}

		.submit-btn {
			padding: 1rem;
			font-size: 1rem;
			width: 100%;
		}

		.auth-buttons {
			flex-direction: column;
			gap: 0.75rem;
		}

		.login-btn, .signup-btn {
			padding: 0.75rem 1rem;
			width: 100%;
			text-align: center;
		}
	}

	@media (max-width: 480px) {
		.container {
			padding: 0.5rem;
		}

		.form-container {
			padding: 1rem 0.75rem;
		}

		.header h1 {
			font-size: 1.75rem;
		}

		.form-section {
			padding: 0.75rem;
		}

		.availability-header,
		.availability-row {
			grid-template-columns: 80px 1fr 1fr 1fr;
			min-width: 350px;
		}

		.day-header,
		.day-label {
			font-size: 0.8rem;
			padding: 0.5rem 0.25rem;
		}

		.time-header {
			padding: 0.5rem 0.25rem;
		}

		.time-header span {
			font-size: 0.75rem;
		}

		.time-header small {
			font-size: 0.6rem;
		}

		.time-checkbox {
			padding: 0.5rem 0.25rem;
		}

		.time-checkbox input[type="checkbox"] {
			width: 16px;
			height: 16px;
		}
	}

	@media (min-width: 769px) {
		.container {
			padding: 2rem 1rem;
		}

		.form-container {
			max-width: 800px;
			padding: 3rem 2rem;
		}

		.availability-actions {
			flex-direction: row;
			gap: 1rem;
		}

		.action-btn {
			flex: 1;
		}

		.categories-grid {
			grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		}
	}
</style> 