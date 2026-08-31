import { createBrowserClient } from "@supabase/ssr";

// Cria o cliente Supabase usado nos componentes de cliente (browser).
// As variáveis vêm do .env.local (veja .env.local.example).
// Observação de tipos: o generic <Database> do supabase-js exige um shape
// interno (__InternalSupabase) sensível à versão exata do pacote instalado;
// para não travar o build a cada atualização, tipamos manualmente cada
// consulta em src/lib/data/*.ts (que é onde o schema realmente importa),
// em vez de propagar o generic aqui. src/lib/supabase/types.ts continua
// como referência do formato das tabelas.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
