<script lang="ts">
	import { onMount } from 'svelte';
	
	export let number: string;
	export let label: string;
	export let delay: number = 0;
	export let iconName: 'users' | 'check' | 'star' | 'clock' = 'users';
	
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
			class="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full opacity-0 scale-0 transition-all duration-700 ease-out"
			class:opacity-20={isVisible}
			class:scale-100={isVisible}
		></div>
		
		<!-- Content -->
		<div class="relative z-10 p-6">
			{#if iconName === 'users'}
				<svg class="mx-auto text-primary-500 text-3xl mb-2" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m10-6.13a4 4 0 11-8 0 4 4 0 018 0zM6 7a4 4 0 118 0 4 4 0 01-8 0z"/></svg>
			{:else if iconName === 'check'}
				<svg class="mx-auto text-primary-500 text-3xl mb-2" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
			{:else if iconName === 'star'}
				<svg class="mx-auto text-primary-500 text-3xl mb-2" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon stroke-linecap="round" stroke-linejoin="round" points="12 17.27 18.18 21 15.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 8.46 13.97 5.82 21 12 17.27"/></svg>
			{:else if iconName === 'clock'}
				<svg class="mx-auto text-primary-500 text-3xl mb-2" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6l4 2"/></svg>
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