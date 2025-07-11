<script lang="ts">
	import { goto } from '$app/navigation';
	import { createEventDispatcher } from 'svelte';

	export let placeholder = '¿Qué servicio o profesional buscas?';
	export let categories: Array<{id: string, name: string, description: string, icon: string}> = [];
	
	const dispatch = createEventDispatcher();

	let searchQuery = '';
	let isSearching = false;
	let showSuggestions = false;
	let selectedIndex = -1;

	// Personas (proveedores)
	let people: Array<{id: string, name: string, email: string, photo_url?: string}> = [];
	let peopleLoading = false;

	// Servicios sugeridos
	let serviceSuggestions: Array<{id: string, title: string, description: string, provider_profile_id: string, provider_name: string, category_slug: string}> = [];
	let servicesLoading = false;

	$: filteredCategories = categories.filter(category =>
		category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
		category.description.toLowerCase().includes(searchQuery.toLowerCase())
	).slice(0, 5);

	// Buscar personas (proveedores) al escribir
	$: if (searchQuery.length > 1) {
		peopleLoading = true;
		fetch(`/api/admin/providers?search=${encodeURIComponent(searchQuery)}&limit=5`)
			.then(r => r.json())
			.then(data => {
				people = (data.providers || []).map((p: any) => ({
					id: p.id,
					name: p.business_name,
					email: p.user?.email || '',
					photo_url: p.photo_url
				}));
			})
			.finally(() => peopleLoading = false);
	} else {
		people = [];
	}

	// Buscar servicios al escribir
	$: if (searchQuery.length > 1) {
		servicesLoading = true;
		fetch(`/api/services?search=${encodeURIComponent(searchQuery)}&limit=5`)
			.then(r => r.json())
			.then(data => {
				serviceSuggestions = (data.data?.services || []).map((s: any) => ({
					id: s.id,
					title: s.title,
					description: s.description,
					provider_profile_id: s.provider_profile_id,
					provider_name: s.provider_profiles?.business_name || 'Proveedor',
					category_slug: s.categories?.slug || ''
				}));
			})
			.finally(() => servicesLoading = false);
	} else {
		serviceSuggestions = [];
	}

	async function handleSearch() {
		if (searchQuery.trim()) {
			isSearching = true;
			dispatch('search', { query: searchQuery.trim() });
			await new Promise(resolve => setTimeout(resolve, 300));
			goto(`/services?search=${encodeURIComponent(searchQuery.trim())}`);
		}
		isSearching = false;
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			const totalSuggestions = filteredCategories.length + people.length + serviceSuggestions.length;
			if (selectedIndex >= 0) {
				if (selectedIndex < filteredCategories.length) {
					selectCategory(filteredCategories[selectedIndex]);
				} else if (selectedIndex < filteredCategories.length + people.length) {
					selectPerson(people[selectedIndex - filteredCategories.length]);
				} else {
					selectService(serviceSuggestions[selectedIndex - filteredCategories.length - people.length]);
				}
			} else {
				handleSearch();
			}
		} else if (event.key === 'ArrowDown') {
			event.preventDefault();
			selectedIndex = Math.min(selectedIndex + 1, filteredCategories.length + people.length + serviceSuggestions.length - 1);
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			selectedIndex = Math.max(selectedIndex - 1, -1);
		} else if (event.key === 'Escape') {
			showSuggestions = false;
			selectedIndex = -1;
		}
	}

	function selectCategory(category: any) {
		searchQuery = category.name;
		showSuggestions = false;
		selectedIndex = -1;
		goto(`/services/${category.id}`);
	}

	function selectPerson(person: any) {
		searchQuery = person.name;
		showSuggestions = false;
		selectedIndex = -1;
		goto(`/profile/${person.id}`);
	}

	function selectService(service: any) {
		searchQuery = service.title;
		showSuggestions = false;
		selectedIndex = -1;
		if (service.category_slug) {
			goto(`/services/${service.category_slug}`);
		} else {
			goto(`/services`);
		}
	}

	function handleFocus() {
		showSuggestions = true;
		selectedIndex = -1;
	}

	function handleBlur() {
		// Delay hiding suggestions to allow clicks
		setTimeout(() => {
			showSuggestions = false;
			selectedIndex = -1;
		}, 200);
	}
</script>

