<script lang="ts">
	import { onMount } from 'svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import NotificationToast from '$lib/components/NotificationToast.svelte';
	import { notifications } from '$lib/stores/notifications';
	import { 
		Database, FileSpreadsheet, Play, Eye, 
		Download, UserPlus, Info, CheckCircle2, 
		AlertTriangle, XCircle, Code, Sparkles,
		ChevronRight, HelpCircle, FileText, Table,
		Box, List, Shield, Zap
	} from 'lucide-svelte';

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

	async function previewImport() {
		if (!spreadsheetId) {
			notifications.add({ message: 'Por favor ingresa el ID del Google Sheets', type: 'error' });
			return;
		}

		loading = true;
		try {
			const response = await fetch('/api/admin/bulk-import-providers', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ spreadsheetId, range, skipFirstRow, dryRun: true })
			});

			const result = await response.json();

			if (response.ok) {
				previewData = result.data.details || [];
				importResult = result.data;
				showPreview = true;
				notifications.add({ message: `Vista previa: ${result.data.success} proveedores detectados`, type: 'success' });
			} else {
				notifications.add({ message: result.error?.message || 'Error al obtener vista previa', type: 'error' });
			}
		} catch (error) {
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

		importing = true;
		try {
			const response = await fetch('/api/admin/bulk-import-providers', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ spreadsheetId, range, skipFirstRow, dryRun: false })
			});

			const result = await response.json();

			if (response.ok) {
				importResult = result.data;
				notifications.add({ message: `Importación completada con éxito`, type: 'success' });
			} else {
				notifications.add({ message: result.error?.message || 'Error en la importación', type: 'error' });
			}
		} catch (error) {
			notifications.add({ message: 'Error de conexión', type: 'error' });
		} finally {
			importing = false;
		}
	}

	async function downloadTemplate(format: 'csv' | 'xlsx') {
		const endpoint = format === 'csv' ? '/api/admin/download-provider-template' : '/api/admin/download-provider-template-excel';
		try {
			const response = await fetch(endpoint);
			if (response.ok) {
				const blob = await response.blob();
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `template_proveedores_domify.${format}`;
				document.body.appendChild(a);
				a.click();
				window.URL.revokeObjectURL(url);
				document.body.removeChild(a);
				notifications.add({ message: `Template ${format.toUpperCase()} descargado`, type: 'success' });
			}
		} catch (error) {
			notifications.add({ message: 'Error al descargar el archivo', type: 'error' });
		}
	}

	async function generateSampleProviders() {
		generatingProviders = true;
		try {
			const response = await fetch('/api/admin/generate-sample-providers', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ count: providerCount, createAccounts })
			});
			const result = await response.json();
			if (response.ok) {
				generatedProviders = result.data.providers;
				notifications.add({ message: `Generados ${result.data.totalGenerated} proveedores`, type: 'success' });
			}
		} catch (error) {
			notifications.add({ message: 'Error generando datos', type: 'error' });
		} finally {
			generatingProviders = false;
		}
	}

	async function createSimpleProviders() {
		if (!simpleProvidersData.trim()) return;
		isCreatingSimple = true;
		try {
			const providers = JSON.parse(simpleProvidersData);
			const response = await fetch('/api/admin/create-simple-providers', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ providers, createAccounts: createSimpleAccounts })
			});
			const result = await response.json();
			if (response.ok) {
				simpleImportResult = result;
				notifications.add({ message: 'Proveedores creados exitosamente', type: 'success' });
			}
		} catch (error) {
			notifications.add({ message: 'Error en los datos o en el servidor', type: 'error' });
		} finally {
			isCreatingSimple = false;
		}
	}

	function loadExampleJSON() {
		simpleProvidersData = JSON.stringify([
			{
				nombre: 'Electricista Asiel Multiservicios',
				telefono: '+505 5854 1522',
				direccion: 'Museo de Acahualinca 2 cuadras al norte, Managua',
				servicios: 'Instalaciones eléctricas residenciales, Mantenimiento preventivo.',
				email: 'asiel.electricidad@ejemplo.com',
				categorias: 'Electricista'
			}
		], null, 2);
	}
</script>

<svelte:head>
	<title>Importación Masiva - Domify Admin</title>
</svelte:head>

