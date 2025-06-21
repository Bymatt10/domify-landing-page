<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  export let currentUser: any = null;

  const menuItems = [
    {
      label: 'Dashboard',
      href: '/admin',
      icon: '📊'
    },
    {
      label: 'Aplicaciones',
      href: '/admin/provider-applications',
      icon: '📝'
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
  }
</script>

<aside class="admin-sidebar">
  <div class="sidebar-header">
    <h1 class="sidebar-title">Domify Admin</h1>
    <p class="sidebar-subtitle">Panel de Administración</p>
  </div>

  <nav class="sidebar-nav">
    {#each menuItems as item}
      <button 
        class="nav-item"
        class:active={isActive(item.href)}
        on:click={() => handleNavigation(item.href)}
        aria-label={item.label}
      >
        <span class="nav-icon">{item.icon}</span>
        <span class="nav-label">{item.label}</span>
      </button>
    {/each}
  </nav>

  <div class="sidebar-footer">
    {#if currentUser}
      <div class="user-info">
        <div class="user-avatar">
          {currentUser.email?.charAt(0).toUpperCase() || 'A'}
        </div>
        <div class="user-details">
          <p class="user-name">{currentUser.email}</p>
          <p class="user-role">{currentUser.role}</p>
        </div>
      </div>
    {/if}
    <button class="logout-btn" on:click={() => goto('/auth/logout')}>
      🚪 Cerrar Sesión
    </button>
  </div>
</aside>

<style>
  .admin-sidebar {
    width: 280px;
    background: #0C3B2E;
    color: white;
    display: flex;
    flex-direction: column;
    position: fixed;
    height: 100vh;
    left: 0;
    top: 0;
    z-index: 1000;
  }

  .sidebar-header {
    padding: 2rem 1.5rem 1rem;
    border-bottom: 1px solid #6D9773;
  }

  .sidebar-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    color: #fff;
  }

  .sidebar-subtitle {
    font-size: 0.875rem;
    color: #B8D4BA;
    margin: 0;
  }

  .sidebar-nav {
    flex: 1;
    padding: 1rem 0;
  }

  .nav-item {
    display: flex;
    align-items: center;
    padding: 0.75rem 1.5rem;
    color: #B8D4BA;
    text-decoration: none;
    transition: all 0.2s;
    cursor: pointer;
    background: none;
    border: none;
    width: 100%;
    text-align: left;
    font-size: 1rem;
  }

  .nav-item:hover {
    background: #6D9773;
    color: #fff;
  }

  .nav-item.active {
    background: #6D9773;
    color: white;
  }

  .nav-icon {
    font-size: 1.25rem;
    margin-right: 0.75rem;
    width: 1.5rem;
    text-align: center;
  }

  .nav-label {
    font-weight: 500;
  }

  .sidebar-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid #6D9773;
  }

  .user-info {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
  }

  .user-avatar {
    width: 2.5rem;
    height: 2.5rem;
    background: #6D9773;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    margin-right: 0.75rem;
  }

  .user-details {
    flex: 1;
  }

  .user-name {
    font-size: 0.875rem;
    font-weight: 500;
    margin: 0 0 0.25rem 0;
    color: #fff;
  }

  .user-role {
    font-size: 0.75rem;
    color: #B8D4BA;
    margin: 0;
    text-transform: capitalize;
  }

  .logout-btn {
    width: 100%;
    background: #dc2626;
    color: white;
    border: none;
    padding: 0.75rem;
    border-radius: 0.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }

  .logout-btn:hover {
    background: #b91c1c;
  }

  @media (max-width: 768px) {
    .admin-sidebar {
      transform: translateX(-100%);
      transition: transform 0.3s ease;
    }
  }
</style> 