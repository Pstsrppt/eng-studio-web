export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

/** False until .env.local is filled in. The app still works, it just can't save progress. */
export const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_KEY);

/** Set NEXT_PUBLIC_AUTH_GOOGLE=true after turning on Google in Supabase > Authentication > Sign In / Providers. */
export const hasGoogle = hasSupabase && process.env.NEXT_PUBLIC_AUTH_GOOGLE === "true";
