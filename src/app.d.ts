/// <reference types="@sveltejs/kit" />

import { SupabaseClient, Session, User } from '@supabase/supabase-js'

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			supabase: SupabaseClient<any, 'public'>
			supabaseAdmin: SupabaseClient<any, 'public'>
			safeGetSession(): Promise<{ session: Session | null; user: User | null }>
			getSession(): Promise<Session | null>
			getUser(): Promise<User | null>
		}
		interface PageData {
			session: Session | null
			user: User | null
		}
		// interface PageState {}
		// interface Platform {}
	}
}

// Definir las variables de entorno públicas
declare module '$env/static/public' {
	export const PUBLIC_SUPABASE_URL: string;
	export const PUBLIC_SUPABASE_ANON_KEY: string;
	export const PUBLIC_SITE_URL: string;
}

// Definir las variables de entorno privadas
declare module '$env/static/private' {
	export const SMTP_HOST: string | undefined;
	export const SMTP_PORT: string | undefined;
	export const SMTP_USER: string | undefined;
	export const SMTP_PASS: string | undefined;
	export const FROM_EMAIL: string | undefined;
	export const SUPABASE_URL: string | undefined;
	export const SUPABASE_ANON_KEY: string | undefined;
	export const SUPABASE_SERVICE_ROLE_KEY: string | undefined;
	export const MAILER_SMTP_HOST: string | undefined;
	export const MAILER_SMTP_PORT: string | undefined;
	export const MAILER_SMTP_USER: string | undefined;
	export const MAILER_SMTP_PASS: string | undefined;
}

export {};
