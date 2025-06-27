<script lang="ts">
	import { theme, toggleTheme } from '$lib/stores/theme';
	import { onMount } from 'svelte';

	let mounted = false;

	export let iconOnly: boolean = false;

	onMount(() => {
		mounted = true;
	});
</script>

{#if mounted}
	{#if iconOnly}
		<button 
			class="theme-toggle-icononly"
			on:click={toggleTheme}
			aria-label={$theme === 'light' ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro'}
			title={$theme === 'light' ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro'}
		>
			{#if $theme === 'light'}
				<!-- Icono de sol -->
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="5"/>
					<line x1="12" y1="1" x2="12" y2="3"/>
					<line x1="12" y1="21" x2="12" y2="23"/>
					<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
					<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
					<line x1="1" y1="12" x2="3" y2="12"/>
					<line x1="21" y1="12" x2="23" y2="12"/>
					<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
					<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
				</svg>
			{:else}
				<!-- Icono de luna -->
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
				</svg>
			{/if}
		</button>
	{:else}
		<button 
			class="theme-toggle"
			on:click={toggleTheme}
			aria-label={$theme === 'light' ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro'}
			title={$theme === 'light' ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro'}
		>
			<div class="toggle-track" class:dark={$theme === 'dark'}>
				<div class="toggle-thumb" class:dark={$theme === 'dark'}>
					{#if $theme === 'light'}
						<!-- Icono de sol -->
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<circle cx="12" cy="12" r="5"/>
							<line x1="12" y1="1" x2="12" y2="3"/>
							<line x1="12" y1="21" x2="12" y2="23"/>
							<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
							<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
							<line x1="1" y1="12" x2="3" y2="12"/>
							<line x1="21" y1="12" x2="23" y2="12"/>
							<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
							<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
						</svg>
					{:else}
						<!-- Icono de luna -->
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
						</svg>
					{/if}
				</div>
			</div>
			<span class="toggle-label">
				{$theme === 'light' ? 'Claro' : 'Oscuro'}
			</span>
		</button>
	{/if}
{/if}

<style>
	.theme-toggle {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		background: var(--color-background-card);
		border: 1px solid var(--color-border-light, rgba(0, 0, 0, 0.1));
		cursor: pointer;
		padding: var(--spacing-sm) var(--spacing-md);
		border-radius: var(--border-radius-lg);
		transition: all var(--transition-fast);
		color: var(--color-text);
		font-size: var(--font-size-sm);
		font-weight: 500;
		box-shadow: var(--shadow-sm);
	}

	.theme-toggle:hover {
		background: var(--color-background);
		border-color: var(--color-primary);
		transform: translateY(-1px);
		box-shadow: var(--shadow-md);
	}

	:global(.dark) .theme-toggle {
		background: var(--color-background-card);
		border-color: var(--color-border);
		color: var(--color-text);
	}

	:global(.dark) .theme-toggle:hover {
		background: var(--color-background);
		border-color: var(--color-primary);
		box-shadow: var(--shadow-md);
	}

	.toggle-track {
		position: relative;
		width: 48px;
		height: 24px;
		background: var(--color-primary-light);
		border-radius: 12px;
		transition: all var(--transition-normal);
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.toggle-track.dark {
		background: var(--color-primary);
	}

	.toggle-thumb {
		position: absolute;
		top: 2px;
		left: 2px;
		width: 20px;
		height: 20px;
		background: white;
		border-radius: 50%;
		transition: all var(--transition-normal);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-highlight);
	}

	.toggle-thumb.dark {
		transform: translateX(24px);
		background: var(--color-background-white);
		color: var(--color-highlight);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
	}

	.toggle-label {
		font-size: var(--font-size-sm);
		font-weight: 500;
		color: var(--color-text);
		min-width: 45px;
		text-align: left;
	}

	:global(.dark) .toggle-label {
		color: var(--color-text);
		font-weight: 500;
	}

	/* Animación suave para el icono */
	.toggle-thumb svg {
		transition: all var(--transition-fast);
		color: var(--color-highlight);
	}

	/* Estilos específicos para los iconos del toggle */
	.toggle-thumb svg {
		color: var(--color-highlight);
		stroke: var(--color-highlight);
	}

	:global(.dark) .toggle-thumb svg {
		color: var(--color-highlight);
		stroke: var(--color-highlight);
	}

	/* Efecto hover para toda la toggle */
	.theme-toggle:hover .toggle-track {
		transform: scale(1.05);
	}

	.theme-toggle:active .toggle-track {
		transform: scale(0.95);
	}

	/* Responsive */
	@media (max-width: 768px) {
		.toggle-label {
			display: none;
		}
		
		.theme-toggle {
			padding: var(--spacing-xs);
		}
	}

	.theme-toggle-icononly {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		min-width: 32px;
		min-height: 32px;
		border-radius: 50%;
		background: none;
		border: none;
		box-shadow: none;
		padding: 0;
		color: var(--color-text);
		transition: background var(--transition-fast), color var(--transition-fast);
		cursor: pointer;
	}
	.theme-toggle-icononly:hover {
		background: var(--color-background-card);
		color: var(--color-primary);
	}
	:global(.dark) .theme-toggle-icononly {
		color: var(--color-text-white);
	}
	.theme-toggle-icononly svg {
		width: 20px;
		height: 20px;
		color: var(--color-highlight);
		stroke: var(--color-highlight);
	}
</style> 