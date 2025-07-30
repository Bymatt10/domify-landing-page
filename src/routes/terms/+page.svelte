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
	<title>Términos de Servicio - Domify</title>
	<meta name="description" content="Términos de Servicio de Domify. Conoce las condiciones y reglas que rigen el uso de nuestra plataforma de servicios." />
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
				Términos de 
				<span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800">
					Servicio
				</span>
			</h1>
			<p class="text-xl text-secondary-600 max-w-3xl mx-auto mb-8">
				Estos términos establecen las reglas y condiciones para el uso de Domify, 
				nuestra plataforma que conecta clientes con proveedores de servicios.
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
			<a href="#aceptacion-terminos" class="text-primary-600 hover:text-primary-700 font-medium transition-colors">
				Aceptación
			</a>
			<a href="#descripcion-servicios" class="text-primary-600 hover:text-primary-700 font-medium transition-colors">
				Servicios
			</a>
			<a href="#cuentas-usuarios" class="text-primary-600 hover:text-primary-700 font-medium transition-colors">
				Cuentas
			</a>
			<a href="#conducta-usuarios" class="text-primary-600 hover:text-primary-700 font-medium transition-colors">
				Conducta
			</a>
			<a href="#pagos-facturacion" class="text-primary-600 hover:text-primary-700 font-medium transition-colors">
				Pagos
			</a>
			<a href="#limitaciones" class="text-primary-600 hover:text-primary-700 font-medium transition-colors">
				Limitaciones
			</a>
			<a href="#terminacion" class="text-primary-600 hover:text-primary-700 font-medium transition-colors">
				Terminación
			</a>
		</div>
	</div>
</section>

