<script lang="ts">
	import { onMount } from 'svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

	let testing = false;
	let result: any = null;
	let error: string | null = null;

	async function testMailcow() {
		testing = true;
		result = null;
		error = null;

		try {
			const response = await fetch('/api/test-mailcow', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ action: 'test' })
			});

			result = await response.json();

			if (!response.ok) {
				error = result.message || 'Error desconocido';
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Error de conexión';
		} finally {
			testing = false;
		}
	}
</script>

<svelte:head>
	<title>Prueba Mailcow - Admin Domify</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="max-w-2xl mx-auto">
		<div class="bg-white rounded-lg shadow-lg p-6">
			<div class="text-center mb-8">
				<h1 class="text-3xl font-bold text-gray-900 mb-2">🧪 Prueba de Configuración Mailcow</h1>
				<p class="text-gray-600">
					Prueba la configuración de correo con tu servidor Mailcow
				</p>
			</div>

			<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
				<h3 class="font-semibold text-blue-900 mb-2">📧 Configuración Actual</h3>
				<div class="text-sm text-blue-800 space-y-1">
					<p><strong>Servidor SMTP:</strong> mail.domify.app</p>
					<p><strong>Puerto:</strong> 587 (TLS) / 465 (SSL)</p>
					<p><strong>Usuario:</strong> info@domify.app</p>
					<p><strong>Email de origen:</strong> info@domify.app</p>
				</div>
			</div>

			<div class="text-center mb-6">
				<button
					on:click={testMailcow}
					disabled={testing}
					class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center mx-auto"
				>
					{#if testing}
						<LoadingSpinner size="sm" />
						<span class="ml-2">Probando configuración...</span>
					{:else}
						🧪 Probar Configuración Mailcow
					{/if}
				</button>
			</div>

			{#if result}
				<div class="mt-6">
					{#if result.success}
						<div class="bg-green-50 border border-green-200 rounded-lg p-4">
							<div class="flex items-center">
								<div class="flex-shrink-0">
									<svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
										<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
									</svg>
								</div>
								<div class="ml-3">
									<h3 class="text-sm font-medium text-green-800">
										✅ Prueba Exitosa
									</h3>
									<div class="mt-2 text-sm text-green-700">
										<p>{result.message}</p>
										<p class="mt-1 text-xs">
											<strong>Timestamp:</strong> {new Date(result.timestamp).toLocaleString('es-NI')}
										</p>
									</div>
								</div>
							</div>
						</div>
					{:else}
						<div class="bg-red-50 border border-red-200 rounded-lg p-4">
							<div class="flex items-center">
								<div class="flex-shrink-0">
									<svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
										<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
									</svg>
								</div>
								<div class="ml-3">
									<h3 class="text-sm font-medium text-red-800">
										❌ Error en la Prueba
									</h3>
									<div class="mt-2 text-sm text-red-700">
										<p>{result.message}</p>
										{#if result.error}
											<p class="mt-1"><strong>Error:</strong> {result.error}</p>
										{/if}
										<p class="mt-1 text-xs">
											<strong>Timestamp:</strong> {new Date(result.timestamp).toLocaleString('es-NI')}
										</p>
									</div>
								</div>
							</div>
						</div>
					{/if}
				</div>
			{/if}

			{#if error}
				<div class="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
							</svg>
						</div>
						<div class="ml-3">
							<h3 class="text-sm font-medium text-red-800">
								Error de Conexión
							</h3>
							<div class="mt-2 text-sm text-red-700">
								<p>{error}</p>
							</div>
						</div>
					</div>
				</div>
			{/if}

			<div class="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
				<h3 class="font-semibold text-gray-900 mb-2">📋 Instrucciones</h3>
				<div class="text-sm text-gray-700 space-y-2">
					<p>1. <strong>Asegúrate de tener configurado el archivo .env</strong> con las credenciales de Mailcow</p>
					<p>2. <strong>Verifica que el servidor Mailcow esté funcionando</strong> y accesible</p>
					<p>3. <strong>Haz clic en "Probar Configuración"</strong> para enviar un email de prueba</p>
					<p>4. <strong>Revisa tu correo info@domify.app</strong> para confirmar que recibiste el email</p>
				</div>
			</div>

			<div class="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
				<h3 class="font-semibold text-yellow-900 mb-2">⚠️ Solución de Problemas</h3>
				<div class="text-sm text-yellow-800 space-y-2">
					<p><strong>Error de autenticación:</strong> Verifica usuario y contraseña en .env</p>
					<p><strong>Error de conexión:</strong> Verifica que el servidor SMTP esté accesible</p>
					<p><strong>Error de certificado:</strong> Asegúrate de que TLS esté configurado correctamente</p>
					<p><strong>Puerto bloqueado:</strong> Verifica que el puerto 587 o 465 esté abierto</p>
				</div>
			</div>
		</div>
	</div>
</div> 