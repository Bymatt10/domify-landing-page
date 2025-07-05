<script lang="ts">
	import { page } from '$app/stores';
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import ProviderSidebar from '$lib/components/ProviderSidebar.svelte';

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
		<!-- Nuevo Sidebar Moderno -->
		<ProviderSidebar {user} {providerProfile} />
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

	.main-content {
		flex: 1;
		margin-left: 288px; /* ancho del sidebar + padding */
		padding: 2rem 2rem 2rem 0;
		background: var(--color-background);
	}

	@media (max-width: 1024px) {
		.main-content {
			margin-left: 0;
			padding: 1rem;
		}
	}
</style> 