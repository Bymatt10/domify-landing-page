<script lang="ts">
	import { onMount } from 'svelte';
	import { 
		Users, ShieldCheck, Sparkles, Zap, Search, 
		CalendarCheck, CheckCircle2, ArrowRight, 
		Target, Lightbulb, Heart, Award
	} from 'lucide-svelte';
	
	// Animaciones de contador
	let statsVisible = false;
	let stats = [
		{ number: 0, target: 500, label: 'Proveedores Verificados', suffix: '+', icon: Award },
		{ number: 0, target: 1200, label: 'Servicios Completados', suffix: '+', icon: CheckCircle2 },
		{ number: 0, target: 98, label: 'Satisfacción del Cliente', suffix: '%', icon: Heart },
		{ number: 0, target: 15, label: 'Categorías de Servicios', suffix: '+', icon: Target }
	];

	onMount(() => {
		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting && !statsVisible) {
					statsVisible = true;
					animateStats();
				}
			});
		}, { threshold: 0.1 });

		const statsSection = document.getElementById('stats-section');
		if (statsSection) {
			observer.observe(statsSection);
		}

		return () => observer.disconnect();
	});

	function animateStats() {
		stats.forEach((stat, index) => {
			const duration = 2000;
			const steps = 60;
			const increment = stat.target / steps;
			let current = 0;
			let step = 0;

			const timer = setInterval(() => {
				step++;
				current += increment;
				if (step >= steps) {
					current = stat.target;
					clearInterval(timer);
				}
				stats[index].number = Math.floor(current);
			}, duration / steps);
		});
	}
</script>

<svelte:head>
	<title>Acerca de Domify - Conectamos personas con los mejores proveedores</title>
	<meta name="description" content="Conoce más sobre Domify, la plataforma que conecta personas con los mejores proveedores de servicios locales de forma fácil, segura y confiable." />
</svelte:head>

<!-- Hero Section -->
<section class="relative bg-white pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden font-inter">
	<!-- Background Elements -->
	<div class="absolute inset-0 z-0">
		<div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGg0MHY0MEgwVjB6bTIwIDIwYzAgMTEuMDQ2LTguOTU0IDIwLTIwIDIwdjFDMTEuNTk4IDQxIDIxIDMxLjU5OCAyMSAyMFYwaC0xdjIweiIgZmlsbD0icmdiYSgwLCAwLCAwLCAwLjAzKSIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+')] opacity-60"></div>
		<div class="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2"></div>
		<div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-[120px] -z-10 -translate-x-1/2 translate-y-1/2"></div>
	</div>
	
	<div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 text-center">
		<div class="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full mb-8 animate-fade-in">
			<Sparkles size={16} class="text-blue-600" />
			<span class="text-sm font-bold text-blue-700 font-outfit uppercase tracking-wider">Conoce nuestra historia</span>
		</div>
		
		<h1 class="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-8 font-outfit tracking-tight leading-[1.1]">
			Redefiniendo la forma de <br />
			<span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
				conectar servicios
			</span>
		</h1>
		
		<p class="text-xl text-slate-500 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
			En Domify, estamos construyendo el puente más confiable entre las necesidades de tu hogar y los mejores profesionales expertos de Nicaragua.
		</p>
		
		<div class="flex flex-col sm:flex-row gap-5 justify-center">
			<a href="/services" class="group bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold font-outfit shadow-xl hover:shadow-slate-900/20 hover:scale-105 transition-all flex items-center justify-center gap-2">
				Explorar Servicios
				<ArrowRight size={18} class="group-hover:translate-x-1 transition-transform" />
			</a>
			<a href="/become-provider" class="bg-white text-slate-900 px-10 py-5 rounded-2xl font-bold font-outfit border border-slate-200 hover:bg-slate-50 hover:scale-105 transition-all shadow-sm">
				Ser Proveedor Expertos
			</a>
		</div>
	</div>
</section>

