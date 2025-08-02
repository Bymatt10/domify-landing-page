import nodemailer from 'nodemailer';

// Tipos para el helper de email
export interface EmailOptions {
	to: string | string[];
	subject: string;
	text?: string;
	html?: string;
	replyTo?: string;
	from?: string;
}

export interface EmailResult {
	success: boolean;
	messageId?: string;
	error?: string;
}

let transporter: nodemailer.Transporter | null = null;

function createTransporter(): nodemailer.Transporter | null {
	try {
		// console.log removed
		// Use import.meta.env for client-side or $env for server-side
		const host = import.meta.env.MAILER_SMTP_HOST || process.env.MAILER_SMTP_HOST;
		const port = import.meta.env.MAILER_SMTP_PORT || process.env.MAILER_SMTP_PORT;
		const user = import.meta.env.MAILER_SMTP_USER || process.env.MAILER_SMTP_USER;
		const pass = import.meta.env.MAILER_SMTP_PASS || process.env.MAILER_SMTP_PASS;
		
		// console.log removed
		// console.log removed
		// console.log removed
		// console.log removed
		// console.log removed

		if (!host || !port || !user || !pass) {
			console.error('[EMAIL ERROR] Faltan variables de entorno para Mailtrap SMTP.');
			console.error('Asegúrate de tener MAILER_SMTP_HOST, MAILER_SMTP_PORT, MAILER_SMTP_USER y MAILER_SMTP_PASS en tu entorno.');
			return null;
		}

		// console.log removed

		return nodemailer.createTransport({
			host,
			port: parseInt(port),
			auth: { user, pass },
			secure: false,
			tls: {
				rejectUnauthorized: false
			}
		});
	} catch (error) {
		console.error('Error creando transporter de email:', error);
		return null;
	}
}

export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
	try {
		if (!transporter) {
			transporter = createTransporter();
		}

		if (!transporter) {
			return sendEmailFallback(options);
		}

		const mailOptions = {
			from: options.from || 'Domify <noreply@domify.com>',
			to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
			replyTo: options.replyTo,
			subject: options.subject,
			text: options.text,
			html: options.html || (options.text ? options.text.replace(/\n/g, '<br>') : undefined)
		};

		const info = await transporter.sendMail(mailOptions);
		console.log('Email enviado exitosamente:', {
			messageId: info.messageId,
			to: mailOptions.to,
			subject: mailOptions.subject
		});

		return {
			success: true,
			messageId: info.messageId
		};

	} catch (error) {
		console.error('Error enviando email:', error);
		return sendEmailFallback(options);
	}
}

function sendEmailFallback(options: EmailOptions): EmailResult {
	const emailContent = `\n=== EMAIL A ENVIAR (FALLBACK) ===\nPara: ${Array.isArray(options.to) ? options.to.join(', ') : options.to}\nAsunto: ${options.subject}\n${options.replyTo ? `Reply-To: ${options.replyTo}` : ''}\nContenido:\n${options.text || options.html || 'Sin contenido'}\n=====================\n`;
	// console.log removed
	return {
		success: false,
		error: 'No se pudo enviar el email: faltan variables de entorno',
		messageId: 'fallback-' + Date.now()
	};
}

export async function sendProviderApplicationEmail(formData: {
	nombre: string;
	email: string;
	telefono: string;
	servicio: string;
	mensaje?: string;
}): Promise<EmailResult> {
	const emailContent = `
Nueva solicitud de proveedor de servicios - Domify

Datos del solicitante:
- Nombre: ${formData.nombre}
- Email: ${formData.email}
- Teléfono: ${formData.telefono}
- Servicio: ${formData.servicio}
- Mensaje: ${formData.mensaje || 'No proporcionado'}

Fecha de solicitud: ${new Date().toLocaleString('es-ES', {
	timeZone: 'America/Managua',
	year: 'numeric',
	month: 'long',
	day: 'numeric',
	hour: '2-digit',
	minute: '2-digit'
})}

---
Este mensaje fue enviado automáticamente desde el formulario de "Ser Domifito"
`;

	return sendEmail({
		to: (import.meta.env.MAILER_ADMIN_EMAIL || process.env.MAILER_ADMIN_EMAIL) || 'admin@demomailtrap.co',
		subject: 'Nueva solicitud de proveedor de servicios - Domify',
		text: emailContent,
		replyTo: formData.email
	});
}

