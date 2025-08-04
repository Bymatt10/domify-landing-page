<script lang="ts">
	import { onMount } from 'svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import NotificationToast from '$lib/components/NotificationToast.svelte';
	import { notifications } from '$lib/stores/notifications';

	let loading = false;
	let importing = false;
	let dryRun = true;
	let spreadsheetId = '1hmf0d1t5ZCdRoAAKcMSisCjx3XTTlwm_9jrweNl-LuQ';
	let range = 'A:Z';
	let skipFirstRow = true;
	
	let importResult: any = null;
	let previewData: any[] = [];
	let showPreview = false;

	// Variables para generación de proveedores de ejemplo
	let generatingProviders = false;
	let providerCount = 50;
	let createAccounts = false;
	let generatedProviders: any[] = [];
	
	// Variables para proveedores simples
	let simpleProvidersData = '';
	let createSimpleAccounts = false;
	let isCreatingSimple = false;
	let simpleImportResult: any = null;

	// Configuración de ejemplo
	const exampleSpreadsheetId = '1hmf0d1t5ZCdRoAAKcMSisCjx3XTTlwm_9jrweNl-LuQ';
	const exampleRange = 'A:Z';

	async function previewImport() {
		if (!spreadsheetId) {
			notifications.add({ message: 'Por favor ingresa el ID del Google Sheets', type: 'error' });
			return;
		}

		loading = true;
		try {
			const response = await fetch('/api/admin/bulk-import-providers', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					spreadsheetId,
					range,
					skipFirstRow,
					dryRun: true
				})
			});

			const result = await response.json();

			if (response.ok) {
				previewData = result.data.details || [];
				importResult = result.data;
				showPreview = true;
				notifications.add({ message: `Vista previa: ${result.data.success} proveedores serían creados`, type: 'success' });
			} else {
				notifications.add({ message: result.error?.message || 'Error al obtener vista previa', type: 'error' });
			}
		} catch (error) {
			console.error('Error en vista previa:', error);
			notifications.add({ message: 'Error de conexión', type: 'error' });
		} finally {
			loading = false;
		}
	}

	async function executeImport() {
		if (!spreadsheetId) {
			notifications.add({ message: 'Por favor ingresa el ID del Google Sheets', type: 'error' });
			return;
		}

		if (!confirm('¿Estás seguro de que quieres importar estos proveedores? Esta acción no se puede deshacer.')) {
			return;
		}

		importing = true;
		try {
			const response = await fetch('/api/admin/bulk-import-providers', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					spreadsheetId,
					range,
					skipFirstRow,
					dryRun: false
				})
			});

			const result = await response.json();

			if (response.ok) {
				importResult = result.data;
				notifications.add({ message: `Importación completada: ${result.data.success} proveedores creados, ${result.data.failed} fallidos`, type: 'success' });
			} else {
				notifications.add({ message: result.error?.message || 'Error en la importación', type: 'error' });
			}
		} catch (error) {
			console.error('Error en importación:', error);
			notifications.add({ message: 'Error de conexión', type: 'error' });
		} finally {
			importing = false;
		}
	}

	async function downloadTemplate() {
		try {
			const response = await fetch('/api/admin/download-provider-template');
			
			if (response.ok) {
				const blob = await response.blob();
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = 'template_proveedores_domify.csv';
				document.body.appendChild(a);
				a.click();
				window.URL.revokeObjectURL(url);
				document.body.removeChild(a);
				
				notifications.add({ message: 'Template CSV descargado exitosamente', type: 'success' });
			} else {
				notifications.add({ message: 'Error al descargar el template CSV', type: 'error' });
			}
		} catch (error) {
			console.error('Error descargando template CSV:', error);
			notifications.add({ message: 'Error de conexión al descargar CSV', type: 'error' });
		}
	}

	async function downloadTemplateExcel() {
		try {
			const response = await fetch('/api/admin/download-provider-template-excel');
			
			if (response.ok) {
				const blob = await response.blob();
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = 'template_proveedores_domify.xlsx';
				document.body.appendChild(a);
				a.click();
				window.URL.revokeObjectURL(url);
				document.body.removeChild(a);
				
				notifications.add({ message: 'Template Excel descargado exitosamente', type: 'success' });
			} else {
				notifications.add({ message: 'Error al descargar el template Excel', type: 'error' });
			}
		} catch (error) {
			console.error('Error descargando template Excel:', error);
			notifications.add({ message: 'Error de conexión al descargar Excel', type: 'error' });
		}
	}

	async function generateSampleProviders() {
		if (providerCount < 1 || providerCount > 200) {
			notifications.add({ message: 'La cantidad debe estar entre 1 y 200', type: 'error' });
			return;
		}

		generatingProviders = true;
		try {
			const response = await fetch('/api/admin/generate-sample-providers', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					count: providerCount,
					createAccounts
				})
			});

			const result = await response.json();

			if (response.ok) {
				generatedProviders = result.data.providers;
				notifications.add({ 
					message: `Generados ${result.data.totalGenerated} proveedores de ejemplo${createAccounts ? `, ${result.data.accountsCreated} cuentas creadas` : ''}`, 
					type: 'success' 
				});
			} else {
				notifications.add({ message: result.error?.message || 'Error generando proveedores', type: 'error' });
			}
		} catch (error) {
			console.error('Error generando proveedores:', error);
			notifications.add({ message: 'Error de conexión', type: 'error' });
		} finally {
			generatingProviders = false;
		}
	}

	async function downloadSampleProvidersExcel() {
		try {
			const response = await fetch('/api/admin/download-sample-providers-excel', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					count: providerCount
				})
			});
			
			if (response.ok) {
				const blob = await response.blob();
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `proveedores_ejemplo_${providerCount}.xlsx`;
				document.body.appendChild(a);
				a.click();
				window.URL.revokeObjectURL(url);
				document.body.removeChild(a);
				
				notifications.add({ message: 'Proveedores de ejemplo descargados exitosamente', type: 'success' });
			} else {
				notifications.add({ message: 'Error al descargar los proveedores de ejemplo', type: 'error' });
			}
		} catch (error) {
			console.error('Error descargando proveedores de ejemplo:', error);
			notifications.add({ message: 'Error de conexión al descargar', type: 'error' });
		}
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'created':
				return 'text-green-600 bg-green-50';
			case 'skipped':
				return 'text-orange-600 bg-orange-50';
			case 'error':
				return 'text-red-600 bg-red-50';
			default:
				return 'text-gray-600 bg-gray-50';
		}
	}

	function getStatusIcon(status: string) {
		switch (status) {
			case 'created':
				return '✅';
			case 'skipped':
				return '⏭️';
			case 'error':
				return '❌';
			default:
				return '❓';
		}
	}

	// Funciones para proveedores simples
	async function createSimpleProviders() {
		if (!simpleProvidersData.trim()) {
			notifications.add({ message: 'Por favor ingresa los datos de los proveedores', type: 'error' });
			return;
		}

		try {
			const providers = JSON.parse(simpleProvidersData);
			if (!Array.isArray(providers)) {
				notifications.add({ message: 'Los datos deben ser un array de proveedores', type: 'error' });
				return;
			}
		} catch (error) {
			notifications.add({ message: 'Error en el formato JSON de los datos', type: 'error' });
			return;
		}

		isCreatingSimple = true;
		try {
			const providers = JSON.parse(simpleProvidersData);
			const response = await fetch('/api/admin/create-simple-providers', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					providers,
					createAccounts: createSimpleAccounts
				})
			});

			const result = await response.json();

			if (response.ok) {
				simpleImportResult = result;
				notifications.add({ message: `Proveedores creados: ${result.result.success} exitosos, ${result.result.failed} fallidos`, type: 'success' });
			} else {
				notifications.add({ message: result.error?.message || 'Error al crear proveedores', type: 'error' });
			}
		} catch (error) {
			console.error('Error creando proveedores simples:', error);
			notifications.add({ message: 'Error de conexión', type: 'error' });
		} finally {
			isCreatingSimple = false;
		}
	}

	function loadExampleData() {
		simpleProvidersData = JSON.stringify([
			{
				nombre: 'TRANSARES -Transporte y extracción de aguas residuales de sumideros, fosa séptica, trampas de grasas y PTAR.',
				telefono: '86358233',
				direccion: 'Colonia Centroamérica, Casa #87, Managua, Nicaragua',
				servicios: 'Transporte y extracción de aguas residuales, Sumideros, Fosa séptica, Trampas de grasas, PTAR',
				email: 'transares387@outlook.com',
				horarios: 'Lunes a Sábado 8:00 AM - 5:00 PM',
				precio_hora: 488,
				experiencia: 6,
				tipo: 'Empresa',
				categorias: 'Fontaneria'
			},
			{
				nombre: 'Plomeria Murillo',
				telefono: '57589832',
				direccion: 'Colonia Centroamérica, Casa #84, Managua, Nicaragua',
				servicios: 'Plomería, Fontanería, Reparaciones de tuberías, Instalaciones sanitarias',
				email: 'plomeria.murillo231@outlook.com',
				horarios: 'Lunes a Sábado 8:00 AM - 2:00 PM',
				precio_hora: 312,
				experiencia: 10,
				tipo: 'Individual',
				categorias: 'Fontaneria'
			}
		], null, 2);
	}