<!-- Stats Section -->
<section id="stats-section" class="py-12 bg-slate-50 font-inter">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="grid grid-cols-2 lg:grid-cols-4 gap-8">
			{#each stats as stat}
				<div class="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
					<div class="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-150 transition-transform duration-700">
						<svelte:component this={stat.icon} size={120} />
					</div>
					<div class="relative z-10">
						<div class="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
							<svelte:component this={stat.icon} size={24} />
						</div>
						<div class="text-4xl lg:text-5xl font-bold text-slate-900 mb-2 font-outfit">
							{stat.number}{stat.suffix}
						</div>
						<div class="text-slate-500 font-medium text-sm border-t border-slate-50 pt-4 mt-2">
							{stat.label}
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Misión & Visión -->
<section class="py-24 bg-white font-inter">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="grid lg:grid-cols-2 gap-12 items-center">
			<div class="relative">
				<div class="relative z-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-10 lg:p-16 text-white shadow-2xl overflow-hidden group">
					<div class="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 opacity-10 group-hover:scale-110 transition-transform duration-700">
						<Target size={300} />
					</div>
					<h2 class="text-4xl font-bold mb-8 font-outfit tracking-tight">Nuestra Misión</h2>
					<p class="text-xl text-blue-50 leading-relaxed font-light mb-8">
						Empoderar a comunidades locales a través de una plataforma digital justa, segura y eficiente que dignifique el trabajo de los profesionales y simplifique la vida de las personas.
					</p>
					<div class="flex items-center gap-4 text-blue-200">
						<div class="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md">
							<ShieldCheck size={20} />
						</div>
						<span class="text-sm font-semibold uppercase tracking-widest font-outfit">Compromiso Real</span>
					</div>
				</div>
			</div>
			
			<div class="space-y-8 lg:pl-12">
				<div class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full">
					<Lightbulb size={16} class="text-indigo-600" />
					<span class="text-xs font-bold text-indigo-700 font-outfit uppercase tracking-wider">Nuestra Visión</span>
				</div>
				<h3 class="text-4xl font-bold text-slate-900 font-outfit tracking-tight">
					Ser el estándar de excelencia <br />
					<span class="text-blue-600">en servicios del hogar</span>
				</h3>
				<p class="text-lg text-slate-500 leading-relaxed font-light">
					Aspiramos a ser el ecosistema #1 en Centroamérica donde cualquier necesidad doméstica se resuelva con un par de clics, garantizando siempre la mayor calidad y seguridad.
				</p>
				
				<div class="grid sm:grid-cols-2 gap-6 pt-4">
					<div class="flex items-start gap-4">
						<div class="bg-blue-50 p-2 rounded-xl text-blue-600">
							<CheckCircle2 size={18} />
						</div>
						<div>
							<h4 class="font-bold text-slate-900 font-outfit">Liderazgo Local</h4>
							<p class="text-xs text-slate-500 mt-1">Nacidos en Nicaragua para servir con identidad.</p>
						</div>
					</div>
					<div class="flex items-start gap-4">
						<div class="bg-blue-50 p-2 rounded-xl text-blue-600">
							<Zap size={18} />
						</div>
						<div>
							<h4 class="font-bold text-slate-900 font-outfit">Innovación Constante</h4>
							<p class="text-xs text-slate-500 mt-1">Usamos tecnología para mejorar cada día.</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Valores -->
<section class="py-24 bg-slate-50 font-inter border-y border-slate-100">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center mb-20">
			<h2 class="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 font-outfit tracking-tight">
				Valores que impulsan <br /> cada <span class="text-blue-600">conexión</span>
			</h2>
			<div class="w-24 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
		</div>
		
		<div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
			{#each [
				{ icon: ShieldCheck, title: 'Confianza', desc: 'Verificamos a cada experto para que tu tranquilidad sea la prioridad #1.', color: 'blue' },
				{ icon: Award, title: 'Excelencia', desc: 'No nos conformamos con menos que resultados impecables en cada servicio.', color: 'indigo' },
				{ icon: Lightbulb, title: 'Simplicidad', desc: 'Hacemos que lo complejo se sienta fácil, intuitivo y rápido.', color: 'purple' },
				{ icon: Users, title: 'Comunidad', desc: 'Crecemos juntos, apoyando la economía local y el talento nacional.', color: 'emerald' }
			] as value}
				<div class="bg-white p-10 rounded-[2.5rem] border border-slate-200/50 shadow-sm hover:translate-y-[-8px] hover:shadow-xl transition-all duration-500 group">
					<div class="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 bg-{value.color}-50 text-{value.color}-600 group-hover:scale-110 transition-transform">
						<svelte:component this={value.icon} size={32} />
					</div>
					<h3 class="text-2xl font-bold text-slate-900 mb-4 font-outfit">{value.title}</h3>
					<p class="text-slate-500 leading-relaxed font-light">
						{value.desc}
					</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Cómo funciona -->
