<script lang="ts">
  import { onMount } from 'svelte';
  import { debounce } from '$lib/utils'; // Asumimos que existe un helper debounce

  let providers: any[] = [];
  let loading = true;
  let error = '';
  let total = 0;
  let page = 1;
  let totalPages = 1;
  let limit = 10;
  let search = '';

  // Modal state
  let showModal = false;
  let selectedProvider: any = null;
  
  // Categories
  let categories: any[] = [];
  let selectedCategories: number[] = [];
  
  // Estado de edición
  let isEditing = false;
  let saving = false;
  let editForm = {
    business_name: '',
    headline: '',
    bio: '',
    hourly_rate: 0,
    location: '',
    phone: '',
    email: '',
    categories: [] as number[]
  };
  
  // Estado de activación/desactivación
  let updatingStatus = false;

  function viewProviderProfile(provider: any) {
    selectedProvider = provider;
    showModal = true;
    isEditing = false;
    
    // Inicializar formulario de edición
    editForm = {
      business_name: provider.business_name || '',
      headline: provider.headline || '',
      bio: provider.bio || '',
      hourly_rate: provider.hourly_rate || 0,
      location: provider.location || '',
      phone: provider.phone || '',
      email: provider.user?.email || '',
      categories: provider.categories ? provider.categories.map((cat: any) => cat.id) : []
    };
  }

  function startEditing() {
    isEditing = true;
  }

  function cancelEditing() {
    isEditing = false;
    // Restaurar valores originales
    editForm = {
      business_name: selectedProvider.business_name || '',
      headline: selectedProvider.headline || '',
      bio: selectedProvider.bio || '',
      hourly_rate: selectedProvider.hourly_rate || 0,
      location: selectedProvider.location || '',
      phone: selectedProvider.phone || '',
      email: selectedProvider.user?.email || '',
      categories: selectedProvider.categories ? selectedProvider.categories.map((cat: any) => cat.id) : []
    };
  }

  async function saveProvider() {
    if (!selectedProvider) return;
    
    saving = true;
    try {
      const res = await fetch(`/api/admin/providers/${selectedProvider.user_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...editForm,
          category_ids: editForm.categories
        })
      });

      if (res.ok) {
        const updatedProvider = await res.json();
        
        // Recargar la lista completa para obtener las categorías actualizadas
        await loadProviders();
        
        // Buscar el proveedor actualizado en la nueva lista
        const updatedProviderWithCategories = providers.find(p => p.user_id === selectedProvider.user_id);
        
        if (updatedProviderWithCategories) {
          // Actualizar el proveedor seleccionado con los datos completos
          selectedProvider = updatedProviderWithCategories;
          
          // Actualizar el formulario de edición con las nuevas categorías
          editForm = {
            business_name: selectedProvider.business_name || '',
            headline: selectedProvider.headline || '',
            bio: selectedProvider.bio || '',
            hourly_rate: selectedProvider.hourly_rate || 0,
            location: selectedProvider.location || '',
            phone: selectedProvider.phone || '',
            email: selectedProvider.user?.email || '',
            categories: selectedProvider.categories ? selectedProvider.categories.map((cat: any) => cat.id) : []
          };
        }
        
        isEditing = false;
        
        // Mostrar mensaje de éxito
        alert('Proveedor actualizado exitosamente');
        
      } else {
        const errorData = await res.json();
        alert(`Error al actualizar proveedor: ${errorData.error || 'Error desconocido'}`);
      }
    } catch (e) {
      console.error('Error saving provider:', e);
      alert('Error al guardar los cambios');
    } finally {
      saving = false;
    }
  }

  async function toggleProviderStatus(provider: any, action: 'activate' | 'deactivate') {
    if (!provider) return;
    
    const confirmMessage = action === 'deactivate' 
      ? '¿Estás seguro de que deseas desactivar este proveedor? No podrá recibir nuevas reservas.'
      : '¿Estás seguro de que deseas activar este proveedor?';
    
    if (!confirm(confirmMessage)) return;
    
    updatingStatus = true;
    try {
      const res = await fetch(`/api/admin/providers/${provider.user_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      });

      if (res.ok) {
        const result = await res.json();
        
        // Actualizar el proveedor en la lista
        const providerIndex = providers.findIndex(p => p.user_id === provider.user_id);
        if (providerIndex !== -1) {
          providers[providerIndex] = { ...providers[providerIndex], ...result.provider };
          providers = providers; // Trigger reactivity
        }
        
        // Si el proveedor está seleccionado en el modal, actualizarlo también
        if (selectedProvider && selectedProvider.user_id === provider.user_id) {
          selectedProvider = { ...selectedProvider, ...result.provider };
        }
        
        alert(result.message);
        
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error || 'Error desconocido'}`);
      }
    } catch (e) {
      console.error('Error updating provider status:', e);
      alert('Error al cambiar el estado del proveedor');
    } finally {
      updatingStatus = false;
    }
  }

  function closeModal() {
    showModal = false;
    selectedProvider = null;
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

  async function loadProviders() {
    loading = true;
    error = '';
    const url = new URL('/api/admin/providers', window.location.origin);
    url.searchParams.set('page', page.toString());
    url.searchParams.set('limit', limit.toString());
    url.searchParams.set('search', search);

    try {
      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        providers = data.providers;
        total = data.total;
        totalPages = data.totalPages;
      } else {
        const data = await res.json();
        error = data.error || 'Fallo al cargar los proveedores';
      }
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  }

  async function loadCategories() {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        if (data && data.data && Array.isArray(data.data.categories)) {
          categories = data.data.categories;
        } else {
          console.warn('Category data is not in the expected format:', data);
          categories = [];
        }
      } else {
        console.error('Failed to load categories, response not OK');
        categories = [];
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  onMount(() => {
    Promise.all([
      loadProviders(),
      loadCategories()
    ]);
    document.addEventListener('keydown', handleKeydown);
    
    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  });

  const handleSearch = debounce(() => {
    page = 1;
    loadProviders();
  }, 300);

  function goToPage(newPage: number) {
    if (newPage > 0 && newPage <= totalPages) {
      page = newPage;
      loadProviders();
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
        <h1>Módulo de Proveedores</h1>
        <p>Gestiona los perfiles de los proveedores de servicios registrados en la plataforma.</p>
    </header>

    <div class="filters-section">
        <div class="filter-group">
            <label for="search-filter">Buscar Proveedor:</label>
            <input 
              id="search-filter"
              type="text" 
              bind:value={search}
              on:input={handleSearch}
              placeholder="Buscar por nombre, teléfono..."
            />
        </div>
    </div>

    {#if loading}
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Cargando proveedores...</p>
        </div>
    {:else if error}
        <div class="notice-banner warning">
            <div class="notice-icon">⚠️</div>
            <div class="notice-content">
                <h4>Error al Cargar Datos</h4>
                <p>{error}</p>
                <button class="btn btn-secondary" on:click={loadProviders}>Reintentar</button>
            </div>
        </div>
    {:else if providers.length === 0}
        <div class="empty-state">
            <h3>No se encontraron proveedores</h3>
            <p>No hay proveedores que coincidan con la búsqueda actual.</p>
        </div>
    {:else}
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th class="provider-col">Proveedor</th>
                        <th class="contact-col">Contacto</th>
                        <th class="categories-col">Categorías</th>
                        <th class="location-col">Ubicación</th>
                        <th class="status-col">Estado</th>
                        <th class="date-col">Registro</th>
                        <th class="actions-col">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {#each providers as provider}
                        <tr>
                            <td class="provider-col">
                                <div class="provider-info">
                                    <div class="provider-name">{provider.business_name || 'Sin nombre'}</div>
                                    <div class="provider-id">ID: {provider.user_id.slice(0, 8)}...</div>
                                </div>
                            </td>
                            <td class="contact-col">
                                <div class="contact-info">
                                    <div class="email">{provider.user?.email || 'Sin email'}</div>
                                    <div class="phone">{provider.phone || 'Sin teléfono'}</div>
                                </div>
                            </td>
                            <td class="categories-col">
                                <div class="categories-info">
                                    {#if provider.categories && provider.categories.length > 0}
                                        <div class="category-tags">
                                            {#each provider.categories as category}
                                                <span class="category-tag">
                                                    {category.icon || '🛠️'} {category.name}
                                                </span>
                                            {/each}
                                        </div>
                                    {:else}
                                        <span class="no-categories">Sin categorías</span>
                                    {/if}
                                </div>
                            </td>
                            <td class="location-col">
                                <span class="location">{provider.location || 'No especificado'}</span>
                            </td>
                            <td class="status-col">
                                <div class="status-badge {provider.is_active ? 'active' : 'inactive'}">
                                    {provider.is_active ? '✅ Activo' : '❌ Inactivo'}
                                </div>
                            </td>
                            <td class="date-col">
                                <span class="date">{formatDate(provider.created_at)}</span>
                            </td>
                            <td class="actions-col">
                                <div class="action-buttons">
                                    <button 
                                      class="btn btn-primary btn-sm" 
                                      on:click={() => viewProviderProfile(provider)}
                                    >
                                      Ver
                                    </button>
                                    {#if provider.is_active === false}
                                        <button 
                                          class="btn btn-success btn-sm"
                                          on:click={() => toggleProviderStatus(provider, 'activate')}
                                          disabled={updatingStatus}
                                        >
                                          Activar
                                        </button>
                                    {:else}
                                        <button 
                                          class="btn btn-danger btn-sm"
                                          on:click={() => toggleProviderStatus(provider, 'deactivate')}
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
                Mostrando {providers.length} de {total} proveedores
            </div>
            <div class="pagination-controls">
                <button class="btn btn-secondary" on:click={() => goToPage(page - 1)} disabled={page <= 1}>Anterior</button>
                <span>Página {page} de {totalPages}</span>
                <button class="btn btn-secondary" on:click={() => goToPage(page + 1)} disabled={page >= totalPages}>Siguiente</button>
            </div>
        </div>
    {/if}
</div>

<!-- Modal para ver perfil del proveedor -->
{#if showModal && selectedProvider}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="modal-overlay" on:click={closeModal}>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="modal-content" on:click|stopPropagation>
      <div class="modal-header">
        <h2>Perfil del Proveedor</h2>
        <button class="modal-close" on:click={closeModal}>&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="profile-section">
          <h3>Información General</h3>
          
          {#if isEditing}
            <div class="edit-form">
              <div class="form-grid">
                <div class="form-item">
                  <label for="business_name">Nombre del Negocio:</label>
                  <input 
                    id="business_name"
                    type="text" 
                    bind:value={editForm.business_name}
                    placeholder="Ingrese el nombre del negocio"
                  />
                </div>
                <div class="form-item">
                  <label for="headline">Título/Especialidad:</label>
                  <input 
                    id="headline"
                    type="text" 
                    bind:value={editForm.headline}
                    placeholder="Ingrese la especialidad"
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
                  <label for="phone">Teléfono:</label>
                  <input 
                    id="phone"
                    type="tel" 
                    bind:value={editForm.phone}
                    placeholder="Ingrese el teléfono"
                  />
                </div>
                <div class="form-item">
                  <label for="location">Ubicación:</label>
                  <input 
                    id="location"
                    type="text" 
                    bind:value={editForm.location}
                    placeholder="Ingrese la ubicación"
                  />
                </div>
                <div class="form-item">
                  <label for="hourly_rate">Tarifa por Hora (C$):</label>
                  <input 
                    id="hourly_rate"
                    type="number" 
                    min="0"
                    step="0.01"
                    bind:value={editForm.hourly_rate}
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div class="form-item full-width">
                <label for="bio">Descripción:</label>
                <textarea 
                  id="bio"
                  bind:value={editForm.bio}
                  placeholder="Descripción de los servicios y experiencia"
                  rows="4"
                ></textarea>
              </div>

              <!-- Categorías -->
              <div class="form-item full-width">
                <label>Categorías de Servicios:</label>
                <div class="categories-selection">
                  {#if categories.length > 0}
                    <div class="categories-grid">
                      {#each categories as category}
                        <label class="category-checkbox">
                          <input
                            type="checkbox"
                            value={category.id}
                            bind:group={editForm.categories}
                          />
                          <span class="checkbox-label">
                            <span class="category-icon">{category.icon || '🛠️'}</span>
                            <span class="category-name">{category.name}</span>
                          </span>
                        </label>
                      {/each}
                    </div>
                  {:else}
                    <p class="no-categories-available">Cargando categorías...</p>
                  {/if}
                </div>
              </div>
              
              <div class="readonly-info">
                <div class="info-item">
                  <label>Estado:</label>
                  <span class="status-text {selectedProvider.is_active ? 'active' : 'inactive'}">
                    {selectedProvider.is_active ? '✅ Activo' : '❌ Inactivo'}
                  </span>
                </div>
              </div>
            </div>
          {:else}
            <div class="info-grid">
              <div class="info-item">
                <label>Nombre del Negocio:</label>
                <span>{selectedProvider.business_name || 'No especificado'}</span>
              </div>
              <div class="info-item">
                <label>Email:</label>
                <span>{selectedProvider.user?.email || 'Sin email'}</span>
              </div>
              <div class="info-item">
                <label>Teléfono:</label>
                <span>{selectedProvider.phone || 'Sin teléfono'}</span>
              </div>
              <div class="info-item">
                <label>Ubicación:</label>
                <span>{selectedProvider.location || 'No especificado'}</span>
              </div>
              <div class="info-item">
                <label>Tarifa por Hora:</label>
                <span>{formatCurrency(selectedProvider.hourly_rate)}</span>
              </div>
              <div class="info-item">
                <label>Estado:</label>
                <span class="status-text {selectedProvider.is_active ? 'active' : 'inactive'}">
                  {selectedProvider.is_active ? '✅ Activo' : '❌ Inactivo'}
                </span>
              </div>
            </div>
            
            {#if selectedProvider.bio}
              <div class="bio-section">
                <h4>Descripción</h4>
                <p>{selectedProvider.bio}</p>
              </div>
            {/if}

            <!-- Categorías del proveedor -->
            <div class="categories-section">
              <h4>Categorías de Servicios</h4>
              {#if selectedProvider.categories && selectedProvider.categories.length > 0}
                <div class="provider-categories-display">
                  {#each selectedProvider.categories as category}
                    <span class="category-display-tag">
                      {category.icon || '🛠️'} {category.name}
                    </span>
                  {/each}
                </div>
              {:else}
                <p class="no-categories-text">Este proveedor no tiene categorías asignadas.</p>
              {/if}
            </div>
          {/if}
          
          <div class="profile-section">
            <h3>Información Técnica</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>ID de Usuario:</label>
                <span class="monospace">{selectedProvider.user_id}</span>
              </div>
              <div class="info-item">
                <label>ID del Perfil:</label>
                <span class="monospace">{selectedProvider.id}</span>
              </div>
              <div class="info-item">
                <label>Fecha de Registro:</label>
                <span>{formatDate(selectedProvider.created_at)}</span>
              </div>
              <div class="info-item">
                <label>Última Actualización:</label>
                <span>{formatDate(selectedProvider.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        {#if isEditing}
          <div class="modal-actions-left">
          </div>
          <div class="modal-actions-right">
            <button class="btn btn-secondary" on:click={cancelEditing} disabled={saving}>
              Cancelar
            </button>
            <button class="btn btn-primary" on:click={saveProvider} disabled={saving}>
              {#if saving}
                <span class="spinner-sm"></span>
                Guardando...
              {:else}
                💾 Guardar Cambios
              {/if}
            </button>
          </div>
        {:else}
          <div class="modal-actions-left">
            {#if selectedProvider.is_active === false}
              <button 
                class="btn btn-success" 
                on:click={() => toggleProviderStatus(selectedProvider, 'activate')}
                disabled={updatingStatus}
              >
                {#if updatingStatus}
                  <span class="spinner-sm"></span>
                  Activando...
                {:else}
                  ✅ Activar Proveedor
                {/if}
              </button>
            {:else}
              <button 
                class="btn btn-danger" 
                on:click={() => toggleProviderStatus(selectedProvider, 'deactivate')}
                disabled={updatingStatus}
              >
                {#if updatingStatus}
                  <span class="spinner-sm"></span>
                  Desactivando...
                {:else}
                  ❌ Desactivar Proveedor
                {/if}
              </button>
            {/if}
          </div>
          <div class="modal-actions-right">
            <button class="btn btn-secondary" on:click={closeModal}>Cerrar</button>
            <button class="btn btn-primary" on:click={startEditing}>
              ✏️ Editar Proveedor
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
    min-width: 800px;
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
  .provider-col { width: 25%; }
  .contact-col { width: 25%; }
  .location-col { width: 20%; }
  .status-col { width: 12%; }
  .date-col { width: 13%; }
  .actions-col { width: 5%; }
  
  /* Información del proveedor */
  .provider-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .provider-name { 
    font-weight: 600; 
    color: #1f2937; 
    font-size: 0.875rem;
  }
  
  .provider-id { 
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
  
  /* Ubicación */
  .location {
    font-size: 0.875rem;
    color: #374151;
  }
  
  /* Estado mejorado */
  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.375rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }
  
  .status-badge.active { 
    color: #065f46; 
    background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
    border: 1px solid #34d399;
  }
  
  .status-badge.inactive { 
    color: #7c2d12; 
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    border: 1px solid #f59e0b;
  }
  
  /* Fecha */
  .date {
    font-size: 0.8rem;
    color: #6b7280;
  }

  /* Categorías */
  .categories-col {
    width: 20%;
    min-width: 150px;
  }

  .categories-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .category-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .category-tag {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    color: #1e40af;
    border: 1px solid #3b82f6;
    border-radius: 12px;
    font-size: 0.7rem;
    font-weight: 500;
    white-space: nowrap;
  }

  .no-categories {
    font-size: 0.75rem;
    color: #9ca3af;
    font-style: italic;
  }

  /* Estilos para la selección de categorías en el modal */
  .categories-selection {
    margin-top: 0.5rem;
  }

  .categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0.75rem;
    margin-top: 0.5rem;
  }

  .category-checkbox {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 0.75rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    transition: all 0.2s ease;
    background: white;
  }

  .category-checkbox:hover {
    border-color: #3b82f6;
    background: #f8fafc;
  }

  .category-checkbox input[type="checkbox"] {
    margin-right: 0.75rem;
    width: 16px;
    height: 16px;
    accent-color: #3b82f6;
  }

  .category-checkbox input[type="checkbox"]:checked + .checkbox-label {
    color: #1e40af;
    font-weight: 600;
  }

  .category-checkbox:has(input[type="checkbox"]:checked) {
    border-color: #3b82f6;
    background: linear-gradient(135deg, #dbeafe 0%, #f0f9ff 100%);
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
  }

  .category-icon {
    font-size: 1.25rem;
  }

  .category-name {
    font-weight: 500;
  }

  .no-categories-available {
    color: #6b7280;
    font-style: italic;
    text-align: center;
    padding: 1rem;
  }

  /* Estilos para mostrar categorías en modo lectura */
  .categories-section {
    margin-top: 1.5rem;
  }

  .categories-section h4 {
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
    margin: 0 0 0.75rem 0;
  }

  .provider-categories-display {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .category-display-tag {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem 0.75rem;
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    color: #1e40af;
    border: 1px solid #3b82f6;
    border-radius: 16px;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .no-categories-text {
    color: #6b7280;
    font-style: italic;
    margin: 0;
    padding: 1rem;
    background: #f9fafb;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
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
  
  /* Responsive */
  @media (max-width: 1024px) {
    .admin-page {
      padding: 1rem;
    }
    
    .provider-col { width: 25%; }
    .contact-col { width: 25%; }
    .categories-col { width: 20%; }
    .location-col { width: 20%; }
    .status-col { width: 10%; }
    .date-col { display: none; }
  }
  
  @media (max-width: 768px) {
    .table-container {
      border-radius: 8px;
    }
    
    th, td {
      padding: 0.75rem 0.5rem;
    }
    
    .provider-name {
      font-size: 0.8rem;
    }
    
    .email {
      font-size: 0.8rem;
    }

    .categories-col {
      display: none;
    }
  }

  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease-out;
  }

  .modal-content {
    background: white;
    border-radius: 16px;
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    overflow: hidden;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    animation: slideIn 0.3s ease-out;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid #e5e7eb;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  }

  .modal-header h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
  }

  .modal-close {
    background: none;
    border: none;
    font-size: 2rem;
    cursor: pointer;
    color: #6b7280;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s ease;
  }

  .modal-close:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }

  .modal-body {
    padding: 2rem;
    max-height: 60vh;
    overflow-y: auto;
  }

  .profile-section {
    margin-bottom: 2rem;
  }

  .profile-section:last-child {
    margin-bottom: 0;
  }

  .profile-section h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 1rem 0;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #e5e7eb;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .info-item label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .info-item span {
    font-size: 0.95rem;
    color: #1f2937;
    padding: 0.5rem 0;
  }

  .monospace {
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
    background: #f8fafc;
    padding: 0.5rem !important;
    border-radius: 6px;
    font-size: 0.8rem !important;
    border: 1px solid #e5e7eb;
  }

  .description-box {
    background: #f8fafc;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1rem;
    font-size: 0.95rem;
    line-height: 1.6;
    color: #374151;
    min-height: 60px;
  }

  .modal-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem 2rem;
    border-top: 1px solid #e5e7eb;
    background: #f8fafc;
  }

  .modal-actions-left,
  .modal-actions-right {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  /* Formulario de edición */
  .edit-form {
    space-y: 1.5rem;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .form-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-item.full-width {
    grid-column: 1 / -1;
  }

  .form-item label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
  }

  .form-item input,
  .form-item textarea {
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 0.875rem;
    transition: all 0.2s ease;
    background: white;
  }

  .form-item input:focus,
  .form-item textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .form-item textarea {
    resize: vertical;
    min-height: 100px;
  }

  .readonly-info {
    margin-top: 1.5rem;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
  }

  .readonly-info .info-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }

  .readonly-info .info-item:last-child {
    margin-bottom: 0;
  }

  .readonly-info label {
    min-width: 80px;
    font-size: 0.875rem;
    font-weight: 600;
    color: #6b7280;
  }

  .status-text {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .status-text.active {
    background: #dcfce7;
    color: #166534;
  }

  .status-text.inactive {
    background: #fee2e2;
    color: #991b1b;
  }

  .bio-section {
    margin-top: 1.5rem;
  }

  .bio-section h4 {
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
    margin: 0 0 0.75rem 0;
  }

  .bio-section p {
    font-size: 0.9rem;
    line-height: 1.6;
    color: #4b5563;
    margin: 0;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
  }

  /* Spinner pequeño */
  .spinner-sm {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-right: 0.5rem;
  }

  /* Botones de acción en la tabla */
  .action-buttons {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-wrap: wrap;
  }

  .action-buttons .btn {
    min-width: auto;
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideIn {
    from { 
      opacity: 0;
      transform: translateY(-20px) scale(0.95);
    }
    to { 
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* Modal responsive */
  @media (max-width: 768px) {
    .modal-content {
      width: 95%;
      margin: 1rem;
    }

    .modal-header,
    .modal-body,
    .modal-footer {
      padding: 1rem;
    }

    .info-grid {
      grid-template-columns: 1fr;
    }
  }
</style> 