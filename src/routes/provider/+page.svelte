<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';

	export let data: any;
	let { session, user } = data;
	$: ({ session, user } = data);

	let providerProfile: any = null;
	let stats = {
		totalBookings: 0,
		pendingBookings: 0,
		completedBookings: 0,
		totalEarnings: 0,
		averageRating: 0,
		totalReviews: 0
	};
	let recentBookings: any[] = [];
	let loading = true;

	onMount(async () => {
		await loadProviderData();
	});

	async function loadProviderData() {
		try {
			// Cargar perfil del proveedor
			const { data: profile, error: profileError } = await supabase
				.from('provider_profiles')
				.select('*')
				.eq('user_id', user.id)
				.single();

			if (profileError) throw profileError;
			providerProfile = profile;

			// Cargar estadísticas
			await loadStats();

			// Cargar reservas recientes
			await loadRecentBookings();

		} catch (error) {
			console.error('Error loading provider data:', error);
		} finally {
			loading = false;
		}
	}

	async function loadStats() {
		try {
			// Obtener todas las reservas del proveedor
			const { data: bookings, error } = await supabase
				.from('bookings')
				.select('*')
				.eq('provider_profile_id', providerProfile.id);

			if (error) throw error;

			stats.totalBookings = bookings?.length || 0;
			stats.pendingBookings = bookings?.filter(b => b.status === 'pending_confirmation').length || 0;
			stats.completedBookings = bookings?.filter(b => b.status === 'completed').length || 0;
			stats.totalEarnings = bookings?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;

			// Actualizar estadísticas del perfil
			stats.averageRating = providerProfile.average_rating || 0;
			stats.totalReviews = providerProfile.total_reviews || 0;

		} catch (error) {
			console.error('Error loading stats:', error);
		}
	}

	async function loadRecentBookings() {
		try {
			const { data: bookings, error } = await supabase
				.from('bookings')
				.select(`
					*,
					clients:customers!bookings_client_user_id_fkey(*)
				`)
				.eq('provider_profile_id', providerProfile.id)
				.order('created_at', { ascending: false })
				.limit(5);

			if (error) throw error;
			recentBookings = bookings || [];

		} catch (error) {
			console.error('Error loading recent bookings:', error);
		}
	}

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('es-NI', {
			style: 'currency',
			currency: 'NIO'
		}).format(amount);
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('es-NI', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function getStatusBadge(status: string): { text: string; class: string } {
		const statusMap: Record<string, { text: string; class: string }> = {
			'pending_confirmation': { text: 'Pendiente', class: 'pending' },
			'confirmed': { text: 'Confirmada', class: 'confirmed' },
			'completed': { text: 'Completada', class: 'completed' },
			'cancelled_by_client': { text: 'Cancelada', class: 'cancelled' },
			'cancelled_by_provider': { text: 'Cancelada', class: 'cancelled' }
		};
		return statusMap[status] || { text: status, class: 'unknown' };
	}
</script>

<svelte:head>
	<title>Dashboard - Panel Proveedor | Domify</title>
</svelte:head>

{#if loading}
	<div class="loading-container">
		<div class="loading-spinner"></div>
		<p>Cargando dashboard...</p>
	</div>
{:else}
	<div class="dashboard">
		<header class="dashboard-header">
			<h1>Dashboard</h1>
			<p>Bienvenido de vuelta, {providerProfile?.business_name}</p>
		</header>

		<!-- Estadísticas -->
		<section class="stats-section">
			<h2>Resumen General</h2>
			<div class="stats-grid">
				<div class="stat-card">
					<div class="stat-icon">📅</div>
					<div class="stat-content">
						<h3>{stats.totalBookings}</h3>
						<p>Total Reservas</p>
					</div>
				</div>

				<div class="stat-card">
					<div class="stat-icon">⏳</div>
					<div class="stat-content">
						<h3>{stats.pendingBookings}</h3>
						<p>Pendientes</p>
					</div>
				</div>

				<div class="stat-card">
					<div class="stat-icon">✅</div>
					<div class="stat-content">
						<h3>{stats.completedBookings}</h3>
						<p>Completadas</p>
					</div>
				</div>

				<div class="stat-card">
					<div class="stat-icon">💰</div>
					<div class="stat-content">
						<h3>{formatCurrency(stats.totalEarnings)}</h3>
						<p>Ganancias Totales</p>
					</div>
				</div>

				<div class="stat-card">
					<div class="stat-icon">⭐</div>
					<div class="stat-content">
						<h3>{stats.averageRating.toFixed(1)}</h3>
						<p>Calificación Promedio</p>
					</div>
				</div>

				<div class="stat-card">
					<div class="stat-icon">📝</div>
					<div class="stat-content">
						<h3>{stats.totalReviews}</h3>
						<p>Reseñas</p>
					</div>
				</div>
			</div>
		</section>

		<!-- Información del Perfil -->
		<section class="profile-section">
			<h2>Información del Perfil</h2>
			<div class="profile-info">
				<div class="profile-card">
					<div class="profile-header">
						<div class="profile-avatar">
							{#if user?.user_metadata?.avatar_url}
								<img src={user.user_metadata.avatar_url} alt="Avatar" />
							{:else}
								<div class="avatar-placeholder">
									{user?.user_metadata?.first_name?.charAt(0) || user?.email?.charAt(0) || 'P'}
								</div>
							{/if}
						</div>
						<div class="profile-details">
							<h3>{providerProfile?.business_name}</h3>
							<p class="headline">{providerProfile?.headline}</p>
							<p class="location">📍 {providerProfile?.location || 'Ubicación no especificada'}</p>
						</div>
					</div>
					<div class="profile-actions">
						<a href="/provider/profile" class="btn btn-primary">Editar Perfil</a>
					</div>
				</div>
			</div>
		</section>

		<!-- Reservas Recientes -->
		<section class="recent-bookings-section">
			<div class="section-header">
				<h2>Reservas Recientes</h2>
				<a href="/provider/bookings" class="btn btn-secondary">Ver Todas</a>
			</div>
			
			{#if recentBookings.length > 0}
				<div class="bookings-list">
					{#each recentBookings as booking}
						<div class="booking-card">
							<div class="booking-header">
								<div class="client-info">
									<h4>Cliente</h4>
									<p>{booking.clients?.first_name} {booking.clients?.last_name}</p>
								</div>
								<div class="booking-status">
									<span class="status-badge {getStatusBadge(booking.status).class}">
										{getStatusBadge(booking.status).text}
									</span>
								</div>
							</div>
							<div class="booking-details">
								<div class="booking-date">
									<strong>Fecha:</strong> {formatDate(booking.start_time)}
								</div>
								<div class="booking-price">
									<strong>Precio:</strong> {formatCurrency(booking.total_price)}
								</div>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="empty-state">
					<div class="empty-icon">📅</div>
					<h3>No hay reservas recientes</h3>
					<p>Cuando recibas reservas, aparecerán aquí.</p>
				</div>
			{/if}
		</section>

		<!-- Acciones Rápidas -->
		<section class="quick-actions-section">
			<h2>Acciones Rápidas</h2>
			<div class="actions-grid">
				<a href="/provider/services" class="action-card">
					<div class="action-icon">🛠️</div>
					<h3>Gestionar Servicios</h3>
					<p>Agregar o editar tus servicios</p>
				</a>

				<a href="/provider/portfolio" class="action-card">
					<div class="action-icon">🖼️</div>
					<h3>Subir Portafolio</h3>
					<p>Mostrar tu trabajo</p>
				</a>

				<a href="/provider/documents" class="action-card">
					<div class="action-icon">📋</div>
					<h3>Documentos</h3>
					<p>Gestionar certificaciones</p>
				</a>

				<a href="/provider/settings" class="action-card">
					<div class="action-icon">⚙️</div>
					<h3>Configuración</h3>
					<p>Ajustar preferencias</p>
				</a>
			</div>
		</section>
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

	.dashboard {
		max-width: 1200px;
		margin: 0 auto;
	}

	.dashboard-header {
		margin-bottom: var(--spacing-2xl);
	}

	.dashboard-header h1 {
		margin: 0 0 var(--spacing-sm) 0;
		color: var(--color-text);
		font-size: var(--font-size-3xl);
		font-weight: 700;
	}

	.dashboard-header p {
		margin: 0;
		color: var(--color-text-light);
		font-size: var(--font-size-lg);
	}

	.stats-section {
		margin-bottom: var(--spacing-3xl);
	}

	.stats-section h2 {
		margin: 0 0 var(--spacing-lg) 0;
		color: var(--color-text);
		font-size: var(--font-size-2xl);
		font-weight: 600;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: var(--spacing-lg);
	}

	.stat-card {
		background: var(--color-background-white);
		border: 1px solid var(--color-border-light, rgba(0, 0, 0, 0.1));
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-lg);
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
		transition: all var(--transition-fast);
		box-shadow: var(--shadow-sm);
	}

	.stat-card:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}

	.stat-icon {
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

	.stat-content h3 {
		margin: 0 0 var(--spacing-xs) 0;
		font-size: var(--font-size-2xl);
		font-weight: 700;
		color: var(--color-text);
	}

	.stat-content p {
		margin: 0;
		color: var(--color-text-light);
		font-size: var(--font-size-sm);
		font-weight: 500;
	}

	.profile-section {
		margin-bottom: var(--spacing-3xl);
	}

	.profile-section h2 {
		margin: 0 0 var(--spacing-lg) 0;
		color: var(--color-text);
		font-size: var(--font-size-2xl);
		font-weight: 600;
	}

	.profile-card {
		background: var(--color-background-white);
		border: 1px solid var(--color-border-light, rgba(0, 0, 0, 0.1));
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-lg);
		display: flex;
		justify-content: space-between;
		align-items: center;
		box-shadow: var(--shadow-sm);
	}

	.profile-header {
		display: flex;
		align-items: center;
		gap: var(--spacing-lg);
	}

	.profile-avatar {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		overflow: hidden;
		flex-shrink: 0;
	}

	.profile-avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.avatar-placeholder {
		width: 100%;
		height: 100%;
		background: var(--color-primary);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--font-size-2xl);
		font-weight: 700;
	}

	.profile-details h3 {
		margin: 0 0 var(--spacing-xs) 0;
		font-size: var(--font-size-xl);
		font-weight: 600;
		color: var(--color-text);
	}

	.profile-details .headline {
		margin: 0 0 var(--spacing-xs) 0;
		color: var(--color-text-light);
		font-size: var(--font-size-base);
	}

	.profile-details .location {
		margin: 0;
		color: var(--color-text-light);
		font-size: var(--font-size-sm);
	}

	.profile-actions {
		flex-shrink: 0;
	}

	.recent-bookings-section {
		margin-bottom: var(--spacing-3xl);
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-lg);
	}

	.section-header h2 {
		margin: 0;
		color: var(--color-text);
		font-size: var(--font-size-2xl);
		font-weight: 600;
	}

	.bookings-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.booking-card {
		background: var(--color-background-white);
		border: 1px solid var(--color-border-light, rgba(0, 0, 0, 0.1));
		border-radius: var(--border-radius-md);
		padding: var(--spacing-lg);
		box-shadow: var(--shadow-sm);
	}

	.booking-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: var(--spacing-md);
	}

	.client-info h4 {
		margin: 0 0 var(--spacing-xs) 0;
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
		font-weight: 500;
	}

	.client-info p {
		margin: 0;
		font-size: var(--font-size-base);
		font-weight: 600;
		color: var(--color-text);
	}

	.status-badge {
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: var(--border-radius-full);
		font-size: var(--font-size-xs);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.status-badge.pending {
		background: #fef3c7;
		color: #92400e;
	}

	.status-badge.confirmed {
		background: #dbeafe;
		color: #1e40af;
	}

	.status-badge.completed {
		background: #d1fae5;
		color: #065f46;
	}

	.status-badge.cancelled {
		background: #fee2e2;
		color: #991b1b;
	}

	.booking-details {
		display: flex;
		gap: var(--spacing-lg);
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
	}

	.empty-state {
		text-align: center;
		padding: var(--spacing-3xl) var(--spacing-lg);
		background: var(--color-background-white);
		border: 1px solid var(--color-border-light, rgba(0, 0, 0, 0.1));
		border-radius: var(--border-radius-lg);
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
		margin: 0;
		color: var(--color-text-light);
		font-size: var(--font-size-base);
	}

	.quick-actions-section h2 {
		margin: 0 0 var(--spacing-lg) 0;
		color: var(--color-text);
		font-size: var(--font-size-2xl);
		font-weight: 600;
	}

	.actions-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: var(--spacing-lg);
	}

	.action-card {
		background: var(--color-background-white);
		border: 1px solid var(--color-border-light, rgba(0, 0, 0, 0.1));
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-lg);
		text-decoration: none;
		color: inherit;
		transition: all var(--transition-fast);
		box-shadow: var(--shadow-sm);
		text-align: center;
	}

	.action-card:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
		border-color: var(--color-primary);
	}

	.action-icon {
		font-size: var(--font-size-3xl);
		margin-bottom: var(--spacing-md);
	}

	.action-card h3 {
		margin: 0 0 var(--spacing-sm) 0;
		color: var(--color-text);
		font-size: var(--font-size-lg);
		font-weight: 600;
	}

	.action-card p {
		margin: 0;
		color: var(--color-text-light);
		font-size: var(--font-size-sm);
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
		.stats-grid {
			grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		}

		.profile-card {
			flex-direction: column;
			gap: var(--spacing-lg);
			text-align: center;
		}

		.booking-header {
			flex-direction: column;
			gap: var(--spacing-sm);
		}

		.booking-details {
			flex-direction: column;
			gap: var(--spacing-sm);
		}

		.actions-grid {
			grid-template-columns: 1fr;
		}
	}
</style> 