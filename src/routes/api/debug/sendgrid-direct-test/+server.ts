import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
// import sgMail from '@sendgrid/mail';

export const GET: RequestHandler = async ({ url }) => {
    try {
        const email = url.searchParams.get('email') || 'matthewreyesvanegas46@gmail.com';
        
        // Configurar SendGrid directamente
        const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
        const FROM_EMAIL = process.env.FROM_EMAIL || 'matthewreyesvanegas46@gmail.com';
        
        console.log('🔧 Direct SendGrid Test');
        console.log('API Key exists:', !!SENDGRID_API_KEY);
        console.log('API Key prefix:', SENDGRID_API_KEY ? SENDGRID_API_KEY.substring(0, 15) + '...' : 'NOT SET');
        console.log('From Email:', FROM_EMAIL);
        
        if (!SENDGRID_API_KEY) {
            return json({
                success: false,
                error: 'SENDGRID_API_KEY not configured',
                timestamp: new Date().toISOString()
            });
        }

        // sgMail.setApiKey(SENDGRID_API_KEY);
        
        const msg = {
            to: email,
            from: FROM_EMAIL,
            subject: '🧪 Test directo de SendGrid desde Domify',
            text: 'Este es un email de prueba enviado directamente desde SendGrid.',
            html: `
                <h2>🧪 Test directo de SendGrid</h2>
                <p>Este email fue enviado directamente desde SendGrid para verificar la configuración.</p>
                <p><strong>Hora:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>API Key:</strong> ${SENDGRID_API_KEY.substring(0, 15)}...</p>
                <p><strong>From:</strong> ${FROM_EMAIL}</p>
                <p><strong>To:</strong> ${email}</p>
                <hr>
                <p><small>Si recibes este email, la configuración de SendGrid está funcionando correctamente.</small></p>
            `,
        };

        console.log('📧 Sending direct email via SendGrid...');
        console.log('Message:', JSON.stringify(msg, null, 2));
        
        // const result = await sgMail.send(msg);
        
        // console.log('✅ SendGrid response:', result[0].statusCode);
        // console.log('Response headers:', result[0].headers);
        
        return json({
            success: true,
            message: '✅ Email enviado directamente con SendGrid (simulado)',
            sendgrid_response: {
                statusCode: 200,
                messageId: 'simulated-message-id',
            },
            test_details: {
                to: email,
                from: FROM_EMAIL,
                api_key_prefix: SENDGRID_API_KEY.substring(0, 15) + '...',
                timestamp: new Date().toISOString()
            }
        });

    } catch (error: any) {
        console.error('❌ SendGrid direct test error:', error);
        
        let errorDetails = {
            message: error.message,
            code: error.code,
            statusCode: error.response?.status,
            body: error.response?.body
        };
        
        return json({
            success: false,
            error: 'SendGrid error',
            details: errorDetails,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}; 