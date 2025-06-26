<script lang="ts">
	import { theme, toggleTheme } from '$lib/stores/theme';
	import { onMount } from 'svelte';

	let mounted = false;

	onMount(() => {
		mounted = true;
	});
</script>

{#if mounted}
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

<style>
	.theme-toggle {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		background: none;
		border: 1px solid transparent; /* Borde sutil para mejor definición */
		cursor: pointer;
		padding: var(--spacing-sm);
		border-radius: var(--border-radius-md);
		transition: all var(--transition-fast);
		color: #1f2937; /* Color más oscuro para mejor contraste */
		font-size: 15px; /* Tamaño consistente con el label */
		font-weight: 600; /* Más bold para mejor legibilidad */
	}

	.theme-toggle:hover {
		background: rgba(0, 0, 0, 0.08); /* Fondo más visible en hover */
		border-color: rgba(0, 0, 0, 0.1); /* Borde más visible en hover */
	}

	:global(.dark) .theme-toggle {
		color: #ffffff; /* Blanco puro para máximo contraste */
		border-color: rgba(255, 255, 255, 0.1); /* Borde sutil en modo oscuro */
	}

	:global(.dark) .theme-toggle:hover {
		background: rgba(255, 255, 255, 0.15); /* Fondo más visible en hover modo oscuro */
		border-color: rgba(255, 255, 255, 0.2); /* Borde más visible en hover modo oscuro */
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
		color: #FFBA00; /* Color dorado más visible */
	}

	.toggle-thumb.dark {
		transform: translateX(24px);
		background: #1f2937; /* Fondo más oscuro para mejor contraste */
		color: #FBBF24; /* Amarillo más brillante para la luna */
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
	}

	.toggle-label {
		font-size: 15px; /* Tamaño ligeramente más grande para mejor legibilidad */
		font-weight: 600; /* Más bold para mejor contraste */
		color: #1f2937; /* Color más oscuro para mejor contraste en modo claro */
		min-width: 45px;
		text-align: left;
		text-shadow: none; /* Sin sombra que pueda dificultar la lectura */
	}

	:global(.dark) .toggle-label {
		color: #ffffff; /* Blanco puro para máximo contraste en modo oscuro */
		font-weight: 700; /* Aún más bold en modo oscuro */
	}

	/* Animación suave para el icono */
	.toggle-thumb svg {
		transition: all var(--transition-fast);
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
</style> 