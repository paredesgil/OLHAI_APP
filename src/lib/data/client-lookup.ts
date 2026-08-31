"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfiguredClient } from "@/lib/supabase/config";
import { MOCK_CATEGORIES, MOCK_CITIES } from "@/lib/data/mock";

// Busca categorias e cidades REAIS do Supabase para uso em formulários
// no cliente (cadastro, publicar anúncio). Sem isso, esses formulários
// ficavam presos na lista de demonstração (IDs falsos como "c1", "1"),
// que não existem no banco real e quebram o INSERT (foreign key /
// formato de UUID inválido).
export function useLookups() {
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [cities, setCities] = useState(MOCK_CITIES);
  const [loading, setLoading] = useState(isSupabaseConfiguredClient());

  useEffect(() => {
    if (!isSupabaseConfiguredClient()) return;

    let ativo = true;
    const supabase = createClient();

    Promise.all([
      supabase
        .from("categories")
        .select("id, name, slug, icon, sort_order, active")
        .eq("active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("cities")
        .select("id, name, state_id")
        .eq("active", true)
        .order("name", { ascending: true }),
    ]).then(([categoriesRes, citiesRes]) => {
      if (!ativo) return;
      if (categoriesRes.data && categoriesRes.data.length > 0) {
        setCategories(categoriesRes.data as any);
      }
      if (citiesRes.data && citiesRes.data.length > 0) {
        setCities(citiesRes.data as any);
      }
      setLoading(false);
    });

    return () => {
      ativo = false;
    };
  }, []);

  return { categories, cities, loading };
}

// Garante que exista uma linha em `profiles` para o usuário logado.
// Necessário porque, quando a confirmação de e-mail está ativada no
// Supabase, o signUp() não tem sessão para inserir o profile na hora —
// só os metadados do usuário (display_name/whatsapp/city_id/seller_type)
// ficam salvos em auth.users. Esta função completa o cadastro no
// primeiro login, lendo esses metadados de volta.
export async function ensureProfileExists() {
  if (!isSupabaseConfiguredClient()) return;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return;

  const meta = user.user_metadata ?? {};
  if (!meta.city_id) return; // sem dados suficientes para criar o perfil

  await supabase.from("profiles").insert({
    id: user.id,
    display_name: meta.display_name ?? "Vendedor",
    whatsapp: meta.whatsapp ?? "",
    city_id: meta.city_id,
    seller_type: meta.seller_type ?? "particular",
  });
}
