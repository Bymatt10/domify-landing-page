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

  onMount(loadCustomers);

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
                                <button class="btn btn-secondary btn-sm">Ver Detalles</button>
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
</style> 