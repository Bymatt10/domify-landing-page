<script lang="ts">
	import { onMount } from 'svelte';
	import { 
		Banknote, Smartphone, ShieldCheck, 
		Laptop, Star, Headset, CheckCircle2 
	} from 'lucide-svelte';
	let formData = {
		firstName: '',
		lastName: '',
		email: '',
		phone: '',
		businessName: '',
		serviceCategory: '',
		experience: '',
		description: '',
		location: '',
		availability: '',
		hourlyRate: '',
		portfolio: '',
		references: '',
		agreement: false
	};
	
	let loading = false;
	let success = false;
	let error = '';
	
	// Categorías de servicios
	const serviceCategories = [
		{ value: 'limpieza', label: 'Limpieza de Casas' },
		{ value: 'jardineria', label: 'Jardinería' },
		{ value: 'ensamblaje', label: 'Ensamblaje de Muebles' },
		{ value: 'electricistas', label: 'Electricistas' },
		{ value: 'fontaneros', label: 'Fontaneros / Plomeros' },
		{ value: 'construccion', label: 'Construcción' },
		{ value: 'pintura', label: 'Pintura' },
		{ value: 'mudanzas', label: 'Mudanzas' },
		{ value: 'carpinteria', label: 'Carpintería' },
		{ value: 'tecnologia', label: 'Tecnología' },
		{ value: 'seguridad', label: 'Seguridad' },
		{ value: 'albañileria', label: 'Albañilería' },
		{ value: 'other', label: 'Otro' }
	];
	
	// Beneficios de ser proveedor
	const benefits = [
		{
			icon: Banknote,
			title: 'Ganancias Atractivas',
			description: 'Gana hasta 40% más que trabajando por cuenta propia. Sin comisiones ocultas.'
		},
		{
			icon: Smartphone,
			title: 'Clientes Garantizados',
			description: 'Recibe solicitudes de clientes verificados sin necesidad de buscar trabajo.'
		},
		{
			icon: ShieldCheck,
			title: 'Protección y Seguros',
			description: 'Cobertura de seguro para protegerte a ti y a tus clientes durante el trabajo.'
		},
		{
			icon: Laptop,
			title: 'Herramientas Digitales',
			description: 'Acceso a nuestra plataforma para gestionar citas, pagos y comunicación.'
		},
		{
			icon: Star,
			title: 'Sistema de Reseñas',
			description: 'Construye tu reputación con reseñas auténticas de clientes satisfechos.'
		},
		{
			icon: Headset,
			title: 'Soporte 24/7',
			description: 'Equipo de soporte disponible para ayudarte con cualquier consulta o problema.'
		}
	];
	
	// Requisitos
	const requirements = [
		'Ser mayor de 18 años',
		'Tener experiencia comprobable en el servicio que ofreces',
		'Contar con documentos de identidad válidos',
		'Disponibilidad para trabajar en horarios flexibles',
		'Compromiso con la calidad y puntualidad',
		'Disponer de herramientas básicas para tu oficio',
		'Aceptar nuestros términos y condiciones'
	];
	
	// Proceso de aplicación
	const applicationSteps = [
		{
			step: '1',
			title: 'Completa el Formulario',
			description: 'Llena la solicitud con tus datos personales y profesionales.'
		},
		{
			step: '2',
			title: 'Revisión de Documentos',
			description: 'Nuestro equipo revisará tu información en 24-48 horas.'
		},
		{
			step: '3',
			title: 'Entrevista',
			description: 'Programaremos una breve entrevista para conocerte mejor.'
		},
		{
			step: '4',
			title: 'Capacitación',
			description: 'Recibirás capacitación sobre el uso de nuestra plataforma.'
		},
		{
			step: '5',
			title: '¡Comienza a Trabajar!',
			description: 'Una vez aprobado, podrás recibir clientes inmediatamente.'
		}
	];
	
	async function handleSubmit() {
		loading = true;
		error = '';
		
		try {
			const catMap: Record<string, number> = {
				'fontaneros': 1, 'jardineria': 2, 'electricistas': 3, 'cerrajeros': 4,
				'carpinteria': 5, 'mudanzas': 6, 'limpieza': 7, 'ensamblaje': 8,
				'construccion': 9, 'pintura': 10, 'tecnologia': 11, 'seguridad': 12,
				'albañileria': 13
			};
			const categoryId = catMap[formData.serviceCategory] || 1;

			const response = await fetch('/api/provider-applications', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					headline: formData.businessName || `${formData.firstName} ${formData.lastName}`,
					bio: formData.description,
					hourly_rate: parseFloat(formData.hourlyRate),
					location: formData.location,
					phone: formData.phone,
					email: formData.email,
					experience_years: formData.experience,
					categories: [categoryId]
				})
			});

			if (!response.ok) {
				const result = await response.json();
				throw new Error(result.error?.message || 'Error al enviar la solicitud');
			}
			
			success = true;
			formData = {
				firstName: '',
				lastName: '',
				email: '',
				phone: '',
				businessName: '',
				serviceCategory: '',
				experience: '',
				description: '',
				location: '',
				availability: '',
				hourlyRate: '',
				portfolio: '',
				references: '',
				agreement: false
			};
		} catch (err) {
			error = err instanceof Error ? err.message : 'Error al enviar la solicitud. Por favor, intenta de nuevo.';
		} finally {
			loading = false;
		}
	}
	
	function resetForm() {
		success = false;
		error = '';
	}
