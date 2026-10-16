// Supabase project for Ufora. Both values are public by design (they ship to
// every browser); row-level security in the database is what protects data.
// Environment variables override them, e.g. for a separate staging project.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://osoznekebutfxiftcirb.supabase.co";

export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "sb_publishable_IIpmcNvIWM3k8XhYm0d3sA_T8Csift4";
