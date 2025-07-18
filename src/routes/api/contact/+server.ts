import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import nodemailer from 'nodemailer';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { name, email, subject, message, user_id } = await request.json();

		// Validaciones
		if (!name || !email || !subject || !message) {
			return json({ error: 'Todos los campos son requeridos' }, { status: 400 });
		}

		// Validar email
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return json({ error: 'Email inválido' }, { status: 400 });
		}

		// Validar longitud del mensaje
		if (message.length < 10) {
			return json({ error: 'El mensaje debe tener al menos 10 caracteres' }, { status: 400 });
		}

		// Validar longitud del asunto
		if (subject.length < 3) {
			return json({ error: 'El asunto debe tener al menos 3 caracteres' }, { status: 400 });
		}

		// Obtener variables de entorno para SMTP
		const SMTP_HOST = import.meta.env.SMTP_HOST;
		const SMTP_PORT = import.meta.env.SMTP_PORT;
		const SMTP_USER = import.meta.env.SMTP_USER;
		const SMTP_PASS = import.meta.env.SMTP_PASS;
		const FROM_EMAIL = import.meta.env.FROM_EMAIL || 'noreply@domify.app';

		if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
			console.error('SMTP configuration not complete');
			return json({ error: 'Configuración de email no disponible' }, { status: 500 });
		}

		// Crear el contenido del email
		const emailContent = `
			<h2>Nuevo Mensaje de Contacto - Domify</h2>
			
			<div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
				<h3 style="color: #2c3e50; margin-top: 0;">Información del Remitente:</h3>
				<p><strong>Nombre:</strong> ${name}</p>
				<p><strong>Email:</strong> ${email}</p>
				${user_id ? `<p><strong>ID de Usuario:</strong> ${user_id}</p>` : ''}
				<p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES', { timeZone: 'America/Managua' })}</p>
			</div>
			
			<div style="background-color: #ffffff; padding: 20px; border-left: 4px solid #3498db; margin: 20px 0;">
				<h3 style="color: #2c3e50; margin-top: 0;">Asunto:</h3>
				<p style="font-size: 18px; color: #34495e;">${subject}</p>
			</div>
			
			<div style="background-color: #ffffff; padding: 20px; border-left: 4px solid #27ae60; margin: 20px 0;">
				<h3 style="color: #2c3e50; margin-top: 0;">Mensaje:</h3>
				<div style="white-space: pre-wrap; color: #34495e; line-height: 1.6;">${message}</div>
			</div>
			
			<hr style="border: none; border-top: 1px solid #ecf0f1; margin: 30px 0;">
			
			<div style="background-color: #ecf0f1; padding: 15px; border-radius: 8px; font-size: 14px; color: #7f8c8d;">
				<p><strong>Nota:</strong> Este mensaje fue enviado desde el formulario de contacto de Domify.</p>
				<p>Para responder, simplemente responde a este email o contacta directamente a: ${email}</p>
			</div>
		`;

		// Configurar transporter de SMTP
		const transporter = nodemailer.createTransport({
			host: SMTP_HOST,
			port: parseInt(SMTP_PORT),
			secure: false, // true para 465, false para otros puertos
			auth: {
				user: SMTP_USER,
				pass: SMTP_PASS
			}
		});

		// Enviar email principal usando SMTP
		const mailOptions = {
			from: `"Domify Contact Form" <contact@domify.app>`,
			to: 'domusdeveloper1@gmail.com', // Cambiado a tu email personal para recibir los mensajes
			replyTo: email,
			subject: `[Contacto Domify] ${subject}`,
			html: emailContent
		};

		await transporter.sendMail(mailOptions);

		// Email de confirmación al usuario (opcional)
		const confirmationEmail = `
			<h2>Gracias por contactarnos - Domify</h2>
			
			<p>Hola ${name},</p>
			
			<p>Hemos recibido tu mensaje y te responderemos lo antes posible.</p>
			
			<div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
				<h3 style="color: #2c3e50; margin-top: 0;">Resumen de tu mensaje:</h3>
				<p><strong>Asunto:</strong> ${subject}</p>
				<p><strong>Mensaje:</strong></p>
				<div style="background-color: #ffffff; padding: 10px; border-radius: 4px; margin: 10px 0;">
					${message.substring(0, 200)}${message.length > 200 ? '...' : ''}
				</div>
			</div>
			
			<p>Mientras tanto, puedes:</p>
			<ul>
				<li>Visitar nuestras <a href="https://domify.app/faq">Preguntas Frecuentes</a></li>
				<li>Explorar nuestros <a href="https://domify.app/services">Servicios</a></li>
				<li>Seguirnos en nuestras redes sociales</li>
			</ul>
			
			<p>Saludos,<br>El equipo de Domify</p>
			
			<hr style="border: none; border-top: 1px solid #ecf0f1; margin: 30px 0;">
			
			<div style="font-size: 12px; color: #7f8c8d;">
				<p>Este es un email automático, por favor no respondas a este mensaje.</p>
			</div>
		`;

		// Enviar email de confirmación (no bloqueamos si falla)
		try {
			const confirmationMailOptions = {
				from: `"Domify" <contact@domify.app>`,
				to: email,
				subject: 'Mensaje recibido - Domify',
				html: confirmationEmail
			};

			await transporter.sendMail(confirmationMailOptions);
		} catch (confirmationError) {
			console.error('Error sending confirmation email:', confirmationError);
			// No fallamos si el email de confirmación no se envía
		}

		// Log del contacto (opcional - para analytics)
		console.log('Contact form submitted:', {
			name,
			email,
			subject,
			user_id,
			timestamp: new Date().toISOString()
		});

		return json({
			success: true,
			message: 'Mensaje enviado exitosamente'
		});

	} catch (error) {
		console.error('Error in contact form:', error);
		return json({
			error: 'Error interno del servidor. Por favor intenta nuevamente.'
		}, { status: 500 });
	}
}; 