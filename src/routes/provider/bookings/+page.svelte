<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';

	export let data: any;
	let { session, user } = data;
	$: ({ session, user } = data);

	let providerProfile: any = null;
	let bookings: any[] = [];
	let loading = true;
	let showCreateModal = false;
	let creating = false;
	let message = '';
	let messageType = '';

	// Form data for new booking
	let newBooking = {
		client_name: '',
		client_phone: '',
		client_address: '',
		service_date: '',
		service_time: '',
		duration_hours: 2,
		notes: '',
		total_price: 0
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

	function showMessage(msg: string, type: 'success' | 'error' = 'success') {
		message = msg;
		messageType = type;
		setTimeout(() => {
			message = '';
			messageType = '';
		}, 5000);
	}

	function resetForm() {
		newBooking = {
			client_name: '',
			client_phone: '',
			client_address: '',
			service_date: '',
			service_time: '',
			duration_hours: 2,
			notes: '',
			total_price: 0
		};
	}

	async function createBooking() {
		if (!newBooking.client_name.trim() || !newBooking.client_phone.trim() || !newBooking.client_address.trim() || !newBooking.service_date || !newBooking.service_time) {
			showMessage('Por favor completa todos los campos obligatorios (nombre, teléfono, dirección, fecha y hora)', 'error');
			return;
		}

		creating = true;

		try {
			// Crear fecha y hora combinadas
			const startTime = new Date(`${newBooking.service_date}T${newBooking.service_time}`);
			const endTime = new Date(startTime.getTime() + (newBooking.duration_hours * 60 * 60 * 1000));

			// Crear la reserva
			const { data: booking, error } = await supabase
				.from('bookings')
				.insert({
					provider_profile_id: providerProfile.id,
					client_name: newBooking.client_name.trim(),
					client_phone: newBooking.client_phone.trim(),
					start_time: startTime.toISOString(),
					end_time: endTime.toISOString(),
					total_price: newBooking.total_price,
					notes: `${newBooking.client_address ? `Dirección: ${newBooking.client_address.trim()}\n` : ''}${newBooking.notes.trim()}`,
					status: 'confirmed', // Reserva creada manualmente se marca como confirmada
					created_at: new Date().toISOString()
				})
				.select()
				.single();

			if (error) throw error;

			// Recargar las reservas
			await loadData();

			// Cerrar modal y mostrar mensaje
			showCreateModal = false;
			resetForm();
			showMessage('Reserva creada exitosamente. Se abrirá WhatsApp para confirmar con el cliente.');

			// Generar enlace de WhatsApp
			setTimeout(() => {
				generateWhatsAppLink(booking);
			}, 1000);

		} catch (error: any) {
			console.error('Error creating booking:', error);
			showMessage(`Error al crear la reserva: ${error.message}`, 'error');
		} finally {
			creating = false;
		}
	}

	function generateWhatsAppLink(booking: any) {
		const phone = booking.client_phone.replace(/\D/g, ''); // Solo números
		
		// Extraer dirección de las notas si existe
		const notes = booking.notes || '';
		const addressMatch = notes.match(/Dirección: (.+?)(?:\n|$)/);
		const address = addressMatch ? addressMatch[1] : 'No especificada';
		const cleanNotes = notes.replace(/Dirección: .+?(?:\n|$)/, '').trim();
		
		const message = encodeURIComponent(
			`Hola ${booking.client_name}! 👋\n\n` +
			`Te confirmo tu reserva para el servicio:\n\n` +
			`📅 Fecha: ${formatDate(booking.start_time)}\n` +
			`⏰ Duración: ${newBooking.duration_hours} horas\n` +
			`💰 Precio: ${formatCurrency(booking.total_price)}\n` +
			`📍 Dirección: ${address}\n\n` +
			`${cleanNotes ? `📝 Notas: ${cleanNotes}\n\n` : ''}` +
			`¿Podrías confirmar que todo está correcto? 🤔\n\n` +
			`Saludos,\n${providerProfile.business_name}`
		);

		const whatsappUrl = `https://wa.me/${phone}?text=${message}`;
		window.open(whatsappUrl, '_blank');
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
			<div class="header-content">
				<div>
					<h1>Reservas</h1>
					<p>Gestiona las reservas de tus clientes</p>
				</div>
				<button class="btn btn-primary" on:click={() => showCreateModal = true}>
					<span>➕</span>
					Nueva Reserva
				</button>
			</div>
		</header>

		{#if message}
			<div class="message {messageType}">
				<span class="message-icon">
					{#if messageType === 'success'}
						✓
					{:else}
						⚠
					{/if}
				</span>
				{message}
			</div>
		{/if}

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
								<button class="btn btn-primary" on:click={() => generateWhatsAppLink(booking)} title="Enviar mensaje por WhatsApp">
									<span>💬</span>
									WhatsApp
								</button>
								{#if booking.status === 'pending_confirmation'}
									<button class="btn btn-success">Confirmar</button>
									<button class="btn btn-danger">Rechazar</button>
								{:else if booking.status === 'confirmed'}
									<button class="btn btn-success">Marcar Completada</button>
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

	<!-- Modal para crear nueva reserva -->
	{#if showCreateModal}
		<div class="modal-overlay" on:click={() => showCreateModal = false} role="button" tabindex="0" on:keydown={(e) => e.key === 'Escape' && (showCreateModal = false)}>
			<div class="modal-content" on:click|stopPropagation>
				<div class="modal-header">
					<h2>Nueva Reserva</h2>
					<button class="modal-close" on:click={() => showCreateModal = false}>✕</button>
				</div>

				<form on:submit|preventDefault={createBooking} class="booking-form">
					<div class="form-grid">
						<div class="form-group">
							<label for="client_name">
								Nombre del Cliente
								<span class="required">*</span>
							</label>
							<input
								id="client_name"
								type="text"
								bind:value={newBooking.client_name}
								required
								placeholder="Ej: María González"
							/>
						</div>

						<div class="form-group">
							<label for="client_phone">
								Teléfono
								<span class="required">*</span>
							</label>
							<input
								id="client_phone"
								type="tel"
								bind:value={newBooking.client_phone}
								required
								placeholder="Ej: +505 8888-8888"
							/>
						</div>

						<div class="form-group full-width">
							<label for="client_address">
								Dirección
								<span class="required">*</span>
							</label>
							<input
								id="client_address"
								type="text"
								bind:value={newBooking.client_address}
								required
								placeholder="Ej: Residencial Los Robles, Casa #123, Managua"
							/>
						</div>

						<div class="form-group">
							<label for="service_date">
								Fecha del Servicio
								<span class="required">*</span>
							</label>
							<input
								id="service_date"
								type="date"
								bind:value={newBooking.service_date}
								required
								min={new Date().toISOString().split('T')[0]}
							/>
						</div>

						<div class="form-group">
							<label for="service_time">
								Hora del Servicio
								<span class="required">*</span>
							</label>
							<input
								id="service_time"
								type="time"
								bind:value={newBooking.service_time}
								required
							/>
						</div>

						<div class="form-group">
							<label for="duration_hours">
								Duración (horas)
							</label>
							<select id="duration_hours" bind:value={newBooking.duration_hours}>
								<option value={1}>1 hora</option>
								<option value={2}>2 horas</option>
								<option value={3}>3 horas</option>
								<option value={4}>4 horas</option>
								<option value={6}>6 horas</option>
								<option value={8}>8 horas</option>
							</select>
						</div>

						<div class="form-group">
							<label for="total_price">
								Precio Total (NIO)
							</label>
							<input
								id="total_price"
								type="number"
								bind:value={newBooking.total_price}
								min="0"
								step="0.01"
								placeholder="0.00"
							/>
						</div>

						<div class="form-group full-width">
							<label for="notes">
								Notas Adicionales
							</label>
							<textarea
								id="notes"
								bind:value={newBooking.notes}
								rows="3"
								placeholder="Detalles específicos del servicio, instrucciones especiales, etc."
							></textarea>
						</div>
					</div>

					<div class="modal-actions">
						<button type="submit" class="btn btn-primary" disabled={creating}>
							{#if creating}
								<span class="loading-dots">Creando...</span>
							{:else}
								<span>💾</span>
								Crear Reserva
							{/if}
						</button>
						<button type="button" class="btn btn-secondary" on:click={() => showCreateModal = false}>
							Cancelar
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

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.header-content .btn {
		white-space: nowrap;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.025em;
		font-size: 0.875rem;
	}

	.message {
		padding: 1rem;
		border-radius: 0.5rem;
		margin-bottom: 1.5rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 500;
	}

	.message.success {
		background: #dcfce7;
		color: #166534;
		border: 1px solid #bbf7d0;
	}

	.message.error {
		background: #fee2e2;
		color: #991b1b;
		border: 1px solid #fecaca;
	}

	.message-icon {
		font-size: 1.2rem;
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
		gap: 0.5rem;
		justify-content: flex-end;
		flex-wrap: wrap;
	}

	.booking-actions .btn {
		font-size: 0.75rem;
		padding: 0.5rem 1rem;
		min-height: 36px;
	}

	.btn {
		padding: 0.75rem 1.5rem;
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

	.btn-success {
		background: #10b981;
		color: white;
		box-shadow: 0 1px 3px rgba(16, 185, 129, 0.3);
	}

	.btn-success:hover {
		background: #059669;
		transform: translateY(-1px);
		box-shadow: 0 4px 6px rgba(16, 185, 129, 0.4);
	}

	.btn-danger {
		background: #ef4444;
		color: white;
		box-shadow: 0 1px 3px rgba(239, 68, 68, 0.3);
	}

	.btn-danger:hover {
		background: #dc2626;
		transform: translateY(-1px);
		box-shadow: 0 4px 6px rgba(239, 68, 68, 0.4);
	}

	.btn-primary {
		background: #3b82f6;
		color: white;
		box-shadow: 0 1px 3px rgba(59, 130, 246, 0.3);
	}

	.btn-primary:hover {
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

		.header-content {
			flex-direction: column;
			gap: 1rem;
			align-items: stretch;
		}
	}

	/* Modal Styles */
	.modal-overlay {
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

	.modal-content {
		background: white;
		border-radius: 0.75rem;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
		max-width: 600px;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem 1.5rem 0 1.5rem;
		border-bottom: 1px solid #e2e8f0;
		margin-bottom: 1.5rem;
	}

	.modal-header h2 {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 600;
		color: #1f2937;
	}

	.modal-close {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		color: #6b7280;
		padding: 0.25rem;
		border-radius: 0.25rem;
		transition: all 0.2s;
	}

	.modal-close:hover {
		background: #f3f4f6;
		color: #374151;
	}

	.booking-form {
		padding: 0 1.5rem 1.5rem 1.5rem;
	}

	.form-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
	}

	.form-group.full-width {
		grid-column: 1 / -1;
	}

	.form-group label {
		font-weight: 500;
		color: #374151;
		margin-bottom: 0.5rem;
		font-size: 0.875rem;
	}

	.required {
		color: #dc2626;
	}

	.form-group input,
	.form-group select,
	.form-group textarea {
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		transition: border-color 0.2s;
	}

	.form-group input:focus,
	.form-group select:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.modal-actions {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
		padding-top: 1.5rem;
		border-top: 1px solid #e2e8f0;
		margin-top: 1rem;
	}

	.modal-actions .btn {
		min-width: 120px;
		justify-content: center;
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

	@media (max-width: 640px) {
		.form-grid {
			grid-template-columns: 1fr;
		}

		.modal-actions {
			flex-direction: column;
		}

		.modal-actions .btn {
			width: 100%;
			justify-content: center;
		}
	}
</style> 