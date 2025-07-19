import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sendEmail, createProviderWelcomeEmail } from '$lib/email-service';


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

function generateRandomPassword(length: number = 12): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
}

export const GET: RequestHandler = async ({ url }) => {
    try {
        const applicationId = url.searchParams.get('application_id') || '4'; // Default to the new application
        
        console.log(`🔄 Processing application ID: ${applicationId}`);

        // 1. Obtener la aplicación específica
        const applications = await directSupabaseQuery(`provider_applications?id=eq.${applicationId}`);
        
        if (!applications || applications.length === 0) {
            return json({
                success: false,
                error: `Application with ID ${applicationId} not found`
            }, { status: 404 });
        }

        const application = applications[0];
        console.log('📋 Processing application:', application);

        // Verificar si ya existe un usuario con este email
        let existingUser = null;
        try {
            const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
                    'apikey': SERVICE_ROLE_KEY,
                    'Content-Type': 'application/json'
                }
            });

            if (authResponse.ok) {
                const authData = await authResponse.json();
                existingUser = authData.users?.find((user: any) => user.email === application.email);
            }
        } catch (error) {
            console.warn('Error checking existing users:', error);
        }

        let userId = existingUser?.id;
        let tempPassword = '';

        // 2. Crear usuario si no existe
        if (!existingUser) {
            console.log('👤 Creating new user...');
            tempPassword = generateRandomPassword();

            const createUserResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
                    'apikey': SERVICE_ROLE_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: application.email,
                    password: tempPassword,
                    email_confirm: true,
                    user_metadata: {
                        role: 'provider'
                    }
                })
            });

            if (!createUserResponse.ok) {
                const errorText = await createUserResponse.text();
                throw new Error(`Failed to create user: ${errorText}`);
            }

            const newUser = await createUserResponse.json();
            userId = newUser.id;
            console.log('✅ User created with ID:', userId);
        } else {
            console.log('👤 User already exists:', existingUser.email);
            tempPassword = 'Usuario ya existente - usar recuperación de contraseña';
        }

        // 3. Crear customer profile
        console.log('👥 Creating customer profile...');
        const customerData = {
            user_id: userId,
            first_name: application.headline.split(' ')[0] || 'Proveedor',
            last_name: application.headline.split(' ').slice(1).join(' ') || 'Domify',
            role: 'provider'
        };

        const customers = await directSupabaseQuery('customers', {
            method: 'POST',
            body: JSON.stringify(customerData)
        });

        console.log('✅ Customer profile created');

        // 4. Crear provider profile
        console.log('🏢 Creating provider profile...');
        const providerData = {
            user_id: userId,
            provider_type: 'individual',
            business_name: application.headline,
            headline: application.headline,
            bio: application.bio,
            hourly_rate: application.hourly_rate,
            phone: application.phone,
            location: application.location,
            is_active: true,
            is_verified: false,
            average_rating: 0,
            total_reviews: 0
        };

        const providers = await directSupabaseQuery('provider_profiles', {
            method: 'POST',
            body: JSON.stringify(providerData)
        });

        const newProvider = providers[0];
        console.log('✅ Provider profile created:', newProvider.id);

        // 5. Asignar categorías por defecto (Ensamblaje y Montaje)
        console.log('🏷️ Assigning default categories...');
        const defaultCategories = [1, 2]; // Ensamblaje y Montaje

        for (const categoryId of defaultCategories) {
            try {
                await directSupabaseQuery('provider_categories', {
                    method: 'POST',
                    body: JSON.stringify({
                        provider_profile_id: newProvider.id,
                        category_id: categoryId
                    })
                });
                console.log(`✅ Assigned category ${categoryId} to provider`);
            } catch (error) {
                console.warn(`Warning: Could not assign category ${categoryId}:`, error);
            }
        }

        // 6. Actualizar la aplicación con el user_id
        console.log('📝 Updating application with user_id...');
        await directSupabaseQuery(`provider_applications?id=eq.${applicationId}`, {
            method: 'PATCH',
            body: JSON.stringify({
                user_id: userId,
                reviewed_at: new Date().toISOString()
            })
        });

        // 7. Enviar email de bienvenida
        console.log('📧 Sending welcome email...');
        const emailHtml = createProviderWelcomeEmail({
            name: application.headline,
            email: application.email,
            tempPassword: tempPassword,
            loginUrl: `${url.origin}/auth/login`
        });

        const emailSent = await sendEmail({
            to: application.email,
            subject: '🎉 ¡Bienvenido a Domify! Tu aplicación ha sido aprobada',
            html: emailHtml
        });

        return json({
            success: true,
            message: 'Application processed successfully',
            details: {
                applicationId: application.id,
                email: application.email,
                userId: userId,
                providerId: newProvider.id,
                tempPassword: existingUser ? 'Usuario existente' : tempPassword,
                emailSent: emailSent,
                categoriesAssigned: defaultCategories
            }
        });

    } catch (error) {
        console.error('❌ Error processing application:', error);
        return json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}; 