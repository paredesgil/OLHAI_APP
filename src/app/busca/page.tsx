import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import { ProductCard } from "@/components/ProductCard";
import { SearchFilters } from "@/components/SearchFilters";
import { SearchEventTracker } from "@/components/SearchEventTracker";
import { searchProducts, getCategories, getCities } from "@/lib/data/products";
import { getFavoritedIds } from "@/lib/data/favorites";

export default async function BuscaPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    categoria?: string;
    cidade?: string;
    condicao?: string;
    precoMin?: string;
    precoMax?: string;
  }>;
}) {
  const { q, categoria, cidade, condicao, precoMin, precoMax } =
    await searchParams;

  const [productsRaw, categories, cities] = await Promise.all([
    searchProducts({
      term: q,
      categorySlug: categoria,
      cityId: cidade,
      condition: condicao === "new" || condicao === "used" ? condicao : undefined,
      minPrice: precoMin ? Number(precoMin) : undefined,
      maxPrice: precoMax ? Number(precoMax) : undefined,
    }),
    getCategories(),
    getCities(),
  ]);

  const favoritedIds = await getFavoritedIds(productsRaw.map((p) => p.id));
  const products = productsRaw.map((p) => ({
    ...p,
    isFavorite: favoritedIds.has(p.id),
  }));

  return (
    <main className="px-4 pt-5">
      <SearchEventTracker term={q ?? ""} hasResults={products.length > 0} />

      <header className="mb-4 flex items-center gap-3">
        <Link
          href="/"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-line"
          aria-label="Voltar"
        >
          <ChevronLeft className="h-5 w-5 text-navy" />
        </Link>
        <div className="flex-1">
          <SearchBar defaultValue={q} />
        </div>
      </header>

      <div className="mb-3 flex items-center justify-between text-[13px] text-muted">
        <span>
          {products.length}{" "}
          {products.length === 1 ? "resultado" : "resultados"}
        </span>
        <span className="font-medium text-ink">Mais recentes ▾</span>
      </div>

      <SearchFilters categories={categories} cities={cities} />

      {products.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-2 text-center">
          <p className="text-[15px] font-semibold text-ink">
            Nada por aqui ainda
          </p>
          <p className="max-w-[240px] text-[13px] text-muted">
            {q
              ? `Não encontramos anúncios para "${q}". Tente ajustar os filtros.`
              : "Tente ajustar os filtros ou volte mais tarde."}
          </p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </main>
  );
}
