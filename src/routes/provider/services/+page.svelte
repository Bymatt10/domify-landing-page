<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';

	export let data: any;
	let { session, user } = data;
	$: ({ session, user } = data);

	let providerProfile: any = null;
	let services: any[] = [];
	let categories: any[] = [];
	let loading = true;

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

			// Cargar categorías disponibles
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
			{#if services.length > 0}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each services as service}
						<div class="border border-gray-200 rounded-lg p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-blue-500">
							<div class="flex justify-between items-start mb-4">
								<h3 class="text-lg font-semibold text-gray-900 flex-1">{service.title}</h3>
								<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ml-2">
									{service.categories?.name}
								</span>
							</div>
							<p class="text-gray-600 text-sm mb-4 leading-relaxed">{service.description}</p>
							<div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
								<span class="text-lg font-bold text-blue-600">{formatCurrency(service.price)}</span>
								<span class="text-sm text-gray-500">📍 {service.location || 'Sin ubicación'}</span>
							</div>
							<div class="flex justify-end">
								<span class="px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wide {service.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
									{service.is_active ? 'Activo' : 'Inactivo'}
								</span>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="text-center py-12">
					<div class="text-4xl mb-4">🛠️</div>
					<h3 class="text-xl font-semibold text-gray-900 mb-2">No tienes servicios configurados</h3>
					<p class="text-gray-600 mb-6">Comienza agregando los servicios que ofreces a tus clientes.</p>
					<button class="btn-primary">Agregar Primer Servicio</button>
				</div>
			{/if}
		</div>
	</div>
{/if}

<!-- CSS convertido a clases de Tailwind --> 