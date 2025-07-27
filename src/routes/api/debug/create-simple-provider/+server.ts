import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ locals }) => {
  try {
    const userEmail = 'proveedor.test@gmail.com';
    const userId = '1d941611-065a-41b8-b2e5-0f6dc4dfd92b';
    
    console.log('🔧 Creando perfil de proveedor simple...');

    // Verificar si ya existe el perfil
    const { data: existingProfile } = await locals.supabase
      .from('provider_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingProfile) {
      console.log('✅ Perfil ya existe:', existingProfile.id);
      return json({
        success: true,
        message: 'Provider profile already exists',
        profile: existingProfile
      });
    }

    // Crear el perfil de proveedor
    const { data: profileData, error: profileError } = await locals.supabase
      .from('provider_profiles')
      .insert({
        user_id: userId,
        business_name: 'Juan Pérez Servicios',
        headline: 'Técnico en Ensamblaje y Reparaciones',
        bio: 'Especialista en ensamblaje de muebles, reparaciones menores y mantenimiento del hogar. Más de 5 años de experiencia brindando servicios de calidad.',
        hourly_rate: 350.00,
        location: 'Managua, Nicaragua',
        phone: '+505 8888-8888',
        provider_type: 'individual',
        is_active: true,
        is_verified: true,
        average_rating: 4.8,
        total_reviews: 12,
        portfolio: [
          {
            id: "1",
            title: "Ensamblaje de Sala Completa",
            description: "Ensamblé una sala completa de 7 piezas para familia en Managua. Cliente muy satisfecho con la calidad y rapidez del trabajo.",
            image_url: "/img/assembly.png",
            media_type: "image",
            service_id: "",
            category_id: "",
            created_at: new Date().toISOString()
          },
          {
            id: "2", 
            title: "Reparación de Closet",
            description: "Reparé las puertas y cajones de un closet que estaban dañados. Trabajo incluye ajuste de bisagras y cambio de rieles.",
            image_url: "/img/mounting.png",
            media_type: "image",
            service_id: "",
            category_id: "",
            created_at: new Date().toISOString()
          }
        ]
      })
      .select()
      .single();

    if (profileError) {
      console.error('Error creando perfil:', profileError);
      return json({ 
        error: 'Failed to create provider profile', 
        details: profileError.message 
      }, { status: 500 });
    }

    console.log('✅ Perfil creado exitosamente:', profileData.id);

    return json({
      success: true,
      message: 'Provider profile created successfully',
      profile: profileData,
      credentials: {
        email: userEmail,
        password: 'Test123456!'
      },
      instructions: [
        '1. Ve a http://localhost:5173/auth/login',
        '2. Usa las credenciales mostradas arriba',
        '3. Después del login, ve a http://localhost:5173/provider/portfolio',
        '4. Deberías poder ver y gestionar el portfolio'
      ]
    });

  } catch (error: any) {
    console.error('Error creando proveedor simple:', error);
    return json({
      error: 'Failed to create simple provider',
      details: error.message
    }, { status: 500 });
  }
}; 