<script lang="ts">
	import { onMount } from 'svelte';
	
	export let number: string;
	export let label: string;
	export let delay: number = 0;
	export let icon: string = '';
	
	let isVisible = false;
	let animatedNumber = 0;
	let finalNumber = 0;
	
	// Extract numeric value for animation
	$: {
		const numericMatch = number.match(/[\d.]+/);
		if (numericMatch) {
			finalNumber = parseFloat(numericMatch[0]);
		}
	}
	
	function animateNumber() {
		if (!finalNumber || finalNumber === 0) return;
		
		const duration = 2000; // 2 seconds
		const increment = finalNumber / (duration / 16); // 60fps
		
		const timer = setInterval(() => {
			animatedNumber += increment;
			if (animatedNumber >= finalNumber) {
				animatedNumber = finalNumber;
				clearInterval(timer);
			}
		}, 16);
	}
	
	function formatNumber(num: number): string {
		if (number.includes('.')) {
			return num.toFixed(1);
		}
		return Math.floor(num).toString();
	}
	
	function intersectionObserver(node: HTMLElement) {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting && !isVisible) {
						isVisible = true;
						setTimeout(() => {
							animateNumber();
						}, delay);
						observer.unobserve(node);
					}
				});
			},
			{ threshold: 0.5 }
		);

		observer.observe(node);

		return {
			destroy() {
				observer.unobserve(node);
			}
		};
	}
</script>

<div 
	class="text-center group"
	use:intersectionObserver
>
	<div class="relative">
		<!-- Background Circle Animation -->
		<div 
			class="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full opacity-0 scale-0 transition-all duration-700 ease-out group-hover:opacity-100 group-hover:scale-110"
			class:opacity-20={isVisible}
			class:scale-100={isVisible}
		></div>
		
		<!-- Content -->
		<div class="relative z-10 p-6">
			{#if icon}
				<div class="text-2xl mb-2">{icon}</div>
			{/if}
			
			<div 
				class="text-3xl sm:text-4xl font-bold text-primary-600 mb-2 transition-all duration-300"
				class:animate-pulse={!isVisible}
			>
				{#if finalNumber > 0}
					{formatNumber(animatedNumber)}{number.replace(/[\d.]+/, '')}
				{:else}
					{number}
				{/if}
			</div>
			
			<div 
				class="text-secondary-600 font-medium transition-all duration-500 delay-200"
				class:translate-y-2={!isVisible}
				class:opacity-0={!isVisible}
			>
				{label}
			</div>
		</div>
	</div>
</div> 