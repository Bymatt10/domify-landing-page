<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { supabase } from '$lib/supabase';
	import Navbar from '$lib/components/Navbar.svelte';

	export let data: any;

	let { session, supabase: sb } = data;
	$: ({ session, supabase: sb } = data);

	onMount(() => {
		const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidateAll();
			}
		});

		return () => subscription.unsubscribe();
	});
</script>

<svelte:head>
	<title>Domify - Marketplace de Servicios</title>
	<meta name="description" content="Conecta con proveedores de servicios locales en Domify" />
</svelte:head>

<div class="app">
	<Navbar />
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
					<a href="#" target="_blank" rel="noopener">Facebook</a>
					<a href="#" target="_blank" rel="noopener">Twitter</a>
					<a href="#" target="_blank" rel="noopener">Instagram</a>
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
	}

	.footer-section h4 {
		font-size: var(--font-size-lg);
		margin: 0;
		color: var(--color-primary-light);
	}

	.footer-section p {
		margin: 0;
		color: var(--color-text-white);
		opacity: 0.8;
		line-height: 1.6;
	}

	.footer-section a {
		color: var(--color-text-white);
		text-decoration: none;
		opacity: 0.8;
		transition: opacity 0.2s;
	}

	.footer-section a:hover {
		opacity: 1;
	}

	.social-links {
		display: flex;
		gap: var(--spacing-lg);
	}

	.footer-bottom {
		max-width: 1200px;
		margin: var(--spacing-2xl) auto 0;
		padding: var(--spacing-lg) var(--spacing-lg) 0;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		text-align: center;
	}

	.footer-bottom p {
		margin: 0;
		opacity: 0.6;
		font-size: var(--font-size-sm);
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