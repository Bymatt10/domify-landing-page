<script lang="ts">
	// Página de documentación para Google OAuth
</script>

<svelte:head>
	<title>Configurar Google OAuth - Domify</title>
	<meta name="description" content="Guía para configurar Google OAuth en Domify" />
</svelte:head>

<div class="docs-container">
	<div class="docs-content">
		<div class="section-content">
			<h1>Configurar Google OAuth en Domify</h1>
			
			<div class="alert alert-info">
				<strong>📋 Resumen:</strong> Esta guía te ayudará a configurar Google OAuth para que funcione el registro con Google en tu aplicación Domify.
			</div>

			<h2>1. Crear proyecto en Google Cloud Console</h2>
			<ol>
				<li>Ve a <a href="https://console.cloud.google.com/" target="_blank" rel="noopener">Google Cloud Console</a></li>
				<li>Crea un nuevo proyecto o selecciona uno existente</li>
				<li>Habilita la API de Google+ (Google Identity)</li>
			</ol>

			<h2>2. Configurar OAuth 2.0</h2>
			<ol>
				<li>Ve a "APIs & Services" > "Credentials"</li>
				<li>Haz clic en "Create Credentials" > "OAuth 2.0 Client IDs"</li>
				<li>Selecciona "Web application"</li>
				<li>Configura las URLs autorizadas:
					<div class="code-block">
						<h4>Authorized JavaScript origins:</h4>
						<ul>
							<li><code>http://localhost:5173</code> (desarrollo)</li>
							<li><code>http://localhost:54321</code> (Supabase local)</li>
							<li>Tu dominio de producción</li>
						</ul>
						
						<h4>Authorized redirect URIs:</h4>
						<ul>
							<li><code>http://localhost:54321/auth/v1/callback</code> (Supabase local)</li>
							<li><code>https://tu-proyecto.supabase.co/auth/v1/callback</code> (producción)</li>
						</ul>
					</div>
				</li>
				<li>Guarda el <strong>Client ID</strong> y <strong>Client Secret</strong></li>
			</ol>

			<h2>3. Configurar en Supabase</h2>
			<ol>
				<li>Ve a tu proyecto de Supabase</li>
				<li>Navega a "Authentication" > "Providers"</li>
				<li>Habilita Google</li>
				<li>Ingresa el Client ID y Client Secret de Google</li>
				<li>Guarda la configuración</li>
			</ol>

			<h2>4. Variables de entorno</h2>
			<p>Asegúrate de que tu archivo <code>.env</code> tenga las variables correctas:</p>
			<div class="code-block">
				<pre><code>{`PUBLIC_SUPABASE_URL=http://localhost:54321
PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
PRIVATE_SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key`}</code></pre>
			</div>

			<h2>5. Probar el registro</h2>
			<p>Una vez configurado:</p>
			<ol>
				<li>Ve a la página de registro</li>
				<li>Haz clic en "Continuar con Google"</li>
				<li>Selecciona tu cuenta de Google</li>
				<li>Deberías ser redirigido de vuelta a la aplicación</li>
			</ol>

			<h2>6. Triggers automáticos</h2>
			<p>La aplicación tiene configurados triggers automáticos que crean perfiles de usuario cuando se registran con OAuth:</p>
			<div class="code-block">
				<pre><code>{`-- Trigger para crear perfil de customer automáticamente
CREATE TRIGGER handle_new_user_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();`}</code></pre>
			</div>

			<h2>7. Solución de problemas</h2>
			<div class="troubleshooting">
				<div class="problem">
					<h4>❌ Error "redirect_uri_mismatch"</h4>
					<p><strong>Causa:</strong> Las URLs de redirección en Google Cloud Console no coinciden con las configuradas en Supabase.</p>
					<p><strong>Solución:</strong> Verifica que las URLs sean exactamente iguales, incluyendo el protocolo (http/https).</p>
				</div>
				
				<div class="problem">
					<h4>❌ Error "invalid_client"</h4>
					<p><strong>Causa:</strong> Client ID o Client Secret incorrectos.</p>
					<p><strong>Solución:</strong> Verifica que hayas copiado correctamente las credenciales de Google Cloud Console.</p>
				</div>
				
				<div class="problem">
					<h4>❌ Error "access_denied"</h4>
					<p><strong>Causa:</strong> El usuario canceló la autenticación o no dio permisos.</p>
					<p><strong>Solución:</strong> Es normal, el usuario puede intentar de nuevo.</p>
				</div>
				
				<div class="problem">
					<h4>❌ No se crea el perfil de usuario</h4>
					<p><strong>Causa:</strong> El trigger de la base de datos no se ejecutó correctamente.</p>
					<p><strong>Solución:</strong> El callback de OAuth tiene lógica de respaldo para crear el perfil manualmente.</p>
				</div>
			</div>

			<h2>8. Metadatos de Google OAuth</h2>
			<p>Cuando un usuario se registra con Google, los metadatos incluyen:</p>
			<div class="code-block">
				<pre><code>{`{
  "full_name": "Nombre Completo del Usuario",
  "avatar_url": "https://lh3.googleusercontent.com/...",
  "email": "usuario@gmail.com",
  "email_verified": true
}`}</code></pre>
			</div>

			<div class="alert alert-success">
				<strong>✅ ¡Listo!</strong> Una vez configurado, los usuarios podrán registrarse usando sus cuentas de Google.
			</div>
		</div>
	</div>
