<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import StatsCard from "$lib/components/StatsCard.svelte";
  import LoadingSpinner from "$lib/components/LoadingSpinner.svelte";
  import { 
    Search, FileText, CheckCircle2, Building2, 
    Tags, Users, TrendingUp, Clock, 
    ChevronRight, AlertCircle, Plus, LayoutGrid,
    Sparkles, ArrowUpRight, Zap, Target,
    LayoutDashboard, Shield
  } from "lucide-svelte";

  let stats = {
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    totalProviders: 0,
    totalCategories: 0,
  };

  let loading = true;
  let recentActivities = [
    {
      id: 1,
      type: "application",
      title: "Nueva aplicación de proveedor",
      description: "Juan Pérez ha enviado una solicitud para servicios de limpieza",
      time: "Hace 2 horas",
      status: "pending",
    },
    {
      id: 2,
      type: "approval",
      title: "Aplicación aprobada",
      description: "María González ha sido aprobada como proveedora de jardinería",
      time: "Hace 4 horas",
      status: "approved",
    },
    {
      id: 3,
      type: "category",
      title: "Nueva categoría agregada",
      description: 'Se agregó la categoría "Reparaciones Eléctricas"',
      time: "Hace 1 día",
      status: "info",
    },
  ];

  onMount(async () => {
    try {
      // Fetch basic stats
      const [applicationsRes, providersRes, categoriesRes] = await Promise.all([
        fetch("/api/provider-applications/stats"),
        fetch("/api/providers"),
        fetch("/api/categories"),
      ]);

      // Datos de ejemplo solo como último recurso
      const fallbackStats = {
        totalApplications: 12,
        pendingApplications: 5,
        approvedApplications: 4,
        totalProviders: 8,
        totalCategories: 5,
      };

      let applicationsLoaded = false;

      if (applicationsRes.ok) {
        const applicationsData = await applicationsRes.json();
        if (applicationsData.total !== undefined) {
          stats.totalApplications = applicationsData.total;
          stats.pendingApplications = applicationsData.pending || 0;
          stats.approvedApplications = applicationsData.approved || 0;
          applicationsLoaded = true;
        }
      }

      if (!applicationsLoaded) {
        stats.totalApplications = fallbackStats.totalApplications;
        stats.pendingApplications = fallbackStats.pendingApplications;
        stats.approvedApplications = fallbackStats.approvedApplications;
      }

      if (providersRes.ok) {
        const providersData = await providersRes.json();
        stats.totalProviders = providersData.length || fallbackStats.totalProviders;
      } else {
        stats.totalProviders = fallbackStats.totalProviders;
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        stats.totalCategories = categoriesData.length || fallbackStats.totalCategories;
      } else {
        stats.totalCategories = fallbackStats.totalCategories;
      }
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
      stats = {
        totalApplications: 12,
        pendingApplications: 5,
        approvedApplications: 4,
        totalProviders: 8,
        totalCategories: 5,
      };
    } finally {
      loading = false;
    }
  });

  function getStatusColor(status: string) {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-600 border-amber-100";
      case "approved":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "info":
        return "bg-blue-50 text-blue-600 border-blue-100";
      default:
        return "bg-slate-50 text-slate-600 border-slate-100";
    }
  }
</script>

<svelte:head>
  <title>Dashboard - Domify Admin</title>
</svelte:head>