</script>

<svelte:head>
	<title>Ser Proveedor - Domify - Únete a nuestro equipo de profesionales</title>
	<meta name="description" content="Únete a Domify como proveedor de servicios. Gana más dinero, recibe clientes garantizados y disfruta de beneficios exclusivos. Aplica ahora." />
	<style>
		@keyframes shimmer {
			100% {
				transform: translateX(100%);
			}
		}
		@keyframes fade-in-up {
			0% {
				opacity: 0;
				transform: translateY(20px);
			}
			100% {
				opacity: 1;
				transform: translateY(0);
			}
		}
		.animate-fade-in-up {
			animation: fade-in-up 0.6s ease-out forwards;
		}
		.is-active::after {
			content: '';
			position: absolute;
		}
		/* Styling timeline dots on small screens */
		@media (max-width: 768px) {
			.is-active {
				padding-left: 2rem;
			}
			.is-active::before {
				left: 0 !important;
				margin-left: 0 !important;
			}
			.is-active .flex.w-12 {
				position: absolute;
				left: -1.5rem;
				top: 0.5rem;
				width: 2.5rem;
				height: 2.5rem;
				font-size: 1rem;
			}
		}
	</style>
</svelte:head>

<div class="min-h-screen bg-slate-50 text-slate-800 font-inter overflow-hidden selection:bg-blue-500/30">
	<!-- Hero Section -->
	<section class="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
		<!-- Dynamic Background -->
		<div class="absolute inset-0 z-0">
			<!-- Grid pattern -->
			<div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGg0MHY0MEgwVjB6bTIwIDIwYzAgMTEuMDQ2LTguOTU0IDIwLTIwIDIwdjFDMTEuNTk4IDQxIDIxIDMxLjU5OCAyMSAyMFYwaC0xdjIweiIgZmlsbD0icmdiYSgwLCAwLCAwLCAwLjAzKSIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+')] opacity-60"></div>
			<!-- Glow effects -->
			<div class="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none"></div>
			<div class="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-indigo-400/20 rounded-full blur-[150px] pointer-events-none"></div>
			<!-- Gradient overlay -->
			<div class="absolute inset-0 bg-gradient-to-b from-white/40 via-white/80 to-slate-50"></div>
		</div>
		
		<div class="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
			<div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-slate-200/60 backdrop-blur-md mb-8 animate-fade-in-up shadow-sm">
				<span class="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
				<span class="text-sm font-medium text-slate-700 font-outfit">Únete a la nueva era de servicios</span>
			</div>
			
			<h1 class="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 tracking-tight font-outfit">
				Eleva tu negocio al <br class="hidden sm:block"/>
				<span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
					siguiente nivel
				</span>
			</h1>
			
			<p class="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
				Únete a la plataforma premium de servicios. Multiplica tus ingresos, gestiona tus clientes con tecnología de punta y construye una reputación extraordinaria.
			</p>
			
			<div class="flex flex-col sm:flex-row gap-5 justify-center mt-8">
				<a 
					href="#application-form"
					class="group relative inline-flex items-center justify-center px-8 py-4 font-semibold text-white transition-all duration-300 bg-blue-600 rounded-2xl hover:bg-blue-700 hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.6)] overflow-hidden"
				>
					<span class="relative z-10 font-outfit text-lg">Aplicar Ahora</span>
					<div class="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
				</a>
				<a 
					href="#benefits"
					class="inline-flex items-center justify-center px-8 py-4 font-semibold text-slate-700 transition-all duration-300 bg-white border border-slate-200 shadow-sm rounded-2xl hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 backdrop-blur-sm"
				>
					<span class="font-outfit text-lg">Explorar Beneficios</span>
				</a>
			</div>
		</div>
	</section>

	<!-- Benefits Section -->
	<section id="benefits" class="relative py-24 z-10">
		<div class="container mx-auto px-4 sm:px-6 lg:px-8">
			<div class="text-center mb-16 lg:mb-24">
				<h2 class="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 font-outfit">
					Ventajas <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Exclusivas</span>
				</h2>
				<p class="text-slate-600 text-lg max-w-2xl mx-auto">
					Diseñamos herramientas pensando en tu crecimiento. Descubre por qué los mejores profesionales eligen Domify.
				</p>
			</div>
			
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
				{#each benefits as benefit, i}
					<div class="group relative bg-white backdrop-blur-xl border border-slate-200 rounded-3xl p-8 hover:bg-slate-50/80 transition-container duration-500 shadow-sm hover:shadow-xl hover:-translate-y-1">
						<!-- Hover glow -->
						<div class="absolute -inset-px bg-gradient-to-b from-blue-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md -z-10"></div>
						
						<div class="relative z-10">
							<div class="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 border border-blue-100 group-hover:scale-110 transition-transform duration-500 shadow-sm">
								<svelte:component this={benefit.icon} size={28} />
							</div>
							<h3 class="text-xl font-bold text-slate-900 mb-3 font-outfit group-hover:text-blue-600 transition-colors">{benefit.title}</h3>
							<p class="text-slate-600 leading-relaxed font-light">{benefit.description}</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Combined Process & Requirements Sectio -->
	<section class="py-24 relative z-10 bg-white border-y border-slate-200">
		<div class="container mx-auto px-4 sm:px-6 lg:px-8">
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
				
				<!-- Process -->
				<div>
					<h2 class="text-3xl lg:text-4xl font-bold text-slate-900 mb-10 font-outfit tracking-tight">
						Tu camino al <span class="text-blue-600">éxito</span>
					</h2>
					<div class="space-y-8 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:via-indigo-500 before:to-transparent before:opacity-30">
						{#each applicationSteps as step, index}
							<div class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
								<!-- Setup right align for odd/even -->
								<div class="flex items-center justify-center w-12 h-12 rounded-full border border-blue-200 bg-white shadow-[0_0_15px_rgba(59,130,246,0.1)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 text-blue-600 font-bold z-10 transition-transform group-hover:scale-110">
									{step.step}
								</div>
								
								<div class="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-colors shadow-sm">
									<h3 class="font-bold text-slate-900 text-lg mb-1 font-outfit">{step.title}</h3>
									<p class="text-slate-600 text-sm">{step.description}</p>
								</div>
							</div>
						{/each}
					</div>
				</div>

				<!-- Requirements -->
				<div>
					<div class="sticky top-32 bg-slate-50 border border-slate-200 rounded-3xl p-8 lg:p-10 shadow-lg">
						<h2 class="text-3xl font-bold text-slate-900 mb-2 font-outfit">Requisitos mínimos</h2>
						<p class="text-slate-600 mb-8">Buscamos excelencia. Asegúrate de cumplir con estos puntos antes de aplicar.</p>
						
						<ul class="space-y-5">
							{#each requirements as requirement}
								<li class="flex items-start gap-4">
									<div class="w-6 h-6 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0 mt-0.5">
										<CheckCircle2 size={16} class="text-blue-600" />
									</div>
									<span class="text-slate-700 leading-relaxed font-light">{requirement}</span>
								</li>
							{/each}
						</ul>
						
						<div class="mt-10 p-5 rounded-2xl bg-blue-50 border border-blue-100">
							<div class="flex items-center gap-3">
								<span class="text-2xl">🛡️</span>
								<p class="text-sm text-blue-800">Tu información será tratada con los más altos estándares de seguridad y privacidad.</p>
							</div>
						</div>
					</div>
				</div>
				
			</div>
		</div>
	</section>

	<!-- Application Form Section -->
	<section id="application-form" class="relative py-24 z-10 bg-slate-50">
		<!-- BG element -->
		<div class="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-100 rounded-full blur-[150px] pointer-events-none -z-10"></div>
		
		<div class="container mx-auto px-4 sm:px-6 lg:px-8">
			<div class="max-w-4xl mx-auto">
				<div class="text-center mb-12">
					<h2 class="text-4xl lg:text-5xl font-bold text-slate-900 mb-4 font-outfit">
						Inicia tu proceso
					</h2>
					<p class="text-lg text-slate-600 max-w-2xl mx-auto">
						Completa el formulario y daremos el primer paso juntos. Toma solo 2 minutos.
					</p>
				</div>
				
				{#if success}
					<div class="relative overflow-hidden bg-white border border-emerald-200 rounded-3xl p-10 text-center shadow-lg animate-fade-in-up">
						<div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
						<div class="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
							<svg class="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
						</div>
						<h3 class="text-3xl font-bold text-slate-900 mb-4 font-outfit">¡Solicitud recibida con éxito!</h3>
						<p class="text-slate-600 mb-8 max-w-lg mx-auto text-lg">Hemos recibido tu información correctamente. Nuestro equipo de onboarding la revisará y te contactará en las próximas 24 a 48 horas.</p>
						<button 
							on:click={resetForm}
							class="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-8 py-3 rounded-xl font-medium transition-colors shadow-sm"
						>
							Enviar otra solicitud
						</button>
					</div>
				{:else}
					<form on:submit|preventDefault={handleSubmit} class="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl">
						{#if error}
							<div class="bg-red-50 border border-red-200 rounded-xl p-5 mb-8 flex items-start gap-3">
								<svg class="w-6 h-6 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
								<p class="text-red-600">{error}</p>
							</div>
						{/if}
						
						<!-- Section 1 -->
						<div class="mb-10">
							<div class="flex items-center gap-3 mb-6">
								<span class="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-100 font-bold font-outfit">1</span>
								<h3 class="text-xl font-bold text-slate-900 font-outfit">Información Personal</h3>
							</div>
							
							<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div class="space-y-2">
									<label for="firstName" class="block text-sm font-medium text-slate-700 ml-1">Nombre <span class="text-blue-600">*</span></label>
									<input
										type="text" id="firstName" bind:value={formData.firstName} required
										class="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-400"
										placeholder="Juan"
									/>
								</div>
								<div class="space-y-2">
									<label for="lastName" class="block text-sm font-medium text-slate-700 ml-1">Apellido <span class="text-blue-600">*</span></label>
									<input
										type="text" id="lastName" bind:value={formData.lastName} required
										class="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-400"
										placeholder="Pérez"
									/>
								</div>
								<div class="space-y-2">
									<label for="email" class="block text-sm font-medium text-slate-700 ml-1">Correo Electrónico <span class="text-blue-600">*</span></label>
									<input
										type="email" id="email" bind:value={formData.email} required
										class="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-400"
										placeholder="juan@ejemplo.com"
									/>
								</div>
								<div class="space-y-2">
									<label for="phone" class="block text-sm font-medium text-slate-700 ml-1">Teléfono <span class="text-blue-600">*</span></label>
									<input
										type="tel" id="phone" bind:value={formData.phone} required
										class="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-400"
										placeholder="+505 8888 8888"
									/>
								</div>
							</div>
						</div>
						
						<div class="w-full h-px bg-slate-200 my-8"></div>
						
						<!-- Section 2 -->
						<div class="mb-10">
							<div class="flex items-center gap-3 mb-6">
								<span class="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-100 font-bold font-outfit">2</span>
								<h3 class="text-xl font-bold text-slate-900 font-outfit">Información Profesional</h3>
							</div>
							
							<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div class="space-y-2">
									<label for="businessName" class="block text-sm font-medium text-slate-700 ml-1">Nombre del Negocio <span class="text-slate-500 text-xs font-normal">(opcional)</span></label>
									<input
										type="text" id="businessName" bind:value={formData.businessName}
										class="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-400"
										placeholder="Ej: Multiserivicios VIP"
									/>
								</div>
								<div class="space-y-2">
									<label for="serviceCategory" class="block text-sm font-medium text-slate-700 ml-1">Especialidad Principal <span class="text-blue-600">*</span></label>
									<select
										id="serviceCategory" bind:value={formData.serviceCategory} required
										class="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all appearance-none"
										style="background-image: url('data:image/svg+xml;utf8,<svg fill=%22%2394a3b8%22 height=%2224%22 viewBox=%220 0 24 24%22 width=%2224%22 xmlns=%22http://www.w3.org/2000/svg%22><path d=%22M7 10l5 5 5-5z%22/></svg>'); background-repeat: no-repeat; background-position-x: 98%; background-position-y: center;"
									>
										<option value="" disabled selected class="text-slate-500">Selecciona tu especialidad</option>
										{#each serviceCategories as category}
											<option value={category.value}>{category.label}</option>
										{/each}
									</select>
								</div>
								<div class="space-y-2">
									<label for="experience" class="block text-sm font-medium text-slate-700 ml-1">Años de experiencia <span class="text-blue-600">*</span></label>
									<input
										type="text" id="experience" bind:value={formData.experience} required
										class="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-400"
										placeholder="Ej: 5 años"
									/>
								</div>
								<div class="space-y-2">
									<label for="hourlyRate" class="block text-sm font-medium text-slate-700 ml-1">Tarifa estimada por hora (NIO) <span class="text-blue-600">*</span></label>
									<div class="relative">
										<span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium font-outfit">C$</span>
										<input
											type="number" id="hourlyRate" bind:value={formData.hourlyRate} required min="0" step="0.01"
											class="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-400"
											placeholder="Ej: 300"
										/>
									</div>
								</div>
								<div class="md:col-span-2 space-y-2">
									<label for="description" class="block text-sm font-medium text-slate-700 ml-1">Cuéntanos sobre tus servicios <span class="text-blue-600">*</span></label>
									<textarea
										id="description" bind:value={formData.description} required rows="4"
										class="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-400 resize-none"
										placeholder="Describe tu experiencia, el equipo que utilizas y por qué los clientes deberían elegirte..."
									></textarea>
								</div>
							</div>
						</div>
						
						<div class="w-full h-px bg-slate-200 my-8"></div>
						
						<!-- Section 3 -->
						<div class="mb-10">
							<div class="flex items-center gap-3 mb-6">
								<span class="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-100 font-bold font-outfit">3</span>
								<h3 class="text-xl font-bold text-slate-900 font-outfit">Logística</h3>
							</div>
							
							<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div class="space-y-2">
									<label for="location" class="block text-sm font-medium text-slate-700 ml-1">Zona de cobertura principal <span class="text-blue-600">*</span></label>
									<input
										type="text" id="location" bind:value={formData.location} required
										class="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-400"
										placeholder="Ej: Managua, Masaya"
									/>
								</div>
								<div class="space-y-2">
									<label for="availability" class="block text-sm font-medium text-slate-700 ml-1">Días y horas disponibles <span class="text-blue-600">*</span></label>
									<input
										type="text" id="availability" bind:value={formData.availability} required
										class="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-400"
										placeholder="Ej: L-V mañanas, Sábados todo el día"
									/>
								</div>
								<div class="md:col-span-2 space-y-2">
									<label for="portfolio" class="block text-sm font-medium text-slate-700 ml-1">Portafolio / Web <span class="text-slate-500 text-xs font-normal">(opcional)</span></label>
									<input
										type="url" id="portfolio" bind:value={formData.portfolio}
										class="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-400"
										placeholder="https://instagram.com/tuPerfil"
									/>
								</div>
							</div>
						</div>
						
						<!-- Checkbox & Submit -->
						<div class="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8">
							<label class="flex items-start gap-4 cursor-pointer group">
								<div class="relative flex items-center justify-center shrink-0 mt-1">
									<input
										type="checkbox" id="agreement" bind:checked={formData.agreement} required
										class="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded bg-white checked:bg-blue-600 checked:border-blue-600 transition-colors"
									/>
									<svg class="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
								</div>
								<span class="text-sm text-slate-600 leading-relaxed max-w-2xl select-none group-hover:text-slate-900 transition-colors">
									Confirmo que toda la información brindada es verídica y acepto los <a href="/terms" class="text-blue-600 hover:text-blue-700 underline underline-offset-2">términos de servicio</a> y la <a href="/privacy" class="text-blue-600 hover:text-blue-700 underline underline-offset-2">política de privacidad</a> aplicables a los profesionales de Domify.
								</span>
							</label>
						</div>
						
						<div class="text-center sm:text-right">
							<button
								type="submit"
								disabled={loading}
								class="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
							>
								{#if loading}
									<svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
										<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									Procesando Solicitud...
								{:else}
									<span class="font-outfit text-lg">Enviar Solicitud</span>
									<svg class="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
								{/if}
							</button>
						</div>
					</form>
				{/if}
			</div>
		</div>
	</section>

</div> 