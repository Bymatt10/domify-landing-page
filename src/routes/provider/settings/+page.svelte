<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';

	export let data: any;
	let { session, user } = data;
	$: ({ session, user } = data);

	let providerProfile: any = null;
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

		} catch (error) {
			console.error('Error loading data:', error);
		} finally {
			loading = false;
		}
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
			<h1>Configuración</h1>
			<p>Gestiona tus preferencias y configuraciones</p>
		</header>

		<div class="settings-content">
			<!-- Configuración de Notificaciones -->
			<section class="settings-section">
				<h2>Notificaciones</h2>
				<div class="settings-grid">
					<div class="setting-item">
						<div class="setting-info">
							<h3>Notificaciones por Email</h3>
							<p>Recibe notificaciones por email sobre nuevas reservas</p>
						</div>
						<label class="toggle-switch">
							<input type="checkbox" checked />
							<span class="toggle-slider"></span>
						</label>
					</div>

					<div class="setting-item">
						<div class="setting-info">
							<h3>Notificaciones Push</h3>
							<p>Recibe notificaciones en tiempo real en tu navegador</p>
						</div>
						<label class="toggle-switch">
							<input type="checkbox" checked />
							<span class="toggle-slider"></span>
						</label>
					</div>

					<div class="setting-item">
						<div class="setting-info">
							<h3>Recordatorios de Reservas</h3>
							<p>Recibe recordatorios antes de tus reservas programadas</p>
						</div>
						<label class="toggle-switch">
							<input type="checkbox" checked />
							<span class="toggle-slider"></span>
						</label>
					</div>
				</div>
			</section>

			<!-- Configuración de Privacidad -->
			<section class="settings-section">
				<h2>Privacidad</h2>
				<div class="settings-grid">
					<div class="setting-item">
						<div class="setting-info">
							<h3>Perfil Público</h3>
							<p>Permite que los clientes vean tu perfil completo</p>
						</div>
						<label class="toggle-switch">
							<input type="checkbox" checked />
							<span class="toggle-slider"></span>
						</label>
					</div>

					<div class="setting-item">
						<div class="setting-info">
							<h3>Mostrar Teléfono</h3>
							<p>Muestra tu número de teléfono a los clientes</p>
						</div>
						<label class="toggle-switch">
							<input type="checkbox" />
							<span class="toggle-slider"></span>
						</label>
					</div>

					<div class="setting-item">
						<div class="setting-info">
							<h3>Mostrar Ubicación</h3>
							<p>Muestra tu ubicación exacta a los clientes</p>
						</div>
						<label class="toggle-switch">
							<input type="checkbox" checked />
							<span class="toggle-slider"></span>
						</label>
					</div>
				</div>
			</section>

			<!-- Configuración de Disponibilidad -->
			<section class="settings-section">
				<h2>Disponibilidad</h2>
				<div class="settings-grid">
					<div class="setting-item">
						<div class="setting-info">
							<h3>Modo Automático</h3>
							<p>Automáticamente acepta reservas según tu horario</p>
						</div>
						<label class="toggle-switch">
							<input type="checkbox" />
							<span class="toggle-slider"></span>
						</label>
					</div>

					<div class="setting-item">
						<div class="setting-info">
							<h3>Confirmación Manual</h3>
							<p>Revisa y confirma cada reserva manualmente</p>
						</div>
						<label class="toggle-switch">
							<input type="checkbox" checked />
							<span class="toggle-slider"></span>
						</label>
					</div>
				</div>
			</section>

			<!-- Información de la Cuenta -->
			<section class="settings-section">
				<h2>Información de la Cuenta</h2>
				<div class="account-info">
					<div class="info-row">
						<span class="info-label">Email:</span>
						<span class="info-value">{user?.email}</span>
					</div>
					<div class="info-row">
						<span class="info-label">ID de Usuario:</span>
						<span class="info-value">{user?.id}</span>
					</div>
					<div class="info-row">
						<span class="info-label">Rol:</span>
						<span class="info-value">{user?.user_metadata?.role || 'provider'}</span>
					</div>
					<div class="info-row">
						<span class="info-label">Miembro desde:</span>
						<span class="info-value">
							{new Date(user?.created_at).toLocaleDateString('es-NI', {
								year: 'numeric',
								month: 'long',
								day: 'numeric'
							})}
						</span>
					</div>
				</div>
			</section>

			<!-- Acciones de Cuenta -->
			<section class="settings-section">
				<h2>Acciones de Cuenta</h2>
				<div class="account-actions">
					<button class="btn btn-secondary">Cambiar Contraseña</button>
					<button class="btn btn-secondary">Exportar Datos</button>
					<button class="btn btn-danger">Desactivar Cuenta</button>
				</div>
			</section>
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

	.settings-page {
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

	.settings-content {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-3xl);
	}

	.settings-section {
		background: var(--color-background-white);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-2xl);
		box-shadow: var(--shadow-sm);
	}

	.settings-section h2 {
		margin: 0 0 var(--spacing-lg) 0;
		color: var(--color-text);
		font-size: var(--font-size-xl);
		font-weight: 600;
	}

	.settings-grid {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
	}

	.setting-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-lg);
		border: 1px solid var(--color-border-light, rgba(0, 0, 0, 0.1));
		border-radius: var(--border-radius-md);
		transition: all var(--transition-fast);
	}

	.setting-item:hover {
		border-color: var(--color-primary);
		background: var(--color-background);
	}

	.setting-info h3 {
		margin: 0 0 var(--spacing-xs) 0;
		color: var(--color-text);
		font-size: var(--font-size-base);
		font-weight: 600;
	}

	.setting-info p {
		margin: 0;
		color: var(--color-text-light);
		font-size: var(--font-size-sm);
	}

	.toggle-switch {
		position: relative;
		display: inline-block;
		width: 50px;
		height: 24px;
	}

	.toggle-switch input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	.toggle-slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #ccc;
		transition: .4s;
		border-radius: 24px;
	}

	.toggle-slider:before {
		position: absolute;
		content: "";
		height: 18px;
		width: 18px;
		left: 3px;
		bottom: 3px;
		background-color: white;
		transition: .4s;
		border-radius: 50%;
	}

	input:checked + .toggle-slider {
		background-color: var(--color-primary);
	}

	input:checked + .toggle-slider:before {
		transform: translateX(26px);
	}

	.account-info {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-md);
		background: var(--color-background);
		border-radius: var(--border-radius-md);
	}

	.info-label {
		font-weight: 500;
		color: var(--color-text);
		font-size: var(--font-size-base);
	}

	.info-value {
		color: var(--color-text-light);
		font-size: var(--font-size-base);
		font-family: monospace;
	}

	.account-actions {
		display: flex;
		gap: var(--spacing-md);
		flex-wrap: wrap;
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

	.btn-danger {
		background: #fee2e2;
		color: #991b1b;
		border: 1px solid #ef4444;
	}

	.btn-danger:hover {
		background: #ef4444;
		color: white;
		transform: translateY(-1px);
	}

	/* Responsive */
	@media (max-width: 768px) {
		.settings-section {
			padding: var(--spacing-lg);
		}

		.setting-item {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--spacing-md);
		}

		.info-row {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--spacing-xs);
		}

		.account-actions {
			flex-direction: column;
		}
	}
</style> 