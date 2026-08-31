// Versão client-safe do check de configuração (não usa "next/headers",
// então pode ser importada em Client Components).
export function isSupabaseConfiguredClient() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
