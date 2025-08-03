<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';


	let isMenuOpen = false;
	let isDropdownOpen = false;

	export let session: any = null;
	export let user: any = null;
	export let isProvider: boolean = false;
	export let isAdmin: boolean = false;

	// Ensure boolean values
	$: isProvider = isProvider || user?.user_metadata?.role === 'provider';
	$: isAdmin = isAdmin || user?.user_metadata?.role === 'admin';

	// Fallback: calcular isAdmin directamente desde user metadata
	$: computedIsAdmin = user?.user_metadata?.role === 'admin';
	$: finalIsAdmin = isAdmin || computedIsAdmin;

	// Función para generar un hash simple del avatar_url para cache busting
	function getAvatarHash(avatarUrl: string): string {
		if (!avatarUrl) return '0';
		// Crear un hash simple basado en la URL
		let hash = 0;
		for (let i = 0; i < avatarUrl.length; i++) {
			const char = avatarUrl.charCodeAt(i);
			hash = ((hash << 5) - hash) + char;
			hash = hash & hash; // Convertir a 32-bit integer
		}
		return Math.abs(hash).toString();
	}

	// Variable reactiva para cache busting del avatar
	$: avatarVersion = user?.user_metadata?.avatar_url ? getAvatarHash(user.user_metadata.avatar_url) : '0';

	// Función para obtener la URL de la imagen de perfil
	function getProfileImageUrl(user: any): string | null {
		if (!user?.user_metadata) return null;
		
		// Priorizar avatar_url sobre picture
		const imageUrl = user.user_metadata.avatar_url || user.user_metadata.picture;
		
		if (!imageUrl) return null;
		
		// Por ahora, no usar cache busting para probar
		return imageUrl;
	}

	// Función para manejar errores de imagen
	function handleImageError(event: Event) {
		const img = event.target as HTMLImageElement;
		if (img) {
			// Error cargando imagen de perfil, ocultando imagen
			img.style.display = 'none';
		}
	}

	async function handleLogout() {
		const { error } = await supabase.auth.signOut();
		if (error) {
			console.error('Error logging out:', error.message);
		} else {
			await invalidateAll();
			goto('/');
		}
	}

	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
	}

	function getInitial(user: any) {
		const name = user?.user_metadata?.first_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || '';
		return name.charAt(0).toUpperCase();
	}
</script>

