<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

	let categories: any[] = [];
	let nicaraguaDepartments = [
		'Boaco',
		'Carazo',
		'Chinandega',
		'Chontales',
		'Estelí',
		'Granada',
		'Jinotega',
		'León',
		'Madriz',
		'Managua',
		'Masaya',
		'Matagalpa',
		'Nueva Segovia',
		'Río San Juan',
		'Rivas',
		'Región Autónoma de la Costa Caribe Norte (RACCN)',
		'Región Autónoma de la Costa Caribe Sur (RACCS)'
	];
	
	let formData = {
		// Información personal
		first_name: '',
		last_name: '',
		email: '',
		phone: '',
		
		// Dirección
		department: '',
		city: '',
		address: '',
		
		// Información del servicio
		headline: '',
		bio: '',
		hourly_rate: '',
		experience_years: '',
		categories: [] as number[],
		availability: {
			monday: { morning: false, afternoon: false, evening: false },
			tuesday: { morning: false, afternoon: false, evening: false },
			wednesday: { morning: false, afternoon: false, evening: false },
			thursday: { morning: false, afternoon: false, evening: false },
			friday: { morning: false, afternoon: false, evening: false },
			saturday: { morning: false, afternoon: false, evening: false },
			sunday: { morning: false, afternoon: false, evening: false }
		} as Record<string, Record<string, boolean>>
	};

	let isSubmitting = false;
	let submitMessage = '';
	let submitError = '';
	let currentStep = 1;
	const totalSteps = 4;

	onMount(async () => {
		await loadCategories();
	});

	async function loadCategories() {
		try {
			const response = await fetch('/api/categories');
			if (response.ok) {
				const result = await response.json();
				categories = result.data?.categories || [];
			}
		} catch (error) {
			console.error('Error loading categories:', error);
		}
	}

	async function handleSubmit() {
		isSubmitting = true;
		submitMessage = '';
		submitError = '';

		try {
			// Validar campos requeridos
			if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone ||
				!formData.department || !formData.city || !formData.address ||
				!formData.headline || !formData.bio || !formData.hourly_rate || 
				formData.categories.length === 0) {
				submitError = 'Por favor, completa todos los campos requeridos.';
				isSubmitting = false;
				return;
			}

			// Validar formato de email
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(formData.email)) {
				submitError = 'Por favor, ingresa un email válido.';
				isSubmitting = false;
				return;
			}

			// Preparar datos para la API
			const applicationData = {
				first_name: formData.first_name,
				last_name: formData.last_name,
				email: formData.email,
				phone: formData.phone,
				department: formData.department,
				city: formData.city,
				address: formData.address,
				headline: formData.headline,
				bio: formData.bio,
				hourly_rate: parseFloat(formData.hourly_rate),
				experience_years: parseInt(formData.experience_years) || 0,
				categories: formData.categories,
				availability: formData.availability
			};

			// Enviar la aplicación
			const response = await fetch('/api/become-provider', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(applicationData)
			});

			if (response.ok) {
				submitMessage = '¡Tu aplicación ha sido enviada exitosamente! Te contactaremos pronto para revisar tu solicitud.';
				// Limpiar formulario
				formData = {
					first_name: '',
					last_name: '',
					email: '',
					phone: '',
					department: '',
					city: '',
					address: '',
					headline: '',
					bio: '',
					hourly_rate: '',
					experience_years: '',
					categories: [],
					availability: {
						monday: { morning: false, afternoon: false, evening: false },
						tuesday: { morning: false, afternoon: false, evening: false },
						wednesday: { morning: false, afternoon: false, evening: false },
						thursday: { morning: false, afternoon: false, evening: false },
						friday: { morning: false, afternoon: false, evening: false },
						saturday: { morning: false, afternoon: false, evening: false },
						sunday: { morning: false, afternoon: false, evening: false }
					}
				};
				currentStep = 1;
			} else {
				const errorData = await response.json();
				submitError = errorData.error?.message || 'Hubo un error al enviar la aplicación. Por favor, intenta de nuevo.';
			}
		} catch (error) {
			submitError = 'Error de conexión. Por favor, intenta de nuevo.';
		} finally {
			isSubmitting = false;
		}
	}

	function toggleCategory(categoryId: number) {
		const index = formData.categories.indexOf(categoryId);
		if (index > -1) {
			formData.categories = formData.categories.filter(id => id !== categoryId);
		} else {
			formData.categories = [...formData.categories, categoryId];
		}
	}

	function toggleAvailability(day: string, time: string) {
		formData.availability[day][time] = !formData.availability[day][time];
		formData.availability = { ...formData.availability };
	}

	function markAllAvailable() {
		const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
		const times = ['morning', 'afternoon', 'evening'];
		
		days.forEach(day => {
			times.forEach(time => {
				formData.availability[day][time] = true;
			});
		});
		
		formData.availability = { ...formData.availability };
	}

	function markWeekdaysAvailable() {
		const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
		const times = ['morning', 'afternoon', 'evening'];
		
		weekdays.forEach(day => {
			times.forEach(time => {
				formData.availability[day][time] = true;
			});
		});
		
		formData.availability = { ...formData.availability };
	}

	function clearAllAvailability() {
		const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
		const times = ['morning', 'afternoon', 'evening'];
		
		days.forEach(day => {
			times.forEach(time => {
				formData.availability[day][time] = false;
			});
		});
		
		formData.availability = { ...formData.availability };
	}

	function nextStep() {
		if (currentStep < totalSteps) {
			currentStep++;
		}
	}

	function prevStep() {
		if (currentStep > 1) {
			currentStep--;
		}
	}

	function validateStep(step: number): boolean {
		switch (step) {
			case 1:
				return formData.headline?.trim().length > 0 && 
					   formData.bio?.trim().length > 0 && 
					   formData.hourly_rate?.toString().trim().length > 0;
			case 2:
				return formData.first_name?.trim().length > 0 && 
					   formData.last_name?.trim().length > 0 && 
					   formData.email?.trim().length > 0 && 
					   formData.phone?.trim().length > 0;
			case 3:
				return formData.department?.trim().length > 0 && 
					   formData.city?.trim().length > 0 && 
					   formData.address?.trim().length > 0;
			case 4:
				return formData.categories.length > 0;
			default:
				return false;
		}
	}

	// Reactive statement to update canProceed when formData changes
	$: canProceed = validateStep(currentStep);
	
	// Force reactivity on form data changes
	$: formData, (() => {
		canProceed = validateStep(currentStep);
	})();
