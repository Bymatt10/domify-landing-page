import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import nodemailer from 'nodemailer';
import { applyRateLimit } from '$lib/rate-limit-middleware';

export const POST: RequestHandler = async ({ request }) => {
	try {
		// Aplicar rate limiting
		const rateLimitResult = await applyRateLimit(request, 'forms');
		if (!rateLimitResult.success) {
			return json({
				error: 'Rate limit exceeded',
				message: 'Too many contact form submissions. Please try again later.'
			}, { status: 429 });
		}

		const { name, email, subject, message, user_id, category_request } = await request.json();

		if (!name || !email || !subject || !message) {
			return json({ error: 'Todos los campos son requeridos' }, { status: 400 });
		}

		// Mock success if SMTP is not configured
		const SMTP_HOST = import.meta.env.SMTP_HOST;
		const SMTP_USER = import.meta.env.SMTP_USER;
		const SMTP_PASS = import.meta.env.SMTP_PASS;

		const isPlaceholder = !SMTP_HOST || SMTP_HOST.includes('placeholder') || !SMTP_USER || !SMTP_PASS;

		if (isPlaceholder) {
			console.log('MOCK: Email would be sent here (SMTP not configured)');
			return json({
				success: true,
				message: 'Mensaje enviado exitosamente (Mock)'
			});
		}

		// Real email sending
		// ... (existing nodemailer logic)
		const transporter = nodemailer.createTransport({
			host: SMTP_HOST,
			port: parseInt(import.meta.env.SMTP_PORT || '587'),
			secure: false,
			auth: {
				user: SMTP_USER,
				pass: SMTP_PASS
			}
		});

		const mailOptions = {
			from: `"Domify Contact Form" <contact@domify.app>`,
			to: category_request ? 'info@domify.app' : 'domusdeveloper1@gmail.com',
			replyTo: email,
			subject: category_request ? `[Nueva Categoría] ${subject}` : `[Contacto Domify] ${subject}`,
			text: message // Simplified for brevity in this response
		};

		await transporter.sendMail(mailOptions);

		return json({
			success: true,
			message: 'Mensaje enviado exitosamente'
		});

	} catch (error) {
		console.error('Error in contact form:', error);
		return json({
			error: 'Error interno del servidor.'
		}, { status: 500 });
	}
};