import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { ChevronLeft, BadgeCheck } from "lucide-react";
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
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
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
  const host = headersList.get("host") ?? "olhaiapp.com.br";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const productUrl = `${protocol}://${host}/produto/${product.slug}`;
  const favorited = await isFavorited(product.id);

  return (
    <main className="pb-28 md:mx-auto md:max-w-5xl md:px-8 md:pb-16 md:pt-8">
      <ProductViewTracker productId={product.id} />

      <div className="md:grid md:grid-cols-2 md:gap-10">
        {/* Coluna da esquerda: galeria */}
        <div className="relative md:rounded-3xl md:overflow-hidden">
          <ProductGallery images={product.images} alt={product.title} />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
            <Link
              href="/"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-navy md:hidden"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div className="ml-auto flex gap-2">
              <ShareButton productId={product.id} title={product.title} url={productUrl} />
              <FavoriteButton productId={product.id} initialFavorited={favorited} />
            </div>
          </div>
        </div>

        {/* Coluna da direita: informações */}
        <div className="px-4 pt-4 md:px-0 md:pt-0">
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded-full bg-navy/10 px-2 py-0.5 text-[11px] font-semibold text-navy">
              {product.condition === "new" ? "Novo" : "Usado"}
            </span>
            <span className="text-[12px] text-muted">{product.publicCode}</span>
          </div>

          <p className="mb-1 text-[26px] font-extrabold text-ink md:text-[32px]">
            {priceFormatter.format(product.price)}
          </p>
          <h1 className="mb-1 text-[17px] font-semibold text-ink md:text-[20px]">
            {product.title}
          </h1>
          <p className="mb-4 text-[13px] text-muted">{product.cityName}</p>

          {/* No desktop, o CTA do WhatsApp fica aqui embutido, junto do
              resto das informações — não precisa de barra fixa. */}
          <div className="mb-6 hidden md:block">
            <WhatsappButton
              productId={product.id}
              whatsapp={product.seller.whatsapp}
              productTitle={product.title}
            />
          </div>

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
                <p className="flex items-center gap-1 text-[14px] font-semibold text-ink">
                  {product.seller.name}
                  {product.seller.isVerified && (
                    <span
                      title="Vendedor verificado"
                      className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-white"
                    >
                      <BadgeCheck className="h-3 w-3" strokeWidth={3} />
                    </span>
                  )}
                </p>
                <p className="text-[12px] text-muted">{product.seller.cityName}</p>
              </div>
            </div>
          </div>

          <ReportButton productId={product.id} />
        </div>
      </div>

      {/* No celular, o CTA fica fixo no rodapé */}
      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-line bg-white p-3 md:hidden">
        <WhatsappButton
          productId={product.id}
          whatsapp={product.seller.whatsapp}
          productTitle={product.title}
        />
      </div>
    </main>
  );
}
