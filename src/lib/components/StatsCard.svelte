<script lang="ts">
  import { onMount } from "svelte";
  import { 
    FileText, Clock, CheckCircle2, Building2, 
    Tags, Users, TrendingUp, TrendingDown 
  } from "lucide-svelte";

  export let number: string;
  export let label: string;
  export let delay: number = 0;
  export let iconName: "file" | "clock" | "check" | "building" | "tag" | "users" = "file";
  export let accent: "blue" | "amber" | "emerald" | "indigo" | "rose" = "blue";
  export let trend: string = "";

  let isVisible = false;
  let animatedNumber = 0;
  let finalNumber = 0;

  // Extract numeric value for animation
  $: {
    const numericMatch = number.match(/[\d.]+/);
    if (numericMatch) {
      finalNumber = parseFloat(numericMatch[0]);
    }
  }

  function animateNumber() {
    if (!finalNumber || finalNumber === 0) return;

    const duration = 1500; // 1.5 seconds
    const fps = 60;
    const totalFrames = (duration / 1000) * fps;
    const increment = finalNumber / totalFrames;

    const timer = setInterval(() => {
      animatedNumber += increment;
      if (animatedNumber >= finalNumber) {
        animatedNumber = finalNumber;
        clearInterval(timer);
      }
    }, 1000 / fps);
  }

  function formatNumber(num: number): string {
    if (number.includes(".")) {
      return num.toFixed(1).replace(/\.0$/, "");
    }
    return Math.floor(num).toString();
  }

  function intersectionObserver(node: HTMLElement) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            isVisible = true;
            setTimeout(() => {
              animateNumber();
            }, delay);
            observer.unobserve(node);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(node);

    return {
      destroy() {
        observer.unobserve(node);
      },
    };
  }

  const icons = {
    file: FileText,
    clock: Clock,
    check: CheckCircle2,
    building: Building2,
    tag: Tags,
    users: Users,
  };

  const colors = {
    blue: "text-blue-600 bg-blue-50 border-blue-100 shadow-blue-600/5",
    amber: "text-amber-600 bg-amber-50 border-amber-100 shadow-amber-600/5",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100 shadow-emerald-600/5",
    indigo: "text-indigo-600 bg-indigo-50 border-indigo-100 shadow-indigo-600/5",
    rose: "text-rose-600 bg-rose-50 border-rose-100 shadow-rose-600/5",
  };
</script>

<div
  class="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-500 group relative overflow-hidden flex flex-col items-center text-center sm:block sm:text-left"
  use:intersectionObserver
>
  <div class="flex items-center justify-between mb-4 w-full">
    <div
      class={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${colors[accent]}`}
    >
      <svelte:component this={icons[iconName]} size={24} />
    </div>
    
    {#if trend}
      <div class="flex items-center gap-1 bg-slate-50 border border-slate-100 px-2 py-1 rounded-full">
        <TrendingUp size={10} class="text-emerald-500" />
        <span class="text-[10px] font-bold text-slate-500 tracking-tight">{trend}</span>
      </div>
    {/if}
  </div>

  <div class="space-y-1">
    <div
      class="text-3xl font-bold text-slate-900 font-outfit tracking-tight transition-all duration-300"
      class:opacity-0={!isVisible}
      class:translate-y-2={!isVisible}
    >
      {#if finalNumber > 0}
        {formatNumber(animatedNumber)}{number.replace(/[\d.]+/, "")}
      {:else}
        {number}
      {/if}
    </div>

    <div
      class="text-xs font-bold text-slate-400 uppercase tracking-widest font-inter transition-all duration-500 delay-100"
      class:opacity-0={!isVisible}
      class:translate-y-2={!isVisible}
    >
      {label}
    </div>
  </div>
  
  <!-- Decorative background element -->
  <div class="absolute -right-2 -bottom-2 w-16 h-16 bg-slate-50 rounded-full blur-2xl group-hover:bg-slate-100/50 transition-colors"></div>
</div>
 