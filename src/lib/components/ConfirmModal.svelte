<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	export let show: boolean = false;
	export let title: string = 'Confirmar acción';
	export let message: string = '¿Estás seguro de que quieres continuar?';
	export let confirmText: string = 'Confirmar';
	export let cancelText: string = 'Cancelar';
	export let type: 'danger' | 'warning' | 'info' = 'info';

	const dispatch = createEventDispatcher();

	function confirm() {
		dispatch('confirm');
		show = false;
	}

	function cancel() {
		dispatch('cancel');
		show = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			cancel();
		} else if (event.key === 'Enter') {
			confirm();
		}
	}

	function getIcon() {
		switch (type) {
			case 'danger':
				return `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
				</svg>`;
			case 'warning':
				return `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
				</svg>`;
			default:
				return `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
				</svg>`;
		}
	}

	function getColors() {
		switch (type) {
			case 'danger':
				return {
					icon: 'text-red-600',
					button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
					border: 'border-red-200'
				};
			case 'warning':
				return {
					icon: 'text-yellow-600',
					button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
					border: 'border-yellow-200'
				};
			default:
				return {
					icon: 'text-blue-600',
					button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
					border: 'border-blue-200'
				};
		}
	}

	$: colors = getColors();
</script>

{#if show}
	<!-- Overlay -->
	<div
		class="fixed inset-0 z-50 overflow-y-auto"
		transition:fade={{ duration: 200 }}
	>
		<div class="flex min-h-full items-center justify-center p-4">
			<!-- Backdrop -->
			<div
				class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
				on:click={cancel}
			></div>

			<!-- Modal -->
			<div
				class="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
				transition:fly={{ y: 50, duration: 200 }}
				on:keydown={handleKeydown}
				tabindex="0"
				role="dialog"
				aria-modal="true"
				aria-labelledby="modal-title"
				aria-describedby="modal-description"
			>
				<div class="p-6">
					<div class="flex items-start">
						<div class="flex-shrink-0">
							<div class="w-6 h-6 {colors.icon}">
								{@html getIcon()}
							</div>
						</div>
						<div class="ml-3 w-0 flex-1">
							<h3 id="modal-title" class="text-lg font-medium text-gray-900">
								{title}
							</h3>
							<div class="mt-2">
								<p id="modal-description" class="text-sm text-gray-500">
									{message}
								</p>
							</div>
						</div>
					</div>
				</div>

				<div class="bg-gray-50 px-6 py-3 flex justify-end space-x-3 rounded-b-lg">
					<button
						type="button"
						class="bg-white py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
						on:click={cancel}
					>
						{cancelText}
					</button>
					<button
						type="button"
						class="py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white {colors.button} focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200"
						on:click={confirm}
					>
						{confirmText}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if} 