<script lang="ts">
	import { onMount } from 'svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import { notifications } from '$lib/stores/notifications';

	// Formulario de contacto
	let contactForm = {
		name: '',
		email: '',
		subject: '',
		message: ''
	};

	let submitting = false;
	let isAuthenticated = false;
	let currentUser: any = null;

	// Categorías de contacto
	const contactCategories = [
		{ value: 'general', label: 'Consulta General' },
		{ value: 'support', label: 'Soporte Técnico' },
		{ value: 'business', label: 'Asociación Comercial' },
		{ value: 'feedback', label: 'Comentarios y Sugerencias' },
		{ value: 'bug', label: 'Reportar un Problema' },
		{ value: 'feature', label: 'Solicitar Nueva Funcionalidad' }
	];

	onMount(async () => {
		// Verificar si el usuario está autenticado para pre-llenar datos
		try {
			const response = await fetch('/api/me');
			if (response.ok) {
				const userData = await response.json();
				isAuthenticated = true;
				currentUser = userData.user;
				
				// Pre-llenar con datos del usuario si está autenticado
				if (userData.user) {
					contactForm.name = `${userData.user.user_metadata?.first_name || ''} ${userData.user.user_metadata?.last_name || ''}`.trim();
					contactForm.email = userData.user.email || '';
				}
			}
		} catch (error) {
			console.error('Error checking authentication:', error);
		}
	});

	async function submitContactForm() {
		if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.subject.trim() || !contactForm.message.trim()) {
			notifications.error('Por favor completa todos los campos');
			return;
		}

		// Validar email
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(contactForm.email)) {
			notifications.error('Por favor ingresa un email válido');
			return;
		}

		submitting = true;
		try {
			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: contactForm.name.trim(),
					email: contactForm.email.trim(),
					subject: contactForm.subject.trim(),
					message: contactForm.message.trim(),
					user_id: currentUser?.id || null
				})
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Error al enviar el mensaje');
			}

			// Limpiar formulario
			contactForm = {
				name: isAuthenticated ? contactForm.name : '',
				email: isAuthenticated ? contactForm.email : '',
				subject: '',
				message: ''
			};

			notifications.success('¡Mensaje enviado exitosamente! Te responderemos pronto.');
			
		} catch (error) {
			console.error('Error submitting contact form:', error);
			notifications.error(error instanceof Error ? error.message : 'Error al enviar el mensaje');
		} finally {
			submitting = false;
		}
	}

	function clearForm() {
		contactForm = {
			name: isAuthenticated ? contactForm.name : '',
			email: isAuthenticated ? contactForm.email : '',
			subject: '',
			message: ''
		};
	}
</script>

