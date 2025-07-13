<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';

	export let data: any;
	let { session, user } = data;
	$: ({ session, user } = data);

	let providerProfile: any = null;
	let bookings: any[] = [];
	let services: any[] = [];
	let clients: any[] = [];
	let loading = true;

	let earnings = {
		total: 0,
		thisMonth: 0,
		lastMonth: 0,
		pending: 0
	};

	let showAddEarningModal = false;
	let showAddClientForm = false;
	let saving = false;
	let creatingClient = false;
	let error = '';
	let success = '';

	// Form data for earning registration
	let earningForm = {
		service_id: '',
		client_user_id: '',
		amount: 0,
		date: new Date().toISOString().split('T')[0],
		notes: ''
	};

	// Form data for new client
	let newClientForm = {
		first_name: '',
		last_name: '',
		email: '',
		phone_number: '',
		password: 'temp123456' // Temporary password for manual clients
	};

	function openAddEarningModal() {
		showAddEarningModal = true;
		showAddClientForm = false;
		earningForm = {
			service_id: '',
			client_user_id: '',
			amount: 0,
			date: new Date().toISOString().split('T')[0],
			notes: ''
		};
		error = '';
		success = '';
	}

	function closeAddEarningModal() {
		showAddEarningModal = false;
		showAddClientForm = false;
		error = '';
		success = '';
	}

	function openAddClientForm() {
		showAddClientForm = true;
		newClientForm = {
			first_name: '',
			last_name: '',
			email: '',
			phone_number: '',
			password: 'temp123456'
		};
		error = '';
	}

	function closeAddClientForm() {
		showAddClientForm = false;
		error = '';
	}

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

			// Cargar servicios del proveedor
			const { data: svcs, error: svcsError } = await supabase
				.from('services')
				.select('*')
				.eq('provider_profile_id', profile.id)
				.eq('is_active', true)
				.order('title');

			if (svcsError) throw svcsError;
			services = svcs || [];

			// Cargar reservas del proveedor
			const { data: bkgs, error: bkgsError } = await supabase
				.from('bookings')
				.select(`
					*,
					clients:customers!bookings_client_user_id_fkey(*)
				`)
				.eq('provider_profile_id', profile.id);

			if (bkgsError) throw bkgsError;
			bookings = bkgs || [];

			// Extraer clientes únicos de las reservas
			const uniqueClients = new Map();
			bookings.forEach(booking => {
				if (booking.clients && !uniqueClients.has(booking.clients.user_id)) {
					uniqueClients.set(booking.clients.user_id, booking.clients);
				}
			});
			clients = Array.from(uniqueClients.values());

			// Calcular ganancias
			calculateEarnings();

		} catch (error) {
			console.error('Error loading data:', error);
		} finally {
			loading = false;
		}
	}

	async function createNewClient() {
		console.log('Creating new client...', newClientForm);
		error = '';
		creatingClient = true;
		
		if (!newClientForm.first_name.trim() || !newClientForm.last_name.trim() || !newClientForm.email.trim()) {
			error = 'Completa todos los campos requeridos.';
			creatingClient = false;
			return;
		}

		try {
			// Crear usuario en Supabase Auth
			const { data: authData, error: authError } = await supabase.auth.signUp({
				email: newClientForm.email,
				password: newClientForm.password,
				options: {
					data: {
						first_name: newClientForm.first_name,
						last_name: newClientForm.last_name,
						role: 'customer'
					}
				}
			});

			if (authError) throw authError;

			if (!authData.user) {
				throw new Error('Error al crear el usuario');
			}

			// El trigger debería crear automáticamente el perfil en customers
			// Esperar un momento y luego obtener el perfil
			await new Promise(resolve => setTimeout(resolve, 1000));

			let { data: customerProfile, error: profileError } = await supabase
				.from('customers')
				.select('*')
				.eq('user_id', authData.user.id)
				.single();

			if (profileError) {
				// Si no existe el perfil, crearlo manualmente
				const { data: newProfile, error: createError } = await supabase
					.from('customers')
					.insert({
						user_id: authData.user.id,
						first_name: newClientForm.first_name,
						last_name: newClientForm.last_name,
						phone_number: newClientForm.phone_number || null,
						role: 'customer'
					})
					.select()
					.single();

				if (createError) throw createError;
				customerProfile = newProfile;
			}

			// Agregar el nuevo cliente a la lista
			clients = [...clients, customerProfile];
			earningForm.client_user_id = customerProfile.user_id;

			closeAddClientForm();
			success = 'Cliente creado exitosamente.';

		} catch (err) {
			console.error('Error creating client:', err);
			error = 'Error al crear el cliente. Verifica que el email no esté en uso.';
		} finally {
			creatingClient = false;
		}
	}

	async function saveEarning() {
		console.log('Saving earning...', earningForm);
		console.log('Provider profile:', providerProfile);
		error = '';
		success = '';

		if (!providerProfile || !providerProfile.id) {
			error = 'Error: No se pudo obtener el perfil del proveedor.';
			return;
		}

		if (!earningForm.service_id || !earningForm.client_user_id || !earningForm.amount || earningForm.amount <= 0) {
			error = 'Completa todos los campos requeridos y usa un monto válido.';
			return;
		}

		saving = true;

		try {
			// Crear fecha de inicio y fin (mismo día, 1 hora de duración)
			const selectedDate = new Date(earningForm.date);
			const startTime = new Date(selectedDate);
			startTime.setHours(9, 0, 0, 0); // 9:00 AM
			const endTime = new Date(startTime);
			endTime.setHours(10, 0, 0, 0); // 10:00 AM

			// Crear la reserva/ganancia
			console.log('Creating booking with data:', {
				provider_profile_id: providerProfile.id,
				service_id: earningForm.service_id,
				client_user_id: earningForm.client_user_id,
				start_time: startTime.toISOString(),
				end_time: endTime.toISOString(),
				total_price: earningForm.amount,
				notes_for_provider: earningForm.notes || null,
				status: 'completed'
			});

			const { data: newBooking, error: bookingError } = await supabase
				.from('bookings')
				.insert({
					provider_profile_id: providerProfile.id,
					service_id: earningForm.service_id,
					client_user_id: earningForm.client_user_id,
					start_time: startTime.toISOString(),
					end_time: endTime.toISOString(),
					total_price: earningForm.amount,
					notes_for_provider: earningForm.notes || null,
					status: 'completed' // Marcado como completado inmediatamente
				})
				.select()
				.single();

			if (bookingError) {
				console.error('Booking error:', bookingError);
				throw bookingError;
			}

			console.log('Booking created successfully:', newBooking);

			// Recargar datos para actualizar estadísticas
			console.log('Reloading data...');
			await loadData();
			console.log('Data reloaded successfully');

			closeAddEarningModal();
			success = 'Ganancia registrada exitosamente.';

		} catch (err) {
			console.error('Error saving earning:', err);
			error = 'Error al guardar la ganancia. Verifica que todos los campos sean válidos.';
		} finally {
			saving = false;
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
			<button class="btn btn-primary mt-4" on:click={openAddEarningModal}>Registrar ganancia</button>
		</header>

		{#if showAddEarningModal}
			<div class="modal-backdrop">
				<div class="modal">
					<div class="modal-header">
						<h2>Registrar ganancia</h2>
						<button class="close-btn" on:click={closeAddEarningModal}>×</button>
					</div>
					<div class="modal-body">
						{#if error}
							<div class="error-message">{error}</div>
						{/if}
						{#if success}
							<div class="success-message">{success}</div>
						{/if}

						{#if !showAddClientForm}
							<form on:submit|preventDefault={() => {
								console.log('Form submitted');
								saveEarning();
							}} class="earning-form">
								<div class="form-group">
									<label for="service">Servicio *</label>
									<select id="service" bind:value={earningForm.service_id} required>
										<option value="">Selecciona un servicio</option>
										{#each services as service}
											<option value={service.id}>{service.title} - {formatCurrency(service.price)}</option>
										{/each}
									</select>
								</div>

								<div class="form-group">
									<label for="client">Cliente *</label>
									<div class="client-selection">
										<select id="client" bind:value={earningForm.client_user_id} required>
											<option value="">Selecciona un cliente</option>
											{#each clients as client}
												<option value={client.user_id}>{client.first_name} {client.last_name}</option>
											{/each}
										</select>
										<button type="button" class="btn btn-secondary" on:click={openAddClientForm}>
											+ Nuevo Cliente
										</button>
									</div>
								</div>

								<div class="form-group">
									<label for="amount">Monto (C$) *</label>
									<input 
										type="number" 
										id="amount" 
										bind:value={earningForm.amount} 
										min="0" 
										step="0.01" 
										required 
										placeholder="0.00"
									/>
								</div>

								<div class="form-group">
									<label for="date">Fecha *</label>
									<input 
										type="date" 
										id="date" 
										bind:value={earningForm.date} 
										required
									/>
								</div>

								<div class="form-group">
									<label for="notes">Notas (opcional)</label>
									<textarea 
										id="notes" 
										bind:value={earningForm.notes} 
										rows="3" 
										placeholder="Detalles adicionales sobre el servicio..."
									></textarea>
								</div>

								<div class="form-actions">
									<button type="button" class="btn btn-secondary" on:click={closeAddEarningModal}>
										Cancelar
									</button>
									<button type="submit" class="btn btn-primary" disabled={saving}>
										{saving ? 'Guardando...' : 'Registrar Ganancia'}
									</button>
									<button type="button" class="btn btn-secondary" on:click={() => {
										console.log('Test button clicked');
										console.log('Form data:', earningForm);
										console.log('Provider profile:', providerProfile);
									}}>
										Test
									</button>
								</div>
							</form>
						{:else}
							<form on:submit|preventDefault={createNewClient} class="client-form">
								<h3>Agregar Nuevo Cliente</h3>
								
								<div class="form-group">
									<label for="first_name">Nombre *</label>
									<input 
										type="text" 
										id="first_name" 
										bind:value={newClientForm.first_name} 
										required 
										placeholder="Nombre del cliente"
									/>
								</div>

								<div class="form-group">
									<label for="last_name">Apellido *</label>
									<input 
										type="text" 
										id="last_name" 
										bind:value={newClientForm.last_name} 
										required 
										placeholder="Apellido del cliente"
									/>
								</div>

								<div class="form-group">
									<label for="email">Email *</label>
									<input 
										type="email" 
										id="email" 
										bind:value={newClientForm.email} 
										required 
										placeholder="email@ejemplo.com"
									/>
								</div>

								<div class="form-group">
									<label for="phone">Teléfono (opcional)</label>
									<input 
										type="tel" 
										id="phone" 
										bind:value={newClientForm.phone_number} 
										placeholder="+505 1234 5678"
									/>
								</div>

								<div class="form-actions">
									<button type="button" class="btn btn-secondary" on:click={closeAddClientForm} disabled={creatingClient}>
										Cancelar
									</button>
									<button type="submit" class="btn btn-primary" disabled={creatingClient}>
										{creatingClient ? 'Creando...' : 'Crear Cliente'}
									</button>
								</div>
							</form>
						{/if}
					</div>
				</div>
			</div>
		{/if}

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
		background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%);
		border-radius: 4px 4px 0 0;
		min-height: 8px;
		transition: all 0.3s ease;
	}
	.bar-label {
		font-size: 0.75rem;
		color: #64748b;
		margin-top: 0.5rem;
		font-weight: 500;
	}
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.75rem 1.5rem;
		border-radius: 0.5rem;
		font-weight: 600;
		font-size: 0.875rem;
		text-decoration: none;
		border: none;
		cursor: pointer;
		transition: all 0.2s ease;
	}
	.btn-primary {
		background: #3b82f6;
		color: white;
	}
	.btn-primary:hover {
		background: #2563eb;
	}
	.btn-primary:disabled {
		background: #94a3b8;
		cursor: not-allowed;
	}
	.btn-secondary {
		background: #f1f5f9;
		color: #475569;
		border: 1px solid #cbd5e1;
	}
	.btn-secondary:hover {
		background: #e2e8f0;
	}
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}
	.modal {
		background: white;
		border-radius: 1rem;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
		max-width: 500px;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
	}
	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem 1.5rem 0 1.5rem;
		border-bottom: 1px solid #e5e7eb;
		padding-bottom: 1rem;
	}
	.modal-header h2 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 700;
		color: #1e293b;
	}
	.close-btn {
		background: none;
		border: none;
		font-size: 1.5rem;
		color: #64748b;
		cursor: pointer;
		padding: 0.25rem;
		border-radius: 0.25rem;
	}
	.close-btn:hover {
		background: #f1f5f9;
		color: #475569;
	}
	.modal-body {
		padding: 1.5rem;
	}
	.earning-form, .client-form {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}
	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.form-group label {
		font-weight: 600;
		color: #374151;
		font-size: 0.875rem;
	}
	.form-group input,
	.form-group select,
	.form-group textarea {
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		transition: border-color 0.2s ease;
	}
	.form-group input:focus,
	.form-group select:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}
	.client-selection {
		display: flex;
		gap: 0.75rem;
		align-items: flex-end;
	}
	.client-selection select {
		flex: 1;
	}
	.form-actions {
		display: flex;
		gap: 0.75rem;
		justify-content: flex-end;
		margin-top: 1rem;
	}
	.error-message {
		background: #fef2f2;
		color: #dc2626;
		padding: 0.75rem;
		border-radius: 0.5rem;
		border: 1px solid #fecaca;
		margin-bottom: 1rem;
		font-size: 0.875rem;
	}
	.success-message {
		background: #f0fdf4;
		color: #16a34a;
		padding: 0.75rem;
		border-radius: 0.5rem;
		border: 1px solid #bbf7d0;
		margin-bottom: 1rem;
		font-size: 0.875rem;
	}
	.client-form h3 {
		margin: 0 0 1rem 0;
		font-size: 1.125rem;
		font-weight: 600;
		color: #1e293b;
	}
</style> 