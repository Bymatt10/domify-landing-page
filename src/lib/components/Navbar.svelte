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

	console.log('USER OBJETO:', user);
	console.log('isProvider:', isProvider, 'isAdmin:', isAdmin);

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

<nav class="navbar">
	<div class="container">
		<div class="navbar-content">
			<a href="/" class="logo" aria-label="Ir a la página principal de Domify">
				<span>Domify</span>
			</a>

			<!-- Desktop: links a la derecha -->
			<div class="navbar-right">
				<div class="nav-links-desktop">
					<a href="/" class="nav-link">Inicio</a>
					<a href="/services" class="nav-link">Servicios</a>
					<a href="/about" class="nav-link">Quiénes somos</a>
					{#if session}
						{#if isAdmin}
							<a href="/admin" class="nav-link">Panel Admin</a>
						{/if}
						<div class="user-menu" role="group" aria-label="Menú de usuario">
							<div class="dropdown" tabIndex="0" on:blur={() => isDropdownOpen = false}>
								<button class="user-dropdown-toggle" on:click={() => isDropdownOpen = !isDropdownOpen} aria-haspopup="true" aria-expanded={isDropdownOpen}>
									{#if user?.user_metadata?.avatar_url || user?.user_metadata?.picture}
										<img src={(user.user_metadata.avatar_url || user.user_metadata.picture) + '?v=' + avatarVersion} alt="Avatar" class="avatar" on:error={(e) => { const img = e.target as HTMLImageElement; if (img) img.style.display = 'none'; }} />
									{:else if (user?.user_metadata?.first_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email)}
										<div class="avatar avatar-initial">{getInitial(user)}</div>
									{:else}
										<svg class="avatar avatar-default" width="40" height="40" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2" fill="none"/><path d="M4 20c0-4 4-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="2" fill="none"/></svg>
									{/if}
									<span class="user-name">{user?.user_metadata?.first_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email}</span>
									<svg class="dropdown-arrow" width="16" height="16" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5" stroke="currentColor" stroke-width="2" fill="none"/></svg>
								</button>
								{#if isDropdownOpen}
									<div class="dropdown-menu">
										<a href="/" class="dropdown-item"><svg width="20" height="20" viewBox="0 0 24 24"><path d="M3 12l9-9 9 9v8a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8z" stroke="currentColor" stroke-width="2" fill="none"/></svg> Inicio</a>
										<a href="/profile" class="dropdown-item"><svg width="20" height="20" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2" fill="none"/><path d="M4 20c0-4 4-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="2" fill="none"/></svg> Mi perfil</a>
										{#if isAdmin}
											<a href="/admin" class="dropdown-item"><svg width="20" height="20" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><path d="M7 7h10v10H7z" stroke="currentColor" stroke-width="2" fill="none"/></svg> Panel Admin</a>
										{/if}
										{#if isProvider}
											<a href="/provider" class="dropdown-item"><svg width="20" height="20" viewBox="0 0 24 24"><path d="M3 3h18v18H3z" stroke="currentColor" stroke-width="2" fill="none"/><path d="M9 9h6v6H9z" stroke="currentColor" stroke-width="2" fill="none"/></svg> Dashboard Proveedor</a>
										{/if}
										<a href="/ayuda" class="dropdown-item"><svg width="20" height="20" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><path d="M9 9a3 3 0 0 1 6 0c0 2-3 3-3 5" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="17" r="1" fill="currentColor"/></svg> Ayuda en línea</a>
									</div>
								{/if}
							</div>
						</div>
					{:else}
						<div class="auth-buttons" role="group" aria-label="Botones de autenticación">
							<a href="/auth/login" class="btn btn-secondary">Iniciar Sesión</a>
							<a href="/auth/signup" class="btn btn-primary">Registrarse</a>

						</div>
					{/if}
				</div>
				<!-- Menú hamburguesa en mobile -->
				<div class="mobile-controls">
					<button 
						class="menu-toggle" 
						on:click={toggleMenu}
						aria-label="Alternar menú de navegación"
						aria-expanded={isMenuOpen}
					>
						<svg viewBox="0 0 24 24" class="icon" aria-hidden="true">
							<path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
						</svg>
					</button>
				</div>
			</div>
		</div>
		<!-- Mobile: menú desplegable -->
		<div 
			class="nav-links-mobile" 
			class:open={isMenuOpen}
			role="navigation"
			aria-label="Menú principal"
		>
			<a href="/" class="nav-link">Inicio</a>
			<a href="/services" class="nav-link">Servicios</a>
			<a href="/about" class="nav-link">Quiénes somos</a>
			{#if session}
				{#if isAdmin}
					<a href="/admin" class="nav-link">Panel Admin</a>
				{/if}
				<div class="user-menu" role="group" aria-label="Menú de usuario">
					<div class="dropdown" tabIndex="0" on:blur={() => isDropdownOpen = false}>
						<button class="user-dropdown-toggle" on:click={() => isDropdownOpen = !isDropdownOpen} aria-haspopup="true" aria-expanded={isDropdownOpen}>
							{#if user?.user_metadata?.avatar_url || user?.user_metadata?.picture}
								<img src={(user.user_metadata.avatar_url || user.user_metadata.picture) + '?v=' + avatarVersion} alt="Avatar" class="avatar" on:error={(e) => { const img = e.target as HTMLImageElement; if (img) img.style.display = 'none'; }} />
							{:else if (user?.user_metadata?.first_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email)}
								<div class="avatar avatar-initial">{getInitial(user)}</div>
							{:else}
								<svg class="avatar avatar-default" width="40" height="40" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2" fill="none"/><path d="M4 20c0-4 4-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="2" fill="none"/></svg>
							{/if}
							<span class="user-name">{user?.user_metadata?.first_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email}</span>
							<svg class="dropdown-arrow" width="16" height="16" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5" stroke="currentColor" stroke-width="2" fill="none"/></svg>
						</button>
						{#if isDropdownOpen}
							<div class="dropdown-menu">
								<a href="/" class="dropdown-item"><svg width="20" height="20" viewBox="0 0 24 24"><path d="M3 12l9-9 9 9v8a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8z" stroke="currentColor" stroke-width="2" fill="none"/></svg> Inicio</a>
								<a href="/profile" class="dropdown-item"><svg width="20" height="20" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2" fill="none"/><path d="M4 20c0-4 4-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="2" fill="none"/></svg> Mi perfil</a>
								{#if isAdmin}
									<a href="/admin" class="dropdown-item"><svg width="20" height="20" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><path d="M7 7h10v10H7z" stroke="currentColor" stroke-width="2" fill="none"/></svg> Panel Admin</a>
								{/if}
								{#if isProvider}
									<a href="/provider" class="dropdown-item"><svg width="20" height="20" viewBox="0 0 24 24"><path d="M3 3h18v18H3z" stroke="currentColor" stroke-width="2" fill="none"/><path d="M9 9h6v6H9z" stroke="currentColor" stroke-width="2" fill="none"/></svg> Dashboard Proveedor</a>
								{/if}
								<a href="/ayuda" class="dropdown-item"><svg width="20" height="20" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><path d="M9 9a3 3 0 0 1 6 0c0 2-3 3-3 5" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="17" r="1" fill="currentColor"/></svg> Ayuda en línea</a>
							</div>
						{/if}
					</div>
				</div>
			{:else}
				<div class="auth-buttons-mobile">
					<a href="/auth/login" class="btn btn-secondary">Iniciar Sesión</a>
					<a href="/auth/signup" class="btn btn-primary">Registrarse</a>
				</div>
			{/if}
		</div>
	</div>
</nav>

<style>
	.navbar {
		background-color: var(--color-background-white);
		box-shadow: var(--shadow-sm);
		position: sticky;
		top: 0;
		z-index: 50;
		transition: all var(--transition-fast);
		border-bottom: 1px solid var(--color-border-light, rgba(0, 0, 0, 0.1));
	}



	.navbar-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-xs) 0;
	}

	.navbar-right {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
	}

	.logo {
		display: flex;
		align-items: center;
		color: var(--color-primary);
		font-size: var(--font-size-2xl);
		font-weight: 700;
		text-decoration: none;
		letter-spacing: -0.5px;
		transition: color var(--transition-fast);
	}

	.logo:hover {
		color: var(--color-primary);
	}

	.nav-links-desktop {
		display: none;
		align-items: center;
		gap: 1.5rem;
	}

	.nav-link {
		color: var(--color-text);
		font-size: var(--font-size-base);
		transition: color var(--transition-fast);
		font-weight: 500;
		white-space: nowrap;
	}

	.nav-link:hover {
		color: var(--color-primary);
	}

	.user-menu {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
	}

	.user-name {
		color: var(--color-text);
		font-size: var(--font-size-base);
		font-weight: 500;
	}



	.auth-buttons {
		display: flex;
		gap: 1rem;
		width: 100%;
		justify-content: center;
	}

	.btn {
		padding: var(--spacing-sm) var(--spacing-lg);
		border-radius: var(--border-radius-md);
		font-size: var(--font-size-base);
		font-weight: 600;
		transition: all var(--transition-fast);
		border: 1.5px solid transparent;
		min-width: 160px;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 52px;
		box-sizing: border-box;
	}

	.btn-primary {
		background-color: var(--color-primary);
		color: var(--color-text-white);
		border-color: var(--color-primary);
	}

	.btn-primary:hover {
		background-color: var(--color-primary-hover);
		border-color: var(--color-primary-hover);
		transform: translateY(-1px);
		box-shadow: var(--shadow-sm);
	}

	.btn-secondary {
		background-color: var(--color-background-card);
		color: var(--color-primary);
		border-color: var(--color-primary);
	}

	.btn-secondary:hover {
		background-color: var(--color-primary);
		color: var(--color-text-white);
		border-color: var(--color-primary-hover);
		transform: translateY(-1px);
		box-shadow: var(--shadow-sm);
	}



	.menu-toggle {
		display: block;
		background: rgba(0, 0, 0, 0.1);
		border: 1px solid rgba(0, 0, 0, 0.2);
		cursor: pointer;
		padding: var(--spacing-sm);
		border-radius: var(--border-radius-sm);
		transition: all var(--transition-fast);
		color: var(--color-text);
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.menu-toggle .icon {
		width: 20px;
		height: 20px;
		color: var(--color-text);
	}

	.menu-toggle:hover {
		background-color: rgba(0, 0, 0, 0.2);
		transform: scale(1.05);
	}

	.nav-links-mobile {
		display: none;
	}

	.mobile-controls {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}
	
	@media (max-width: 1440px) {
		.nav-links-desktop {
			display: none;
		}
		.mobile-controls {
			display: flex;
		}
	}

	@media (min-width: 1441px) {
		.mobile-controls {
			display: none !important;
		}
		.nav-links-desktop {
			display: flex !important;
		}
	}

	@media (max-width: 1440px) {
		.nav-links-mobile {
			display: none;
			position: absolute;
			top: 100%;
			right: 0;
			background-color: var(--color-background-white);
			box-shadow: var(--shadow-md);
			padding: var(--spacing-md);
			flex-direction: column;
			gap: var(--spacing-md);
			z-index: 100;
			width: 220px;
		}
		.nav-links-mobile.open {
			display: flex;
		}

	}

	@media (max-width: 480px) {
		.navbar-content {
			flex-direction: row;
		}
		.navbar-right {
			gap: var(--spacing-sm);
		}
		.mobile-controls {
			gap: var(--spacing-xs);
		}
	}



	.user-menu, .auth-buttons {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}

	/* Mobile auth buttons vertical */
	.auth-buttons-mobile {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-top: 1rem;
	}
	.auth-buttons-mobile .btn {
		width: 100%;
		justify-content: center;
		font-size: 1.1rem;
	}

	.avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		object-fit: cover;
		margin-right: 0.5rem;
	}
	.user-dropdown-toggle {
		display: flex;
		align-items: center;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.5rem 1rem;
		font-size: 1rem;
		font-weight: 500;
		color: var(--color-text);
	}
	.dropdown-arrow {
		margin-left: 0.5rem;
	}
	.dropdown {
		position: relative;
		display: inline-block;
	}
	.dropdown-menu {
		position: absolute;
		top: 100%;
		right: 0;
		background: var(--color-background-white);
		box-shadow: var(--shadow-md);
		border-radius: var(--border-radius-md);
		padding: 0.5rem 0;
		min-width: 200px;
		z-index: 1000;
		display: flex;
		flex-direction: column;
	}
	.dropdown-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1.5rem;
		color: var(--color-text);
		text-decoration: none;
		font-size: 1rem;
		transition: background 0.2s;
	}
	.dropdown-item:hover {
		background: var(--color-primary-light);
		color: var(--color-text-white);
	}
	.avatar-default {
		background: var(--color-background-card);
		border-radius: 50%;
		padding: 4px;
	}
	.avatar-initial {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-primary, #2d6a4f);
		color: #fff;
		font-size: 1.5rem;
		font-weight: 700;
		margin-right: 0.5rem;
		user-select: none;
	}
</style> 