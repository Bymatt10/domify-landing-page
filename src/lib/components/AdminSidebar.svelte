<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  export let currentUser: any = null;

  let isMobileMenuOpen = false;

  const menuItems = [
    {
      label: 'Dashboard',
      href: '/admin',
      icon: '📊'
    },
    {
      label: 'Aplicaciones',
      href: '/admin/provider-applications',
      icon: '📝',
      badge: 5
    },
    {
      label: 'Proveedores',
      href: '/admin/providers',
      icon: '🏭'
    },
    {
      label: 'Clientes',
      href: '/admin/customers',
      icon: '👤'
    },
    {
      label: 'Categorías',
      href: '/admin/categories',
      icon: '🏷️'
    }
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
</script>

<!-- Mobile Menu Button -->
<button 
  class="lg:hidden fixed top-3 left-3 z-50 p-2 bg-primary-600 text-white rounded-md shadow-lg hover:bg-primary-700 transition-colors duration-200"
  on:click={toggleMobileMenu}
  aria-label="Toggle menu"
>
  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
  </svg>
</button>

<!-- Overlay for mobile -->
{#if isMobileMenuOpen}
  <div 
    class="lg:hidden fixed inset-0 bg-black/50 z-40"
    on:click={toggleMobileMenu}
    role="button"
    tabindex="0"
    on:keydown={(e) => e.key === 'Escape' && toggleMobileMenu()}
  ></div>
{/if}

<!-- Sidebar -->
<aside 
  class="fixed top-0 left-0 z-40 w-64 h-screen bg-white border-r border-secondary-200 transition-transform duration-300 ease-in-out shadow-sm"
  class:translate-x-0={isMobileMenuOpen}
  class:-translate-x-full={!isMobileMenuOpen}
  class:lg:translate-x-0={true}
>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="px-4 py-3 border-b border-secondary-200 bg-gradient-to-r from-primary-50 to-primary-100">
      <div class="flex items-center space-x-2">
        <div class="w-7 h-7 bg-gradient-to-br from-primary-500 to-primary-600 rounded-md flex items-center justify-center shadow-sm">
          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8z" clip-rule="evenodd"></path>
          </svg>
        </div>
        <div>
          <h1 class="text-sm font-bold text-secondary-900">Domify Admin</h1>
          <p class="text-xs text-secondary-600">Panel de Control</p>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
      {#each menuItems as item}
        <button 
          class="w-full flex items-center px-2 py-1.5 text-left rounded-md transition-all duration-200 group relative"
          class:bg-primary-100={isActive(item.href)}
          class:text-primary-700={isActive(item.href)}
          class:border-l-3={isActive(item.href)}
          class:border-primary-500={isActive(item.href)}
          class:hover:bg-secondary-50={!isActive(item.href)}
          class:text-secondary-700={!isActive(item.href)}
          class:hover:text-secondary-900={!isActive(item.href)}
          on:click={() => handleNavigation(item.href)}
          aria-label={item.label}
        >
          <div class="flex items-center space-x-2 flex-1">
            <span class="text-sm">{item.icon}</span>
            <span class="font-medium text-xs">{item.label}</span>
          </div>
          
          {#if item.badge}
            <span class="px-1 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full min-w-[16px] text-center leading-none">
              {item.badge}
            </span>
          {/if}
        </button>
      {/each}
    </nav>

    <!-- User Info & Logout -->
    <div class="p-3 border-t border-secondary-200 bg-secondary-50">
      {#if currentUser}
        <div class="mb-2">
          <div class="flex items-center space-x-2 p-1.5 bg-white rounded-md border border-secondary-200">
            <div class="w-6 h-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
              {currentUser.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-semibold text-secondary-900 truncate">
                {currentUser.email}
              </p>
              <p class="text-xs text-secondary-500 capitalize">
                {currentUser.role || 'Administrador'}
              </p>
            </div>
          </div>
        </div>
      {/if}
      
      <button 
        class="w-full flex items-center space-x-1.5 px-2 py-1.5 text-red-600 hover:bg-red-50 rounded-md transition-all duration-200 group text-xs"
        on:click={handleLogout}
      >
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
        </svg>
        <span class="font-medium">Cerrar Sesión</span>
      </button>
    </div>
  </div>
</aside> 