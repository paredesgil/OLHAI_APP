import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { MOCK_CATEGORIES, MOCK_CITIES, MOCK_PRODUCTS, toCard } from "@/lib/data/mock";
import type { ProductCard, ProductDetail } from "@/lib/supabase/types";

// Camada de dados: enquanto o Supabase real não está conectado
// (NEXT_PUBLIC_SUPABASE_URL/ANON_KEY ausentes), retorna os dados de
// demonstração. Assim que as variáveis existirem, passa a consultar
// as tabelas reais definidas no Documento Mestre.

export interface ProductFilters {
  term?: string;
  categorySlug?: string;
  cityId?: string;
  condition?: "new" | "used";
  minPrice?: number;
  maxPrice?: number;
}

export async function getCategories() {
  if (!isSupabaseConfigured()) return MOCK_CATEGORIES;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error || !data) return MOCK_CATEGORIES;
  return data;
}

export async function getCities() {
  if (!isSupabaseConfigured()) return MOCK_CITIES;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cities")
    .select("id, name")
    .order("name", { ascending: true });

  if (error || !data) return MOCK_CITIES;
  return data;
}

function mapRowToCard(row: any): ProductCard {
  return {
    id: row.id,
    slug: row.slug,
    publicCode: row.public_code,
    title: row.title,
    price: Number(row.price),
    condition: row.condition,
    cityName: row.city?.name ?? "",
    coverImageUrl:
      row.product_images?.sort((a: any, b: any) => a.sort_order - b.sort_order)[0]
        ?.url ?? "",
  };
}

export async function getHighlightProducts(): Promise<ProductCard[]> {
  return searchProducts({});
}

export async function searchProducts(
  filters: ProductFilters
): Promise<ProductCard[]> {
  if (!isSupabaseConfigured()) {
    let items = MOCK_PRODUCTS.map(toCard);
    const term = filters.term?.trim().toLowerCase();
    if (term) {
      items = items.filter((p) => p.title.toLowerCase().includes(term));
    }
    if (filters.condition) {
      items = items.filter((p) => p.condition === filters.condition);
    }
    if (filters.minPrice != null) {
      items = items.filter((p) => p.price >= filters.minPrice!);
    }
    if (filters.maxPrice != null) {
      items = items.filter((p) => p.price <= filters.maxPrice!);
    }
    return items;
  }

  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select(
      "id, slug, public_code, title, price, condition, city_id, category:categories!inner(slug), city:cities(name), product_images(url, sort_order)"
    )
    .eq("status", "active")
    .order("published_at", { ascending: false })
    .limit(40);

  if (filters.term) {
    query = query.ilike("title", `%${filters.term}%`);
  }
  if (filters.categorySlug) {
    query = query.eq("category.slug", filters.categorySlug);
  }
  if (filters.cityId) {
    query = query.eq("city_id", filters.cityId);
  }
  if (filters.condition) {
    query = query.eq("condition", filters.condition);
  }
  if (filters.minPrice != null) {
    query = query.gte("price", filters.minPrice);
  }
  if (filters.maxPrice != null) {
    query = query.lte("price", filters.maxPrice);
  }

  const { data, error } = await query;

  if (error || !data) return MOCK_PRODUCTS.map(toCard);
  return data.map(mapRowToCard);
}

export async function getProductBySlug(
  slug: string
): Promise<ProductDetail | null> {
  if (!isSupabaseConfigured()) {
    return MOCK_PRODUCTS.find((p) => p.slug === slug) ?? null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, slug, public_code, title, description, price, condition, city:cities(name), product_images(url, sort_order), seller:profiles(display_name, avatar_url, is_verified)"
    )
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (error || !data) return null;

  const row = data as any;
  const images = (row.product_images ?? [])
    .sort((a: any, b: any) => a.sort_order - b.sort_order)
    .map((i: any) => i.url);

  // O WhatsApp não vem mais pela leitura direta de profiles (bloqueada
  // pelo patch_001_column_privileges.sql) — só pela RPC get_product_contact,
  // que só libera para produto/vendedor ativos.
  const { data: whatsapp } = await supabase.rpc("get_product_contact", {
    p_product_id: row.id,
  });

  return {
    id: row.id,
    slug: row.slug,
    publicCode: row.public_code,
    title: row.title,
    price: Number(row.price),
    condition: row.condition,
    cityName: row.city?.name ?? "",
    coverImageUrl: images[0] ?? "",
    description: row.description,
    images,
    seller: {
      name: row.seller?.display_name ?? "Vendedor",
      avatarUrl: row.seller?.avatar_url ?? null,
      whatsapp: whatsapp ?? "",
      cityName: row.city?.name ?? "",
      isVerified: row.seller?.is_verified ?? false,
    },
  };
}
