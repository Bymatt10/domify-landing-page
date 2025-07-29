<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';

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

			console.log('Formulario enviado:', formData);
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
	<div class="relative z-10 pt-16 lg:pt-24 pb-8">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div in:fly={{ y: -50, duration: 1000 }} class="text-center">
				<h1 class="text-4xl md:text-5xl font-bold text-primary-900 mb-4">
					<span class="text-primary-600">Conecta</span> con Nosotros
				</h1>
				<p class="text-xl text-secondary-700 max-w-2xl mx-auto">
					¿Tienes alguna pregunta o comentario? Estamos aquí para ayudarte con cualquier consulta.
				</p>
			</div>
		</div>
	</div>

	<!-- Main Content -->
	<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
		<div class="grid lg:grid-cols-5 gap-8 lg:gap-12">
			<!-- Contact Form Section -->
			<div class="lg:col-span-3">
				{#if success}
					<div in:fly={{ y: 20, duration: 800 }} class="bg-white rounded-2xl shadow-xl p-8 sm:p-10 text-center">
						<div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-subtle">
							<svg class="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
							</svg>
						</div>
						<h3 class="text-2xl font-bold text-secondary-900 mb-4">¡Mensaje Enviado!</h3>
						<p class="text-lg text-secondary-600 mb-8">Gracias por contactarnos. Nuestro equipo te responderá lo antes posible.</p>
						<button 
							on:click={resetForm}
							class="bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
						>
							Enviar otro mensaje
						</button>
					</div>
				{:else}
					<div class="bg-white rounded-2xl shadow-xl overflow-hidden">
						<!-- Form Tabs -->
						<div class="flex border-b border-secondary-100">
							<button 
								class="flex-1 py-4 px-4 text-center font-medium {activeSection === 'form' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-secondary-500 hover:text-secondary-700'}"
								on:click={() => setActiveSection('form')}
							>
								Formulario de Contacto
							</button>
							<button 
								class="flex-1 py-4 px-4 text-center font-medium {activeSection === 'faq' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-secondary-500 hover:text-secondary-700'}"
								on:click={() => setActiveSection('faq')}
							>
								Preguntas Frecuentes
							</button>
						</div>

						{#if activeSection === 'form'}
							<div class="p-6 sm:p-8 md:p-10">
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
											<h3 class="text-2xl font-bold text-secondary-900 mb-6">Cuéntanos sobre ti</h3>

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
														class="w-full px-4 py-3 text-secondary-900 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
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
														class="w-full px-4 py-3 text-secondary-900 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
														placeholder="+505 8888-8888"
													/>
												</div>
											</div>
										</div>
									{/if}

									<!-- Step 2: Contact Details -->
									{#if currentStep === 2}
										<div in:fly|local={{ x: 20, duration: 300, delay: 200 }}>
											<h3 class="text-2xl font-bold text-secondary-900 mb-6">¿Cómo podemos contactarte?</h3>

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
														class="w-full px-4 py-3 text-secondary-900 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
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
														class="w-full px-4 py-3 text-secondary-900 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
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
											<h3 class="text-2xl font-bold text-secondary-900 mb-6">¿En qué podemos ayudarte?</h3>

											<div>
												<label for="message" class="block text-sm font-medium text-secondary-700 mb-2">
													Mensaje *
												</label>
												<textarea
													bind:this={messageInput}
													id="message"
													bind:value={formData.message}
													required
													rows="6"
													class="w-full px-4 py-3 text-secondary-900 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 resize-none"
													placeholder="Cuéntanos cómo podemos ayudarte..."
												></textarea>
											</div>
										</div>
									{/if}

									<!-- Navigation Buttons -->
									<div class="flex justify-between pt-6">
										{#if currentStep > 1}
											<button 
												type="button" 
												on:click={handlePrevStep}
												class="flex items-center px-5 py-3 text-secondary-700 bg-secondary-100 hover:bg-secondary-200 rounded-xl transition-colors duration-200"
											>
												<svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
												</svg>
												Anterior
											</button>
										{:else}
											<div></div>
										{/if}

										<button 
											type="submit" 
											disabled={loading}
											class="flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
										>
											{#if loading}
												<svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
													<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
													<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
												</svg>
												Enviando...
											{:else if currentStep < 3}
												Siguiente
												<svg class="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
												</svg>
											{:else}
												Enviar mensaje
												<svg class="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
												</svg>
											{/if}
										</button>
									</div>
								</form>
							</div>
						{:else if activeSection === 'faq'}
							<div class="p-6 sm:p-8 md:p-10">
								<h3 class="text-2xl font-bold text-secondary-900 mb-8">Preguntas Frecuentes</h3>

								<div class="space-y-6 stagger-fade-in" style="--stagger-delay: 100ms;">
									<div class="border border-secondary-200 rounded-lg p-5 hover:shadow-md transition-shadow duration-300">
										<h4 class="text-lg font-semibold text-secondary-900 mb-2">¿Cómo puedo registrarme como proveedor?</h4>
										<p class="text-secondary-600">Para registrarte como proveedor, puedes hacerlo directamente desde nuestra página "Conviértete en Proveedor" o contactarnos a través de este formulario seleccionando "Ser proveedor" como asunto.</p>
									</div>

									<div class="border border-secondary-200 rounded-lg p-5 hover:shadow-md transition-shadow duration-300">
										<h4 class="text-lg font-semibold text-secondary-900 mb-2">¿Cuánto tiempo tarda en responderse una consulta?</h4>
										<p class="text-secondary-600">Nuestro equipo responde a todas las consultas en un plazo máximo de 24 horas hábiles. Para consultas urgentes, recomendamos contactarnos directamente por WhatsApp.</p>
									</div>

									<div class="border border-secondary-200 rounded-lg p-5 hover:shadow-md transition-shadow duration-300">
										<h4 class="text-lg font-semibold text-secondary-900 mb-2">¿Cómo puedo reportar un problema con un servicio?</h4>
										<p class="text-secondary-600">Si tienes algún problema con un servicio contratado, puedes reportarlo a través de este formulario seleccionando "Soporte técnico" como asunto, o directamente desde tu perfil en la sección "Mis Servicios".</p>
									</div>

									<div class="border border-secondary-200 rounded-lg p-5 hover:shadow-md transition-shadow duration-300">
										<h4 class="text-lg font-semibold text-secondary-900 mb-2">¿Domify opera en toda Nicaragua?</h4>
										<p class="text-secondary-600">Actualmente operamos en las principales ciudades de Nicaragua, con mayor cobertura en Managua, León, Granada y Masaya. Estamos expandiendo constantemente nuestra red de proveedores para cubrir más zonas.</p>
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
					<div in:fly={{ y: 30, duration: 1000 }} class="bg-white rounded-2xl shadow-xl p-8">
						<h3 class="text-2xl font-bold text-secondary-900 mb-6">Información de Contacto</h3>

						<div class="space-y-6 stagger-fade-in" style="--stagger-delay: 200ms;">
							<div class="flex items-start">
								<div class="flex-shrink-0 h-12 w-12 rounded-xl bg-primary-100 flex items-center justify-center mr-4">
									<svg class="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
									</svg>
								</div>
								<div>
									<h4 class="text-lg font-semibold text-secondary-900">Email</h4>
									<p class="text-secondary-600 mt-1">info@domify.app</p>
									<p class="text-secondary-500 text-sm mt-1">Te respondemos en 24 horas</p>
								</div>
							</div>

							<div class="flex items-start">
								<div class="flex-shrink-0 h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center mr-4">
									<svg class="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
								</div>
								<div>
									<h4 class="text-lg font-semibold text-secondary-900">Horarios de Atención</h4>
									<p class="text-secondary-600 mt-1">Lun - Vie: 8:00 - 18:00</p>
									<p class="text-secondary-600">Sáb: 9:00 - 14:00</p>
								</div>
							</div>
						</div>

						<!-- Social Media -->
						<div class="mt-8 pt-6 border-t border-secondary-100">
							<h4 class="text-lg font-semibold text-secondary-900 mb-4">Síguenos</h4>
							<div class="flex justify-center space-x-6">
																<a href="#" class="text-secondary-600 hover:text-primary-600 transition-colors duration-200 transform hover:scale-110">
									<span class="sr-only">Facebook</span>
									<svg class="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
										<path fill-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clip-rule="evenodd" />
									</svg>
								</a>

																<a href="#" class="text-secondary-600 hover:text-primary-600 transition-colors duration-200 transform hover:scale-110">
									<span class="sr-only">Instagram</span>
									<svg class="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
										<path fill-rule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clip-rule="evenodd" />
									</svg>
								</a>

																<a href="#" class="text-secondary-600 hover:text-primary-600 transition-colors duration-200 transform hover:scale-110">
									<span class="sr-only">Twitter</span>
									<svg class="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
										<path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
									</svg>
								</a>

																<a href="#" class="text-secondary-600 hover:text-primary-600 transition-colors duration-200 transform hover:scale-110">
									<span class="sr-only">LinkedIn</span>
									<svg class="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
										<path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
									</svg>
								</a>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div> 