<div class="relative w-full max-w-2xl mx-auto">
	<!-- Search Input -->
	<div class="relative">
		<div class="flex bg-white rounded-2xl shadow-soft border border-secondary-200 overflow-hidden transition-all duration-200 focus-within:shadow-lg focus-within:border-primary-300">
			<div class="flex-1 relative">
				<input
					type="text"
					{placeholder}
					bind:value={searchQuery}
					on:keydown={handleKeyPress}
					on:focus={handleFocus}
					on:blur={handleBlur}
					class="w-full pl-10 px-4 py-3 text-sm sm:text-base text-secondary-900 placeholder-secondary-400 border-0 focus:outline-none focus:ring-0 bg-transparent"
					aria-label="Buscar servicio o profesional"
					aria-expanded={showSuggestions && searchQuery && (filteredCategories.length > 0 || people.length > 0 || serviceSuggestions.length > 0) ? true : false}
					aria-haspopup="listbox"
					aria-controls="search-suggestions"
					role="combobox"
				/>
				<!-- Search Icon (always visible, centered) -->
				<div class="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
					<svg class="w-4 h-4 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
					</svg>
				</div>
			</div>
			<button 
				on:click={handleSearch} 
				class="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
				disabled={isSearching}
				aria-label="Buscar"
			>
				{#if isSearching}
					<svg class="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
				{:else}
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
					</svg>
				{/if}
			</button>
		</div>
	</div>

	<!-- Suggestions Dropdown -->
	{#if showSuggestions && searchQuery && (filteredCategories.length > 0 || people.length > 0 || serviceSuggestions.length > 0)}
		<div 
			id="search-suggestions"
			class="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-secondary-200 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200"
			role="listbox"
			aria-label="Sugerencias de búsqueda"
		>
			{#if filteredCategories.length > 0}
				<div class="px-4 pt-3 pb-1 text-xs text-secondary-500 font-semibold">Categorías</div>
				{#each filteredCategories as category, index}
					<button 
						class="w-full p-4 flex items-center space-x-4 hover:bg-primary-50 transition-colors duration-150 text-left border-b border-secondary-100 last:border-b-0"
						class:bg-primary-50={selectedIndex === index}
						class:text-primary-700={selectedIndex === index}
						role="option"
						aria-selected={selectedIndex === index}
						on:click={() => selectCategory(category)}
					>
						<div class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
							{#if category.icon && (category.icon.startsWith('/') || category.icon.startsWith('http'))}
								<img src={category.icon} alt="" class="w-5 h-5 object-contain filter brightness-0 invert" />
							{:else}
								<span class="text-xl select-none">{category.icon}</span>
							{/if}
						</div>
						<div class="flex-1 min-w-0">
							<div class="font-semibold text-secondary-900 text-sm">{category.name}</div>
							<div class="text-secondary-600 text-xs truncate">{category.description}</div>
						</div>
					</button>
				{/each}
			{/if}
			{#if serviceSuggestions.length > 0}
				<div class="px-4 pt-3 pb-1 text-xs text-secondary-500 font-semibold">Servicios</div>
				{#each serviceSuggestions as service, i}
					<button 
						class="w-full p-4 flex items-center space-x-4 hover:bg-blue-50 transition-colors duration-150 text-left border-b border-secondary-100 last:border-b-0"
						class:bg-blue-50={selectedIndex === (filteredCategories.length + i)}
						class:text-blue-700={selectedIndex === (filteredCategories.length + i)}
						role="option"
						aria-selected={selectedIndex === (filteredCategories.length + i)}
						on:click={() => selectService(service)}
					>
						<div class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-200 to-blue-400 rounded-lg flex items-center justify-center">
							<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2a4 4 0 018 0v2M5 21v-2a4 4 0 018 0v2M9 7V5a4 4 0 018 0v2"/></svg>
						</div>
						<div class="flex-1 min-w-0">
							<div class="font-semibold text-secondary-900 text-sm">{service.title}</div>
							<div class="text-secondary-600 text-xs truncate">{service.description}</div>
							<div class="text-xs text-secondary-500 mt-1">Proveedor: {service.provider_name}</div>
						</div>
					</button>
				{/each}
			{/if}
			{#if people.length > 0}
				<div class="px-4 pt-3 pb-1 text-xs text-secondary-500 font-semibold">Profesionales</div>
				{#each people as person, i}
					<button 
						class="w-full p-4 flex items-center space-x-4 hover:bg-primary-50 transition-colors duration-150 text-left border-b border-secondary-100 last:border-b-0"
						class:bg-primary-50={selectedIndex === (filteredCategories.length + serviceSuggestions.length + i)}
						class:text-primary-700={selectedIndex === (filteredCategories.length + serviceSuggestions.length + i)}
						role="option"
						aria-selected={selectedIndex === (filteredCategories.length + serviceSuggestions.length + i)}
						on:click={() => selectPerson(person)}
					>
						<div class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center overflow-hidden">
							{#if person.photo_url}
								<img src={person.photo_url} alt="" class="w-8 h-8 object-cover rounded-full" />
							{:else}
								<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
								</svg>
							{/if}
						</div>
						<div class="flex-1 min-w-0">
							<div class="font-semibold text-secondary-900 text-sm">{person.name}</div>
							<div class="text-secondary-600 text-xs truncate">{person.email}</div>
						</div>
					</button>
				{/each}
			{/if}
			{#if peopleLoading || servicesLoading}
				<div class="p-4 text-center text-secondary-400 text-sm">Buscando...</div>
			{/if}
		</div>
	{/if}

	<!-- No Results -->
	{#if showSuggestions && searchQuery && filteredCategories.length === 0 && people.length === 0 && serviceSuggestions.length === 0 && !peopleLoading && !servicesLoading}
		<div class="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-secondary-200 p-6 z-50 text-center">
			<svg class="w-12 h-12 text-secondary-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
			</svg>
			<p class="text-secondary-600 font-medium">No encontramos resultados para "{searchQuery}"</p>
			<p class="text-secondary-500 text-sm mt-1">Intenta con palabras más generales</p>
		</div>
	{/if}
</div>

<style>
	@keyframes slide-in-from-top-2 {
		from {
			opacity: 0;
			transform: translateY(-8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	
	.animate-in {
		animation: slide-in-from-top-2 0.2s ease-out;
	}
</style> 