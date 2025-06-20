import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ locals }) => {
    try {
        // Usar el UUID del admin proporcionado
        const userId = '89e053bf-5ab4-44ab-aa57-e5ccd2729a87';

        // Datos de prueba para aplicaciones de proveedores
        const testApplications = [
            {
                user_id: userId,
                headline: 'Plomero Profesional con 10 años de experiencia',
                bio: 'Soy un plomero certificado con más de 10 años de experiencia en instalaciones residenciales y comerciales. Especializado en reparaciones de emergencia y mantenimiento preventivo.',
                hourly_rate: 25.00,
                location: 'Madrid, España',
                phone: '+34 600 123 456',
                experience_years: 10,
                certifications: ['Certificación de Plomería', 'Seguridad Industrial'],
                categories: [1, 2],
                availability: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true },
                status: 'pending'
            },
            {
                user_id: userId,
                headline: 'Electricista Residencial y Comercial',
                bio: 'Electricista profesional con amplia experiencia en instalaciones eléctricas, mantenimiento y reparaciones. Trabajo tanto en proyectos residenciales como comerciales.',
                hourly_rate: 30.00,
                location: 'Barcelona, España',
                phone: '+34 600 234 567',
                experience_years: 8,
                certifications: ['Certificación Eléctrica', 'Normativa de Seguridad'],
                categories: [1, 3],
                availability: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: true },
                status: 'under_review'
            },
            {
                user_id: userId,
                headline: 'Servicio de Limpieza Profesional',
                bio: 'Empresa de limpieza profesional con más de 5 años en el mercado. Ofrecemos servicios de limpieza residencial, comercial y post-construcción.',
                hourly_rate: 15.00,
                location: 'Valencia, España',
                phone: '+34 600 345 678',
                experience_years: 5,
                certifications: ['Certificación de Limpieza', 'Manejo de Productos Químicos'],
                categories: [4],
                availability: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: true, sunday: true },
                status: 'approved'
            },
            {
                user_id: userId,
                headline: 'Jardinero y Paisajista',
                bio: 'Jardinero profesional especializado en diseño de paisajes, mantenimiento de jardines y sistemas de riego. Creo espacios verdes hermosos y sostenibles.',
                hourly_rate: 20.00,
                location: 'Sevilla, España',
                phone: '+34 600 456 789',
                experience_years: 6,
                certifications: ['Horticultura', 'Diseño de Paisajes'],
                categories: [5],
                availability: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: true },
                status: 'rejected',
                rejection_reason: 'Documentación incompleta. Por favor, proporcione certificaciones adicionales.'
            },
            {
                user_id: userId,
                headline: 'Servicio de Mudanzas y Transporte',
                bio: 'Empresa de mudanzas con flota propia y personal capacitado. Ofrecemos servicios de embalaje, transporte y desembalaje con la máxima seguridad.',
                hourly_rate: 35.00,
                location: 'Málaga, España',
                phone: '+34 600 567 890',
                experience_years: 12,
                certifications: ['Transporte de Mercancías', 'Manejo de Cargas'],
                categories: [6],
                availability: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: true },
                status: 'pending'
            }
        ];

        // Insertar las aplicaciones de prueba usando el cliente autenticado de la sesión
        const { data, error } = await locals.supabase
            .from('provider_applications')
            .insert(testApplications)
            .select();

        if (error) {
            return json({
                error: {
                    message: 'Error al insertar datos de prueba',
                    details: error.message,
                    code: 'INSERT_ERROR',
                    statusCode: 500,
                    timestamp: new Date().toISOString()
                }
            }, { status: 500 });
        }

        return json({
            data: {
                message: 'Datos de prueba insertados correctamente',
                applications_created: data?.length || 0,
                applications: data
            },
            message: 'Seed completado exitosamente',
            statusCode: 200,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        return json({
            error: {
                message: 'Error al crear datos de prueba',
                details: error instanceof Error ? error.message : 'Unknown error',
                code: 'SEED_ERROR',
                statusCode: 500,
                timestamp: new Date().toISOString()
            }
        }, { status: 500 });
    }
}; 