</div>

<style>
	.docs-container {
		min-height: 100vh;
		background: #f8f9fa;
		padding: 2rem;
	}

	.docs-content {
		max-width: 800px;
		margin: 0 auto;
	}

	.section-content {
		background: white;
		padding: 2rem;
		border-radius: 0.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	h1 {
		color: #333;
		margin-bottom: 1.5rem;
		font-size: 2rem;
		border-bottom: 2px solid var(--color-primary);
		padding-bottom: 0.5rem;
	}

	h2 {
		color: #555;
		margin: 2rem 0 1rem 0;
		font-size: 1.5rem;
	}

	h4 {
		color: #666;
		margin: 1rem 0 0.5rem 0;
		font-size: 1.1rem;
	}

	p {
		margin-bottom: 1rem;
		line-height: 1.6;
		color: #666;
	}

	ol, ul {
		margin-bottom: 1rem;
		padding-left: 1.5rem;
	}

	li {
		margin-bottom: 0.5rem;
		line-height: 1.6;
	}

	.code-block {
		background: #f8f9fa;
		border: 1px solid #e9ecef;
		border-radius: 0.375rem;
		padding: 1rem;
		margin: 1rem 0;
	}

	.code-block pre {
		background: #f1f3f4;
		padding: 1rem;
		border-radius: 0.25rem;
		overflow-x: auto;
		margin: 0;
	}

	.code-block code {
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
		font-size: 0.9rem;
	}

	code {
		background: #f1f3f4;
		padding: 0.2rem 0.4rem;
		border-radius: 0.25rem;
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
		font-size: 0.9rem;
	}

	a {
		color: var(--color-primary);
		text-decoration: none;
	}

	a:hover {
		text-decoration: underline;
	}

	.alert {
		padding: 1rem;
		border-radius: 0.375rem;
		margin: 1rem 0;
	}

	.alert-info {
		background: #d1ecf1;
		border: 1px solid #bee5eb;
		color: #0c5460;
	}

	.alert-success {
		background: #d4edda;
		border: 1px solid #c3e6cb;
		color: #155724;
	}

	.troubleshooting {
		background: #fff3cd;
		border: 1px solid #ffeaa7;
		border-radius: 0.375rem;
		padding: 1rem;
		margin: 1rem 0;
	}

	.problem {
		margin-bottom: 1.5rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid #ffeaa7;
	}

	.problem:last-child {
		border-bottom: none;
		margin-bottom: 0;
		padding-bottom: 0;
	}

	.problem h4 {
		margin: 0 0 0.5rem 0;
		color: #856404;
	}

	.problem p {
		margin: 0.25rem 0;
		color: #856404;
	}

	.problem strong {
		color: #856404;
	}

	@media (max-width: 768px) {
		.docs-container {
			padding: 1rem;
		}

		.section-content {
			padding: 1rem;
		}

		h1 {
			font-size: 1.5rem;
		}

		h2 {
			font-size: 1.3rem;
		}
	}
</style> 