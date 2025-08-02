<script lang="ts">
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabase';
  import { page } from '$app/stores';
  
  let newPassword = '';
  let confirmPassword = '';
  let loading = false;
  let error = '';
  let success = '';

  // Obtener el token de la URL
  $: token = $page.url.searchParams.get('token') || '';

  async function handlePasswordReset() {
    loading = true;
    error = '';
    success = '';

    try {
      // Validar contraseñas
      if (newPassword.length < 6) {
        error = 'La contraseña debe tener al menos 6 caracteres.';
        return;
      }

      if (newPassword !== confirmPassword) {
        error = 'Las contraseñas no coinciden.';
        return;
      }

      // Actualizar contraseña usando Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        error = updateError.message;
      } else {
        success = '¡Contraseña actualizada exitosamente! Redirigiendo al login...';
        setTimeout(() => goto('/auth/login'), 2000);
      }
    } catch (err) {
      console.error('Error actualizando contraseña:', err);
      error = 'Error actualizando contraseña. Intenta nuevamente.';
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
  <div class="max-w-md w-full">
    <!-- Logo y título -->
    <div class="text-center mb-8">
      <div class="text-4xl font-bold text-primary-600 mb-2">🏠 Domify</div>
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Nueva Contraseña</h1>
      <p class="text-gray-600">Ingresa tu nueva contraseña para completar la recuperación.</p>
    </div>

    <!-- Formulario -->
    <div class="bg-white rounded-2xl shadow-xl p-8">
      {#if error}
        <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <div class="flex items-center">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      {/if}

      {#if success}
        <div class="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
          <div class="flex items-center">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            {success}
          </div>
        </div>
      {/if}

      <form on:submit|preventDefault={handlePasswordReset} class="space-y-6">
        <div>
          <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-2">
            Nueva Contraseña
          </label>
          <input 
            id="newPassword"
            type="password" 
            placeholder="••••••••" 
            bind:value={newPassword} 
            required 
            disabled={loading}
            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
          />
          <p class="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
        </div>

        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
            Confirmar Contraseña
          </label>
          <input 
            id="confirmPassword"
            type="password" 
            placeholder="••••••••" 
            bind:value={confirmPassword} 
            required 
            disabled={loading}
            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          class="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
        >
          {#if loading}
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Actualizando...
          {:else}
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Actualizar Contraseña
          {/if}
        </button>
      </form>

      <!-- Enlaces adicionales -->
      <div class="mt-6 text-center">
        <a href="/auth/login" class="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors">
          ← Volver al inicio de sesión
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div class="text-center mt-8 text-gray-500 text-sm">
      <p>¿No tienes una cuenta? <a href="/auth/signup" class="text-primary-600 hover:text-primary-700 font-medium">Regístrate aquí</a></p>
    </div>
  </div>
</div> 