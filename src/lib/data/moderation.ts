import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export interface ReportItem {
  id: string;
  reason: string;
  status: "pending" | "reviewing" | "resolved" | "dismissed";
  createdAt: string;
  productId: string;
  productTitle: string;
  productSlug: string;
  productStatus: string;
  sellerName: string;
}

// Confere se o usuário logado tem cargo de moderador/admin — a mesma
// checagem que as policies do banco já fazem (is_moderator_or_admin()),
// só que do lado do app pra decidir se mostra a tela ou não.
export async function isCurrentUserModerator(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .in("role", ["moderator", "admin", "super_admin"]);

  return Boolean(data && data.length > 0);
}

export async function getReports(): Promise<ReportItem[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reports")
    .select(
      "id, reason, status, created_at, product:products(id, title, slug, status, seller:profiles(display_name))"
    )
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row: any) => ({
    id: row.id,
    reason: row.reason,
    status: row.status,
    createdAt: row.created_at,
    productId: row.product?.id ?? "",
    productTitle: row.product?.title ?? "(anúncio removido)",
    productSlug: row.product?.slug ?? "",
    productStatus: row.product?.status ?? "",
    sellerName: row.product?.seller?.display_name ?? "—",
  }));
}
