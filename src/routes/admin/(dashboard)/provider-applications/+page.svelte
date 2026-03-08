<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import { 
    Search, Filter, Calendar, Tag, 
    FileText, CheckCircle2, XCircle, Clock,
    MoreHorizontal, Edit2, Check, X,
    ChevronLeft, ChevronRight, MapPin, Phone,
    Briefcase, Sparkles, User
  } from 'lucide-svelte';

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
      default: return 'bg-gray-100 text-gray-800 border-slate-700/50';
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

<div class="space-y-8 font-inter">
  <!-- Header -->
  <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
    <div class="space-y-1">
      <div class="flex items-center gap-2 mb-1">
        <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
           <FileText size={18} />
        </div>
        <p class="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Administración</p>
      </div>
      <h1 class="text-3xl font-bold text-slate-900 tracking-tight font-outfit">
        Aplicaciones de <span class="text-blue-600">Proveedores</span>
      </h1>
      <p class="text-slate-500 font-medium">Gestiona y revisa las solicitudes de nuevos prestadores de servicios.</p>
    </div>
    
    <div class="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2.5 rounded-2xl shadow-sm">
      <div class="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
        <Sparkles size={20} />
      </div>
      <div>
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Registros</p>
        <p class="text-lg font-bold text-slate-900 leading-none">{totalApplications > 999 ? '999+' : totalApplications}</p>
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
  <div class="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 relative overflow-hidden group">
    <div class="absolute right-0 top-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-50/50 transition-colors"></div>
    
    <div class="flex items-center gap-3 mb-6 relative z-10">
      <div class="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
        <Filter size={20} />
      </div>
      <h3 class="text-lg font-bold text-slate-900 font-outfit">Filtros de Búsqueda</h3>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
      <!-- Search Filter -->
      <div class="space-y-2">
        <label for="search" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
          Palabra Clave
        </label>
        <div class="relative group">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
            <Search size={18} />
          </div>
          <input
            id="search"
            type="text"
            bind:value={searchFilter}
            placeholder="Nombre, email, ubicación..."
            class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all font-medium"
          />
        </div>
      </div>

      <!-- Status Filter -->
      <div class="space-y-2">
        <label for="status" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
          Estado Solicitud
        </label>
        <div class="relative group">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
            <Clock size={18} />
          </div>
          <select
            id="status"
            bind:value={statusFilter}
            class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all font-medium appearance-none"
          >
            <option value="all">Todos los estados</option>
            <option value="submitted">Enviadas</option>
            <option value="in_review">En Revisión</option>
            <option value="approved">Aprobadas</option>
            <option value="rejected">Rechazadas</option>
          </select>
        </div>
      </div>

      <!-- Category Filter -->
      <div class="space-y-2">
        <label for="category" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
           Categoría Servicio
        </label>
        <div class="relative group">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
            <Tag size={18} />
          </div>
          <select
            id="category"
            bind:value={categoryFilter}
            class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all font-medium appearance-none"
          >
            <option value="all">Todas las categorías</option>
            {#each categories as category}
              <option value={category.id.toString()}>{category.name}</option>
            {/each}
          </select>
        </div>
      </div>

      <!-- Date Filter -->
      <div class="space-y-2">
        <label for="date" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
          Rango de Fecha
        </label>
        <div class="relative group">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
            <Calendar size={18} />
          </div>
          <select
            id="date"
            bind:value={dateFilter}
            class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all font-medium appearance-none"
          >
            <option value="all">Todas las fechas</option>
            <option value="today">Hoy</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
          </select>
        </div>
      </div>
    </div>
  </div>

  <!-- Applications List -->
  {#if loading}
    <div class="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
      <LoadingSpinner size="lg" color="primary" text="Cargando aplicaciones..." />
    </div>
  {:else if applications.length === 0}
    <div class="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-20 flex flex-col items-center justify-center text-center">
      <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6 group-hover:scale-110 transition-transform">
        <FileText size={40} />
      </div>
      <h3 class="text-xl font-bold text-slate-900 font-outfit mb-2">No se encontraron aplicaciones</h3>
      <p class="text-slate-500 max-w-sm">No hay registros que coincidan con los filtros seleccionados actualmente.</p>
      <button 
        class="mt-8 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2"
        on:click={() => { statusFilter = 'all'; searchFilter = ''; categoryFilter = 'all'; dateFilter = 'all'; loadApplications(); }}
      >
        <Filter size={18} />
        Limpiar Filtros
      </button>
    </div>
  {:else}
    <div class="space-y-6">
      {#each applications as application}
        <div class="group bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-600/5 transition-all duration-300 overflow-hidden">
          <div class="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-50">
            <!-- Left Side: Main Info -->
            <div class="flex-1 p-8">
              <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div class="flex items-center gap-4">
                  <div class="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-outfit font-bold text-xl shrink-0 group-hover:scale-110 transition-transform">
                    {getUserDisplayName(application).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-slate-900 font-outfit group-hover:text-blue-600 transition-colors">
                      {application.headline}
                    </h3>
                    <div class="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                      <p class="text-sm font-bold text-slate-500 flex items-center gap-1.5">
                        <User size={14} class="text-slate-400" />
                        {getUserDisplayName(application)}
                      </p>
                      <p class="text-sm font-medium text-slate-400 flex items-center gap-1.5">
                        <Phone size={14} />
                         {application.phone}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div class="flex flex-col items-end gap-2">
                  <span class={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm ${getStatusColor(application.status)}`}>
                    <span class="w-1.5 h-1.5 rounded-full mr-2 animate-pulse bg-current"></span>
                    {getStatusText(application.status)}
                  </span>
                  <div class="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <Clock size={12} />
                    {formatDate(application.created_at)}
                  </div>
                </div>
              </div>

              <div class="bg-slate-50/50 rounded-2xl p-5 mb-6">
                <p class="text-slate-600 leading-relaxed text-sm line-clamp-2">
                  {application.bio}
                </p>
              </div>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div class="space-y-1">
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tarifa</p>
                  <p class="text-base font-bold text-slate-900">C${application.hourly_rate}<span class="text-slate-400 text-xs font-medium">/hora</span></p>
                </div>
                <div class="space-y-1">
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Experiencia</p>
                  <p class="text-base font-bold text-slate-900">{application.experience_years}<span class="text-slate-400 text-xs font-medium"> años</span></p>
                </div>
                <div class="space-y-1">
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ubicación</p>
                  <p class="text-sm font-bold text-slate-900 flex items-center gap-1">
                    <MapPin size={14} class="text-blue-500" />
                    {application.location}
                  </p>
                </div>
                <div class="space-y-1">
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tipo</p>
                  <span class={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border shadow-sm ${application.application_data?.provider_type === 'company' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                    {application.application_data?.provider_type === 'company' ? '🏢 Empresa' : '👤 Individual'}
                  </span>
                </div>
              </div>

              {#if Array.isArray(application.categories) && application.categories.length > 0}
                <div class="mt-8 pt-6 border-t border-slate-50 flex flex-wrap gap-2">
                  {#each application.categories as categoryId}
                    <span class="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-600 shadow-sm hover:border-blue-200 hover:text-blue-600 transition-colors cursor-default">
                      <Tag size={12} class="text-blue-400" />
                      {getCategoryName(typeof categoryId === 'number' ? categoryId : ((categoryId as any).category_id || (categoryId as any).id || 0))}
                    </span>
                  {/each}
                </div>
              {/if}
            </div>

            <!-- Right Side: Quick Actions -->
            <div class="w-full lg:w-48 bg-slate-50/30 p-8 flex flex-col justify-center gap-3 shrink-0">
               {#if application.status === 'submitted' || application.status === 'in_review'}
                  <button
                    class="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50"
                    disabled={updatingStatus.has(application.id)}
                    on:click={() => updateApplicationStatus(application.id, 'approved')}
                  >
                    {#if updatingStatus.has(application.id)}
                      <LoadingSpinner size="sm" color="white" />
                    {:else}
                      <Check size={18} />
                      Aprobar
                    {/if}
                  </button>
                  
                  <button
                    class="w-full flex items-center justify-center gap-2 py-3 bg-white text-rose-600 border border-rose-100 rounded-2xl font-bold text-sm shadow-sm hover:bg-rose-50 hover:border-rose-200 transition-all active:scale-95 disabled:opacity-50"
                    disabled={updatingStatus.has(application.id)}
                    on:click={() => updateApplicationStatus(application.id, 'rejected', 'No cumple con los requisitos')}
                  >
                    {#if updatingStatus.has(application.id)}
                      <LoadingSpinner size="sm" color="primary" />
                    {:else}
                      <X size={18} />
                      Rechazar
                    {/if}
                  </button>
                {:else}
                   <button
                    class="w-full flex items-center justify-center gap-2 py-3 bg-white text-blue-600 border border-blue-100 rounded-2xl font-bold text-sm shadow-sm hover:bg-blue-50 hover:border-blue-200 transition-all active:scale-95 disabled:opacity-50"
                    disabled={updatingStatus.has(application.id)}
                    on:click={() => updateApplicationStatus(application.id, 'in_review')}
                  >
                     <Clock size={16} />
                     Revisar
                  </button>
                {/if}
                
                <button
                  class="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95"
                  on:click={() => openEditModal(application)}
                >
                  <Edit2 size={16} />
                  Editar
                </button>

                <div class="mt-2 text-center">
                   <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: #{application.id}</p>
                </div>
            </div>
          </div>
        </div>
      {/each}
    </div>

    <!-- Pagination -->
    {#if totalPages > 1}
      <div class="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
        <div class="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Mostrando <span class="text-slate-900">{(currentPage - 1) * limit + 1} - {Math.min(currentPage * limit, totalApplications)}</span> de <span class="text-blue-600 font-black">{totalApplications > 999 ? '999+' : totalApplications}</span>
        </div>
        
        <div class="flex items-center gap-2">
          <button
            class="w-10 h-10 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
            disabled={currentPage === 1}
            on:click={() => { currentPage = Math.max(1, currentPage - 1); loadApplications(); }}
          >
            <ChevronLeft size={18} class="group-hover:-translate-x-0.5 transition-transform" />
          </button>
          
          <div class="flex items-center gap-1.5">
            {#each Array.from({length: totalPages}, (_, i) => i + 1) as page}
              {#if page === currentPage || page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)}
                <button
                  class="w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all shadow-blue-600/20"
                  class:bg-blue-600={page === currentPage}
                  class:text-white={page === currentPage}
                  class:shadow-lg={page === currentPage}
                  class:bg-slate-50={page !== currentPage}
                  class:text-slate-400={page !== currentPage}
                  class:hover:bg-slate-100={page !== currentPage}
                  on:click={() => { currentPage = page; loadApplications(); }}
                >
                  {page}
                </button>
              {:else if page === currentPage - 2 || page === currentPage + 2}
                <span class="w-10 text-center text-slate-300 font-bold">...</span>
              {/if}
            {/each}
          </div>
          
          <button
            class="w-10 h-10 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
            disabled={currentPage === totalPages}
            on:click={() => { currentPage = Math.min(totalPages, currentPage + 1); loadApplications(); }}
          >
            <ChevronRight size={18} class="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    {/if}
  {/if}
</div>

<!-- Edit Modal -->
{#if showEditModal && editingApplication}
  <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-500">
    <div class="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-900/20 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-100">
      <!-- Modal Header -->
      <div class="p-8 border-b border-slate-50 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <Edit2 size={24} />
          </div>
          <div>
            <h3 class="text-xl font-bold text-slate-900 font-outfit">
              Editar Aplicación
            </h3>
            <p class="text-sm font-medium text-slate-400 uppercase tracking-widest leading-none mt-1">
              ID: #{editingApplication.id} • {editingApplication.headline}
            </p>
          </div>
        </div>
        <button 
          class="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all"
          on:click={closeEditModal}
        >
          <X size={20} />
        </button>
      </div>
      
      <!-- Modal Body -->
      <div class="p-8 space-y-10 overflow-y-auto font-inter">
        <!-- Sección 1: Datos Personales -->
        <div class="space-y-6">
          <div class="flex items-center gap-2 pb-2 border-b border-slate-50">
            <User size={18} class="text-blue-500" />
            <h4 class="text-sm font-bold text-slate-900 uppercase tracking-widest font-outfit">Datos Personales</h4>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                Tipo de Prestador
              </span>
              <div class="flex gap-4">
                <label class="flex-1 flex items-center justify-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-2xl cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-all group">
                  <input
                    type="radio"
                    bind:group={editForm.provider_type}
                    value="individual"
                    class="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-600"
                  />
                  <span class="text-xs font-bold text-slate-600 group-hover:text-blue-700">Individual</span>
                </label>
                <label class="flex-1 flex items-center justify-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-2xl cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-all group">
                  <input
                    type="radio"
                    bind:group={editForm.provider_type}
                    value="company"
                    class="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-600"
                  />
                  <span class="text-xs font-bold text-slate-600 group-hover:text-blue-700">Empresa</span>
                </label>
              </div>
            </div>

            <div class="space-y-2">
              <label for="edit-email" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                Correo Electrónico
              </label>
              <input
                id="edit-email"
                type="email"
                bind:value={editForm.email}
                class="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-slate-500 font-medium cursor-not-allowed"
                readonly
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="space-y-2">
              <label for="edit-first-name" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                Nombre(s)
              </label>
              <input
                id="edit-first-name"
                type="text"
                bind:value={editForm.first_name}
                class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all font-medium"
              />
            </div>
            
            <div class="space-y-2">
              <label for="edit-last-name" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                Apellido(s)
              </label>
              <input
                id="edit-last-name"
                type="text"
                bind:value={editForm.last_name}
                class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all font-medium"
              />
            </div>

            <div class="space-y-2">
              <label for="edit-phone" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                Teléfono
              </label>
              <div class="relative group">
                 <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Phone size={16} />
                </div>
                <input
                  id="edit-phone"
                  type="tel"
                  bind:value={editForm.phone}
                  class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="md:col-span-1 space-y-2">
              <label for="edit-department" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                Departamento
              </label>
              <select
                id="edit-department"
                bind:value={editForm.department}
                on:change={() => editForm.city = ''}
                class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all font-medium appearance-none"
              >
                <option value="">Selecciona...</option>
                {#each departments as department}
                  <option value={department.name}>{department.name}</option>
                {/each}
              </select>
            </div>
            
            <div class="md:col-span-1 space-y-2">
              <label for="edit-city" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                Ciudad
              </label>
              <select
                id="edit-city"
                bind:value={editForm.city}
                disabled={!editForm.department}
                class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all font-medium appearance-none disabled:bg-slate-50 disabled:text-slate-300"
              >
                <option value="">Selecciona...</option>
                {#each availableCities as city}
                  <option value={city}>{city}</option>
                {/each}
              </select>
            </div>

             <div class="md:col-span-1 space-y-2">
              <label for="edit-address" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                Dirección Detallada
              </label>
              <input
                id="edit-address"
                type="text"
                bind:value={editForm.address}
                class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all font-medium"
              />
            </div>
          </div>
        </div>

        <!-- Sección 2: Perfil Profesional -->
        <div class="space-y-6">
          <div class="flex items-center gap-2 pb-2 border-b border-slate-50">
            <Briefcase size={18} class="text-blue-500" />
            <h4 class="text-sm font-bold text-slate-900 uppercase tracking-widest font-outfit">Perfil Profesional</h4>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="md:col-span-2 space-y-2">
              <label for="edit-headline" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                Título del Servicio
              </label>
              <input
                id="edit-headline"
                type="text"
                bind:value={editForm.headline}
                class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all font-medium"
              />
            </div>

             <div class="space-y-2">
              <label for="edit-hourly-rate" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                Tarifa (C$/Hora)
              </label>
              <input
                id="edit-hourly-rate"
                type="number"
                bind:value={editForm.hourly_rate}
                min="0"
                step="50"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all font-medium"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div class="space-y-2">
              <label for="edit-experience" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                Años Experiencia
              </label>
              <input
                id="edit-experience"
                type="number"
                bind:value={editForm.experience_years}
                min="0"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all font-medium"
              />
            </div>

            <div class="space-y-2">
              <label for="edit-location-summary" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                Resumen Ubicación
              </label>
              <input
                id="edit-location-summary"
                type="text"
                bind:value={editForm.location}
                class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all font-medium"
              />
            </div>
          </div>
          
          <div class="space-y-2">
            <label for="edit-bio" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
              Biografía / Descripción del Servicio
            </label>
            <textarea
              id="edit-bio"
              bind:value={editForm.bio}
              rows="4"
              class="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-[2rem] text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all font-medium resize-none"
            ></textarea>
          </div>
        </div>
        
        <!-- Sección 3: Categorías -->
        <div class="space-y-6">
          <div class="flex items-center gap-2 pb-2 border-b border-slate-50">
            <Tag size={18} class="text-blue-500" />
            <h4 class="text-sm font-bold text-slate-900 uppercase tracking-widest font-outfit">Categorías de Servicio</h4>
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {#each categories as category (category.id)}
              <label class="group flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl cursor-pointer hover:bg-white hover:shadow-lg hover:shadow-blue-600/5 hover:border-blue-200 transition-all">
                <input
                  type="checkbox"
                  bind:group={editForm.categories}
                  value={category.id}
                  class="w-5 h-5 text-blue-600 border-slate-300 rounded-lg focus:ring-blue-600"
                />
                <span class="text-xs font-bold text-slate-600 group-hover:text-blue-700">{category.name}</span>
              </label>
            {/each}
          </div>
        </div>

        <!-- Sección 4: Disponibilidad -->
        <div class="space-y-6">
          <div class="flex items-center gap-2 pb-2 border-b border-slate-50">
            <Calendar size={18} class="text-blue-500" />
            <h4 class="text-sm font-bold text-slate-900 uppercase tracking-widest font-outfit">Horarios de Disponibilidad</h4>
          </div>
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {#each Object.entries(editForm.availability) as [day, schedule] (day)}
              <div class="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] group hover:bg-white hover:shadow-md transition-all">
                <div class="w-24 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  {day === 'monday' ? 'Lunes' : 
                   day === 'tuesday' ? 'Martes' :
                   day === 'wednesday' ? 'Miércoles' :
                   day === 'thursday' ? 'Jueves' :
                   day === 'friday' ? 'Viernes' :
                   day === 'saturday' ? 'Sábado' : 'Domingo'}
                </div>
                <div class="flex gap-2">
                  <label class="flex items-center gap-2 px-3 py-2 bg-white border border-slate-100 rounded-xl cursor-pointer hover:border-blue-200 transition-all">
                    <input type="checkbox" bind:checked={schedule.morning} class="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-600" />
                    <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mañana</span>
                  </label>
                  <label class="flex items-center gap-2 px-3 py-2 bg-white border border-slate-100 rounded-xl cursor-pointer hover:border-blue-200 transition-all">
                    <input type="checkbox" bind:checked={schedule.afternoon} class="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-600" />
                    <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tarde</span>
                  </label>
                  <label class="flex items-center gap-2 px-3 py-2 bg-white border border-slate-100 rounded-xl cursor-pointer hover:border-blue-200 transition-all">
                    <input type="checkbox" bind:checked={schedule.evening} class="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-600" />
                    <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Noche</span>
                  </label>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
      
      <!-- Modal Footer -->
      <div class="p-8 border-t border-slate-50 flex justify-end gap-3 shrink-0 bg-slate-50/50">
        <button
          class="px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-[1.5rem] font-bold text-sm hover:bg-slate-100 transition-all active:scale-95"
          on:click={closeEditModal}
          disabled={savingEdit}
        >
          Descartar
        </button>
        <button
          class="px-10 py-4 bg-blue-600 text-white rounded-[1.5rem] font-bold text-sm shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 min-w-[160px] justify-center"
          on:click={saveEdit}
          disabled={savingEdit}
        >
          {#if savingEdit}
            <LoadingSpinner size="sm" color="white" />
          {:else}
            <Check size={18} />
            Guardar Cambios
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if} 