import type { CategoryRow, ProductCard, ProductDetail } from "@/lib/supabase/types";

// Dados de demonstração exibidos até você conectar o Supabase real
// (ver .env.local.example). Os nomes de campos seguem o schema oficial
// do Documento Mestre para que a troca pelos dados reais seja direta.

export const MOCK_CATEGORIES: CategoryRow[] = [
  { id: "1", name: "Veículos", slug: "veiculos", icon: "car", sort_order: 1, active: true },
  { id: "2", name: "Motos", slug: "motos", icon: "bike", sort_order: 2, active: true },
  { id: "3", name: "Náutica", slug: "nautica", icon: "anchor", sort_order: 3, active: true },
  { id: "4", name: "Agro", slug: "agro", icon: "tractor", sort_order: 4, active: true },
  { id: "5", name: "Imóveis", slug: "imoveis", icon: "home", sort_order: 5, active: true },
  { id: "6", name: "Eletrônicos", slug: "eletronicos", icon: "tv", sort_order: 6, active: true },
  { id: "7", name: "Celulares", slug: "celulares", icon: "phone", sort_order: 7, active: true },
  { id: "8", name: "Informática", slug: "informatica", icon: "laptop", sort_order: 8, active: true },
  { id: "9", name: "Casa e móveis", slug: "casa-e-moveis", icon: "sofa", sort_order: 9, active: true },
  { id: "10", name: "Ferramentas", slug: "ferramentas", icon: "wrench", sort_order: 10, active: true },
  { id: "11", name: "Máquinas", slug: "maquinas", icon: "cog", sort_order: 11, active: true },
  { id: "12", name: "Moda", slug: "moda", icon: "shirt", sort_order: 12, active: true },
  { id: "13", name: "Esportes", slug: "esportes", icon: "dumbbell", sort_order: 13, active: true },
  { id: "14", name: "Outros", slug: "outros", icon: "grid", sort_order: 14, active: true },
];

export const MOCK_PRODUCTS: ProductDetail[] = [
  {
    id: "p1",
    slug: "bicicleta-aro-29-caloi-olh-000123",
    publicCode: "OLH-000123",
    title: "Bicicleta Aro 29 Caloi Elite",
    price: 2450,
    condition: "used",
    cityName: "Corumbá - MS",
    coverImageUrl:
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80",
    description:
      "Bicicleta em ótimo estado, pouco uso, revisada há 1 mês. Aro 29, 21 marchas, freio a disco.",
    images: [
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=1200&q=80",
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1200&q=80",
    ],
    seller: {
      name: "Marcos P.",
      avatarUrl: null,
      whatsapp: "5567999990000",
      cityName: "Corumbá - MS",
      isVerified: false,
    },
  },
  {
    id: "p2",
    slug: "iphone-12-128gb-olh-000124",
    publicCode: "OLH-000124",
    title: "iPhone 12 128GB",
    price: 1899,
    condition: "used",
    cityName: "Corumbá - MS",
    coverImageUrl:
      "https://images.unsplash.com/photo-1592286927505-1def25115481?w=800&q=80",
    description:
      "iPhone 12 128GB, bateria 89%, sem trincos, acompanha carregador e capinha.",
    images: [
      "https://images.unsplash.com/photo-1592286927505-1def25115481?w=1200&q=80",
    ],
    seller: {
      name: "Loja CelularShop",
      avatarUrl: null,
      whatsapp: "5567999991111",
      cityName: "Corumbá - MS",
      isVerified: false,
    },
  },
  {
    id: "p3",
    slug: "sofa-3-lugares-cinza-olh-000125",
    publicCode: "OLH-000125",
    title: "Sofá 3 Lugares Cinza",
    price: 890,
    condition: "used",
    cityName: "Ladário - MS",
    coverImageUrl:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
    description: "Sofá retrátil e reclinável, tecido suede, sem manchas.",
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80",
    ],
    seller: {
      name: "Ana R.",
      avatarUrl: null,
      whatsapp: "5567999992222",
      cityName: "Ladário - MS",
      isVerified: false,
    },
  },
  {
    id: "p4",
    slug: "furadeira-bosch-nova-olh-000126",
    publicCode: "OLH-000126",
    title: "Furadeira Bosch Nova (na caixa)",
    price: 320,
    condition: "new",
    cityName: "Corumbá - MS",
    coverImageUrl:
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80",
    description: "Furadeira Bosch nunca usada, ainda na caixa lacrada, com nota fiscal.",
    images: [
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&q=80",
    ],
    seller: {
      name: "Ferragens Corumbá",
      avatarUrl: null,
      whatsapp: "5567999993333",
      cityName: "Corumbá - MS",
      isVerified: false,
    },
  },
];

export function toCard(p: ProductDetail): ProductCard {
  const { description: _description, images: _images, seller: _seller, ...card } = p;
  return card;
}

// --- Dados adicionais de demonstração: cidades e painel do vendedor ---
export const MOCK_CITIES = [
  { id: "c1", name: "Corumbá - MS", state_id: "MS" },
  { id: "c2", name: "Ladário - MS", state_id: "MS" },
  { id: "c3", name: "Campo Grande - MS", state_id: "MS" },
];

export const MOCK_SELLER_STATS = {
  activeCount: 12,
  soldCount: 3,
  viewsCount: 847,
  contactsCount: 36,
};

export const MOCK_MY_PRODUCTS = MOCK_PRODUCTS.map((p, i) => ({
  ...toCard(p),
  status: i === 0 ? "sold" : ("active" as const),
  views: 120 + i * 40,
  contacts: 8 + i * 3,
  expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * (25 - i * 8)).toISOString(),
}));
