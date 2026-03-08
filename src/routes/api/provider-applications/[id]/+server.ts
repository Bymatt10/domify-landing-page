import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSupabaseUrl } from '$lib/env-utils';

const SUPABASE_URL = getSupabaseUrl();
const isMockMode = !SUPABASE_URL || SUPABASE_URL.includes('placeholder') || SUPABASE_URL.includes('fallback');

export const GET: RequestHandler = async ({ params }) => {
  const { id } = params;
  if (isMockMode) {
    return json({
      data: {
        id,
        status: 'submitted',
        headline: 'Mock App',
        bio: 'Mock Bio',
        created_at: new Date().toISOString(),
        categories: [{ id: 1, name: 'Fontaneros' }]
      }
    });
  }
  return json({ error: 'Not implemented' }, { status: 501 });
};

export const PUT: RequestHandler = async ({ params, request }) => {
  const { id } = params;
  const body = await request.json();

  if (isMockMode) {
    console.log(`MOCK: Application ${id} updated to ${body.status}`);
    return json({
      data: { id, ...body },
      message: 'Application updated (Mock)'
    });
  }
  return json({ error: 'Not implemented' }, { status: 501 });
};

export const DELETE: RequestHandler = async ({ params }) => {
  const { id } = params;
  if (isMockMode) {
    return json({ message: 'Application rejected (Mock)' });
  }
  return json({ error: 'Not implemented' }, { status: 501 });
};