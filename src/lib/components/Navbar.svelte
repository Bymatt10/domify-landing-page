<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';

	let isMenuOpen = false;

	export let session: any = null;
	export let user: any = null;

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
</script>

<nav class="navbar">
	<div class="container">
		<div class="navbar-content">
			<a href="/" class="logo" aria-label="Ir a la página principal de Domify">
				<span>Domify</span>
			</a>

			<button 
				class="menu-toggle" 
				on:click={toggleMenu}
				aria-label="Alternar menú de navegación"
				aria-expanded={isMenuOpen}
			>
				<svg viewBox="0 0 24 24" class="icon" aria-hidden="true">
					<path d="M4 6h16M4 12h16m-16 6h16" />
				</svg>
			</button>

			<div 
				class="nav-links" 
				class:open={isMenuOpen}
				role="navigation"
				aria-label="Menú principal"
			>
				<a href="/" class="nav-link">Inicio</a>
				<a href="/services" class="nav-link">Servicios</a>
				
				{#if session}
					{#if isAdmin}
						<a href="/admin" class="nav-link">Panel Admin</a>
					{/if}
					<div class="user-menu" role="group" aria-label="Menú de usuario">
						<span class="user-name">{user?.user_metadata?.first_name || user?.email}</span>
						<button 
							class="btn btn-secondary" 
							on:click={handleLogout}
							type="button"
						>
							Cerrar Sesión
						</button>
					</div>
				{:else}
					<div class="auth-buttons" role="group" aria-label="Botones de autenticación">
						<a href="/auth/login" class="btn btn-secondary">Iniciar Sesión</a>
						<a href="/auth/signup" class="btn btn-primary">Registrarse</a>
					</div>
				{/if}
			</div>
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
	}

	.navbar-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-md) 0;
	}

	.logo {
		display: flex;
		align-items: center;
		color: var(--color-primary);
		font-size: var(--font-size-2xl);
		font-weight: 700;
		text-decoration: none;
		letter-spacing: -0.5px;
	}

	.menu-toggle {
		display: none;
		background: none;
		border: none;
		padding: var(--spacing-xs);
		color: var(--color-text);
	}

	.icon {
		width: 24px;
		height: 24px;
		fill: none;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.nav-links {
		display: flex;
		align-items: center;
		gap: var(--spacing-lg);
	}

	.nav-link {
		color: var(--color-text);
		font-size: var(--font-size-base);
		transition: color var(--transition-fast);
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
	}

	.auth-buttons {
		display: flex;
		gap: var(--spacing-md);
	}

	.btn {
		padding: var(--spacing-sm) var(--spacing-lg);
		border-radius: var(--border-radius-md);
		font-size: var(--font-size-sm);
		font-weight: 500;
		transition: all var(--transition-fast);
	}

	.btn-primary {
		background-color: var(--color-primary);
		color: var(--color-text-white);
	}

	.btn-primary:hover {
		background-color: var(--color-primary-hover);
	}

	.btn-secondary {
		background-color: var(--color-background);
		color: var(--color-text);
	}

	.btn-secondary:hover {
		background-color: #E5E7EB;
	}

	@media (max-width: 768px) {
		.menu-toggle {
			display: block;
		}

		.nav-links {
			display: none;
			position: absolute;
			top: 100%;
			left: 0;
			right: 0;
			flex-direction: column;
			background-color: var(--color-background-white);
			padding: var(--spacing-md);
			box-shadow: var(--shadow-md);
		}

		.nav-links.open {
			display: flex;
		}

		.auth-buttons,
		.user-menu {
			flex-direction: column;
			width: 100%;
		}

		.btn {
			width: 100%;
			text-align: center;
		}
	}
</style> 