<nav class="bg-white shadow-sm sticky top-0 z-50 transition-all duration-200 border-b border-gray-200">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex justify-between items-center py-2">
			<a href="/" class="flex items-center no-underline gap-2" aria-label="Ir a la página principal de Domify">
				<!-- Logo Icon -->
				<img src="/icon-domify.png" alt="Domify logo" class="w-11 h-11 rounded-lg object-contain" />
				<!-- Brand Name -->
				<span class="font-lexend text-gray-900 text-2xl font-bold tracking-tight hover:text-primary-700 transition-colors duration-200">Domify</span>
			</a>

			<!-- Desktop: links a la derecha -->
			<div class="flex items-center gap-4">
				<div class="hidden 2xl:flex items-center gap-6">
					<a href="/" class="text-gray-900 text-base font-medium hover:text-primary-600 transition-colors duration-200 whitespace-nowrap">Inicio</a>
					<a href="/services" class="text-gray-900 text-base font-medium hover:text-primary-600 transition-colors duration-200 whitespace-nowrap">Servicios</a>
					<a href="/about" class="text-gray-900 text-base font-medium hover:text-primary-600 transition-colors duration-200 whitespace-nowrap">Quiénes somos</a>
					<a href="/contact" class="text-gray-900 text-base font-medium hover:text-primary-600 transition-colors duration-200 whitespace-nowrap">Contacto</a>
					{#if session}
						{#if finalIsAdmin}
							<a href="/admin" class="text-gray-900 text-base font-medium hover:text-primary-600 transition-colors duration-200 whitespace-nowrap">Panel Admin</a>
						{/if}
						<div class="flex items-center gap-4" role="group" aria-label="Menú de usuario">
							<div class="relative" tabIndex="0" on:blur={() => isDropdownOpen = false}>
								<button class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200" on:click={() => isDropdownOpen = !isDropdownOpen} aria-haspopup="true" aria-expanded={isDropdownOpen}>
									{#if getProfileImageUrl(user)}
										<img src={getProfileImageUrl(user)} alt="Avatar" class="w-8 h-8 rounded-full object-cover" on:error={handleImageError} />
									{:else if (user?.user_metadata?.first_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email)}
										<div class="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-medium">{getInitial(user)}</div>
									{:else}
										<svg class="w-8 h-8 text-gray-400" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2" fill="none"/><path d="M4 20c0-4 4-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="2" fill="none"/></svg>
									{/if}
									<span class="text-gray-900 text-base font-medium">{user?.user_metadata?.first_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email}</span>
									<svg class="w-4 h-4 text-gray-400" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5" stroke="currentColor" stroke-width="2" fill="none"/></svg>
								</button>
								{#if isDropdownOpen}
									<div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
										<a href="/" class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"><svg width="16" height="16" viewBox="0 0 24 24"><path d="M3 12l9-9 9 9v8a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8z" stroke="currentColor" stroke-width="2" fill="none"/></svg> Inicio</a>
										<a href="/profile" class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"><svg width="16" height="16" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2" fill="none"/><path d="M4 20c0-4 4-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="2" fill="none"/></svg> Mi perfil</a>
										{#if finalIsAdmin}
											<a href="/admin" class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"><svg width="16" height="16" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><path d="M7 7h10v10H7z" stroke="currentColor" stroke-width="2" fill="none"/></svg> Panel Admin</a>
										{/if}
										{#if isProvider}
											<a href="/provider" class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"><svg width="16" height="16" viewBox="0 0 24 24"><path d="M3 3h18v18H3z" stroke="currentColor" stroke-width="2" fill="none"/><path d="M9 9h6v6H9z" stroke="currentColor" stroke-width="2" fill="none"/></svg> Dashboard Proveedor</a>
										{/if}
										<a href="/ayuda" class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"><svg width="16" height="16" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><path d="M9 9a3 3 0 0 1 6 0c0 2-3 3-3 5" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="17" r="1" fill="currentColor"/></svg> Ayuda en línea</a>
										<div class="border-t border-gray-200 my-1"></div>
										<button on:click={handleLogout} class="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 w-full text-left"><svg width="16" height="16" viewBox="0 0 24 24"><path d="M16 17l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke="currentColor" stroke-width="2" fill="none"/></svg> Cerrar sesión</button>
									</div>
								{/if}
							</div>
						</div>
					{:else}
						<div class="flex gap-4" role="group" aria-label="Botones de autenticación">
							<a href="/auth/login" class="btn-secondary">Iniciar Sesión</a>
							<a href="/auth/signup" class="btn-primary">Registrarse</a>
						</div>
					{/if}
				</div>
				<!-- Menú hamburguesa en mobile -->
				<div class="flex items-center gap-2 2xl:hidden">
					<button 
						class="flex items-center justify-center w-10 h-10 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 hover:scale-105 transition-all duration-200 text-gray-700" 
						on:click={toggleMenu}
						aria-label="Alternar menú de navegación"
						aria-expanded={isMenuOpen}
					>
						<svg viewBox="0 0 24 24" class="w-5 h-5" aria-hidden="true">
							<path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
						</svg>
					</button>
				</div>
			</div>
		</div>
		<!-- Mobile: menú desplegable -->
		<div 
			class="2xl:hidden {isMenuOpen ? 'block' : 'hidden'} pb-4 border-t border-gray-200 mt-2" 
			role="navigation"
			aria-label="Menú principal"
		>
			<a href="/" class="block px-4 py-2 text-gray-900 hover:text-primary-600 hover:bg-gray-50 transition-colors duration-200">Inicio</a>
			<a href="/services" class="block px-4 py-2 text-gray-900 hover:text-primary-600 hover:bg-gray-50 transition-colors duration-200">Servicios</a>
			<a href="/about" class="block px-4 py-2 text-gray-900 hover:text-primary-600 hover:bg-gray-50 transition-colors duration-200">Quiénes somos</a>
			<a href="/contact" class="block px-4 py-2 text-gray-900 hover:text-primary-600 hover:bg-gray-50 transition-colors duration-200">Contacto</a>
			{#if session}
				{#if finalIsAdmin}
					<a href="/admin" class="block px-4 py-2 text-gray-900 hover:text-primary-600 hover:bg-gray-50 transition-colors duration-200">Panel Admin</a>
				{/if}
				<div class="px-4 py-2" role="group" aria-label="Menú de usuario">
					<div class="relative" tabIndex="0" on:blur={() => isDropdownOpen = false}>
						<button class="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200" on:click={() => isDropdownOpen = !isDropdownOpen} aria-haspopup="true" aria-expanded={isDropdownOpen}>
							{#if getProfileImageUrl(user)}
								<img src={getProfileImageUrl(user)} alt="Avatar" class="w-8 h-8 rounded-full object-cover" on:error={handleImageError} />
							{:else if (user?.user_metadata?.first_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email)}
								<div class="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-medium">{getInitial(user)}</div>
							{:else}
								<svg class="w-8 h-8 text-gray-400" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2" fill="none"/><path d="M4 20c0-4 4-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="2" fill="none"/></svg>
							{/if}
							<span class="text-gray-900 text-base font-medium">{user?.user_metadata?.first_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email}</span>
							<svg class="w-4 h-4 text-gray-400 ml-auto" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5" stroke="currentColor" stroke-width="2" fill="none"/></svg>
						</button>
						{#if isDropdownOpen}
							<div class="mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
								<a href="/" class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"><svg width="16" height="16" viewBox="0 0 24 24"><path d="M3 12l9-9 9 9v8a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8z" stroke="currentColor" stroke-width="2" fill="none"/></svg> Inicio</a>
								<a href="/profile" class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"><svg width="16" height="16" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2" fill="none"/><path d="M4 20c0-4 4-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="2" fill="none"/></svg> Mi perfil</a>
								{#if finalIsAdmin}
									<a href="/admin" class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"><svg width="16" height="16" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><path d="M7 7h10v10H7z" stroke="currentColor" stroke-width="2" fill="none"/></svg> Panel Admin</a>
								{/if}
								{#if isProvider}
									<a href="/provider" class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"><svg width="16" height="16" viewBox="0 0 24 24"><path d="M3 3h18v18H3z" stroke="currentColor" stroke-width="2" fill="none"/><path d="M9 9h6v6H9z" stroke="currentColor" stroke-width="2" fill="none"/></svg> Dashboard Proveedor</a>
								{/if}
								<a href="/ayuda" class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"><svg width="16" height="16" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><path d="M9 9a3 3 0 0 1 6 0c0 2-3 3-3 5" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="17" r="1" fill="currentColor"/></svg> Ayuda en línea</a>
								<div class="border-t border-gray-200 my-1"></div>
								<button on:click={handleLogout} class="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 w-full text-left"><svg width="16" height="16" viewBox="0 0 24 24"><path d="M16 17l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke="currentColor" stroke-width="2" fill="none"/></svg> Cerrar sesión</button>
							</div>
						{/if}
					</div>
				</div>
			{:else}
				<div class="px-4 py-2 space-y-2">
					<a href="/auth/login" class="btn-secondary block text-center">Iniciar Sesión</a>
					<a href="/auth/signup" class="btn-primary block text-center">Registrarse</a>
				</div>
			{/if}
		</div>
	</div>
</nav>

 