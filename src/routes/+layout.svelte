<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { supabase } from '$lib/supabase';
	import Navbar from '$lib/components/Navbar.svelte';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';

	export let data: any;

	let { session, user, isProvider, isAdmin } = data;
	$: ({ session, user, isProvider, isAdmin } = data);

	onMount(() => {
		// Inyectar Speed Insights
		injectSpeedInsights();

		const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidateAll();
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	});
</script>

<svelte:head>
	<title>Domify - Marketplace de Servicios</title>
	<meta name="description" content="Conecta con proveedores de servicios locales en Domify" />
</svelte:head>

<div class="app">
	<Navbar {session} {user} {isProvider} {isAdmin} />
	<main>
		<slot />
	</main>
	<footer>
		<div class="footer-content">
			<div class="footer-section">
				<h3>Domify</h3>
				<p>Conectando personas con los mejores servicios locales.</p>
			</div>
			<div class="footer-section">
				<h4>Servicios</h4>
				<a href="/services/cleaning">Limpieza</a>
				<a href="/services/moving">Mudanza</a>
				<a href="/services/gardening">Jardinería</a>
				<a href="/services/assembly">Ensamblaje</a>
				<a href="/services/mounting">Montaje</a>
			</div>
			<div class="footer-section">
				<h4>Compañía</h4>
				<a href="/about">Sobre Nosotros</a>
				<a href="/contact">Contacto</a>
				<a href="/privacy">Privacidad</a>
				<a href="/terms">Términos</a>
			</div>
			<div class="footer-section">
				<h4>Síguenos</h4>
				<div class="social-links">
					<a href="https://facebook.com/domify" target="_blank" rel="noopener noreferrer" aria-label="Síguenos en Facebook">Facebook</a>
					<a href="https://twitter.com/domify" target="_blank" rel="noopener noreferrer" aria-label="Síguenos en Twitter">Twitter</a>
					<a href="https://instagram.com/domify" target="_blank" rel="noopener noreferrer" aria-label="Síguenos en Instagram">Instagram</a>
				</div>
			</div>
		</div>
		<div class="footer-bottom">
			<p>&copy; 2024 Domify. Todos los derechos reservados.</p>
		</div>
	</footer>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background: var(--color-background);
	}

	main {
		flex: 1;
		width: 100%;
		background-color: var(--color-background);
	}

	footer {
		background-color: var(--color-primary);
		color: var(--color-text-white);
		padding: var(--spacing-2xl) 0 var(--spacing-lg);
		border-top: 1px solid var(--color-border-light, rgba(255, 255, 255, 0.1));
	}

	.footer-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 var(--spacing-lg);
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--spacing-2xl);
	}

	.footer-section {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.footer-section h3 {
		font-size: var(--font-size-2xl);
		margin: 0;
		color: var(--color-text-white);
		font-weight: 700;
	}

	.footer-section h4 {
		font-size: var(--font-size-lg);
		margin: 0;
		color: var(--color-text-white);
		font-weight: 600;
	}

	.footer-section p {
		margin: 0;
		color: var(--color-text-white);
		opacity: 0.9;
		line-height: 1.6;
	}

	.footer-section a {
		color: var(--color-text-white);
		text-decoration: none;
		opacity: 0.8;
		transition: all var(--transition-fast);
		font-weight: 500;
	}

	.footer-section a:hover {
		opacity: 1;
		color: var(--color-highlight);
		transform: translateX(2px);
	}

	.social-links {
		display: flex;
		gap: var(--spacing-lg);
	}

	.social-links a {
		padding: var(--spacing-sm);
		border-radius: var(--border-radius-md);
		transition: all var(--transition-fast);
	}

	.social-links a:hover {
		background-color: rgba(255, 255, 255, 0.1);
		transform: translateY(-2px);
	}

	.footer-bottom {
		max-width: 1200px;
		margin: var(--spacing-2xl) auto 0;
		padding: var(--spacing-lg) var(--spacing-lg) 0;
		border-top: 1px solid var(--color-border-light, rgba(255, 255, 255, 0.1));
		text-align: center;
	}

	.footer-bottom p {
		margin: 0;
		opacity: 0.7;
		font-size: var(--font-size-sm);
		color: var(--color-text-white);
	}

	:global(.dark) .footer-section h3,
	:global(.dark) .footer-section h4 {
		color: var(--color-text-white);
	}

	:global(.dark) .footer-section a {
		color: var(--color-text-white);
		opacity: 0.85;
	}

	:global(.dark) .footer-section a:hover {
		color: var(--color-highlight);
		opacity: 1;
	}

	:global(.dark) .footer-section p {
		color: var(--color-text-white);
		opacity: 0.8;
	}

	:global(.dark) .social-links a {
		color: var(--color-text-white);
		background: rgba(255,255,255,0.05);
	}

	:global(.dark) .social-links a:hover {
		background: var(--color-primary);
		color: var(--color-text-white);
	}

	@media (max-width: 768px) {
		.footer-content {
			grid-template-columns: repeat(2, 1fr);
			gap: var(--spacing-xl);
		}

		.footer-section:first-child {
			grid-column: 1 / -1;
		}
	}

	@media (max-width: 480px) {
		.footer-content {
			grid-template-columns: 1fr;
		}
	}
</style> 