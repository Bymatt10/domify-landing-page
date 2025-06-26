import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL } from '$env/static/private';
import nodemailer from 'nodemailer';

export const GET: RequestHandler = async ({ url }) => {
    try {
        const email = url.searchParams.get('email') || 'matthewreyesvanegas46@gmail.com';
        
        console.log('🧪 Simple SMTP Test Starting...');
        console.log('Target email:', email);
        
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

        // Email simple de prueba
        const mailOptions = {
            from: `"Domify Test" <${FROM_EMAIL}>`,
            to: email,
            subject: '🧪 Prueba Simple SMTP - Domify',
            text: 'Este es un email de prueba simple enviado desde Domify usando SMTP.',
            html: `
                <h2>🧪 Prueba Simple SMTP</h2>
                <p>Este es un email de prueba simple enviado desde Domify.</p>
                <p><strong>Hora:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>Configuración:</strong></p>
                <ul>
                    <li>Host: ${SMTP_HOST}</li>
                    <li>Port: ${SMTP_PORT}</li>
                    <li>User: ${SMTP_USER}</li>
                    <li>From: ${FROM_EMAIL}</li>
                </ul>
                <hr>
                <p><small>Si recibes este email, la configuración SMTP está funcionando correctamente.</small></p>
            `,
        };

        console.log('📧 Sending simple test email...');
        console.log('Mail options:', JSON.stringify(mailOptions, null, 2));
        
        const info = await transporter.sendMail(mailOptions);
        
        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Response:', info.response);
        console.log('Full info:', JSON.stringify(info, null, 2));
        
        return json({
            success: true,
            message: '✅ Email enviado exitosamente con SMTP',
            email_info: {
                messageId: info.messageId,
                response: info.response,
                accepted: info.accepted,
                rejected: info.rejected,
                pending: info.pending
            },
            test_details: {
                to: email,
                from: FROM_EMAIL,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error: any) {
        console.error('❌ Simple SMTP Test Error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        
        return json({
            success: false,
            error: error.message,
            error_code: error.code,
            error_details: {
                name: error.name,
                message: error.message,
                code: error.code,
                command: error.command,
                response: error.response,
                responseCode: error.responseCode
            },
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}; 