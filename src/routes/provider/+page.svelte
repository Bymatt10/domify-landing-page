<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';
	import { page } from '$app/stores';

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

{#if !user}
	<div class="flex items-center justify-center min-h-[60vh]">
		<div class="text-center">
			<h2 class="text-2xl font-bold text-gray-900">Acceso no autorizado</h2>
			<p class="mt-2 text-gray-600">Por favor inicia sesión para acceder a tu panel de proveedor.</p>
			<a href="/auth/login" class="mt-4 inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
				Iniciar Sesión
			</a>
		</div>
	</div>
{:else}
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<!-- Encabezado con mensaje de bienvenida y perfil -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
			<div class="flex items-center gap-6">
				<div class="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center text-3xl text-white font-bold">
					{#if user?.user_metadata?.first_name}
						{user.user_metadata.first_name[0].toUpperCase()}
					{:else}
						P
					{/if}
					</div>
				<div>
					<h1 class="text-2xl font-bold text-gray-900">
						¡Bienvenido de vuelta, {user?.user_metadata?.first_name || 'Proveedor'}!
					</h1>
					<p class="text-gray-600 mt-1">Gestiona tus servicios y reservas desde aquí</p>
				</div>
					</div>
				</div>

		<!-- Tarjetas de estadísticas principales -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
			<!-- Total Reservas -->
			<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-gray-600">Total Reservas</p>
						<h3 class="text-2xl font-bold text-gray-900 mt-1">{stats.totalBookings}</h3>
					</div>
					<div class="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
						<svg class="w-6 h-6 text-primary-600" viewBox="0 0 24 24" fill="none">
							<path d="M8 7V3m8 4V3M3 21h18M3 10h18M4 3h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
						</svg>
					</div>
				</div>
				<div class="mt-4">
					<a href="/provider/bookings" class="text-sm text-primary-600 hover:text-primary-700 font-medium">
						Ver todas las reservas →
					</a>
					</div>
				</div>

			<!-- Pendientes -->
			<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-gray-600">Pendientes</p>
						<h3 class="text-2xl font-bold text-gray-900 mt-1">{stats.pendingBookings}</h3>
					</div>
					<div class="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center">
						<svg class="w-6 h-6 text-yellow-600" viewBox="0 0 24 24" fill="none">
							<path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
						</svg>
					</div>
				</div>
				<div class="mt-4">
					<a href="/provider/bookings?status=pending" class="text-sm text-primary-600 hover:text-primary-700 font-medium">
						Ver reservas pendientes →
					</a>
					</div>
				</div>

			<!-- Completadas -->
			<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-gray-600">Completadas</p>
						<h3 class="text-2xl font-bold text-gray-900 mt-1">{stats.completedBookings}</h3>
					</div>
					<div class="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
						<svg class="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="none">
							<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
						</svg>
					</div>
				</div>
				<div class="mt-4">
					<a href="/provider/bookings?status=completed" class="text-sm text-primary-600 hover:text-primary-700 font-medium">
						Ver completadas →
					</a>
					</div>
				</div>

			<!-- Calificación -->
			<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-gray-600">Calificación</p>
						<h3 class="text-2xl font-bold text-gray-900 mt-1">{stats.averageRating.toFixed(1)}</h3>
					</div>
					<div class="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
						<svg class="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none">
							<path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" stroke="currentColor" stroke-width="2"/>
							<path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" stroke-width="2"/>
						</svg>
					</div>
				</div>
				<div class="mt-4">
					<a href="/provider/reviews" class="text-sm text-primary-600 hover:text-primary-700 font-medium">
						Ver reseñas →
					</a>
				</div>
			</div>
		</div>

		<!-- Acciones Rápidas -->
		<h2 class="text-xl font-bold text-gray-900 mb-4">Acciones Rápidas</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
			<!-- Gestionar Servicios -->
			<a href="/provider/services" class="group">
				<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:scale-105 h-full">
					<div class="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
						<svg class="w-6 h-6 text-primary-600" viewBox="0 0 24 24" fill="none">
							<path d="M12 6v6m0 0v6m0-6h6m-6 0H6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
						</svg>
					</div>
					<h3 class="text-lg font-semibold text-gray-900 mb-2">Gestionar Servicios</h3>
					<p class="text-gray-600 text-sm">Agrega o edita los servicios que ofreces</p>
								</div>
			</a>

			<!-- Subir Portafolio -->
			<a href="/provider/portfolio" class="group">
				<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:scale-105 h-full">
					<div class="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
						<svg class="w-6 h-6 text-primary-600" viewBox="0 0 24 24" fill="none">
							<path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
						</svg>
						</div>
					<h3 class="text-lg font-semibold text-gray-900 mb-2">Subir Portafolio</h3>
					<p class="text-gray-600 text-sm">Muestra tu trabajo y experiencia</p>
						</div>
			</a>



			<!-- Configuración -->
			<a href="/provider/settings" class="group">
				<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:scale-105 h-full">
					<div class="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
						<svg class="w-6 h-6 text-primary-600" viewBox="0 0 24 24" fill="none">
							<path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" stroke="currentColor" stroke-width="2"/>
							<path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" stroke-width="2"/>
						</svg>
					</div>
					<h3 class="text-lg font-semibold text-gray-900 mb-2">Configuración</h3>
					<p class="text-gray-600 text-sm">Ajusta tus preferencias</p>
				</div>
			</a>
			</div>

		<!-- Reservas Recientes -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-xl font-bold text-gray-900">Reservas Recientes</h2>
				<a href="/provider/bookings" class="text-sm text-primary-600 hover:text-primary-700 font-medium">
					Ver Todas →
				</a>
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
				<div class="text-center py-12">
					<div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<svg class="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none">
							<path d="M8 7V3m8 4V3M3 21h18M3 10h18M4 3h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
						</svg>
					</div>
					<h3 class="text-lg font-medium text-gray-900 mb-2">No hay reservas recientes</h3>
					<p class="text-gray-600">Cuando recibas reservas, aparecerán aquí.</p>
				</div>
			{/if}
		</div>

		<!-- Guía Rápida -->
		<div class="bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl shadow-lg p-6 text-white">
			<h2 class="text-xl font-bold mb-4">¿Nuevo en Domify?</h2>
			<p class="mb-6">Te ayudamos a empezar con estos pasos simples:</p>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div class="flex items-start gap-4">
					<div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
						<span class="font-bold">1</span>
					</div>
					<div>
						<h3 class="font-semibold mb-2">Completa tu Perfil</h3>
						<p class="text-white/80 text-sm">Añade una foto y descripción profesional para destacar.</p>
					</div>
				</div>
				<div class="flex items-start gap-4">
					<div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
						<span class="font-bold">2</span>
					</div>
					<div>
						<h3 class="font-semibold mb-2">Agrega tus Servicios</h3>
						<p class="text-white/80 text-sm">Define qué servicios ofreces y sus precios.</p>
					</div>
				</div>
				<div class="flex items-start gap-4">
					<div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
						<span class="font-bold">3</span>
					</div>
					<div>
						<h3 class="font-semibold mb-2">Sube tu Portafolio</h3>
						<p class="text-white/80 text-sm">Muestra ejemplos de tu trabajo para atraer clientes.</p>
					</div>
				</div>
			</div>
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