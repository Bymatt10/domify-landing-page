<script lang="ts">
	import { onMount } from 'svelte';
	
	// Animaciones de contador
	let statsVisible = false;
	let stats = [
		{ number: 0, target: 500, label: 'Proveedores Verificados', suffix: '+' },
		{ number: 0, target: 1200, label: 'Servicios Completados', suffix: '+' },
		{ number: 0, target: 98, label: 'Satisfacción del Cliente', suffix: '%' },
		{ number: 0, target: 15, label: 'Categorías de Servicios', suffix: '+' }
	];

	onMount(() => {
		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting && !statsVisible) {
					statsVisible = true;
					animateStats();
				}
			});
		});

		const statsSection = document.getElementById('stats-section');
		if (statsSection) {
			observer.observe(statsSection);
		}

		return () => observer.disconnect();
	});

	function animateStats() {
		stats.forEach((stat, index) => {
			const duration = 2000;
			const increment = stat.target / (duration / 16);
			let current = 0;

			const timer = setInterval(() => {
				current += increment;
				if (current >= stat.target) {
					current = stat.target;
					clearInterval(timer);
				}
				stats[index].number = Math.floor(current);
			}, 16);
		});
	}
</script>

<svelte:head>
	<title>Acerca de Domify - Conectamos personas con los mejores proveedores</title>
	<meta name="description" content="Conoce más sobre Domify, la plataforma que conecta personas con los mejores proveedores de servicios locales de forma fácil, segura y confiable." />
</svelte:head>

<!-- Hero Section -->
<section class="relative bg-gradient-to-br from-primary-50 via-white to-primary-100 overflow-hidden">
	<!-- Background Pattern -->
	<div class="absolute inset-0 opacity-5">
		<div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgb(59 130 246) 1px, transparent 0); background-size: 20px 20px;"></div>
	</div>
	
	<div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
		<div class="text-center">
			<h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-secondary-900 mb-6">
				Acerca de 
				<span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800">
					Domify
				</span>
			</h1>
			<p class="text-xl sm:text-2xl text-secondary-600 max-w-4xl mx-auto mb-8 leading-relaxed">
				Conectamos personas con los mejores proveedores de servicios locales, 
				de forma <span class="font-semibold text-primary-600">fácil, segura y confiable</span>.
			</p>
			<div class="flex flex-col sm:flex-row gap-4 justify-center">
				<a href="/services" class="bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary-700 transition-colors duration-200 shadow-lg hover:shadow-xl">
					Explorar Servicios
				</a>
				<a href="/become-provider" class="border-2 border-primary-600 text-primary-600 px-8 py-4 rounded-xl font-semibold hover:bg-primary-50 transition-colors duration-200">
					Ser Proveedor
				</a>
			</div>
		</div>
	</div>
</section>