</script>

<svelte:head>
	<title>Importación Masiva de Proveedores - Admin - Domify</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
		<!-- Header -->
		<div class="px-4 py-6 sm:px-0">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-3xl font-bold text-gray-900">📊 Importación Masiva de Proveedores</h1>
					<p class="mt-2 text-gray-600">Importa múltiples proveedores desde Google Sheets de manera masiva</p>
				</div>
			</div>
		</div>

		<!-- Main Content -->
		<div class="px-4 py-6 sm:px-0">
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<!-- Configuration Panel -->
				<div class="bg-white rounded-lg shadow p-6">
					<h2 class="text-xl font-semibold text-gray-900 mb-6">⚙️ Configuración de Importación</h2>
					
					<div class="space-y-6">
						<!-- Spreadsheet ID -->
						<div>
							<label for="spreadsheetId" class="block text-sm font-medium text-gray-700 mb-2">
								ID del Google Sheets *
							</label>
							<input
								type="text"
								id="spreadsheetId"
								bind:value={spreadsheetId}
								class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								placeholder="1hmf0d1t5ZCdRoAAKcMSisCjx3XTTlwm_9jrweNl-LuQ"
							/>
							<p class="mt-1 text-sm text-gray-500">
								Ejemplo: {exampleSpreadsheetId}
							</p>
						</div>

						<!-- Range -->
						<div>
							<label for="range" class="block text-sm font-medium text-gray-700 mb-2">
								Rango de Columnas
							</label>
							<input
								type="text"
								id="range"
								bind:value={range}
								class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								placeholder="A:Z"
							/>
							<p class="mt-1 text-sm text-gray-500">
								Ejemplo: A:Z (todas las columnas)
							</p>
						</div>

						<!-- Options -->
						<div class="space-y-4">
							<div class="flex items-center">
								<input
									type="checkbox"
									id="skipFirstRow"
									bind:checked={skipFirstRow}
									class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
								/>
								<label for="skipFirstRow" class="ml-2 block text-sm text-gray-900">
									Saltar primera fila (encabezados)
								</label>
							</div>

							<div class="flex items-center">
								<input
									type="checkbox"
									id="dryRun"
									bind:checked={dryRun}
									class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
								/>
								<label for="dryRun" class="ml-2 block text-sm text-gray-900">
									Modo prueba (solo simular)
								</label>
							</div>
						</div>

						<!-- Action Buttons -->
						<div class="flex space-x-4 pt-4">
							<button
								on:click={previewImport}
								disabled={loading || importing}
								class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
							>
								{#if loading}
									<LoadingSpinner size="sm" />
									<span class="ml-2">Vista Previa...</span>
								{:else}
									👁️ Vista Previa
								{/if}
							</button>

							<button
								on:click={executeImport}
								disabled={loading || importing || dryRun}
								class="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
							>
								{#if importing}
									<LoadingSpinner size="sm" />
									<span class="ml-2">Importando...</span>
								{:else}
									📥 Importar Proveedores
								{/if}
							</button>
						</div>

						<!-- Download Template Buttons -->
						<div class="pt-4 border-t border-gray-200">
							<div class="space-y-3">
								<button
									on:click={downloadTemplate}
									class="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-3 rounded-md font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
								>
									📄 Descargar Template CSV
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
									</svg>
								</button>
								
								<button
									on:click={downloadTemplateExcel}
									class="w-full bg-green-50 hover:bg-green-100 text-green-700 px-4 py-3 rounded-md font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
								>
									📊 Descargar Template Excel
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
									</svg>
								</button>
							</div>
							<p class="text-xs text-gray-500 mt-3 text-center">
								Descarga el template con ejemplos para llenar tu Google Sheets
							</p>
						</div>
					</div>
				</div>

				<!-- Instructions Panel -->
				<div class="bg-white rounded-lg shadow p-6">
					<h2 class="text-xl font-semibold text-gray-900 mb-6">📋 Instrucciones</h2>
					
					<div class="space-y-4 text-sm text-gray-600">
						<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
							<h3 class="font-semibold text-blue-900 mb-2">📊 Estructura del Google Sheets</h3>
							<p class="text-blue-800">
								Asegúrate de que tu Google Sheets tenga las columnas en este orden:
							</p>
							<ul class="mt-2 text-blue-800 space-y-1">
								<li><strong>A:</strong> Timestamp</li>
								<li><strong>B:</strong> ID_Aplicacion</li>
								<li><strong>C:</strong> Nombre</li>
								<li><strong>D:</strong> Apellido</li>
								<li><strong>E:</strong> Email</li>
								<li><strong>F:</strong> Telefono</li>
								<li><strong>G:</strong> Departamento</li>
								<li><strong>H:</strong> Direccion</li>
								<li><strong>I:</strong> Tipo_Proveedor</li>
								<li><strong>J:</strong> Titulo_Servicio</li>
								<li><strong>K:</strong> Descripcion</li>
								<li><strong>L:</strong> Precio_Hora</li>
								<li><strong>M:</strong> Experiencia_Anos</li>
								<li><strong>N:</strong> Disponibilidad</li>
								<li><strong>O:</strong> Categorias</li>
							</ul>
						</div>

						<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
							<h3 class="font-semibold text-yellow-900 mb-2">⚠️ Campos Obligatorios</h3>
							<p class="text-yellow-800">
								Los siguientes campos son obligatorios para cada proveedor:
							</p>
							<ul class="mt-2 text-yellow-800 space-y-1">
								<li>• Email (único)</li>
								<li>• Nombre</li>
								<li>• Apellido</li>
								<li>• Teléfono</li>
							</ul>
						</div>

						<div class="bg-green-50 border border-green-200 rounded-lg p-4">
							<h3 class="font-semibold text-green-900 mb-2">✅ Proceso Seguro</h3>
							<p class="text-green-800">
								• Siempre usa "Vista Previa" antes de importar<br>
								• Los usuarios duplicados serán saltados<br>
								• Se generarán contraseñas temporales<br>
								• Recibirás un email con el resumen
							</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Generate Sample Providers Section -->
			<div class="mt-8 bg-white rounded-lg shadow">
				<div class="px-6 py-4 border-b border-gray-200">
					<h2 class="text-xl font-semibold text-gray-900">🎯 Generar Proveedores de Ejemplo</h2>
					<p class="text-sm text-gray-600 mt-1">Genera proveedores de ejemplo basados en datos reales de Google Maps</p>
				</div>
				
				<div class="p-6">
					<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<!-- Configuration -->
						<div class="space-y-4">
							<div>
								<label for="providerCount" class="block text-sm font-medium text-gray-700 mb-2">
									Cantidad de Proveedores
								</label>
								<input
									type="number"
									id="providerCount"
									bind:value={providerCount}
									min="1"
									max="200"
									class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								/>
								<p class="text-xs text-gray-500 mt-1">Entre 1 y 200 proveedores</p>
							</div>

							<div class="flex items-center">
								<input
									type="checkbox"
									id="createAccounts"
									bind:checked={createAccounts}
									class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
								/>
								<label for="createAccounts" class="ml-2 block text-sm text-gray-900">
									Crear cuentas de usuario (opcional)
								</label>
							</div>

							<div class="flex space-x-4">
								<button
									on:click={generateSampleProviders}
									disabled={generatingProviders}
									class="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
								>
									{#if generatingProviders}
										<LoadingSpinner size="sm" />
										<span class="ml-2">Generando...</span>
									{:else}
										🎯 Generar Proveedores
									{/if}
								</button>

								<button
									on:click={downloadSampleProvidersExcel}
									disabled={generatingProviders}
									class="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
								>
									📊 Descargar Excel
								</button>
							</div>
						</div>

						<!-- Sample Data Info -->
						<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
							<h3 class="font-semibold text-blue-900 mb-2">📋 Datos de Ejemplo Incluidos</h3>
							<ul class="text-sm text-blue-800 space-y-1">
								<li>• <strong>TRANSARES</strong> - Transporte y extracción de aguas residuales</li>
								<li>• <strong>Plomeria Murillo</strong> - Plomería y fontanería</li>
								<li>• <strong>Servicios Martínez</strong> - Plomería menor</li>
								<li>• <strong>Electricidad Rápida</strong> - Instalaciones eléctricas</li>
								<li>• <strong>Jardinería Express</strong> - Jardinería y paisajismo</li>
								<li>• <strong>Limpieza Profesional</strong> - Limpieza residencial y comercial</li>
								<li>• <strong>Construcciones Vega</strong> - Construcción y remodelaciones</li>
								<li>• <strong>Carpintería López</strong> - Carpintería y muebles</li>
								<li>• <strong>Mudanzas Express</strong> - Mudanzas y transporte</li>
								<li>• <strong>Cerrajería 24/7</strong> - Cerrajería y apertura de puertas</li>
							</ul>
						</div>
					</div>

					<!-- Generated Providers Preview -->
					{#if generatedProviders.length > 0}
						<div class="mt-6">
							<h3 class="text-lg font-semibold text-gray-900 mb-4">📋 Proveedores Generados ({generatedProviders.length})</h3>
							<div class="overflow-x-auto">
								<table class="min-w-full divide-y divide-gray-200">
									<thead class="bg-gray-50">
										<tr>
											<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
											<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
											<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
											<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servicios</th>
											<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio/Hora</th>
										</tr>
									</thead>
									<tbody class="bg-white divide-y divide-gray-200">
										{#each generatedProviders.slice(0, 10) as provider}
											<tr class="hover:bg-gray-50">
												<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{provider.nombre}</td>
												<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{provider.telefono}</td>
												<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{provider.email}</td>
												<td class="px-6 py-4 text-sm text-gray-900">{provider.servicios}</td>
												<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">C$ {provider.precio_hora}</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
							{#if generatedProviders.length > 10}
								<p class="text-sm text-gray-500 mt-2 text-center">
									Mostrando los primeros 10 de {generatedProviders.length} proveedores
								</p>
							{/if}
						</div>
					{/if}
				</div>
			</div>

			<!-- Results Section -->
			{#if importResult}
				<div class="mt-8 bg-white rounded-lg shadow">
					<div class="px-6 py-4 border-b border-gray-200">
						<h2 class="text-xl font-semibold text-gray-900">📊 Resultados de la Importación</h2>
					</div>
					
					<div class="p-6">
						<!-- Summary -->
						<div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
							<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
								<div class="text-2xl font-bold text-blue-600">{importResult.totalProcessed || 0}</div>
								<div class="text-sm text-blue-800">Total Procesados</div>
							</div>
							<div class="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
								<div class="text-2xl font-bold text-green-600">{importResult.success || 0}</div>
								<div class="text-sm text-green-800">Exitosos</div>
							</div>
							<div class="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
								<div class="text-2xl font-bold text-red-600">{importResult.failed || 0}</div>
								<div class="text-sm text-red-800">Fallidos</div>
							</div>
							<div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
								<div class="text-2xl font-bold text-gray-600">
									{importResult.totalProcessed ? ((importResult.success / importResult.totalProcessed) * 100).toFixed(1) : 0}%
								</div>
								<div class="text-sm text-gray-800">Tasa de Éxito</div>
							</div>
						</div>

						<!-- Details Table -->
						{#if importResult.details && importResult.details.length > 0}
							<div class="overflow-x-auto">
								<table class="min-w-full divide-y divide-gray-200">
									<thead class="bg-gray-50">
										<tr>
											<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Email
											</th>
											<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Estado
											</th>
											<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Mensaje
											</th>
										</tr>
									</thead>
									<tbody class="bg-white divide-y divide-gray-200">
										{#each importResult.details as detail}
											<tr class="hover:bg-gray-50">
												<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
													{detail.email}
												</td>
												<td class="px-6 py-4 whitespace-nowrap">
													<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getStatusColor(detail.status)}">
														{getStatusIcon(detail.status)} {detail.status.toUpperCase()}
													</span>
												</td>
												<td class="px-6 py-4 text-sm text-gray-900">
													{detail.message}
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						{/if}

						<!-- Errors -->
						{#if importResult.errors && importResult.errors.length > 0}
							<div class="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
								<h3 class="text-lg font-semibold text-red-900 mb-2">❌ Errores Detallados</h3>
								<div class="space-y-2">
									{#each importResult.errors as error}
										<div class="text-sm text-red-800">
											<strong>Fila {error.row}:</strong> {error.email} - {error.error}
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				</div>
			{/if}

			<!-- Crear Proveedores Simples -->
			<div class="mt-8 bg-white rounded-lg shadow">
				<div class="px-6 py-4 border-b border-gray-200">
					<h2 class="text-xl font-semibold text-gray-900">🎯 Crear Proveedores Simples</h2>
					<p class="text-sm text-gray-600 mt-1">Crea proveedores con datos básicos y aparecerán en las categorías</p>
				</div>
				
				<div class="p-6">
					<div class="mb-4">
						<label for="simpleProvidersData" class="block text-sm font-medium text-gray-700 mb-2">
							Datos de proveedores (JSON)
						</label>
						<textarea
							id="simpleProvidersData"
							bind:value={simpleProvidersData}
							rows="8"
							placeholder="Pega aquí los datos JSON de los proveedores. Usa el botón 'Cargar Ejemplo' para ver el formato."
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
						></textarea>
					</div>

					<div class="flex items-center mb-4">
						<input
							type="checkbox"
							id="createSimpleAccounts"
							bind:checked={createSimpleAccounts}
							class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
						/>
						<label for="createSimpleAccounts" class="ml-2 block text-sm text-gray-700">
							Crear cuentas de usuario para estos proveedores
						</label>
					</div>

					<div class="flex gap-2">
						<button
							on:click={createSimpleProviders}
							disabled={isCreatingSimple}
							class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
						>
							{#if isCreatingSimple}
								<LoadingSpinner size="sm" />
							{/if}
							Crear Proveedores
						</button>
						<button
							on:click={loadExampleData}
							class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
						>
							Cargar Ejemplo
						</button>
					</div>

					{#if simpleImportResult}
						<div class="mt-6">
							<h4 class="text-md font-medium text-gray-700 mb-3">Resultado de la importación:</h4>
							<div class="bg-gray-50 p-4 rounded-md">
								<p class="text-sm text-gray-700">
									<strong>Total procesados:</strong> {simpleImportResult.result.success + simpleImportResult.result.failed}
								</p>
								<p class="text-sm text-green-600">
									<strong>Exitosos:</strong> {simpleImportResult.result.success}
								</p>
								<p class="text-sm text-red-600">
									<strong>Fallidos:</strong> {simpleImportResult.result.failed}
								</p>
							</div>
							
							{#if simpleImportResult.result.details.length > 0}
								<div class="mt-4">
									<h5 class="text-sm font-medium text-gray-700 mb-2">Detalles:</h5>
									<div class="max-h-40 overflow-y-auto">
										{#each simpleImportResult.result.details as detail}
											<div class="text-xs p-2 border-b border-gray-200">
												<span class="font-medium">{detail.email}:</span> 
												<span class="{detail.status === 'created' ? 'text-green-600' : detail.status === 'error' ? 'text-red-600' : 'text-yellow-600'}">
													{detail.message}
												</span>
											</div>
										{/each}
									</div>
								</div>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

<NotificationToast /> 