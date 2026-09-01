import Link from "next/link";
import { cookies } from "next/headers";
import { Bell } from "lucide-react";
import { Logo } from "@/components/Logo";
import { SearchBar } from "@/components/SearchBar";
import { CitySelector } from "@/components/CitySelector";
import { CategoryRow } from "@/components/CategoryRow";
import { ProductCard } from "@/components/ProductCard";
import { getCategories, searchProducts } from "@/lib/data/products";
import { getUnreadNotificationCount } from "@/lib/data/notifications";
import { getFavoritedIds } from "@/lib/data/favorites";

export default async function HomePage() {
  const cookieStore = await cookies();
  const cityId = cookieStore.get("olhai_city_id")?.value;

  const [categories, productsRaw, unreadCount] = await Promise.all([
    getCategories(),
    searchProducts(cityId ? { cityId } : {}),
    getUnreadNotificationCount(),
  ]);

  const favoritedIds = await getFavoritedIds(productsRaw.map((p) => p.id));
  const products = productsRaw.map((p) => ({
    ...p,
    isFavorite: favoritedIds.has(p.id),
  }));

  return (
    <main className="mx-auto max-w-md px-4 pt-5 md:max-w-6xl md:px-8 md:pt-8">
      {/* Cabeçalho compacto — só no celular; no desktop o TopNav já cobre
          busca/notificações/conta. */}
      <header className="mb-4 flex items-center justify-between md:hidden">
        <div>
          <Logo compact className="h-6 w-auto" />
          <div className="mt-0.5">
            <CitySelector />
          </div>
        </div>
        <Link
          href="/notificacoes"
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-line"
          aria-label="Notificações"
        >
          <Bell className="h-5 w-5 text-navy" strokeWidth={1.75} />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-orange px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
      </header>

      <div className="mb-5 md:hidden">
        <SearchBar />
      </div>

      {/* No desktop, a cidade continua visível e filtrável mesmo com o
          cabeçalho mobile escondido. */}
      <div className="mb-5 hidden md:block">
        <CitySelector />
      </div>

      <section className="mb-6 md:mb-8">
        <CategoryRow categories={categories} />
      </section>

      <section className="mb-6 md:mb-10">
        <h2 className="mb-3 text-[16px] font-extrabold text-ink md:mb-4 md:text-[20px]">
          OLHAÍ OS DESTAQUES 👀
        </h2>
        {products.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-muted">
            Ainda não há anúncios nessa cidade.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5 lg:grid-cols-5">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {products.length > 0 && (
        <section className="pb-10 md:pb-16">
          <h2 className="mb-3 text-[16px] font-extrabold text-ink md:mb-4 md:text-[20px]">
            Chegou agora
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5 lg:grid-cols-5">
            {[...products].reverse().map((p) => (
              <ProductCard key={`recent-${p.id}`} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
