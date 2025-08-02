import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { env } from '$env/dynamic/private';

export const actions: Actions = {
	default: async ({ request }) => {
		try {
			// Parse form data
			const formData = await request.formData();
			const name = formData.get('name')?.toString();
			const email = formData.get('email')?.toString();
			const phone = formData.get('phone')?.toString();
			const subject = formData.get('subject')?.toString();
			const message = formData.get('message')?.toString();

			// Validate required fields
			if (!name || !email || !subject || !message) {
				return fail(400, {
					success: false,
					message: 'Por favor completa todos los campos requeridos'
				});
			}

			// Validate email format
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email)) {
				return fail(400, {
					success: false,
					message: 'Por favor ingresa un email válido'
				});
			}

			// Save contact info to database or send email
			// This is where you would integrate with your email service or database
			// console.log removed

			// For now, we'll simulate a successful submission
			return {
				success: true,
				message: 'Mensaje enviado correctamente'
			};
		} catch (error) {
			console.error('Error processing contact form:', error);
			return fail(500, {
				success: false,
				message: 'Error al procesar tu solicitud. Por favor intenta de nuevo.'
			});
		}
	}
};
