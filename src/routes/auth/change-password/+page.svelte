<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  let loading = false;
  let error = '';
  let success = false;
  let newPassword = '';
  let confirmPassword = '';
  let currentUser: any = null;

  onMount(async () => {
    // Verificar si el usuario necesita cambiar contraseña
    try {
      const response = await fetch('/api/auth/check-password-change');
      const data = await response.json();
      
      if (!data.requiresChange) {
        goto('/'); // Redirigir si no necesita cambio
        return;
      }
      
      currentUser = data.user;
    } catch (err) {
      console.error('Error checking password change requirement:', err);
      goto('/auth/login');
    }
  });

  async function handlePasswordChange() {
    if (!newPassword || !confirmPassword) {
      error = 'Por favor completa todos los campos';
      return;
    }

    if (newPassword.length < 6) {
      error = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    if (newPassword !== confirmPassword) {
      error = 'Las contraseñas no coinciden';
      return;
    }

    loading = true;
    error = '';

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newPassword: newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        success = true;
        setTimeout(() => {
          goto('/'); // Redirigir al inicio después del cambio exitoso
        }, 2000);
      } else {
        error = data.error || 'Error al cambiar la contraseña';
      }
    } catch (err) {
      error = 'Error de conexión. Inténtalo de nuevo.';
    } finally {
      loading = false;
    }
  }
</script>

<div class="change-password-container">
  <div class="change-password-card">
    <!-- Header -->
    <div class="header">
      <div class="logo">
        <h1>Domify</h1>
      </div>
      <h2>Cambio de Contraseña Requerido</h2>
      <p class="subtitle">
        {#if currentUser}
          Hola <strong>{currentUser.user_metadata?.first_name || 'Usuario'}</strong>, 
        {/if}
        necesitas cambiar tu contraseña temporal por una nueva.
      </p>
    </div>

    <!-- Form -->
    {#if !success}
      <form on:submit|preventDefault={handlePasswordChange} class="password-form">
        <div class="input-group">
          <label for="new-password">Nueva Contraseña</label>
          <input
            id="new-password"
            type="password"
            bind:value={newPassword}
            placeholder="Ingresa tu nueva contraseña"
            required
            disabled={loading}
          />
        </div>

        <div class="input-group">
          <label for="confirm-password">Confirmar Contraseña</label>
          <input
            id="confirm-password"
            type="password"
            bind:value={confirmPassword}
            placeholder="Confirma tu nueva contraseña"
            required
            disabled={loading}
          />
        </div>

        <div class="password-requirements">
          <p>Requisitos de la contraseña:</p>
          <ul>
            <li class:valid={newPassword.length >= 6}>Mínimo 6 caracteres</li>
            <li class:valid={newPassword === confirmPassword && confirmPassword}>Las contraseñas coinciden</li>
          </ul>
        </div>

        {#if error}
          <div class="error-message">
            <span class="error-icon">⚠️</span>
            {error}
          </div>
        {/if}

        <button type="submit" class="change-password-btn" disabled={loading}>
          {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
        </button>
      </form>
    {:else}
      <div class="success-message">
        <div class="success-icon">✅</div>
        <h3>¡Contraseña cambiada exitosamente!</h3>
        <p>Serás redirigido automáticamente...</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .change-password-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #0C3B2E 0%, #6D9773 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .change-password-card {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    width: 100%;
    max-width: 480px;
    box-shadow: 0 20px 40px rgba(12, 59, 46, 0.3);
  }

  .header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .logo h1 {
    color: #0C3B2E;
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
  }

  .header h2 {
    color: #0C3B2E;
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
  }

  .subtitle {
    color: #6D9773;
    font-size: 1rem;
    margin: 0;
    line-height: 1.5;
  }

  .password-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .input-group label {
    font-weight: 600;
    color: #0C3B2E;
    font-size: 0.9rem;
  }

  .input-group input {
    padding: 0.875rem;
    border: 2px solid #E2E8F0;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .input-group input:focus {
    outline: none;
    border-color: #6D9773;
    box-shadow: 0 0 0 3px rgba(109, 151, 115, 0.1);
  }

  .input-group input:disabled {
    background: #F7FAFC;
    cursor: not-allowed;
  }

  .password-requirements {
    background: #F7FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 8px;
    padding: 1rem;
  }

  .password-requirements p {
    margin: 0 0 0.5rem 0;
    font-weight: 600;
    color: #0C3B2E;
    font-size: 0.9rem;
  }

  .password-requirements ul {
    margin: 0;
    padding-left: 1.25rem;
    list-style: none;
  }

  .password-requirements li {
    color: #6B7280;
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
    position: relative;
  }

  .password-requirements li::before {
    content: '○';
    position: absolute;
    left: -1.25rem;
    color: #6B7280;
  }

  .password-requirements li.valid {
    color: #065F46;
  }

  .password-requirements li.valid::before {
    content: '✓';
    color: #059669;
  }

  .error-message {
    background: #FEF2F2;
    border: 1px solid #FECACA;
    color: #DC2626;
    padding: 0.875rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
  }

  .error-icon {
    flex-shrink: 0;
  }

  .change-password-btn {
    background: linear-gradient(135deg, #0C3B2E 0%, #6D9773 100%);
    color: white;
    border: none;
    padding: 0.875rem 1.5rem;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .change-password-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 16px rgba(12, 59, 46, 0.3);
  }

  .change-password-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .success-message {
    text-align: center;
    padding: 2rem 0;
  }

  .success-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .success-message h3 {
    color: #065F46;
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
  }

  .success-message p {
    color: #6D9773;
    margin: 0;
  }

  @media (max-width: 640px) {
    .change-password-card {
      margin: 1rem;
      padding: 1.5rem;
    }

    .logo h1 {
      font-size: 2rem;
    }

    .header h2 {
      font-size: 1.25rem;
    }
  }
</style> 