import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export interface NotificationItem {
  id: string;
  type: "contact" | "welcome" | "system";
  title: string;
  body: string;
  productId: string | null;
  productSlug: string | null;
  read: boolean;
  createdAt: string;
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    type: "contact",
    title: "Novo contato recebido",
    body: 'Alguém chamou você no WhatsApp sobre "Bicicleta Aro 29 Caloi Elite".',
    productId: "p1",
    productSlug: "bicicleta-aro-29-caloi-olh-000123",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
  },
  {
    id: "n2",
    type: "welcome",
    title: "Bem-vindo ao OLHAÍ!",
    body: "Publique seu primeiro anúncio e comece a vender para quem está pertinho de você.",
    productId: null,
    productSlug: null,
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
];

export async function getNotifications(): Promise<NotificationItem[]> {
  if (!isSupabaseConfigured()) return MOCK_NOTIFICATIONS;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("notifications")
    .select("id, type, title, body, product_id, read, created_at, product:products(slug)")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) return [];

  return data.map((row: any) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    productId: row.product_id,
    productSlug: row.product?.slug ?? null,
    read: row.read,
    createdAt: row.created_at,
  }));
}

export async function getUnreadNotificationCount(): Promise<number> {
  if (!isSupabaseConfigured()) {
    return MOCK_NOTIFICATIONS.filter((n) => !n.read).length;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("read", false);

  return count ?? 0;
}
