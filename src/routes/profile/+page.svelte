<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import { goto } from '$app/navigation';
  export let data: any;
  let user = data?.user;
  let nombre = user?.user_metadata?.first_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || '';

  async function handleLogout() {
    await supabase.auth.signOut();
    goto('/');
  }

  // Si quieres, puedes traer más datos del usuario aquí
</script>

<div class="profile-greeting">
  <h2>¡Hola, {nombre.split(' ')[0]}!</h2>
</div>

<div class="profile-cards">
  <a class="profile-card-link" href="/profile/info">
    <div class="profile-card-large">
      <svg width="32" height="32" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2" fill="none"/><path d="M4 20c0-4 4-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="2" fill="none"/></svg>
    </div>
    <div class="profile-card-label">Información personal</div>
  </a>
  <a class="profile-card-link" href="/ayuda">
    <div class="profile-card-large">
      <svg width="32" height="32" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><path d="M9 9a3 3 0 0 1 6 0c0 2-3 3-3 5" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="17" r="1" fill="currentColor"/></svg>
    </div>
    <div class="profile-card-label">Ayuda en línea</div>
  </a>
</div>

<!-- Sección de Soporte -->
<div class="support-section">
  <h3>Soporte</h3>
  <ul class="support-list">
    <li>
      <a href="/terms" class="support-link">
        <span class="support-icon">
          <svg width="22" height="22" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><text x="12" y="16" text-anchor="middle" font-size="12" fill="currentColor">i</text></svg>
        </span>
        Términos y condiciones
        <span class="support-arrow">&#8250;</span>
      </a>
    </li>
    <li>
      <a href="/privacy" class="support-link">
        <span class="support-icon">
          <svg width="22" height="22" viewBox="0 0 24 24"><rect x="6" y="10" width="12" height="8" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 16v-4" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="13" r="1" fill="currentColor"/></svg>
        </span>
        Políticas de privacidad
        <span class="support-arrow">&#8250;</span>
      </a>
    </li>
    <li>
      <a href="#" class="support-link" on:click|preventDefault={handleLogout}>
        <span class="support-icon">
          <svg width="22" height="22" viewBox="0 0 24 24"><path d="M16 17v-1a4 4 0 0 0-8 0v1" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" fill="none"/><path d="M2 17h20" stroke="currentColor" stroke-width="2"/></svg>
        </span>
        Cerrar sesión
        <span class="support-arrow">&#8250;</span>
      </a>
    </li>
  </ul>
</div>

<style>
.profile-greeting {
  text-align: center;
  margin: 2rem 0 2.5rem 0;
}
.profile-greeting h2 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
}
.profile-cards {
  display: flex;
  gap: 1.2rem;
  justify-content: center;
  align-items: stretch;
  flex-wrap: wrap;
}
.profile-card-link {
  flex: 1 1 220px;
  max-width: 320px;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.profile-card-large {
  background: #f6f6f8;
  border-radius: 1.2rem;
  padding: 1.2rem 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 64px;
  margin-bottom: 0.5rem;
  transition: box-shadow 0.2s, background 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}
.profile-card-link:hover .profile-card-large {
  background: var(--color-primary-light, #e0f2f1);
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}
.profile-card-label {
  text-align: center;
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 0.3rem;
}
@media (max-width: 900px) {
  .profile-cards {
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }
  .profile-card-link {
    max-width: 100%;
    width: 100%;
  }
}
.support-section {
  max-width: 700px;
  margin: 2.5rem auto 0 auto;
  padding: 0 1rem;
}
.support-section h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.2rem;
  color: var(--color-text);
}
.support-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.support-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.1rem 1.2rem;
  border-radius: 1rem;
  background: none;
  color: var(--color-text);
  text-decoration: none;
  font-size: 1.08rem;
  font-weight: 500;
  transition: background 0.15s;
  gap: 1rem;
}
.support-link:hover {
  background: #f6f6f8;
}
.support-icon {
  display: flex;
  align-items: center;
  margin-right: 1rem;
}
.support-arrow {
  font-size: 1.5rem;
  color: #bbb;
  margin-left: 1rem;
}
.support-highlight {
  background: #f6f6f8;
  border-radius: 1rem;
}
@media (max-width: 600px) {
  .support-section {
    padding: 0 0.2rem;
  }
  .support-link {
    padding: 0.9rem 0.7rem;
    font-size: 1rem;
  }
}
</style> 