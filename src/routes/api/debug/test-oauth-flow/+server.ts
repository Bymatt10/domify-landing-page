import { json } from "@sveltejs/kit"; export const GET = async ({ url, locals: { supabase } }) => { return json({ success: true, message: "OAuth flow test endpoint created" }); };
