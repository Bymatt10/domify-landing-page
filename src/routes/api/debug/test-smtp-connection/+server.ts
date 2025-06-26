import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import nodemailer from 'nodemailer';
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } from '$env/static/private';

export const GET: RequestHandler = async () => {
  const results: any = {
    timestamp: new Date().toISOString(),
    config: {
      host: SMTP_HOST,
      port: SMTP_PORT,
      user: SMTP_USER,
      pass_length: SMTP_PASS?.length || 0
    },
    tests: []
  };

  try {
    console.log('🔍 Iniciando pruebas de conectividad SMTP...');
    
    // Test 1: Crear transporter
    results.tests.push({
      name: 'Crear Transporter',
      status: 'RUNNING'
    });

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT),
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      },
      debug: true,
      logger: false // Deshabilitar logger para evitar spam
    });

    results.tests[0].status = 'PASSED';
    results.tests[0].message = 'Transporter creado exitosamente';

    // Test 2: Verificar conexión con timeout
    results.tests.push({
      name: 'Verificar Conexión SMTP',
      status: 'RUNNING'
    });

    console.log('🔍 Verificando conexión SMTP con timeout...');
    
    // Crear una promesa con timeout
    const verifyPromise = transporter.verify();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout: Conexión SMTP tardó más de 10 segundos')), 10000);
    });

    await Promise.race([verifyPromise, timeoutPromise]);
    
    results.tests[1].status = 'PASSED';
    results.tests[1].message = 'Conexión SMTP verificada exitosamente';

    // Test 3: Intentar enviar email de prueba
    results.tests.push({
      name: 'Enviar Email de Prueba',
      status: 'RUNNING'
    });

    console.log('📧 Enviando email de prueba...');

    const mailOptions = {
      from: {
        name: 'Domify Test',
        address: 'matthewreyesvanegas@icloud.com'
      },
      to: 'matthewreyesvanegas46@gmail.com',
      subject: '🧪 Prueba de Conexión SMTP - ' + new Date().toLocaleString('es-ES'),
      text: 'Este es un email de prueba para verificar la conectividad SMTP con SendGrid.',
      html: '<h1>🧪 Prueba de Conexión SMTP</h1><p>Este es un email de prueba para verificar la conectividad SMTP con SendGrid.</p>'
    };

    const info = await transporter.sendMail(mailOptions);
    
    results.tests[2].status = 'PASSED';
    results.tests[2].message = 'Email enviado exitosamente';
    results.tests[2].details = {
      messageId: info.messageId,
      response: info.response
    };

    results.overall_status = 'SUCCESS';
    results.summary = 'Todas las pruebas pasaron exitosamente';

  } catch (error) {
    console.error('❌ Error en pruebas SMTP:', error);
    
    // Marcar la última prueba como fallida
    const lastTest = results.tests[results.tests.length - 1];
    if (lastTest && lastTest.status === 'RUNNING') {
      lastTest.status = 'FAILED';
      lastTest.error = error instanceof Error ? error.message : 'Error desconocido';
    }

    results.overall_status = 'FAILED';
    results.error = error instanceof Error ? error.message : 'Error desconocido';
    results.summary = 'Alguna prueba falló';
  }

  return json(results);
}; 