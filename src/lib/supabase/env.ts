export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Supabase's newer "publishable" key, or the legacy anon key — both work.
export const SUPABASE_KEY = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!;
