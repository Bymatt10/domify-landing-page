<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let loading = true;
	let error = '';

	onMount(async () => {
		try {
			// Supabase callback page loaded
			
			// For traditional login, redirect to home
			// Callback handled successfully
			goto('/');
		} catch (e) {
			console.error('💥 Error in callback:', e);
			error = e instanceof Error ? e.message : 'Error inesperado durante la autenticación';
		} finally {
			loading = false;
		}
	});
</script>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-700 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full bg-white p-8 rounded-lg shadow-xl text-center">
		{#if loading}
			<div class="mb-6">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
			</div>
			<h2 class="text-xl font-semibold text-gray-900 mb-2">Procesando autenticación...</h2>
			<p class="text-gray-600">Por favor, espera mientras completamos tu inicio de sesión.</p>
		{:else if error}
			<div class="mb-6">
				<div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
					<svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
					</svg>
				</div>
			</div>
			<h2 class="text-xl font-semibold text-gray-900 mb-2">Error de autenticación</h2>
			<p class="text-gray-600 mb-4">{error}</p>
			<button 
				on:click={() => goto('/auth/login')}
				class="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
			>
				Volver al login
			</button>
		{:else}
			<div class="mb-6">
				<div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
					<svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
					</svg>
				</div>
			</div>
			<h2 class="text-xl font-semibold text-gray-900 mb-2">¡Autenticación exitosa!</h2>
			<p class="text-gray-600">Redirigiendo a la página principal...</p>
		{/if}
	</div>
</div>
