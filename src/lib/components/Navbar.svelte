<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	let isMenuOpen = false;

	export let session: any = null;

	async function handleLogout() {
		const { error } = await supabase.auth.signOut();
		if (error) {
			console.error('Error logging out:', error.message);
		} else {
			await invalidateAll();
			goto('/');
		}
	}
</script>

<nav>
	<div class="nav-container">
		<div class="nav-left">
			<a href="/" class="logo">Domify</a>
			<div class="nav-links">
				<a href="/" class:active={$page.url.pathname === "/"}>Inicio</a>
				<a href="/services" class:active={$page.url.pathname.startsWith("/services")}>Servicios</a>
				<a href="/about" class:active={$page.url.pathname === "/about"}>Nosotros</a>
			</div>
		</div>

		<div class="auth-buttons">
			<a href="/auth/login" class="login-btn">Iniciar Sesión</a>
			<a href="/auth/signup" class="signup-btn">Registrarse</a>
		</div>

		<button class="menu-button" on:click={() => isMenuOpen = !isMenuOpen}>
			<span class="menu-icon"></span>
		</button>
	</div>

	{#if isMenuOpen}
		<div class="mobile-menu">
			<a href="/" class:active={$page.url.pathname === "/"}>Inicio</a>
			<a href="/services" class:active={$page.url.pathname.startsWith("/services")}>Servicios</a>
			<a href="/about" class:active={$page.url.pathname === "/about"}>Nosotros</a>
			<div class="mobile-auth">
				<a href="/auth/login" class="login-btn">Iniciar Sesión</a>
				<a href="/auth/signup" class="signup-btn">Registrarse</a>
			</div>
		</div>
	{/if}
</nav>

<style>
	nav {
		background-color: var(--color-background-white);
		box-shadow: var(--shadow-sm);
		position: sticky;
		top: 0;
		z-index: 100;
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
	}

	.nav-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 1rem 1.5rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.nav-left {
		display: flex;
		align-items: center;
		gap: 3rem;
	}

	.logo {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-primary);
		text-decoration: none;
	}

	.nav-links {
		display: flex;
		gap: 2rem;
	}

	.nav-links a {
		color: var(--color-text);
		text-decoration: none;
		font-weight: 500;
		font-size: 1.1rem;
		padding: 0.5rem 0;
	}

	.nav-links a:hover,
	.nav-links a.active {
		color: var(--color-primary);
	}

	.auth-buttons {
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	.login-btn {
		color: var(--color-primary);
		text-decoration: none;
		font-weight: 600;
		font-size: 1.1rem;
		padding: 0.5rem 1rem;
	}

	.signup-btn {
		background-color: var(--color-primary);
		color: white;
		text-decoration: none;
		font-weight: 600;
		font-size: 1.1rem;
		padding: 0.5rem 1.5rem;
		border-radius: 9999px;
		transition: background-color 0.2s;
	}

	.signup-btn:hover {
		background-color: var(--color-primary-hover);
	}

	.menu-button {
		display: none;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.5rem;
	}

	.menu-icon {
		display: block;
		width: 24px;
		height: 2px;
		background-color: var(--color-primary);
		position: relative;
		transition: background-color 0.2s;
	}

	.menu-icon::before,
	.menu-icon::after {
		content: '';
		position: absolute;
		width: 24px;
		height: 2px;
		background-color: var(--color-primary);
		transition: transform 0.2s;
	}

	.menu-icon::before {
		top: -6px;
	}

	.menu-icon::after {
		bottom: -6px;
	}

	.mobile-menu {
		display: none;
		padding: 1rem;
		background-color: var(--color-background-white);
		border-top: 1px solid rgba(0, 0, 0, 0.1);
	}

	@media (max-width: 768px) {
		.nav-links,
		.auth-buttons {
			display: none;
		}

		.menu-button {
			display: block;
		}

		.mobile-menu {
			display: flex;
			flex-direction: column;
			gap: 1rem;
		}

		.mobile-menu a {
			color: var(--color-text);
			text-decoration: none;
			font-weight: 500;
			font-size: 1.1rem;
			padding: 0.5rem 0;
		}

		.mobile-menu a:hover,
		.mobile-menu a.active {
			color: var(--color-primary);
		}

		.mobile-auth {
			display: flex;
			flex-direction: column;
			gap: 0.5rem;
			margin-top: 0.5rem;
		}

		.mobile-auth .signup-btn {
			text-align: center;
		}
	}
</style> 