<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  interface ProviderApplication {
    id: number;
    user_id: string;
    email?: string;
    status: 'submitted' | 'in_review' | 'approved' | 'rejected';
    headline: string;
    bio: string;
    hourly_rate: number;
    location: string;
    phone: string;
    experience_years: number;
    certifications: string[];
    categories: number[] | Array<{category_id: number}>;
    availability: any;
    rejection_reason?: string;
    reviewed_at?: string;
    reviewed_by_admin_id?: string;
    created_at: string;
    updated_at: string;
    user?: {
      id: string;
      email: string;
      raw_user_meta_data: {
        first_name?: string;
        last_name?: string;
      };
    };
  }

  let applications: ProviderApplication[] = [];
  let loading = true;
  let error = '';
  let totalApplications = 0;
  let currentPage = 1;
  let totalPages = 1;
  let limit = 10;

  // Filtros
  let statusFilter = 'all';
  let searchFilter = '';
  let categoryFilter = 'all';
  let dateFilter = 'all';

  // Estados de carga
  let updatingStatus = new Set<number>();

  // Categorías para mapear IDs a nombres
  let categories: Array<{id: number, name: string}> = [];

  // Modal de edición
  let showEditModal = false;
  let editingApplication: ProviderApplication | null = null;
  let editForm = {
    headline: '',
    bio: '',
    hourly_rate: 0,
    location: '',
    phone: '',
    experience_years: 0,
    categories: [] as number[]
  };
  let savingEdit = false;

  onMount(async () => {
    await Promise.all([
      loadApplications(),
      loadCategories()
    ]);
  });

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

  function getCategoryName(categoryId: number): string {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : `Categoría ${categoryId}`;
  }

  async function loadApplications() {
      loading = true;
      error = '';

    try {
      const url = new URL('/api/provider-applications', window.location.origin);
      url.searchParams.set('status', statusFilter);
      url.searchParams.set('search', searchFilter);
      if (categoryFilter !== 'all') url.searchParams.set('category', categoryFilter);
      if (dateFilter !== 'all') url.searchParams.set('date', dateFilter);
      url.searchParams.set('page', currentPage.toString());
      url.searchParams.set('limit', limit.toString());

      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        const realApplications = data.applications || [];
        
        applications = realApplications;
        totalApplications = data.total || 0;
        totalPages = data.totalPages || 1;

        if (applications.length === 0) {
          console.log('No applications found for the current filters.');
      }

      } else {
        const errorData = await response.json();
        error = errorData.error?.message || 'Error al cargar aplicaciones. Mostrando datos de ejemplo.';
        
        console.warn('Failed to load applications, using mock data');
        applications = getMockApplications();
        totalApplications = applications.length;
        totalPages = 1;
      }
    } catch (err) {
      console.error('Error loading applications:', err);
      applications = getMockApplications();
      totalApplications = applications.length;
      totalPages = Math.ceil(totalApplications / limit);
      error = 'No se pudieron cargar las aplicaciones reales. Mostrando datos de ejemplo.';
    } finally {
      loading = false;
    }
  }

  function getMockApplications(): ProviderApplication[] {
    return [
      {
        id: 1,
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        status: 'submitted',
        headline: 'Plomero Profesional',
        bio: 'Experto en reparación de tuberías, instalación de sanitarios y mantenimiento general. Con más de 5 años de experiencia.',
        hourly_rate: 450,
        location: 'Managua, Nicaragua',
        phone: '8456-7890',
        experience_years: 5,
        certifications: ['Certificación en Plomería', 'OSHA Safety'],
        categories: [1, 3],
        availability: { monday: true, tuesday: true, wednesday: true },
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z',
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'plomero@example.com',
          raw_user_meta_data: {
            first_name: 'Carlos',
            last_name: 'López'
          }
        }
      },
      {
        id: 2,
        user_id: '456e7890-e89b-12d3-a456-426614174001',
        status: 'in_review',
        headline: 'Electricista Certificado',
        bio: 'Especialista en instalaciones eléctricas residenciales y comerciales. Licenciado y asegurado.',
        hourly_rate: 500,
        location: 'León, Nicaragua',
        phone: '8234-5678',
        experience_years: 8,
        certifications: ['Licencia Eléctrica', 'Certificación Industrial'],
        categories: [2],
        availability: { monday: true, wednesday: true, friday: true },
        created_at: '2024-01-12T14:20:00Z',
        updated_at: '2024-01-14T09:15:00Z',
        user: {
          id: '456e7890-e89b-12d3-a456-426614174001',
          email: 'electricista@example.com',
          raw_user_meta_data: {
            first_name: 'María',
            last_name: 'García'
          }
        }
      },
      {
        id: 3,
        user_id: '789e0123-e89b-12d3-a456-426614174002',
        status: 'approved',
        headline: 'Carpintero Experto',
        bio: 'Fabricación de muebles personalizados, reparación y restauración de madera. Trabajo de alta calidad garantizado.',
        hourly_rate: 600,
        location: 'Granada, Nicaragua',
        phone: '8345-6789',
        experience_years: 12,
        certifications: ['Maestro Carpintero', 'Diseño de Muebles'],
        categories: [1, 4],
        availability: { tuesday: true, thursday: true, saturday: true },
        created_at: '2024-01-10T08:45:00Z',
        updated_at: '2024-01-13T16:30:00Z',
        reviewed_at: '2024-01-13T16:30:00Z',
        user: {
          id: '789e0123-e89b-12d3-a456-426614174002',
          email: 'carpintero@example.com',
          raw_user_meta_data: {
            first_name: 'Luis',
            last_name: 'Martínez'
          }
        }
      },
      {
        id: 4,
        user_id: '012e3456-e89b-12d3-a456-426614174003',
        status: 'submitted',
        headline: 'Técnico en Aire Acondicionado',
        bio: 'Instalación, mantenimiento y reparación de sistemas de aire acondicionado residencial y comercial.',
        hourly_rate: 550,
        location: 'Masaya, Nicaragua',
        phone: '8567-8901',
        experience_years: 6,
        certifications: ['Certificación HVAC', 'Refrigeración'],
        categories: [2, 3],
        availability: { monday: true, tuesday: true, thursday: true, friday: true },
        created_at: '2024-01-18T11:15:00Z',
        updated_at: '2024-01-18T11:15:00Z',
        user: {
          id: '012e3456-e89b-12d3-a456-426614174003',
          email: 'hvac@example.com',
          raw_user_meta_data: {
            first_name: 'Ana',
            last_name: 'Rodríguez'
          }
        }
      },
      {
        id: 5,
        user_id: '345e6789-e89b-12d3-a456-426614174004',
        status: 'rejected',
        headline: 'Jardinero',
        bio: 'Servicios de jardinería y paisajismo para hogares y empresas.',
        hourly_rate: 300,
        location: 'Estelí, Nicaragua',
        phone: '8678-9012',
        experience_years: 3,
        certifications: ['Curso de Jardinería'],
        categories: [5],
        availability: { saturday: true, sunday: true },
        rejection_reason: 'Documentación incompleta',
        reviewed_at: '2024-01-16T13:45:00Z',
        created_at: '2024-01-14T07:30:00Z',
        updated_at: '2024-01-16T13:45:00Z',
        user: {
          id: '345e6789-e89b-12d3-a456-426614174004',
          email: 'jardinero@example.com',
          raw_user_meta_data: {
            first_name: 'Pedro',
            last_name: 'Hernández'
          }
        }
      }
    ];
  }

  async function updateApplicationStatus(applicationId: number, newStatus: string) {
    try {
      updatingStatus.add(applicationId);

      const response = await fetch(`/api/provider-applications?id=${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error.message);
      }

      // Actualizar la aplicación en la lista
      applications = applications.map(app => 
        app.id === applicationId 
          ? { ...app, status: newStatus as any, updated_at: new Date().toISOString() }
          : app
      );

    } catch (err) {
      error = err instanceof Error ? err.message : 'Error al actualizar el estado';
      console.error('Error updating application status:', err);
    } finally {
      updatingStatus.delete(applicationId);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'submitted': return 'yellow';
      case 'in_review': return 'blue';
      case 'approved': return 'green';
      case 'rejected': return 'red';
      default: return 'gray';
    }
  }

  function getStatusText(status: string) {
    switch (status) {
      case 'submitted': return 'Pendiente';
      case 'in_review': return 'En Revisión';
      case 'approved': return 'Aprobada';
      case 'rejected': return 'Rechazada';
      default: return status;
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages) {
      currentPage = page;
      loadApplications();
    }
  }

  function applyFilters() {
    currentPage = 1;
    loadApplications();
  }

  function clearFilters() {
    statusFilter = 'all';
    searchFilter = '';
    categoryFilter = 'all';
    dateFilter = 'all';
    currentPage = 1;
    loadApplications();
  }

  // Funciones para edición
  function openEditModal(application: ProviderApplication) {
    editingApplication = application;
    editForm = {
      headline: application.headline,
      bio: application.bio,
      hourly_rate: application.hourly_rate,
      location: application.location,
      phone: application.phone,
      experience_years: application.experience_years,
      categories: Array.isArray(application.categories) 
        ? application.categories.map(cat => typeof cat === 'object' ? cat.category_id : cat)
        : []
    };
    showEditModal = true;
  }

  function closeEditModal() {
    showEditModal = false;
    editingApplication = null;
    savingEdit = false;
  }

  async function saveApplicationEdit() {
    if (!editingApplication) return;

    savingEdit = true;
    try {
      const response = await fetch(`/api/provider-applications?id=${editingApplication.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          headline: editForm.headline,
          bio: editForm.bio,
          hourly_rate: editForm.hourly_rate,
          location: editForm.location,
          phone: editForm.phone,
          experience_years: editForm.experience_years,
          categories: editForm.categories
        })
      });

      if (response.ok) {
        closeEditModal();
        await loadApplications(); // Recargar la lista
      } else {
        const errorData = await response.json();
        alert(`Error al actualizar: ${errorData.error || 'Error desconocido'}`);
      }
    } catch (err) {
      console.error('Error updating application:', err);
      alert('Error de conexión al actualizar la aplicación');
    } finally {
      savingEdit = false;
    }
  }

  function toggleCategory(categoryId: number) {
    if (editForm.categories.includes(categoryId)) {
      editForm.categories = editForm.categories.filter(id => id !== categoryId);
    } else {
      editForm.categories = [...editForm.categories, categoryId];
    }
  }
