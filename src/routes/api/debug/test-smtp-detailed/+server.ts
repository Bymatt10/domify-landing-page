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
            },
            debug: true, // Habilitar debug
            logger: true  // Habilitar logs
        });

        // Verificar conexión
        let verifyResult;
        try {
            verifyResult = await transporter.verify();
        } catch (verifyError) {
            return json({
                error: 'Error al verificar conexión SMTP',
                verify_error: verifyError instanceof Error ? verifyError.message : 'Unknown error',
                config: {
                    host: SMTP_HOST,
                    port: SMTP_PORT,
                    user: SMTP_USER.substring(0, 10) + '...',
                    from_email: FROM_EMAIL
                }
            }, { status: 500 });
        }

        // Enviar email de prueba
        const testEmail = {
            from: `"Test SMTP" <${FROM_EMAIL}>`,
            to: 'test@example.com',
            subject: 'Test SMTP - ' + new Date().toISOString(),
            text: 'Este es un email de prueba para verificar la configuración SMTP.',
            html: `
                <h2>Test SMTP - Domify</h2>
                <p>Este es un email de prueba para verificar la configuración SMTP.</p>
                <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
                <p><strong>Host:</strong> ${SMTP_HOST}</p>
                <p><strong>Puerto:</strong> ${SMTP_PORT}</p>
                <p><strong>Usuario:</strong> ${SMTP_USER.substring(0, 10)}...</p>
            `
        };

        let sendResult;
        try {
            sendResult = await transporter.sendMail(testEmail);
        } catch (sendError) {
            return json({
                error: 'Error al enviar email de prueba',
                send_error: sendError instanceof Error ? sendError.message : 'Unknown error',
                verify_success: verifyResult,
                config: {
                    host: SMTP_HOST,
                    port: SMTP_PORT,
                    user: SMTP_USER.substring(0, 10) + '...',
                    from_email: FROM_EMAIL
                }
            }, { status: 500 });
        }

        return json({
            success: true,
            message: 'Email de prueba enviado exitosamente',
            verify_result: verifyResult,
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
                from_email: FROM_EMAIL
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        return json({
            error: 'Error general en test SMTP',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}; 