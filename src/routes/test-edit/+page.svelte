<script lang="ts">
  let testResult = '';
  let loading = false;

  async function testEditApplication() {
    loading = true;
    testResult = '';

    try {
      // Datos de prueba para actualizar la aplicación de Patricia
      const updateData = {
        headline: 'Servicio de Limpieza Premium - Patricia',
        bio: 'Especialista en limpieza profunda y mantenimiento. Más de 20 años de experiencia ofreciendo servicios de calidad premium.',
        hourly_rate: 175, // Aumentado de 150 a 175
        location: 'Managua Centro, Nicaragua',
        phone: '8689-1823',
        experience_years: 22, // Aumentado de 21 a 22
        categories: [2, 1] // Limpieza y otra categoría
      };

      const response = await fetch('/api/provider-applications?id=2', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const result = await response.json();
      
      if (response.ok) {
        testResult = `✅ Aplicación actualizada exitosamente!\n\n${JSON.stringify(result, null, 2)}`;
      } else {
        testResult = `❌ Error: ${result.error?.message || 'Error desconocido'}\n\n${JSON.stringify(result, null, 2)}`;
      }
    } catch (error) {
      testResult = `💥 Error de conexión: ${error}`;
    } finally {
      loading = false;
    }
  }

  async function testGetApplications() {
    loading = true;
    testResult = '';

    try {
      const response = await fetch('/api/provider-applications');
      const result = await response.json();
      
      if (response.ok) {
        testResult = `📋 Aplicaciones obtenidas:\n\n${JSON.stringify(result, null, 2)}`;
      } else {
        testResult = `❌ Error: ${result.error?.message || 'Error desconocido'}`;
      }
    } catch (error) {
      testResult = `💥 Error de conexión: ${error}`;
    } finally {
      loading = false;
    }
  }
</script>

<div class="test-container">
  <div class="test-card">
    <h1>🧪 Prueba de Edición de Aplicaciones</h1>
    
    <div class="info-section">
      <h3>📝 Funcionalidad de Edición</h3>
      <p>Esta página demuestra la nueva funcionalidad de edición para administradores:</p>
      <ul>
        <li>✅ Editar título del servicio</li>
        <li>✅ Modificar descripción/bio</li>
        <li>✅ Actualizar tarifa por hora</li>
        <li>✅ Cambiar ubicación</li>
        <li>✅ Actualizar teléfono</li>
        <li>✅ Modificar años de experiencia</li>
        <li>✅ Cambiar categorías</li>
      </ul>
    </div>

    <div class="test-actions">
      <button 
        class="test-btn primary" 
        on:click={testEditApplication}
        disabled={loading}
      >
        {loading ? 'Actualizando...' : '📝 Probar Edición de Aplicación'}
      </button>

      <button 
        class="test-btn secondary" 
        on:click={testGetApplications}
        disabled={loading}
      >
        {loading ? 'Cargando...' : '📋 Ver Aplicaciones Actuales'}
      </button>
    </div>

    {#if testResult}
      <div class="result-section">
        <h4>Resultado:</h4>
        <pre class="result-output">{testResult}</pre>
      </div>
    {/if}

    <div class="instructions">
      <h3>🎯 Cómo usar en el Admin</h3>
      <ol>
        <li>Ve a <a href="/admin/provider-applications">/admin/provider-applications</a></li>
        <li>Haz clic en el botón "📝 Editar" de cualquier aplicación</li>
        <li>Se abrirá un modal con todos los campos editables</li>
        <li>Modifica los datos que necesites</li>
        <li>Haz clic en "Guardar Cambios"</li>
        <li>Los cambios se aplicarán inmediatamente</li>
      </ol>
    </div>

    <div class="links-section">
      <h3>🔗 Enlaces Útiles</h3>
      <div class="links-grid">
        <a href="/admin/provider-applications" class="link-btn">
          👥 Admin - Aplicaciones
        </a>
        <a href="/test-patricia" class="link-btn">
          🧪 Prueba Usuario Patricia
        </a>
        <a href="/auth/login" class="link-btn">
          🔐 Login
        </a>
        <a href="/" class="link-btn">
          🏠 Inicio
        </a>
      </div>
    </div>
  </div>
</div>

<style>
  .test-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #0C3B2E 0%, #6D9773 100%);
    padding: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .test-card {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    max-width: 800px;
    width: 100%;
    box-shadow: 0 20px 40px rgba(12, 59, 46, 0.3);
  }

  h1 {
    color: #0C3B2E;
    text-align: center;
    margin-bottom: 2rem;
    font-size: 2rem;
    font-weight: 700;
  }

  .info-section {
    background: #F0F9FF;
    border: 1px solid #BAE6FD;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .info-section h3 {
    color: #0369A1;
    margin: 0 0 1rem 0;
  }

  .info-section ul {
    margin: 1rem 0 0 1.5rem;
    color: #374151;
  }

  .info-section li {
    margin-bottom: 0.5rem;
  }

  .test-actions {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    justify-content: center;
  }

  .test-btn {
    padding: 1rem 2rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
    display: inline-block;
  }

  .test-btn.primary {
    background: linear-gradient(135deg, #0C3B2E 0%, #6D9773 100%);
    color: white;
  }

  .test-btn.primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(12, 59, 46, 0.3);
  }

  .test-btn.secondary {
    background: #F3F4F6;
    color: #374151;
    border: 1px solid #D1D5DB;
  }

  .test-btn.secondary:hover:not(:disabled) {
    background: #E5E7EB;
  }

  .test-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .result-section {
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .result-section h4 {
    margin: 0 0 1rem 0;
    color: #0C3B2E;
  }

  .result-output {
    background: #1F2937;
    color: #F9FAFB;
    padding: 1rem;
    border-radius: 6px;
    overflow-x: auto;
    font-family: 'Courier New', monospace;
    font-size: 0.875rem;
    line-height: 1.5;
    white-space: pre-wrap;
  }

  .instructions {
    background: #FEF2F2;
    border: 1px solid #FECACA;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .instructions h3 {
    color: #DC2626;
    margin: 0 0 1rem 0;
  }

  .instructions ol {
    margin: 1rem 0 0 1.5rem;
    color: #374151;
  }

  .instructions li {
    margin-bottom: 0.5rem;
  }

  .instructions a {
    color: #DC2626;
    text-decoration: underline;
  }

  .links-section h3 {
    color: #0C3B2E;
    margin: 0 0 1rem 0;
  }

  .links-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .link-btn {
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    color: #0C3B2E;
    padding: 1rem;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    text-align: center;
    transition: all 0.2s;
  }

  .link-btn:hover {
    background: #E2E8F0;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(12, 59, 46, 0.1);
  }

  @media (max-width: 640px) {
    .test-container {
      padding: 1rem;
    }

    .test-card {
      padding: 1.5rem;
    }

    h1 {
      font-size: 1.5rem;
    }

    .test-actions {
      flex-direction: column;
    }

    .links-grid {
      grid-template-columns: 1fr;
    }
  }
</style> 