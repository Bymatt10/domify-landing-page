import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import nodemailer from 'nodemailer';

export const GET: RequestHandler = async ({ url }) => {
  const testEmail = url.searchParams.get('email') || 'matthewreyesvanegasma@hotmail.com';
  
  try {
    console.log('🧪 Testing email delivery to:', testEmail);
    
    // Configuración SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      debug: true, // Habilitar logs detallados
      logger: true
    });

    // Verificar conexión
    console.log('🔍 Verificando conexión SMTP...');
    await transporter.verify();
    console.log('✅ Conexión SMTP verificada');

    // Email de prueba simple
    const mailOptions = {
      from: {
        name: 'Domify - Prueba',
        address: process.env.FROM_EMAIL || 'matthewreyesvanegas@icloud.com'
      },
      to: testEmail,
      subject: `🧪 Prueba de Email - ${new Date().toLocaleString('es-ES')}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🧪 Prueba de Email</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Sistema de notificaciones Domify</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">✅ Email de Prueba Exitoso</h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #495057; margin-top: 0;">📋 Detalles de la Prueba:</h3>
              <ul style="color: #6c757d; line-height: 1.6;">
                <li><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</li>
                <li><strong>Destinatario:</strong> ${testEmail}</li>
                <li><strong>Remitente:</strong> ${process.env.FROM_EMAIL}</li>
                <li><strong>Servidor SMTP:</strong> ${process.env.SMTP_HOST}</li>
                <li><strong>Puerto:</strong> ${process.env.SMTP_PORT}</li>
              </ul>
            </div>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #155724; margin: 0;">
                <strong>🎉 ¡Perfecto!</strong> Si recibes este email, significa que el sistema de notificaciones está funcionando correctamente.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #6c757d; font-size: 14px;">
                Este es un email automático de prueba del sistema Domify.<br>
                No es necesario responder a este mensaje.
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
🧪 PRUEBA DE EMAIL - DOMIFY

✅ Email de Prueba Exitoso

📋 Detalles de la Prueba:
- Fecha: ${new Date().toLocaleString('es-ES')}
- Destinatario: ${testEmail}
- Remitente: ${process.env.FROM_EMAIL}
- Servidor SMTP: ${process.env.SMTP_HOST}
- Puerto: ${process.env.SMTP_PORT}

🎉 ¡Perfecto! Si recibes este email, significa que el sistema de notificaciones está funcionando correctamente.

Este es un email automático de prueba del sistema Domify.
No es necesario responder a este mensaje.
      `
    };

    console.log('📧 Enviando email de prueba...');
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email enviado exitosamente!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);

    return json({
      success: true,
      message: 'Email de prueba enviado exitosamente',
      details: {
        messageId: info.messageId,
        response: info.response,
        to: testEmail,
        from: process.env.FROM_EMAIL,
        timestamp: new Date().toISOString(),
        smtp_host: process.env.SMTP_HOST,
        smtp_port: process.env.SMTP_PORT
      }
    });

  } catch (error) {
    console.error('❌ Error enviando email de prueba:', error);
    
    return json({
      success: false,
      error: 'Error enviando email de prueba',
      details: {
        message: error instanceof Error ? error.message : 'Unknown error',
        to: testEmail,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}; 