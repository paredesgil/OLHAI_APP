import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { ChevronLeft } from "lucide-react";
import { WhatsappButton } from "@/components/WhatsappButton";
import { ShareButton } from "@/components/ShareButton";
import { ProductViewTracker } from "@/components/ProductViewTracker";
import { ReportButton } from "@/components/ReportButton";
import { ProductGallery } from "@/components/ProductGallery";
import { FavoriteButton } from "@/components/FavoriteButton";
import { getProductBySlug } from "@/lib/data/products";
import { isFavorited } from "@/lib/data/favorites";

const priceFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export default async function ProdutoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const headersList = await headers();
  const host = headersList.get("host") ?? "olhai.com.br";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const productUrl = `${protocol}://${host}/produto/${product.slug}`;
  const favorited = await isFavorited(product.id);

  return (
    <main className="pb-28">
      <ProductViewTracker productId={product.id} />
      <div className="relative">
        <ProductGallery images={product.images} alt={product.title} />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-navy"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="flex gap-2">
            <ShareButton productId={product.id} title={product.title} url={productUrl} />
            <FavoriteButton productId={product.id} initialFavorited={favorited} />
          </div>
        </div>
      </div>

      <div className="px-4 pt-4">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-full bg-navy/10 px-2 py-0.5 text-[11px] font-semibold text-navy">
            {product.condition === "new" ? "Novo" : "Usado"}
          </span>
          <span className="text-[12px] text-muted">{product.publicCode}</span>
        </div>

        <p className="mb-1 text-[26px] font-extrabold text-ink">
          {priceFormatter.format(product.price)}
        </p>
        <h1 className="mb-1 text-[17px] font-semibold text-ink">
          {product.title}
        </h1>
        <p className="mb-4 text-[13px] text-muted">{product.cityName}</p>

        <p className="mb-6 whitespace-pre-line text-[14px] leading-relaxed text-ink/85">
          {product.description}
        </p>

        <div className="mb-6 rounded-2xl border border-line bg-white p-4">
          <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-muted">
            Vendedor
          </p>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-navy/10 text-[15px] font-bold text-navy">
              {product.seller.name.charAt(0)}
            </div>
            <div>
              <p className="text-[14px] font-semibold text-ink">
                {product.seller.name}
              </p>
              <p className="text-[12px] text-muted">{product.seller.cityName}</p>
            </div>
          </div>
        </div>

        <ReportButton productId={product.id} />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-line bg-white p-3">
        <WhatsappButton
          productId={product.id}
          whatsapp={product.seller.whatsapp}
          productTitle={product.title}
        />
      </div>
    </main>
  );
}
