<script lang="ts">
	// Props
	export let suggestions: string[] = [];
	export let onSuggestionClick: (suggestion: string) => void;
	export let visible: boolean = false;

	// Internal state
	let highlightedIndex = -1;

	// Handle keyboard navigation
	function handleKeydown(event: KeyboardEvent) {
		if (!visible || suggestions.length === 0) return;

		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				highlightedIndex = (highlightedIndex + 1) % suggestions.length;
				break;

			case 'ArrowUp':
				event.preventDefault();
				highlightedIndex = highlightedIndex <= 0 ? suggestions.length - 1 : highlightedIndex - 1;
				break;

			case 'Enter':
				if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
					event.preventDefault();
					onSuggestionClick(suggestions[highlightedIndex]);
				}
				break;

			case 'Escape':
				event.preventDefault();
				visible = false;
				break;
		}
	}

	// Reset highlighted index when suggestions change
	$: if (suggestions) highlightedIndex = -1;
</script>

<svelte:window on:keydown={handleKeydown} />

{#if visible && suggestions.length > 0}
	<div 
		class="absolute z-50 w-full bg-white rounded-xl shadow-xl border border-secondary-100 mt-1 overflow-hidden animate-fade-in"
		role="listbox"
		aria-label="Sugerencias de búsqueda"
	>
		<ul class="max-h-60 overflow-y-auto py-2">
			{#each suggestions as suggestion, index}
				<li
					class="px-4 py-2 cursor-pointer flex items-center hover:bg-primary-50 transition-colors duration-150 {index === highlightedIndex ? 'bg-primary-50' : ''}"
					on:click={() => onSuggestionClick(suggestion)}
					on:keydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							onSuggestionClick(suggestion);
						}
					}}
					role="option"
					aria-selected={index === highlightedIndex}
					tabindex="0"
				>
					<svg class="w-4 h-4 text-secondary-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
					</svg>
					<span>{suggestion}</span>
				</li>
			{/each}
		</ul>
	</div>
{/if}

<style>
	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(-5px); }
		to { opacity: 1; transform: translateY(0); }
	}

	.animate-fade-in {
		animation: fadeIn 0.2s ease-out forwards;
	}
</style>
