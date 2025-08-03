<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

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
    categories: number[] | Array<{category_id?: number; id?: number; name?: string}>;
    availability: any;
    application_data?: {
      first_name?: string;
      last_name?: string;
      address?: string;
      department?: string;
      city?: string;
      provider_type?: string;
      experience_years?: number;
      availability?: any;
      certifications?: string[];
      [key: string]: any;
    };
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
  let statusFilter = 'submitted'; // Por defecto mostrar aplicaciones pendientes
  let searchFilter = '';
  let categoryFilter = 'all';
  let dateFilter = 'all';

  // Estados de carga
  let updatingStatus = new Set<number>();

  // Categorías para mapear IDs a nombres
  let categories: Array<{id: number, name: string}> = [];

  // Datos geográficos de Nicaragua
  const departments = [
    { name: 'Managua', cities: ['Managua', 'Ciudad Sandino', 'El Crucero', 'San Francisco Libre', 'Tipitapa', 'Villa Carlos Fonseca'] },
    { name: 'León', cities: ['León', 'La Paz Centro', 'Nagarote', 'Quezalguaque', 'Santa Rosa del Peñón', 'Telica'] },
    { name: 'Granada', cities: ['Granada', 'Diriá', 'Diriomo', 'Nandaime'] },
    { name: 'Masaya', cities: ['Masaya', 'Catarina', 'La Concepción', 'Masatepe', 'Nandasmo', 'Nindirí', 'Niquinohomo', 'San Juan de Oriente', 'Tisma'] },
    { name: 'Carazo', cities: ['Jinotepe', 'Diriamba', 'Dolores', 'El Rosario', 'La Conquista', 'La Paz de Carazo', 'San Marcos', 'Santa Teresa'] },
    { name: 'Chinandega', cities: ['Chinandega', 'Chichigalpa', 'Corinto', 'El Realejo', 'El Viejo', 'Posoltega', 'Puerto Morazán', 'San Francisco del Norte', 'San Pedro del Norte', 'Santo Tomás del Norte', 'Somotillo', 'Villanueva'] },
    { name: 'Rivas', cities: ['Rivas', 'Altagracia', 'Belén', 'Buenos Aires', 'Cárdenas', 'Moyogalpa', 'Potosí', 'San Jorge', 'San Juan del Sur', 'Tola'] },
    { name: 'Boaco', cities: ['Boaco', 'Camoapa', 'San José de los Remates', 'San Lorenzo', 'Santa Lucía', 'Teustepe'] },
    { name: 'Chontales', cities: ['Juigalpa', 'Acoyapa', 'Comalapa', 'El Coral', 'La Libertad', 'San Francisco de Cuapa', 'San Pedro de Lóvago', 'Santo Domingo', 'Santo Tomás', 'Villa Sandino'] },
    { name: 'Jinotega', cities: ['Jinotega', 'El Cuá', 'La Concordia', 'San José de Bocay', 'San Rafael del Norte', 'San Sebastián de Yalí', 'Santa María de Pantasma', 'Wiwilí de Jinotega'] },
    { name: 'Matagalpa', cities: ['Matagalpa', 'Ciudad Darío', 'El Tuma - La Dalia', 'Esquipulas', 'Matiguás', 'Muy Muy', 'Rancho Grande', 'Río Blanco', 'San Dionisio', 'San Isidro', 'San Ramón', 'Sébaco', 'Terrabona'] },
    { name: 'Nueva Segovia', cities: ['Ocotal', 'Ciudad Antigua', 'Dipilto', 'El Jícaro', 'Jalapa', 'Macuelizo', 'Mozonte', 'Murra', 'Quilalí', 'San Fernando', 'Santa María', 'Wiwilí de Nueva Segovia'] },
    { name: 'Estelí', cities: ['Estelí', 'Condega', 'La Trinidad', 'Pueblo Nuevo', 'San Juan de Limay', 'San Nicolás'] },
    { name: 'Madriz', cities: ['Somoto', 'Las Sabanas', 'Palacagüina', 'San José de Cusmapa', 'San Lucas', 'Telpaneca', 'Totogalpa', 'Yalagüina'] },
    { name: 'Río San Juan', cities: ['San Carlos', 'El Almendro', 'El Castillo', 'Morrito', 'San Miguelito'] },
    { name: 'RACCS', cities: ['Bluefields', 'Corn Island', 'Desembocadura de la Cruz de Río Grande', 'El Ayote', 'El Rama', 'El Tortuguero', 'Kukra Hill', 'La Cruz de Río Grande', 'Laguna de Perlas', 'Muelle de los Bueyes', 'Nueva Guinea', 'Paiwas'] },
    { name: 'RACCN', cities: ['Bilwi', 'Bonanza', 'Mulukukú', 'Prinzapolka', 'Rosita', 'Siuna', 'Waslala', 'Waspam'] }
  ];

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
    categories: [] as number[],
    email: '',
    first_name: '',
    last_name: '',
    address: '',
    department: '',
    city: '',
    provider_type: '',
    availability: {
      monday: { morning: false, afternoon: false, evening: false },
      tuesday: { morning: false, afternoon: false, evening: false },
      wednesday: { morning: false, afternoon: false, evening: false },
      thursday: { morning: false, afternoon: false, evening: false },
      friday: { morning: false, afternoon: false, evening: false },
      saturday: { morning: false, afternoon: false, evening: false },
      sunday: { morning: false, afternoon: false, evening: false }
    }
  };
  let savingEdit = false;

  // Ciudades disponibles basadas en el departamento seleccionado
  $: availableCities = editForm.department ? departments.find(d => d.name === editForm.department)?.cities || [] : [];

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
          // console.log removed
        }
      } else {
        const errorData = await response.json();
        error = errorData.error?.message || 'Error al cargar aplicaciones.';
        
        // No mostrar datos de ejemplo, solo mostrar el error
        applications = [];
        totalApplications = 0;
        totalPages = 1;
      }
    } catch (err) {
      console.error('Error loading applications:', err);
      applications = [];
      totalApplications = 0;
      totalPages = 1;
      error = 'No se pudieron cargar las aplicaciones.';
    } finally {
      loading = false;
    }
  }



  async function updateApplicationStatus(applicationId: number, newStatus: string, rejectionReason?: string) {
    updatingStatus.add(applicationId);
    updatingStatus = updatingStatus;

    try {
      const response = await fetch(`/api/provider-applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          rejection_reason: rejectionReason
        })
      });

      			if (response.ok) {
				await loadApplications();
				// Refrescar el badge del sidebar
				if (typeof window !== 'undefined' && (window as any).refreshAdminBadge) {
					(window as any).refreshAdminBadge();
				}
			} else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error?.message || 'No se pudo actualizar el estado'}`);
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      alert('Error de conexión al actualizar el estado');
    } finally {
      updatingStatus.delete(applicationId);
      updatingStatus = updatingStatus;
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  function getStatusText(status: string) {
    switch (status) {
      case 'submitted': return 'Enviada';
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

  function getUserDisplayName(application: ProviderApplication) {
    if (application.user?.raw_user_meta_data?.first_name) {
      const firstName = application.user.raw_user_meta_data.first_name;
      const lastName = application.user.raw_user_meta_data.last_name || '';
      return `${firstName} ${lastName}`.trim();
    }
    return application.user?.email || application.email || 'Usuario desconocido';
  }

  function openEditModal(application: ProviderApplication) {
    editingApplication = application;
    editForm = {
      headline: application.headline,
      bio: application.bio,
      hourly_rate: application.hourly_rate,
      location: application.location,
      phone: application.phone,
      experience_years: application.experience_years || application.application_data?.experience_years || 0,
      categories: Array.isArray(application.categories) 
        ? application.categories.map(c => {
            if (typeof c === 'number') return c;
            return (c as any).category_id || (c as any).id || 0;
          }).filter(id => id > 0)
        : [],
      email: application.email || application.user?.email || '',
      first_name: application.application_data?.first_name || application.user?.raw_user_meta_data?.first_name || '',
      last_name: application.application_data?.last_name || application.user?.raw_user_meta_data?.last_name || '',
      address: application.application_data?.address || '',
      department: application.application_data?.department || '',
      city: application.application_data?.city || '',
      provider_type: application.application_data?.provider_type || '',
      availability: application.application_data?.availability || application.availability || {
        monday: { morning: false, afternoon: false, evening: false },
        tuesday: { morning: false, afternoon: false, evening: false },
        wednesday: { morning: false, afternoon: false, evening: false },
        thursday: { morning: false, afternoon: false, evening: false },
        friday: { morning: false, afternoon: false, evening: false },
        saturday: { morning: false, afternoon: false, evening: false },
        sunday: { morning: false, afternoon: false, evening: false }
      }
    };
    showEditModal = true;
  }

  function closeEditModal() {
    showEditModal = false;
    editingApplication = null;
    savingEdit = false;
  }

  async function saveEdit() {
    if (!editingApplication) return;

    savingEdit = true;
    try {
      const response = await fetch(`/api/provider-applications/${editingApplication.id}`, {
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
          categories: editForm.categories,
          email: editForm.email,
          application_data: {
            first_name: editForm.first_name,
            last_name: editForm.last_name,
            address: editForm.address,
            department: editForm.department,
            city: editForm.city,
            provider_type: editForm.provider_type,
            availability: editForm.availability,
            experience_years: editForm.experience_years
          }
        })
      });

      if (response.ok) {
        await loadApplications();
        closeEditModal();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error?.message || 'No se pudo guardar la edición'}`);
      }
    } catch (error) {
      console.error('Error saving edit:', error);
      alert('Error de conexión al guardar');
    } finally {
      savingEdit = false;
    }
  }

  // Debounce para el campo de búsqueda
  let searchTimeout: NodeJS.Timeout;
  
  // Reactive statements para filtros (excepto búsqueda)
  $: {
    if (statusFilter || categoryFilter || dateFilter) {
      currentPage = 1;
      loadApplications();
    }
  }

  // Debounce para búsqueda
  $: if (searchFilter !== undefined) {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentPage = 1;
      loadApplications();
    }, 500); // Esperar 500ms después de que el usuario deje de escribir
  }
</script>

<svelte:head>
  <title>Aplicaciones de Proveedores - Domify Admin</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 class="text-3xl font-bold text-secondary-900">Aplicaciones de Proveedores</h1>
      <p class="mt-2 text-secondary-600">Gestiona las solicitudes de nuevos proveedores</p>
    </div>
    <div class="mt-4 sm:mt-0">
      <div class="flex items-center space-x-2 text-sm text-secondary-500">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <span>Total: {totalApplications > 999 ? '999+' : totalApplications} aplicaciones</span>
      </div>
    </div>
  </div>

  <!-- Error Banner -->
  {#if error}
    <div class="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-4">
      <div class="flex items-start space-x-3">
        <div class="flex-shrink-0">
          <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <div>
          <h4 class="text-sm font-semibold text-yellow-800">Aviso</h4>
          <p class="mt-1 text-sm text-yellow-700">{error}</p>
        </div>
      </div>
    </div>
  {/if}

  <!-- Filters -->
  <div class="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
    <h3 class="text-lg font-semibold text-secondary-900 mb-4">Filtros</h3>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Search Filter -->
      <div>
        <label for="search" class="block text-sm font-medium text-secondary-700 mb-2">
          Buscar
        </label>
        <div class="relative">
          <input
            id="search"
            type="text"
            bind:value={searchFilter}
            placeholder="Buscar por nombre, email, título, ubicación..."
            class="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
          />
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>
      </div>

      <!-- Status Filter -->
      <div>
        <label for="status" class="block text-sm font-medium text-secondary-700 mb-2">
          Estado
        </label>
        <select
          id="status"
          bind:value={statusFilter}
          class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
        >
          <option value="all">Todos los estados</option>
          <option value="submitted">Enviadas</option>
          <option value="in_review">En Revisión</option>
          <option value="approved">Aprobadas</option>
          <option value="rejected">Rechazadas</option>
        </select>
      </div>

      <!-- Category Filter -->
      <div>
        <label for="category" class="block text-sm font-medium text-secondary-700 mb-2">
          Categoría
        </label>
        <select
          id="category"
          bind:value={categoryFilter}
          class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
        >
          <option value="all">Todas las categorías</option>
          {#each categories as category}
            <option value={category.id.toString()}>{category.name}</option>
          {/each}
        </select>
      </div>

      <!-- Date Filter -->
      <div>
        <label for="date" class="block text-sm font-medium text-secondary-700 mb-2">
          Fecha
        </label>
        <select
          id="date"
          bind:value={dateFilter}
          class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
        >
          <option value="all">Todas las fechas</option>
          <option value="today">Hoy</option>
          <option value="week">Esta semana</option>
          <option value="month">Este mes</option>
        </select>
      </div>
    </div>
  </div>

  <!-- Applications List -->
  {#if loading}
    <div class="flex items-center justify-center py-12">
      <LoadingSpinner size="lg" color="primary" text="Cargando aplicaciones..." />
    </div>
  {:else if applications.length === 0}
    <div class="bg-white rounded-xl shadow-sm border border-secondary-200 p-12">
      <div class="text-center">
        <svg class="w-16 h-16 text-secondary-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <h3 class="text-lg font-semibold text-secondary-900 mb-2">No hay aplicaciones</h3>
        <p class="text-secondary-600">No se encontraron aplicaciones con los filtros actuales.</p>
      </div>
    </div>
  {:else}
    <div class="space-y-4">
      {#each applications as application}
        <div class="bg-white rounded-xl shadow-sm border border-secondary-200 p-6 hover:shadow-md transition-shadow duration-200">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <!-- Application Info -->
            <div class="flex-1">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h3 class="text-lg font-semibold text-secondary-900 mb-1">
                    {application.headline}
                  </h3>
                  <p class="text-sm text-secondary-600">
                    {getUserDisplayName(application)} • {application.user?.email || application.email}
                  </p>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border {getStatusColor(application.status)}">
                    {getStatusText(application.status)}
                  </span>
                </div>
              </div>

              <p class="text-secondary-700 mb-4 line-clamp-2">
                {application.bio}
              </p>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span class="text-secondary-500">Tarifa:</span>
                  <span class="font-medium text-secondary-900 ml-1">C${application.hourly_rate}/hora</span>
                </div>
                <div>
                  <span class="text-secondary-500">Experiencia:</span>
                  <span class="font-medium text-secondary-900 ml-1">{application.experience_years} años</span>
                </div>
                <div>
                  <span class="text-secondary-500">Ubicación:</span>
                  <span class="font-medium text-secondary-900 ml-1">{application.location}</span>
                </div>
                <div>
                  <span class="text-secondary-500">Fecha:</span>
                  <span class="font-medium text-secondary-900 ml-1">{formatDate(application.created_at)}</span>
                </div>
              </div>

              {#if application.application_data?.provider_type}
                <div class="mt-3">
                  <span class="text-secondary-500 text-sm">Tipo:</span>
                  <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ml-1"
                        class:bg-blue-100={application.application_data.provider_type === 'individual'}
                        class:text-blue-800={application.application_data.provider_type === 'individual'}
                        class:bg-purple-100={application.application_data.provider_type === 'company'}
                        class:text-purple-800={application.application_data.provider_type === 'company'}>
                    {application.application_data.provider_type === 'individual' ? '👤 Persona Individual' : '🏢 Empresa'}
                  </span>
                </div>
              {/if}

              {#if Array.isArray(application.categories) && application.categories.length > 0}
                <div class="mt-3">
                  <span class="text-secondary-500 text-sm">Categorías:</span>
                  <div class="flex flex-wrap gap-2 mt-1">
                    {#each application.categories as categoryId}
                      <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-800">
                        {getCategoryName(typeof categoryId === 'number' ? categoryId : ((categoryId as any).category_id || (categoryId as any).id || 0))}
                      </span>
                    {/each}
                  </div>
                </div>
              {/if}
            </div>

            <!-- Actions -->
            <div class="mt-4 lg:mt-0 lg:ml-6">
              <div class="flex flex-col space-y-2">
                {#if application.status === 'submitted' || application.status === 'in_review'}
                  <button
                    class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={updatingStatus.has(application.id)}
                    on:click={() => updateApplicationStatus(application.id, 'approved')}
                  >
                    {#if updatingStatus.has(application.id)}
                      <LoadingSpinner size="sm" color="white" />
                    {:else}
                      ✓ Aprobar
                    {/if}
                  </button>
                  
                  <button
                    class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={updatingStatus.has(application.id)}
                    on:click={() => updateApplicationStatus(application.id, 'rejected', 'No cumple con los requisitos')}
                  >
                    {#if updatingStatus.has(application.id)}
                      <LoadingSpinner size="sm" color="white" />
                    {:else}
                      ✗ Rechazar
                    {/if}
                  </button>
                {:else if application.status === 'approved'}
                  <button
                    class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={updatingStatus.has(application.id)}
                    on:click={() => updateApplicationStatus(application.id, 'in_review')}
                  >
                    🔄 Revisar
                  </button>
                {:else if application.status === 'rejected'}
                  <button
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={updatingStatus.has(application.id)}
                    on:click={() => updateApplicationStatus(application.id, 'in_review')}
                  >
                    🔄 Revisar
                  </button>
                {/if}
                
                <button
                  class="px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors duration-200 text-sm font-medium"
                  on:click={() => openEditModal(application)}
                >
                  ✏️ Editar
                </button>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>

    <!-- Pagination -->
    {#if totalPages > 1}
      <div class="bg-white rounded-xl shadow-sm border border-secondary-200 p-4">
        <div class="flex items-center justify-between">
          <div class="text-sm text-secondary-600">
            Mostrando {(currentPage - 1) * limit + 1} - {Math.min(currentPage * limit, totalApplications)} de {totalApplications > 999 ? '999+' : totalApplications} aplicaciones
          </div>
          
          <div class="flex items-center space-x-2">
            <button
              class="px-3 py-2 border border-secondary-300 rounded-lg text-sm font-medium text-secondary-700 hover:bg-secondary-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage === 1}
              on:click={() => { currentPage = Math.max(1, currentPage - 1); loadApplications(); }}
            >
              Anterior
            </button>
            
            {#each Array.from({length: totalPages}, (_, i) => i + 1) as page}
              {#if page === currentPage || page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)}
                <button
                  class="px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  class:bg-primary-600={page === currentPage}
                  class:text-white={page === currentPage}
                  class:border-primary-600={page === currentPage}
                  class:border={page === currentPage}
                  class:text-secondary-700={page !== currentPage}
                  class:hover:bg-secondary-50={page !== currentPage}
                  on:click={() => { currentPage = page; loadApplications(); }}
                >
                  {page}
                </button>
              {:else if page === currentPage - 2 || page === currentPage + 2}
                <span class="px-3 py-2 text-secondary-400">...</span>
              {/if}
            {/each}
            
            <button
              class="px-3 py-2 border border-secondary-300 rounded-lg text-sm font-medium text-secondary-700 hover:bg-secondary-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage === totalPages}
              on:click={() => { currentPage = Math.min(totalPages, currentPage + 1); loadApplications(); }}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    {/if}
  {/if}
</div>

<!-- Edit Modal -->
{#if showEditModal && editingApplication}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6 border-b border-secondary-200">
        <h3 class="text-lg font-semibold text-secondary-900">
          Editar Aplicación - {editingApplication.headline}
        </h3>
      </div>
      
      <div class="p-6 space-y-6">
        <!-- Información Personal -->
        <div class="border-b border-secondary-200 pb-4">
          <h4 class="text-md font-semibold text-secondary-900 mb-3">Información Personal</h4>
          
          <!-- Tipo de Proveedor -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-secondary-700 mb-2">
              Tipo de Proveedor
            </label>
            <div class="flex space-x-4">
              <label class="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  bind:group={editForm.provider_type}
                  value="individual"
                  class="w-4 h-4 text-primary-600 border-secondary-300 focus:ring-primary-500"
                />
                <span class="text-sm text-secondary-700">👤 Persona Individual</span>
              </label>
              <label class="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  bind:group={editForm.provider_type}
                  value="company"
                  class="w-4 h-4 text-primary-600 border-secondary-300 focus:ring-primary-500"
                />
                <span class="text-sm text-secondary-700">🏢 Empresa</span>
              </label>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                bind:value={editForm.email}
                class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                readonly
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                bind:value={editForm.phone}
                class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2">
                Nombre
              </label>
              <input
                type="text"
                bind:value={editForm.first_name}
                class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2">
                Apellido
              </label>
              <input
                type="text"
                bind:value={editForm.last_name}
                class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-2">
              Dirección
            </label>
            <input
              type="text"
              bind:value={editForm.address}
              class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2">
                Departamento
              </label>
              <select
                bind:value={editForm.department}
                on:change={() => editForm.city = ''}
                class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
              >
                <option value="">Selecciona un departamento</option>
                {#each departments as department}
                  <option value={department.name}>{department.name}</option>
                {/each}
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2">
                Ciudad
              </label>
              <select
                bind:value={editForm.city}
                disabled={!editForm.department}
                class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white disabled:bg-secondary-50 disabled:text-secondary-500"
              >
                <option value="">Selecciona una ciudad</option>
                {#each availableCities as city}
                  <option value={city}>{city}</option>
                {/each}
              </select>
            </div>
          </div>
        </div>

        <!-- Información del Servicio -->
        <div class="border-b border-secondary-200 pb-4">
          <h4 class="text-md font-semibold text-secondary-900 mb-3">Información del Servicio</h4>
          
        <div>
          <label class="block text-sm font-medium text-secondary-700 mb-2">
            Título del Servicio
          </label>
          <input
            type="text"
            bind:value={editForm.headline}
            class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        
          <div class="mt-4">
          <label class="block text-sm font-medium text-secondary-700 mb-2">
            Descripción
          </label>
          <textarea
            bind:value={editForm.bio}
            rows="4"
            class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          ></textarea>
        </div>
        
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-2">
              Tarifa por Hora (C$)
            </label>
            <input
              type="number"
              bind:value={editForm.hourly_rate}
              min="0"
              step="50"
              class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-2">
              Años de Experiencia
            </label>
            <input
              type="number"
              bind:value={editForm.experience_years}
              min="0"
              class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-secondary-700 mb-2">
            Ubicación
          </label>
          <input
            type="text"
            bind:value={editForm.location}
            class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
            </div>
          </div>
        </div>
        
        <!-- Categorías -->
        <div class="border-b border-secondary-200 pb-4">
          <h4 class="text-md font-semibold text-secondary-900 mb-3">Categorías</h4>
          
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            {#each categories as category}
              <label class="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  bind:group={editForm.categories}
                  value={category.id}
                  class="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                />
                <span class="text-sm text-secondary-700">{category.name}</span>
              </label>
            {/each}
          </div>
        </div>

        <!-- Horarios de Disponibilidad -->
        <div>
          <h4 class="text-md font-semibold text-secondary-900 mb-3">Horarios de Disponibilidad</h4>
          
          <div class="space-y-3">
            {#each Object.entries(editForm.availability) as [day, schedule]}
              <div class="flex items-center space-x-4">
                <div class="w-20 text-sm font-medium text-secondary-700 capitalize">
                  {day === 'monday' ? 'Lunes' : 
                   day === 'tuesday' ? 'Martes' :
                   day === 'wednesday' ? 'Miércoles' :
                   day === 'thursday' ? 'Jueves' :
                   day === 'friday' ? 'Viernes' :
                   day === 'saturday' ? 'Sábado' : 'Domingo'}
                </div>
                <div class="flex space-x-4">
                  <label class="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      bind:checked={schedule.morning}
                      class="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                    />
                    <span class="text-sm text-secondary-700">Mañana</span>
          </label>
                  <label class="flex items-center space-x-2">
          <input
                      type="checkbox"
                      bind:checked={schedule.afternoon}
                      class="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                    />
                    <span class="text-sm text-secondary-700">Tarde</span>
                  </label>
                  <label class="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      bind:checked={schedule.evening}
                      class="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
          />
                    <span class="text-sm text-secondary-700">Noche</span>
                  </label>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
      
      <div class="p-6 border-t border-secondary-200 flex justify-end space-x-3">
        <button
          class="px-4 py-2 border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50 transition-colors duration-200"
          on:click={closeEditModal}
          disabled={savingEdit}
        >
          Cancelar
        </button>
        <button
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          on:click={saveEdit}
          disabled={savingEdit}
        >
          {#if savingEdit}
            <LoadingSpinner size="sm" color="white" />
          {:else}
            Guardar Cambios
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if} 