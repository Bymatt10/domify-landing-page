import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import nodemailer from 'nodemailer';

export const GET: RequestHandler = async () => {
    try {
        const SMTP_HOST = import.meta.env.SMTP_HOST;
        const SMTP_PORT = import.meta.env.SMTP_PORT;
        const SMTP_USER = import.meta.env.SMTP_USER;
        const SMTP_PASS = import.meta.env.SMTP_PASS;

        // Verificar configuración
        if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
            return json({
                error: 'Configuración SMTP incompleta',
                config: {
                    host: SMTP_HOST || 'NOT SET',
                    port: SMTP_PORT || 'NOT SET',
                    user: SMTP_USER ? SMTP_USER.substring(0, 10) + '...' : 'NOT SET',
                    pass_configured: !!SMTP_PASS
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

        // Email de prueba directo a contact@domify.app
        const testEmail = {
            from: `"Test Direct" <${SMTP_USER}>`,
            to: 'contact@domify.app',
            subject: '🧪 Prueba Directa - ' + new Date().toLocaleTimeString(),
            text: 'Este es un email de prueba directo a contact@domify.app para verificar que llega correctamente.',
            html: `
                <h2>🧪 Prueba Directa - Domify</h2>
                <p>Este es un email de prueba directo a <strong>contact@domify.app</strong> para verificar que llega correctamente.</p>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h3>Información de la prueba:</h3>
                    <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
                    <p><strong>Desde:</strong> ${SMTP_USER}</p>
                    <p><strong>Para:</strong> contact@domify.app</p>
                    <p><strong>Servidor SMTP:</strong> ${SMTP_HOST}:${SMTP_PORT}</p>
                </div>
                
                <p>Si recibes este email en la bandeja de entrada de <strong>contact@domify.app</strong>, significa que:</p>
                <ul>
                    <li>✅ La configuración SMTP es correcta</li>
                    <li>✅ Los emails llegan a contact@domify.app</li>
                    <li>✅ El formulario de contacto funcionará</li>
                </ul>
                
                <p><strong>Próximo paso:</strong> Verifica la bandeja de entrada de contact@domify.app</p>
                
                <hr style="border: none; border-top: 1px solid #ecf0f1; margin: 30px 0;">
                <p style="font-size: 12px; color: #7f8c8d;">
                    Este es un email de prueba automático del sistema Domify.
                </p>
            `
        };

        const sendResult = await transporter.sendMail(testEmail);

        return json({
            success: true,
            message: 'Email de prueba directo enviado exitosamente',
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
                from_email: SMTP_USER,
                to_email: 'contact@domify.app'
            },
            instructions: [
                '1. Revisa la bandeja de entrada de contact@domify.app',
                '2. Busca el email con asunto "🧪 Prueba Directa - Domify"',
                '3. Si no lo ves, revisa la carpeta de spam',
                '4. Si llega, el formulario de contacto funcionará correctamente'
            ],
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        return json({
            error: 'Error al enviar email de prueba directo',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}; 