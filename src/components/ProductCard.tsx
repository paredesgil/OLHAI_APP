import Image from "next/image";
import Link from "next/link";
import type { ProductCard as ProductCardType } from "@/lib/supabase/types";
import { FavoriteButton } from "@/components/FavoriteButton";

const priceFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function ProductCard({ product }: { product: ProductCardType }) {
  return (
    <Link
      href={`/produto/${product.slug}`}
      className="group block overflow-hidden rounded-2xl bg-white ring-1 ring-line transition hover:ring-orange/40"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-line">
        {product.coverImageUrl && (
          <Image
            src={product.coverImageUrl}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 50vw, 240px"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        )}
        <span className="absolute left-2 top-2 rounded-full bg-navy/85 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
          {product.condition === "new" ? "Novo" : "Usado"}
        </span>
        <div className="absolute right-2 top-2">
          <FavoriteButton
            productId={product.id}
            initialFavorited={product.isFavorite ?? false}
            variant="small"
          />
        </div>
      </div>
      <div className="space-y-0.5 p-3">
        <p className="text-[15px] font-bold text-ink">
          {priceFormatter.format(product.price)}
        </p>
        <p className="line-clamp-2 text-[13px] leading-snug text-ink/80">
          {product.title}
        </p>
        <p className="text-[12px] text-muted">{product.cityName}</p>
      </div>
    </Link>
  );
}
