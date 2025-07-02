<script lang="ts">
	export let size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
	export let color: 'primary' | 'secondary' | 'white' = 'primary';
	export let text: string = '';
	
	const sizeClasses = {
		sm: 'w-4 h-4',
		md: 'w-8 h-8',
		lg: 'w-12 h-12',
		xl: 'w-16 h-16'
	};
	
	const colorClasses = {
		primary: 'text-primary-600',
		secondary: 'text-secondary-600',
		white: 'text-white'
	};
</script>

<div class="flex flex-col items-center justify-center space-y-4">
	<!-- Spinner -->
	<div class="relative">
		<!-- Outer ring -->
		<div 
			class="{sizeClasses[size]} border-4 border-gray-200 rounded-full animate-spin"
			style="border-top-color: transparent;"
		></div>
		
		<!-- Inner spinning element -->
		<div 
			class="absolute inset-0 {sizeClasses[size]} border-4 border-transparent rounded-full animate-spin"
			style="border-top-color: currentColor; animation-duration: 0.8s;"
		>
			<div class="{colorClasses[color]}"></div>
		</div>
		
		<!-- Center dot -->
		<div class="absolute inset-0 flex items-center justify-center">
			<div class="w-2 h-2 bg-current rounded-full {colorClasses[color]} animate-pulse"></div>
		</div>
	</div>
	
	<!-- Loading text -->
	{#if text}
		<p class="text-sm font-medium {colorClasses[color]} animate-pulse">
			{text}
		</p>
	{/if}
</div>

<style>
	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
	
	.animate-spin {
		animation: spin 1s linear infinite;
	}
</style> 