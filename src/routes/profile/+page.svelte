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

<div class="text-center my-8">
  <h2 class="text-3xl font-bold text-gray-900">¡Hola, {nombre.split(' ')[0]}!</h2>
</div>

<div class="flex gap-5 justify-center items-stretch flex-wrap">
  <a class="flex-1 min-w-[220px] max-w-[320px] no-underline flex flex-col items-center" href="/profile/info">
    <div class="bg-gray-100 rounded-2xl p-5 w-full flex items-center justify-center min-h-[64px] mb-2 transition-all duration-200 shadow-sm hover:bg-blue-100 hover:shadow-md">
      <svg width="32" height="32" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2" fill="none"/><path d="M4 20c0-4 4-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="2" fill="none"/></svg>
    </div>
    <div class="text-center text-base font-medium text-gray-900 mb-1">Información personal</div>
  </a>
  <a class="flex-1 min-w-[220px] max-w-[320px] no-underline flex flex-col items-center" href="/ayuda">
    <div class="bg-gray-100 rounded-2xl p-5 w-full flex items-center justify-center min-h-[64px] mb-2 transition-all duration-200 shadow-sm hover:bg-blue-100 hover:shadow-md">
      <svg width="32" height="32" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><path d="M9 9a3 3 0 0 1 6 0c0 2-3 3-3 5" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="17" r="1" fill="currentColor"/></svg>
    </div>
    <div class="text-center text-base font-medium text-gray-900 mb-1">Ayuda en línea</div>
  </a>
</div>

<!-- Sección de Soporte -->
<div class="max-w-2xl mx-auto mt-10 px-4">
  <h3 class="text-2xl font-bold mb-5 text-gray-900">Soporte</h3>
  <ul class="list-none p-0 m-0">
    <li>
      <a href="/terms" class="flex items-center justify-between p-4 rounded-2xl bg-transparent text-gray-900 no-underline text-lg font-medium transition-colors duration-150 gap-4 hover:bg-gray-100">
        <span class="flex items-center mr-4">
          <svg width="22" height="22" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><text x="12" y="16" text-anchor="middle" font-size="12" fill="currentColor">i</text></svg>
        </span>
        <span class="flex-1">Términos y condiciones</span>
        <span class="text-2xl text-gray-400 ml-4">&#8250;</span>
      </a>
    </li>
    <li>
      <a href="/privacy" class="flex items-center justify-between p-4 rounded-2xl bg-transparent text-gray-900 no-underline text-lg font-medium transition-colors duration-150 gap-4 hover:bg-gray-100">
        <span class="flex items-center mr-4">
          <svg width="22" height="22" viewBox="0 0 24 24"><rect x="6" y="10" width="12" height="8" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 16v-4" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="13" r="1" fill="currentColor"/></svg>
        </span>
        <span class="flex-1">Políticas de privacidad</span>
        <span class="text-2xl text-gray-400 ml-4">&#8250;</span>
      </a>
    </li>
    <li>
      <a href="#" class="flex items-center justify-between p-4 rounded-2xl bg-transparent text-gray-900 no-underline text-lg font-medium transition-colors duration-150 gap-4 hover:bg-gray-100" on:click|preventDefault={handleLogout}>
        <span class="flex items-center mr-4">
          <svg width="22" height="22" viewBox="0 0 24 24"><path d="M16 17v-1a4 4 0 0 0-8 0v1" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" fill="none"/><path d="M2 17h20" stroke="currentColor" stroke-width="2"/></svg>
        </span>
        <span class="flex-1">Cerrar sesión</span>
        <span class="text-2xl text-gray-400 ml-4">&#8250;</span>
      </a>
    </li>
  </ul>
</div>

<!-- Media queries para responsive se manejan con clases de Tailwind responsive --> 