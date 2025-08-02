<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  let identifier = '';
  let otp = '';
  let loading = false;
  let error = '';

  $: identifier = $page.url.searchParams.get('identifier') || '';

  async function handleVerifyOTP() {
    loading = true;
    error = '';
    // Aquí normalmente verificarías el OTP con backend o Supabase
    // Simulación: si OTP es 123456, es válido
    if (otp.length !== 6) {
      error = 'El código debe tener 6 dígitos.';
      loading = false;
      return;
    }
    // Aquí deberías hacer la verificación real con Supabase
    // Por ahora, simula éxito
    goto(`/auth/new-password?identifier=${encodeURIComponent(identifier)}&otp=${encodeURIComponent(otp)}`);
    loading = false;
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
  <div class="max-w-md w-full">
    <!-- Logo y título -->
    <div class="text-center mb-8">
      <div class="text-4xl font-bold text-primary-600 mb-2">🏠 Domify</div>
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Verifica tu código</h1>
      <p class="text-gray-600">Ingresa el código de 6 dígitos que te enviamos a <strong>{identifier}</strong></p>
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

      <form on:submit|preventDefault={handleVerifyOTP} class="space-y-6">
        <div>
          <label for="otp" class="block text-sm font-medium text-gray-700 mb-2">
            Código de verificación
          </label>
          <input 
            id="otp"
            type="text" 
            maxlength="6" 
            minlength="6" 
            pattern="\d{6}" 
            placeholder="000000" 
            bind:value={otp} 
            required 
            disabled={loading}
            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed text-center text-2xl font-mono tracking-widest"
          />
          <p class="text-xs text-gray-500 mt-2">Ingresa el código de 6 dígitos que recibiste por email</p>
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
            Verificando...
          {:else}
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Verificar código
          {/if}
        </button>
      </form>

      <!-- Enlaces adicionales -->
      <div class="mt-6 text-center space-y-2">
        <a href="/auth/reset-password" class="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors block">
          ← Volver a solicitar código
        </a>
        <a href="/auth/login" class="text-gray-500 hover:text-gray-700 text-sm transition-colors block">
          ← Volver al inicio de sesión
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div class="text-center mt-8 text-gray-500 text-sm">
      <p>¿No recibiste el código? Revisa tu carpeta de spam o <a href="/auth/reset-password" class="text-primary-600 hover:text-primary-700 font-medium">solicita uno nuevo</a></p>
    </div>
  </div>
</div>

 