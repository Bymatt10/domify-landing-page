<script lang="ts">
  let step = 1;
  let loginResult: any = null;
  let passwordChangeResult: any = null;
  let error = '';

  const credentials = {
    email: 'patriciavanegas@gmail.com',
    tempPassword: 'j7Z$emQ2Q#xa',
    newPassword: 'MiNuevaPassword123!'
  };

  async function testLogin() {
    try {
      step = 1;
      error = '';
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.tempPassword
        })
      });

      loginResult = await response.json();
      
      if (response.ok) {
        step = 2;
        // Recargar la página para que las cookies tomen efecto
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        error = loginResult.error || 'Error en login';
      }
    } catch (err) {
      error = 'Error de conexión en login';
      console.error(err);
    }
  }

  async function testPasswordChange() {
    try {
      step = 3;
      error = '';
      
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newPassword: credentials.newPassword
        })
      });

      passwordChangeResult = await response.json();
      
      if (response.ok) {
        step = 4;
      } else {
        error = passwordChangeResult.error || 'Error cambiando contraseña';
      }
    } catch (err) {
      error = 'Error de conexión en cambio de contraseña';
      console.error(err);
    }
  }

  async function testFinalLogin() {
    try {
      step = 5;
      error = '';
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.newPassword
        })
      });

      const finalResult = await response.json();
      
      if (response.ok) {
        step = 6;
        // Redirigir al dashboard o home
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        error = finalResult.error || 'Error en login final';
      }
    } catch (err) {
      error = 'Error de conexión en login final';
      console.error(err);
    }
  }
</script>

<div class="test-container">
  <div class="test-card">
    <h1>🧪 Prueba del Sistema Patricia</h1>
    
    <div class="credentials-info">
      <h3>📋 Credenciales de Prueba</h3>
      <p><strong>Email:</strong> {credentials.email}</p>
      <p><strong>Contraseña temporal:</strong> {credentials.tempPassword}</p>
      <p><strong>Nueva contraseña:</strong> {credentials.newPassword}</p>
    </div>

    <div class="steps">
      <div class="step" class:active={step >= 1} class:completed={step > 1}>
        <div class="step-number">1</div>
        <div class="step-content">
          <h4>Login con Contraseña Temporal</h4>
          {#if step === 1}
            <button on:click={testLogin} class="test-btn">
              🔐 Probar Login
            </button>
          {:else if step > 1}
            <div class="success">✅ Login exitoso</div>
            {#if loginResult}
              <pre class="result">{JSON.stringify(loginResult, null, 2)}</pre>
            {/if}
          {/if}
        </div>
      </div>

      <div class="step" class:active={step >= 2} class:completed={step > 2}>
        <div class="step-number">2</div>
        <div class="step-content">
          <h4>Verificar Redirección</h4>
          {#if step === 2}
            <p>El usuario debería ser redirigido a /auth/change-password</p>
            <button on:click={testPasswordChange} class="test-btn">
              🔄 Continuar con Cambio de Contraseña
            </button>
          {:else if step > 2}
            <div class="success">✅ Continuando...</div>
          {/if}
        </div>
      </div>

      <div class="step" class:active={step >= 3} class:completed={step > 3}>
        <div class="step-number">3</div>
        <div class="step-content">
          <h4>Cambiar Contraseña</h4>
          {#if step === 3}
            <p>Cambiando contraseña...</p>
          {:else if step > 3}
            <div class="success">✅ Contraseña cambiada</div>
            {#if passwordChangeResult}
              <pre class="result">{JSON.stringify(passwordChangeResult, null, 2)}</pre>
            {/if}
          {/if}
        </div>
      </div>

      <div class="step" class:active={step >= 4} class:completed={step > 4}>
        <div class="step-number">4</div>
        <div class="step-content">
          <h4>Login con Nueva Contraseña</h4>
          {#if step === 4}
            <button on:click={testFinalLogin} class="test-btn">
              🚀 Probar Login Final
            </button>
          {:else if step > 4}
            <div class="success">✅ Login final exitoso</div>
          {/if}
        </div>
      </div>

      <div class="step" class:active={step >= 5} class:completed={step > 5}>
        <div class="step-number">5</div>
        <div class="step-content">
          <h4>Acceso Completo</h4>
          {#if step === 5}
            <p>Verificando acceso...</p>
          {:else if step >= 6}
            <div class="success">🎉 ¡Sistema funcionando perfectamente!</div>
            <p>Patricia ahora tiene acceso completo como provider y customer</p>
          {/if}
        </div>
      </div>
    </div>

    {#if error}
      <div class="error">
        ❌ {error}
      </div>
    {/if}

    <div class="actions">
      <a href="/auth/login" class="link-btn">🔐 Ir a Login Manual</a>
      <a href="/auth/change-password" class="link-btn">🔄 Ir a Cambio de Contraseña</a>
      <a href="/" class="link-btn">🏠 Ir al Home</a>
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
  }

  .credentials-info {
    background: #F0F9FF;
    border: 1px solid #BAE6FD;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 2rem;
  }

  .credentials-info h3 {
    color: #0369A1;
    margin: 0 0 1rem 0;
  }

  .credentials-info p {
    margin: 0.5rem 0;
    font-family: 'Courier New', monospace;
  }

  .steps {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .step {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    border-radius: 8px;
    border: 2px solid #E2E8F0;
    transition: all 0.3s;
  }

  .step.active {
    border-color: #6D9773;
    background: #F0FDF4;
  }

  .step.completed {
    border-color: #059669;
    background: #ECFDF5;
  }

  .step-number {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #E2E8F0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    flex-shrink: 0;
  }

  .step.active .step-number {
    background: #6D9773;
    color: white;
  }

  .step.completed .step-number {
    background: #059669;
    color: white;
  }

  .step-content {
    flex: 1;
  }

  .step-content h4 {
    margin: 0 0 0.5rem 0;
    color: #0C3B2E;
  }

  .test-btn {
    background: linear-gradient(135deg, #0C3B2E 0%, #6D9773 100%);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s;
  }

  .test-btn:hover {
    transform: translateY(-1px);
  }

  .success {
    color: #059669;
    font-weight: 600;
    margin: 0.5rem 0;
  }

  .result {
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 4px;
    padding: 0.5rem;
    font-size: 0.8rem;
    overflow-x: auto;
    margin-top: 0.5rem;
  }

  .error {
    background: #FEF2F2;
    border: 1px solid #FECACA;
    color: #DC2626;
    padding: 1rem;
    border-radius: 8px;
    margin: 1rem 0;
  }

  .actions {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
    flex-wrap: wrap;
  }

  .link-btn {
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    color: #0C3B2E;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.2s;
  }

  .link-btn:hover {
    background: #E2E8F0;
    transform: translateY(-1px);
  }

  @media (max-width: 640px) {
    .test-container {
      padding: 1rem;
    }

    .test-card {
      padding: 1.5rem;
    }

    .step {
      flex-direction: column;
      gap: 0.5rem;
    }

    .actions {
      flex-direction: column;
    }
  }
</style> 