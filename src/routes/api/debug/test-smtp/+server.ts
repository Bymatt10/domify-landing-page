import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sendEmail, createProviderWelcomeEmail } from '$lib/email-service';

export const GET: RequestHandler = async ({ url }) => {
    try {
        const email = url.searchParams.get('email') || 'matthewreyesvanegas46@gmail.com';
        
        // Datos de prueba
        const testData = {
            name: 'Matthew Reyes - Electricista',
            email: email,
            tempPassword: 'TempPass123!',
            loginUrl: 'http://localhost:5173/auth/login'
        };

        // Crear el HTML del email
        const emailHtml = createProviderWelcomeEmail(testData);
        
        // Intentar enviar el email real con SMTP
        console.log('🧪 TESTING SMTP EMAIL SENDING...');
        const emailSent = await sendEmail({
            to: email,
            subject: '🏠 ¡Bienvenido a Domify como Proveedor Verificado! (SMTP Test)',
            html: emailHtml
        });

        if (emailSent) {
            return json({
                success: true,
                message: '✅ Email enviado exitosamente con SMTP',
                testData,
                timestamp: new Date().toISOString()
            });
        } else {
            return json({
                success: false,
                message: '❌ Error enviando email - revisa los logs del servidor',
                testData,
                timestamp: new Date().toISOString()
            });
        }

    } catch (error) {
        console.error('❌ Error in test-smtp:', error);
        return json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}; 