<!-- Contenido principal -->
<section class="py-16 bg-white">
	<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="prose prose-lg max-w-none">
			
			<!-- Aceptación de términos -->
			<div id="aceptacion-terminos" class="mb-12">
				<h2 class="text-2xl font-bold text-secondary-900 mb-6">1. Aceptación de los Términos</h2>
				
				<div class="bg-secondary-50 rounded-xl p-6">
					<p class="text-secondary-700 leading-relaxed mb-4">
						Al acceder y utilizar <strong>Domify</strong> ("la Plataforma"), aceptas estar sujeto a estos Términos de Servicio 
						("Términos"). Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestros servicios.
					</p>
					<p class="text-secondary-700 leading-relaxed">
						Estos términos constituyen un acuerdo legal entre tú y Domify. Te recomendamos leerlos cuidadosamente 
						antes de utilizar la plataforma.
					</p>
				</div>
			</div>

			<!-- Descripción de servicios -->
			<div id="descripcion-servicios" class="mb-12">
				<h2 class="text-2xl font-bold text-secondary-900 mb-6">2. Descripción de los Servicios</h2>
				
				<div class="grid md:grid-cols-2 gap-6">
					<div class="bg-primary-50 rounded-xl p-6">
						<h3 class="text-xl font-semibold text-primary-900 mb-4">Para Clientes</h3>
						<ul class="space-y-2 text-primary-800">
							<li>• Buscar y comparar proveedores de servicios</li>
							<li>• Leer reseñas y calificaciones</li>
							<li>• Contactar proveedores directamente</li>
							<li>• Programar citas y reservas</li>
							<li>• Realizar pagos seguros</li>
							<li>• Calificar servicios recibidos</li>
						</ul>
					</div>
					
					<div class="bg-green-50 rounded-xl p-6">
						<h3 class="text-xl font-semibold text-green-900 mb-4">Para Proveedores</h3>
						<ul class="space-y-2 text-green-800">
							<li>• Crear y gestionar perfiles profesionales</li>
							<li>• Recibir solicitudes de servicios</li>
							<li>• Comunicarse con clientes</li>
							<li>• Gestionar agenda y disponibilidad</li>
							<li>• Recibir pagos por servicios</li>
							<li>• Construir reputación en línea</li>
						</ul>
					</div>
				</div>
				
				<div class="mt-6 bg-blue-50 rounded-xl p-6">
					<h3 class="text-xl font-semibold text-blue-900 mb-4">Nuestro Rol</h3>
					<p class="text-blue-800 leading-relaxed">
						Domify actúa como una plataforma intermediaria que conecta clientes con proveedores de servicios. 
						No somos proveedores directos de servicios, sino que facilitamos la conexión entre ambas partes. 
						Los servicios reales son proporcionados por proveedores independientes.
					</p>
				</div>
			</div>

			<!-- Cuentas de usuario -->
			<div id="cuentas-usuarios" class="mb-12">
				<h2 class="text-2xl font-bold text-secondary-900 mb-6">3. Cuentas de Usuario</h2>
				
				<div class="space-y-6">
					<div class="bg-secondary-50 rounded-xl p-6">
						<h3 class="text-xl font-semibold text-secondary-900 mb-4">Registro y Verificación</h3>
						<ul class="space-y-2 text-secondary-700">
							<li class="flex items-start">
								<span class="text-primary-600 mr-2">•</span>
								<span>Debes proporcionar información precisa y completa al registrarte</span>
							</li>
							<li class="flex items-start">
								<span class="text-primary-600 mr-2">•</span>
								<span>Eres responsable de mantener la confidencialidad de tu cuenta</span>
							</li>
							<li class="flex items-start">
								<span class="text-primary-600 mr-2">•</span>
								<span>Los proveedores deben completar el proceso de verificación</span>
							</li>
							<li class="flex items-start">
								<span class="text-primary-600 mr-2">•</span>
								<span>Una cuenta por persona - no se permiten cuentas múltiples</span>
							</li>
						</ul>
					</div>
					
					<div class="bg-yellow-50 rounded-xl p-6">
						<h3 class="text-xl font-semibold text-yellow-900 mb-4">Responsabilidades de la Cuenta</h3>
						<ul class="space-y-2 text-yellow-800">
							<li>• Mantener tu información de contacto actualizada</li>
							<li>• Notificar inmediatamente cualquier uso no autorizado</li>
							<li>• No compartir credenciales de acceso</li>
							<li>• Cerrar sesión en dispositivos compartidos</li>
						</ul>
					</div>
					
					<div class="bg-red-50 rounded-xl p-6">
						<h3 class="text-xl font-semibold text-red-900 mb-4">Prohibiciones</h3>
						<ul class="space-y-2 text-red-800">
							<li>• Crear cuentas falsas o impersonar a otros</li>
							<li>• Usar la cuenta de otra persona</li>
							<li>• Intentar acceder a cuentas de otros usuarios</li>
							<li>• Vender o transferir tu cuenta</li>
						</ul>
					</div>
				</div>
			</div>

			<!-- Conducta de usuarios -->
			<div id="conducta-usuarios" class="mb-12">
				<h2 class="text-2xl font-bold text-secondary-900 mb-6">4. Conducta de los Usuarios</h2>
				
				<div class="grid md:grid-cols-2 gap-6">
					<div class="bg-green-50 rounded-xl p-6">
						<h3 class="text-xl font-semibold text-green-900 mb-4">Comportamiento Esperado</h3>
						<ul class="space-y-2 text-green-800">
							<li>• Ser respetuoso y profesional</li>
							<li>• Proporcionar información precisa</li>
							<li>• Cumplir con acuerdos y citas</li>
							<li>• Comunicarse de manera clara</li>
							<li>• Respetar la privacidad de otros</li>
							<li>• Reportar problemas o abusos</li>
						</ul>
					</div>
					
					<div class="bg-red-50 rounded-xl p-6">
						<h3 class="text-xl font-semibold text-red-900 mb-4">Comportamiento Prohibido</h3>
						<ul class="space-y-2 text-red-800">
							<li>• Acoso, discriminación o intimidación</li>
							<li>• Información falsa o engañosa</li>
							<li>• Spam o mensajes no solicitados</li>
							<li>• Actividades ilegales o fraudulentas</li>
							<li>• Interferir con el funcionamiento</li>
							<li>• Violar derechos de propiedad intelectual</li>
						</ul>
					</div>
				</div>
				
				<div class="mt-6 bg-orange-50 rounded-xl p-6">
					<h3 class="text-xl font-semibold text-orange-900 mb-4">Consecuencias</h3>
					<p class="text-orange-800 leading-relaxed">
						La violación de estas reglas puede resultar en advertencias, suspensión temporal o permanente de tu cuenta, 
						y en casos graves, acciones legales. Nos reservamos el derecho de tomar las medidas que consideremos 
						apropiadas para mantener la integridad de la plataforma.
					</p>
				</div>
			</div>

			<!-- Pagos y facturación -->
			<div id="pagos-facturacion" class="mb-12">
				<h2 class="text-2xl font-bold text-secondary-900 mb-6">5. Pagos y Facturación</h2>
				
				<div class="space-y-6">
					<div class="bg-blue-50 rounded-xl p-6">
						<h3 class="text-xl font-semibold text-blue-900 mb-4">Comisiones y Tarifas</h3>
						<div class="grid md:grid-cols-2 gap-4">
							<div>
								<h4 class="font-semibold text-blue-800 mb-2">Para Clientes</h4>
								<ul class="text-blue-700 space-y-1">
									<li>• Sin costo por registro</li>
									<li>• Sin costo por búsqueda</li>
									<li>• Tarifas de servicio según el proveedor</li>
								</ul>
							</div>
							<div>
								<h4 class="font-semibold text-blue-800 mb-2">Para Proveedores</h4>
								<ul class="text-blue-700 space-y-1">
									<li>• Comisión del 15% por servicio completado</li>
									<li>• Sin costo por registro básico</li>
									<li>• Tarifas opcionales por servicios premium</li>
								</ul>
							</div>
						</div>
					</div>
					
					<div class="bg-green-50 rounded-xl p-6">
						<h3 class="text-xl font-semibold text-green-900 mb-4">Procesamiento de Pagos</h3>
						<ul class="space-y-2 text-green-800">
							<li>• Utilizamos procesadores de pago seguros y certificados</li>
							<li>• Los pagos se procesan al completar el servicio</li>
							<li>• Reembolsos según nuestra política de garantía</li>
							<li>• Facturación automática para servicios recurrentes</li>
						</ul>
					</div>
					
					<div class="bg-purple-50 rounded-xl p-6">
						<h3 class="text-xl font-semibold text-purple-900 mb-4">Política de Reembolsos</h3>
						<div class="space-y-3 text-purple-800">
							<div>
								<h4 class="font-semibold">Reembolso Completo (100%)</h4>
								<p class="text-sm">Si el servicio no se realiza o es significativamente diferente al acordado</p>
							</div>
							<div>
								<h4 class="font-semibold">Reembolso Parcial (50%)</h4>
								<p class="text-sm">Si el servicio se realiza parcialmente o con calidad inferior</p>
							</div>
							<div>
								<h4 class="font-semibold">Sin Reembolso</h4>
								<p class="text-sm">Cancelaciones con menos de 24 horas de anticipación</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Limitaciones de responsabilidad -->
			<div id="limitaciones" class="mb-12">
				<h2 class="text-2xl font-bold text-secondary-900 mb-6">6. Limitaciones de Responsabilidad</h2>
				
				<div class="space-y-6">
					<div class="bg-secondary-50 rounded-xl p-6">
						<h3 class="text-xl font-semibold text-secondary-900 mb-4">Alcance de Nuestros Servicios</h3>
						<p class="text-secondary-700 leading-relaxed">
							Domify actúa únicamente como intermediario. No somos responsables por:
						</p>
						<ul class="space-y-2 text-secondary-700 mt-4">
							<li class="flex items-start">
								<span class="text-red-600 mr-2">•</span>
								<span>La calidad o resultado de los servicios prestados por proveedores</span>
							</li>
							<li class="flex items-start">
								<span class="text-red-600 mr-2">•</span>
								<span>Disputas entre clientes y proveedores</span>
							</li>
							<li class="flex items-start">
								<span class="text-red-600 mr-2">•</span>
								<span>Daños o pérdidas durante la prestación de servicios</span>
							</li>
							<li class="flex items-start">
								<span class="text-red-600 mr-2">•</span>
								<span>Incumplimiento de acuerdos entre usuarios</span>
							</li>
						</ul>
					</div>
					
					<div class="bg-yellow-50 rounded-xl p-6">
						<h3 class="text-xl font-semibold text-yellow-900 mb-4">Limitaciones Legales</h3>
						<p class="text-yellow-800 leading-relaxed">
							En ningún caso Domify será responsable por daños indirectos, incidentales, especiales o consecuentes, 
							incluyendo pero no limitado a pérdida de beneficios, datos o uso. Nuestra responsabilidad total 
							no excederá el monto pagado por el usuario en los últimos 12 meses.
						</p>
					</div>
					
					<div class="bg-blue-50 rounded-xl p-6">
						<h3 class="text-xl font-semibold text-blue-900 mb-4">Garantías</h3>
						<p class="text-blue-800 leading-relaxed">
							La plataforma se proporciona "tal como está" sin garantías de ningún tipo. No garantizamos que 
							el servicio sea ininterrumpido, libre de errores o que cumpla con requisitos específicos.
						</p>
					</div>
				</div>
			</div>

			<!-- Terminación -->
			<div id="terminacion" class="mb-12">
				<h2 class="text-2xl font-bold text-secondary-900 mb-6">7. Terminación de Cuenta</h2>
				
				<div class="grid md:grid-cols-2 gap-6">
					<div class="bg-red-50 rounded-xl p-6">
						<h3 class="text-xl font-semibold text-red-900 mb-4">Terminación por el Usuario</h3>
						<ul class="space-y-2 text-red-800">
							<li>• Puedes cancelar tu cuenta en cualquier momento</li>
							<li>• Las reservas activas deben completarse</li>
							<li>• Los pagos pendientes se procesarán</li>
							<li>• Tu información se eliminará según nuestra política</li>
						</ul>
					</div>
					
					<div class="bg-orange-50 rounded-xl p-6">
						<h3 class="text-xl font-semibold text-orange-900 mb-4">Terminación por Domify</h3>
						<ul class="space-y-2 text-orange-800">
							<li>• Violación de estos términos</li>
							<li>• Actividad fraudulenta o ilegal</li>
							<li>• Comportamiento abusivo o inapropiado</li>
							<li>• Uso excesivo de recursos</li>
						</ul>
					</div>
				</div>
				
				<div class="mt-6 bg-secondary-50 rounded-xl p-6">
					<h3 class="text-xl font-semibold text-secondary-900 mb-4">Efectos de la Terminación</h3>
					<ul class="space-y-2 text-secondary-700">
						<li>• Acceso inmediato a la cuenta suspendido</li>
						<li>• Servicios activos pueden continuar según acuerdos</li>
						<li>• Información retenida según obligaciones legales</li>
						<li>• Reembolsos procesados según políticas</li>
					</ul>
				</div>
			</div>

			<!-- Propiedad intelectual -->
			<div class="mb-12">
				<h2 class="text-2xl font-bold text-secondary-900 mb-6">8. Propiedad Intelectual</h2>
				
				<div class="bg-purple-50 rounded-xl p-6">
					<h3 class="text-xl font-semibold text-purple-900 mb-4">Derechos de Domify</h3>
					<p class="text-purple-800 leading-relaxed mb-4">
						Toda la propiedad intelectual de la plataforma, incluyendo pero no limitado a software, diseño, 
						marcas comerciales y contenido, pertenece a Domify o sus licenciantes.
					</p>
					
					<h3 class="text-xl font-semibold text-purple-900 mb-4">Licencia de Uso</h3>
					<p class="text-purple-800 leading-relaxed mb-4">
						Te otorgamos una licencia limitada, no exclusiva y revocable para usar la plataforma 
						según estos términos.
					</p>
					
					<h3 class="text-xl font-semibold text-purple-900 mb-4">Contenido del Usuario</h3>
					<p class="text-purple-800 leading-relaxed">
						Conservas los derechos sobre tu contenido, pero nos otorgas licencia para usarlo 
						en la operación de la plataforma.
					</p>
				</div>
			</div>

			<!-- Ley aplicable -->
			<div class="mb-12">
				<h2 class="text-2xl font-bold text-secondary-900 mb-6">9. Ley Aplicable y Jurisdicción</h2>
				
				<div class="bg-blue-50 rounded-xl p-6">
					<p class="text-blue-800 leading-relaxed mb-4">
						Estos términos se rigen por las leyes del país donde opera Domify. Cualquier disputa 
						será resuelta en los tribunales competentes de esa jurisdicción.
					</p>
					
					<div class="grid md:grid-cols-2 gap-4 mt-6">
						<div>
							<h4 class="font-semibold text-blue-900 mb-2">Resolución de Disputas</h4>
							<ul class="text-blue-700 space-y-1">
								<li>• Negociación directa primero</li>
								<li>• Mediación si es necesario</li>
								<li>• Arbitraje como último recurso</li>
							</ul>
						</div>
						<div>
							<h4 class="font-semibold text-blue-900 mb-2">Notificaciones</h4>
							<ul class="text-blue-700 space-y-1">
								<li>• Por email a la dirección registrada</li>
								<li>• Notificación en la plataforma</li>
								<li>• Correo certificado si es requerido</li>
							</ul>
						</div>
					</div>
				</div>
			</div>

			<!-- Modificaciones -->
			<div class="mb-12">
				<h2 class="text-2xl font-bold text-secondary-900 mb-6">10. Modificaciones a los Términos</h2>
				
				<div class="bg-orange-50 rounded-xl p-6">
					<p class="text-orange-800 leading-relaxed mb-4">
						Nos reservamos el derecho de modificar estos términos en cualquier momento. 
						Los cambios entrarán en vigor inmediatamente después de su publicación.
					</p>
					
					<div class="bg-white rounded-lg p-4">
						<h4 class="font-semibold text-orange-900 mb-2">Notificación de Cambios</h4>
						<ul class="text-orange-800 space-y-1">
							<li>• Notificación por email a todos los usuarios</li>
							<li>• Aviso prominente en la plataforma</li>
							<li>• Actualización de la fecha de modificación</li>
							<li>• Continuar usando el servicio implica aceptar los cambios</li>
						</ul>
					</div>
				</div>
			</div>

			<!-- Contacto -->
			<div class="mb-12">
				<h2 class="text-2xl font-bold text-secondary-900 mb-6">11. Contacto</h2>
				
				<div class="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-8">
					<p class="text-secondary-700 mb-6">
						Si tienes preguntas sobre estos Términos de Servicio, contáctanos:
					</p>
					
					<div class="grid md:grid-cols-2 gap-6">
						<div>
							<h3 class="text-xl font-semibold text-secondary-900 mb-4">Información de Contacto</h3>
							<div class="space-y-3 text-secondary-700">
								<div class="flex items-center">
									<svg class="w-5 h-5 text-primary-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
									</svg>
									<a href="mailto:legal@domify.com" class="text-primary-600 hover:text-primary-700">legal@domify.com</a>
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
			¿Tienes preguntas sobre nuestros términos?
		</h2>
		<p class="text-xl text-primary-100 mb-8">
			Estamos aquí para aclarar cualquier duda sobre el uso de Domify
		</p>
		<div class="flex flex-col sm:flex-row gap-4 justify-center">
			<a href="/contact" class="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold hover:bg-primary-50 transition-colors duration-200 shadow-lg hover:shadow-xl">
				Contactar Soporte
			</a>
			<a href="/privacy" class="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-primary-600 transition-colors duration-200">
				Ver Política de Privacidad
			</a>
		</div>
	</div>
</section> 