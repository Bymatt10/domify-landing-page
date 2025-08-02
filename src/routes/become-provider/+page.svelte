<script lang="ts">
	import { onMount } from 'svelte';
	
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
			icon: '💰',
			title: 'Ganancias Atractivas',
			description: 'Gana hasta 40% más que trabajando por cuenta propia. Sin comisiones ocultas.'
		},
		{
			icon: '📱',
			title: 'Clientes Garantizados',
			description: 'Recibe solicitudes de clientes verificados sin necesidad de buscar trabajo.'
		},
		{
			icon: '🛡️',
			title: 'Protección y Seguros',
			description: 'Cobertura de seguro para protegerte a ti y a tus clientes durante el trabajo.'
		},
		{
			icon: '📊',
			title: 'Herramientas Digitales',
			description: 'Acceso a nuestra plataforma para gestionar citas, pagos y comunicación.'
		},
		{
			icon: '⭐',
			title: 'Sistema de Reseñas',
			description: 'Construye tu reputación con reseñas auténticas de clientes satisfechos.'
		},
		{
			icon: '🎯',
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
			// Simular envío del formulario
			await new Promise(resolve => setTimeout(resolve, 2000));
			
			// Aquí iría la lógica real de envío
			// Solicitud de proveedor enviada
			
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
			error = 'Error al enviar la solicitud. Por favor, intenta de nuevo.';
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
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50">
	<!-- Hero Section -->
	<section class="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
		<div class="absolute inset-0 opacity-10">
			<div class="absolute inset-0" style="background-image: radial-gradient(circle at 25% 25%, white 2px, transparent 2px), radial-gradient(circle at 75% 75%, white 2px, transparent 2px); background-size: 50px 50px;"></div>
		</div>
		
		<div class="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
			<div class="text-center max-w-4xl mx-auto">
				<h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
					Únete a nuestro equipo de
					<span class="block text-primary-200">profesionales</span>
				</h1>
				<p class="text-xl sm:text-2xl text-primary-100 mb-8 max-w-2xl mx-auto">
					Gana más dinero, recibe clientes garantizados y disfruta de beneficios exclusivos
				</p>
				<div class="flex flex-col sm:flex-row gap-4 justify-center">
					<a 
						href="#application-form"
						class="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold hover:bg-primary-50 transition-colors duration-200 shadow-lg hover:shadow-xl"
					>
						Aplicar Ahora
					</a>
					<a 
						href="#benefits"
						class="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-primary-600 transition-colors duration-200"
					>
						Ver Beneficios
					</a>
				</div>
			</div>
		</div>
	</section>

	<!-- Benefits Section -->
	<section id="benefits" class="py-16 lg:py-20">
		<div class="container mx-auto px-4 sm:px-6 lg:px-8">
			<div class="text-center mb-12 lg:mb-16">
				<h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary-900 mb-4">
					Beneficios Exclusivos
				</h2>
				<p class="text-lg text-secondary-600 max-w-2xl mx-auto">
					Descubre por qué más de 500 profesionales confían en Domify
				</p>
			</div>
			
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
				{#each benefits as benefit}
					<div class="bg-white rounded-2xl p-6 lg:p-8 shadow-lg text-center">
						<div class="text-4xl mb-4">{benefit.icon}</div>
						<h3 class="text-xl font-bold text-secondary-900 mb-3">{benefit.title}</h3>
						<p class="text-secondary-600 leading-relaxed">{benefit.description}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Requirements Section -->
	<section class="py-16 lg:py-20 bg-white">
		<div class="container mx-auto px-4 sm:px-6 lg:px-8">
			<div class="max-w-4xl mx-auto">
				<div class="text-center mb-12 lg:mb-16">
					<h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary-900 mb-4">
						Requisitos
					</h2>
					<p class="text-lg text-secondary-600 max-w-2xl mx-auto">
						Asegúrate de cumplir con todos los requisitos antes de aplicar
					</p>
				</div>
				
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					{#each requirements as requirement, index}
						<div class="flex items-start space-x-4">
							<div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
								<span class="text-primary-600 font-bold text-sm">{index + 1}</span>
							</div>
							<div>
								<p class="text-secondary-700 font-medium">{requirement}</p>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</section>

	<!-- Application Process Section -->
	<section class="py-16 lg:py-20">
		<div class="container mx-auto px-4 sm:px-6 lg:px-8">
			<div class="text-center mb-12 lg:mb-16">
				<h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary-900 mb-4">
					Proceso de Aplicación
				</h2>
				<p class="text-lg text-secondary-600 max-w-2xl mx-auto">
					En solo 5 pasos podrás comenzar a recibir clientes
				</p>
			</div>
			
			<div class="max-w-6xl mx-auto">
				<div class="relative">
					<!-- Timeline line -->
					<div class="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-primary-200 hidden lg:block"></div>
					
					<div class="grid grid-cols-1 lg:grid-cols-5 gap-8">
						{#each applicationSteps as step, index}
							<div class="relative">
								<div class="bg-white rounded-2xl p-6 shadow-lg text-center">
									<div class="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
										{step.step}
									</div>
									<h3 class="text-xl font-bold text-secondary-900 mb-2">{step.title}</h3>
									<p class="text-secondary-600 text-sm">{step.description}</p>
								</div>
								
								<!-- Timeline dot for desktop -->
								<div class="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-primary-600 rounded-full border-4 border-white shadow-lg hidden lg:block" style="top: 2rem;"></div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Application Form Section -->
	<section id="application-form" class="py-16 lg:py-20 bg-white">
		<div class="container mx-auto px-4 sm:px-6 lg:px-8">
			<div class="max-w-4xl mx-auto">
				<div class="text-center mb-12 lg:mb-16">
					<h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary-900 mb-4">
						Solicitud de Proveedor
					</h2>
					<p class="text-lg text-secondary-600 max-w-2xl mx-auto">
						Completa el formulario y nos pondremos en contacto contigo en 24-48 horas
					</p>
				</div>
				
				{#if success}
					<div class="bg-green-50 border border-green-200 rounded-2xl p-8 text-center mb-8">
						<div class="text-4xl mb-4">✅</div>
						<h3 class="text-2xl font-bold text-green-800 mb-2">¡Solicitud enviada!</h3>
						<p class="text-green-700 mb-6">Gracias por tu interés en unirte a Domify. Te contactaremos en 24-48 horas para continuar con el proceso.</p>
						<button 
							on:click={resetForm}
							class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
						>
							Enviar otra solicitud
						</button>
					</div>
				{:else}
					<form on:submit|preventDefault={handleSubmit} class="bg-white rounded-2xl shadow-lg p-8 lg:p-12">
						{#if error}
							<div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
								<p class="text-red-700">{error}</p>
							</div>
						{/if}
						
						<!-- Información Personal -->
						<div class="mb-8">
							<h3 class="text-xl font-bold text-secondary-900 mb-4">Información Personal</h3>
							<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label for="firstName" class="block text-sm font-medium text-secondary-700 mb-2">Nombre *</label>
									<input
										type="text"
										id="firstName"
										bind:value={formData.firstName}
										required
										class="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
										placeholder="Tu nombre"
									/>
								</div>
								<div>
									<label for="lastName" class="block text-sm font-medium text-secondary-700 mb-2">Apellido *</label>
									<input
										type="text"
										id="lastName"
										bind:value={formData.lastName}
										required
										class="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
										placeholder="Tu apellido"
									/>
								</div>
							</div>
							
							<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
								<div>
									<label for="email" class="block text-sm font-medium text-secondary-700 mb-2">Email *</label>
									<input
										type="email"
										id="email"
										bind:value={formData.email}
										required
										class="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
										placeholder="tu@email.com"
									/>
								</div>
								<div>
									<label for="phone" class="block text-sm font-medium text-secondary-700 mb-2">Teléfono *</label>
									<input
										type="tel"
										id="phone"
										bind:value={formData.phone}
										required
										class="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
										placeholder="+505 8888-8888"
									/>
								</div>
							</div>
						</div>
						
						<!-- Información del Negocio -->
						<div class="mb-8">
							<h3 class="text-xl font-bold text-secondary-900 mb-4">Información del Negocio</h3>
							<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label for="businessName" class="block text-sm font-medium text-secondary-700 mb-2">Nombre del Negocio</label>
									<input
										type="text"
										id="businessName"
										bind:value={formData.businessName}
										class="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
										placeholder="Nombre de tu empresa (opcional)"
									/>
								</div>
								<div>
									<label for="serviceCategory" class="block text-sm font-medium text-secondary-700 mb-2">Categoría de Servicio *</label>
									<select
										id="serviceCategory"
										bind:value={formData.serviceCategory}
										required
										class="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
									>
										<option value="">Selecciona una categoría</option>
										{#each serviceCategories as category}
											<option value={category.value}>{category.label}</option>
										{/each}
									</select>
								</div>
							</div>
							
							<div class="mt-6">
								<label for="experience" class="block text-sm font-medium text-secondary-700 mb-2">Años de Experiencia *</label>
								<input
									type="text"
									id="experience"
									bind:value={formData.experience}
									required
									class="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
									placeholder="Ej: 5 años en limpieza residencial"
								/>
							</div>
							
							<div class="mt-6">
								<label for="description" class="block text-sm font-medium text-secondary-700 mb-2">Descripción de Servicios *</label>
								<textarea
									id="description"
									bind:value={formData.description}
									required
									rows="4"
									class="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 resize-none"
									placeholder="Describe los servicios que ofreces, tu especialización, etc."
								></textarea>
							</div>
						</div>
						
						<!-- Información Adicional -->
						<div class="mb-8">
							<h3 class="text-xl font-bold text-secondary-900 mb-4">Información Adicional</h3>
							<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label for="location" class="block text-sm font-medium text-secondary-700 mb-2">Ubicación de Trabajo *</label>
									<input
										type="text"
										id="location"
										bind:value={formData.location}
										required
										class="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
										placeholder="Ej: Managua, Granada, León"
									/>
								</div>
								<div>
									<label for="availability" class="block text-sm font-medium text-secondary-700 mb-2">Disponibilidad *</label>
									<input
										type="text"
										id="availability"
										bind:value={formData.availability}
										required
										class="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
										placeholder="Ej: Lunes a Viernes, fines de semana"
									/>
								</div>
							</div>
							
							<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
								<div>
									<label for="hourlyRate" class="block text-sm font-medium text-secondary-700 mb-2">Tarifa por Hora (NIO) *</label>
									<input
										type="number"
										id="hourlyRate"
										bind:value={formData.hourlyRate}
										required
										min="0"
										class="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
										placeholder="Ej: 300"
									/>
								</div>
								<div>
									<label for="portfolio" class="block text-sm font-medium text-secondary-700 mb-2">Enlace a Portfolio</label>
									<input
										type="url"
										id="portfolio"
										bind:value={formData.portfolio}
										class="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
										placeholder="https://tu-portfolio.com (opcional)"
									/>
								</div>
							</div>
							
							<div class="mt-6">
								<label for="references" class="block text-sm font-medium text-secondary-700 mb-2">Referencias</label>
								<textarea
									id="references"
									bind:value={formData.references}
									rows="3"
									class="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 resize-none"
									placeholder="Menciona algunas referencias o clientes anteriores (opcional)"
								></textarea>
							</div>
						</div>
						
						<!-- Términos y Condiciones -->
						<div class="mb-8">
							<div class="flex items-start space-x-3">
								<input
									type="checkbox"
									id="agreement"
									bind:checked={formData.agreement}
									required
									class="mt-1 w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
								/>
								<label for="agreement" class="text-sm text-secondary-700">
									Acepto los <a href="/terms" class="text-primary-600 hover:text-primary-700 underline">términos y condiciones</a> y la <a href="/privacy" class="text-primary-600 hover:text-primary-700 underline">política de privacidad</a> de Domify *
								</label>
							</div>
						</div>
						
						<div class="text-center">
							<button
								type="submit"
								disabled={loading}
								class="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white px-8 py-4 rounded-xl font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
							>
								{loading ? 'Enviando solicitud...' : 'Enviar Solicitud'}
							</button>
						</div>
					</form>
				{/if}
			</div>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="bg-gradient-to-r from-primary-600 to-primary-700 py-16 lg:py-20">
		<div class="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
			<h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
				¿Tienes preguntas?
			</h2>
			<p class="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
				Contáctanos para resolver cualquier duda sobre el proceso de aplicación
			</p>
			<a 
				href="/contact"
				class="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-colors duration-200 shadow-lg hover:shadow-xl"
			>
				Contactar Soporte
			</a>
		</div>
	</section>
</div> 