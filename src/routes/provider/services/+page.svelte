<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';
	import { getTemplatesByCategory, type ServiceTemplate } from '$lib/service-templates';

	export let data: any;
	let { session, user } = data;
	$: ({ session, user } = data);

	let providerProfile: any = null;
	let services: any[] = [];
	let categories: any[] = [];
	let providerCategories: any[] = [];
	let loading = true;
	let showAddServiceModal = false;
	let selectedCategory: any = null;
	let availableTemplates: ServiceTemplate[] = [];

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		try {
			// Cargar perfil del proveedor
			const { data: profile, error: profileError } = await supabase
				.from('provider_profiles')
				.select('*')
				.eq('user_id', user.id)
				.single();

			if (profileError) throw profileError;
			providerProfile = profile;

			// Cargar servicios del proveedor
			const { data: svcs, error: svcsError } = await supabase
				.from('services')
				.select(`
					*,
					categories(*)
				`)
				.eq('provider_profile_id', profile.id)
				.order('created_at', { ascending: false });

			if (svcsError) throw svcsError;
			services = svcs || [];

			// Cargar categorías del proveedor
			const { data: providerCats, error: providerCatsError } = await supabase
				.from('provider_categories')
				.select(`
					category_id,
					categories(*)
				`)
				.eq('provider_profile_id', profile.id);

			if (providerCatsError) throw providerCatsError;
			providerCategories = providerCats || [];

			// Cargar todas las categorías disponibles
			const { data: cats, error: catsError } = await supabase
				.from('categories')
				.select('*')
				.order('name');

			if (catsError) throw catsError;
			categories = cats || [];

		} catch (error) {
			console.error('Error loading data:', error);
		} finally {
			loading = false;
		}
	}

	function openAddServiceModal(category: any) {
		selectedCategory = category;
		availableTemplates = getTemplatesByCategory(category.id);
		showAddServiceModal = true;
	}

	function closeAddServiceModal() {
		showAddServiceModal = false;
		selectedCategory = null;
		availableTemplates = [];
	}

	async function addServiceFromTemplate(template: ServiceTemplate) {
		try {
			const { data: newService, error } = await supabase
				.from('services')
				.insert({
					provider_profile_id: providerProfile.id,
					category_id: template.categoryId,
					title: template.title,
					description: template.description,
					price: template.basePrice,
					location: providerProfile.location || 'Managua',
					is_active: true
				})
				.select()
				.single();

			if (error) throw error;

			// Recargar servicios
			await loadData();
			closeAddServiceModal();

		} catch (error) {
			console.error('Error adding service:', error);
		}
	}

	function getServicesByCategory(categoryId: number) {
		return services.filter(service => service.category_id === categoryId);
	}

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('es-NI', {
			style: 'currency',
			currency: 'NIO'
		}).format(amount);
	}
</script>

<svelte:head>
	<title>Mis Servicios - Panel Proveedor | Domify</title>
</svelte:head>

{#if loading}
	<div class="flex flex-col items-center justify-center min-h-[50vh] gap-4">
		<div class="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
		<p class="text-gray-600">Cargando servicios...</p>
	</div>
{:else}
	<div class="max-w-6xl mx-auto px-4">
		<header class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900 mb-2">Mis Servicios</h1>
			<p class="text-lg text-gray-600">Gestiona los servicios que ofreces a tus clientes</p>
		</header>

		<div class="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
			{#if providerCategories.length > 0}
				<div class="space-y-8">
					{#each providerCategories as providerCat}
						{@const category = providerCat.categories}
						{@const categoryServices = getServicesByCategory(category.id)}
						
						<div class="border border-gray-200 rounded-lg p-6">
							<div class="flex justify-between items-center mb-6">
								<div class="flex items-center gap-3">
									<span class="text-2xl">{category.icon}</span>
									<div>
										<h2 class="text-xl font-semibold text-gray-900">{category.name}</h2>
										<p class="text-gray-600">{category.description}</p>
									</div>
								</div>
								<button 
									on:click={() => openAddServiceModal(category)}
									class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
								>
									+ Agregar Servicio
								</button>
							</div>

							{#if categoryServices.length > 0}
								<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									{#each categoryServices as service}
										<div class="border border-gray-200 rounded-lg p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-blue-500">
											<div class="flex justify-between items-start mb-3">
												<h3 class="text-lg font-semibold text-gray-900 flex-1">{service.title}</h3>
												<span class="px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wide {service.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
													{service.is_active ? 'Activo' : 'Inactivo'}
												</span>
											</div>
											<p class="text-gray-600 text-sm mb-3 leading-relaxed">{service.description}</p>
											<div class="flex justify-between items-center">
												<span class="text-lg font-bold text-blue-600">{formatCurrency(service.price)}</span>
												<span class="text-sm text-gray-500">📍 {service.location || 'Sin ubicación'}</span>
											</div>
										</div>
									{/each}
								</div>
							{:else}
								<div class="text-center py-8 bg-gray-50 rounded-lg">
									<div class="text-3xl mb-2">{category.icon}</div>
									<h3 class="text-lg font-semibold text-gray-900 mb-2">No hay servicios en {category.name}</h3>
									<p class="text-gray-600 mb-4">Agrega servicios específicos de esta categoría para que los clientes puedan encontrarte.</p>
									<button 
										on:click={() => openAddServiceModal(category)}
										class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
									>
										Agregar Primer Servicio
									</button>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{:else}
				<div class="text-center py-12">
					<div class="text-4xl mb-4">🛠️</div>
					<h3 class="text-xl font-semibold text-gray-900 mb-2">No tienes categorías configuradas</h3>
					<p class="text-gray-600 mb-6">Primero necesitas configurar las categorías de servicios en tu perfil.</p>
					<a href="/provider/profile" class="btn-primary">Configurar Perfil</a>
				</div>
			{/if}
		</div>
	</div>
{/if}

<!-- Modal para agregar servicios -->
{#if showAddServiceModal}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
		<div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
			<div class="p-6 border-b border-gray-200">
				<div class="flex justify-between items-center">
					<div class="flex items-center gap-3">
						<span class="text-2xl">{selectedCategory.icon}</span>
						<div>
							<h2 class="text-xl font-semibold text-gray-900">Agregar Servicios - {selectedCategory.name}</h2>
							<p class="text-gray-600">Selecciona los servicios específicos que ofreces</p>
						</div>
					</div>
					<button 
						on:click={closeAddServiceModal}
						class="text-gray-400 hover:text-gray-600 text-2xl"
					>
						×
					</button>
				</div>
			</div>

			<div class="p-6">
				{#if availableTemplates.length > 0}
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						{#each availableTemplates as template}
							<div class="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors">
								<div class="flex items-start gap-3 mb-3">
									<span class="text-2xl">{template.icon}</span>
									<div class="flex-1">
										<h3 class="font-semibold text-gray-900">{template.title}</h3>
										<p class="text-sm text-gray-600 mt-1">{template.description}</p>
									</div>
								</div>
								<div class="flex justify-between items-center">
									<span class="text-lg font-bold text-blue-600">{formatCurrency(template.basePrice)}</span>
									<button 
										on:click={() => addServiceFromTemplate(template)}
										class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
									>
										Agregar Servicio
									</button>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="text-center py-8">
						<div class="text-4xl mb-4">📝</div>
						<h3 class="text-lg font-semibold text-gray-900 mb-2">No hay plantillas disponibles</h3>
						<p class="text-gray-600">Próximamente podrás agregar servicios personalizados.</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<!-- CSS convertido a clases de Tailwind --> 