import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
    try {
        const smtpHost = import.meta.env.SMTP_HOST;
        const smtpPort = import.meta.env.SMTP_PORT;
        const smtpUser = import.meta.env.SMTP_USER;
        const smtpPass = import.meta.env.SMTP_PASS;
        const fromEmail = import.meta.env.FROM_EMAIL;
        
        return json({
            smtp_configured: !!(smtpHost && smtpPort && smtpUser && smtpPass),
            smtp_host: smtpHost || 'NOT SET',
            smtp_port: smtpPort || 'NOT SET',
            smtp_user: smtpUser ? smtpUser.substring(0, 10) + '...' : 'NOT SET',
            smtp_pass_configured: !!smtpPass,
            from_email: fromEmail || 'NOT SET',
            node_env: import.meta.env.NODE_ENV,
            all_env_keys: Object.keys(import.meta.env).filter(key => 
                key.includes('SMTP') || key.includes('FROM_EMAIL')
            ),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return json({
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}; 