<script lang="ts">
  import { onMount } from "svelte";
  import AdminSidebar from "$lib/components/AdminSidebar.svelte";

  let currentUser: any = null;
  let sidebarComponent: any = null;

  onMount(async () => {
    // Get current user info
    const response = await fetch("/api/me");
    if (response.ok) {
      currentUser = await response.json();
    }

    // Exponer la función de refrescar badge globalmente
    (window as any).refreshAdminBadge = () => {
      if (sidebarComponent && sidebarComponent.refreshBadge) {
        sidebarComponent.refreshBadge();
      }
    };
  });
</script>

<div
  class="min-h-screen bg-slate-50 text-slate-900 font-inter selection:bg-blue-100 selection:text-blue-900"
>
  <AdminSidebar bind:this={sidebarComponent} {currentUser} />

  <!-- Main Content -->
  <main
    class="lg:ml-72 transition-all duration-300 ease-in-out flex flex-col min-h-screen"
  >
    <div class="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
      <slot />
    </div>
  </main>
</div>

<style>
  :global(.admin-page) {
    color: #cbd5e1; /* slate-300 */
  }
</style>
