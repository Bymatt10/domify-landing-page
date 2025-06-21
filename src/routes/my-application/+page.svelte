<script lang="ts">

  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import { goto } from '$app/navigation';

  let application: any = null;
  let loading = true;
  let error = '';
  let session: any = null;

  onMount(async () => {
    // Obtener sesión actual
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    session = currentSession;

    if (!session) {
      goto('/auth/login');
      return;
    }

    
    await loadApplication();
  });

  async function loadApplication() {
    try {
      loading = true;
      const response = await fetch('/api/provider-applications/my-application');
      
      if (response.ok) {
        const result = await response.json();
        application = result.data;
      } else {
        error = 'Error al cargar la aplicación';
      }
    } catch (err) {
      error = 'Error de conexión';
    } finally {
      loading = false;
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'submitted': return 'bg-yellow-100 text-yellow-800';
      case 'in_review': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  function getStatusLabel(status: string) {
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat('es-NI', {
      style: 'currency',
      currency: 'NIO'
    }).format(price);
  }
</script>

<svelte:head>
  <title>Mi Aplicación - Domify</title>
</svelte:head>

<div class="container">
  <div class="content">
    <div class="header">
      <h1>Mi Aplicación de Proveedor</h1>
      <p>Revisa el estado de tu solicitud para convertirte en proveedor</p>
    </div>

    {#if loading}
      <div class="loading">
        <div class="spinner"></div>
        <p>Cargando tu aplicación...</p>
      </div>
    {:else if error}
      <div class="error">
        <p>{error}</p>
        <button on:click={loadApplication} class="retry-btn">Reintentar</button>
      </div>
    {:else if !application}
      <div class="no-application">
        <div class="icon">📝</div>
        <h2>No tienes una aplicación</h2>
        <p>Aún no has enviado una aplicación para convertirte en proveedor.</p>
        <a href="/become-provider" class="apply-btn">Enviar Aplicación</a>
      </div>
    {:else}
      <div class="application-details">
        <!-- Estado de la Aplicación -->
        <div class="status-section">
          <h2>Estado de la Aplicación</h2>
          <div class="status-card">
            <span class="status-badge {getStatusColor(application.status)}">
              {getStatusLabel(application.status)}
            </span>
            <p class="status-description">
              {#if application.status === 'submitted'}
                Tu aplicación está en la cola de espera. Será revisada pronto.
              {:else if application.status === 'in_review'}
                Tu aplicación está siendo revisada por nuestro equipo.
              {:else if application.status === 'approved'}
                ¡Felicitaciones! Tu aplicación ha sido aprobada. Ya puedes ofrecer servicios.
              {:else if application.status === 'rejected'}
                Tu aplicación no fue aprobada en esta ocasión.
              {/if}
            </p>
            {#if application.rejection_reason}
              <div class="rejection-reason">
                <strong>Motivo del rechazo:</strong>
                <p>{application.rejection_reason}</p>
              </div>
            {/if}
          </div>
        </div>

        <!-- Información del Servicio -->
        <div class="info-section">
          <h2>Información del Servicio</h2>
          <div class="info-grid">
            <div class="info-item">
              <label>Título del Servicio</label>
              <p>{application.headline}</p>
            </div>
            <div class="info-item">
              <label>Descripción</label>
              <p>{application.bio}</p>
            </div>
            <div class="info-item">
              <label>Precio por Hora</label>
              <p>{formatPrice(application.hourly_rate)}</p>
            </div>
            <div class="info-item">
              <label>Ubicación</label>
              <p>{application.location}</p>
            </div>
            <div class="info-item">
              <label>Teléfono</label>
              <p>{application.phone}</p>
            </div>
            <div class="info-item">
              <label>Años de Experiencia</label>
              <p>{application.experience_years} años</p>
            </div>
          </div>
        </div>

        <!-- Categorías -->
        {#if application.categories && application.categories.length > 0}
          <div class="categories-section">
            <h2>Categorías de Servicio</h2>
            <div class="categories-grid">
              {#each application.categories as category}
                <span class="category-tag">{category.name}</span>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Certificaciones -->
        {#if application.certifications && application.certifications.length > 0}
          <div class="certifications-section">
            <h2>Certificaciones</h2>
            <ul class="certifications-list">
              {#each application.certifications as certification}
                <li>{certification}</li>
              {/each}
            </ul>
          </div>
        {/if}

        <!-- Fechas -->
        <div class="dates-section">
          <h2>Fechas Importantes</h2>
          <div class="dates-grid">
            <div class="date-item">
              <label>Fecha de Envío</label>
              <p>{formatDate(application.created_at)}</p>
            </div>
            {#if application.reviewed_at}
              <div class="date-item">
                <label>Fecha de Revisión</label>
                <p>{formatDate(application.reviewed_at)}</p>
              </div>
            {/if}
          </div>
        </div>

        <!-- Acciones -->
        <div class="actions-section">
          {#if application.status === 'rejected'}
            <div class="rejected-actions">
              <p>Si deseas volver a aplicar, puedes enviar una nueva aplicación:</p>
              <a href="/become-provider" class="reapply-btn">Volver a Aplicar</a>
            </div>
          {:else if application.status === 'approved'}
            <div class="approved-actions">
              <p>¡Ya puedes empezar a ofrecer servicios!</p>
              <a href="/services" class="start-btn">Ver Servicios</a>
            </div>
          {:else}
            <div class="pending-actions">
              <p>Mientras esperas, puedes revisar nuestros servicios:</p>
              <a href="/services" class="browse-btn">Explorar Servicios</a>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .container {
    min-height: 100vh;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-highlight) 100%);
    padding: 2rem 1rem;
  }

  .content {
    max-width: 800px;
    margin: 0 auto;
    background: var(--color-background-white);
    border-radius: 16px;
    padding: 3rem 2rem;
    box-shadow: var(--shadow-lg);
  }

  .header {
    text-align: center;
    margin-bottom: 3rem;
  }

  .header h1 {
    color: var(--color-primary);
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .header p {
    color: var(--color-text-secondary);
    font-size: 1.1rem;
  }

  .loading {
    text-align: center;
    padding: 3rem;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .error {
    text-align: center;
    padding: 2rem;
    background: #fee2e2;
    border-radius: 8px;
    color: #991b1b;
  }

  .retry-btn {
    background: var(--color-primary);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    margin-top: 1rem;
  }

  .no-application {
    text-align: center;
    padding: 3rem;
  }

  .no-application .icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .no-application h2 {
    color: var(--color-primary);
    margin-bottom: 1rem;
  }

  .apply-btn {
    background: var(--color-primary);
    color: white;
    text-decoration: none;
    padding: 1rem 2rem;
    border-radius: 8px;
    font-weight: 600;
    display: inline-block;
    margin-top: 1rem;
  }

  .application-details {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .status-section,
  .info-section,
  .categories-section,
  .certifications-section,
  .dates-section,
  .actions-section {
    border: 1px solid var(--color-border);
    border-radius: 12px;
    padding: 1.5rem;
    background: #fafafa;
  }

  .status-section h2,
  .info-section h2,
  .categories-section h2,
  .certifications-section h2,
  .dates-section h2 {
    color: var(--color-primary);
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  .status-card {
    text-align: center;
  }

  .status-badge {
    display: inline-block;
    padding: 0.5rem 1rem;
    border-radius: 9999px;
    font-weight: 600;
    font-size: 0.875rem;
    margin-bottom: 1rem;
  }

  .status-description {
    color: var(--color-text-secondary);
    margin-bottom: 1rem;
  }

  .rejection-reason {
    background: #fee2e2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    padding: 1rem;
    margin-top: 1rem;
  }

  .rejection-reason strong {
    color: #991b1b;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .info-item label {
    display: block;
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: 0.5rem;
  }

  .info-item p {
    color: var(--color-text-secondary);
    line-height: 1.5;
  }

  .categories-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .category-tag {
    background: var(--color-primary);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .certifications-list {
    list-style: none;
    padding: 0;
  }

  .certifications-list li {
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--color-border);
  }

  .certifications-list li:last-child {
    border-bottom: none;
  }

  .dates-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .date-item label {
    display: block;
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: 0.5rem;
  }

  .date-item p {
    color: var(--color-text-secondary);
  }

  .actions-section {
    text-align: center;
  }

  .reapply-btn,
  .start-btn,
  .browse-btn {
    background: var(--color-primary);
    color: white;
    text-decoration: none;
    padding: 1rem 2rem;
    border-radius: 8px;
    font-weight: 600;
    display: inline-block;
    margin-top: 1rem;
  }

  .reapply-btn:hover,
  .start-btn:hover,
  .browse-btn:hover {
    background: var(--color-primary-hover);
  }

  @media (max-width: 768px) {
    .content {
      padding: 2rem 1rem;
    }

    .header h1 {
      font-size: 2rem;
    }

    .info-grid {
      grid-template-columns: 1fr;
    }

    .dates-grid {
      grid-template-columns: 1fr;
    }
  }
</style> 