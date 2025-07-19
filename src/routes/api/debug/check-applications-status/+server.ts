import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from '$lib/env-utils';

// Get environment variables with fallbacks
const SUPABASE_URL = getSupabaseUrl();
const SUPABASE_ANON_KEY = getSupabaseAnonKey();
const SERVICE_ROLE_KEY = getSupabaseServiceRoleKey();

// Función helper para hacer queries directas con fetch
async function directSupabaseQuery(endpoint: string, options: any = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Supabase query failed:', response.status, response.statusText, errorText);
    throw new Error(`Supabase query failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const GET: RequestHandler = async () => {
    try {
        console.log('🔍 Checking all provider applications status...');

        // 1. Obtener todas las aplicaciones de proveedores
        const applications = await directSupabaseQuery('provider_applications?select=*&order=created_at.desc');
        console.log(`📋 Found ${applications.length} provider applications`);

        // 2. Obtener todos los proveedores
        const providers = await directSupabaseQuery('provider_profiles?select=*');
        console.log(`👥 Found ${providers.length} provider profiles`);

        // 3. Obtener todos los usuarios
        const customers = await directSupabaseQuery('customers?select=*');
        console.log(`🧑‍💼 Found ${customers.length} customers`);

        // 4. Para cada aplicación, verificar su estado completo
        const detailedApplications = await Promise.all(
            applications.map(async (app: any) => {
                // Buscar si existe un proveedor con este email
                const matchingProvider = providers.find((p: any) => 
                    p.user_id && customers.find((c: any) => c.user_id === p.user_id)
                );

                // Buscar customer con este email
                const matchingCustomer = customers.find((c: any) => c.user_id);

                // Obtener el email real desde auth si tenemos user_id
                let authEmail = 'No disponible';
                if (matchingCustomer?.user_id) {
                    try {
                        const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${matchingCustomer.user_id}`, {
                            headers: {
                                'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
                                'apikey': SERVICE_ROLE_KEY,
                                'Content-Type': 'application/json'
                            }
                        });

                        if (authResponse.ok) {
                            const authUser = await authResponse.json();
                            authEmail = authUser.email || 'No disponible';
                        }
                    } catch (error) {
                        console.warn('Error fetching auth email for application:', app.id);
                    }
                }

                return {
                    ...app,
                    hasProvider: !!matchingProvider,
                    hasCustomer: !!matchingCustomer,
                    authEmail,
                    matchingProvider,
                    matchingCustomer
                };
            })
        );

        // 5. Clasificar aplicaciones por estado
        const pendingApps = detailedApplications.filter(app => app.status === 'pending');
        const approvedApps = detailedApplications.filter(app => app.status === 'approved');
        const rejectedApps = detailedApplications.filter(app => app.status === 'rejected');

        // 6. Aplicaciones aprobadas pero sin proveedor creado
        const approvedWithoutProvider = approvedApps.filter(app => !app.hasProvider);

        return json({
            success: true,
            summary: {
                totalApplications: applications.length,
                totalProviders: providers.length,
                totalCustomers: customers.length,
                pendingApplications: pendingApps.length,
                approvedApplications: approvedApps.length,
                rejectedApplications: rejectedApps.length,
                approvedWithoutProvider: approvedWithoutProvider.length
            },
            applications: detailedApplications,
            issues: {
                approvedWithoutProvider: approvedWithoutProvider.map(app => ({
                    id: app.id,
                    email: app.email,
                    name: `${app.first_name} ${app.last_name}`,
                    status: app.status,
                    approved_at: app.approved_at,
                    created_at: app.created_at
                }))
            }
        });

    } catch (error) {
        console.error('❌ Error checking applications status:', error);
        return json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}; 