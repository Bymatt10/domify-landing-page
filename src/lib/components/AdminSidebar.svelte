<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { 
    LayoutDashboard, FileText, Users, Building2, 
    Tags, Download, LogOut, Menu, X, 
    ChevronRight, Bell, Sparkles
  } from "lucide-svelte";

  export let currentUser: any = null;

  let isMobileMenuOpen = false;
  let pendingApplicationsCount = 0;
  let loadingBadge = true;

  const menuItems = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      label: "Aplicaciones",
      href: "/admin/provider-applications",
      icon: FileText,
      badge: pendingApplicationsCount,
      loadingBadge,
    },
    {
      label: "Proveedores",
      href: "/admin/providers",
      icon: Building2,
    },
    {
      label: "Clientes",
      href: "/admin/customers",
      icon: Users,
    },
    {
      label: "Categorías",
      href: "/admin/categories",
      icon: Tags,
    },
    {
      label: "Importación Masiva",
      href: "/admin/bulk-import",
      icon: Download,
    },
  ];

  onMount(async () => {
    await loadPendingApplicationsCount();
  });

  async function loadPendingApplicationsCount() {
    try {
      const response = await fetch("/api/provider-applications/stats");
      if (response.ok) {
        const data = await response.json();
        pendingApplicationsCount = data.pending || 0;
      }
    } catch (error) {
      console.error("Error loading pending applications count:", error);
      pendingApplicationsCount = 0;
    } finally {
      loadingBadge = false;
    }
  }

  // Función para refrescar el contador (puede ser llamada desde otros componentes)
  export function refreshBadge() {
    loadPendingApplicationsCount();
  }

  function isActive(href: string) {
    if (href === "/admin") {
      return $page.url.pathname === "/admin";
    }
    return $page.url.pathname.startsWith(href);
  }

  function handleNavigation(href: string) {
    goto(href);
    isMobileMenuOpen = false;
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      goto("/auth/login");
    } catch (error) {
      console.error("Error logging out:", error);
      goto("/auth/login");
    }
  }

  function toggleMobileMenu() {
    isMobileMenuOpen = !isMobileMenuOpen;
  }
</script>

<!-- Mobile Menu Button -->
<button
  class="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white text-slate-900 rounded-xl shadow-lg hover:bg-slate-50 transition-all duration-200 border border-slate-200 active:scale-95"
  on:click={toggleMobileMenu}
  aria-label="Toggle menu"
>
  {#if isMobileMenuOpen}
    <X size={20} />
  {:else}
    <Menu size={20} />
  {/if}
</button>

<!-- Overlay for mobile -->
{#if isMobileMenuOpen}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    class="lg:hidden fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity"
    on:click={toggleMobileMenu}
    role="button"
    tabindex="0"
  ></div>
{/if}

<!-- Sidebar -->
<aside
  class="fixed top-0 left-0 z-[60] w-72 h-screen bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out shadow-sm flex flex-col font-inter"
  class:translate-x-0={isMobileMenuOpen}
  class:-translate-x-full={!isMobileMenuOpen}
  class:lg:translate-x-0={true}
>
  <!-- Header Logo -->
  <div
    class="px-8 pt-14 pb-10 border-b border-slate-100 flex items-center space-x-3 shrink-0"
  >
    <div
      class="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/10 group-hover:scale-110 transition-transform"
    >
      <span class="text-white font-outfit font-bold text-xl leading-none">D</span>
    </div>
    <div class="flex flex-col">
      <h1 class="text-xl font-bold tracking-tight text-slate-900 font-outfit leading-tight">
        Domify<span class="text-blue-600">Admin</span>
      </h1>
      <div class="flex items-center gap-1 mt-0.5">
        <Sparkles size={10} class="text-blue-500" />
        <p class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
          Control Center
        </p>
      </div>
    </div>
  </div>

  <!-- Navigation -->
  <nav
    class="flex-1 px-4 py-10 space-y-1.5 overflow-y-auto align-content-start scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent"
  >
    <div
      class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 px-4"
    >
      Menú Principal
    </div>

    {#each menuItems as item}
      <button
        class="w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 group relative outline-none mb-1"
        class:bg-blue-50={isActive(item.href)}
        class:text-blue-600={isActive(item.href)}
        class:hover:bg-slate-50={!isActive(item.href)}
        class:text-slate-500={!isActive(item.href)}
        class:hover:text-slate-900={!isActive(item.href)}
        on:click={() => handleNavigation(item.href)}
        aria-label={item.label}
      >
        <div class="flex items-center space-x-3.5">
          <div
            class="transition-colors duration-200"
            class:text-blue-600={isActive(item.href)}
            class:text-slate-400={!isActive(item.href)}
            class:group-hover:text-slate-600={!isActive(item.href)}
          >
            <svelte:component this={item.icon} size={20} strokeWidth={isActive(item.href) ? 2.5 : 2} />
          </div>
          <span class="font-bold text-sm tracking-tight">{item.label}</span>
        </div>

        {#if item.label === "Aplicaciones" && (pendingApplicationsCount > 0 || loadingBadge)}
          <div class="flex items-center justify-center shrink-0">
            <span
              class="px-2 py-0.5 text-[10px] font-bold text-white bg-blue-600 rounded-full min-w-[20px] text-center shadow-md shadow-blue-600/20"
            >
              {#if loadingBadge}
                <div class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              {:else}
                {pendingApplicationsCount > 99
                  ? "99+"
                  : pendingApplicationsCount}
              {/if}
            </span>
          </div>
        {:else if isActive(item.href)}
             <ChevronRight size={14} class="text-blue-600/50" />
        {/if}
      </button>
    {/each}
  </nav>

  <!-- User Info & Logout -->
  <div class="p-6 border-t border-slate-100 bg-slate-50/50 shrink-0">
    <div class="bg-white border border-slate-200 rounded-[1.5rem] p-4 mb-4 shadow-sm">
      {#if currentUser}
        <div class="flex items-center space-x-3">
          <div
            class="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-outfit font-bold text-lg shadow-md shrink-0"
          >
            {currentUser.email?.charAt(0).toUpperCase() || "A"}
          </div>
          <div class="flex-1 min-w-0">
            <p
              class="text-sm font-bold text-slate-900 truncate font-outfit"
              title={currentUser.email}
            >
              {currentUser.email?.split('@')[0]}
            </p>
            <p
              class="text-[10px] text-blue-600 uppercase tracking-widest font-bold flex items-center gap-1.5 mt-0.5"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              <span>Admin</span>
            </p>
          </div>
        </div>
      {:else}
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-xl bg-slate-100 animate-pulse shrink-0"></div>
          <div class="flex-1">
            <div class="h-3 bg-slate-100 rounded w-3/4 mb-1.5 animate-pulse"></div>
            <div class="h-2 bg-slate-50 rounded w-1/2 animate-pulse"></div>
          </div>
        </div>
      {/if}
    </div>

    <button
      class="w-full flex items-center justify-center space-x-2 px-4 py-3 text-slate-500 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-xl transition-all duration-200 group text-sm font-bold active:scale-95 shadow-sm"
      on:click={handleLogout}
    >
      <LogOut size={16} class="text-slate-400 group-hover:text-red-500 transition-colors" />
      <span>Cerrar Sesión</span>
    </button>
  </div>
</aside>
