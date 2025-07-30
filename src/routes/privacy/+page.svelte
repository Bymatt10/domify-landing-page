<script lang="ts">
	import { onMount } from 'svelte';
	
	// Fecha de última actualización
	const lastUpdated = '15 de Diciembre, 2024';
	
	onMount(() => {
		// Scroll suave para enlaces internos
		const links = document.querySelectorAll('a[href^="#"]');
		links.forEach(link => {
			link.addEventListener('click', (e) => {
				e.preventDefault();
				const target = document.querySelector(link.getAttribute('href') || '');
				if (target) {
					target.scrollIntoView({ behavior: 'smooth' });
				}
			});
		});
	});
</script>

<svelte:head>
	<title>Política de Privacidad - Domify</title>
	<meta name="description" content="Política de Privacidad de Domify. Conoce cómo protegemos y utilizamos tu información personal de manera segura y transparente." />
</svelte:head>

<!-- Hero Section -->
<section class="relative bg-gradient-to-br from-primary-50 via-white to-primary-100 overflow-hidden">
	<!-- Background Pattern -->
	<div class="absolute inset-0 opacity-5">
		<div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgb(59 130 246) 1px, transparent 0); background-size: 20px 20px;"></div>
	</div>
	
	<div class="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
		<div class="text-center">
			<h1 class="text-4xl sm:text-5xl font-bold text-secondary-900 mb-6">
				Política de 
				<span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800">
					Privacidad
				</span>
			</h1>
			<p class="text-xl text-secondary-600 max-w-3xl mx-auto mb-8">
				Tu privacidad es importante para nosotros. Esta política describe cómo recopilamos, 
				utilizamos y protegemos tu información personal cuando utilizas nuestra plataforma de servicios.
			</p>
			<div class="bg-white rounded-xl p-4 shadow-lg inline-block">
				<p class="text-sm text-secondary-500">
					Última actualización: <span class="font-semibold text-primary-600">{lastUpdated}</span>
				</p>
			</div>
		</div>
	</div>
</section>

<!-- Navegación rápida -->
<section class="py-8 bg-white border-b">
	<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex flex-wrap gap-4 justify-center">
			<a href="#informacion-recolectada" class="text-primary-600 hover:text-primary-700 font-medium transition-colors">
				Información Recolectada
			</a>
			<a href="#uso-informacion" class="text-primary-600 hover:text-primary-700 font-medium transition-colors">
				Uso de la Información
			</a>
			<a href="#compartir-informacion" class="text-primary-600 hover:text-primary-700 font-medium transition-colors">
				Compartir Información
			</a>
			<a href="#seguridad" class="text-primary-600 hover:text-primary-700 font-medium transition-colors">
				Seguridad
			</a>
			<a href="#tus-derechos" class="text-primary-600 hover:text-primary-700 font-medium transition-colors">
				Tus Derechos
			</a>
			<a href="#contacto" class="text-primary-600 hover:text-primary-700 font-medium transition-colors">
				Contacto
			</a>
		</div>
	</div>
</section>

