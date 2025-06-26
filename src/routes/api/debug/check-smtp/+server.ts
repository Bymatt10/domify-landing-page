import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL } from '$env/static/private';
import nodemailer from 'nodemailer';

export const GET: RequestHandler = async () => {
    try {
        console.log('🔍 SMTP Configuration Check:');
        console.log('SMTP_HOST:', SMTP_HOST);
        console.log('SMTP_PORT:', SMTP_PORT);
        console.log('SMTP_USER:', SMTP_USER);
        console.log('SMTP_PASS exists:', !!SMTP_PASS);
        console.log('SMTP_PASS prefix:', SMTP_PASS ? SMTP_PASS.substring(0, 10) + '...' : 'NOT SET');
        console.log('FROM_EMAIL:', FROM_EMAIL);
        
        // Crear transporter para testing
        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: parseInt(SMTP_PORT),
            secure: false,
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // Verificar conexión
        console.log('🔧 Testing SMTP connection...');
        const verified = await transporter.verify();
        console.log('✅ SMTP Connection verified:', verified);

        return json({
            smtp_configured: !!(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS),
            configuration: {
                host: SMTP_HOST,
                port: SMTP_PORT,
                user: SMTP_USER,
                pass_configured: !!SMTP_PASS,
                pass_prefix: SMTP_PASS ? SMTP_PASS.substring(0, 10) + '...' : 'NOT SET',
                from_email: FROM_EMAIL
            },
            connection_verified: verified,
            timestamp: new Date().toISOString()
        });
        
    } catch (error: any) {
        console.error('❌ SMTP Check Error:', error);
        return json({
            smtp_configured: false,
            error: error.message,
            configuration: {
                host: SMTP_HOST || 'NOT SET',
                port: SMTP_PORT || 'NOT SET',
                user: SMTP_USER || 'NOT SET',
                pass_configured: !!SMTP_PASS,
                from_email: FROM_EMAIL || 'NOT SET'
            },
            connection_verified: false,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}; 