import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import nodemailer from 'nodemailer';


import { getSmtpHost, getSmtpPort, getSmtpUser, getSmtpPass, getFromEmail } from '$lib/env-utils';

// Get environment variables with fallbacks
const SMTP_HOST = getSmtpHost();
const SMTP_PORT = getSmtpPort();
const SMTP_USER = getSmtpUser();
const SMTP_PASS = getSmtpPass();
const FROM_EMAIL = getFromEmail();

export const GET: RequestHandler = async ({ url }) => {
    try {
        const email = url.searchParams.get('email') || 'matthewreyesvanegas46@gmail.com';
        
        console.log('🧪 Testing with different FROM addresses...');
        
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

        // Probar diferentes direcciones FROM
        const fromAddresses = [
            'noreply@sendgrid.net',
            'test@sendgrid.net',
            'matthewreyesvanegas46@gmail.com'
        ];

        for (const fromAddress of fromAddresses) {
            try {
                console.log(`🔄 Trying FROM address: ${fromAddress}`);
                
                const mailOptions = {
                    from: fromAddress,
                    to: email,
                    subject: `🧪 Test FROM: ${fromAddress}`,
                    text: `Este email fue enviado usando FROM: ${fromAddress}`,
                    html: `
                        <h2>🧪 Test de dirección FROM</h2>
                        <p>Este email fue enviado usando:</p>
                        <p><strong>FROM:</strong> ${fromAddress}</p>
                        <p><strong>TO:</strong> ${email}</p>
                        <p><strong>Hora:</strong> ${new Date().toLocaleString()}</p>
                    `,
                };

                const info = await transporter.sendMail(mailOptions);
                
                console.log(`✅ SUCCESS with ${fromAddress}!`);
                console.log('Message ID:', info.messageId);
                
                return json({
                    success: true,
                    message: `✅ Email enviado exitosamente usando FROM: ${fromAddress}`,
                    working_from_address: fromAddress,
                    email_info: {
                        messageId: info.messageId,
                        response: info.response
                    },
                    timestamp: new Date().toISOString()
                });
                
            } catch (error: any) {
                console.log(`❌ FAILED with ${fromAddress}: ${error.message}`);
                continue; // Probar la siguiente dirección
            }
        }

        // Si llegamos aquí, ninguna dirección funcionó
        return json({
            success: false,
            message: '❌ Ninguna dirección FROM funcionó. Necesitas verificar Sender Identity en SendGrid.',
            instructions: [
                '1. Ve a SendGrid Dashboard → Settings → Sender Authentication',
                '2. Click en "Single Sender Verification"',
                '3. Crea un nuevo sender con tu email: matthewreyesvanegas46@gmail.com',
                '4. Verifica el email que recibirás',
                '5. Vuelve a probar el envío'
            ],
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('❌ Test Error:', error);
        return json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}; 