</script>

<div class="admin-page">
  <!-- Header -->
  <header class="page-header">
    <div class="header-content">
      <h1>Aplicaciones de Proveedores</h1>
      <p>Gestiona las solicitudes de nuevos proveedores</p>
    </div>
  </header>

  <!-- Filtros -->
  <div class="filters-section">
    <div class="filters-grid">
      <div class="filter-group">
        <label for="status-filter">Estado:</label>
        <select id="status-filter" bind:value={statusFilter} on:change={applyFilters}>
          <option value="all">Todos los estados</option>
          <option value="submitted">Pendiente</option>
          <option value="in_review">En Revisión</option>
          <option value="approved">Aprobada</option>
          <option value="rejected">Rechazada</option>
        </select>
      </div>

      <div class="filter-group">
        <label for="search-filter">Buscar:</label>
        <input 
          id="search-filter"
          type="text" 
          placeholder="Buscar por título..." 
          bind:value={searchFilter}
          on:keyup={(e) => e.key === 'Enter' && applyFilters()}
        />
      </div>

      <div class="filter-group">
        <label for="date-filter">Fecha:</label>
        <select id="date-filter" bind:value={dateFilter} on:change={applyFilters}>
          <option value="all">Todas las fechas</option>
          <option value="today">Hoy</option>
          <option value="week">Esta semana</option>
          <option value="month">Este mes</option>
        </select>
      </div>

      <div class="filter-actions">
        <button class="btn btn-primary" on:click={applyFilters}>
          Aplicar Filtros
        </button>
        <button class="btn btn-secondary" on:click={clearFilters}>
          Limpiar
        </button>
      </div>
    </div>
  </div>

  <!-- Solo mostrar aviso si realmente hay error y se usan datos de ejemplo -->
  {#if error && applications.length > 0 && applications[0].id === 1}
    <div class="notice-banner warning">
      <div class="notice-icon">⚠️</div>
      <div class="notice-content">
        <h4>Mostrando Datos de Ejemplo</h4>
        <p>{error}</p>
      </div>
    </div>
  {/if}

  <!-- Estadísticas -->
  <div class="stats-bar">
    <div class="stat-item">
      <span class="stat-label">Total:</span>
      <span class="stat-value">{totalApplications}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Pendientes:</span>
      <span class="stat-value yellow">{applications.filter(app => app.status === 'submitted').length}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">En Revisión:</span>
      <span class="stat-value blue">{applications.filter(app => app.status === 'in_review').length}</span>
    </div>
  </div>

  <!-- Error Message -->
  {#if error}
    <div class="error-message">
      <p>{error}</p>
      <button class="btn btn-secondary" on:click={() => { error = ''; loadApplications(); }}>
        Reintentar
      </button>
    </div>
  {/if}

  <!-- Loading State -->
  {#if loading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Cargando aplicaciones...</p>
    </div>
  {:else if applications.length === 0}
    <div class="empty-state">
      <svg class="empty-icon" viewBox="0 0 24 24">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <h3>No hay aplicaciones</h3>
      <p>No se encontraron aplicaciones con los filtros actuales.</p>
    </div>
  {:else}
    <!-- Applications List -->
    <div class="applications-list">
      {#each applications as application}
        <div class="application-card">
          <div class="application-header">
            <div class="application-info">
              <h3>{application.headline}</h3>
              <p class="application-meta">
                <span class="user-info">
                  {application.user?.raw_user_meta_data?.first_name} {application.user?.raw_user_meta_data?.last_name} 
                  ({application.email || application.user?.email || 'Email no disponible'})
                </span>
                <span class="date">{formatDate(application.created_at)}</span>
              </p>
            </div>
            <div class="status-badge {getStatusColor(application.status)}">
              {getStatusText(application.status)}
            </div>
          </div>

          <div class="application-content">
            <p class="description">{application.bio}</p>
            
            <div class="application-details">
              <div class="detail-item">
                <span class="label">Experiencia:</span>
                <span class="value">{application.experience_years} años</span>
              </div>
              <div class="detail-item">
                <span class="label">Tarifa por hora:</span>
                <span class="value">${application.hourly_rate}</span>
              </div>
              <div class="detail-item">
                <span class="label">Ubicación:</span>
                <span class="value">{application.location}</span>
              </div>
              <div class="detail-item">
                <span class="label">Teléfono:</span>
                <span class="value">{application.phone}</span>
              </div>
                              {#if application.categories && application.categories.length > 0}
                  <div class="detail-item">
                    <span class="label">Categorías:</span>
                    <span class="value">
                      {#each application.categories as category, index}
                        {getCategoryName(typeof category === 'object' ? category.category_id : category)}{index < application.categories.length - 1 ? ', ' : ''}
                      {/each}
                    </span>
                  </div>
                {/if}
            </div>
          </div>

          <div class="application-actions">
            <!-- Botón de editar siempre disponible -->
            <button 
              class="btn btn-secondary"
              on:click={() => openEditModal(application)}
            >
              📝 Editar
            </button>

            {#if application.status === 'submitted'}
              <button 
                class="btn btn-primary"
                disabled={updatingStatus.has(application.id)}
                on:click={() => updateApplicationStatus(application.id, 'in_review')}
              >
                {updatingStatus.has(application.id) ? 'Actualizando...' : 'Poner en Revisión'}
              </button>
            {/if}
            
            {#if application.status === 'in_review'}
              <button 
                class="btn btn-success"
                disabled={updatingStatus.has(application.id)}
                on:click={() => updateApplicationStatus(application.id, 'approved')}
              >
                {updatingStatus.has(application.id) ? 'Actualizando...' : 'Aprobar'}
              </button>
              <button 
                class="btn btn-danger"
                disabled={updatingStatus.has(application.id)}
                on:click={() => updateApplicationStatus(application.id, 'rejected')}
              >
                {updatingStatus.has(application.id) ? 'Actualizando...' : 'Rechazar'}
              </button>
            {/if}

            {#if application.status === 'approved'}
              <span class="status-message success">✓ Aplicación aprobada</span>
            {/if}

            {#if application.status === 'rejected'}
              <span class="status-message error">✗ Aplicación rechazada</span>
            {/if}
          </div>
        </div>
      {/each}
    </div>

    <!-- Pagination -->
    {#if totalPages > 1}
      <div class="pagination">
        <button 
          class="btn btn-secondary" 
          disabled={currentPage === 1}
          on:click={() => goToPage(currentPage - 1)}
        >
          Anterior
        </button>
        
        <div class="page-numbers">
          {#each Array.from({length: totalPages}, (_, i) => i + 1) as page}
            <button 
              class="btn {currentPage === page ? 'btn-primary' : 'btn-secondary'}"
              on:click={() => goToPage(page)}
            >
              {page}
            </button>
          {/each}
        </div>
        
        <button 
          class="btn btn-secondary" 
          disabled={currentPage === totalPages}
          on:click={() => goToPage(currentPage + 1)}
        >
          Siguiente
        </button>
      </div>
    {/if}
  {/if}
</div>

<!-- Modal de Edición -->
{#if showEditModal && editingApplication}
  <div class="modal-overlay" on:click={closeEditModal}>
    <div class="modal-content" on:click|stopPropagation>
      <div class="modal-header">
        <h2>Editar Aplicación</h2>
        <button class="modal-close" on:click={closeEditModal}>×</button>
      </div>

      <div class="modal-body">
        <form on:submit|preventDefault={saveApplicationEdit}>
          <div class="form-grid">
            <div class="form-group">
              <label for="edit-headline">Título del Servicio *</label>
              <input 
                id="edit-headline"
                type="text" 
                bind:value={editForm.headline}
                required
                placeholder="Ej: Plomero Profesional"
              />
            </div>

            <div class="form-group">
              <label for="edit-hourly-rate">Tarifa por Hora *</label>
              <input 
                id="edit-hourly-rate"
                type="number" 
                bind:value={editForm.hourly_rate}
                min="1"
                required
                placeholder="150"
              />
            </div>

            <div class="form-group">
              <label for="edit-location">Ubicación *</label>
              <input 
                id="edit-location"
                type="text" 
                bind:value={editForm.location}
                required
                placeholder="Managua, Nicaragua"
              />
            </div>

            <div class="form-group">
              <label for="edit-phone">Teléfono *</label>
              <input 
                id="edit-phone"
                type="tel" 
                bind:value={editForm.phone}
                required
                placeholder="8456-7890"
              />
            </div>

            <div class="form-group">
              <label for="edit-experience">Años de Experiencia *</label>
              <input 
                id="edit-experience"
                type="number" 
                bind:value={editForm.experience_years}
                min="0"
                required
                placeholder="5"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="edit-bio">Descripción del Servicio *</label>
            <textarea 
              id="edit-bio"
              bind:value={editForm.bio}
              required
              rows="4"
              placeholder="Describe tu experiencia y servicios..."
            ></textarea>
          </div>

          <div class="form-group">
            <label>Categorías de Servicio</label>
            <div class="categories-grid">
              {#each categories as category}
                <label class="category-checkbox">
                  <input 
                    type="checkbox" 
                    checked={editForm.categories.includes(category.id)}
                    on:change={() => toggleCategory(category.id)}
                  />
                  <span class="checkmark"></span>
                  {category.name}
                </label>
              {/each}
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" on:click={closeEditModal}>
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" disabled={savingEdit}>
              {savingEdit ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
{/if}

<style>
  .admin-page {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .header-content h1 {
    margin: 0;
    font-size: 2rem;
    font-weight: 700;
    color: #1f2937;
  }

  .header-content p {
    margin: 0.5rem 0 0 0;
    color: #6b7280;
  }

  .filters-section {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .filters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    align-items: end;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .filter-group label {
    font-weight: 500;
    color: #374151;
    font-size: 0.875rem;
  }

  .filter-group select,
  .filter-group input {
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 0.875rem;
  }

  .filter-actions {
    display: flex;
    gap: 0.5rem;
  }

  .stats-bar {
    display: flex;
    gap: 2rem;
    margin-bottom: 2rem;
    padding: 1rem;
    background: #f9fafb;
    border-radius: 8px;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .stat-label {
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 0.25rem;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
  }

  .stat-value.yellow { color: #f59e0b; }
  .stat-value.blue { color: #3b82f6; }

  .notice-banner {
    background: linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%);
    border: 1px solid #f59e0b;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 2rem;
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .notice-banner.warning {
    background: linear-gradient(135deg, #fee2e2 0%, #fca5a5 100%);
    border-color: #f87171;
  }

  .notice-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .notice-content h4 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: #92400e;
  }

  .notice-banner.warning .notice-content h4 {
    color: #991b1b;
  }

  .notice-content p {
    margin: 0;
    font-size: 0.875rem;
    color: #78350f;
    line-height: 1.5;
  }

  .notice-banner.warning .notice-content p {
    color: #7f1d1d;
  }

  .error-message {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #dc2626;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 3rem;
    color: #6b7280;
  }

  .spinner {
    width: 2rem;
    height: 2rem;
    border: 2px solid #e5e7eb;
    border-top: 2px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .empty-state {
    text-align: center;
    padding: 3rem;
    color: #6b7280;
  }

  .empty-icon {
    width: 4rem;
    height: 4rem;
    margin-bottom: 1rem;
    fill: #d1d5db;
  }

  .applications-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .application-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1.5rem;
  }

  .application-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .application-info h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
  }

  .application-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.875rem;
    color: #6b7280;
  }

  .status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
  }

  .status-badge.yellow {
    background: #fef3c7;
    color: #92400e;
  }

  .status-badge.blue {
    background: #dbeafe;
    color: #1e40af;
  }

  .status-badge.green {
    background: #d1fae5;
    color: #065f46;
  }

  .status-badge.red {
    background: #fee2e2;
    color: #991b1b;
  }

  .application-content {
    margin-bottom: 1.5rem;
  }

  .description {
    color: #4b5563;
    margin-bottom: 1rem;
    line-height: 1.6;
  }

  .application-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .detail-item {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid #f3f4f6;
  }

  .detail-item .label {
    font-weight: 500;
    color: #374151;
  }

  .detail-item .value {
    color: #6b7280;
  }

  .application-actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .status-message {
    font-weight: 500;
  }

  .status-message.success {
    color: #059669;
  }

  .status-message.error {
    color: #dc2626;
  }

  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 2rem;
    padding: 1rem;
  }

  .page-numbers {
    display: flex;
    gap: 0.25rem;
  }

  .btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-primary {
    background: #3b82f6;
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: #2563eb;
  }

  .btn-secondary {
    background: #f3f4f6;
    color: #374151;
  }

  .btn-secondary:hover:not(:disabled) {
    background: #e5e7eb;
  }

  .btn-success {
    background: #10b981;
    color: white;
  }

  .btn-success:hover:not(:disabled) {
    background: #059669;
  }

  .btn-danger {
    background: #ef4444;
    color: white;
  }

  .btn-danger:hover:not(:disabled) {
    background: #dc2626;
  }

  @media (max-width: 768px) {
    .admin-page {
      padding: 1rem;
    }

    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .filters-grid {
      grid-template-columns: 1fr;
    }

    .filter-actions {
      justify-content: stretch;
    }

    .stats-bar {
      flex-direction: column;
      gap: 1rem;
    }

    .application-header {
      flex-direction: column;
      gap: 1rem;
    }

    .application-details {
      grid-template-columns: 1fr;
    }

    .application-actions {
      flex-direction: column;
      align-items: stretch;
    }
  }

  /* Estilos del Modal */
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
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    overflow: hidden;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
    background: #f9fafb;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #0C3B2E;
  }

  .modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #6b7280;
    padding: 0.25rem;
    border-radius: 4px;
    transition: background 0.2s;
  }

  .modal-close:hover {
    background: #e5e7eb;
  }

  .modal-body {
    padding: 1.5rem;
    max-height: calc(90vh - 120px);
    overflow-y: auto;
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .form-group label {
    font-weight: 600;
    color: #374151;
    font-size: 0.875rem;
  }

  .form-group input,
  .form-group textarea {
    padding: 0.75rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s;
  }

  .form-group input:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: #6D9773;
    box-shadow: 0 0 0 3px rgba(109, 151, 115, 0.1);
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
    gap: 0.5rem;
    cursor: pointer;
    padding: 0.5rem;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    transition: all 0.2s;
  }

  .category-checkbox:hover {
    background: #f9fafb;
    border-color: #6D9773;
  }

  .category-checkbox input[type="checkbox"] {
    display: none;
  }

  .checkmark {
    width: 20px;
    height: 20px;
    border: 2px solid #d1d5db;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .category-checkbox input[type="checkbox"]:checked + .checkmark {
    background: #6D9773;
    border-color: #6D9773;
  }

  .category-checkbox input[type="checkbox"]:checked + .checkmark::after {
    content: '✓';
    color: white;
    font-size: 12px;
    font-weight: bold;
  }

  .modal-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
  }

  @media (max-width: 640px) {
    .modal-overlay {
      padding: 0.5rem;
    }

    .modal-content {
      max-height: 95vh;
    }

    .form-grid {
      grid-template-columns: 1fr;
    }

    .categories-grid {
      grid-template-columns: 1fr;
    }

    .modal-actions {
      flex-direction: column;
    }
  }
</style> 