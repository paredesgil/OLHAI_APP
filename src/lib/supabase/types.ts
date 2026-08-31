// Tipos essenciais das tabelas do OLHAÍ, conforme o Documento Mestre
// (seção 25.3 / 26.2 — Marketplace: profiles, states, cities, categories,
// products, product_images). Ampliar conforme novas tabelas forem usadas
// no front-end.

export type ProductStatus =
  | "draft"
  | "active"
  | "paused"
  | "sold"
  | "expired"
  | "removed";

export type ProductCondition = "new" | "used";

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  sort_order: number | null;
  active: boolean;
}

export interface CityRow {
  id: string;
  name: string;
  state_id: string;
}

export interface ProductImageRow {
  id: string;
  product_id: string;
  url: string;
  sort_order: number;
}

export interface ProductRow {
  id: string;
  public_code: string;
  slug: string;
  seller_id: string;
  category_id: string;
  city_id: string;
  title: string;
  description: string;
  price: number;
  condition: ProductCondition;
  status: ProductStatus;
  created_at: string;
  published_at: string | null;
  expires_at: string | null;
}

export interface ProfileRow {
  id: string;
  display_name: string;
  whatsapp: string;
  city_id: string;
  seller_type: "particular" | "empresa";
  avatar_url: string | null;
}

// Formato já "achatado" usado pelos componentes de listagem/produto.
export interface ProductCard {
  id: string;
  slug: string;
  publicCode: string;
  title: string;
  price: number;
  condition: ProductCondition;
  cityName: string;
  coverImageUrl: string;
  isFavorite?: boolean;
}

export interface ProductDetail extends ProductCard {
  description: string;
  images: string[];
  seller: {
    name: string;
    avatarUrl: string | null;
    whatsapp: string;
    cityName: string;
    isVerified: boolean;
  };
}

export type ProductInsert = Omit<ProductRow, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

export type ProductImageInsert = Omit<ProductImageRow, "id"> & { id?: string };

export type ProfileInsert = ProfileRow;

// Estrutura mínima do Database para tipar o client do Supabase (formato
// Row/Insert/Update/Relationships esperado pelo supabase-js). Pode ser
// substituída pelo tipo gerado via `supabase gen types typescript`.
export type Database = {
  __InternalSupabase: { PostgrestVersion: "12" };
  public: {
    Tables: {
      categories: {
        Row: CategoryRow;
        Insert: Partial<CategoryRow>;
        Update: Partial<CategoryRow>;
        Relationships: [];
      };
      cities: {
        Row: CityRow;
        Insert: Partial<CityRow>;
        Update: Partial<CityRow>;
        Relationships: [];
      };
      products: {
        Row: ProductRow;
        Insert: ProductInsert;
        Update: Partial<ProductInsert>;
        Relationships: [];
      };
      product_images: {
        Row: ProductImageRow;
        Insert: ProductImageInsert;
        Update: Partial<ProductImageInsert>;
        Relationships: [];
      };
      profiles: {
        Row: ProfileRow;
        Insert: ProfileInsert;
        Update: Partial<ProfileInsert>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
