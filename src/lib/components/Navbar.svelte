<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	// import ThemeToggle from './ThemeToggle.svelte';

	let isMenuOpen = false;
	let isDropdownOpen = false;

	export let session: any = null;
	export let user: any = null;

	console.log('USER OBJETO:', user);

	async function handleLogout() {
		const { error } = await supabase.auth.signOut();
		if (error) {
			console.error('Error logging out:', error.message);
		} else {
			await invalidateAll();
			goto('/');
		}
	}

	// Verificar si el usuario es administrador
	$: isAdmin = user?.user_metadata?.role === 'admin';

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

			<!-- Desktop: links y ThemeToggle a la derecha -->
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
										<img src={user.user_metadata.avatar_url || user.user_metadata.picture} alt="Avatar" class="avatar" />
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
										<a href="/ayuda" class="dropdown-item"><svg width="20" height="20" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><path d="M9 9a3 3 0 0 1 6 0c0 2-3 3-3 5" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="17" r="1" fill="currentColor"/></svg> Ayuda en línea</a>
									</div>
								{/if}
							</div>
						</div>
					{:else}
						<div class="auth-buttons" role="group" aria-label="Botones de autenticación">
							<a href="/auth/login" class="btn btn-secondary">Iniciar Sesión</a>
							<a href="/auth/signup" class="btn btn-primary">Registrarse</a>
							<!-- <div class="theme-toggle-small"><ThemeToggle iconOnly={true} /></div> -->
						</div>
					{/if}
				</div>
				<!-- ThemeToggle y menú hamburguesa en mobile -->
				<div class="mobile-controls">
					<!-- <div class="theme-toggle-small"><ThemeToggle iconOnly={true} /></div> -->
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
								<img src={user.user_metadata.avatar_url || user.user_metadata.picture} alt="Avatar" class="avatar" />
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

	:global(.dark) .navbar {
		background-color: var(--color-background-card);
		border-bottom: 1px solid var(--color-border);
		box-shadow: var(--shadow-sm);
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

	:global(.dark) .logo {
		color: var(--color-text-white);
	}

	.logo:hover {
		color: var(--color-primary);
	}

	:global(.dark) .logo:hover {
		color: var(--color-primary-light);
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

	:global(.dark) .nav-link {
		color: var(--color-text-white);
	}

	.nav-link:hover {
		color: var(--color-primary);
	}

	:global(.dark) .nav-link:hover {
		color: var(--color-primary-light);
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

	:global(.dark) .user-name {
		color: var(--color-text-white);
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

	:global(.dark) .btn-secondary {
		background-color: var(--color-background);
		color: var(--color-primary);
		border-color: var(--color-primary);
	}

	:global(.dark) .btn-secondary:hover {
		background-color: var(--color-primary);
		color: var(--color-text-white);
		border-color: var(--color-primary-hover);
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

	:global(.dark) .menu-toggle {
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		color: var(--color-text-white);
	}

	:global(.dark) .menu-toggle .icon {
		color: var(--color-text-white);
	}

	.menu-toggle:hover {
		background-color: rgba(0, 0, 0, 0.2);
		transform: scale(1.05);
	}

	:global(.dark) .menu-toggle:hover {
		background-color: rgba(255, 255, 255, 0.2);
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
		:global(.dark) .nav-links-mobile {
			background-color: var(--color-background-card);
			border: 1px solid var(--color-border);
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

	.theme-toggle-small {
		height: 32px;
		width: 32px;
		min-width: 32px;
		min-height: 32px;
		padding: 0;
		margin-left: var(--spacing-sm);
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		box-shadow: none;
		background: none;
	}

	.theme-toggle-small :global(button),
	.theme-toggle-small :global(.toggle-switch) {
		width: 32px !important;
		height: 32px !important;
		padding: 0 !important;
		border-radius: 50% !important;
		box-shadow: none !important;
		background: none !important;
	}

	.theme-toggle-small :global(svg) {
		width: 20px;
		height: 20px;
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