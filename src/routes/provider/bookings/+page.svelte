<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';

	export let data: any;
	let { session, user } = data;
	$: ({ session, user } = data);

	let providerProfile: any = null;
	let bookings: any[] = [];
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

			// Cargar reservas del proveedor
			const { data: bkgs, error: bkgsError } = await supabase
				.from('bookings')
				.select(`
					*,
					clients:customers!bookings_client_user_id_fkey(*)
				`)
				.eq('provider_profile_id', profile.id)
				.order('created_at', { ascending: false });

			if (bkgsError) throw bkgsError;
			bookings = bkgs || [];

		} catch (error) {
			console.error('Error loading data:', error);
		} finally {
			loading = false;
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
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
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
	<title>Reservas - Panel Proveedor | Domify</title>
</svelte:head>

{#if loading}
	<div class="loading-container">
		<div class="loading-spinner"></div>
		<p>Cargando reservas...</p>
	</div>
{:else}
	<div class="bookings-page">
		<header class="page-header">
			<h1>Reservas</h1>
			<p>Gestiona las reservas de tus clientes</p>
		</header>

		<div class="bookings-content">
			{#if bookings.length > 0}
				<div class="bookings-list">
					{#each bookings as booking}
						<div class="booking-card">
							<div class="booking-header">
								<div class="client-info">
									<h3>{booking.clients?.first_name} {booking.clients?.last_name}</h3>
									<p class="client-phone">{booking.clients?.phone_number || 'Sin teléfono'}</p>
								</div>
								<div class="booking-status">
									<span class="status-badge {getStatusBadge(booking.status).class}">
										{getStatusBadge(booking.status).text}
									</span>
								</div>
							</div>
							
							<div class="booking-details">
								<div class="detail-row">
									<span class="detail-label">Fecha:</span>
									<span class="detail-value">{formatDate(booking.start_time)}</span>
								</div>
								<div class="detail-row">
									<span class="detail-label">Duración:</span>
									<span class="detail-value">
										{Math.round((new Date(booking.end_time).getTime() - new Date(booking.start_time).getTime()) / (1000 * 60 * 60))} horas
									</span>
								</div>
								<div class="detail-row">
									<span class="detail-label">Precio:</span>
									<span class="detail-value price">{formatCurrency(booking.total_price)}</span>
								</div>
								{#if booking.notes}
									<div class="detail-row">
										<span class="detail-label">Notas:</span>
										<span class="detail-value">{booking.notes}</span>
									</div>
								{/if}
							</div>

							<div class="booking-actions">
								{#if booking.status === 'pending_confirmation'}
									<button class="btn btn-success">Confirmar</button>
									<button class="btn btn-danger">Rechazar</button>
								{:else if booking.status === 'confirmed'}
									<button class="btn btn-primary">Marcar Completada</button>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="empty-state">
					<div class="empty-icon">📅</div>
					<h3>No tienes reservas</h3>
					<p>Cuando los clientes hagan reservas, aparecerán aquí.</p>
				</div>
			{/if}
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

	.bookings-page {
		max-width: 1200px;
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

	.bookings-content {
		background: var(--color-background-white);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-2xl);
		box-shadow: var(--shadow-sm);
	}

	.bookings-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
	}

	.booking-card {
		border: 1px solid var(--color-border-light, rgba(0, 0, 0, 0.1));
		border-radius: var(--border-radius-md);
		padding: var(--spacing-lg);
		transition: all var(--transition-fast);
	}

	.booking-card:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
		border-color: var(--color-primary);
	}

	.booking-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: var(--spacing-md);
	}

	.client-info h3 {
		margin: 0 0 var(--spacing-xs) 0;
		color: var(--color-text);
		font-size: var(--font-size-lg);
		font-weight: 600;
	}

	.client-phone {
		margin: 0;
		color: var(--color-text-light);
		font-size: var(--font-size-sm);
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
		margin-bottom: var(--spacing-lg);
	}

	.detail-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-sm);
	}

	.detail-row:last-child {
		margin-bottom: 0;
	}

	.detail-label {
		font-weight: 500;
		color: var(--color-text-light);
		font-size: var(--font-size-sm);
	}

	.detail-value {
		color: var(--color-text);
		font-size: var(--font-size-sm);
	}

	.detail-value.price {
		font-weight: 700;
		color: var(--color-primary);
		font-size: var(--font-size-base);
	}

	.booking-actions {
		display: flex;
		gap: var(--spacing-sm);
		justify-content: flex-end;
	}

	.btn {
		padding: var(--spacing-xs) var(--spacing-md);
		border-radius: var(--border-radius-md);
		font-size: var(--font-size-sm);
		font-weight: 600;
		text-decoration: none;
		transition: all var(--transition-fast);
		border: none;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.btn-success {
		background: #10b981;
		color: white;
	}

	.btn-success:hover {
		background: #059669;
		transform: translateY(-1px);
	}

	.btn-danger {
		background: #ef4444;
		color: white;
	}

	.btn-danger:hover {
		background: #dc2626;
		transform: translateY(-1px);
	}

	.btn-primary {
		background: var(--color-primary);
		color: white;
	}

	.btn-primary:hover {
		background: var(--color-primary-hover);
		transform: translateY(-1px);
	}

	.empty-state {
		text-align: center;
		padding: var(--spacing-3xl) var(--spacing-lg);
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

	/* Responsive */
	@media (max-width: 768px) {
		.bookings-content {
			padding: var(--spacing-lg);
		}

		.booking-header {
			flex-direction: column;
			gap: var(--spacing-sm);
		}

		.detail-row {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--spacing-xs);
		}

		.booking-actions {
			flex-direction: column;
		}
	}
</style> 