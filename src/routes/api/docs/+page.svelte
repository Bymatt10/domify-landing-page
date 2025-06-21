<script lang="ts">
	import { onMount } from 'svelte';

	let swaggerContainer: HTMLElement;

	onMount(() => {
		// Load Swagger UI
		const script = document.createElement('script');
		script.src = 'https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js';
		script.onload = () => {
			const link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = 'https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css';
			document.head.appendChild(link);

			// Initialize Swagger UI
			const ui = (window as any).SwaggerUIBundle({
				url: '/api/swagger.json',
				dom_id: '#swagger-ui',
				deepLinking: true,
				presets: [
					(window as any).SwaggerUIBundle.presets.apis,
					(window as any).SwaggerUIStandalonePreset
				],
				plugins: [
					(window as any).SwaggerUIBundle.plugins.DownloadUrl
				],
				docExpansion: 'list',
				defaultModelsExpandDepth: 1,
				defaultModelExpandDepth: 1,
				displayRequestDuration: true,
				showExtensions: true,
				showCommonExtensions: true,
				oauth2RedirectUrl: window.location.origin + '/api/docs/oauth2-redirect.html',
				initOAuth: {
					clientId: 'your-client-id',
					realm: 'your-realm',
					appName: 'Domify API'
				}
			});
		};
		document.head.appendChild(script);
	});
</script>

<svelte:head>
	<title>Domify API Documentation</title>
	<meta name="description" content="API documentation for Domify marketplace platform" />
</svelte:head>

<div class="swagger-container">
	<div class="swagger-header">
		<h1>Domify API Documentation</h1>
		<p>Explore and test the Domify marketplace API endpoints</p>
		<div class="swagger-info">
			<div class="info-card">
				<h3>🔓 Public Access</h3>
				<p>This documentation is publicly available. Some endpoints require authentication.</p>
			</div>
			<div class="info-card">
				<h3>🔑 Authentication</h3>
				<p>1. Use the login endpoint to get a JWT token<br>2. Click "Authorize" and enter your token<br>3. Test protected endpoints</p>
			</div>
			<div class="info-card">
				<h3>📝 Quick Start</h3>
				<p>1. Register a new account<br>2. Login to get your token<br>3. Copy the token and authorize</p>
			</div>
		</div>
	</div>
	
	<div id="swagger-ui" bind:this={swaggerContainer}></div>
</div>

<style>
	.swagger-container {
		min-height: 100vh;
		background: var(--color-background);
	}

	.swagger-header {
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
		color: var(--color-text-white);
		padding: 2rem 1rem;
		text-align: center;
	}

	.swagger-header h1 {
		margin: 0 0 0.5rem 0;
		font-size: 2.5rem;
		font-weight: 700;
	}

	.swagger-header p {
		margin: 0 0 2rem 0;
		font-size: 1.1rem;
		opacity: 0.9;
	}

	.swagger-info {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;
		max-width: 1000px;
		margin: 0 auto;
	}

	.info-card {
		background: rgba(255, 255, 255, 0.1);
		padding: 1rem;
		border-radius: var(--border-radius-md);
		backdrop-filter: blur(10px);
	}

	.info-card h3 {
		margin: 0 0 0.5rem 0;
		font-size: 1rem;
	}

	.info-card p {
		margin: 0;
		font-size: 0.9rem;
		opacity: 0.9;
		line-height: 1.4;
	}

	#swagger-ui {
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	:global(.swagger-ui .topbar) {
		display: none;
	}

	:global(.swagger-ui .info .title) {
		color: var(--color-primary);
	}

	:global(.swagger-ui .scheme-container) {
		background: var(--color-background);
		padding: 1rem;
		border-radius: var(--border-radius-md);
		margin: 1rem 0;
	}

	:global(.swagger-ui .opblock.opblock-get .opblock-summary-method) {
		background: #61affe;
	}

	:global(.swagger-ui .opblock.opblock-post .opblock-summary-method) {
		background: #49cc90;
	}

	:global(.swagger-ui .opblock.opblock-put .opblock-summary-method) {
		background: #fca130;
	}

	:global(.swagger-ui .opblock.opblock-delete .opblock-summary-method) {
		background: #f93e3e;
	}

	:global(.swagger-ui .btn.execute) {
		background: var(--color-primary);
		border-color: var(--color-primary);
	}

	:global(.swagger-ui .btn.execute:hover) {
		background: var(--color-primary-hover);
		border-color: var(--color-primary-hover);
	}

	:global(.swagger-ui .auth-wrapper .authorize) {
		background: var(--color-primary);
		border-color: var(--color-primary);
	}

	:global(.swagger-ui .auth-wrapper .authorize:hover) {
		background: var(--color-primary-hover);
		border-color: var(--color-primary-hover);
	}

	@media (max-width: 768px) {
		.swagger-info {
			grid-template-columns: 1fr;
		}

		.swagger-header h1 {
			font-size: 2rem;
		}
	}
</style> 