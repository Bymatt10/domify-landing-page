import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
    try {
        const sendgridKey = process.env.SENDGRID_API_KEY;
        const fromEmail = process.env.FROM_EMAIL;
        
        return json({
            sendgrid_configured: !!sendgridKey,
            sendgrid_key_prefix: sendgridKey ? sendgridKey.substring(0, 10) + '...' : 'NOT SET',
            from_email: fromEmail || 'NOT SET',
            node_env: process.env.NODE_ENV,
            all_env_keys: Object.keys(process.env).filter(key => 
                key.includes('SENDGRID') || key.includes('FROM_EMAIL')
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