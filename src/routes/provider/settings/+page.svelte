<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';

	export let data: any;
	let { session, user } = data;
	$: ({ session, user } = data);

	let providerProfile: any = null;
	let loading = true;
	let saving = false;
	let message = '';
	let messageType: 'success' | 'error' = 'success';
	let showPasswordModal = false;
	let changingPassword = false;
	let passwordData = {
		currentPassword: '',
		newPassword: '',
		confirmPassword: ''
	};

	// Tipos para las configuraciones
	type WorkingHours = {
		enabled: boolean;
		start: string;
		end: string;
	};

	type Settings = {
		business: {
			workingHours: {
				[key: string]: WorkingHours;
			};
			timezone: string;
			currency: string;
		};
	};

	// Configuraciones del proveedor
	let settings: Settings = {
		business: {
			workingHours: {
				monday: { enabled: true, start: '08:00', end: '18:00' },
				tuesday: { enabled: true, start: '08:00', end: '18:00' },
				wednesday: { enabled: true, start: '08:00', end: '18:00' },
				thursday: { enabled: true, start: '08:00', end: '18:00' },
				friday: { enabled: true, start: '08:00', end: '18:00' },
				saturday: { enabled: true, start: '09:00', end: '17:00' },
				sunday: { enabled: false, start: '10:00', end: '16:00' }
			},
			timezone: 'America/Managua',
			currency: 'NIO'
		}
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

			// Cargar configuraciones guardadas si existen
			if (profile.settings) {
				settings = { ...settings, ...profile.settings };
			}

		} catch (error) {
			console.error('Error loading data:', error);
			showMessage('Error al cargar la configuración', 'error');
		} finally {
			loading = false;
		}
	}

	async function saveSettings() {
		saving = true;
		try {
			const { error } = await supabase
				.from('provider_profiles')
				.update({ 
					settings: settings,
					updated_at: new Date().toISOString()
				})
				.eq('id', providerProfile.id);

			if (error) throw error;
			showMessage('Configuración guardada exitosamente', 'success');
		} catch (error: any) {
			console.error('Error saving settings:', error);
			showMessage(`Error al guardar: ${error.message}`, 'error');
		} finally {
			saving = false;
		}
	}

	function showMessage(msg: string, type: 'success' | 'error') {
		message = msg;
		messageType = type;
		setTimeout(() => {
			message = '';
		}, 5000);
	}

	function toggleSetting(category: keyof Settings, setting: string) {
		const categorySettings = settings[category] as any;
		if (categorySettings && typeof categorySettings[setting] === 'boolean') {
			categorySettings[setting] = !categorySettings[setting];
		}
	}

	function updateWorkingHours(day: string, field: keyof WorkingHours, value: any) {
		const dayHours = settings.business.workingHours[day];
		if (dayHours && field in dayHours) {
			(dayHours as any)[field] = value;
		}
	}

	async function changePassword() {
		if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
			showMessage('Por favor completa todos los campos', 'error');
			return;
		}

		if (passwordData.newPassword !== passwordData.confirmPassword) {
			showMessage('Las contraseñas nuevas no coinciden', 'error');
			return;
		}

		if (passwordData.newPassword.length < 6) {
			showMessage('La nueva contraseña debe tener al menos 6 caracteres', 'error');
			return;
		}

		changingPassword = true;
		try {
			const { error } = await supabase.auth.updateUser({
				password: passwordData.newPassword
			});

			if (error) throw error;

			showMessage('Contraseña cambiada exitosamente', 'success');
			showPasswordModal = false;
			resetPasswordForm();
		} catch (error: any) {
			console.error('Error changing password:', error);
			showMessage(`Error al cambiar contraseña: ${error.message}`, 'error');
		} finally {
			changingPassword = false;
		}
	}

	function resetPasswordForm() {
		passwordData = {
			currentPassword: '',
			newPassword: '',
			confirmPassword: ''
		};
	}
</script>

<svelte:head>
	<title>Configuración - Panel Proveedor | Domify</title>
</svelte:head>