<!-- Contenido principal -->
<section class="py-16 bg-white">
	<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="prose prose-lg max-w-none">
			
			<!-- Introducción -->
			<div class="mb-12">
				<h2 class="text-2xl font-bold text-secondary-900 mb-4">Introducción</h2>
				<p class="text-secondary-700 leading-relaxed mb-4">
					En <strong>Domify</strong> ("nosotros", "nuestra", "nos"), nos comprometemos a proteger tu privacidad. 
					Esta Política de Privacidad explica cómo recopilamos, utilizamos, divulgamos y protegemos tu información 
					personal cuando utilizas nuestra plataforma de servicios.
				</p>
				<p class="text-secondary-700 leading-relaxed">
					Al utilizar Domify, aceptas las prácticas descritas en esta política. Si no estás de acuerdo con 
					estas prácticas, por favor no utilices nuestros servicios.
				</p>
			</div>

			<!-- Información que recopilamos -->
			<div id="informacion-recolectada" class="mb-12">
				<h2 class="text-2xl font-bold text-secondary-900 mb-6">Información que Recolectamos</h2>
				
				<div class="bg-secondary-50 rounded-xl p-6 mb-6">
					<h3 class="text-xl font-semibold text-secondary-900 mb-4">Información Personal</h3>
					<ul class="space-y-2 text-secondary-700">
						<li class="flex items-start">
							<span class="text-primary-600 mr-2">•</span>
							<span><strong>Información de cuenta:</strong> Nombre, dirección de correo electrónico, número de teléfono, dirección postal</span>
						</li>
						<li class="flex items-start">
							<span class="text-primary-600 mr-2">•</span>
							<span><strong>Información de perfil:</strong> Foto de perfil, descripción, especialidades (para proveedores)</span>
						</li>
						<li class="flex items-start">
							<span class="text-primary-600 mr-2">•</span>
							<span><strong>Información de pago:</strong> Datos de tarjeta de crédito, información bancaria (procesada de forma segura)</span>
						</li>
						<li class="flex items-start">
							<span class="text-primary-600 mr-2">•</span>
							<span><strong>Documentos de verificación:</strong> Identificación, certificados profesionales, seguros</span>
						</li>
					</ul>
				</div>

				<div class="bg-secondary-50 rounded-xl p-6 mb-6">
					<h3 class="text-xl font-semibold text-secondary-900 mb-4">Información de Uso</h3>
					<ul class="space-y-2 text-secondary-700">
						<li class="flex items-start">
							<span class="text-primary-600 mr-2">•</span>
							<span><strong>Datos de navegación:</strong> Páginas visitadas, tiempo de permanencia, enlaces clickeados</span>
						</li>
						<li class="flex items-start">
							<span class="text-primary-600 mr-2">•</span>
							<span><strong>Información del dispositivo:</strong> Tipo de dispositivo, sistema operativo, navegador, dirección IP</span>
						</li>
						<li class="flex items-start">
							<span class="text-primary-600 mr-2">•</span>
							<span><strong>Ubicación:</strong> Información de ubicación aproximada (con tu consentimiento)</span>
						</li>
						<li class="flex items-start">
							<span class="text-primary-600 mr-2">•</span>
							<span><strong>Cookies y tecnologías similares:</strong> Para mejorar tu experiencia y analizar el uso</span>
						</li>
					</ul>
				</div>

				<div class="bg-secondary-50 rounded-xl p-6">
					<h3 class="text-xl font-semibold text-secondary-900 mb-4">Información de Servicios</h3>
					<ul class="space-y-2 text-secondary-700">
						<li class="flex items-start">
							<span class="text-primary-600 mr-2">•</span>
							<span><strong>Reseñas y calificaciones:</strong> Opiniones sobre servicios recibidos o prestados</span>
						</li>
						<li class="flex items-start">
							<span class="text-primary-600 mr-2">•</span>
							<span><strong>Mensajes:</strong> Comunicaciones entre clientes y proveedores</span>
						</li>
						<li class="flex items-start">
							<span class="text-primary-600 mr-2">•</span>
							<span><strong>Historial de servicios:</strong> Servicios solicitados, completados y cancelados</span>
						</li>
					</ul>
				</div>
			</div>

			<!-- Cómo utilizamos la información -->
			<div id="uso-informacion" class="mb-12">
				<h2 class="text-2xl font-bold text-secondary-900 mb-6">Cómo Utilizamos tu Información</h2>
				
				<div class="grid md:grid-cols-2 gap-6">
					<div class="bg-primary-50 rounded-xl p-6">
						<h3 class="text-xl font-semibold text-primary-900 mb-4">Para Proporcionar Servicios</h3>
						<ul class="space-y-2 text-primary-800">
							<li>• Conectar clientes con proveedores</li>
							<li>• Facilitar pagos y transacciones</li>
							<li>• Procesar reservas y citas</li>
							<li>• Enviar confirmaciones y actualizaciones</li>
						</ul>
					</div>
					
					<div class="bg-green-50 rounded-xl p-6">
						<h3 class="text-xl font-semibold text-green-900 mb-4">Para Mejorar la Plataforma</h3>
						<ul class="space-y-2 text-green-800">
							<li>• Analizar patrones de uso</li>
							<li>• Desarrollar nuevas funcionalidades</li>
							<li>• Optimizar la experiencia del usuario</li>
							<li>• Detectar y prevenir fraudes</li>
						</ul>
					</div>
					
					<div class="bg-blue-50 rounded-xl p-6">
						<h3 class="text-xl font-semibold text-blue-900 mb-4">Para Comunicación</h3>
						<ul class="space-y-2 text-blue-800">
							<li>• Enviar notificaciones importantes</li>
							<li>• Responder consultas y soporte</li>
							<li>• Enviar actualizaciones de servicios</li>
							<li>• Marketing (con tu consentimiento)</li>
						</ul>
					</div>
					
					<div class="bg-purple-50 rounded-xl p-6">
						<h3 class="text-xl font-semibold text-purple-900 mb-4">Para Seguridad y Cumplimiento</h3>
						<ul class="space-y-2 text-purple-800">
							<li>• Verificar identidades</li>
							<li>• Prevenir actividades fraudulentas</li>
							<li>• Cumplir con obligaciones legales</li>
							<li>• Resolver disputas</li>
						</ul>
					</div>
				</div>
			</div>

			<!-- Compartir información -->
			<div id="compartir-informacion" class="mb-12">
				<h2 class="text-2xl font-bold text-secondary-900 mb-6">Cuándo Compartimos tu Información</h2>
				
				<div class="space-y-6">
					<div class="border-l-4 border-primary-500 pl-6">
						<h3 class="text-xl font-semibold text-secondary-900 mb-3">Con tu Consentimiento</h3>
						<p class="text-secondary-700">
							Solo compartimos tu información personal con terceros cuando nos das tu consentimiento explícito 
							o cuando es necesario para proporcionar los servicios que solicitas.
						</p>
					</div>
					
					<div class="border-l-4 border-green-500 pl-6">
						<h3 class="text-xl font-semibold text-secondary-900 mb-3">Proveedores de Servicios</h3>
						<p class="text-secondary-700">
							Trabajamos con proveedores de servicios confiables que nos ayudan a operar nuestra plataforma, 
							como procesadores de pago, servicios de hosting y análisis.
						</p>
					</div>
					
					<div class="border-l-4 border-blue-500 pl-6">
						<h3 class="text-xl font-semibold text-secondary-900 mb-3">Cumplimiento Legal</h3>
						<p class="text-secondary-700">
							Podemos divulgar información cuando sea requerido por ley, orden judicial o proceso legal, 
							o para proteger nuestros derechos, propiedad o seguridad.
						</p>
					</div>
					
					<div class="border-l-4 border-orange-500 pl-6">
						<h3 class="text-xl font-semibold text-secondary-900 mb-3">Información Pública</h3>
						<p class="text-secondary-700">
							Algunas partes de tu perfil (nombre, especialidades, calificaciones) pueden ser visibles 
							públicamente para ayudar a otros usuarios a encontrar servicios.
						</p>
					</div>
				</div>
			</div>

			<!-- Seguridad -->
			<div id="seguridad" class="mb-12">
				<h2 class="text-2xl font-bold text-secondary-900 mb-6">Protección de tu Información</h2>
				
				<div class="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-8">
					<div class="grid md:grid-cols-2 gap-8">
						<div>
							<h3 class="text-xl font-semibold text-secondary-900 mb-4">Medidas de Seguridad</h3>
							<ul class="space-y-3 text-secondary-700">
								<li class="flex items-start">
									<svg class="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
									</svg>
									<span>Encriptación SSL/TLS para todas las transmisiones</span>
								</li>
								<li class="flex items-start">
									<svg class="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
									</svg>
									<span>Almacenamiento seguro en servidores protegidos</span>
								</li>
								<li class="flex items-start">
									<svg class="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
									</svg>
									<span>Acceso restringido a datos personales</span>
								</li>
								<li class="flex items-start">
									<svg class="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
									</svg>
									<span>Monitoreo continuo de seguridad</span>
								</li>
							</ul>
						</div>
						
						<div>
							<h3 class="text-xl font-semibold text-secondary-900 mb-4">Tu Responsabilidad</h3>
							<ul class="space-y-3 text-secondary-700">
								<li class="flex items-start">
									<svg class="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
									</svg>
									<span>Mantén tu contraseña segura y confidencial</span>
								</li>
								<li class="flex items-start">
									<svg class="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
									</svg>
									<span>No compartas tu información de acceso</span>
								</li>
								<li class="flex items-start">
									<svg class="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
									</svg>
									<span>Reporta cualquier actividad sospechosa</span>
								</li>
								<li class="flex items-start">
									<svg class="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
									</svg>
									<span>Cierra sesión en dispositivos compartidos</span>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>

			<!-- Tus derechos -->
			<div id="tus-derechos" class="mb-12">
				<h2 class="text-2xl font-bold text-secondary-900 mb-6">Tus Derechos de Privacidad</h2>
				
				<div class="grid md:grid-cols-2 gap-6">
					<div class="bg-yellow-50 rounded-xl p-6">
						<h3 class="text-xl font-semibold text-yellow-900 mb-4">Acceso y Control</h3>
						<ul class="space-y-2 text-yellow-800">
							<li>• Ver y actualizar tu información personal</li>
							<li>• Descargar una copia de tus datos</li>
							<li>• Corregir información inexacta</li>
							<li>• Eliminar tu cuenta y datos</li>
						</ul>
					</div>
					
					<div class="bg-purple-50 rounded-xl p-6">
						<h3 class="text-xl font-semibold text-purple-900 mb-4">Preferencias de Comunicación</h3>
						<ul class="space-y-2 text-purple-800">
							<li>• Gestionar notificaciones por email</li>
							<li>• Controlar mensajes promocionales</li>
							<li>• Configurar preferencias de privacidad</li>
							<li>• Revocar consentimientos</li>
						</ul>
					</div>
				</div>
				
				<div class="mt-6 bg-secondary-50 rounded-xl p-6">
					<h3 class="text-xl font-semibold text-secondary-900 mb-4">Ejercer tus Derechos</h3>
					<p class="text-secondary-700 mb-4">
						Para ejercer cualquiera de estos derechos, puedes:
					</p>
					<ul class="space-y-2 text-secondary-700">
						<li>• Usar las configuraciones de tu cuenta</li>
						<li>• Contactarnos directamente a través de nuestro formulario de contacto</li>
						<li>• Enviar un email a <a href="mailto:privacy@domify.com" class="text-primary-600 hover:text-primary-700">privacy@domify.com</a></li>
					</ul>
				</div>
			</div>

			<!-- Cookies -->
			<div class="mb-12">
				<h2 class="text-2xl font-bold text-secondary-900 mb-6">Cookies y Tecnologías Similares</h2>
				
				<div class="bg-secondary-50 rounded-xl p-6">
					<p class="text-secondary-700 mb-4">
						Utilizamos cookies y tecnologías similares para mejorar tu experiencia, analizar el uso de la plataforma 
						y personalizar el contenido. Puedes controlar el uso de cookies a través de la configuración de tu navegador.
					</p>
					
					<div class="grid md:grid-cols-3 gap-4 mt-6">
						<div class="bg-white rounded-lg p-4">
							<h4 class="font-semibold text-secondary-900 mb-2">Cookies Esenciales</h4>
							<p class="text-sm text-secondary-600">Necesarias para el funcionamiento básico de la plataforma</p>
						</div>
						<div class="bg-white rounded-lg p-4">
							<h4 class="font-semibold text-secondary-900 mb-2">Cookies de Rendimiento</h4>
							<p class="text-sm text-secondary-600">Nos ayudan a entender cómo utilizas la plataforma</p>
						</div>
						<div class="bg-white rounded-lg p-4">
							<h4 class="font-semibold text-secondary-900 mb-2">Cookies de Funcionalidad</h4>
							<p class="text-sm text-secondary-600">Mejoran la funcionalidad y personalización</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Cambios a la política -->
			<div class="mb-12">
				<h2 class="text-2xl font-bold text-secondary-900 mb-6">Cambios a esta Política</h2>
				
				<div class="bg-orange-50 rounded-xl p-6">
					<p class="text-secondary-700 mb-4">
						Podemos actualizar esta Política de Privacidad ocasionalmente. Te notificaremos sobre cualquier cambio 
						significativo a través de:
					</p>
					<ul class="space-y-2 text-secondary-700">
						<li>• Notificación en la plataforma</li>
						<li>• Email a tu dirección registrada</li>
						<li>• Actualización de la fecha en esta página</li>
					</ul>
					<p class="text-secondary-700 mt-4">
						Te recomendamos revisar esta política periódicamente para mantenerte informado sobre cómo protegemos tu información.
					</p>
				</div>
			</div>

			<!-- Contacto -->
			<div id="contacto" class="mb-12">
				<h2 class="text-2xl font-bold text-secondary-900 mb-6">Contacto</h2>
				
				<div class="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-8">
					<p class="text-secondary-700 mb-6">
						Si tienes preguntas sobre esta Política de Privacidad o nuestras prácticas de privacidad, 
						no dudes en contactarnos:
					</p>
					
					<div class="grid md:grid-cols-2 gap-6">
						<div>
							<h3 class="text-xl font-semibold text-secondary-900 mb-4">Información de Contacto</h3>
							<div class="space-y-3 text-secondary-700">
								<div class="flex items-center">
									<svg class="w-5 h-5 text-primary-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
									</svg>
									<a href="mailto:privacy@domify.com" class="text-primary-600 hover:text-primary-700">privacy@domify.com</a>
								</div>
								<div class="flex items-center">
									<svg class="w-5 h-5 text-primary-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
									</svg>
									<a href="/contact" class="text-primary-600 hover:text-primary-700">Formulario de Contacto</a>
								</div>
							</div>
						</div>
						
						<div>
							<h3 class="text-xl font-semibold text-secondary-900 mb-4">Horarios de Atención</h3>
							<div class="space-y-2 text-secondary-700">
								<p>Lunes a Viernes: 9:00 AM - 6:00 PM</p>
								<p>Sábados: 9:00 AM - 2:00 PM</p>
								<p class="text-sm text-secondary-600">Respuesta en 24-48 horas</p>
							</div>
						</div>
					</div>
				</div>
			</div>

		</div>
	</div>
</section>

<!-- CTA -->
<section class="py-16 bg-gradient-to-br from-primary-600 to-primary-800">
	<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
		<h2 class="text-3xl font-bold text-white mb-6">
			¿Tienes preguntas sobre privacidad?
		</h2>
		<p class="text-xl text-primary-100 mb-8">
			Estamos aquí para ayudarte y proteger tu información personal
		</p>
		<div class="flex flex-col sm:flex-row gap-4 justify-center">
			<a href="/contact" class="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold hover:bg-primary-50 transition-colors duration-200 shadow-lg hover:shadow-xl">
				Contactar Soporte
			</a>
			<a href="/terms" class="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-primary-600 transition-colors duration-200">
				Ver Términos de Servicio
			</a>
		</div>
	</div>
</section> 