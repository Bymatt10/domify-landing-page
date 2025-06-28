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

<div class="otp-container">
  <h1>Verifica tu código</h1>
  <p>Ingresa el código de 6 dígitos que te enviamos a tu correo.</p>
  {#if error}
    <div class="error-message">{error}</div>
  {/if}
  <form on:submit|preventDefault={handleVerifyOTP}>
    <input type="text" maxlength="6" minlength="6" pattern="\d{6}" placeholder="Código de 6 dígitos" bind:value={otp} required disabled={loading} />
    <button type="submit" class="btn-primary" disabled={loading}>{loading ? 'Verificando...' : 'Verificar código'}</button>
  </form>
</div>

<style>
.otp-container {
  max-width: 400px;
  margin: 3rem auto;
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  padding: 2.5rem 2rem;
  text-align: center;
}
.otp-container h1 {
  font-size: 1.7rem;
  margin-bottom: 0.5rem;
}
.otp-container p {
  color: #666;
  margin-bottom: 1.5rem;
}
input[type="text"] {
  width: 100%;
  padding: 0.8rem;
  border-radius: 0.5rem;
  border: 1.5px solid #ddd;
  margin-bottom: 1.2rem;
  font-size: 1rem;
  text-align: center;
  letter-spacing: 0.2em;
}
.btn-primary {
  width: 100%;
  padding: 0.8rem;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}
.error-message {
  background: #fee;
  color: #c33;
  padding: 0.7rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}
</style> 