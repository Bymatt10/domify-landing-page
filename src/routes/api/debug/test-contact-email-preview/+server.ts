import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
    try {
        const testData = {
            name: 'Juan Pérez',
            email: 'juan.perez@example.com',
            subject: 'Consulta sobre servicios',
            message: 'Hola, me gustaría obtener más información sobre los servicios de limpieza disponibles. ¿Podrían contactarme?',
            user_id: 'user-123'
        };

        const emailContent = `
            <h2>Nuevo Mensaje de Contacto - Domify</h2>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2c3e50; margin-top: 0;">Información del Remitente:</h3>
                <p><strong>Nombre:</strong> ${testData.name}</p>
                <p><strong>Email:</strong> ${testData.email}</p>
                <p><strong>ID de Usuario:</strong> ${testData.user_id}</p>
                <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES', { timeZone: 'America/Managua' })}</p>
            </div>
            
            <div style="background-color: #ffffff; padding: 20px; border-left: 4px solid #3498db; margin: 20px 0;">
                <h3 style="color: #2c3e50; margin-top: 0;">Asunto:</h3>
                <p style="font-size: 18px; color: #34495e;">${testData.subject}</p>
            </div>
            
            <div style="background-color: #ffffff; padding: 20px; border-left: 4px solid #27ae60; margin: 20px 0;">
                <h3 style="color: #2c3e50; margin-top: 0;">Mensaje:</h3>
                <div style="white-space: pre-wrap; color: #34495e; line-height: 1.6;">${testData.message}</div>
            </div>
            
            <hr style="border: none; border-top: 1px solid #ecf0f1; margin: 30px 0;">
            
            <div style="background-color: #ecf0f1; padding: 15px; border-radius: 8px; font-size: 14px; color: #7f8c8d;">
                <p><strong>Nota:</strong> Este mensaje fue enviado desde el formulario de contacto de Domify.</p>
                <p>Para responder, simplemente responde a este email o contacta directamente a: ${testData.email}</p>
            </div>
        `;

        return json({
            success: true,
            email_preview: {
                from: 'Domify Contact Form <contact@domify.app>',
                to: 'contact@domify.app',
                replyTo: testData.email,
                subject: `[Contacto Domify] ${testData.subject}`,
                html_content: emailContent
            },
            explanation: {
                from_field: 'Usa el email autenticado (contact@domify.app) para evitar problemas de autenticación SMTP',
                reply_to: 'Incluye el email del usuario para que puedas responder directamente',
                to_field: 'Todos los mensajes llegan a contact@domify.app',
                user_email: 'El email del usuario aparece en el contenido del mensaje'
            },
            test_data: testData,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        return json({
            error: 'Error al generar preview del email',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}; 