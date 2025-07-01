<script lang="ts">
	import { page } from '$app/stores';
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	export let data: any;
	let { session, user } = data;
	$: ({ session, user } = data);

	let providerProfile: any = null;
	let loading = true;

	onMount(async () => {
		if (!session) {
			goto('/auth/login');
			return;
		}

		// Verificar si el usuario es proveedor
		if (user?.user_metadata?.role !== 'provider') {
			goto('/become-provider');
			return;
		}

		// Cargar perfil del proveedor
		const { data: profile, error } = await supabase
			.from('provider_profiles')
			.select('*')
			.eq('user_id', user.id)
			.single();

		if (error) {
			console.error('Error loading provider profile:', error);
			goto('/become-provider');
			return;
		}

		providerProfile = profile;
		loading = false;
	});

	const menuItems = [
		{ href: '/provider', label: 'Dashboard', icon: '📊' },
		{ href: '/provider/profile', label: 'Mi Perfil', icon: '👤' },
		{ href: '/provider/services', label: 'Mis Servicios', icon: '🛠️' },
		{ href: '/provider/bookings', label: 'Reservas', icon: '📅' },
		{ href: '/provider/portfolio', label: 'Portafolio', icon: '🖼️' },
		{ href: '/provider/documents', label: 'Documentos', icon: '📋' },
		{ href: '/provider/earnings', label: 'Ganancias', icon: '💰' },
		{ href: '/provider/settings', label: 'Configuración', icon: '⚙️' }
	];

	function isActive(path: string): boolean {
		return $page.url.pathname === path;
	}
</script>

{#if loading}
	<div class="loading-container">
		<div class="loading-spinner"></div>
		<p>Cargando panel de proveedor...</p>
	</div>
{:else if providerProfile}
	<div class="provider-layout">
		<!-- Sidebar -->
		<aside class="sidebar">
			<div class="sidebar-header">
				<h2>Panel Proveedor</h2>
				<div class="provider-info">
					<div class="provider-avatar">
						{#if user?.user_metadata?.avatar_url}
							<img src={user.user_metadata.avatar_url} alt="Avatar" />
						{:else}
							<div class="avatar-placeholder">
								{user?.user_metadata?.first_name?.charAt(0) || user?.email?.charAt(0) || 'P'}
							</div>
						{/if}
					</div>
					<div class="provider-details">
						<h3>{providerProfile.business_name}</h3>
						<p>{providerProfile.headline}</p>
					</div>
				</div>
			</div>

			<nav class="sidebar-nav">
				<ul>
					{#each menuItems as item}
						<li>
							<a 
								href={item.href} 
								class="nav-item" 
								class:active={isActive(item.href)}
							>
								<span class="nav-icon">{item.icon}</span>
								<span class="nav-label">{item.label}</span>
							</a>
						</li>
					{/each}
				</ul>
			</nav>

			<div class="sidebar-footer">
				<a href="/" class="back-to-site">
					<span class="nav-icon">🏠</span>
					<span class="nav-label">Volver al sitio</span>
				</a>
			</div>
		</aside>

		<!-- Main Content -->
		<main class="main-content">
			<slot />
		</main>
	</div>
{/if}

<style>
	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		gap: var(--spacing-md);
	}

	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 4px solid var(--color-primary-light);
		border-top: 4px solid var(--color-primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.provider-layout {
		display: flex;
		min-height: 100vh;
		background-color: var(--color-background);
	}

	.sidebar {
		width: 280px;
		background-color: var(--color-background-white);
		border-right: 1px solid var(--color-border-light, rgba(0, 0, 0, 0.1));
		display: flex;
		flex-direction: column;
		position: fixed;
		height: 100vh;
		overflow-y: auto;
	}

	.sidebar-header {
		padding: var(--spacing-lg);
		border-bottom: 1px solid var(--color-border-light, rgba(0, 0, 0, 0.1));
	}

	.sidebar-header h2 {
		margin: 0 0 var(--spacing-md) 0;
		color: var(--color-primary);
		font-size: var(--font-size-xl);
		font-weight: 700;
	}

	.provider-info {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
	}

	.provider-avatar {
		width: 50px;
		height: 50px;
		border-radius: 50%;
		overflow: hidden;
		flex-shrink: 0;
	}

	.provider-avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.avatar-placeholder {
		width: 100%;
		height: 100%;
		background-color: var(--color-primary);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--font-size-xl);
		font-weight: 700;
	}

	.provider-details h3 {
		margin: 0;
		font-size: var(--font-size-base);
		font-weight: 600;
		color: var(--color-text);
	}

	.provider-details p {
		margin: 0;
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
	}

	.sidebar-nav {
		flex: 1;
		padding: var(--spacing-md) 0;
	}

	.sidebar-nav ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
		padding: var(--spacing-md) var(--spacing-lg);
		color: var(--color-text);
		text-decoration: none;
		transition: all var(--transition-fast);
		border-left: 3px solid transparent;
	}

	.nav-item:hover {
		background-color: var(--color-background);
		color: var(--color-primary);
		border-left-color: var(--color-primary-light);
	}

	.nav-item.active {
		background-color: var(--color-primary-light);
		color: var(--color-primary);
		border-left-color: var(--color-primary);
		font-weight: 600;
	}

	.nav-icon {
		font-size: var(--font-size-lg);
		width: 24px;
		text-align: center;
	}

	.nav-label {
		font-size: var(--font-size-base);
		font-weight: 500;
	}

	.sidebar-footer {
		padding: var(--spacing-md) var(--spacing-lg);
		border-top: 1px solid var(--color-border-light, rgba(0, 0, 0, 0.1));
	}

	.back-to-site {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
		color: var(--color-text-light);
		text-decoration: none;
		font-size: var(--font-size-sm);
		transition: color var(--transition-fast);
	}

	.back-to-site:hover {
		color: var(--color-primary);
	}

	.main-content {
		flex: 1;
		margin-left: 280px;
		padding: var(--spacing-lg);
		background-color: var(--color-background);
	}

	/* Responsive */
	@media (max-width: 768px) {
		.sidebar {
			transform: translateX(-100%);
			transition: transform var(--transition-normal);
			z-index: 1000;
		}

		.sidebar.open {
			transform: translateX(0);
		}

		.main-content {
			margin-left: 0;
			padding: var(--spacing-md);
		}
	}
</style> 