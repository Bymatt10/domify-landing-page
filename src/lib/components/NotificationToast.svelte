<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	export let message: string;
	export let type: 'success' | 'error' | 'warning' | 'info' = 'info';
	export let duration: number = 5000;
	export let show: boolean = false;

	const dispatch = createEventDispatcher();

	let timeoutId: ReturnType<typeof setTimeout>;

	$: if (show && duration > 0) {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			hide();
		}, duration);
	}

	function hide() {
		show = false;
		dispatch('close');
	}

	function getIcon() {
		switch (type) {
			case 'success':
				return `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
				</svg>`;
			case 'error':
				return `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
				</svg>`;
			case 'warning':
				return `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
				</svg>`;
			default:
				return `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
				</svg>`;
		}
	}

	function getColors() {
		switch (type) {
			case 'success':
				return 'bg-green-50 border-green-200 text-green-800';
			case 'error':
				return 'bg-red-50 border-red-200 text-red-800';
			case 'warning':
				return 'bg-yellow-50 border-yellow-200 text-yellow-800';
			default:
				return 'bg-blue-50 border-blue-200 text-blue-800';
		}
	}

	onMount(() => {
		return () => {
			clearTimeout(timeoutId);
		};
	});
</script>

{#if show}
	<div
		class="fixed top-4 right-4 z-50 max-w-sm w-full"
		transition:fly={{ y: -50, duration: 300 }}
	>
		<div class="rounded-lg border p-4 shadow-lg {getColors()}">
			<div class="flex items-start">
				<div class="flex-shrink-0">
					<div class="w-5 h-5" class:text-green-600={type === 'success'} class:text-red-600={type === 'error'} class:text-yellow-600={type === 'warning'} class:text-blue-600={type === 'info'}>
						{@html getIcon()}
					</div>
				</div>
				<div class="ml-3 flex-1">
					<p class="text-sm font-medium">{message}</p>
				</div>
				<div class="ml-4 flex-shrink-0">
					<button
						class="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors duration-200"
						on:click={hide}
						aria-label="Cerrar notificación"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
						</svg>
					</button>
				</div>
			</div>
		</div>
	</div>
{/if} 