<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';

	export let data: any;
	let { session, user } = data;
	$: ({ session, user } = data);

	let providerProfile: any = null;
	let bookings: any[] = [];
	let loading = true;

	let earnings = {
		total: 0,
		thisMonth: 0,
		lastMonth: 0,
		pending: 0
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

			// Cargar reservas del proveedor
			const { data: bkgs, error: bkgsError } = await supabase
				.from('bookings')
				.select('*')
				.eq('provider_profile_id', profile.id);

			if (bkgsError) throw bkgsError;
			bookings = bkgs || [];

			// Calcular ganancias
			calculateEarnings();

		} catch (error) {
			console.error('Error loading data:', error);
		} finally {
			loading = false;
		}
	}

	function calculateEarnings() {
		const now = new Date();
		const thisMonth = now.getMonth();
		const thisYear = now.getFullYear();

		earnings.total = bookings.reduce((sum, booking) => {
			if (booking.status === 'completed' || booking.status === 'payment_succeeded') {
				return sum + (booking.total_price || 0);
			}
			return sum;
		}, 0);

		earnings.thisMonth = bookings.reduce((sum, booking) => {
			const bookingDate = new Date(booking.start_time);
			if (bookingDate.getMonth() === thisMonth && 
				bookingDate.getFullYear() === thisYear &&
				(booking.status === 'completed' || booking.status === 'payment_succeeded')) {
				return sum + (booking.total_price || 0);
			}
			return sum;
		}, 0);

		earnings.lastMonth = bookings.reduce((sum, booking) => {
			const bookingDate = new Date(booking.start_time);
			const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
			const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
			
			if (bookingDate.getMonth() === lastMonth && 
				bookingDate.getFullYear() === lastMonthYear &&
				(booking.status === 'completed' || booking.status === 'payment_succeeded')) {
				return sum + (booking.total_price || 0);
			}
			return sum;
		}, 0);

		earnings.pending = bookings.reduce((sum, booking) => {
			if (booking.status === 'confirmed') {
				return sum + (booking.total_price || 0);
			}
			return sum;
		}, 0);
	}

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('es-NI', {
			style: 'currency',
			currency: 'NIO'
		}).format(amount);
	}

	function getMonthName(monthOffset: number): string {
		const months = [
			'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
			'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
		];
		const now = new Date();
		const targetMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
		return months[targetMonth.getMonth()];
	}
</script>

<svelte:head>
	<title>Ganancias - Panel Proveedor | Domify</title>
</svelte:head>

