<script lang="ts">
  let migrating = false;
  let results = '';

  async function migrateApprovedApplications() {
    migrating = true;
    results = 'Iniciando migración...';

    try {
      const response = await fetch('/api/debug/migrate-approved', {
        method: 'POST'
      });

      const data = await response.json();
      
      if (response.ok) {
        results = `✅ Migración completada exitosamente!
        
Total: ${data.summary?.total || 0}
Creados: ${data.summary?.created || 0}
Ya existían: ${data.summary?.existing || 0}
Omitidos: ${data.summary?.skipped || 0}
Errores: ${data.summary?.errors || 0}

Detalles:
${JSON.stringify(data.results, null, 2)}`;
      } else {
        results = `❌ Error en la migración: ${data.error}\nDetalles: ${data.details}`;
      }
    } catch (error) {
      results = `❌ Error de conexión: ${error}`;
    } finally {
      migrating = false;
    }
  }
</script>

<div class="migration-page">
  <h1>Migración de Proveedores</h1>
  <p>Esta página te ayuda a crear perfiles de proveedores para aplicaciones ya aprobadas.</p>
  
  <div class="migration-section">
    <h2>Migrar Aplicaciones Aprobadas</h2>
    <p>Esto creará perfiles de proveedores para todas las aplicaciones aprobadas que no tengan uno.</p>
    
    <button 
      class="migrate-btn" 
      on:click={migrateApprovedApplications}
      disabled={migrating}
    >
      {migrating ? 'Migrando...' : 'Ejecutar Migración'}
    </button>
  </div>

  {#if results}
    <div class="results">
      <h3>Resultados:</h3>
      <pre>{results}</pre>
    </div>
  {/if}
</div>

<style>
  .migration-page {
    max-width: 800px;
    margin: 2rem auto;
    padding: 2rem;
  }

  .migration-section {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1.5rem;
    margin: 1rem 0;
  }

  .migrate-btn {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
  }

  .migrate-btn:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }

  .results {
    background: #f3f4f6;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 1rem;
    margin-top: 1rem;
  }

  .results pre {
    white-space: pre-wrap;
    word-wrap: break-word;
    margin: 0;
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.875rem;
  }
</style> 