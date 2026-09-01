import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { getMyFavorites } from "@/lib/data/favorites";
import { getCurrentUser } from "@/lib/data/seller";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export default async function FavoritosPage() {
  const user = await getCurrentUser();
  const semSupabase = !isSupabaseConfigured();
  const favoritos = user || semSupabase ? await getMyFavorites() : [];

  return (
    <main className="px-4 pt-5 pb-8">
      <header className="mb-5 flex items-center gap-3">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-line"
          aria-label="Voltar"
        >
          <ChevronLeft className="h-5 w-5 text-navy" />
        </Link>
        <h1 className="text-[18px] font-extrabold text-ink">Favoritos</h1>
      </header>

      {!user && !semSupabase ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <p className="text-[15px] font-semibold text-ink">
            Entre para ver seus favoritos
          </p>
          <Link
            href="/entrar"
            className="rounded-2xl bg-orange px-6 py-3 text-[14px] font-bold text-white"
          >
            Entrar
          </Link>
        </div>
      ) : favoritos.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-2 text-center">
          <p className="text-[15px] font-semibold text-ink">
            Nenhum favorito ainda
          </p>
          <p className="max-w-[240px] text-[13px] text-muted">
            Toque no coração de um anúncio para salvá-lo aqui.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {favoritos.map((p) => (
            <ProductCard key={p.id} product={{ ...p, isFavorite: true }} />
          ))}
        </div>
      )}
    </main>
  );
}
