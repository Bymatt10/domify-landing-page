<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { getAllSocialMedia } from '$lib/social-config';

	let formData = {
		name: '',
		email: '',
		phone: '',
		subject: '',
		message: ''
	};

	let loading = false;
	let success = false;
	let error = '';
	let currentStep = 1;
	let formElement: HTMLFormElement;
	let animateBackground = false;
	let showContactInfo = false;
	let activeSection = 'form';
	
	// Información de contacto
	const contactInfo = {
		phone: '+505 8888-8888',
		whatsapp: '+505 8888-8888',
		email: 'info@domify.app'
	};
	
	// Mensaje predefinido para WhatsApp
	const whatsappMessage = 'Hola, estoy interesado en Domify. ¿Podrían proporcionarme más información sobre sus servicios?';
	
	// Obtener configuración de redes sociales
	const socialMedia = getAllSocialMedia();

	// Referencias para animaciones
	let nameInput: HTMLInputElement;
	let emailInput: HTMLInputElement;
	let messageInput: HTMLTextAreaElement;

	onMount(() => {
		// Mostrar el fondo animado después de un retraso
		setTimeout(() => {
			animateBackground = true;
		}, 300);

		// Mostrar la información de contacto con un retraso
		setTimeout(() => {
			showContactInfo = true;
		}, 800);
	});

	async function handleSubmit() {
		if (currentStep < 3) {
			currentStep++;
			return;
		}

		if (!formElement.checkValidity()) {
			formElement.reportValidity();
			return;
		}

		loading = true;
		error = '';

		try {
			// Simular envío
			await new Promise(resolve => setTimeout(resolve, 2000));

			// Formulario enviado
			success = true;

			// Limpiar formulario
			formData = {
				name: '',
				email: '',
				phone: '',
				subject: '',
				message: ''
			};
			currentStep = 1;

		} catch (err) {
			console.error('Error al enviar:', err);
			error = 'Error al enviar el mensaje. Por favor, intenta de nuevo.';
		} finally {
			loading = false;
		}
	}

	function handlePrevStep() {
		if (currentStep > 1) {
			currentStep--;
		}
	}

	function focusActiveInput() {
		setTimeout(() => {
			if (currentStep === 1 && nameInput) nameInput.focus();
			else if (currentStep === 2 && emailInput) emailInput.focus();
			else if (currentStep === 3 && messageInput) messageInput.focus();
		}, 300);
	}

	function resetForm() {
		success = false;
		currentStep = 1;
		formData = {
			name: '',
			email: '',
			phone: '',
			subject: '',
			message: ''
		};
		setTimeout(() => {
			nameInput?.focus();
		}, 300);
	}

	function setActiveSection(section: string) {
		activeSection = section;
	}
	
	// Funciones de contacto directo
	function callNow() {
		window.location.href = `tel:${contactInfo.phone}`;
	}
	
	function sendWhatsApp() {
		const encodedMessage = encodeURIComponent(whatsappMessage);
		const whatsappUrl = `https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
		window.open(whatsappUrl, '_blank');
	}
	
	function sendEmail() {
		const subject = encodeURIComponent('Consulta sobre Domify');
		const body = encodeURIComponent(whatsappMessage);
		window.location.href = `mailto:${contactInfo.email}?subject=${subject}&body=${body}`;
	}

	// Reactive statements
	$: if (currentStep) {
		focusActiveInput();
	}
</script>

<svelte:head>
	<title>Contacto - Domify</title>
	<meta name="description" content="Contacta con Domify. Estamos aquí para ayudarte." />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 overflow-hidden">
	<!-- Background Animation Elements -->
	{#if animateBackground}
		<div transition:fade={{ duration: 1000 }} class="absolute inset-0 z-0 overflow-hidden">
			<div class="absolute top-20 left-20 w-72 h-72 bg-primary-300 rounded-full opacity-20 animate-pulse-slow"></div>
			<div class="absolute top-40 right-20 w-96 h-96 bg-secondary-300 rounded-full opacity-20 animate-pulse-slow" style="animation-delay: 1s"></div>
			<div class="absolute bottom-20 left-1/3 w-80 h-80 bg-primary-400 rounded-full opacity-10 animate-pulse-slow" style="animation-delay: 2s"></div>
		</div>
	{/if}

	<!-- Header -->
	<div class="relative z-10 pt-12 sm:pt-16 lg:pt-24 pb-6 sm:pb-8">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div in:fly={{ y: -50, duration: 1000 }} class="text-center">
				<h1 class="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-900 mb-3 sm:mb-4">
					<span class="text-primary-600">Conecta</span> con Nosotros
				</h1>
				<p class="text-lg sm:text-xl text-secondary-700 max-w-2xl mx-auto px-4 sm:px-0">
					¿Tienes alguna pregunta o comentario? Estamos aquí para ayudarte con cualquier consulta.
				</p>
			</div>
		</div>
	</div>

	<!-- Main Content -->
	<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 lg:pb-20">
		<div class="grid lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-12">
			<!-- Contact Form Section -->
			<div class="lg:col-span-3">
				{#if success}
					<div in:fly={{ y: 20, duration: 800 }} class="bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10 text-center">
						<div class="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 animate-bounce-subtle">
							<svg class="w-8 h-8 sm:w-10 sm:h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
							</svg>
						</div>
						<h3 class="text-xl sm:text-2xl font-bold text-secondary-900 mb-3 sm:mb-4">¡Mensaje Enviado!</h3>
						<p class="text-base sm:text-lg text-secondary-600 mb-6 sm:mb-8">Gracias por contactarnos. Nuestro equipo te responderá lo antes posible.</p>
						<button 
							on:click={resetForm}
							class="bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
						>
							Enviar otro mensaje
						</button>
					</div>
				{:else}
					<div class="bg-white rounded-2xl shadow-xl overflow-hidden form-container">
						<!-- Form Tabs -->
						<div class="flex border-b border-secondary-100">
							<button 
								class="flex-1 py-3 sm:py-4 px-2 sm:px-4 text-center font-medium text-sm sm:text-base {activeSection === 'form' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-secondary-500 hover:text-secondary-700'}"
								on:click={() => setActiveSection('form')}
							>
								<span class="hidden sm:inline">Formulario de Contacto</span>
								<span class="sm:hidden">Contacto</span>
							</button>
							<button 
								class="flex-1 py-3 sm:py-4 px-2 sm:px-4 text-center font-medium text-sm sm:text-base {activeSection === 'faq' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-secondary-500 hover:text-secondary-700'}"
								on:click={() => setActiveSection('faq')}
							>
								<span class="hidden sm:inline">Preguntas Frecuentes</span>
								<span class="sm:hidden">FAQ</span>
							</button>
						</div>

						{#if activeSection === 'form'}
							<div class="p-4 sm:p-6 lg:p-8 xl:p-10">
								{#if error}
									<div in:fly={{ y: 10, duration: 300 }} class="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
										<div class="flex">
											<svg class="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
											</svg>
											<p class="text-red-700">{error}</p>
										</div>
									</div>
								{/if}

								<form bind:this={formElement} on:submit|preventDefault={handleSubmit} class="space-y-6">
									<!-- Progress Bar -->
									<div class="w-full bg-secondary-100 rounded-full h-2 mb-8">
										<div 
											class="bg-primary-600 h-2 rounded-full transition-all duration-500" 
											style="width: {(currentStep / 3) * 100}%;"
										></div>
									</div>

									<!-- Step 1: Personal Info -->
									{#if currentStep === 1}
										<div in:fly|local={{ x: 20, duration: 300, delay: 200 }}>
											<h3 class="text-xl sm:text-2xl font-bold text-secondary-900 mb-4 sm:mb-6">Cuéntanos sobre ti</h3>

											<div class="space-y-4">
												<div>
													<label for="name" class="block text-sm font-medium text-secondary-700 mb-2">
														Nombre completo *
													</label>
													<input
														bind:this={nameInput}
														type="text"
														id="name"
														bind:value={formData.name}
														required
														class="w-full px-3 sm:px-4 py-2 sm:py-3 text-secondary-900 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 text-sm sm:text-base"
														placeholder="Tu nombre"
													/>
												</div>

												<div>
													<label for="phone" class="block text-sm font-medium text-secondary-700 mb-2">
														Teléfono
													</label>
													<input
														type="tel"
														id="phone"
														bind:value={formData.phone}
														class="w-full px-3 sm:px-4 py-2 sm:py-3 text-secondary-900 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 text-sm sm:text-base"
														placeholder="+505 8888-8888"
													/>
												</div>
											</div>
										</div>
									{/if}

									<!-- Step 2: Contact Details -->
									{#if currentStep === 2}
										<div in:fly|local={{ x: 20, duration: 300, delay: 200 }}>
											<h3 class="text-xl sm:text-2xl font-bold text-secondary-900 mb-4 sm:mb-6">¿Cómo podemos contactarte?</h3>

											<div class="space-y-4">
												<div>
													<label for="email" class="block text-sm font-medium text-secondary-700 mb-2">
														Email *
													</label>
													<input
														bind:this={emailInput}
														type="email"
														id="email"
														bind:value={formData.email}
														required
														class="w-full px-3 sm:px-4 py-2 sm:py-3 text-secondary-900 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 text-sm sm:text-base"
														placeholder="tu@email.com"
													/>
												</div>

												<div>
													<label for="subject" class="block text-sm font-medium text-secondary-700 mb-2">
														Asunto *
													</label>
													<select
														id="subject"
														bind:value={formData.subject}
														required
														class="w-full px-3 sm:px-4 py-2 sm:py-3 text-secondary-900 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 text-sm sm:text-base"
													>
														<option value="">Selecciona un asunto</option>
														<option value="general">Consulta general</option>
														<option value="support">Soporte técnico</option>
														<option value="provider">Ser proveedor</option>
														<option value="other">Otro</option>
													</select>
												</div>
											</div>
										</div>
									{/if}

									<!-- Step 3: Message -->
									{#if currentStep === 3}
										<div in:fly|local={{ x: 20, duration: 300, delay: 200 }}>
											<h3 class="text-xl sm:text-2xl font-bold text-secondary-900 mb-4 sm:mb-6">¿En qué podemos ayudarte?</h3>

											<div>
												<label for="message" class="block text-sm font-medium text-secondary-700 mb-2">
													Mensaje *
												</label>
												<textarea
													bind:this={messageInput}
													id="message"
													bind:value={formData.message}
													required
													rows="4"
													class="w-full px-3 sm:px-4 py-2 sm:py-3 text-secondary-900 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 resize-none text-sm sm:text-base"
													placeholder="Cuéntanos cómo podemos ayudarte..."
												></textarea>
											</div>
										</div>
									{/if}

									<!-- Navigation Buttons -->
									<div class="flex justify-between pt-4 sm:pt-6">
										{#if currentStep > 1}
											<button 
												type="button" 
												on:click={handlePrevStep}
												class="flex items-center px-3 sm:px-5 py-2 sm:py-3 text-secondary-700 bg-secondary-100 hover:bg-secondary-200 rounded-xl transition-colors duration-200 text-sm sm:text-base"
											>
												<svg class="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
												</svg>
												<span class="hidden sm:inline">Anterior</span>
												<span class="sm:hidden">Atrás</span>
											</button>
										{:else}
											<div></div>
										{/if}

										<button 
											type="submit" 
											disabled={loading}
											class="flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
										>
											{#if loading}
												<svg class="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24">
													<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
													<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
												</svg>
												<span class="hidden sm:inline">Enviando...</span>
												<span class="sm:hidden">Enviando</span>
											{:else if currentStep < 3}
												<span class="hidden sm:inline">Siguiente</span>
												<span class="sm:hidden">Siguiente</span>
												<svg class="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
												</svg>
											{:else}
												<span class="hidden sm:inline">Enviar mensaje</span>
												<span class="sm:hidden">Enviar</span>
												<svg class="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
												</svg>
											{/if}
										</button>
									</div>
								</form>
							</div>
						{:else if activeSection === 'faq'}
							<div class="p-4 sm:p-6 lg:p-8 xl:p-10">
								<h3 class="text-xl sm:text-2xl font-bold text-secondary-900 mb-6 sm:mb-8">Preguntas Frecuentes</h3>

								<div class="space-y-4 sm:space-y-6 stagger-fade-in" style="--stagger-delay: 100ms;">
									<div class="border border-secondary-200 rounded-lg p-4 sm:p-5 hover:shadow-md transition-shadow duration-300">
										<h4 class="text-base sm:text-lg font-semibold text-secondary-900 mb-2">¿Cómo puedo registrarme como proveedor?</h4>
										<p class="text-sm sm:text-base text-secondary-600">Para registrarte como proveedor, puedes hacerlo directamente desde nuestra página "Conviértete en Proveedor" o contactarnos a través de este formulario seleccionando "Ser proveedor" como asunto.</p>
									</div>

									<div class="border border-secondary-200 rounded-lg p-4 sm:p-5 hover:shadow-md transition-shadow duration-300">
										<h4 class="text-base sm:text-lg font-semibold text-secondary-900 mb-2">¿Cuánto tiempo tarda en responderse una consulta?</h4>
										<p class="text-sm sm:text-base text-secondary-600">Nuestro equipo responde a todas las consultas en un plazo máximo de 24 horas hábiles. Para consultas urgentes, recomendamos contactarnos directamente por WhatsApp.</p>
									</div>

									<div class="border border-secondary-200 rounded-lg p-4 sm:p-5 hover:shadow-md transition-shadow duration-300">
										<h4 class="text-base sm:text-lg font-semibold text-secondary-900 mb-2">¿Cómo puedo reportar un problema con un servicio?</h4>
										<p class="text-sm sm:text-base text-secondary-600">Si tienes algún problema con un servicio contratado, puedes reportarlo a través de este formulario seleccionando "Soporte técnico" como asunto, o directamente desde tu perfil en la sección "Mis Servicios".</p>
									</div>

									<div class="border border-secondary-200 rounded-lg p-4 sm:p-5 hover:shadow-md transition-shadow duration-300">
										<h4 class="text-base sm:text-lg font-semibold text-secondary-900 mb-2">¿Domify opera en toda Nicaragua?</h4>
										<p class="text-sm sm:text-base text-secondary-600">Actualmente operamos en las principales ciudades de Nicaragua, con mayor cobertura en Managua, León, Granada y Masaya. Estamos expandiendo constantemente nuestra red de proveedores para cubrir más zonas.</p>
									</div>
								</div>
							</div>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Contact Info Section -->
			<div class="lg:col-span-2">
				{#if showContactInfo}
					<div in:fly={{ y: 30, duration: 1000 }} class="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
						<h3 class="text-xl sm:text-2xl font-bold text-secondary-900 mb-4 sm:mb-6">Información de Contacto</h3>
						
						<!-- Botones de Contacto Directo -->
						<div class="mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl border border-primary-100">
							<h4 class="text-base sm:text-lg font-semibold text-secondary-900 mb-3 sm:mb-4 text-center">¿Necesitas ayuda rápida?</h4>
							<div class="space-y-3">
								<!-- Botón de WhatsApp -->
								<button 
									on:click={sendWhatsApp}
									class="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
								>
									<svg class="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
										<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
									</svg>
									<span>Enviar WhatsApp</span>
								</button>
								
								<!-- Botón de Llamada -->
								<button 
									on:click={callNow}
									class="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
								>
									<svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
									</svg>
									<span>Llamar Ahora</span>
								</button>
								
								<!-- Botón de Email -->
								<button 
									on:click={sendEmail}
									class="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
								>
									<svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
									</svg>
									<span>Enviar Email</span>
								</button>
							</div>
							
							<p class="text-xs sm:text-sm text-secondary-600 text-center mt-3 sm:mt-4">
								Mensaje predefinido: "Hola, estoy interesado en Domify. ¿Podrían proporcionarme más información sobre sus servicios?"
							</p>
						</div>

						<div class="space-y-6 stagger-fade-in" style="--stagger-delay: 200ms;">
							<div class="flex items-start">
								<div class="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-orange-100 flex items-center justify-center mr-3 sm:mr-4">
									<svg class="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
								</div>
								<div>
									<h4 class="text-base sm:text-lg font-semibold text-secondary-900">Horarios de Atención</h4>
									<p class="text-sm sm:text-base text-secondary-600 mt-1">Lun - Vie: 8:00 - 18:00 | Sáb: 9:00 - 14:00</p>
								</div>
							</div>
						</div>

						<!-- Social Media -->
						<div class="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-secondary-100">
							<h4 class="text-base sm:text-lg font-semibold text-secondary-900 mb-3 sm:mb-4">Síguenos</h4>
							<div class="flex justify-center space-x-4 sm:space-x-6">
								{#each socialMedia as platform}
									<a 
										href={platform.url} 
										target="_blank" 
										rel="noopener noreferrer" 
										class="{platform.color} hover:{platform.hoverColor} transition-colors duration-200 transform hover:scale-110"
										title={`Síguenos en ${platform.name}`}
									>
										<span class="sr-only">{platform.name}</span>
										<svg class="h-6 w-6 sm:h-8 sm:w-8" fill="currentColor" viewBox="0 0 24 24">
											<path d={platform.icon} />
										</svg>
									</a>
								{/each}
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	@keyframes pulse-slow {
		0%, 100% {
			opacity: 0.2;
			transform: scale(1);
		}
		50% {
			opacity: 0.3;
			transform: scale(1.05);
		}
	}
	
	.animate-pulse-slow {
		animation: pulse-slow 3s ease-in-out infinite;
	}
	
	@keyframes bounce-subtle {
		0%, 100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-10px);
		}
	}
	
	.animate-bounce-subtle {
		animation: bounce-subtle 2s ease-in-out infinite;
	}
	
	.stagger-fade-in > * {
		animation: fadeIn 0.6s ease-out forwards;
		opacity: 0;
		transform: translateY(20px);
	}
	
	.stagger-fade-in > *:nth-child(1) { animation-delay: calc(var(--stagger-delay, 0ms) + 0ms); }
	.stagger-fade-in > *:nth-child(2) { animation-delay: calc(var(--stagger-delay, 0ms) + 100ms); }
	.stagger-fade-in > *:nth-child(3) { animation-delay: calc(var(--stagger-delay, 0ms) + 200ms); }
	.stagger-fade-in > *:nth-child(4) { animation-delay: calc(var(--stagger-delay, 0ms) + 300ms); }
	.stagger-fade-in > *:nth-child(5) { animation-delay: calc(var(--stagger-delay, 0ms) + 400ms); }
	
	@keyframes fadeIn {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Responsive improvements */
	@media (max-width: 640px) {
		/* Mobile-specific adjustments */
		.form-container {
			margin: 0 -1rem;
		}
		
		/* Improve touch targets */
		button, a {
			min-height: 44px;
		}
		
		/* Better spacing for mobile */
		.space-y-4 > * + * {
			margin-top: 1rem;
		}
	}

	@media (max-width: 768px) {
		/* Tablet adjustments */
		.grid {
			gap: 1.5rem;
		}
	}

	/* Improve form accessibility on mobile */
	@media (max-width: 640px) {
		input, select, textarea {
			font-size: 16px; /* Prevents zoom on iOS */
		}
	}
</style> 