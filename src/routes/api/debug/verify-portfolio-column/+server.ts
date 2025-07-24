import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { getSupabaseUrl, getSupabaseAnonKey } from '$lib/env-utils';

export const GET: RequestHandler = async () => {
    try {
        const supabaseUrl = getSupabaseUrl();
        const supabaseAnonKey = getSupabaseAnonKey();

        console.log('🔍 Verificando columna portfolio...');

        // 1. Verificar esquema de la tabla
        const schemaResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/get_table_schema`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${supabaseAnonKey}`,
                'apikey': supabaseAnonKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                table_name: 'provider_profiles'
            })
        });

        let schemaInfo = null;
        if (schemaResponse.ok) {
            schemaInfo = await schemaResponse.json();
        }

        // 2. Intentar obtener un proveedor con portfolio
        const providerResponse = await fetch(`${supabaseUrl}/rest/v1/provider_profiles?select=id,business_name,portfolio&limit=1`, {
            headers: {
                'Authorization': `Bearer ${supabaseAnonKey}`,
                'apikey': supabaseAnonKey,
                'Content-Type': 'application/json'
            }
        });

        let providerData = null;
        let providerError = null;
        
        if (providerResponse.ok) {
            const providers = await providerResponse.json();
            if (providers && providers.length > 0) {
                providerData = providers[0];
            }
        } else {
            providerError = await providerResponse.text();
        }

        // 3. Intentar actualizar portfolio de un proveedor (simulación)
        let updateTest = null;
        if (providerData) {
            const testPortfolio = [
                {
                    id: 'test-1',
                    title: 'Trabajo de prueba',
                    description: 'Este es un trabajo de prueba para verificar la columna portfolio',
                    image_url: 'https://example.com/test.jpg',
                    media_type: 'image',
                    service_id: '',
                    category_id: '',
                    created_at: new Date().toISOString()
                }
            ];

            const updateResponse = await fetch(`${supabaseUrl}/rest/v1/provider_profiles?id=eq.${providerData.id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${supabaseAnonKey}`,
                    'apikey': supabaseAnonKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    portfolio: testPortfolio
                })
            });

            if (updateResponse.ok) {
                updateTest = {
                    success: true,
                    message: 'Portfolio actualizado correctamente'
                };
            } else {
                updateTest = {
                    success: false,
                    error: await updateResponse.text()
                };
            }
        }

        return json({
            success: true,
            data: {
                schema: schemaInfo,
                provider: providerData,
                providerError,
                updateTest,
                timestamp: new Date().toISOString()
            },
            message: 'Verificación de columna portfolio completada'
        });

    } catch (error) {
        console.error('❌ Error verificando columna portfolio:', error);
        return json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            message: 'Error verificando columna portfolio'
        }, { status: 500 });
    }
}; 