<div class="space-y-10 pb-20 font-inter">
	<!-- Header -->
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 sm:px-0">
		<div class="space-y-1">
			<h1 class="text-3xl font-bold text-slate-900 tracking-tight font-outfit flex items-center gap-3">
				<div class="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
					<Database size={24} />
				</div>
				Importación Masiva
			</h1>
			<p class="text-slate-500 font-medium flex items-center gap-2">
				<Sparkles size={16} class="text-blue-500" />
				Sincroniza y expande tu base de datos de proveedores rápidamente.
			</p>
		</div>
	</div>

	<div class="px-4 py-6 sm:px-0">
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
			<!-- Main Configuration Card -->
			<div class="lg:col-span-2 space-y-8">
				<!-- Google Sheets Source -->
				<div class="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden group">
					<div class="absolute -right-16 -top-16 w-48 h-48 bg-emerald-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
					
					<div class="relative z-10">
						<div class="flex items-center gap-4 mb-8">
							<div class="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
								<FileSpreadsheet size={24} />
							</div>
							<div>
								<h2 class="text-xl font-bold font-outfit text-slate-900">Google Sheets Sync</h2>
								<p class="text-slate-400 text-sm font-medium">Importa datos directamente desde una hoja pública</p>
							</div>
						</div>

						<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
							<div class="space-y-2">
								<label for="sheet-id" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">ID de la Hoja de Cálculo</label>
								<input
									id="sheet-id"
									type="text"
									bind:value={spreadsheetId}
									class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all font-medium"
									placeholder="Copia el ID de la URL de tu Google Sheet"
								/>
							</div>
							<div class="space-y-2">
								<label for="range" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Rango (Ej: A:Z)</label>
								<input
									id="range"
									type="text"
									bind:value={range}
									class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all font-medium"
								/>
							</div>
						</div>

						<div class="flex flex-wrap items-center gap-6 mb-8">
							<label class="flex items-center gap-3 cursor-pointer group">
								<input type="checkbox" bind:checked={skipFirstRow} class="w-5 h-5 rounded-lg border-2 border-slate-200 text-blue-600 focus:ring-blue-500" />
								<span class="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Saltar encabezados</span>
							</label>
							<label class="flex items-center gap-3 cursor-pointer group">
								<input type="checkbox" bind:checked={dryRun} class="w-5 h-5 rounded-lg border-2 border-slate-200 text-blue-600 focus:ring-blue-500" />
								<span class="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Modo Prueba</span>
							</label>
						</div>

						<div class="flex flex-col sm:flex-row gap-4">
							<button 
								class="flex-1 px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-slate-900/10"
								on:click={previewImport}
								disabled={loading}
							>
								{#if loading}
									<LoadingSpinner size="sm" color="white" />
								{:else}
									<Eye size={18} />
									Ver Vista Previa
								{/if}
							</button>
							<button 
								class="flex-1 px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-blue-600/10"
								on:click={executeImport}
								disabled={importing || dryRun}
							>
								{#if importing}
									<LoadingSpinner size="sm" color="white" />
								{:else}
									<Play size={18} />
									Ejecutar Importación
								{/if}
							</button>
						</div>
					</div>
				</div>

				<!-- Result Preview -->
				{#if showPreview || importResult}
					<div class="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 transition-all">
						<div class="flex items-center justify-between mb-8">
							<h3 class="text-xl font-bold font-outfit text-slate-900 flex items-center gap-3">
								<Table size={20} class="text-blue-500" />
								Resultados & Vista Previa
							</h3>
							{#if importResult}
								<div class="flex items-center gap-4">
									<div class="px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-black tracking-widest uppercase">
										{importResult.success} Exitosos
									</div>
									<div class="px-4 py-1.5 bg-rose-50 text-rose-700 rounded-full text-xs font-black tracking-widest uppercase">
										{importResult.failed} Fallidos
									</div>
								</div>
							{/if}
						</div>

						<div class="overflow-x-auto -mx-8">
							<table class="w-full text-left">
								<thead>
									<tr class="bg-slate-50 border-y border-slate-100">
										<th class="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Proveedor</th>
										<th class="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Email</th>
										<th class="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Estado</th>
										<th class="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Feedback</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-slate-50">
									{#each (previewData.length > 0 ? previewData : (importResult?.details || [])) as item}
										<tr class="group hover:bg-slate-50 transition-colors">
											<td class="px-8 py-5">
												<div class="font-bold text-slate-700 group-hover:text-blue-600 transition-colors uppercase tracking-tight text-sm">
													{item.nombre || 'N/A'}
												</div>
											</td>
											<td class="px-8 py-5">
												<div class="text-xs font-medium text-slate-500">{item.email}</div>
											</td>
											<td class="px-8 py-5">
												{#if item.status === 'created'}
													<div class="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full w-fit">
														<CheckCircle2 size={12} />
														<span class="text-[10px] font-black uppercase tracking-widest">Creado</span>
													</div>
												{:else if item.status === 'error'}
													<div class="flex items-center gap-2 text-rose-600 bg-rose-50 px-3 py-1 rounded-full w-fit">
														<XCircle size={12} />
														<span class="text-[10px] font-black uppercase tracking-widest">Error</span>
													</div>
												{:else}
													<div class="flex items-center gap-2 text-slate-400 bg-slate-50 px-3 py-1 rounded-full w-fit">
														<HelpCircle size={12} />
														<span class="text-[10px] font-black uppercase tracking-widest">Pendiente</span>
													</div>
												{/if}
											</td>
											<td class="px-8 py-5">
												<div class="text-xs text-slate-400 font-medium italic">
													{item.message || 'Listo para procesar'}
												</div>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				{/if}
			</div>

			<!-- Side Tools / Instructions -->
			<div class="space-y-8">
				<!-- Sample Data Generator -->
				<div class="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
					<div class="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl"></div>
					
					<div class="relative z-10">
						<div class="flex items-center gap-4 mb-8">
							<div class="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
								<Zap size={24} class="text-blue-400" />
							</div>
							<div>
								<h3 class="text-xl font-bold font-outfit">Magic Generator</h3>
								<p class="text-slate-400 text-sm">Crea datos inteligentes de prueba</p>
							</div>
						</div>

						<div class="space-y-6">
							<div class="space-y-2">
								<label for="providerCountRange" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Cantidad a generar</label>
								<div class="flex items-center gap-3">
									<input id="providerCountRange" type="range" min="1" max="200" bind:value={providerCount} class="flex-1 accent-blue-500" />
									<span class="font-black text-blue-400 w-12 text-right">{providerCount}</span>
								</div>
							</div>

							<button 
								class="w-full py-4 bg-white text-slate-900 rounded-2xl font-black shadow-xl shadow-blue-500/10 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
								on:click={generateSampleProviders}
								disabled={generatingProviders}
							>
								{#if generatingProviders}
									<LoadingSpinner size="sm" color="primary" />
								{:else}
									<Sparkles size={18} />
									Generar Proveedores
								{/if}
							</button>
						</div>
					</div>
				</div>

				<!-- Templates & Docs -->
				<div class="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
					<h3 class="text-lg font-bold font-outfit text-slate-900 mb-6 flex items-center gap-2">
						<HelpCircle size={18} class="text-blue-500" />
						Recursos y Ayuda
					</h3>

					<div class="space-y-4">
						<button 
							class="w-full p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-between group transition-all"
							on:click={() => downloadTemplate('xlsx')}
						>
							<div class="flex items-center gap-3">
								<div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 text-slate-400 group-hover:text-emerald-600 transition-colors">
									<FileSpreadsheet size={20} />
								</div>
								<div class="text-left">
									<div class="text-sm font-bold text-slate-700">Template Excel</div>
									<div class="text-[10px] text-slate-400 uppercase font-black tracking-widest">Formato Recomendado</div>
								</div>
							</div>
							<Download size={16} class="text-slate-300 group-hover:translate-y-1 transition-transform" />
						</button>

						<button 
							class="w-full p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-between group transition-all"
							on:click={() => downloadTemplate('csv')}
						>
							<div class="flex items-center gap-3">
								<div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 text-slate-400 group-hover:text-blue-600 transition-colors">
									<FileText size={20} />
								</div>
								<div class="text-left">
									<div class="text-sm font-bold text-slate-700">Template CSV</div>
									<div class="text-[10px] text-slate-400 uppercase font-black tracking-widest">Soporte Universal</div>
								</div>
							</div>
							<Download size={16} class="text-slate-300 group-hover:translate-y-1 transition-transform" />
						</button>
					</div>

					<div class="mt-8 bg-blue-50 rounded-2xl p-6 border border-blue-100">
						<h4 class="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
							<Shield size={16} />
							Seguridad & Reglas
						</h4>
						<ul class="space-y-2 font-medium text-blue-800 text-xs leading-relaxed">
							<li class="flex items-start gap-2">
								<span class="mt-1">•</span>
								Verifica que el email sea un campo único.
							</li>
							<li class="flex items-start gap-2">
								<span class="mt-1">•</span>
								Los proveedores repetidos se omitirán.
							</li>
							<li class="flex items-start gap-2">
								<span class="mt-1">•</span>
								Se generarán cuentas automáticamente.
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>

		<!-- Extra: JSON Import Section for Advanced Users -->
		{#if !showPreview && !importResult}
			<div class="mt-12 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 animate-in fade-in transition-all">
				<div class="flex items-center gap-4 mb-8">
					<div class="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
						<Code size={24} />
					</div>
					<div>
						<h2 class="text-xl font-bold font-outfit text-slate-900">Importación JSON Avanzada</h2>
						<p class="text-slate-400 text-sm font-medium">Pega código estructurado para creación directa</p>
					</div>
				</div>

				<div class="space-y-6">
					<textarea
						id="simpleProvidersData"
						bind:value={simpleProvidersData}
						rows="6"
						placeholder="[ &#123; 'nombre': '...', 'email': '...' &#125; ]"
						class="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[2rem] text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all font-mono text-xs"
					></textarea>
					
					<div class="flex items-center justify-between">
						<button 
							class="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-2"
							on:click={loadExampleJSON}
						>
							<Sparkles size={14} />
							Cargar ejemplo de estructura
						</button>
						<button 
							class="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all scale-100 active:scale-95 disabled:opacity-50"
							on:click={createSimpleProviders}
							disabled={isCreatingSimple || !simpleProvidersData}
						>
							{#if isCreatingSimple}
								<LoadingSpinner size="sm" color="white" />
							{:else}
								Procesar Bloque JSON
							{/if}
						</button>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<style lang="postcss">
	.animate-in {
		animation-duration: 0.6s;
		animation-fill-mode: both;
	}
	:global(body) {
		background-color: #f8fafc;
	}
</style>