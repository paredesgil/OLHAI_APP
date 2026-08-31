import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { MOCK_SELLER_STATS, MOCK_MY_PRODUCTS } from "@/lib/data/mock";

export interface SellerStats {
  activeCount: number;
  soldCount: number;
  viewsCount: number;
  contactsCount: number;
}

export async function getCurrentUser() {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// Busca, em duas consultas simples, quantas visualizações e quantos
// contatos cada anúncio (dos IDs informados) recebeu de verdade. As
// policies de RLS já garantem que só retornam linhas de produtos do
// próprio vendedor — mesmo assim, esta função só é chamada com IDs já
// filtrados por seller_id.
async function getViewsAndContactsByProduct(productIds: string[]) {
  const empty = { views: {} as Record<string, number>, contacts: {} as Record<string, number> };
  if (productIds.length === 0) return empty;

  const supabase = await createClient();
  const [viewsRes, contactsRes] = await Promise.all([
    supabase.from("product_views").select("product_id").in("product_id", productIds),
    supabase.from("contact_events").select("product_id").in("product_id", productIds),
  ]);

  const views: Record<string, number> = {};
  (viewsRes.data ?? []).forEach((row: any) => {
    views[row.product_id] = (views[row.product_id] ?? 0) + 1;
  });

  const contacts: Record<string, number> = {};
  (contactsRes.data ?? []).forEach((row: any) => {
    contacts[row.product_id] = (contacts[row.product_id] ?? 0) + 1;
  });

  return { views, contacts };
}

export async function getSellerStats(sellerId: string): Promise<SellerStats> {
  if (!isSupabaseConfigured()) return MOCK_SELLER_STATS;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, status")
    .eq("seller_id", sellerId);

  if (error || !data) return MOCK_SELLER_STATS;

  const productIds = data.map((p: any) => p.id);
  const { views, contacts } = await getViewsAndContactsByProduct(productIds);

  const sumValues = (map: Record<string, number>) =>
    Object.values(map).reduce((total, n) => total + n, 0);

  return {
    activeCount: data.filter((p: any) => p.status === "active").length,
    soldCount: data.filter((p: any) => p.status === "sold").length,
    viewsCount: sumValues(views),
    contactsCount: sumValues(contacts),
  };
}

export async function getMyProductById(id: string, sellerId: string) {
  if (!isSupabaseConfigured()) {
    const found = MOCK_MY_PRODUCTS.find((p) => p.id === id);
    if (!found) return null;
    return {
      id: found.id,
      title: found.title,
      description: "Descrição de demonstração.",
      price: found.price,
      condition: found.condition,
      status: found.status,
      categoryId: "1",
      cityId: "c1",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, title, description, price, condition, status, category_id, city_id, seller_id")
    .eq("id", id)
    .eq("seller_id", sellerId)
    .single();

  if (error || !data) return null;
  const row = data as any;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: Number(row.price),
    condition: row.condition,
    status: row.status,
    categoryId: row.category_id,
    cityId: row.city_id,
  };
}

export async function getMyProducts(sellerId: string) {
  if (!isSupabaseConfigured()) return MOCK_MY_PRODUCTS;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, slug, public_code, title, price, condition, status, expires_at, product_images(url, sort_order)"
    )
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });

  if (error || !data) return MOCK_MY_PRODUCTS;

  const productIds = data.map((row: any) => row.id);
  const { views, contacts } = await getViewsAndContactsByProduct(productIds);

  return data.map((row: any) => ({
    id: row.id,
    slug: row.slug,
    publicCode: row.public_code,
    title: row.title,
    price: Number(row.price),
    condition: row.condition,
    status: row.status,
    expiresAt: row.expires_at,
    cityName: "",
    coverImageUrl:
      row.product_images?.sort((a: any, b: any) => a.sort_order - b.sort_order)[0]
        ?.url ?? "",
    views: views[row.id] ?? 0,
    contacts: contacts[row.id] ?? 0,
  }));
}