{#if loading}
	<div class="loading-container">
		<div class="loading-spinner"></div>
		<p>Cargando configuración...</p>
	</div>
{:else}
	<div class="settings-page">
		<header class="page-header">
			<div class="header-content">
				<div class="header-text">
					<h1>⚙️ Configuración</h1>
					<p>Gestiona tus preferencias y configuraciones del negocio</p>
				</div>
				<button class="btn btn-primary" on:click={saveSettings} disabled={saving}>
					{#if saving}
						<span class="loading-dots">Guardando...</span>
					{:else}
						💾 Guardar Cambios
					{/if}
				</button>
			</div>
		</header>

		{#if message}
			<div class="message {messageType}">
				<span class="message-icon">{messageType === 'success' ? '✅' : '❌'}</span>
				{message}
			</div>
		{/if}

		<div class="settings-content">




			<!-- Horarios de Trabajo -->
			<section class="settings-section">
				<div class="section-header">
					<h2>🕐 Horarios de Trabajo</h2>
					<p>Define tus horarios disponibles para recibir reservas</p>
				</div>
				<div class="working-hours">
					{#each Object.entries(settings.business.workingHours) as [day, hours]}
						{@const dayNames: Record<string, string> = {
							monday: 'Lunes',
							tuesday: 'Martes', 
							wednesday: 'Miércoles',
							thursday: 'Jueves',
							friday: 'Viernes',
							saturday: 'Sábado',
							sunday: 'Domingo'
						}}
						<div class="day-schedule">
							<div class="day-header">
								<label class="day-toggle" for="day-{day}">
									<input id="day-{day}" type="checkbox" bind:checked={hours.enabled} />
									<span class="day-name">{dayNames[day]}</span>
								</label>
							</div>
							{#if hours.enabled}
															<div class="time-inputs">
								<div class="time-input">
									<label for="start-{day}">Inicio:</label>
									<input id="start-{day}" type="time" bind:value={hours.start} />
								</div>
								<div class="time-input">
									<label for="end-{day}">Fin:</label>
									<input id="end-{day}" type="time" bind:value={hours.end} />
								</div>
							</div>
							{/if}
						</div>
					{/each}
				</div>
			</section>

			

			<!-- Acciones de Cuenta -->
			<section class="settings-section">
				<div class="section-header">
					<h2>⚡ Acciones de Cuenta</h2>
					<p>Gestiona tu cuenta y datos</p>
				</div>
				<div class="account-actions">
					<button class="btn btn-secondary" on:click={() => showPasswordModal = true}>
						🔑 Cambiar Contraseña
					</button>
					<button class="btn btn-secondary">
						📊 Exportar Datos
					</button>
					<button class="btn btn-secondary">
						📱 Conectar WhatsApp
					</button>
					<button class="btn btn-danger">
						🚫 Desactivar Cuenta
					</button>
				</div>
			</section>
		</div>
	</div>

	<!-- Modal para cambiar contraseña -->
	{#if showPasswordModal}
		<div 
			class="modal-overlay" 
			on:click={() => showPasswordModal = false} 
			role="button" 
			tabindex="0" 
			on:keydown={(e) => {
				if (e.key === 'Escape' || e.key === 'Enter') {
					showPasswordModal = false;
				}
			}}
			aria-label="Cerrar modal de cambio de contraseña"
		>
			<div class="modal-content" on:click|stopPropagation>
				<div class="modal-header">
					<h2>🔑 Cambiar Contraseña</h2>
					<button class="modal-close" on:click={() => showPasswordModal = false}>✕</button>
				</div>

				<form on:submit|preventDefault={changePassword} class="password-form">
					<div class="form-group">
						<label for="current-password">
							Contraseña Actual
							<span class="required">*</span>
						</label>
						<input
							id="current-password"
							type="password"
							bind:value={passwordData.currentPassword}
							required
							placeholder="Ingresa tu contraseña actual"
						/>
					</div>

					<div class="form-group">
						<label for="new-password">
							Nueva Contraseña
							<span class="required">*</span>
						</label>
						<input
							id="new-password"
							type="password"
							bind:value={passwordData.newPassword}
							required
							placeholder="Mínimo 6 caracteres"
							minlength="6"
						/>
					</div>

					<div class="form-group">
						<label for="confirm-password">
							Confirmar Nueva Contraseña
							<span class="required">*</span>
						</label>
						<input
							id="confirm-password"
							type="password"
							bind:value={passwordData.confirmPassword}
							required
							placeholder="Repite la nueva contraseña"
							minlength="6"
						/>
					</div>

					<div class="modal-actions">
						<button type="button" class="btn btn-secondary" on:click={() => showPasswordModal = false}>
							Cancelar
						</button>
						<button type="submit" class="btn btn-primary" disabled={changingPassword}>
							{#if changingPassword}
								<span class="loading-dots">Cambiando...</span>
							{:else}
								💾 Cambiar Contraseña
							{/if}
						</button>
					</div>
				</form>
			</div>
		</div>
	{/if}
{/if}

<style>
	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 50vh;
		gap: 1rem;
	}

	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 4px solid #e2e8f0;
		border-top: 4px solid #3b82f6;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.settings-page {
		max-width: 900px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	.page-header {
		margin-bottom: 2rem;
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.header-text h1 {
		margin: 0 0 0.5rem 0;
		color: #1f2937;
		font-size: 2rem;
		font-weight: 700;
	}

	.header-text p {
		margin: 0;
		color: #6b7280;
		font-size: 1.125rem;
	}

	.message {
		padding: 1rem 1.5rem;
		border-radius: 0.5rem;
		margin-bottom: 1.5rem;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-weight: 500;
	}

	.message.success {
		background: #d1fae5;
		color: #065f46;
		border: 1px solid #a7f3d0;
	}

	.message.error {
		background: #fee2e2;
		color: #991b1b;
		border: 1px solid #fca5a5;
	}

	.message-icon {
		font-size: 1.25rem;
	}

	.settings-content {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.settings-section {
		background: white;
		border-radius: 1rem;
		padding: 2rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		border: 1px solid #e5e7eb;
	}

	.section-header {
		margin-bottom: 1.5rem;
	}

	.section-header h2 {
		margin: 0 0 0.5rem 0;
		color: #1f2937;
		font-size: 1.5rem;
		font-weight: 600;
	}

	.section-header p {
		margin: 0;
		color: #6b7280;
		font-size: 1rem;
	}

	.settings-grid {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.setting-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.25rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.75rem;
		transition: all 0.2s ease;
		background: #fafafa;
	}

	.setting-item:hover {
		border-color: #3b82f6;
		background: #f8fafc;
		transform: translateY(-1px);
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
	}

	.setting-info {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex: 1;
	}

	.setting-icon {
		font-size: 1.5rem;
		width: 2.5rem;
		height: 2.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #e0e7ff;
		border-radius: 0.5rem;
		color: #3730a3;
	}



	.working-hours {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.day-schedule {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.75rem;
		background: #fafafa;
	}

	.day-header {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.day-toggle {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		cursor: pointer;
	}

	.day-toggle input[type="checkbox"] {
		width: 1.25rem;
		height: 1.25rem;
		accent-color: #3b82f6;
	}

	.day-name {
		font-weight: 600;
		color: #1f2937;
		min-width: 80px;
	}

	.time-inputs {
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	.time-input {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.time-input label {
		font-size: 0.875rem;
		color: #6b7280;
		font-weight: 500;
	}

	.time-input input {
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		font-size: 0.875rem;
	}



	.account-actions {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
	}

	.btn {
		padding: 0.875rem 1.5rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 600;
		text-decoration: none;
		transition: all 0.2s ease;
		border: none;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		min-height: 44px;
	}

	.btn-primary {
		background: #3b82f6;
		color: white;
		box-shadow: 0 1px 3px rgba(59, 130, 246, 0.3);
	}

	.btn-primary:hover:not(:disabled) {
		background: #2563eb;
		transform: translateY(-1px);
		box-shadow: 0 4px 6px rgba(59, 130, 246, 0.4);
	}

	.btn-primary:disabled {
		background: #93c5fd;
		cursor: not-allowed;
		transform: none;
		box-shadow: none;
	}

	.btn-secondary {
		background: white;
		color: #64748b;
		border: 1px solid #e2e8f0;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.btn-secondary:hover {
		background: #f8fafc;
		color: #334155;
		border-color: #cbd5e1;
		transform: translateY(-1px);
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
	}

	.btn-danger {
		background: #fee2e2;
		color: #991b1b;
		border: 1px solid #ef4444;
		box-shadow: 0 1px 3px rgba(239, 68, 68, 0.3);
	}

	.btn-danger:hover {
		background: #ef4444;
		color: white;
		transform: translateY(-1px);
		box-shadow: 0 4px 6px rgba(239, 68, 68, 0.4);
	}

	.loading-dots {
		display: inline-block;
	}

	.loading-dots::after {
		content: '';
		animation: dots 1.5s steps(5, end) infinite;
	}

	@keyframes dots {
		0%, 20% { content: ''; }
		40% { content: '.'; }
		60% { content: '..'; }
		80%, 100% { content: '...'; }
	}

	.password-form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		padding: 1.5rem;
	}

	.password-form .form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.password-form label {
		font-weight: 600;
		color: #374151;
		font-size: 0.875rem;
	}

	.password-form input {
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		transition: border-color 0.2s ease;
	}

	.password-form input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.required {
		color: #ef4444;
		margin-left: 0.25rem;
	}

	/* Estilos específicos para el modal de contraseña */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		backdrop-filter: blur(4px);
	}

	.modal-content {
		background: white;
		border-radius: 1rem;
		padding: 0;
		max-width: 500px;
		width: 90%;
		max-height: 90vh;
		overflow-y: auto;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
		animation: modalSlideIn 0.3s ease-out;
	}

	@keyframes modalSlideIn {
		from {
			opacity: 0;
			transform: translateY(-20px) scale(0.95);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.5rem 1.5rem 1rem 1.5rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.modal-header h2 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: #1f2937;
	}

	.modal-close {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 0.5rem;
		color: #6b7280;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
	}

	.modal-close:hover {
		background-color: #f3f4f6;
		color: #374151;
	}

	.modal-actions {
		display: flex;
		gap: 1rem;
		padding: 1.5rem;
		border-top: 1px solid #e5e7eb;
		justify-content: flex-end;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.settings-page {
			padding: 0 0.5rem;
		}

		.header-content {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}

		.settings-section {
			padding: 1.5rem;
		}

		.setting-item {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}

		.setting-info {
			width: 100%;
		}

		.day-schedule {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}

		.time-inputs {
			width: 100%;
			justify-content: space-between;
		}

		.account-actions {
			grid-template-columns: 1fr;
		}
	}
</style> 