// Servicio de Email para Domify
export interface WelcomeEmailData {
	email: string;
	name: string;
	tempPassword: string;
	loginUrl: string;
}

export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
	try {
		// console.log removed
		// console.log removed
		// console.log removed
		// console.log removed
		// console.log removed
		// console.log removed
		// console.log removed
		// console.log removed

		// TODO: Integrar con servicio de email real
		// Opciones recomendadas:
		// 1. Resend (moderno y fácil)
		// 2. SendGrid (robusto)
		// 3. NodeMailer + SMTP
		
		// Por ahora simular envío exitoso
		await new Promise(resolve => setTimeout(resolve, 1000));
		
		return true;
	} catch (error) {
		console.error('❌ Error enviando email:', error);
		return false;
	}
}

export function generateWelcomeEmailTemplate(data: WelcomeEmailData): string {
	return `
<!DOCTYPE html>
<html lang="es">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Bienvenido a Domify</title>
	<style>
		body {
			font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
			line-height: 1.6;
			color: #333;
			max-width: 600px;
			margin: 0 auto;
			padding: 20px;
			background-color: #f5f5f5;
		}
		.container {
			background: white;
			border-radius: 16px;
			padding: 40px;
			box-shadow: 0 10px 30px rgba(12, 59, 46, 0.1);
		}
		.header {
			text-align: center;
			margin-bottom: 30px;
		}
		.logo {
			font-size: 2.5rem;
			font-weight: 700;
			color: #0C3B2E;
			margin-bottom: 10px;
		}
		.welcome-title {
			color: #0C3B2E;
			font-size: 1.8rem;
			font-weight: 600;
			margin: 20px 0;
		}
		.credentials-box {
			background: linear-gradient(135deg, #0C3B2E 0%, #6D9773 100%);
			color: white;
			padding: 25px;
			border-radius: 12px;
			margin: 25px 0;
			text-align: center;
		}
		.credential-item {
			margin: 15px 0;
			font-size: 1.1rem;
		}
		.credential-label {
			font-weight: 600;
			opacity: 0.9;
		}
		.credential-value {
			font-family: 'Courier New', monospace;
			font-size: 1.2rem;
			font-weight: 700;
			margin-top: 5px;
			padding: 8px;
			background: rgba(255, 255, 255, 0.2);
			border-radius: 6px;
		}
		.login-button {
			display: inline-block;
			background: #0C3B2E;
			color: white;
			padding: 15px 30px;
			text-decoration: none;
			border-radius: 8px;
			font-weight: 600;
			margin: 20px 0;
			transition: background 0.3s;
		}
		.login-button:hover {
			background: #6D9773;
		}
		.warning-box {
			background: #FEF2F2;
			border: 1px solid #FECACA;
			color: #DC2626;
			padding: 20px;
			border-radius: 8px;
			margin: 20px 0;
		}
		.info-box {
			background: #F0F9FF;
			border: 1px solid #BAE6FD;
			color: #0369A1;
			padding: 20px;
			border-radius: 8px;
			margin: 20px 0;
		}
		.footer {
			text-align: center;
			margin-top: 30px;
			color: #6B7280;
			font-size: 0.9rem;
		}
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<div class="logo">Domify</div>
			<h1 class="welcome-title">¡Bienvenido a nuestra plataforma!</h1>
			<p>Hola <strong>${data.name}</strong>, tu aplicación como proveedor ha sido aprobada.</p>
		</div>

		<div class="info-box">
			<h3>🎉 ¡Felicitaciones!</h3>
			<p>Tu solicitud ha sido aprobada y ahora eres parte de nuestra comunidad de proveedores de servicios.</p>
			<p>Hemos creado una cuenta para ti con credenciales temporales.</p>
		</div>

		<div class="credentials-box">
			<h3>🔐 Tus credenciales de acceso</h3>
			<div class="credential-item">
				<div class="credential-label">Email:</div>
				<div class="credential-value">${data.email}</div>
			</div>
			<div class="credential-item">
				<div class="credential-label">Contraseña temporal:</div>
				<div class="credential-value">${data.tempPassword}</div>
			</div>
		</div>

		<div class="warning-box">
			<h4>⚠️ Importante</h4>
			<ul>
				<li><strong>Esta es una contraseña temporal</strong> que debes cambiar en tu primer inicio de sesión.</li>
				<li>Por seguridad, te pediremos que crees una nueva contraseña.</li>
				<li>Guarda estas credenciales en un lugar seguro.</li>
			</ul>
		</div>

		<div style="text-align: center;">
			<a href="${data.loginUrl}" class="login-button">
				🚀 Iniciar Sesión Ahora
			</a>
		</div>

		<div class="info-box">
			<h4>🌟 Con tu cuenta podrás:</h4>
			<ul>
				<li>Recibir solicitudes de servicios de clientes</li>
				<li>Gestionar tu perfil y disponibilidad</li>
				<li>Ver y responder a las reservas</li>
				<li>Acceder a herramientas para proveedores</li>
				<li>También usar la plataforma como cliente (tienes ambos roles)</li>
			</ul>
		</div>

		<div class="footer">
			<p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
			<p><strong>Equipo Domify</strong></p>
		</div>
	</div>
</body>
</html>
	`.trim();
}

