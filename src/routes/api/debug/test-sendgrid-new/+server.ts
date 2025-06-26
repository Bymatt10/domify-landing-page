import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sendEmail } from '$lib/email-service';

export const GET: RequestHandler = async () => {
    try {
        console.log('🧪 Testing SendGrid with new configuration...');
        console.log('From: test@sendgrid.net');
        console.log('To: matthewreyesvanegas46@gmail.com');

        const testEmailHtml = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Prueba SendGrid</title>
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
                .success-badge {
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white;
                    padding: 10px 20px;
                    border-radius: 20px;
                    display: inline-block;
                    margin: 20px 0;
                    font-weight: 600;
                }
                .info-box {
                    background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
                    border: 2px solid #3b82f6;
                    border-radius: 8px;
                    padding: 20px;
                    margin: 20px 0;
                }
                .timestamp {
                    color: #6b7280;
                    font-size: 14px;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">🏠 Domify</div>
                    <h1>Prueba de SendGrid Exitosa</h1>
                </div>
                
                <div class="success-badge">
                    ✅ Email enviado correctamente
                </div>
                
                <p>Este es un email de prueba para verificar la configuración de SendGrid.</p>
                
                <div class="info-box">
                    <h3>📧 Detalles del Email:</h3>
                    <ul>
                        <li><strong>Desde:</strong> test@sendgrid.net</li>
                        <li><strong>Para:</strong> matthewreyesvanegas46@gmail.com</li>
                        <li><strong>Servicio:</strong> SendGrid SMTP</li>
                        <li><strong>Estado:</strong> Configuración funcionando correctamente</li>
                    </ul>
                </div>
                
                <p>Si recibes este email, significa que:</p>
                <ul>
                    <li>✅ La configuración de SendGrid está correcta</li>
                    <li>✅ El email desde test@sendgrid.net funciona</li>
                    <li>✅ Los emails llegan a matthewreyesvanegas46@gmail.com</li>
                    <li>✅ El sistema está listo para producción</li>
                </ul>
                
                <p class="timestamp">
                    Enviado el: ${new Date().toLocaleString('es-ES', { timeZone: 'America/Managua' })}
                </p>
            </div>
        </body>
        </html>
        `;

        const success = await sendEmail({
            to: 'matthewreyesvanegas46@gmail.com',
            subject: '🧪 Prueba SendGrid - test@sendgrid.net → matthewreyesvanegas46@gmail.com',
            html: testEmailHtml,
            text: 'Prueba de SendGrid exitosa. El email desde test@sendgrid.net hacia matthewreyesvanegas46@gmail.com funciona correctamente.'
        });

        if (success) {
            console.log('✅ Test email sent successfully!');
            return json({
                success: true,
                message: 'Email de prueba enviado exitosamente',
                details: {
                    from: 'test@sendgrid.net',
                    to: 'matthewreyesvanegas46@gmail.com',
                    timestamp: new Date().toISOString(),
                    service: 'SendGrid SMTP'
                }
            });
        } else {
            console.log('❌ Failed to send test email');
            return json({
                success: false,
                error: 'Error al enviar el email de prueba'
            }, { status: 500 });
        }

    } catch (error) {
        console.error('❌ Error in SendGrid test:', error);
        return json({
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 500 });
    }
}; 