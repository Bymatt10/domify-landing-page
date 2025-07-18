import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	return json({
		message: 'Para arreglar la tabla reviews, ejecuta estos comandos SQL en tu base de datos:',
		instructions: [
			'ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_booking_id_key;',
			'ALTER TABLE reviews ALTER COLUMN booking_id DROP NOT NULL;',
			'CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_user_id ON reviews(reviewer_user_id);',
			'CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);'
		],
		note: 'Esto permitirá crear reseñas sin necesidad de una reserva previa.'
	});
}; 