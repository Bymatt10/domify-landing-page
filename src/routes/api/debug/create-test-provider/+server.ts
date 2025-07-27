import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ locals }) => {
  try {
    const testEmail = 'proveedor@test.com';
    const testPassword = 'Test123456!';
    
    console.log('🧪 Creando proveedor de prueba...');

    // Verificar si ya existe el usuario
    const { data: existingUsers, error: listError } = await locals.supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listando usuarios:', listError);
      return json({ error: 'Failed to check users', details: listError.message }, { status: 500 });
    }

    let testUser = existingUsers.users.find(u => u.email === testEmail);

    // Si no existe, crear el usuario
    if (!testUser) {
      console.log('👤 Creando usuario de prueba...');
      
      const { data: newUser, error: createError } = await locals.supabaseAdmin.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
        user_metadata: {
          role: 'provider',
          has_provider_role: true,
          has_customer_role: true,
          first_name: 'Juan',
          last_name: 'Pérez',
          test_user: true
        }
      });

      if (createError) {
        console.error('Error creando usuario:', createError);
        return json({ error: 'Failed to create user', details: createError.message }, { status: 500 });
      }

      testUser = newUser.user;
      console.log('✅ Usuario de prueba creado:', testUser.id);
    } else {
      console.log('👤 Usuario de prueba ya existe:', testUser.id);
    }

    // Verificar si ya existe el customer profile
    const { data: existingCustomer } = await locals.supabaseAdmin
      .from('customers')
      .select('*')
      .eq('user_id', testUser.id)
      .single();

    if (!existingCustomer) {
      console.log('👥 Creando customer profile...');
      
      const { data: customerData, error: customerError } = await locals.supabaseAdmin
        .from('customers')
        .insert({
          user_id: testUser.id,
          first_name: 'Juan',
          last_name: 'Pérez',
          phone_number: '+505 8888-8888',
          role: 'provider'
        })
        .select()
        .single();

      if (customerError) {
        console.error('Error creando customer:', customerError);
        return json({ error: 'Failed to create customer', details: customerError.message }, { status: 500 });
      }

      console.log('✅ Customer profile creado:', customerData.id);
    }

    // Verificar si ya existe el provider profile
    const { data: existingProvider } = await locals.supabaseAdmin
      .from('provider_profiles')
      .select('*')
      .eq('user_id', testUser.id)
      .single();

    if (!existingProvider) {
      console.log('🏢 Creando provider profile...');
      
      const { data: providerData, error: providerError } = await locals.supabaseAdmin
        .from('provider_profiles')
        .insert({
          user_id: testUser.id,
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

      if (providerError) {
        console.error('Error creando provider:', providerError);
        return json({ error: 'Failed to create provider', details: providerError.message }, { status: 500 });
      }

      console.log('✅ Provider profile creado:', providerData.id);

      // Agregar algunas categorías de prueba
      const { data: categories } = await locals.supabaseAdmin
        .from('categories')
        .select('id, name')
        .in('name', ['Ensamblaje', 'Reparaciones Menores', 'Mantenimiento'])
        .limit(3);

      if (categories && categories.length > 0) {
        console.log('🏷️ Agregando categorías...');
        
        const categoryLinks = categories.map(cat => ({
          provider_profile_id: providerData.id,
          category_id: cat.id
        }));

        await locals.supabaseAdmin
          .from('provider_categories')
          .insert(categoryLinks);

        console.log('✅ Categorías agregadas');
      }

      // Crear algunos servicios de ejemplo
      if (categories && categories.length > 0) {
        console.log('🛠️ Creando servicios de ejemplo...');
        
        const sampleServices = [
          {
            provider_profile_id: providerData.id,
            category_id: categories[0].id,
            title: 'Ensamblaje de Muebles',
            description: 'Ensamblaje profesional de todo tipo de muebles: camas, closets, mesas, sillas, etc.',
            price: 300.00,
            is_active: true
          },
          {
            provider_profile_id: providerData.id,
            category_id: categories[1]?.id || categories[0].id,
            title: 'Reparaciones Menores del Hogar',
            description: 'Reparación de puertas, ventanas, cajones, bisagras y otros elementos del hogar.',
            price: 250.00,
            is_active: true
          }
        ];

        const { error: servicesError } = await locals.supabaseAdmin
          .from('services')
          .insert(sampleServices);

        if (!servicesError) {
          console.log('✅ Servicios creados');
        }
      }
    } else {
      console.log('🏢 Provider profile ya existe:', existingProvider.id);
    }

    return json({
      success: true,
      message: 'Proveedor de prueba creado/verificado exitosamente',
      credentials: {
        email: testEmail,
        password: testPassword
      },
      instructions: [
        '1. Ve a http://localhost:5173/auth/login',
        '2. Usa las credenciales mostradas arriba',
        '3. Después del login, ve a http://localhost:5173/provider/portfolio',
        '4. Deberías poder ver y gestionar el portfolio'
      ],
      user_id: testUser.id
    });

  } catch (error: any) {
    console.error('Error creando proveedor de prueba:', error);
    return json({
      error: 'Failed to create test provider',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}; 