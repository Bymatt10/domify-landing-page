<script lang="ts">
  import { onMount } from 'svelte';
  import { debounce } from '$lib/utils';

  let customers: any[] = [];
  let loading = true;
  let error = '';
  let total = 0;
  let page = 1;
  let totalPages = 1;
  let limit = 10;
  let search = '';
  
  // Estado del modal
  let showModal = false;
  let selectedCustomer: any = null;
  let customerDetails: any = null;
  let loadingDetails = false;
  
  // Estado de edición
  let isEditing = false;
  let saving = false;
  let editForm = {
    first_name: '',
    last_name: '',
    phone_number: '',
    address: '',
    email: ''
  };
  
  // Estado de activación/desactivación
  let updatingStatus = false;

  async function loadCustomers() {
    loading = true;
    error = '';
    const url = new URL('/api/admin/customers', window.location.origin);
    url.searchParams.set('page', page.toString());
    url.searchParams.set('limit', limit.toString());
    url.searchParams.set('search', search);

    try {
      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        customers = data.customers;
        total = data.total;
        totalPages = data.totalPages;
      } else {
        const data = await res.json();
        error = data.error || 'Fallo al cargar los clientes';
      }
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  }

  async function showCustomerDetails(customer: any) {
    selectedCustomer = customer;
    showModal = true;
    loadingDetails = true;
    isEditing = false;
    
    // Inicializar formulario de edición
    editForm = {
      first_name: customer.first_name || '',
      last_name: customer.last_name || '',
      phone_number: customer.phone_number || '',
      address: customer.address || '',
      email: customer.email || ''
    };
    
    try {
      // Cargar detalles adicionales del cliente
      const res = await fetch(`/api/admin/customers/${customer.user_id}/details`);
      if (res.ok) {
        customerDetails = await res.json();
      } else {
        customerDetails = null;
      }
    } catch (e) {
      console.error('Error loading customer details:', e);
      customerDetails = null;
    } finally {
      loadingDetails = false;
    }
  }

  function startEditing() {
    isEditing = true;
  }

  function cancelEditing() {
    isEditing = false;
    // Restaurar valores originales
    editForm = {
      first_name: selectedCustomer.first_name || '',
      last_name: selectedCustomer.last_name || '',
      phone_number: selectedCustomer.phone_number || '',
      address: selectedCustomer.address || '',
      email: selectedCustomer.email || ''
    };
  }

  async function saveCustomer() {
    if (!selectedCustomer) return;
    
    saving = true;
    try {
      const res = await fetch(`/api/admin/customers/${selectedCustomer.user_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      if (res.ok) {
        const updatedCustomer = await res.json();
        
        // Actualizar el cliente en la lista
        const customerIndex = customers.findIndex(c => c.user_id === selectedCustomer.user_id);
        if (customerIndex !== -1) {
          customers[customerIndex] = { 
            ...customers[customerIndex], 
            ...updatedCustomer,
            // Asegurar que el email actualizado se refleje
            email: updatedCustomer.email || customers[customerIndex].email
          };
          customers = customers; // Trigger reactivity
        }
        
        // Actualizar el cliente seleccionado
        selectedCustomer = { 
          ...selectedCustomer, 
          ...updatedCustomer,
          // Asegurar que el email actualizado se refleje
          email: updatedCustomer.email || selectedCustomer.email
        };
        
        isEditing = false;
        
        // Mostrar mensaje de éxito
        alert('Cliente actualizado exitosamente');
        
      } else {
        const errorData = await res.json();
        alert(`Error al actualizar cliente: ${errorData.error || 'Error desconocido'}`);
      }
    } catch (e) {
      console.error('Error saving customer:', e);
      alert('Error al guardar los cambios');
    } finally {
      saving = false;
    }
  }

  async function toggleUserStatus(customer: any, action: 'activate' | 'deactivate') {
    if (!customer) return;
    
    const confirmMessage = action === 'deactivate' 
      ? '¿Estás seguro de que deseas desactivar este usuario? No podrá iniciar sesión.'
      : '¿Estás seguro de que deseas activar este usuario?';
    
    if (!confirm(confirmMessage)) return;
    
    updatingStatus = true;
    try {
      const res = await fetch(`/api/admin/customers/${customer.user_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      });

      if (res.ok) {
        const result = await res.json();
        
        // Actualizar el cliente en la lista
        const customerIndex = customers.findIndex(c => c.user_id === customer.user_id);
        if (customerIndex !== -1) {
          customers[customerIndex] = { ...customers[customerIndex], ...result.customer };
          customers = customers; // Trigger reactivity
        }
        
        // Si el cliente está seleccionado en el modal, actualizarlo también
        if (selectedCustomer && selectedCustomer.user_id === customer.user_id) {
          selectedCustomer = { ...selectedCustomer, ...result.customer };
        }
        
        alert(result.message);
        
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error || 'Error desconocido'}`);
      }
    } catch (e) {
      console.error('Error updating user status:', e);
      alert('Error al cambiar el estado del usuario');
    } finally {
      updatingStatus = false;
    }
  }

  function closeModal() {
    showModal = false;
    selectedCustomer = null;
    customerDetails = null;
    isEditing = false;
  }

  // Cerrar modal con Escape
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && showModal) {
      if (isEditing) {
        cancelEditing();
      } else {
        closeModal();
      }
    }
  }

  onMount(() => {
    loadCustomers();
    document.addEventListener('keydown', handleKeydown);
    
    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  });

  const handleSearch = debounce(() => {
    page = 1;
    loadCustomers();
  }, 300);

  function goToPage(newPage: number) {
    if (newPage > 0 && newPage <= totalPages) {
      page = newPage;
      loadCustomers();
    }
  }

  function formatDate(dateString: string) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-NI', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('es-NI', {
      style: 'currency',
      currency: 'NIO'
    }).format(amount || 0);
  }
</script>

<div class="admin-page">
    <header class="page-header">
        <h1>Módulo de Clientes</h1>
        <p>Gestiona los perfiles de los clientes registrados en la plataforma.</p>
    </header>

    <div class="filters-section">
        <div class="filter-group">
            <label for="search-filter">Buscar Cliente:</label>
            <input 
              id="search-filter"
              type="text" 
              bind:value={search}
              on:input={handleSearch}
              placeholder="Buscar por nombre, apellido, teléfono..."
            />
        </div>
    </div>

    {#if loading}
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Cargando clientes...</p>
        </div>
    {:else if error}
        <div class="notice-banner warning">
            <div class="notice-icon">⚠️</div>
            <div class="notice-content">
                <h4>Error al Cargar Datos</h4>
                <p>{error}</p>
                <button class="btn btn-secondary" on:click={loadCustomers}>Reintentar</button>
            </div>
        </div>
    {:else if customers.length === 0}
        <div class="empty-state">
            <h3>No se encontraron clientes</h3>
            <p>No hay clientes que coincidan con la búsqueda actual.</p>
        </div>
    {:else}
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th class="customer-col">Cliente</th>
                        <th class="contact-col">Contacto</th>
                        <th class="status-col">Estado</th>
                        <th class="date-col">Registro</th>
                        <th class="actions-col">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {#each customers as customer}
                        <tr>
                            <td class="customer-col">
                                <div class="customer-info">
                                    <div class="customer-name">
                                        {#if customer.first_name || customer.last_name}
                                            {customer.first_name || ''} {customer.last_name || ''}
                                        {:else}
                                            Sin nombre
                                        {/if}
                                    </div>
                                    <div class="customer-id">ID: {customer.user_id.slice(0, 8)}...</div>
                                </div>
                            </td>
                            <td class="contact-col">
                                <div class="contact-info">
                                    <div class="email">{customer.user?.email || 'Sin email'}</div>
                                    <div class="phone">{customer.phone_number || 'Sin teléfono'}</div>
                                </div>
                            </td>
                            <td class="status-col">
                                <div class="status-badge {customer.is_active === false ? 'inactive' : 'active'}">
                                    {#if customer.is_active === false}
                                        ❌ Inactivo
                                    {:else}
                                        ✅ Activo
                                    {/if}
                                </div>
                            </td>
                            <td class="date-col">
                                <span class="date">{formatDate(customer.created_at)}</span>
                            </td>
                            <td class="actions-col">
                                <div class="action-buttons">
                                    <button 
                                      class="btn btn-primary btn-sm" 
                                      on:click={() => showCustomerDetails(customer)}
                                    >
                                      Ver
                                    </button>
                                    {#if customer.is_active === false}
                                        <button 
                                          class="btn btn-success btn-sm"
                                          on:click={() => toggleUserStatus(customer, 'activate')}
                                          disabled={updatingStatus}
                                        >
                                          Activar
                                        </button>
                                    {:else}
                                        <button 
                                          class="btn btn-danger btn-sm"
                                          on:click={() => toggleUserStatus(customer, 'deactivate')}
                                          disabled={updatingStatus}
                                        >
                                          Desactivar
                                        </button>
                                    {/if}
                                </div>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        <div class="pagination">
            <div class="pagination-info">
                Mostrando {customers.length} de {total} clientes
            </div>
            <div class="pagination-controls">
                <button class="btn btn-secondary" on:click={() => goToPage(page - 1)} disabled={page <= 1}>Anterior</button>
                <span>Página {page} de {totalPages}</span>
                <button class="btn btn-secondary" on:click={() => goToPage(page + 1)} disabled={page >= totalPages}>Siguiente</button>
            </div>
        </div>
    {/if}
</div>

<!-- Modal de detalles del cliente -->
{#if showModal}
    <div class="modal-overlay" on:click={closeModal}>
        <div class="modal-content" on:click|stopPropagation>
            <div class="modal-header">
                <h2>Detalles del Cliente</h2>
                <button class="modal-close" on:click={closeModal}>&times;</button>
            </div>
            
            <div class="modal-body">
                {#if selectedCustomer}
                    <div class="customer-info">
                        <div class="customer-header">
                            <div class="customer-avatar">
                                {#if selectedCustomer.first_name}
                                    {(selectedCustomer.first_name[0] + (selectedCustomer.last_name?.[0] || '')).toUpperCase()}
                                {:else}
                                    👤
                                {/if}
                            </div>
                            <div class="customer-details">
                                <h3>{selectedCustomer.first_name || ''} {selectedCustomer.last_name || ''}</h3>
                                <p class="customer-id">ID: {selectedCustomer.user_id}</p>
                            </div>
                        </div>

                        {#if isEditing}
                            <div class="edit-form">
                                <div class="form-grid">
                                    <div class="form-item">
                                        <label for="first_name">Nombre:</label>
                                        <input 
                                            id="first_name"
                                            type="text" 
                                            bind:value={editForm.first_name}
                                            placeholder="Ingrese el nombre"
                                        />
                                    </div>
                                    <div class="form-item">
                                        <label for="last_name">Apellido:</label>
                                        <input 
                                            id="last_name"
                                            type="text" 
                                            bind:value={editForm.last_name}
                                            placeholder="Ingrese el apellido"
                                        />
                                    </div>
                                    <div class="form-item">
                                        <label for="phone_number">Teléfono:</label>
                                        <input 
                                            id="phone_number"
                                            type="tel" 
                                            bind:value={editForm.phone_number}
                                            placeholder="Ingrese el teléfono"
                                        />
                                    </div>
                                    <div class="form-item">
                                        <label for="email">Email:</label>
                                        <input 
                                            id="email"
                                            type="email" 
                                            bind:value={editForm.email}
                                            placeholder="Ingrese el email"
                                        />
                                    </div>
                                    <div class="form-item">
                                        <label for="address">Dirección:</label>
                                        <input 
                                            id="address"
                                            type="text" 
                                            bind:value={editForm.address}
                                            placeholder="Ingrese la dirección"
                                        />
                                    </div>
                                </div>
                                
                                <div class="readonly-info">
                                    <div class="info-item">
                                        <label>Fecha de Registro:</label>
                                        <span>{formatDate(selectedCustomer.created_at)}</span>
                                    </div>
                                </div>
                            </div>
                        {:else}
                            <div class="info-grid">
                                <div class="info-item">
                                    <label>Email:</label>
                                    <span>{selectedCustomer.user?.email || 'N/A'}</span>
                                </div>
                                <div class="info-item">
                                    <label>Teléfono:</label>
                                    <span>{selectedCustomer.phone_number || 'N/A'}</span>
                                </div>
                                <div class="info-item">
                                    <label>Dirección:</label>
                                    <span>{selectedCustomer.address || 'N/A'}</span>
                                </div>
                                <div class="info-item">
                                    <label>Fecha de Registro:</label>
                                    <span>{formatDate(selectedCustomer.created_at)}</span>
                                </div>
                                                                    <div class="info-item">
                                        <label>Estado:</label>
                                        <span class="status-text {selectedCustomer.is_active === false ? 'inactive' : 'active'}">
                                            {selectedCustomer.is_active === false ? '❌ Inactivo' : '✅ Activo'}
                                        </span>
                                    </div>
                                    <div class="info-item">
                                        <label>Última Actualización:</label>
                                        <span>{formatDate(selectedCustomer.updated_at)}</span>
                                    </div>
                            </div>
                        {/if}

                        {#if loadingDetails}
                            <div class="loading-details">
                                <div class="spinner"></div>
                                <p>Cargando estadísticas...</p>
                            </div>
                        {:else if customerDetails}
                            <div class="customer-stats">
                                <h4>Estadísticas del Cliente</h4>
                                <div class="stats-grid">
                                    <div class="stat-card">
                                        <div class="stat-number">{customerDetails.total_bookings || 0}</div>
                                        <div class="stat-label">Reservas Totales</div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-number">{customerDetails.completed_bookings || 0}</div>
                                        <div class="stat-label">Reservas Completadas</div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-number">{customerDetails.total_reviews || 0}</div>
                                        <div class="stat-label">Reseñas Escritas</div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-number">{customerDetails.avg_rating || 'N/A'}</div>
                                        <div class="stat-label">Calificación Promedio</div>
                                    </div>
                                </div>

                                {#if customerDetails.total_spent !== undefined}
                                    <div class="total-spent">
                                        <h5>Total Gastado</h5>
                                        <div class="amount">{formatCurrency(customerDetails.total_spent)}</div>
                                    </div>
                                {/if}
                            </div>
                        {:else}
                            <div class="no-stats">
                                <p>No se pudieron cargar las estadísticas del cliente.</p>
                            </div>
                        {/if}
                    </div>
                {/if}
            </div>
            
            <div class="modal-footer">
                {#if isEditing}
                    <button class="btn btn-secondary" on:click={cancelEditing} disabled={saving}>
                        Cancelar
                    </button>
                    <button class="btn btn-primary" on:click={saveCustomer} disabled={saving}>
                        {#if saving}
                            <span class="spinner-sm"></span>
                            Guardando...
                        {:else}
                            💾 Guardar Cambios
                        {/if}
                    </button>
                {:else}
                    <div class="modal-actions-left">
                        {#if selectedCustomer.is_active === false}
                            <button 
                              class="btn btn-success" 
                              on:click={() => toggleUserStatus(selectedCustomer, 'activate')}
                              disabled={updatingStatus}
                            >
                              {#if updatingStatus}
                                  <span class="spinner-sm"></span>
                                  Activando...
                              {:else}
                                  ✅ Activar Usuario
                              {/if}
                            </button>
                        {:else}
                            <button 
                              class="btn btn-danger" 
                              on:click={() => toggleUserStatus(selectedCustomer, 'deactivate')}
                              disabled={updatingStatus}
                            >
                              {#if updatingStatus}
                                  <span class="spinner-sm"></span>
                                  Desactivando...
                              {:else}
                                  ❌ Desactivar Usuario
                              {/if}
                            </button>
                        {/if}
                    </div>
                    <div class="modal-actions-right">
                        <button class="btn btn-secondary" on:click={closeModal}>Cerrar</button>
                        <button class="btn btn-primary" on:click={startEditing}>
                            ✏️ Editar Cliente
                        </button>
                    </div>
                {/if}
            </div>
        </div>
    </div>
{/if}

<style>
  /* Layout principal */
  .admin-page { 
    padding: 1.5rem; 
    max-width: 100%; 
    margin: 0 auto; 
  }
  
  .page-header { 
    margin-bottom: 2rem; 
    padding-bottom: 1rem; 
    border-bottom: 1px solid #e5e7eb; 
  }
  
  .page-header h1 { 
    font-size: 2rem; 
    font-weight: 700; 
    color: #1f2937; 
    margin: 0;
  }
  
  .page-header p { 
    margin-top: 0.5rem; 
    color: #6b7280; 
    margin-bottom: 0;
  }
  
  /* Filtros */
  .filters-section { 
    background: white; 
    border: 1px solid #e5e7eb; 
    border-radius: 8px; 
    padding: 1.5rem; 
    margin-bottom: 2rem; 
  }
  
  .filter-group label { 
    font-weight: 500; 
    color: #374151; 
    display: block; 
    margin-bottom: 0.5rem; 
  }
  
  .filter-group input { 
    width: 100%; 
    max-width: 400px;
    padding: 0.75rem; 
    border: 1px solid #d1d5db; 
    border-radius: 6px;
    font-size: 0.875rem;
  }
  
  /* Estados de carga */
  .loading-state, .empty-state { 
    text-align: center; 
    padding: 4rem 2rem; 
  }
  
  .spinner { 
    display: inline-block; 
    width: 40px; 
    height: 40px; 
    border: 4px solid #f3f4f6; 
    border-top-color: #3b82f6; 
    border-radius: 50%; 
    animation: spin 1s linear infinite; 
  }
  
  @keyframes spin { to { transform: rotate(360deg); } }
  
  .notice-banner { 
    display: flex; 
    align-items: center; 
    gap: 1rem; 
    padding: 1rem; 
    border-radius: 8px; 
    margin-bottom: 2rem; 
  }
  
  .notice-banner.warning { 
    background: #fefce8; 
    border: 1px solid #fde047; 
    color: #a16207; 
  }
  
  .notice-icon { font-size: 1.5rem; }
  
  /* Tabla mejorada */
  .table-container { 
    overflow-x: auto; 
    background: white; 
    border-radius: 12px; 
    border: 1px solid #e5e7eb; 
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  }
  
  table { 
    width: 100%; 
    border-collapse: collapse; 
    min-width: 700px;
  }
  
  th, td { 
    padding: 1rem; 
    text-align: left; 
    border-bottom: 1px solid #f3f4f6; 
    vertical-align: top;
  }
  
  th { 
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    font-weight: 600; 
    color: #475569; 
    text-transform: uppercase; 
    font-size: 0.75rem; 
    letter-spacing: 0.05em;
    position: sticky;
    top: 0;
    z-index: 10;
  }
  
  tbody tr:hover {
    background-color: #f8fafc;
  }
  
  tbody tr:last-child td { 
    border-bottom: none; 
  }
  
  /* Columnas específicas */
  .customer-col { width: 25%; }
  .contact-col { width: 25%; }
  .status-col { width: 15%; }
  .date-col { width: 15%; }
  .actions-col { width: 20%; }
  
  /* Información del cliente */
  .customer-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .customer-name { 
    font-weight: 600; 
    color: #1f2937; 
    font-size: 0.875rem;
  }
  
  .customer-id { 
    font-size: 0.75rem; 
    color: #6b7280; 
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
  }
  
  /* Información de contacto */
  .contact-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .email { 
    font-size: 0.875rem; 
    color: #1f2937; 
    font-weight: 500;
  }
  
  .phone { 
    font-size: 0.75rem; 
    color: #6b7280; 
  }
  
  /* Fecha */
  .date {
    font-size: 0.8rem;
    color: #6b7280;
  }

  /* Badge de estado */
  .status-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.375rem 0.75rem;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .status-badge.active {
    background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
    color: #166534;
    border: 1px solid #86efac;
  }

  .status-badge.inactive {
    background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
    color: #991b1b;
    border: 1px solid #fca5a5;
  }

  .status-text.active {
    color: #166534;
    font-weight: 600;
  }

  .status-text.inactive {
    color: #991b1b;
    font-weight: 600;
  }

  /* Botones de acción */
  .action-buttons {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  
  /* Paginación */
  .pagination { 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    padding: 1.5rem; 
    background: white; 
    border-top: 1px solid #e5e7eb; 
    margin-top: 0;
    border-radius: 0 0 12px 12px;
  }
  
  .pagination-info {
    font-size: 0.875rem;
    color: #6b7280;
  }
  
  .pagination-controls { 
    display: flex; 
    gap: 0.5rem; 
    align-items: center;
  }
  
  /* Botones mejorados */
  .btn { 
    padding: 0.5rem 1rem; 
    border: none; 
    border-radius: 6px; 
    font-size: 0.875rem; 
    font-weight: 500; 
    cursor: pointer; 
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }
  
  .btn-primary {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    border: 1px solid #2563eb;
  }
  
  .btn-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  }
  
  .btn-secondary { 
    background: #f8fafc; 
    color: #475569; 
    border: 1px solid #e2e8f0;
  }
  
  .btn-secondary:hover:not(:disabled) { 
    background: #f1f5f9; 
    border-color: #cbd5e1;
  }
  
  .btn-sm {
    padding: 0.375rem 0.75rem;
    font-size: 0.8rem;
  }
  
  .btn:disabled { 
    opacity: 0.5; 
    cursor: not-allowed; 
    transform: none !important;
    box-shadow: none !important;
  }

  .btn-success {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    border: 1px solid #059669;
  }

  .btn-success:hover:not(:disabled) {
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }

  .btn-danger {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    border: 1px solid #dc2626;
  }

  .btn-danger:hover:not(:disabled) {
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  }
  
  /* Responsive para tabla */
  @media (max-width: 1024px) {
    .admin-page {
      padding: 1rem;
    }
    
    .customer-col { width: 30%; }
    .contact-col { width: 30%; }
    .status-col { width: 15%; }
    .date-col { width: 15%; }
    .actions-col { width: 10%; }
    
    .action-buttons .btn:not(:first-child) {
      display: none;
    }
  }
  
  @media (max-width: 768px) {
    .table-container {
      border-radius: 8px;
    }
    
    th, td {
      padding: 0.75rem 0.5rem;
    }
    
    .customer-name {
      font-size: 0.8rem;
    }
    
    .email {
      font-size: 0.8rem;
    }
    
    .date-col { display: none; }
    .status-col { width: 20%; }
    .actions-col { display: none; }
  }

  /* Estilos del modal mejorado */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
    animation: fadeIn 0.2s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .modal-content {
    background: white;
    border-radius: 16px;
    max-width: 650px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    animation: slideUp 0.3s ease-out;
    border: 1px solid #e5e7eb;
  }

  @keyframes slideUp {
    from { 
      opacity: 0; 
      transform: translateY(20px) scale(0.95); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0) scale(1); 
    }
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2rem;
    border-bottom: 1px solid #f1f5f9;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-radius: 16px 16px 0 0;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .modal-close {
    background: white;
    border: 1px solid #e2e8f0;
    font-size: 1.25rem;
    cursor: pointer;
    color: #64748b;
    padding: 0.5rem;
    border-radius: 8px;
    transition: all 0.2s ease;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }

  .modal-close:hover {
    background: #f1f5f9;
    color: #475569;
    transform: scale(1.05);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .modal-body {
    padding: 2rem;
  }

  .modal-footer {
    padding: 2rem;
    border-top: 1px solid #f1f5f9;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    background: #fafbfc;
    border-radius: 0 0 16px 16px;
  }

  .modal-actions-left {
    display: flex;
    gap: 0.5rem;
  }

  .modal-actions-right {
    display: flex;
    gap: 1rem;
  }

  /* Estilos del cliente */
  .customer-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .customer-avatar {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .customer-details h3 {
    margin: 0 0 0.25rem 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
  }

  .customer-id {
    margin: 0;
    font-size: 0.875rem;
    color: #6b7280;
  }

  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .info-item label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .info-item span {
    font-size: 1rem;
    color: #1f2937;
    font-weight: 500;
  }

  .loading-details {
    text-align: center;
    padding: 2rem;
  }

  .loading-details p {
    margin-top: 1rem;
    color: #6b7280;
  }

  .customer-stats {
    border-top: 1px solid #e5e7eb;
    padding-top: 1.5rem;
  }

  .customer-stats h4 {
    margin: 0 0 1rem 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .stat-card {
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    padding: 1.5rem;
    border-radius: 12px;
    text-align: center;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.15);
    border-color: #cbd5e1;
  }

  .stat-number {
    font-size: 2rem;
    font-weight: 800;
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
  }

  .stat-label {
    font-size: 0.8rem;
    color: #64748b;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .total-spent {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    padding: 2rem;
    border-radius: 16px;
    text-align: center;
    box-shadow: 0 8px 25px -8px rgba(16, 185, 129, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.1);
    position: relative;
    overflow: hidden;
  }

  .total-spent::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  }

  .total-spent h5 {
    margin: 0 0 0.75rem 0;
    font-size: 0.85rem;
    font-weight: 600;
    opacity: 0.9;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .total-spent .amount {
    font-size: 2.25rem;
    font-weight: 800;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .no-stats {
    text-align: center;
    padding: 2rem;
    color: #6b7280;
    border-top: 1px solid #e5e7eb;
    margin-top: 1.5rem;
  }

  /* Estilos para formulario de edición */
  .edit-form {
    margin-bottom: 1.5rem;
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .form-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-item label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
  }

  .form-item input {
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 0.875rem;
    transition: all 0.2s ease;
    background: white;
  }

  .form-item input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .form-item input::placeholder {
    color: #9ca3af;
  }

  .readonly-info {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    padding: 1rem;
    background: #f9fafb;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
  }

  .readonly-info .info-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .readonly-info .info-item label {
    font-size: 0.75rem;
    font-weight: 500;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .readonly-info .info-item span {
    font-size: 0.875rem;
    color: #374151;
    font-weight: 500;
  }

  /* Spinner pequeño para botones */
  .spinner-sm {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-right: 0.5rem;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .info-grid {
      grid-template-columns: 1fr;
    }
    
    .stats-grid {
      grid-template-columns: 1fr;
    }
    
    .form-grid,
    .readonly-info {
      grid-template-columns: 1fr;
    }
    
    .modal-content {
      margin: 1rem;
      max-height: calc(100vh - 2rem);
    }
    
    .modal-footer {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }
    
    .modal-actions-left,
    .modal-actions-right {
      width: 100%;
      justify-content: center;
    }
    
    .modal-footer .btn {
      flex: 1;
      justify-content: center;
    }
  }
</style> 