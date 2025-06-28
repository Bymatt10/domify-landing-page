<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  let identifier = '';
  let otp = '';
  let password = '';
  let confirmPassword = '';
  let loading = false;
  let error = '';
  let success = '';

  $: identifier = $page.url.searchParams.get('identifier') || '';
  $: otp = $page.url.searchParams.get('otp') || '';

  async function handleChangePassword() {
    loading = true;
    error = '';
    success = '';
    if (password.length < 6) {
      error = 'La contraseña debe tener al menos 6 caracteres.';
      loading = false;
      return;
    }
    if (password !== confirmPassword) {
      error = 'Las contraseñas no coinciden.';
      loading = false;
      return;
    }
    // Aquí deberías llamar a tu backend o Supabase para cambiar la contraseña usando el OTP
    // Simulación de éxito:
    success = '¡Contraseña cambiada exitosamente! Redirigiendo...';
    setTimeout(() => goto('/auth/login'), 1800);
    loading = false;
  }
</script>

<div class="newpass-container">
  <h1>Nueva contraseña</h1>
  <p>Crea una nueva contraseña para tu cuenta.</p>
  {#if error}
    <div class="error-message">{error}</div>
  {/if}
  {#if success}
    <div class="success-message">{success}</div>
  {/if}
  <form on:submit|preventDefault={handleChangePassword}>
    <input type="password" placeholder="Nueva contraseña" bind:value={password} required minlength="6" disabled={loading} />
    <input type="password" placeholder="Confirmar contraseña" bind:value={confirmPassword} required minlength="6" disabled={loading} />
    <button type="submit" class="btn-primary" disabled={loading}>{loading ? 'Cambiando...' : 'Cambiar contraseña'}</button>
  </form>
</div>

<style>
.newpass-container {
  max-width: 400px;
  margin: 3rem auto;
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  padding: 2.5rem 2rem;
  text-align: center;
}
.newpass-container h1 {
  font-size: 1.7rem;
  margin-bottom: 0.5rem;
}
.newpass-container p {
  color: #666;
  margin-bottom: 1.5rem;
}
input[type="password"] {
  width: 100%;
  padding: 0.8rem;
  border-radius: 0.5rem;
  border: 1.5px solid #ddd;
  margin-bottom: 1.2rem;
  font-size: 1rem;
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
.success-message {
  background: #efe;
  color: #363;
  padding: 0.7rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}
</style> 