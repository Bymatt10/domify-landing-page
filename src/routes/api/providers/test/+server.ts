import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ locals }) => {
  // Cambia el user_id por uno válido de tu base de datos
  const user_id = 'f91c145a-a177-486c-a6ce-b8b14303a9b3';
  const providerData = {
    user_id,
    headline: 'Ejemplo de Provider',
    bio: 'Este es un provider de prueba creado desde el endpoint test.',
    is_verified: false,
    is_active: true,
    average_rating: 0,
    total_reviews: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  const { data, error } = await locals.supabase
    .from('provider_profiles')
    .insert(providerData)
    .select()
    .single();
  if (error) {
    return json({ error: { message: error.message, statusCode: 400, timestamp: new Date().toISOString() } }, { status: 400 });
  }
  return json({ data, message: 'Provider de prueba creado', statusCode: 201, timestamp: new Date().toISOString() }, { status: 201 });
}; 