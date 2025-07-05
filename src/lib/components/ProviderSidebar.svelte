<script lang="ts">
import { page } from '$app/stores';
import { goto } from '$app/navigation';

export let user: any = null;
export let providerProfile: any = null;

let isMobileMenuOpen = false;

const menuItems = [
  { label: 'Dashboard', href: '/provider', icon: 'dashboard' },
  { label: 'Mi Perfil', href: '/provider/profile', icon: 'user' },
  { label: 'Mis Servicios', href: '/provider/services', icon: 'services' },
  { label: 'Reservas', href: '/provider/bookings', icon: 'calendar' },
  { label: 'Portafolio', href: '/provider/portfolio', icon: 'portfolio' },
  { label: 'Documentos', href: '/provider/documents', icon: 'document' },
  { label: 'Ganancias', href: '/provider/earnings', icon: 'earnings' },
  { label: 'Configuración', href: '/provider/settings', icon: 'settings' }
];

function isActive(href: string) {
  return $page.url.pathname === href;
}

function handleNavigation(href: string) {
  goto(href);
  isMobileMenuOpen = false;
}

async function handleLogout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
    goto('/auth/login');
  } catch (error) {
    console.error('Error logging out:', error);
    goto('/auth/login');
  }
}

function toggleMobileMenu() {
  isMobileMenuOpen = !isMobileMenuOpen;
}

function getInitial() {
  return (
    user?.user_metadata?.first_name?.charAt(0) ||
    user?.user_metadata?.full_name?.charAt(0) ||
    user?.email?.charAt(0) ||
    'P'
  ).toUpperCase();
}
</script>

<!-- Mobile Menu Button -->
<button 
  class="lg:hidden fixed top-3 left-3 z-50 p-2 bg-primary-600 text-white rounded-md shadow-lg hover:bg-primary-700 transition-colors duration-200"
  on:click={toggleMobileMenu}
  aria-label="Abrir menú"
>
  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
  </svg>
</button>

<!-- Overlay for mobile -->
{#if isMobileMenuOpen}
  <div 
    class="lg:hidden fixed inset-0 bg-black/40 z-40"
    on:click={toggleMobileMenu}
    role="button"
    tabindex="0"
    on:keydown={(e) => e.key === 'Escape' && toggleMobileMenu()}
  ></div>
{/if}

<!-- Sidebar -->
<aside 
  class="fixed top-0 left-0 z-40 w-72 h-screen bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out shadow-lg"
  class:translate-x-0={isMobileMenuOpen}
  class:-translate-x-full={!isMobileMenuOpen}
  class:lg:translate-x-0={true}
>
  <div class="flex flex-col h-full">
    <!-- Header: Avatar y nombre -->
    <div class="px-6 py-12 mt-6 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-primary-100 flex flex-col items-center">
      <div class="w-20 h-20 rounded-full bg-primary-600 flex items-center justify-center text-3xl text-white font-bold mb-2 shadow-md">
        {#if user?.user_metadata?.avatar_url}
          <img src={user.user_metadata.avatar_url} alt="Avatar" class="w-20 h-20 rounded-full object-cover" />
        {:else}
          {getInitial()}
        {/if}
      </div>
      <div class="text-center">
        <h2 class="text-lg font-bold text-gray-900">{providerProfile?.business_name || 'Proveedor'}</h2>
        <p class="text-sm text-gray-500">{providerProfile?.location || 'Ubicación no especificada'}</p>
        <a href="/provider/profile" class="mt-2 inline-block text-primary-600 hover:underline text-xs font-medium">Editar perfil</a>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
      {#each menuItems as item}
        <button 
          class="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 group relative text-base font-medium"
          class:bg-primary-100={isActive(item.href)}
          class:text-primary-700={isActive(item.href)}
          class:border-l-4={isActive(item.href)}
          class:border-primary-500={isActive(item.href)}
          class:hover:bg-primary-50={!isActive(item.href)}
          class:text-gray-700={!isActive(item.href)}
          class:hover:text-primary-700={!isActive(item.href)}
          on:click={() => handleNavigation(item.href)}
          aria-label={item.label}
        >
          <span class="w-6 h-6 flex items-center justify-center">
            {#if item.icon === 'dashboard'}
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8v-10h-8v10zm0-18v6h8V3h-8z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            {:else if item.icon === 'user'}
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke-width="2"/><path d="M4 20c0-4 4-7 8-7s8 3 8 7" stroke-width="2"/></svg>
            {:else if item.icon === 'services'}
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 17v-2a4 4 0 018 0v2M5 21v-2a4 4 0 018 0v2M9 7V5a4 4 0 018 0v2" stroke-width="2"/></svg>
            {:else if item.icon === 'calendar'}
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" stroke-width="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke-width="2"/></svg>
            {:else if item.icon === 'portfolio'}
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2" stroke-width="2"/><path d="M16 3v4M8 3v4" stroke-width="2"/></svg>
            {:else if item.icon === 'document'}
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="6" y="3" width="12" height="18" rx="2" stroke-width="2"/><path d="M9 7h6M9 11h6M9 15h6" stroke-width="2"/></svg>
            {:else if item.icon === 'earnings'}
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"/><path d="M8 12h8M12 8v8" stroke-width="2"/></svg>
            {:else if item.icon === 'settings'}
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" stroke-width="2"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33h.09a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51h.09a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v.09a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke-width="2"/></svg>
            {/if}
          </span>
          <span>{item.label}</span>
        </button>
      {/each}
    </nav>

    <!-- Logout -->
    <div class="mt-auto px-6 py-6 border-t border-gray-100 bg-gray-50">
      <button 
        class="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium"
        on:click={handleLogout}
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
        Cerrar sesión
      </button>
    </div>
  </div>
</aside> 