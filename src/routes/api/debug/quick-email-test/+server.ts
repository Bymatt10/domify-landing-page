import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import nodemailer from 'nodemailer';
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL } from '$env/static/private';

export const GET: RequestHandler = async ({ url }) => {
  const testEmail = url.searchParams.get('email') || 'matthewreyesvanegasma@hotmail.com';
  
  try {
    console.log('🚀 Quick email test to:', testEmail);
    
    // Configuración SMTP con timeout más corto
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT),
      secure: false,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      },
      connectionTimeout: 5000, // 5 segundos
      greetingTimeout: 5000,
      socketTimeout: 5000
    });

    // Email simple y rápido
    const mailOptions = {
      from: {
        name: 'Domify Test',
        address: FROM_EMAIL
      },
      to: testEmail,
      subject: '🧪 Test Rápido - ' + new Date().toLocaleTimeString('es-ES'),
      text: 'Este es un test rápido de email desde Domify.',
      html: '<h1>🧪 Test Rápido</h1><p>Este es un test rápido de email desde Domify.</p>'
    };

    console.log('📧 Enviando email rápido...');
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email enviado exitosamente!');
    console.log('Message ID:', info.messageId);

    return json({
      success: true,
      message: 'Email enviado exitosamente',
      details: {
        messageId: info.messageId,
        response: info.response,
        to: testEmail,
        from: FROM_EMAIL,
        timestamp: new Date().toISOString()
      },
      next_steps: [
        '1. Revisa tu bandeja de entrada',
        '2. Si no lo ves, revisa spam/correo no deseado',
        '3. El email debería llegar en los próximos minutos'
      ]
    });

  } catch (error) {
    console.error('❌ Error en test rápido:', error);
    
    return json({
      success: false,
      error: 'Error enviando email',
      details: {
        message: error instanceof Error ? error.message : 'Unknown error',
        to: testEmail,
        timestamp: new Date().toISOString()
      },
      troubleshooting: [
        '1. Verifica que el remitente esté verificado en SendGrid',
        '2. Revisa la configuración SMTP',
        '3. Verifica la conectividad a internet'
      ]
    }, { status: 500 });
  }
}; 