{#if loading}
	<div class="loading-container">
		<div class="loading-spinner"></div>
		<p>Cargando ganancias...</p>
	</div>
{:else}
	<div class="earnings-page">
		<header class="page-header">
			<h1>Ganancias</h1>
			<p>Revisa tus ingresos y estadísticas financieras</p>
		</header>

		<div class="earnings-content">
			<!-- Resumen de Ganancias -->
			<section class="earnings-summary">
				<h2>Resumen de Ganancias</h2>
				<div class="earnings-grid">
					<div class="earnings-card">
						<div class="earnings-icon">💰</div>
						<div class="earnings-info">
							<h3>Ganancias Totales</h3>
							<p class="earnings-amount">{formatCurrency(earnings.total)}</p>
						</div>
					</div>

					<div class="earnings-card">
						<div class="earnings-icon">📅</div>
						<div class="earnings-info">
							<h3>Este Mes</h3>
							<p class="earnings-amount">{formatCurrency(earnings.thisMonth)}</p>
						</div>
					</div>

					<div class="earnings-card">
						<div class="earnings-icon">📊</div>
						<div class="earnings-info">
							<h3>Mes Anterior</h3>
							<p class="earnings-amount">{formatCurrency(earnings.lastMonth)}</p>
						</div>
					</div>

					<div class="earnings-card">
						<div class="earnings-icon">⏳</div>
						<div class="earnings-info">
							<h3>Pendiente</h3>
							<p class="earnings-amount">{formatCurrency(earnings.pending)}</p>
						</div>
					</div>
				</div>
			</section>

			<!-- Estadísticas Adicionales -->
			<section class="earnings-stats">
				<h2>Estadísticas</h2>
				<div class="stats-grid">
					<div class="stat-card">
						<h3>Total de Reservas</h3>
						<p class="stat-number">{bookings.length}</p>
					</div>

					<div class="stat-card">
						<h3>Reservas Completadas</h3>
						<p class="stat-number">
							{bookings.filter(b => b.status === 'completed' || b.status === 'payment_succeeded').length}
						</p>
					</div>

					<div class="stat-card">
						<h3>Reservas Pendientes</h3>
						<p class="stat-number">
							{bookings.filter(b => b.status === 'confirmed').length}
						</p>
					</div>

					<div class="stat-card">
						<h3>Promedio por Reserva</h3>
						<p class="stat-number">
							{bookings.length > 0 ? formatCurrency(earnings.total / bookings.length) : formatCurrency(0)}
						</p>
					</div>
				</div>
			</section>

			<!-- Información Adicional -->
			<section class="earnings-info">
				<div class="info-card">
					<h3>💡 Información Importante</h3>
					<ul>
						<li>Las ganancias se calculan solo de reservas completadas y pagadas</li>
						<li>Los pagos pendientes se muestran en la sección "Pendiente"</li>
						<li>Las estadísticas se actualizan en tiempo real</li>
						<li>Para más detalles, contacta al soporte</li>
					</ul>
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

	.earnings-page {
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

	.earnings-content {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-3xl);
	}

	.earnings-summary,
	.earnings-stats,
	.earnings-info {
		background: var(--color-background-white);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-2xl);
		box-shadow: var(--shadow-sm);
	}

	.earnings-summary h2,
	.earnings-stats h2 {
		margin: 0 0 var(--spacing-lg) 0;
		color: var(--color-text);
		font-size: var(--font-size-xl);
		font-weight: 600;
	}

	.earnings-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: var(--spacing-lg);
	}

	.earnings-card {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
		padding: var(--spacing-lg);
		border: 1px solid var(--color-border-light, rgba(0, 0, 0, 0.1));
		border-radius: var(--border-radius-md);
		transition: all var(--transition-fast);
	}

	.earnings-card:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
		border-color: var(--color-primary);
	}

	.earnings-icon {
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

	.earnings-info h3 {
		margin: 0 0 var(--spacing-xs) 0;
		color: var(--color-text);
		font-size: var(--font-size-base);
		font-weight: 500;
	}

	.earnings-amount {
		margin: 0;
		color: var(--color-primary);
		font-size: var(--font-size-xl);
		font-weight: 700;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--spacing-lg);
	}

	.stat-card {
		text-align: center;
		padding: var(--spacing-lg);
		border: 1px solid var(--color-border-light, rgba(0, 0, 0, 0.1));
		border-radius: var(--border-radius-md);
		transition: all var(--transition-fast);
	}

	.stat-card:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
		border-color: var(--color-primary);
	}

	.stat-card h3 {
		margin: 0 0 var(--spacing-sm) 0;
		color: var(--color-text);
		font-size: var(--font-size-base);
		font-weight: 500;
	}

	.stat-number {
		margin: 0;
		color: var(--color-primary);
		font-size: var(--font-size-2xl);
		font-weight: 700;
	}

	.info-card {
		background: var(--color-background);
		border: 1px solid var(--color-primary-light);
		border-radius: var(--border-radius-md);
		padding: var(--spacing-lg);
	}

	.info-card h3 {
		margin: 0 0 var(--spacing-md) 0;
		color: var(--color-text);
		font-size: var(--font-size-lg);
		font-weight: 600;
	}

	.info-card ul {
		margin: 0;
		padding-left: var(--spacing-lg);
		color: var(--color-text-light);
		font-size: var(--font-size-base);
		line-height: 1.6;
	}

	.info-card li {
		margin-bottom: var(--spacing-xs);
	}

	.info-card li:last-child {
		margin-bottom: 0;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.earnings-summary,
		.earnings-stats,
		.earnings-info {
			padding: var(--spacing-lg);
		}

		.earnings-grid {
			grid-template-columns: 1fr;
		}

		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.earnings-card {
			flex-direction: column;
			text-align: center;
			gap: var(--spacing-md);
		}
	}
</style> 