import { google } from 'googleapis';
import { getGoogleSheetsCredentials } from '$lib/env-utils';

interface ProviderApplication {
	id: string;
	headline: string;
	bio: string;
	hourly_rate: number;
	location: string;
	phone: string;
	email: string;
	application_data: {
		first_name: string;
		last_name: string;
		department: string;
		address: string;
		provider_type: string;
		experience_years: number;
		availability: any;
	};
	status: string;
	created_at: string;
	categories?: string[];
}

export class GoogleSheetsService {
	private static instance: GoogleSheetsService;
	private auth: any;
	private sheets: any;

	private constructor() {
		this.initializeAuth();
	}

	public static getInstance(): GoogleSheetsService {
		if (!GoogleSheetsService.instance) {
			GoogleSheetsService.instance = new GoogleSheetsService();
		}
		return GoogleSheetsService.instance;
	}

	private async initializeAuth() {
		try {
			const credentials = getGoogleSheetsCredentials();
			
			if (!credentials) {
				console.warn('⚠️ Google Sheets credentials not found. Integration disabled.');
				return;
			}

			this.auth = new google.auth.GoogleAuth({
				credentials: JSON.parse(credentials),
				scopes: ['https://www.googleapis.com/auth/spreadsheets']
			});

			this.sheets = google.sheets({ version: 'v4', auth: this.auth });
			console.log('✅ Google Sheets service initialized');
		} catch (error) {
			console.error('❌ Error initializing Google Sheets:', error);
		}
	}

	public async addProviderApplication(application: ProviderApplication, categories: string[] = []): Promise<boolean> {
		try {
			if (!this.sheets) {
				console.warn('⚠️ Google Sheets not initialized. Skipping sheet update.');
				return false;
			}

			const spreadsheetId = '1f8-trfDtnOchxvKid3L1r4hoV2IX5R1SXfnwp_QF7rI';
			const range = 'A:Z'; // Ajustar según las columnas de tu sheet

			// Preparar los datos para la fila
			const rowData = [
				new Date().toISOString(), // Timestamp
				application.id, // ID de la aplicación
				application.application_data.first_name, // Nombre
				application.application_data.last_name, // Apellido
				application.email, // Email
				application.phone, // Teléfono
				application.application_data.department, // Departamento
				application.application_data.address, // Dirección
				application.application_data.provider_type, // Tipo de proveedor
				application.headline, // Título
				application.bio, // Descripción
				application.hourly_rate.toString(), // Precio por hora
				application.application_data.experience_years.toString(), // Años de experiencia
				JSON.stringify(application.application_data.availability), // Disponibilidad
				categories.join(', '), // Categorías
				application.status, // Estado
				application.created_at, // Fecha de creación
				'Pendiente de revisión' // Estado de revisión
			];

			// Agregar la fila al final del sheet
			const response = await this.sheets.spreadsheets.values.append({
				spreadsheetId,
				range,
				valueInputOption: 'RAW',
				insertDataOption: 'INSERT_ROWS',
				requestBody: {
					values: [rowData]
				}
			});

			console.log('✅ Provider application added to Google Sheets:', application.id);
			return true;

		} catch (error) {
			console.error('❌ Error adding to Google Sheets:', error);
			return false;
		}
	}

	public async updateApplicationStatus(applicationId: string, status: string, adminNotes?: string): Promise<boolean> {
		try {
			if (!this.sheets) {
				console.warn('⚠️ Google Sheets not initialized. Skipping status update.');
				return false;
			}

			const spreadsheetId = '1f8-trfDtnOchxvKid3L1r4hoV2IX5R1SXfnwp_QF7rI';
			
			// Buscar la fila por ID de aplicación
			const searchResponse = await this.sheets.spreadsheets.values.get({
				spreadsheetId,
				range: 'A:Z'
			});

			const rows = searchResponse.data.values;
			if (!rows) return false;

			// Buscar la fila que contiene el ID de la aplicación
			let rowIndex = -1;
			for (let i = 0; i < rows.length; i++) {
				if (rows[i][1] === applicationId) { // Columna B contiene el ID
					rowIndex = i + 1; // +1 porque las filas empiezan en 1
					break;
				}
			}

			if (rowIndex === -1) {
				console.warn('⚠️ Application not found in sheet:', applicationId);
				return false;
			}

			// Actualizar el estado y notas
			const updateRange = `O${rowIndex}:P${rowIndex}`; // Columnas O y P para estado y notas
			const updateData = [
				[status, adminNotes || '']
			];

			await this.sheets.spreadsheets.values.update({
				spreadsheetId,
				range: updateRange,
				valueInputOption: 'RAW',
				requestBody: {
					values: updateData
				}
			});

			console.log('✅ Application status updated in Google Sheets:', applicationId, status);
			return true;

		} catch (error) {
			console.error('❌ Error updating status in Google Sheets:', error);
			return false;
		}
	}

	public async getApplicationsFromSheet(): Promise<any[]> {
		try {
			if (!this.sheets) {
				console.warn('⚠️ Google Sheets not initialized.');
				return [];
			}

			const spreadsheetId = '1f8-trfDtnOchxvKid3L1r4hoV2IX5R1SXfnwp_QF7rI';
			const range = 'A:P'; // Ajustar según las columnas de tu sheet

			const response = await this.sheets.spreadsheets.values.get({
				spreadsheetId,
				range
			});

			const rows = response.data.values;
			if (!rows || rows.length <= 1) return []; // Sin datos o solo encabezados

			// Convertir filas a objetos (saltando la primera fila que son encabezados)
			const applications = rows.slice(1).map((row: any[]) => ({
				timestamp: row[0] || '',
				applicationId: row[1] || '',
				firstName: row[2] || '',
				lastName: row[3] || '',
				email: row[4] || '',
				phone: row[5] || '',
				department: row[6] || '',
				address: row[7] || '',
				providerType: row[8] || '',
				headline: row[9] || '',
				bio: row[10] || '',
				hourlyRate: row[11] || '',
				experienceYears: row[12] || '',
				availability: row[13] || '',
				categories: row[14] || '',
				status: row[15] || '',
				createdAt: row[16] || '',
				reviewStatus: row[17] || ''
			}));

			return applications;

		} catch (error) {
			console.error('❌ Error getting applications from Google Sheets:', error);
			return [];
		}
	}
}

// Exportar una instancia singleton
export const googleSheetsService = GoogleSheetsService.getInstance(); 