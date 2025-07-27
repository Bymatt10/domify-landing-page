<script lang="ts">
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabase';
  let identifier = '';
  let loading = false;
  let error = '';
  let success = '';

  async function handleRequestOTP() {
    loading = true;
    error = '';
    success = '';
    // Validar email o teléfono
    const isEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(identifier);
    if (!isEmail && !/^\+?\d{8,15}$/.test(identifier)) {
      error = 'Ingresa un correo electrónico o número de teléfono válido.';
      loading = false;
      return;
    }
    // Lógica: solo email por ahora
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(identifier, {
      redirectTo: 'https://domify.app/auth/verify-otp'
    });
    if (resetError) {
      error = resetError.message;
    } else {
      success = 'Te hemos enviado un código a tu correo electrónico.';
      setTimeout(() => goto('/auth/verify-otp?identifier=' + encodeURIComponent(identifier)), 1500);
    }
    loading = false;
  }
</script>

<div class="reset-container">
  <h1>Recuperar contraseña</h1>
  <p>Ingresa tu correo electrónico o número de teléfono para recibir un código de verificación.</p>
  {#if error}
    <div class="error-message">{error}</div>
  {/if}
  {#if success}
    <div class="success-message">{success}</div>
  {/if}
  <form on:submit|preventDefault={handleRequestOTP}>
    <input type="text" placeholder="Correo electrónico o teléfono" bind:value={identifier} required disabled={loading} />
    <button type="submit" class="btn-primary" disabled={loading}>{loading ? 'Enviando...' : 'Enviar código'}</button>
  </form>
</div>

<style>
.reset-container {
  max-width: 400px;
  margin: 3rem auto;
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  padding: 2.5rem 2rem;
  text-align: center;
}
.reset-container h1 {
  font-size: 1.7rem;
  margin-bottom: 0.5rem;
}
.reset-container p {
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