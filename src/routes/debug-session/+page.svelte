<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';

	let sessionStatus: any = null;
	let loading = true;
	let error = '';

	async function checkSessionStatus() {
		try {
			loading = true;
			error = '';

			// Verificar estado de sesión desde el servidor
			const response = await fetch('/api/debug/session-status');
			const data = await response.json();

			sessionStatus = data;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Error desconocido';
		} finally {
			loading = false;
		}
	}

	async function forceRefresh() {
		await checkSessionStatus();
	}

	onMount(() => {
		checkSessionStatus();
	});
</script>

<svelte:head>
	<title>Debug Session - Domify</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
	<div class="max-w-4xl mx-auto px-4">
		<h1 class="text-3xl font-bold text-gray-900 mb-8">Debug de Sesión</h1>

		<div class="bg-white rounded-lg shadow-md p-6 mb-6">
			<div class="flex justify-between items-center mb-4">
				<h2 class="text-xl font-semibold text-gray-800">Estado de la Sesión</h2>
				<button 
					on:click={forceRefresh}
					class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
					disabled={loading}
				>
					{loading ? 'Cargando...' : 'Actualizar'}
				</button>
			</div>

			{#if error}
				<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
					{error}
				</div>
			{/if}

			{#if loading}
				<div class="flex items-center justify-center py-8">
					<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
					<span class="ml-2 text-gray-600">Verificando estado de sesión...</span>
				</div>
			{:else if sessionStatus}
				<div class="space-y-4">
					<!-- Estado general -->
					<div class="bg-gray-50 p-4 rounded-lg">
						<h3 class="font-semibold text-gray-800 mb-2">Estado General</h3>
						<div class="grid grid-cols-2 gap-4 text-sm">
							<div>
								<span class="font-medium">Autenticado:</span>
								<span class="ml-2 {sessionStatus.authenticated ? 'text-green-600' : 'text-red-600'}">
									{sessionStatus.authenticated ? 'Sí' : 'No'}
								</span>
							</div>
							<div>
								<span class="font-medium">Timestamp:</span>
								<span class="ml-2 text-gray-600">{sessionStatus.timestamp}</span>
							</div>
						</div>
					</div>

					<!-- Sesión validada -->
					<div class="bg-blue-50 p-4 rounded-lg">
						<h3 class="font-semibold text-gray-800 mb-2">Sesión Validada (safeGetSession)</h3>
						<div class="space-y-2 text-sm">
							<div>
								<span class="font-medium">Sesión existe:</span>
								<span class="ml-2 {sessionStatus.session.exists ? 'text-green-600' : 'text-red-600'}">
									{sessionStatus.session.exists ? 'Sí' : 'No'}
								</span>
							</div>
							<div>
								<span class="font-medium">Usuario existe:</span>
								<span class="ml-2 {sessionStatus.user.exists ? 'text-green-600' : 'text-red-600'}">
									{sessionStatus.user.exists ? 'Sí' : 'No'}
								</span>
							</div>
							{#if sessionStatus.user.exists}
								<div>
									<span class="font-medium">ID de usuario:</span>
									<span class="ml-2 text-gray-600">{sessionStatus.user.id}</span>
								</div>
								<div>
									<span class="font-medium">Email:</span>
									<span class="ml-2 text-gray-600">{sessionStatus.user.email}</span>
								</div>
								<div>
									<span class="font-medium">Rol:</span>
									<span class="ml-2 text-gray-600">{sessionStatus.user.role}</span>
								</div>
							{/if}
							{#if sessionStatus.session.exists}
								<div>
									<span class="font-medium">Expira:</span>
									<span class="ml-2 text-gray-600">
										{new Date(sessionStatus.session.expires_at * 1000).toLocaleString()}
									</span>
								</div>
								<div>
									<span class="font-medium">Access token:</span>
									<span class="ml-2 {sessionStatus.session.access_token_exists ? 'text-green-600' : 'text-red-600'}">
										{sessionStatus.session.access_token_exists ? 'Presente' : 'Ausente'}
									</span>
								</div>
								<div>
									<span class="font-medium">Refresh token:</span>
									<span class="ml-2 {sessionStatus.session.refresh_token_exists ? 'text-green-600' : 'text-red-600'}">
										{sessionStatus.session.refresh_token_exists ? 'Presente' : 'Ausente'}
									</span>
								</div>
							{/if}
						</div>
					</div>

					<!-- Sesión sin validar -->
					<div class="bg-yellow-50 p-4 rounded-lg">
						<h3 class="font-semibold text-gray-800 mb-2">Sesión Sin Validar (getSession)</h3>
						<div class="space-y-2 text-sm">
							<div>
								<span class="font-medium">Sesión existe:</span>
								<span class="ml-2 {sessionStatus.rawSession.exists ? 'text-green-600' : 'text-red-600'}">
									{sessionStatus.rawSession.exists ? 'Sí' : 'No'}
								</span>
							</div>
							<div>
								<span class="font-medium">Usuario existe:</span>
								<span class="ml-2 {sessionStatus.rawUser.exists ? 'text-green-600' : 'text-red-600'}">
									{sessionStatus.rawUser.exists ? 'Sí' : 'No'}
								</span>
							</div>
							{#if sessionStatus.rawUser.exists}
								<div>
									<span class="font-medium">ID de usuario:</span>
									<span class="ml-2 text-gray-600">{sessionStatus.rawUser.id}</span>
								</div>
								<div>
									<span class="font-medium">Email:</span>
									<span class="ml-2 text-gray-600">{sessionStatus.rawUser.email}</span>
								</div>
								<div>
									<span class="font-medium">Rol:</span>
									<span class="ml-2 text-gray-600">{sessionStatus.rawUser.role}</span>
								</div>
							{/if}
							{#if sessionStatus.userError}
								<div>
									<span class="font-medium text-red-600">Error de usuario:</span>
									<span class="ml-2 text-red-600">{sessionStatus.userError}</span>
								</div>
							{/if}
						</div>
					</div>

					<!-- Metadata del usuario -->
					{#if sessionStatus.user.metadata}
						<div class="bg-green-50 p-4 rounded-lg">
							<h3 class="font-semibold text-gray-800 mb-2">Metadata del Usuario</h3>
							<pre class="text-sm bg-white p-3 rounded border overflow-x-auto">{JSON.stringify(sessionStatus.user.metadata, null, 2)}</pre>
						</div>
					{/if}
				</div>
			{/if}
		</div>

		<div class="bg-white rounded-lg shadow-md p-6">
			<h2 class="text-xl font-semibold text-gray-800 mb-4">Acciones de Debug</h2>
			<div class="space-y-4">
				<div>
					<a href="/auth/login" class="inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
						Ir a Login
					</a>
				</div>
				<div>
					<a href="/" class="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
						Ir a Inicio
					</a>
				</div>
				<div>
					<a href="/profile" class="inline-block px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors">
						Ir a Perfil
					</a>
				</div>
			</div>
		</div>
	</div>
</div> 