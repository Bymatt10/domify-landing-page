<script lang="ts">
  import { onMount } from 'svelte';
  import AdminSidebar from '$lib/components/AdminSidebar.svelte';

  let currentUser: any = null;

  onMount(async () => {
    // Get current user info
    const response = await fetch('/api/me');
    if (response.ok) {
      currentUser = await response.json();
    }
  });
</script>

<div class="min-h-screen bg-secondary-50">
  <AdminSidebar {currentUser} />
  
  <!-- Main Content -->
  <main class="lg:ml-64 transition-all duration-300 ease-in-out">
    <div class="p-4 lg:p-6">
      <slot />
    </div>
  </main>
</div>

<style>
  .admin-layout {
    display: flex;
    min-height: 100vh;
    background: #F8FAFC;
  }

  .admin-main {
    flex: 1;
    margin-left: 280px;
    padding: 2rem;
    max-width: calc(100vw - 280px);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .admin-main {
      margin-left: 0;
      max-width: 100vw;
      padding: 1rem;
    }
  }
</style> 