// Función auxiliar para generar contraseñas temporales seguras
export function generateTemporaryPassword(length: number = 12): string {
	const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
	let password = '';
	
	// Asegurar al menos una mayúscula, una minúscula y un número
	const upper = 'ABCDEFGHJKMNPQRSTUVWXYZ';
	const lower = 'abcdefghijkmnpqrstuvwxyz';
	const numbers = '23456789';
	
	password += upper[Math.floor(Math.random() * upper.length)];
	password += lower[Math.floor(Math.random() * lower.length)];
	password += numbers[Math.floor(Math.random() * numbers.length)];
	
	// Llenar el resto
	for (let i = 3; i < length; i++) {
		password += chars[Math.floor(Math.random() * chars.length)];
	}
	
	// Mezclar caracteres
	return password.split('').sort(() => 0.5 - Math.random()).join('');
}

export async function sendContactEmail(formData: {
	nombre: string;
	email: string;
	asunto: string;
	mensaje: string;
}): Promise<EmailResult> {
	const emailContent = `\nNuevo mensaje de contacto - Domify\n\nDe: ${formData.nombre} (${formData.email})\nAsunto: ${formData.asunto}\n\nMensaje:\n${formData.mensaje}\n\n---\nEste mensaje fue enviado desde el formulario de contacto\n`;

	return sendEmail({
		to: process.env.MAILER_ADMIN_EMAIL || 'admin@demomailtrap.co',
		subject: `Contacto: ${formData.asunto}`,
		text: emailContent,
		replyTo: formData.email
	});
}

export async function sendServiceNotificationEmail(
	userEmail: string,
	serviceName: string,
	status: 'confirmed' | 'cancelled' | 'completed'
): Promise<EmailResult> {
	const statusMessages = {
		confirmed: 'ha sido confirmado',
		cancelled: 'ha sido cancelado',
		completed: 'ha sido completado'
	};

	const emailContent = `\nActualización de servicio - Domify\n\nTu servicio "${serviceName}" ${statusMessages[status]}.\n\nGracias por usar Domify.\n\nSaludos,\nEl equipo de Domify\n`;

	return sendEmail({
		to: userEmail,
		subject: `Servicio ${statusMessages[status]} - Domify`,
		text: emailContent
	});
} 