<!-- Estadísticas -->
<section id="stats-section" class="py-16 bg-gradient-to-br from-primary-600 to-primary-800 relative overflow-hidden">
	<!-- Background Pattern -->
	<div class="absolute inset-0 opacity-10">
		<div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, white 1px, transparent 0); background-size: 30px 30px;"></div>
	</div>
	
	<div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="grid grid-cols-2 lg:grid-cols-4 gap-8">
			{#each stats as stat}
				<div class="text-center">
					<div class="text-3xl lg:text-4xl font-bold text-white mb-2">
						{stat.number}{stat.suffix}
					</div>
					<div class="text-primary-100 font-medium">
						{stat.label}
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Misión -->
<section class="py-20 bg-white">
	<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center mb-12">
			<h2 class="text-3xl lg:text-4xl font-bold text-secondary-900 mb-6">
				Nuestra Misión
			</h2>
			<div class="w-24 h-1 bg-gradient-to-r from-primary-600 to-primary-800 mx-auto mb-8"></div>
		</div>
		
		<div class="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8 lg:p-12">
			<p class="text-lg lg:text-xl text-secondary-700 leading-relaxed text-center">
				En <span class="font-bold text-primary-600">Domify</span> creemos que encontrar ayuda para tu hogar o negocio debe ser sencillo y seguro. 
				Nuestra misión es empoderar a clientes y proveedores, creando una comunidad donde la 
				<span class="font-semibold text-primary-700">confianza, la calidad y la cercanía</span> son lo más importante.
			</p>
		</div>
	</div>
</section>

<!-- Valores -->
<section class="py-20 bg-secondary-50">
	<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center mb-16">
			<h2 class="text-3xl lg:text-4xl font-bold text-secondary-900 mb-6">
				Valores que nos guían
			</h2>
			<div class="w-24 h-1 bg-gradient-to-r from-primary-600 to-primary-800 mx-auto"></div>
		</div>
		
		<div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
			<!-- Confianza -->
			<div class="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
				<div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 mx-auto">
					<svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
					</svg>
				</div>
				<h3 class="text-xl font-bold text-secondary-900 mb-4 text-center">Confianza</h3>
				<p class="text-secondary-600 text-center leading-relaxed">
					Verificamos a cada proveedor y protegemos tus datos con los más altos estándares de seguridad.
				</p>
			</div>
			
			<!-- Calidad -->
			<div class="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
				<div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
					<svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
					</svg>
				</div>
				<h3 class="text-xl font-bold text-secondary-900 mb-4 text-center">Calidad</h3>
				<p class="text-secondary-600 text-center leading-relaxed">
					Solo los mejores servicios y atención personalizada para garantizar tu satisfacción.
				</p>
			</div>
			
			<!-- Innovación -->
			<div class="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
				<div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6 mx-auto">
					<svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
					</svg>
				</div>
				<h3 class="text-xl font-bold text-secondary-900 mb-4 text-center">Innovación</h3>
				<p class="text-secondary-600 text-center leading-relaxed">
					Tecnología de vanguardia para hacer tu vida más fácil y conectarte mejor.
				</p>
			</div>
			
			<!-- Comunidad -->
			<div class="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
				<div class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6 mx-auto">
					<svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
					</svg>
				</div>
				<h3 class="text-xl font-bold text-secondary-900 mb-4 text-center">Comunidad</h3>
				<p class="text-secondary-600 text-center leading-relaxed">
					Apoyamos el crecimiento local y fomentamos la colaboración entre vecinos.
				</p>
			</div>
		</div>
	</div>
</section>

<!-- Cómo funciona -->
<section class="py-20 bg-white">
	<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center mb-16">
			<h2 class="text-3xl lg:text-4xl font-bold text-secondary-900 mb-6">
				¿Cómo funciona Domify?
			</h2>
			<div class="w-24 h-1 bg-gradient-to-r from-primary-600 to-primary-800 mx-auto mb-8"></div>
			<p class="text-xl text-secondary-600 max-w-3xl mx-auto">
				Tres simples pasos para obtener el servicio que necesitas
			</p>
		</div>
		
		<div class="grid md:grid-cols-3 gap-8 lg:gap-12">
			<!-- Paso 1 -->
			<div class="text-center group">
				<div class="relative mb-8">
					<div class="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-shadow duration-300">
						<svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
						</svg>
					</div>
					<div class="absolute -top-2 -right-2 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-lg">
						1
					</div>
				</div>
				<h3 class="text-2xl font-bold text-secondary-900 mb-4">Busca y compara</h3>
				<p class="text-secondary-600 leading-relaxed">
					Explora servicios, lee reseñas auténticas y elige el proveedor ideal que se adapte a tus necesidades y presupuesto.
				</p>
			</div>
			
			<!-- Paso 2 -->
			<div class="text-center group">
				<div class="relative mb-8">
					<div class="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-shadow duration-300">
						<svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-2.248-.307l-3.5 2.151.643-2.818A8.003 8.003 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"></path>
						</svg>
					</div>
					<div class="absolute -top-2 -right-2 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-lg">
						2
					</div>
				</div>
				<h3 class="text-2xl font-bold text-secondary-900 mb-4">Contacta y agenda</h3>
				<p class="text-secondary-600 leading-relaxed">
					Habla directamente con proveedores verificados y agenda el servicio en minutos de forma segura y conveniente.
				</p>
			</div>
			
			<!-- Paso 3 -->
			<div class="text-center group">
				<div class="relative mb-8">
					<div class="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-shadow duration-300">
						<svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
						</svg>
					</div>
					<div class="absolute -top-2 -right-2 w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-lg">
						3
					</div>
				</div>
				<h3 class="text-2xl font-bold text-secondary-900 mb-4">Disfruta y califica</h3>
				<p class="text-secondary-600 leading-relaxed">
					Recibe el servicio de calidad, paga de forma segura y deja tu opinión para ayudar a otros usuarios de la comunidad.
				</p>
			</div>
		</div>
	</div>
</section>

<!-- CTA Final -->
<section class="py-20 bg-gradient-to-br from-primary-600 to-primary-800 relative overflow-hidden">
	<!-- Background Pattern -->
	<div class="absolute inset-0 opacity-10">
		<div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, white 1px, transparent 0); background-size: 30px 30px;"></div>
	</div>
	
	<div class="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
		<h2 class="text-3xl lg:text-4xl font-bold text-white mb-6">
			¿Listo para ser parte de Domify?
		</h2>
		<p class="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
			Únete a nuestra comunidad y descubre una nueva forma de conectar con servicios de calidad
		</p>
		
		<div class="flex flex-col sm:flex-row gap-4 justify-center">
			<a href="/services" class="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold hover:bg-primary-50 transition-colors duration-200 shadow-lg hover:shadow-xl">
				Explorar Servicios
			</a>
			<a href="/become-provider" class="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-primary-600 transition-colors duration-200">
				Quiero ser Proveedor
			</a>
		</div>
	</div>
</section> 