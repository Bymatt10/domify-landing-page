<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import EmojiIcon from '$lib/components/EmojiIcon.svelte';
</script>

<svelte:head>
	<title>Categoría no encontrada | Domify</title>
</svelte:head>

<div class="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
	<div class="w-full max-w-xl text-center">
		<div class="mb-8 flex justify-center">
			<EmojiIcon 
				emoji="🔎" 
				animation="animate-bounce-subtle"
				bgColor="bg-gradient-to-br from-red-100 to-red-200"
				size="w-24 h-24"
				textSize="text-5xl"
			/>
		</div>

		<h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
			Categoría no encontrada
		</h1>

		<p class="text-lg text-gray-600 mb-8">
			Lo sentimos, la categoría <span class="font-semibold text-primary-600">"{$page.params.category}"</span> no existe o no está disponible en este momento.
		</p>

		<div class="flex flex-col sm:flex-row items-center justify-center gap-4">
			<button 
				on:click={() => goto('/services')}
				class="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg w-full sm:w-auto"
			>
				Ver todas las categorías
			</button>

			<button 
				on:click={() => goto('/')}
				class="border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all duration-300 bg-white hover:bg-gray-50 w-full sm:w-auto"
			>
				Volver al inicio
			</button>
		</div>

		<div class="mt-12 text-gray-500">
			<p>Si crees que esto es un error, por favor contacta con nuestro equipo de soporte.</p>
		</div>
	</div>
</div>
