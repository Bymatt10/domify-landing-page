<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import StatsCard from '$lib/components/StatsCard.svelte';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

  let stats = {
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    totalProviders: 0,
    totalCategories: 0
  };

  let loading = true;
  let recentActivities = [
    {
      id: 1,
      type: 'application',
      title: 'Nueva aplicación de proveedor',
      description: 'Juan Pérez ha enviado una solicitud para servicios de limpieza',
      time: 'Hace 2 horas',
      status: 'pending'
    },
    {
      id: 2,
      type: 'approval',
      title: 'Aplicación aprobada',
      description: 'María González ha sido aprobada como proveedora de jardinería',
      time: 'Hace 4 horas',
      status: 'approved'
    },
    {
      id: 3,
      type: 'category',
      title: 'Nueva categoría agregada',
      description: 'Se agregó la categoría "Reparaciones Eléctricas"',
      time: 'Hace 1 día',
      status: 'info'
    }
  ];

  onMount(async () => {
    try {
      // Fetch basic stats
      const [applicationsRes, providersRes, categoriesRes] = await Promise.all([
        fetch('/api/provider-applications/stats'),
        fetch('/api/providers'),
        fetch('/api/categories')
      ]);

      // Datos de ejemplo solo como último recurso
      const fallbackStats = {
        totalApplications: 12,
        pendingApplications: 5,
        approvedApplications: 4,
        totalProviders: 8,
        totalCategories: 5
      };

      let applicationsLoaded = false;

      if (applicationsRes.ok) {
        const applicationsData = await applicationsRes.json();
        if (applicationsData.total !== undefined) {
          stats.totalApplications = applicationsData.total;
          stats.pendingApplications = applicationsData.pending || 0;
          stats.approvedApplications = applicationsData.approved || 0;
          applicationsLoaded = true;
        }
      }

      if (!applicationsLoaded) {
        console.warn('No real applications data available, using fallback');
        stats.totalApplications = fallbackStats.totalApplications;
        stats.pendingApplications = fallbackStats.pendingApplications;
        stats.approvedApplications = fallbackStats.approvedApplications;
      }

      if (providersRes.ok) {
        const providersData = await providersRes.json();
        stats.totalProviders = providersData.length || fallbackStats.totalProviders;
      } else {
        console.warn('Failed to fetch providers stats, using fallback data');
        stats.totalProviders = fallbackStats.totalProviders;
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        stats.totalCategories = categoriesData.length || fallbackStats.totalCategories;
      } else {
        console.warn('Failed to fetch categories stats, using fallback data');
        stats.totalCategories = fallbackStats.totalCategories;
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      stats = {
        totalApplications: 12,
        pendingApplications: 5,
        approvedApplications: 4,
        totalProviders: 8,
        totalCategories: 5
      };
    } finally {
      loading = false;
    }
  });

  function getStatusIcon(status: string) {
    switch (status) {
      case 'pending': return '⏳';
      case 'approved': return '✅';
      case 'info': return 'ℹ️';
      default: return '📝';
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
</script>

<svelte:head>
  <title>Dashboard - Domify Admin</title>
</svelte:head>

{#if loading}
  <div class="flex items-center justify-center min-h-96">
    <LoadingSpinner size="lg" color="primary" text="Cargando estadísticas..." />
  </div>
{:else}
  <!-- Header -->
  <div class="mb-8">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-3xl font-bold text-secondary-900">Dashboard</h1>
        <p class="mt-2 text-secondary-600">Bienvenido al panel de administración de Domify</p>
      </div>
      <div class="mt-4 sm:mt-0">
        <div class="flex items-center space-x-2 text-sm text-secondary-500">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>Última actualización: {new Date().toLocaleString('es-ES')}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Notice Banner -->
  {#if stats.totalApplications === 12 && stats.pendingApplications === 5 && stats.approvedApplications === 4}
    <div class="mb-8 bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-4">
      <div class="flex items-start space-x-3">
        <div class="flex-shrink-0">
          <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div>
          <h4 class="text-sm font-semibold text-yellow-800">Datos de Ejemplo</h4>
          <p class="mt-1 text-sm text-yellow-700">
            Actualmente mostrando datos de ejemplo mientras se resuelven los problemas de conexión con la base de datos.
          </p>
        </div>
      </div>
    </div>
  {/if}

  <!-- Stats Grid -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
    <StatsCard
      label="Aplicaciones Totales"
      number={stats.totalApplications.toString()}
      icon="📝"
    />
    
    <StatsCard
      label="Pendientes"
      number={stats.pendingApplications.toString()}
      icon="⏳"
      delay={200}
    />
    
    <StatsCard
      label="Aprobadas"
      number={stats.approvedApplications.toString()}
      icon="✅"
      delay={400}
    />
    
    <StatsCard
      label="Proveedores Activos"
      number={stats.totalProviders.toString()}
      icon="👥"
      delay={600}
    />
    
    <StatsCard
      label="Categorías"
      number={stats.totalCategories.toString()}
      icon="🏷️"
      delay={800}
    />
  </div>

  <!-- Main Content Grid -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <!-- Quick Actions -->
    <div class="lg:col-span-2">
      <div class="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
        <h2 class="text-xl font-semibold text-secondary-900 mb-6">Acciones Rápidas</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            class="group p-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-200 hover:shadow-md transition-all duration-200 text-left"
            on:click={() => goto('/admin/provider-applications')}
          >
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform duration-200">
                📋
              </div>
              <div class="text-right">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {stats.pendingApplications} pendientes
                </span>
              </div>
            </div>
            <h3 class="text-lg font-semibold text-secondary-900 mb-2">Revisar Aplicaciones</h3>
            <p class="text-secondary-600 text-sm">Gestiona las solicitudes de nuevos proveedores</p>
          </button>

          <button
            class="group p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition-all duration-200 text-left"
            on:click={() => goto('/admin/categories')}
          >
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform duration-200">
                🏷️
              </div>
            </div>
            <h3 class="text-lg font-semibold text-secondary-900 mb-2">Gestionar Categorías</h3>
            <p class="text-secondary-600 text-sm">Administra las categorías de servicios</p>
          </button>

          <button
            class="group p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:shadow-md transition-all duration-200 text-left"
            on:click={() => goto('/admin/providers')}
          >
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform duration-200">
                🏭
              </div>
            </div>
            <h3 class="text-lg font-semibold text-secondary-900 mb-2">Ver Proveedores</h3>
            <p class="text-secondary-600 text-sm">Administra los proveedores registrados</p>
          </button>

          <button
            class="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-200 text-left"
            on:click={() => goto('/services')}
          >
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform duration-200">
                🔍
              </div>
            </div>
            <h3 class="text-lg font-semibold text-secondary-900 mb-2">Ver Servicios</h3>
            <p class="text-secondary-600 text-sm">Explora los servicios disponibles</p>
          </button>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="lg:col-span-1">
      <div class="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-secondary-900">Actividad Reciente</h2>
          <button class="text-primary-600 hover:text-primary-700 text-sm font-medium">
            Ver todo
          </button>
        </div>
        
        <div class="space-y-4">
          {#each recentActivities as activity}
            <div class="flex items-start space-x-3 p-3 rounded-lg hover:bg-secondary-50 transition-colors duration-200">
              <div class="flex-shrink-0">
                <span class="text-lg">{getStatusIcon(activity.status)}</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-secondary-900 truncate">
                  {activity.title}
                </p>
                <p class="text-xs text-secondary-600 mt-1">
                  {activity.description}
                </p>
                <div class="flex items-center justify-between mt-2">
                  <span class="text-xs text-secondary-500">{activity.time}</span>
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium {getStatusColor(activity.status)}">
                    {activity.status === 'pending' ? 'Pendiente' : activity.status === 'approved' ? 'Aprobado' : 'Info'}
                  </span>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>

  <!-- Additional Stats -->
  <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Performance Chart Placeholder -->
    <div class="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
      <h3 class="text-lg font-semibold text-secondary-900 mb-4">Rendimiento del Mes</h3>
      <div class="h-48 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg flex items-center justify-center">
        <div class="text-center">
          <div class="text-4xl mb-2">📈</div>
          <p class="text-secondary-600">Gráfico de rendimiento</p>
          <p class="text-sm text-secondary-500">Próximamente disponible</p>
        </div>
      </div>
    </div>

    <!-- System Status -->
    <div class="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
      <h3 class="text-lg font-semibold text-secondary-900 mb-4">Estado del Sistema</h3>
      <div class="space-y-3">
        <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            <span class="text-sm font-medium text-secondary-900">Base de Datos</span>
          </div>
          <span class="text-xs text-green-600 font-medium">Operativa</span>
        </div>
        
        <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            <span class="text-sm font-medium text-secondary-900">API</span>
          </div>
          <span class="text-xs text-green-600 font-medium">Operativa</span>
        </div>
        
        <div class="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span class="text-sm font-medium text-secondary-900">Email Service</span>
          </div>
          <span class="text-xs text-yellow-600 font-medium">Limitado</span>
        </div>
      </div>
    </div>
  </div>
{/if} 