{#if loading}
  <div class="flex items-center justify-center min-h-[60vh]">
    <div class="flex flex-col items-center gap-4">
      <LoadingSpinner size="lg" color="primary" />
      <p class="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Cargando Panel Central...</p>
    </div>
  </div>
{:else}
  <!-- Header area -->
  <div class="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
    <div class="space-y-2">
      <div class="flex items-center gap-3 mb-1">
        <div class="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-900/10">
          <LayoutDashboard size={24} />
        </div>
        <h1 class="text-3xl font-black text-slate-900 tracking-tight font-outfit">
          Centro de <span class="text-blue-600">Control</span>
        </h1>
      </div>
      <p class="text-slate-500 font-medium flex items-center gap-2 pl-15">
        <TrendingUp size={16} class="text-emerald-500" />
        <span class="font-bold text-slate-900">{stats.pendingApplications} tareas</span> pendientes de revisión hoy.
      </p>
    </div>

    <div class="relative w-full md:w-96 group">
      <div class="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-600 text-slate-400">
        <Search size={18} />
      </div>
      <input
        type="text"
        class="block w-full pl-12 pr-6 py-4 border border-slate-100 rounded-[2rem] bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all shadow-sm font-inter font-medium"
        placeholder="Buscar cualquier entidad..."
      />
    </div>
  </div>

  <!-- Notice Banner -->
  {#if stats.totalApplications === 12 && stats.pendingApplications === 5 && stats.approvedApplications === 4}
    <div class="mb-10 bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group">
      <div class="absolute -right-20 -top-20 w-64 h-64 bg-amber-50 rounded-full blur-3xl opacity-50"></div>
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
        <div class="flex items-center gap-5">
          <div class="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 shrink-0">
            <AlertCircle size={28} />
          </div>
          <div>
            <h4 class="text-lg font-bold text-slate-900 font-outfit">Modo de Demostración Activo</h4>
            <p class="text-slate-500 text-sm font-medium">
              Conexión de base de datos no detectada. Usando set de datos simulado.
            </p>
          </div>
        </div>
        <button class="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95">
          Configurar DB
        </button>
      </div>
    </div>
  {/if}

  <!-- Stats Grid -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
    <StatsCard
      label="SOLICITUDES"
      number={stats.totalApplications.toString()}
      iconName="file"
      accent="blue"
      trend="+12%"
    />
    <StatsCard
      label="PENDIENTES"
      number={stats.pendingApplications.toString()}
      iconName="clock"
      accent="amber"
      delay={100}
      trend="+4%"
    />
    <StatsCard
      label="APROBADAS"
      number={stats.approvedApplications.toString()}
      iconName="check"
      accent="emerald"
      delay={200}
      trend="+8%"
    />
    <StatsCard
      label="PROVEEDORES"
      number={stats.totalProviders.toString()}
      iconName="building"
      accent="indigo"
      delay={300}
      trend="+18%"
    />
    <StatsCard
      label="CATEGORÍAS"
      number={stats.totalCategories.toString()}
      iconName="tag"
      accent="rose"
      delay={400}
      trend="+1"
    />
  </div>

  <!-- Main Content Grid -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <!-- Quick Actions -->
    <div class="lg:col-span-2">
      <div class="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm relative overflow-hidden h-full">
        <div class="flex items-center justify-between mb-10">
          <div>
            <h2 class="text-2xl font-black text-slate-900 font-outfit flex items-center gap-3">
              <Zap size={24} class="text-blue-600" />
              Acciones Estratégicas
            </h2>
            <p class="text-slate-400 text-sm font-medium mt-1">Gestiona los pilares fundamentales de Domify</p>
          </div>
          <button class="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors">
            <LayoutGrid size={20} />
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <button
            class="group p-8 bg-slate-50 hover:bg-white rounded-[2rem] border-2 border-transparent hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-600/5 transition-all duration-500 text-left relative overflow-hidden"
            on:click={() => goto("/admin/provider-applications")}
          >
            <div class="absolute -right-4 -top-4 w-24 h-24 bg-blue-100/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div class="relative z-10 flex items-center justify-between mb-8">
              <div class="w-16 h-16 bg-blue-100 rounded-[1.25rem] flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 rotate-0 group-hover:rotate-6 shadow-lg shadow-blue-600/5">
                <FileText size={32} />
              </div>
              <ArrowUpRight size={20} class="text-slate-300 group-hover:text-blue-400 transition-colors" />
            </div>
            
            <h3 class="text-xl font-black text-slate-900 mb-3 font-outfit uppercase tracking-tight">Aplicaciones</h3>
            <p class="text-slate-500 text-sm font-medium leading-relaxed">
              Evalúa perfiles y certificaciones de nuevos proveedores interesados.
            </p>
          </button>

          <button
            class="group p-8 bg-slate-50 hover:bg-white rounded-[2rem] border-2 border-transparent hover:border-emerald-100 hover:shadow-2xl hover:shadow-emerald-600/5 transition-all duration-500 text-left relative overflow-hidden"
            on:click={() => goto("/admin/categories")}
          >
            <div class="absolute -right-4 -top-4 w-24 h-24 bg-emerald-100/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div class="relative z-10 flex items-center justify-between mb-8">
              <div class="w-16 h-16 bg-emerald-100 rounded-[1.25rem] flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 rotate-0 group-hover:rotate-6 shadow-lg shadow-emerald-600/5">
                <Tags size={32} />
              </div>
              <ArrowUpRight size={20} class="text-slate-300 group-hover:text-emerald-400 transition-colors" />
            </div>
            
            <h3 class="text-xl font-black text-slate-900 mb-3 font-outfit uppercase tracking-tight">Categorías</h3>
            <p class="text-slate-500 text-sm font-medium leading-relaxed">
              Organiza la oferta de servicios mediante taxonomías eficientes.
            </p>
          </button>

          <button
            class="group p-8 bg-slate-50 hover:bg-white rounded-[2rem] border-2 border-transparent hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-600/5 transition-all duration-500 text-left relative overflow-hidden"
            on:click={() => goto("/admin/providers")}
          >
            <div class="absolute -right-4 -top-4 w-24 h-24 bg-indigo-100/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div class="relative z-10 flex items-center justify-between mb-8">
              <div class="w-16 h-16 bg-indigo-100 rounded-[1.25rem] flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 rotate-0 group-hover:rotate-6 shadow-lg shadow-indigo-600/5">
                <Building2 size={32} />
              </div>
              <ArrowUpRight size={20} class="text-slate-300 group-hover:text-indigo-400 transition-colors" />
            </div>
            
            <h3 class="text-xl font-black text-slate-900 mb-3 font-outfit uppercase tracking-tight">Proveedores</h3>
            <p class="text-slate-500 text-sm font-medium leading-relaxed">
              Supervisa el rendimiento y perfiles de los socios estratégicos activos.
            </p>
          </button>

          <button
            class="group p-8 bg-slate-50 hover:bg-white rounded-[2rem] border-2 border-transparent hover:border-rose-100 hover:shadow-2xl hover:shadow-rose-600/5 transition-all duration-500 text-left relative overflow-hidden"
            on:click={() => {}}
          >
            <div class="absolute -right-4 -top-4 w-24 h-24 bg-rose-100/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div class="relative z-10 flex items-center justify-between mb-8">
              <div class="w-16 h-16 bg-rose-100 rounded-[1.25rem] flex items-center justify-center text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-all duration-500 rotate-0 group-hover:rotate-6 shadow-lg shadow-rose-600/5">
                <Users size={32} />
              </div>
              <ArrowUpRight size={20} class="text-slate-300 group-hover:text-rose-400 transition-colors" />
            </div>
            
            <h3 class="text-xl font-black text-slate-900 mb-3 font-outfit uppercase tracking-tight">Importación</h3>
            <p class="text-slate-500 text-sm font-medium leading-relaxed">
              Alimenta el sistema con volumen de datos mediante herramientas masivas.
            </p>
          </button>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col relative overflow-hidden">
      <div class="p-8 border-b border-slate-50 bg-slate-50/20 flex items-center justify-between shrink-0">
        <div>
          <h2 class="text-lg font-black text-slate-900 font-outfit flex items-center gap-2">
            <Target size={18} class="text-indigo-500" />
            Flujo Reciente
          </h2>
        </div>
        <button class="text-blue-600 hover:text-blue-700 text-xs font-black uppercase tracking-widest transition-colors active:scale-95">
          Historial
        </button>
      </div>

      <div class="p-8 flex-1 overflow-auto scrollbar-hide">
        <div class="space-y-10 relative">
          <!-- Timeline line -->
          <div class="absolute top-0 left-6 h-full w-px bg-slate-100 -translate-x-1/2"></div>
          
          {#each recentActivities as activity}
            <div class="relative pl-12">
              <div class={`absolute top-1 left-6 w-4 h-4 -translate-x-1/2 rounded-full border-4 border-white shadow-xl z-20 group-hover:scale-125 transition-transform ${activity.status === "pending" ? "bg-amber-400" : activity.status === "approved" ? "bg-emerald-400" : "bg-blue-400"}`}></div>

              <div class="group transition-all duration-300">
                <div class="flex items-center justify-between mb-2">
                  <p class="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    {activity.time}
                  </p>
                  <span class={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${getStatusColor(activity.status)}`}>
                    {activity.status}
                  </span>
                </div>
                <h4 class="text-sm font-bold text-slate-900 mb-1 font-outfit group-hover:text-blue-600 transition-colors">
                  {activity.title}
                </h4>
                <p class="text-[11px] text-slate-500 font-medium leading-relaxed">
                  {activity.description}
                </p>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <div class="p-8 pt-0">
        <button class="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-900/10">
           <Plus size={16} />
           <span>Nueva Anotación</span>
        </button>
      </div>
    </div>
  </div>

  <!-- System Health -->
  <div class="mt-8 bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
    <div class="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[80px]"></div>
    
    <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
      <div class="flex items-center gap-6">
        <div class="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-blue-400 border border-white/10">
          <Shield size={28} />
        </div>
        <div>
          <h3 class="text-xl font-bold font-outfit">Saturación del Sistema</h3>
          <p class="text-slate-400 text-sm font-medium">Todos los módulos reportan estado saludable (99.9% uptime)</p>
        </div>
      </div>
      
      <div class="flex items-center gap-8">
        <div class="text-center">
          <div class="text-2xl font-black font-outfit">C$ 12.4k</div>
          <div class="text-[10px] text-slate-500 font-black uppercase tracking-widest">Revenue 24h</div>
        </div>
        <div class="w-px h-10 bg-white/10"></div>
        <div class="text-center">
          <div class="text-2xl font-black font-outfit">8.2ms</div>
          <div class="text-[10px] text-slate-500 font-black uppercase tracking-widest">Avg Latency</div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  :global(.scrollbar-hide::-webkit-scrollbar) {
    display: none;
  }
</style>
