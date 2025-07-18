import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import nodemailer from 'nodemailer';

export const GET: RequestHandler = async () => {
    try {
        const SMTP_HOST = import.meta.env.SMTP_HOST;
        const SMTP_PORT = import.meta.env.SMTP_PORT;
        const SMTP_USER = import.meta.env.SMTP_USER;
        const SMTP_PASS = import.meta.env.SMTP_PASS;
        const FROM_EMAIL = import.meta.env.FROM_EMAIL;

        // Verificar configuración
        if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
            return json({
                error: 'Configuración SMTP incompleta',
                config: {
                    host: SMTP_HOST || 'NOT SET',
                    port: SMTP_PORT || 'NOT SET',
                    user: SMTP_USER ? SMTP_USER.substring(0, 10) + '...' : 'NOT SET',
                    pass_configured: !!SMTP_PASS,
                    from_email: FROM_EMAIL || 'NOT SET'
                }
            }, { status: 500 });
        }

        // Crear transporter
        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: parseInt(SMTP_PORT),
            secure: false,
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS
            }
        });

        // Email de prueba real
        const testEmail = {
            from: `"Domify Test" <${FROM_EMAIL}>`,
            to: 'matthewreyesvanegas@icloud.com', // Tu email real
            subject: '🧪 Prueba Real SMTP - Domify - ' + new Date().toLocaleTimeString(),
            text: 'Este es un email de prueba real para verificar que los emails llegan correctamente.',
            html: `
                <h2>🧪 Prueba Real SMTP - Domify</h2>
                <p>Este es un email de prueba real para verificar que la configuración SMTP funciona correctamente.</p>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h3>Información de la prueba:</h3>
                    <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
                    <p><strong>Desde:</strong> ${FROM_EMAIL}</p>
                    <p><strong>Para:</strong> matthewreyesvanegas@icloud.com</p>
                    <p><strong>Servidor SMTP:</strong> ${SMTP_HOST}:${SMTP_PORT}</p>
                </div>
                
                <p>Si recibes este email, significa que:</p>
                <ul>
                    <li>✅ La configuración SMTP es correcta</li>
                    <li>✅ Los emails se envían exitosamente</li>
                    <li>✅ El formulario de contacto funcionará</li>
                </ul>
                
                <p><strong>Próximo paso:</strong> Verifica tu bandeja de entrada de matthewreyesvanegas@icloud.com</p>
                
                <hr style="border: none; border-top: 1px solid #ecf0f1; margin: 30px 0;">
                <p style="font-size: 12px; color: #7f8c8d;">
                    Este es un email de prueba automático del sistema Domify.
                </p>
            `
        };

        const sendResult = await transporter.sendMail(testEmail);

        return json({
            success: true,
            message: 'Email de prueba real enviado exitosamente',
            send_result: {
                messageId: sendResult.messageId,
                response: sendResult.response,
                accepted: sendResult.accepted,
                rejected: sendResult.rejected
            },
            config: {
                host: SMTP_HOST,
                port: SMTP_PORT,
                user: SMTP_USER.substring(0, 10) + '...',
                from_email: FROM_EMAIL,
                to_email: 'matthewreyesvanegas@icloud.com'
            },
            instructions: [
                '1. Revisa tu bandeja de entrada de matthewreyesvanegas@icloud.com',
                '2. Busca el email con asunto "🧪 Prueba Real SMTP - Domify"',
                '3. Si no lo ves, revisa la carpeta de spam',
                '4. Si llega, el formulario de contacto funcionará correctamente'
            ],
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        return json({
            error: 'Error al enviar email de prueba real',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}; 