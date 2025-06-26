import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import nodemailer from 'nodemailer';
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL } from '$env/static/private';

export const GET: RequestHandler = async () => {
    try {
        console.log('🔧 Detailed SMTP Test Starting...');
        console.log('Configuration:');
        console.log('- SMTP_HOST:', SMTP_HOST);
        console.log('- SMTP_PORT:', SMTP_PORT);
        console.log('- SMTP_USER:', SMTP_USER);
        console.log('- FROM_EMAIL:', FROM_EMAIL);

        // Crear transporter
        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: parseInt(SMTP_PORT),
            secure: false,
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // Verificar conexión
        console.log('🔍 Testing SMTP connection...');
        try {
            await transporter.verify();
            console.log('✅ SMTP connection verified successfully');
        } catch (verifyError) {
            console.error('❌ SMTP verification failed:', verifyError);
            return json({
                success: false,
                error: 'SMTP connection failed',
                details: verifyError
            }, { status: 500 });
        }

        // Intentar enviar email
        console.log('📧 Attempting to send test email...');
        const mailOptions = {
            from: `"Domify Test" <${FROM_EMAIL}>`,
            to: 'matthewreyesvanegas46@gmail.com',
            subject: '🧪 Prueba SMTP Detallada - ' + new Date().toLocaleTimeString(),
            html: `
                <h2>🧪 Prueba SMTP Detallada</h2>
                <p><strong>Desde:</strong> ${FROM_EMAIL}</p>
                <p><strong>Para:</strong> matthewreyesvanegas46@gmail.com</p>
                <p><strong>Hora:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>Servidor:</strong> ${SMTP_HOST}:${SMTP_PORT}</p>
                <p>Si recibes este email, la configuración funciona correctamente.</p>
            `,
            text: `Prueba SMTP desde ${FROM_EMAIL} hacia matthewreyesvanegas46@gmail.com`
        };

        console.log('📤 Sending email with options:', {
            from: mailOptions.from,
            to: mailOptions.to,
            subject: mailOptions.subject
        });

        const info = await transporter.sendMail(mailOptions);
        
        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Response:', info.response);

        return json({
            success: true,
            message: 'Email enviado exitosamente',
            details: {
                messageId: info.messageId,
                response: info.response,
                from: FROM_EMAIL,
                to: 'matthewreyesvanegas46@gmail.com',
                timestamp: new Date().toISOString()
            }
        });

    } catch (error: any) {
        console.error('❌ Detailed SMTP test failed:', error);
        
        return json({
            success: false,
            error: 'Error en prueba SMTP detallada',
            details: {
                message: error.message,
                code: error.code,
                command: error.command,
                response: error.response,
                responseCode: error.responseCode,
                stack: error.stack
            }
        }, { status: 500 });
    }
}; 