<svelte:head>
	<title>Contacto - Domify</title>
	<meta name="description" content="Contáctanos para cualquier consulta, soporte técnico o asociación comercial. Estamos aquí para ayudarte." />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
	<!-- (Header duplicado eliminado; se usará el navbar global) -->

	<!-- Main Content -->
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
		<div class="text-center mb-12">
			<h1 class="text-4xl font-bold text-secondary-900 mb-4">
				Contáctanos
			</h1>
			<p class="text-xl text-secondary-600 max-w-2xl mx-auto">
				¿Tienes alguna pregunta, sugerencia o necesitas ayuda? Estamos aquí para ayudarte. 
				Envíanos un mensaje y te responderemos lo antes posible.
			</p>
		</div>

		<div class="grid lg:grid-cols-2 gap-12 items-start">
			<!-- Información de Contacto -->
			<div class="bg-white rounded-2xl shadow-lg p-8">
				<h2 class="text-2xl font-semibold text-secondary-900 mb-6">
					Información de Contacto
				</h2>
				
				<div class="space-y-6">
					<div class="flex items-start space-x-4">
						<div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
							<svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
							</svg>
						</div>
						<div>
							<h3 class="font-semibold text-secondary-900">Email</h3>
							<p class="text-secondary-600">contact@domify.app</p>
							<p class="text-sm text-secondary-500">Respondemos en menos de 24 horas</p>
						</div>
					</div>

					<div class="flex items-start space-x-4">
						<div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
							<svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
							</svg>
						</div>
						<div>
							<h3 class="font-semibold text-secondary-900">Horario de Atención</h3>
							<p class="text-secondary-600">Lunes a Viernes: 8:00 AM - 6:00 PM</p>
							<p class="text-secondary-600">Sábados: 9:00 AM - 2:00 PM</p>
							<p class="text-sm text-secondary-500">Hora de Nicaragua (GMT-6)</p>
						</div>
					</div>

					<div class="flex items-start space-x-4">
						<div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
							<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
							</svg>
						</div>
						<div>
							<h3 class="font-semibold text-secondary-900">Ubicación</h3>
							<p class="text-secondary-600">Managua, Nicaragua</p>
							<p class="text-sm text-secondary-500">Servicios disponibles en todo el país</p>
						</div>
					</div>
				</div>

				<!-- FAQ Rápido -->
				<div class="mt-8 pt-8 border-t border-secondary-200">
					<h3 class="text-lg font-semibold text-secondary-900 mb-4">
						Preguntas Frecuentes
					</h3>
					<div class="space-y-3">
						<div class="flex items-start space-x-3">
							<div class="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
							<div>
								<p class="text-sm font-medium text-secondary-900">¿Cómo funciona Domify?</p>
								<p class="text-sm text-secondary-600">Conectamos clientes con proveedores de servicios verificados en Nicaragua.</p>
							</div>
						</div>
						<div class="flex items-start space-x-3">
							<div class="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
							<div>
								<p class="text-sm font-medium text-secondary-900">¿Los proveedores están verificados?</p>
								<p class="text-sm text-secondary-600">Sí, todos nuestros proveedores pasan por un proceso de verificación.</p>
							</div>
						</div>
						<div class="flex items-start space-x-3">
							<div class="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
							<div>
								<p class="text-sm font-medium text-secondary-900">¿Cómo puedo ser proveedor?</p>
								<p class="text-sm text-secondary-600">Regístrate y completa tu perfil en la sección "Ser Proveedor".</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Formulario de Contacto -->
			<div class="bg-white rounded-2xl shadow-lg p-8">
				<h2 class="text-2xl font-semibold text-secondary-900 mb-6">
					Envíanos un Mensaje
				</h2>

				<form on:submit|preventDefault={submitContactForm} class="space-y-6">
					<!-- Nombre -->
					<div>
						<label for="name" class="block text-sm font-medium text-secondary-700 mb-2">
							Nombre Completo *
						</label>
						<input
							type="text"
							id="name"
							bind:value={contactForm.name}
							class="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
							placeholder="Tu nombre completo"
							required
						/>
					</div>

					<!-- Email -->
					<div>
						<label for="email" class="block text-sm font-medium text-secondary-700 mb-2">
							Email *
						</label>
						<input
							type="email"
							id="email"
							bind:value={contactForm.email}
							class="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
							placeholder="tu@email.com"
							required
						/>
					</div>

					<!-- Asunto -->
					<div>
						<label for="subject" class="block text-sm font-medium text-secondary-700 mb-2">
							Asunto *
						</label>
						<input
							type="text"
							id="subject"
							bind:value={contactForm.subject}
							class="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
							placeholder="¿En qué podemos ayudarte?"
							required
						/>
					</div>

					<!-- Mensaje -->
					<div>
						<label for="message" class="block text-sm font-medium text-secondary-700 mb-2">
							Mensaje *
						</label>
						<textarea
							id="message"
							bind:value={contactForm.message}
							rows="6"
							class="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
							placeholder="Describe tu consulta, problema o sugerencia..."
							required
						></textarea>
					</div>

					<!-- Botones -->
					<div class="flex gap-4">
						<button
							type="submit"
							disabled={submitting}
							class="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
						>
							{#if submitting}
								<LoadingSpinner size="sm" />
								Enviando...
							{:else}
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
								</svg>
								Enviar Mensaje
							{/if}
						</button>
						<button
							type="button"
							on:click={clearForm}
							class="px-6 py-3 border border-secondary-300 text-secondary-700 rounded-lg font-medium hover:bg-secondary-50 transition-colors duration-200"
						>
							Limpiar
						</button>
					</div>
				</form>

				<!-- Información adicional -->
				<div class="mt-6 p-4 bg-blue-50 rounded-lg">
					<div class="flex items-start space-x-3">
						<svg class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
						</svg>
						<div>
							<p class="text-sm text-blue-800">
								<strong>Respuesta rápida:</strong> Nos comprometemos a responder todos los mensajes en menos de 24 horas durante días laborables.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Sección de Categorías de Contacto -->
		<div class="mt-16">
			<h2 class="text-3xl font-bold text-secondary-900 text-center mb-8">
				¿En qué podemos ayudarte?
			</h2>
			<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each contactCategories as category}
					<div class="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
						<div class="flex items-center space-x-4">
							<div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
								<svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-2.248-.307l-3.5 2.151.643-2.818A8.003 8.003 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"></path>
								</svg>
							</div>
							<div>
								<h3 class="font-semibold text-secondary-900">{category.label}</h3>
								<p class="text-sm text-secondary-600 mt-1">
									{#if category.value === 'general'}
										Consulta general sobre nuestros servicios
									{:else if category.value === 'support'}
										Ayuda técnica y soporte al usuario
									{:else if category.value === 'business'}
										Oportunidades de asociación comercial
									{:else if category.value === 'feedback'}
										Comentarios para mejorar nuestros servicios
									{:else if category.value === 'bug'}
										Reportar problemas técnicos
									{:else if category.value === 'feature'}
										Sugerir nuevas funcionalidades
									{/if}
								</p>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div> 