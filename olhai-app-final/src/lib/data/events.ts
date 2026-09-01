"use client";

import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfiguredClient } from "@/lib/supabase/config";
import { getSessionId } from "@/lib/session";

// Registra eventos de comportamento (seção 23.4 / 23.11 do Documento
// Mestre) através das RPCs do banco (olhai_database_v1.sql seção 11),
// não por INSERT direto nas tabelas — assim a deduplicação (30 min para
// visualização, 15 min para contato) acontece no próprio banco, e o
// vendedor nunca fica exposto a um INSERT irrestrito vindo do cliente.
// Fail-silent: eventos nunca devem travar a experiência do usuário.

export async function registerProductView(productId: string) {
  if (!isSupabaseConfiguredClient()) return;
  try {
    const supabase = createClient();
    await supabase.rpc("register_product_view", {
      p_product_id: productId,
      p_session_id: getSessionId(),
    });
  } catch {
    // silencioso
  }
}

export async function registerWhatsappClick(productId: string) {
  if (!isSupabaseConfiguredClient()) return;
  try {
    const supabase = createClient();
    await supabase.rpc("register_contact_event", {
      p_product_id: productId,
      p_channel: "whatsapp",
      p_session_id: getSessionId(),
    });
  } catch {
    // silencioso
  }
}

export async function registerShareEvent(productId: string) {
  if (!isSupabaseConfiguredClient()) return;
  try {
    const supabase = createClient();
    await supabase.rpc("register_share_event", {
      p_product_id: productId,
      p_session_id: getSessionId(),
    });
  } catch {
    // silencioso
  }
}

export async function registerSearchEvent(term: string, hasResults: boolean) {
  if (!isSupabaseConfiguredClient() || !term) return;
  try {
    const supabase = createClient();
    await supabase.rpc("register_search_event", {
      p_term: term,
      p_has_results: hasResults,
    });
  } catch {
    // silencioso
  }
}

export async function reportProduct(productId: string, reason: string) {
  if (!isSupabaseConfiguredClient()) return { ok: false };
  try {
    const supabase = createClient();
    const { error } = await supabase.rpc("report_product", {
      p_product_id: productId,
      p_reason: reason,
      p_session_id: getSessionId(),
    });
    return { ok: !error };
  } catch {
    return { ok: false };
  }
}

export async function markNotificationRead(notificationId: string) {
  if (!isSupabaseConfiguredClient()) return;
  try {
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId);
  } catch {
    // silencioso
  }
}
