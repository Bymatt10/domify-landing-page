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

	// Calcular ganancias mensuales para el gráfico
	function getMonthlyEarnings(monthsBack = 6) {
		const now = new Date();
		const months: { label: string, value: number }[] = [];
		for (let i = monthsBack - 1; i >= 0; i--) {
			const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
			const label = date.toLocaleString('default', { month: 'short' });
			const year = date.getFullYear();
			const month = date.getMonth();
			const value = bookings.reduce((sum, b) => {
				const d = new Date(b.start_time);
				if (
					d.getFullYear() === year &&
					d.getMonth() === month &&
					(b.status === 'completed' || b.status === 'payment_succeeded')
				) {
					return sum + (b.total_price || 0);
				}
				return sum;
			}, 0);
			months.push({ label, value });
		}
		return months;
	}
	$: monthlyEarnings = getMonthlyEarnings(6);
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
			<div class="earnings-summary-modern">
				<div class="earnings-row">
					<div class="earnings-card-modern">
						<div class="earnings-title">Ganancias Totales</div>
						<div class="earnings-value">{formatCurrency(earnings.total)}</div>
					</div>
					<div class="earnings-card-modern">
						<div class="earnings-title">Este Mes</div>
						<div class="earnings-value">{formatCurrency(earnings.thisMonth)}</div>
					</div>
					<div class="earnings-card-modern">
						<div class="earnings-title">Mes Anterior</div>
						<div class="earnings-value">{formatCurrency(earnings.lastMonth)}</div>
					</div>
					<div class="earnings-card-modern">
						<div class="earnings-title">Pendiente</div>
						<div class="earnings-value">{formatCurrency(earnings.pending)}</div>
					</div>
				</div>
				<div class="earnings-bar-chart">
					<div class="chart-title">Ganancias últimos 6 meses</div>
					<div class="bar-chart">
						{#each monthlyEarnings as m, i}
							<div class="bar-group">
								<div class="bar" style="height: {Math.max(8, m.value / Math.max(...monthlyEarnings.map(x => x.value), 1) * 100)}px" title={formatCurrency(m.value)}></div>
								<div class="bar-label">{m.label}</div>
							</div>
						{/each}
					</div>
				</div>
			</div>

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
	body, .earnings-page {
		background: #f6f8fa;
	}
	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 50vh;
		gap: 1.5rem;
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
	.earnings-page {
		max-width: 1100px;
		margin: 2rem auto;
		padding: 0 1rem;
		background: #f6f8fa;
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
		background: #3b82f6;
		border-radius: 2px;
	}
	.page-header h1 {
		margin: 0 0 0.75rem 0;
		color: #1e293b;
		font-size: 2.5rem;
		font-weight: 700;
		letter-spacing: -0.025em;
	}
	.page-header p {
		margin: 0;
		color: #64748b;
		font-size: 1.125rem;
	}
	.earnings-content {
		display: flex;
		flex-direction: column;
		gap: 2.5rem;
	}
	.earnings-summary {
		background: #fff;
		border-radius: 1.25rem;
		padding: 2rem 1.5rem 1.5rem 1.5rem;
		margin-bottom: 1.5rem;
		box-shadow: 0 2px 12px 0 rgb(59 130 246 / 0.06);
		border: 1px solid #e2e8f0;
	}
	.earnings-summary h2 {
		color: #1e293b;
		font-size: 1.25rem;
		font-weight: 700;
		margin-bottom: 1.5rem;
	}
	.earnings-grid {
		display: flex;
		flex-wrap: nowrap;
		gap: 2.5rem;
		justify-content: center;
		align-items: stretch;
		overflow-x: auto;
		padding-left: 0.5rem;
		padding-right: 0.5rem;
	}
	.earnings-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: #f8fafc;
		border-radius: 1rem;
		box-shadow: 0 1px 4px 0 rgb(0 0 0 / 0.04);
		padding: 2rem 1.5rem;
		border: 1.5px solid #e2e8f0;
		width: 240px;
		flex: 0 0 240px;
		height: 100%;
		margin-bottom: 1.5rem;
	}
	/* Remove hover and blue border */
	.earnings-card:hover {
		box-shadow: 0 1px 4px 0 rgb(0 0 0 / 0.04);
		border-color: #e2e8f0;
	}
	.earnings-info {
		text-align: center;
	}
	.earnings-info h3 {
		margin: 0 0 0.5rem 0;
		font-size: 1.1rem;
		color: #64748b;
		font-weight: 600;
	}
	.earnings-amount {
		font-size: 2.1rem;
		font-weight: 800;
		color: #10b981;
		margin: 0;
		letter-spacing: -1px;
	}
	.earnings-card:nth-child(1) .earnings-icon { background: #fef9c3; color: #eab308; }
	.earnings-card:nth-child(2) .earnings-icon { background: #dbeafe; color: #2563eb; }
	.earnings-card:nth-child(3) .earnings-icon { background: #f3e8ff; color: #a21caf; }
	.earnings-card:nth-child(4) .earnings-icon { background: #fef2f2; color: #b91c1c; }
	.earnings-stats {
		background: #fff;
		border-radius: 1.25rem;
		padding: 2rem 1.5rem 1.5rem 1.5rem;
		box-shadow: 0 2px 12px 0 rgb(59 130 246 / 0.06);
		border: 1px solid #e2e8f0;
	}
	.earnings-stats h2 {
		color: #1e293b;
		font-size: 1.25rem;
		font-weight: 700;
		margin-bottom: 1.5rem;
	}
	.stats-grid {
		display: flex;
		gap: 1.5rem;
		flex-wrap: wrap;
		justify-content: space-between;
	}
	.stat-card {
		background: #f8fafc;
		border-radius: 1rem;
		padding: 1.25rem 1.5rem;
		box-shadow: 0 1px 4px 0 rgb(0 0 0 / 0.04);
		border: 1.5px solid #e2e8f0;
		min-width: 200px;
		flex: 1 1 200px;
		text-align: center;
	}
	.stat-card h3 {
		margin: 0 0 0.5rem 0;
		font-size: 1rem;
		color: #64748b;
		font-weight: 500;
	}
	.stat-number {
		font-size: 1.5rem;
		font-weight: 700;
		color: #3b82f6;
	}
	.earnings-info {
		margin-top: 2rem;
		background: #f1f5f9;
		border-radius: 0.75rem;
		padding: 1.5rem 1rem;
		box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.04);
		border: 1px solid #e2e8f0;
	}
	.info-card h3 {
		margin: 0 0 0.75rem 0;
		font-size: 1.1rem;
		color: #334155;
		font-weight: 600;
	}
	.info-card ul {
		margin: 0;
		padding-left: 1.25rem;
		color: #64748b;
		font-size: 1rem;
		line-height: 1.7;
	}
	@media (max-width: 1100px) {
		.earnings-grid {
			gap: 1.5rem;
		}
		.earnings-card {
			width: 220px;
			flex: 0 0 220px;
			margin-bottom: 0.5rem;
		}
	}
	.earnings-summary-modern {
		background: #fff;
		border-radius: 1.5rem;
		padding: 2.5rem 2rem 2rem 2rem;
		box-shadow: 0 2px 12px 0 rgb(59 130 246 / 0.06);
		border: 1px solid #e2e8f0;
		margin-bottom: 2.5rem;
		max-width: 1100px;
		margin-left: auto;
		margin-right: auto;
	}
	.earnings-row {
		display: flex;
		gap: 2.5rem;
		justify-content: center;
		align-items: stretch;
		margin-bottom: 2.5rem;
		flex-wrap: nowrap;
		overflow-x: auto;
	}
	.earnings-card-modern {
		background: #f8fafc;
		border-radius: 1.1rem;
		border: 1.5px solid #e2e8f0;
		padding: 2rem 1.5rem;
		width: 220px;
		min-width: 180px;
		max-width: 220px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		box-shadow: 0 1px 4px 0 rgb(0 0 0 / 0.04);
	}
	.earnings-title {
		font-size: 1.05rem;
		color: #64748b;
		font-weight: 600;
		margin-bottom: 0.7rem;
		text-align: center;
	}
	.earnings-value {
		font-size: 2.1rem;
		font-weight: 800;
		color: #10b981;
		letter-spacing: -1px;
		text-align: center;
	}
	.earnings-bar-chart {
		margin-top: 1.5rem;
		padding: 1.5rem 0 0 0;
		border-top: 1px solid #e5e7eb;
	}
	.chart-title {
		font-size: 1.1rem;
		font-weight: 600;
		color: #334155;
		margin-bottom: 1.2rem;
		text-align: center;
	}
	.bar-chart {
		display: flex;
		align-items: flex-end;
		gap: 2.2rem;
		justify-content: center;
		height: 120px;
		margin-bottom: 0.5rem;
	}
	.bar-group {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 32px;
	}
	.bar {
		width: 100%;
		background: linear-gradient(180deg, #3b82f6 0%, #60a5fa 100%);
		border-radius: 0.5rem 0.5rem 0 0;
		transition: height 0.3s;
		margin-bottom: 0.4rem;
	}
	.bar-label {
		font-size: 0.95rem;
		color: #64748b;
		margin-top: 0.2rem;
		text-align: center;
	}
	@media (max-width: 900px) {
		.earnings-row {
			gap: 1.2rem;
		}
		.earnings-card-modern {
			width: 160px;
			min-width: 120px;
			max-width: 180px;
			padding: 1.2rem 0.5rem;
		}
		.bar-chart {
			gap: 1.1rem;
		}
	}
</style> 