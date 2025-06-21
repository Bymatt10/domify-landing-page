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

export {};
