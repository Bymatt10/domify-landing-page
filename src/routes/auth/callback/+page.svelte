<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	let message = 'Procesando autenticación...';
	let error = null;

	onMount(() => {
		if (!browser) return;

		// Este componente es solo visual, la redirección se maneja en +page.js y +page.server.ts
		console.log('Procesando callback OAuth/Magic Link...');

		// Detectar errores en la URL
		const errorParam = $page.url.searchParams.get('error');
		const errorDescription = $page.url.searchParams.get('error_description');

		if (errorParam) {
			error = errorDescription || errorParam;
			message = 'Error de autenticación';
			console.error('Error en callback de autenticación:', error);

			// Redirigir al login después de mostrar el error
			setTimeout(() => {
				goto('/auth/login?error=' + encodeURIComponent(error));
			}, 3000);
			return;
		}

		// Mostrar un mensaje de éxito después de un tiempo
		setTimeout(() => {
			message = 'Autenticación exitosa. Redirigiendo...';
		}, 1500);
	});
</script>

<div class="flex items-center justify-center min-h-screen bg-gray-100">
	<div class="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center" role="alert" aria-live="polite">
		{#if error}
			<div class="text-red-500 mx-auto mb-4">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
				</svg>
			</div>
			<h1 class="text-xl font-semibold text-gray-800 mb-2">{message}</h1>
			<p class="text-red-600">{error}</p>
			<p class="text-gray-600 mt-4">Redirigiendo a la página de inicio de sesión...</p>
		{:else}
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
			<h1 class="text-xl font-semibold text-gray-800 mb-2">{message}</h1>
			<p class="text-gray-600">Por favor, espera mientras completamos el proceso...</p>
		{/if}
	</div>
</div>
