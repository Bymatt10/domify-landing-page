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

  function closeModal() {
    showModal = false;
    selectedCustomer = null;
    customerDetails = null;
  }

  // Cerrar modal con Escape
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && showModal) {
      closeModal();
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
                        <th>Nombre del Cliente</th>
                        <th>Email</th>
                        <th>Teléfono</th>
                        <th>Registrado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {#each customers as customer}
                        <tr>
                            <td>
                                <div class="user-cell">
                                    <div class="user-name">{customer.first_name || ''} {customer.last_name || ''}</div>
                                    <div class="user-id">{customer.user_id}</div>
                                </div>
                            </td>
                            <td>{customer.user?.email || 'N/A'}</td>
                            <td>{customer.phone_number || 'N/A'}</td>
                            <td>{formatDate(customer.created_at)}</td>
                            <td>
                                <button 
                                  class="btn btn-secondary btn-sm" 
                                  on:click={() => showCustomerDetails(customer)}
                                >
                                  Ver Detalles
                                </button>
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
                                <label>Fecha de Registro:</label>
                                <span>{formatDate(selectedCustomer.created_at)}</span>
                            </div>
                            <div class="info-item">
                                <label>Última Actualización:</label>
                                <span>{formatDate(selectedCustomer.updated_at)}</span>
                            </div>
                        </div>

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
                <button class="btn btn-secondary" on:click={closeModal}>Cerrar</button>
            </div>
        </div>
    </div>
{/if}

<style>
  /* Reutilizando los mismos estilos para consistencia */
  .admin-page { padding: 2rem; max-width: 1200px; margin: 0 auto; }
  .page-header { margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid #e5e7eb; }
  .page-header h1 { font-size: 2rem; font-weight: 700; color: #1f2937; }
  .page-header p { margin-top: 0.5rem; color: #6b7280; }
  .filters-section { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.5rem; margin-bottom: 2rem; }
  .filter-group label { font-weight: 500; color: #374151; display: block; margin-bottom: 0.5rem; }
  .filter-group input { width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 4px; }
  .loading-state, .empty-state { text-align: center; padding: 4rem 2rem; }
  .spinner { display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f4f6; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .notice-banner { display: flex; align-items: center; gap: 1rem; padding: 1rem; border-radius: 8px; margin-bottom: 2rem; }
  .notice-banner.warning { background: #fefce8; border: 1px solid #fde047; color: #a16207; }
  .notice-icon { font-size: 1.5rem; }
  .table-container { overflow-x: auto; background: white; border-radius: 8px; border: 1px solid #e5e7eb; }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 1rem; text-align: left; border-bottom: 1px solid #e5e7eb; white-space: nowrap; }
  th { background-color: #f9fafb; font-weight: 600; color: #374151; text-transform: uppercase; font-size: 0.75rem; }
  tbody tr:last-child td { border-bottom: none; }
  .user-cell .user-name { font-weight: 500; color: #1f2937; }
  .user-cell .user-id { font-size: 0.8rem; color: #6b7280; }
  .pagination { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: white; border-top: 1px solid #e5e7eb; margin-top: 2rem; border-radius: 8px; }
  .pagination-controls { display: flex; gap: 0.5rem; }
  .btn { padding: 0.5rem 1rem; border: none; border-radius: 4px; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
  .btn-secondary { background: #f3f4f6; color: #374151; }
  .btn-secondary:hover:not(:disabled) { background: #e5e7eb; }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-sm { padding: 0.375rem 0.75rem; font-size: 0.8rem; }

  /* Estilos del modal */
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
    border-radius: 12px;
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
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
    border-radius: 4px;
    transition: all 0.2s;
  }

  .modal-close:hover {
    background: #f3f4f6;
    color: #374151;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .modal-footer {
    padding: 1.5rem;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
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
    background: #f9fafb;
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
    border: 1px solid #e5e7eb;
  }

  .stat-number {
    font-size: 1.5rem;
    font-weight: 700;
    color: #3b82f6;
    margin-bottom: 0.25rem;
  }

  .stat-label {
    font-size: 0.875rem;
    color: #6b7280;
    font-weight: 500;
  }

  .total-spent {
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
  }

  .total-spent h5 {
    margin: 0 0 0.5rem 0;
    font-size: 0.875rem;
    font-weight: 500;
    opacity: 0.9;
  }

  .total-spent .amount {
    font-size: 1.5rem;
    font-weight: 700;
  }

  .no-stats {
    text-align: center;
    padding: 2rem;
    color: #6b7280;
    border-top: 1px solid #e5e7eb;
    margin-top: 1.5rem;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .info-grid {
      grid-template-columns: 1fr;
    }
    
    .stats-grid {
      grid-template-columns: 1fr;
    }
    
    .modal-content {
      margin: 1rem;
      max-height: calc(100vh - 2rem);
    }
  }
</style> 