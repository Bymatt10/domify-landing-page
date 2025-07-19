import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

import { getSmtpHost, getSmtpPort, getSmtpUser, getSmtpPass, getFromEmail } from '$lib/env-utils';

// Get environment variables with fallbacks
const SMTP_HOST = getSmtpHost();
const SMTP_PORT = getSmtpPort();
const SMTP_USER = getSmtpUser();
const SMTP_PASS = getSmtpPass();
const FROM_EMAIL = getFromEmail();

export const GET: RequestHandler = async () => {
  try {
    const config = {
      smtp_host: SMTP_HOST,
      smtp_port: SMTP_PORT,
      smtp_user: SMTP_USER,
      smtp_pass_length: SMTP_PASS ? SMTP_PASS.length : 0,
      from_email: FROM_EMAIL,
      sendgrid_api_key: SMTP_PASS ? SMTP_PASS.substring(0, 20) + '...' : 'NOT_SET'
    };

    // Verificar configuración básica
    const issues = [];
    
    if (!config.smtp_host || config.smtp_host !== 'smtp.sendgrid.net') {
      issues.push('❌ SMTP_HOST no está configurado correctamente para SendGrid');
    }
    
    if (!config.smtp_user || config.smtp_user !== 'apikey') {
      issues.push('❌ SMTP_USER debe ser "apikey" para SendGrid');
    }
    
    if (!SMTP_PASS || SMTP_PASS.length < 50) {
      issues.push('❌ SMTP_PASS (API Key) parece ser inválido o muy corto');
    }
    
    if (!config.from_email) {
      issues.push('❌ FROM_EMAIL no está configurado');
    }

    return json({
      status: issues.length === 0 ? 'CONFIGURED' : 'ISSUES_FOUND',
      config,
      issues,
      recommendations: [
        '1. Verificar que el remitente esté verificado en SendGrid Dashboard',
        '2. Ir a Settings → Sender Authentication → Single Sender Verification',
        '3. Crear y verificar el remitente: matthewreyesvanegas@icloud.com',
        '4. Esperar la confirmación por email y hacer clic en el enlace',
        '5. Verificar que el dominio esté autenticado si es necesario',
        '6. Revisar la carpeta de spam/correo no deseado',
        '7. Verificar Activity Log en SendGrid Dashboard'
      ],
      next_steps: [
        {
          title: 'Verificar Remitente en SendGrid',
          url: 'https://app.sendgrid.com/settings/sender_auth/senders',
          description: 'Crear y verificar el remitente matthewreyesvanegas@icloud.com'
        },
        {
          title: 'Revisar Activity Log',
          url: 'https://app.sendgrid.com/email_activity',
          description: 'Ver si los emails están siendo enviados o rechazados'
        },
        {
          title: 'Verificar Configuración SMTP',
          url: 'https://app.sendgrid.com/guide/integrate/langs/nodejs',
          description: 'Documentación oficial de SendGrid para Node.js'
        }
      ]
    });

  } catch (error) {
    return json({
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
      config: {
        smtp_host: SMTP_HOST,
        smtp_port: SMTP_PORT,
        smtp_user: SMTP_USER,
        from_email: FROM_EMAIL
      }
    }, { status: 500 });
  }
}; 