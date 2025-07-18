import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import nodemailer from 'nodemailer';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json();
        console.log('Received body:', body);

        const { name, email, subject, message, user_id } = body;

        // Validaciones
        if (!name || !email || !subject || !message) {
            return json({ 
                error: 'Todos los campos son requeridos',
                received: { name, email, subject, message, user_id }
            }, { status: 400 });
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return json({ 
                error: 'Email inválido',
                email_received: email
            }, { status: 400 });
        }

        // Validar longitud del mensaje
        if (message.length < 10) {
            return json({ 
                error: 'El mensaje debe tener al menos 10 caracteres',
                message_length: message.length
            }, { status: 400 });
        }

        // Validar longitud del asunto
        if (subject.length < 3) {
            return json({ 
                error: 'El asunto debe tener al menos 3 caracteres',
                subject_length: subject.length
            }, { status: 400 });
        }

        // Obtener variables de entorno para SMTP
        const SMTP_HOST = import.meta.env.SMTP_HOST;
        const SMTP_PORT = import.meta.env.SMTP_PORT;
        const SMTP_USER = import.meta.env.SMTP_USER;
        const SMTP_PASS = import.meta.env.SMTP_PASS;
        const FROM_EMAIL = import.meta.env.FROM_EMAIL || 'noreply@domify.app';

        console.log('SMTP Config:', {
            host: SMTP_HOST,
            port: SMTP_PORT,
            user: SMTP_USER ? SMTP_USER.substring(0, 10) + '...' : 'NOT SET',
            pass_configured: !!SMTP_PASS,
            from_email: FROM_EMAIL
        });

        if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
            return json({ 
                error: 'Configuración de email no disponible',
                smtp_config: {
                    host: SMTP_HOST || 'NOT SET',
                    port: SMTP_PORT || 'NOT SET',
                    user: SMTP_USER ? SMTP_USER.substring(0, 10) + '...' : 'NOT SET',
                    pass_configured: !!SMTP_PASS
                }
            }, { status: 500 });
        }

        // Crear transporter de SMTP
        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: parseInt(SMTP_PORT),
            secure: false,
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS
            }
        });

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

        // Enviar email principal usando SMTP
        const mailOptions = {
            from: `"Domify Contact Form" <${FROM_EMAIL}>`,
            to: 'contact@domify.app',
            replyTo: email,
            subject: `[Contacto Domify] ${subject}`,
            html: emailContent
        };

        console.log('Sending email with options:', {
            from: mailOptions.from,
            to: mailOptions.to,
            replyTo: mailOptions.replyTo,
            subject: mailOptions.subject
        });

        const sendResult = await transporter.sendMail(mailOptions);

        console.log('Email sent successfully:', {
            messageId: sendResult.messageId,
            response: sendResult.response
        });

        return json({
            success: true,
            message: 'Mensaje enviado exitosamente',
            debug_info: {
                received_data: { name, email, subject, message, user_id },
                smtp_config: {
                    host: SMTP_HOST,
                    port: SMTP_PORT,
                    user: SMTP_USER.substring(0, 10) + '...',
                    from_email: FROM_EMAIL
                },
                send_result: {
                    messageId: sendResult.messageId,
                    response: sendResult.response,
                    accepted: sendResult.accepted,
                    rejected: sendResult.rejected
                }
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error in debug contact form:', error);
        return json({
            error: 'Error interno del servidor. Por favor intenta nuevamente.',
            debug_error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}; 