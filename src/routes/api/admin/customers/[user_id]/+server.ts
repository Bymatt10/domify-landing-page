import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { PRIVATE_SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

async function directSupabaseQuery(endpoint: string, method = 'GET', body?: any) {
	const url = `${PUBLIC_SUPABASE_URL}/rest/v1/${endpoint}`;
	const options: RequestInit = {
		method,
		headers: {
			'Authorization': `Bearer ${PRIVATE_SUPABASE_SERVICE_ROLE_KEY}`,
			'apikey': PRIVATE_SUPABASE_SERVICE_ROLE_KEY,
			'Content-Type': 'application/json',
			'Prefer': 'return=representation'
		}
	};

	if (body && method !== 'GET') {
		options.body = JSON.stringify(body);
	}

	const response = await fetch(url, options);
	
	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Supabase query failed: ${response.status} ${errorText}`);
	}

	return response.json();
}

// Función para actualizar el estado del usuario en Supabase Auth
async function updateUserAuthStatus(userId: string, isActive: boolean) {
	try {
		const authUrl = `${PUBLIC_SUPABASE_URL}/auth/v1/admin/users/${userId}`;
		const response = await fetch(authUrl, {
			method: 'PUT',
			headers: {
				'Authorization': `Bearer ${PRIVATE_SUPABASE_SERVICE_ROLE_KEY}`,
				'apikey': PRIVATE_SUPABASE_SERVICE_ROLE_KEY,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				ban_duration: isActive ? 'none' : '876000h', // ~100 años para desactivar
				user_metadata: {
					is_active: isActive,
					deactivated_at: isActive ? null : new Date().toISOString()
				}
			})
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('Error updating auth user:', errorText);
			return false;
		}

		return true;
	} catch (error) {
		console.error('Error in updateUserAuthStatus:', error);
		return false;
	}
}

export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const { user_id } = params;
		const updateData = await request.json();

		console.log('🔄 Updating customer:', user_id, updateData);

		// Validar datos de entrada
		const allowedFields = ['first_name', 'last_name', 'phone_number', 'address'];
		const filteredData = Object.keys(updateData)
			.filter(key => allowedFields.includes(key))
			.reduce((obj: any, key) => {
				obj[key] = updateData[key];
				return obj;
			}, {});

		// Si se proporciona un email, actualizar también en auth.users
		if (updateData.email && updateData.email.trim() !== '') {
			try {
				const emailUpdateResponse = await fetch(`${PUBLIC_SUPABASE_URL}/auth/v1/admin/users/${user_id}`, {
					method: 'PUT',
					headers: {
						'apikey': PRIVATE_SUPABASE_SERVICE_ROLE_KEY,
						'Authorization': `Bearer ${PRIVATE_SUPABASE_SERVICE_ROLE_KEY}`,
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						email: updateData.email.trim()
					})
				});

				if (!emailUpdateResponse.ok) {
					const error = await emailUpdateResponse.text();
					console.error('Error updating user email:', error);
					return json({ error: 'Error al actualizar el email del usuario' }, { status: 500 });
				}
			} catch (error) {
				console.error('Error updating email:', error);
				return json({ error: 'Error al actualizar el email' }, { status: 500 });
			}
		}

		if (Object.keys(filteredData).length === 0 && !updateData.email) {
			return json({ error: 'No valid fields to update' }, { status: 400 });
		}

		// Agregar timestamp de actualización
		filteredData.updated_at = new Date().toISOString();

		// Actualizar el cliente en la base de datos (solo si hay campos para actualizar)
		let updatedCustomer;
		if (Object.keys(filteredData).length > 1) { // > 1 porque updated_at siempre está presente
			updatedCustomer = await directSupabaseQuery(
				`customers?user_id=eq.${user_id}`,
				'PATCH',
				filteredData
			);
		} else {
			// Si solo se actualizó el email, obtener los datos actuales del cliente
			updatedCustomer = await directSupabaseQuery(`customers?user_id=eq.${user_id}`);
		}

		if (!updatedCustomer || updatedCustomer.length === 0) {
			return json({ error: 'Customer not found or update failed' }, { status: 404 });
		}

		// Si se actualizó el email, incluirlo en la respuesta
		const result = updatedCustomer[0];
		if (updateData.email) {
			result.email = updateData.email.trim();
		}

		console.log('✅ Customer updated successfully:', result);

		return json(result);

	} catch (error) {
		console.error('❌ Error updating customer:', error);
		return json({
			error: 'Failed to update customer',
			details: error instanceof Error ? error.message : 'Unknown error'
		}, { status: 500 });
	}
};

export const PATCH: RequestHandler = async ({ params, request }) => {
	try {
		const { user_id } = params;
		const { action } = await request.json();

		console.log('🔄 User action:', action, 'for user:', user_id);

		if (action !== 'activate' && action !== 'deactivate') {
			return json({ error: 'Invalid action. Use "activate" or "deactivate"' }, { status: 400 });
		}

		const isActive = action === 'activate';
		const timestamp = new Date().toISOString();

		// Actualizar el estado en la tabla customers
		const customerUpdate = {
			is_active: isActive,
			updated_at: timestamp,
			...(isActive ? { reactivated_at: timestamp } : { deactivated_at: timestamp })
		};

		const updatedCustomer = await directSupabaseQuery(
			`customers?user_id=eq.${user_id}`,
			'PATCH',
			customerUpdate
		);

		if (!updatedCustomer || updatedCustomer.length === 0) {
			return json({ error: 'Customer not found' }, { status: 404 });
		}

		// Actualizar el estado en Supabase Auth
		const authUpdateSuccess = await updateUserAuthStatus(user_id, isActive);
		
		if (!authUpdateSuccess) {
			console.warn('⚠️ Failed to update auth status, but customer record updated');
		}

		console.log(`✅ User ${isActive ? 'activated' : 'deactivated'} successfully:`, updatedCustomer[0]);

		return json({
			success: true,
			message: `Usuario ${isActive ? 'activado' : 'desactivado'} exitosamente`,
			customer: updatedCustomer[0],
			authUpdated: authUpdateSuccess
		});

	} catch (error) {
		console.error('❌ Error updating user status:', error);
		return json({
			error: 'Failed to update user status',
			details: error instanceof Error ? error.message : 'Unknown error'
		}, { status: 500 });
	}
}; 