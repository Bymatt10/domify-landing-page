import nodemailer from 'nodemailer';
import { getSmtpHost, getSmtpPort, getSmtpUser, getSmtpPass, getFromEmail } from '$lib/env-utils';

// Get environment variables with fallbacks
const SMTP_HOST = getSmtpHost();
const SMTP_PORT = getSmtpPort();
const SMTP_USER = getSmtpUser();
const SMTP_PASS = getSmtpPass();
const FROM_EMAIL = getFromEmail();

// Configurar el transporter de nodemailer con SendGrid SMTP
const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT),
    secure: false, // true para 465, false para otros puertos
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Verificar la configuración SMTP al inicializar
console.log('🔧 SMTP Configuration:');
console.log('Host:', SMTP_HOST);
console.log('Port:', SMTP_PORT);
console.log('User:', SMTP_USER);
console.log('From Email:', FROM_EMAIL);

// Verificar la conexión SMTP
transporter.verify(function (error: Error | null, success: boolean) {
    if (error) {
        console.log('❌ SMTP Connection Error:', error);
    } else {
        console.log('✅ SMTP Server is ready to take our messages');
    }
});

export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
    try {
        console.log('🚀 Starting SMTP email send...');
        console.log('To:', options.to);
        console.log('Subject:', options.subject);
        
        const mailOptions = {
            from: `"Domify" <${FROM_EMAIL}>`,
            to: options.to,
            subject: options.subject,
            text: options.text || options.html.replace(/<[^>]*>/g, ''), // Fallback text
            html: options.html,
        };

        console.log('📧 Sending email via SMTP...');
        const info = await transporter.sendMail(mailOptions);
        
        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Response:', info.response);
        
        return true;

    } catch (error: any) {
        console.error('❌ Error sending email via SMTP:', error);
        return false;
    }
}

// Plantilla para email de bienvenida de proveedor
export function createProviderWelcomeEmail(data: {
    name: string;
    email: string;
    tempPassword: string;
    loginUrl: string;
}): string {
    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenido a Domify</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8fafc;
            }
            .container {
                background: white;
                border-radius: 12px;
                padding: 40px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #3b82f6;
            }
            .logo {
                font-size: 32px;
                font-weight: bold;
                color: #3b82f6;
                margin-bottom: 10px;
            }
            .welcome-title {
                color: #1f2937;
                font-size: 24px;
                margin-bottom: 20px;
            }
            .credentials-box {
                background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
                border: 2px solid #3b82f6;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
            }
            .credential-item {
                display: flex;
                justify-content: space-between;
                margin: 10px 0;
                padding: 8px 0;
                border-bottom: 1px solid #cbd5e1;
            }
            .credential-label {
                font-weight: 600;
                color: #475569;
            }
            .credential-value {
                font-family: monospace;
                background: white;
                padding: 4px 8px;
                border-radius: 4px;
                border: 1px solid #d1d5db;
            }
            .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #3b82f6, #2563eb);
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                margin: 20px 0;
                text-align: center;
            }
            .warning {
                background: #fef3c7;
                border: 1px solid #f59e0b;
                padding: 15px;
                border-radius: 6px;
                margin: 20px 0;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🏠 Domify</div>
                <h1 class="welcome-title">¡Bienvenido como Proveedor!</h1>
            </div>
            
            <p>Estimado/a <strong>${data.name}</strong>,</p>
            
            <p>¡Felicitaciones! Tu aplicación para convertirte en proveedor de servicios en Domify ha sido <strong>aprobada</strong>.</p>
            
            <p>Hemos creado tu cuenta con las siguientes credenciales:</p>
            
            <div class="credentials-box">
                <div class="credential-item">
                    <span class="credential-label">Email:</span>
                    <span class="credential-value">${data.email}</span>
                </div>
                <div class="credential-item">
                    <span class="credential-label">Contraseña temporal:</span>
                    <span class="credential-value">${data.tempPassword}</span>
                </div>
            </div>
            
            <div class="warning">
                <strong>⚠️ Importante:</strong> Por favor, cambia tu contraseña después de iniciar sesión por primera vez por motivos de seguridad.
            </div>
            
            <p>Puedes iniciar sesión en tu panel de proveedor haciendo clic en el siguiente botón:</p>
            
            <div style="text-align: center;">
                <a href="${data.loginUrl}" class="cta-button">Iniciar Sesión</a>
            </div>
            
            <p>Como proveedor verificado, ahora puedes:</p>
            <ul>
                <li>✅ Gestionar tu perfil de empresa</li>
                <li>✅ Recibir solicitudes de servicios</li>
                <li>✅ Comunicarte con clientes</li>
                <li>✅ Gestionar tus reservas y pagos</li>
            </ul>
            
            <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
            
            <div class="footer">
                <p>
                    <strong>Equipo de Domify</strong><br>
                    Tu plataforma confiable de servicios para el hogar
                </p>
                <p>
                    <small>Este es un email automático, por favor no responder directamente.</small>
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
}

// Función combinada para enviar email de bienvenida a proveedor
export async function sendProviderWelcomeEmail(
    email: string,
    name: string,
    tempPassword: string,
    loginUrl: string
): Promise<boolean> {
    try {
        console.log('📧 Sending provider welcome email to:', email);
        
        const emailHtml = createProviderWelcomeEmail({
            name,
            email,
            tempPassword,
            loginUrl
        });

        const result = await sendEmail({
            to: email,
            subject: '🎉 ¡Bienvenido a Domify como Proveedor!',
            html: emailHtml
        });

        console.log('Provider welcome email result:', result);
        return result;

    } catch (error) {
        console.error('Error sending provider welcome email:', error);
        return false;
    }
} 