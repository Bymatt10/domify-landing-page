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
  const testEmail = url.searchParams.get('email') || 'matthewreyesvanegas46@gmail.com';
  
  try {
    console.log('🧪 Testing with verified sender to:', testEmail);
    
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT),
      secure: false,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });

    // Email de prueba con remitente verificado
    const mailOptions = {
      from: {
        name: 'Domify - Sistema Verificado',
        address: 'matthewreyesvanegas46@gmail.com' // Usar email verificado
      },
      to: testEmail,
      subject: `✅ Email Verificado - ${new Date().toLocaleString('es-ES')}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">✅ Email Verificado</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Sistema Domify - Remitente Verificado</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">🎉 ¡Email Enviado Exitosamente!</h2>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #155724; margin-top: 0;">📋 Información del Envío:</h3>
              <ul style="color: #155724; line-height: 1.6;">
                <li><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</li>
                <li><strong>Destinatario:</strong> ${testEmail}</li>
                <li><strong>Remitente Verificado:</strong> matthewreyesvanegas46@gmail.com</li>
                <li><strong>Servidor:</strong> ${SMTP_HOST}:${SMTP_PORT}</li>
                <li><strong>Estado:</strong> ✅ Enviado y en cola</li>
              </ul>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #856404; margin: 0;">
                <strong>💡 Nota:</strong> Si no ves este email en tu bandeja de entrada, revisa la carpeta de spam/correo no deseado.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #6c757d; font-size: 14px;">
                Sistema de notificaciones Domify<br>
                Remitente verificado en SendGrid
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
✅ EMAIL VERIFICADO - DOMIFY

🎉 ¡Email Enviado Exitosamente!

📋 Información del Envío:
- Fecha: ${new Date().toLocaleString('es-ES')}
- Destinatario: ${testEmail}
- Remitente Verificado: matthewreyesvanegas46@gmail.com
- Servidor: ${SMTP_HOST}:${SMTP_PORT}
- Estado: ✅ Enviado y en cola

💡 Nota: Si no ves este email en tu bandeja de entrada, revisa la carpeta de spam/correo no deseado.

Sistema de notificaciones Domify
Remitente verificado en SendGrid
      `
    };

    console.log('📧 Enviando email con remitente verificado...');
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email enviado exitosamente!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);

    return json({
      success: true,
      message: 'Email enviado con remitente verificado',
      details: {
        messageId: info.messageId,
        response: info.response,
        to: testEmail,
        from: 'matthewreyesvanegas46@gmail.com',
        timestamp: new Date().toISOString(),
        verified_sender: true
      },
      instructions: [
        '1. Revisa tu bandeja de entrada',
        '2. Si no lo ves, revisa la carpeta de spam/correo no deseado',
        '3. Verifica que el email sea: matthewreyesvanegas46@gmail.com',
        '4. El email debería llegar en los próximos minutos'
      ]
    });

  } catch (error) {
    console.error('❌ Error enviando email:', error);
    
    return json({
      success: false,
      error: 'Error enviando email con remitente verificado',
      details: {
        message: error instanceof Error ? error.message : 'Unknown error',
        to: testEmail,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}; 