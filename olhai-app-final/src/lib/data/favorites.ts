import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { ProductCard } from "@/lib/supabase/types";

export async function isFavorited(productId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("favorites")
    .select("product_id")
    .eq("product_id", productId)
    .eq("user_id", user.id)
    .maybeSingle();

  return Boolean(data);
}

// Para listagens (Home/Busca): descobre, em uma única consulta, quais
// desses IDs de produto já estão favoritados pelo usuário logado.
export async function getFavoritedIds(productIds: string[]): Promise<Set<string>> {
  if (!isSupabaseConfigured() || productIds.length === 0) return new Set();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();

  const { data } = await supabase
    .from("favorites")
    .select("product_id")
    .eq("user_id", user.id)
    .in("product_id", productIds);

  return new Set((data ?? []).map((r: any) => r.product_id));
}

export async function getMyFavorites(): Promise<ProductCard[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("favorites")
    .select(
      "product:products(id, slug, public_code, title, price, condition, city:cities(name), product_images(url, sort_order))"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data
    .map((row: any) => row.product)
    .filter(Boolean)
    .map((p: any) => ({
      id: p.id,
      slug: p.slug,
      publicCode: p.public_code,
      title: p.title,
      price: Number(p.price),
      condition: p.condition,
      cityName: p.city?.name ?? "",
      coverImageUrl:
        p.product_images?.sort((a: any, b: any) => a.sort_order - b.sort_order)[0]
          ?.url ?? "",
    }));
}
