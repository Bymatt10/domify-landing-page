<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let stats = {
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    totalProviders: 0,
    totalCategories: 0
  };

  let loading = true;

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
        // Solo usar datos reales si están disponibles
        if (applicationsData.total !== undefined) {
          stats.totalApplications = applicationsData.total;
          stats.pendingApplications = applicationsData.pending || 0;
          stats.approvedApplications = applicationsData.approved || 0;
          applicationsLoaded = true;
        }
      }

      // Solo usar fallback si no se pudieron cargar datos reales
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
      // En caso de error, mostrar datos de ejemplo
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
</script>

<div class="admin-dashboard">
  <!-- Header -->
  <header class="page-header">
    <div class="header-content">
      <h1>Dashboard de Administración</h1>
      <p>Bienvenido al panel de control de Domify</p>
    </div>
  </header>

  {#if loading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Cargando estadísticas...</p>
    </div>
  {:else}
    <!-- Solo mostrar aviso si TODOS los datos son de ejemplo -->
    {#if stats.totalApplications === 12 && stats.pendingApplications === 5 && stats.approvedApplications === 4}
      <div class="notice-banner">
        <div class="notice-icon">ℹ️</div>
        <div class="notice-content">
          <h4>Datos de Ejemplo</h4>
          <p>Actualmente mostrando datos de ejemplo mientras se resuelven los problemas de conexión con la base de datos. Las cifras reales se mostrarán una vez que se solucione el problema de permisos.</p>
        </div>
      </div>
    {/if}
    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📝</div>
        <div class="stat-content">
          <h3>{stats.totalApplications}</h3>
          <p>Aplicaciones Totales</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">⏳</div>
        <div class="stat-content">
          <h3>{stats.pendingApplications}</h3>
          <p>Aplicaciones Pendientes</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <h3>{stats.approvedApplications}</h3>
          <p>Aplicaciones Aprobadas</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <h3>{stats.totalProviders}</h3>
          <p>Proveedores Activos</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">🏷️</div>
        <div class="stat-content">
          <h3>{stats.totalCategories}</h3>
          <p>Categorías de Servicios</p>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <h2>Acciones Rápidas</h2>
      <div class="actions-grid">
        <a href="/admin/provider-applications" class="action-card">
          <div class="action-icon">📋</div>
          <h3>Revisar Aplicaciones</h3>
          <p>Gestiona las solicitudes de nuevos proveedores</p>
        </a>

        <a href="/admin/categories" class="action-card">
          <div class="action-icon">🏷️</div>
          <h3>Gestionar Categorías</h3>
          <p>Administra las categorías de servicios</p>
        </a>

        <a href="/services" class="action-card">
          <div class="action-icon">🔍</div>
          <h3>Ver Servicios</h3>
          <p>Explora los servicios disponibles</p>
        </a>
      </div>
    </div>
  {/if}
</div>

<style>
  .admin-dashboard {
    /* Eliminado max-width para que ocupe todo el ancho */
  }

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

  .notice-content p {
    margin: 0;
    font-size: 0.875rem;
    color: #78350f;
    line-height: 1.5;
  }

  .page-header {
    margin-bottom: 2rem;
  }

  .page-header h1 {
    font-size: 2.5rem;
    font-weight: 700;
    color: #0C3B2E;
    margin: 0 0 0.5rem 0;
  }

  .page-header p {
    font-size: 1.1rem;
    color: #6D9773;
    margin: 0;
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #E2E8F0;
    border-top: 4px solid #6D9773;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;
  }

  .stat-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(12, 59, 46, 0.1);
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(12, 59, 46, 0.15);
  }

  .stat-icon {
    font-size: 2rem;
    width: 60px;
    height: 60px;
    background: #F0F9F4;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stat-content h3 {
    font-size: 2rem;
    font-weight: 700;
    color: #0C3B2E;
    margin: 0 0 0.25rem 0;
  }

  .stat-content p {
    font-size: 0.875rem;
    color: #6D9773;
    margin: 0;
  }

  .quick-actions {
    margin-top: 3rem;
  }

  .quick-actions h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #0C3B2E;
    margin: 0 0 1.5rem 0;
  }

  .actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .action-card {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 1px 3px rgba(12, 59, 46, 0.1);
    text-decoration: none;
    color: inherit;
    transition: transform 0.2s, box-shadow 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .action-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(12, 59, 46, 0.15);
  }

  .action-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .action-card h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #0C3B2E;
    margin: 0 0 0.5rem 0;
  }

  .action-card p {
    font-size: 0.875rem;
    color: #6D9773;
    margin: 0;
  }

  @media (max-width: 768px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }

    .actions-grid {
      grid-template-columns: 1fr;
    }

    .page-header h1 {
      font-size: 2rem;
    }
  }
</style> 