<section class="py-24 bg-white font-inter">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center mb-20">
			<h2 class="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 font-outfit tracking-tight">
				¿Cómo funciona <span class="text-blue-600">Domify</span>?
			</h2>
			<div class="w-24 h-1.5 bg-blue-600 mx-auto rounded-full mb-8"></div>
			<p class="text-xl text-slate-500 max-w-2xl mx-auto font-light leading-relaxed">
				Conectamos tus necesidades con soluciones reales en tres pasos diseñados para tu comodidad.
			</p>
		</div>
		
		<div class="grid md:grid-cols-3 gap-12 relative">
			<!-- Connector Lines (Desktop) -->
			<div class="hidden md:block absolute top-[25%] left-[20%] right-[20%] h-[2px] bg-slate-100 -z-0"></div>
			
			{#each [
				{ icon: Search, title: 'Busca y compara', desc: 'Explora perfiles reales, lee reseñas verificadas y elige al profesional que mejor se adapte a ti.', color: 'blue' },
				{ icon: CalendarCheck, title: 'Contacta y agenda', desc: 'Coordina detalles directamente por el chat integrado y programa la visita en segundos.', color: 'indigo' },
				{ icon: CheckCircle2, title: 'Disfruta y califica', desc: 'Recibe un servicio de alta calidad, paga de forma segura y comparte tu experiencia.', color: 'orange' }
			] as step, i}
				<div class="relative z-10 text-center group">
					<div class="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl transition-all duration-500 border border-slate-50 mb-8 relative overflow-hidden">
						<div class="absolute inset-0 bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
						<svelte:component this={step.icon} size={40} class="text-slate-900 scale-100 group-hover:scale-110 transition-transform duration-500 relative z-10" />
						<div class="absolute -top-1 -right-1 w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold font-outfit text-lg border-4 border-white">
							{i + 1}
						</div>
					</div>
					<h3 class="text-2xl font-bold text-slate-900 mb-4 font-outfit">{step.title}</h3>
					<p class="text-slate-500 leading-relaxed font-light">
						{step.desc}
					</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- CTA Final -->
<section class="py-24 bg-slate-900 relative overflow-hidden font-inter">
	<!-- Background Elements -->
	<div class="absolute inset-0 z-0">
		<div class="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[150px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
		<div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600 rounded-full blur-[150px] opacity-20 translate-y-1/2 -translate-x-1/2"></div>
	</div>
	
	<div class="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
		<h2 class="text-4xl lg:text-5xl font-bold text-white mb-8 font-outfit tracking-tight">
			Sé parte de la revolución <br /> <span class="text-blue-400">de servicios local</span>
		</h2>
		<p class="text-xl text-slate-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
			Únete a los miles de nicaragüenses que ya están usando Domify para mejorar su calidad de vida y hacer crecer su negocio.
		</p>
		
		<div class="flex flex-col sm:flex-row gap-5 justify-center">
			<a href="/services" class="group bg-blue-600 text-white px-10 py-5 rounded-2xl font-bold font-outfit shadow-xl hover:shadow-blue-600/20 hover:scale-105 transition-all flex items-center justify-center gap-2">
				Explorar Servicios
				<ArrowRight size={18} class="group-hover:translate-x-1 transition-transform" />
			</a>
			<a href="/become-provider" class="bg-white/10 backdrop-blur-md text-white px-10 py-5 rounded-2xl font-bold font-outfit border border-white/20 hover:bg-white/20 hover:scale-105 transition-all shadow-sm">
				Quiero ser Proveedor
			</a>
		</div>
	</div>
</section>

<style>
	@keyframes fade-in {
		from { opacity: 0; transform: translateY(10px); }
		to { opacity: 1; transform: translateY(0); }
	}
	.animate-fade-in {
		animation: fade-in 0.6s ease-out forwards;
	}
</style> 