</script>

<svelte:head>
	<title>Conviértete en Proveedor - Domify</title>
	<meta name="description" content="Regístrate como proveedor en Domify y ofrece tus servicios profesionales a miles de clientes. Únete al marketplace líder de servicios locales." />
</svelte:head>

<!-- Hero Section -->
<section class="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 min-h-screen">
	<div class="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
		<!-- Header -->
		<div class="text-center mb-12">
			<h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
				¡Únete a Domify!
			</h1>
			<p class="text-xl sm:text-2xl text-primary-100 max-w-3xl mx-auto leading-relaxed">
				Conviértete en un proveedor de servicios y gana dinero ofreciendo tus habilidades
			</p>
			
			<!-- Benefits -->
			<div class="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-12">
				<div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white">
					<div class="text-3xl mb-4">💰</div>
					<h3 class="text-lg font-semibold mb-2">Gana Dinero</h3>
					<p class="text-primary-100 text-sm">Establece tus propias tarifas y horarios</p>
				</div>
				<div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white">
					<div class="text-3xl mb-4">👥</div>
					<h3 class="text-lg font-semibold mb-2">Miles de Clientes</h3>
					<p class="text-primary-100 text-sm">Accede a una amplia base de clientes</p>
				</div>
				<div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white">
					<div class="text-3xl mb-4">🛡️</div>
					<h3 class="text-lg font-semibold mb-2">Pagos Seguros</h3>
					<p class="text-primary-100 text-sm">Sistema de pagos protegido y confiable</p>
				</div>
			</div>
		</div>

		<!-- Form Container -->
		<div class="max-w-4xl mx-auto">
			<div class="bg-white rounded-3xl shadow-2xl overflow-hidden">
				<!-- Progress Bar -->
				<div class="bg-secondary-50 px-8 py-6">
					<div class="flex items-center justify-between mb-4">
						<span class="text-sm font-medium text-secondary-600">
							Paso {currentStep} de {totalSteps}
						</span>
						<span class="text-sm font-medium text-secondary-600">
							{Math.round((currentStep / totalSteps) * 100)}% Completado
						</span>
					</div>
					<div class="w-full bg-secondary-200 rounded-full h-2">
						<div 
							class="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500 ease-out"
							style="width: {(currentStep / totalSteps) * 100}%"
						></div>
					</div>
				</div>

				<!-- Form Content -->
				<div class="p-8">
					<form on:submit|preventDefault={handleSubmit}>
						<!-- Step 1: Service Information -->
						{#if currentStep === 1}
							<div class="space-y-8">
								<div class="text-center">
									<h2 class="text-3xl font-bold text-secondary-900 mb-4">
										Información del Servicio
									</h2>
									<p class="text-secondary-600">
										Cuéntanos sobre tu servicio y experiencia
									</p>
								</div>

								<div class="space-y-6">
									<div>
										<label for="headline" class="block text-sm font-semibold text-secondary-900 mb-2">
											Título de tu servicio *
										</label>
										<input
											type="text"
											id="headline"
											bind:value={formData.headline}
											required
											placeholder="Ej: Servicios de Limpieza Profesional"
											class="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
										/>
									</div>

									<div>
										<label for="bio" class="block text-sm font-semibold text-secondary-900 mb-2">
											Descripción de tu servicio *
										</label>
										<textarea
											id="bio"
											bind:value={formData.bio}
											required
											rows="4"
											placeholder="Describe tu servicio, experiencia y lo que ofreces..."
											class="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 resize-none"
										></textarea>
									</div>

									<div class="grid md:grid-cols-2 gap-6">
										<div>
											<label for="hourly_rate" class="block text-sm font-semibold text-secondary-900 mb-2">
												Precio por hora (C$) *
											</label>
											<input
												type="number"
												id="hourly_rate"
												bind:value={formData.hourly_rate}
												required
												min="50"
												max="2000"
												step="10"
												placeholder="500"
												class="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
											/>
										</div>

										<div>
											<label for="experience_years" class="block text-sm font-semibold text-secondary-900 mb-2">
												Años de experiencia
											</label>
											<input
												type="number"
												id="experience_years"
												bind:value={formData.experience_years}
												min="0"
												max="50"
												placeholder="5"
												class="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
											/>
										</div>
									</div>
								</div>
							</div>
						{/if}

						<!-- Step 2: Personal Information -->
						{#if currentStep === 2}
							<div class="space-y-8">
								<div class="text-center">
									<h2 class="text-3xl font-bold text-secondary-900 mb-4">
										Información Personal
									</h2>
									<p class="text-secondary-600">
										Datos de contacto para que los clientes puedan encontrarte
									</p>
								</div>

								<div class="space-y-6">
									<div class="grid md:grid-cols-2 gap-6">
										<div>
											<label for="first_name" class="block text-sm font-semibold text-secondary-900 mb-2">
												Nombre *
											</label>
											<input
												type="text"
												id="first_name"
												bind:value={formData.first_name}
												required
												placeholder="Tu nombre"
												class="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
											/>
										</div>

										<div>
											<label for="last_name" class="block text-sm font-semibold text-secondary-900 mb-2">
												Apellido *
											</label>
											<input
												type="text"
												id="last_name"
												bind:value={formData.last_name}
												required
												placeholder="Tu apellido"
												class="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
											/>
										</div>
									</div>

									<div class="grid md:grid-cols-2 gap-6">
										<div>
											<label for="email" class="block text-sm font-semibold text-secondary-900 mb-2">
												Email *
											</label>
											<input
												type="email"
												id="email"
												bind:value={formData.email}
												required
												placeholder="tu@email.com"
												class="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
											/>
										</div>

										<div>
											<label for="phone" class="block text-sm font-semibold text-secondary-900 mb-2">
												Teléfono *
											</label>
											<input
												type="tel"
												id="phone"
												bind:value={formData.phone}
												required
												placeholder="+505 8888 8888"
												class="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
											/>
										</div>
									</div>
								</div>
							</div>
						{/if}

						<!-- Step 3: Location -->
						{#if currentStep === 3}
							<div class="space-y-8">
								<div class="text-center">
									<h2 class="text-3xl font-bold text-secondary-900 mb-4">
										Ubicación
									</h2>
									<p class="text-secondary-600">
										¿Dónde ofreces tus servicios?
									</p>
								</div>

								<div class="space-y-6">
									<div class="grid md:grid-cols-2 gap-6">
										<div>
											<label for="department" class="block text-sm font-semibold text-secondary-900 mb-2">
												Departamento *
											</label>
											<select
												id="department"
												bind:value={formData.department}
												required
												class="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
											>
												<option value="">Selecciona tu departamento</option>
												{#each nicaraguaDepartments as department}
													<option value={department}>{department}</option>
												{/each}
											</select>
										</div>

										<div>
											<label for="city" class="block text-sm font-semibold text-secondary-900 mb-2">
												Ciudad *
											</label>
											<input
												type="text"
												id="city"
												bind:value={formData.city}
												required
												placeholder="Tu ciudad"
												class="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
											/>
										</div>
									</div>

									<div>
										<label for="address" class="block text-sm font-semibold text-secondary-900 mb-2">
											Dirección completa *
										</label>
										<textarea
											id="address"
											bind:value={formData.address}
											required
											rows="3"
											placeholder="Dirección exacta: barrio, calle, número de casa, puntos de referencia..."
											class="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 resize-none"
										></textarea>
									</div>
								</div>
							</div>
						{/if}

						<!-- Step 4: Categories & Availability -->
						{#if currentStep === 4}
							<div class="space-y-8">
								<div class="text-center">
									<h2 class="text-3xl font-bold text-secondary-900 mb-4">
										Categorías y Disponibilidad
									</h2>
									<p class="text-secondary-600">
										Selecciona tus servicios y horarios disponibles
									</p>
								</div>

								<!-- Categories -->
								<div class="space-y-6">
									<div>
										<h3 class="text-lg font-semibold text-secondary-900 mb-4">
											Categorías de Servicio *
										</h3>
										
										{#if categories.length === 0}
											<div class="flex justify-center py-8">
												<LoadingSpinner size="lg" text="Cargando categorías..." />
											</div>
										{:else}
											<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
												{#each categories as category}
													<label class="relative">
														<input
															type="checkbox"
															checked={formData.categories.includes(category.id)}
															on:change={() => toggleCategory(category.id)}
															class="sr-only"
														/>
														<div 
															class="p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md"
															class:border-primary-500={formData.categories.includes(category.id)}
															class:bg-primary-50={formData.categories.includes(category.id)}
															class:border-secondary-300={!formData.categories.includes(category.id)}
															class:bg-white={!formData.categories.includes(category.id)}
														>
															<div class="flex items-center space-x-3">
																<div 
																	class="w-5 h-5 rounded border-2 flex items-center justify-center"
																	class:border-primary-500={formData.categories.includes(category.id)}
																	class:bg-primary-500={formData.categories.includes(category.id)}
																	class:border-secondary-300={!formData.categories.includes(category.id)}
																>
																	{#if formData.categories.includes(category.id)}
																		<svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
																			<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
																		</svg>
																	{/if}
																</div>
																<div>
																	<div class="font-semibold text-secondary-900">{category.name}</div>
																	{#if category.description}
																		<div class="text-sm text-secondary-600">{category.description}</div>
																	{/if}
																</div>
															</div>
														</div>
													</label>
												{/each}
											</div>
										{/if}
									</div>

									<!-- Availability -->
									<div>
										<h3 class="text-lg font-semibold text-secondary-900 mb-4">
											Disponibilidad
										</h3>
										
										<div class="flex flex-wrap gap-3 mb-6">
											<button 
												type="button" 
												on:click={markAllAvailable}
												class="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-200 transition-colors duration-200"
											>
												📅 Todos los días
											</button>
											<button 
												type="button" 
												on:click={markWeekdaysAvailable}
												class="px-4 py-2 bg-secondary-100 text-secondary-700 rounded-lg text-sm font-medium hover:bg-secondary-200 transition-colors duration-200"
											>
												💼 Solo laborables
											</button>
											<button 
												type="button" 
												on:click={clearAllAvailability}
												class="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors duration-200"
											>
												🗑️ Limpiar todo
											</button>
										</div>
										
										<div class="bg-secondary-50 rounded-xl p-6">
											<div class="grid grid-cols-4 gap-4 mb-4">
												<div class="font-semibold text-secondary-900">Día</div>
												<div class="text-center">
													<div class="font-semibold text-secondary-900">Mañana</div>
													<div class="text-xs text-secondary-600">7:00 - 12:00</div>
												</div>
												<div class="text-center">
													<div class="font-semibold text-secondary-900">Tarde</div>
													<div class="text-xs text-secondary-600">12:00 - 17:00</div>
												</div>
												<div class="text-center">
													<div class="font-semibold text-secondary-900">Noche</div>
													<div class="text-xs text-secondary-600">17:00 - 21:00</div>
												</div>
											</div>
											
											{#each Object.entries(formData.availability) as [day, times]}
												<div class="grid grid-cols-4 gap-4 py-3 border-t border-secondary-200">
													<div class="font-medium text-secondary-900">
														{day === 'monday' ? 'Lunes' : 
														day === 'tuesday' ? 'Martes' : 
														day === 'wednesday' ? 'Miércoles' : 
														day === 'thursday' ? 'Jueves' : 
														day === 'friday' ? 'Viernes' : 
														day === 'saturday' ? 'Sábado' : 'Domingo'}
													</div>
													{#each Object.entries(times) as [time, available]}
														<div class="flex justify-center">
															<label class="relative">
																<input
																	type="checkbox"
																	checked={available}
																	on:change={() => toggleAvailability(day, time)}
																	class="sr-only"
																/>
																<div 
																	class="w-6 h-6 rounded border-2 cursor-pointer transition-all duration-200"
																	class:border-primary-500={available}
																	class:bg-primary-500={available}
																	class:border-secondary-300={!available}
																>
																	{#if available}
																		<svg class="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
																			<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
																		</svg>
																	{/if}
																</div>
															</label>
														</div>
													{/each}
												</div>
											{/each}
										</div>
									</div>
								</div>
							</div>
						{/if}

						<!-- Navigation Buttons -->
						<div class="flex justify-between items-center pt-8 border-t border-secondary-200">
							<button
								type="button"
								on:click={prevStep}
								disabled={currentStep === 1}
								class="px-6 py-3 border border-secondary-300 text-secondary-700 rounded-xl font-semibold hover:bg-secondary-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								← Anterior
							</button>

							{#if currentStep < totalSteps}
								<button
									type="button"
									on:click={nextStep}
									disabled={!canProceed}
									class="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Siguiente →
								</button>

							{:else}
								<button
									type="submit"
									disabled={isSubmitting || !canProceed}
									class="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
								>
									{#if isSubmitting}
										<LoadingSpinner size="sm" color="white" />
										<span>Enviando...</span>
									{:else}
										<span>Enviar Aplicación</span>
									{/if}
								</button>
							{/if}
						</div>
					</form>
				</div>
			</div>
		</div>

		<!-- Messages -->
		{#if submitMessage}
			<div class="max-w-4xl mx-auto mt-8">
				<div class="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
					<div class="text-green-600 text-4xl mb-4">✅</div>
					<p class="text-green-800 font-semibold text-lg">{submitMessage}</p>
				</div>
			</div>
		{/if}

		{#if submitError}
			<div class="max-w-4xl mx-auto mt-8">
				<div class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
					<div class="text-red-600 text-4xl mb-4">❌</div>
					<p class="text-red-800 font-semibold text-lg">{submitError}</p>
				</div>
			</div>
		{/if}
	</div>
</section> 