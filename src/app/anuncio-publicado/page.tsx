import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { ShareButton } from "@/components/ShareButton";

export default async function AnuncioPublicadoPage({
  searchParams,
}: {
  searchParams: Promise<{ titulo?: string; slug?: string; id?: string }>;
}) {
  const { titulo, slug, id } = await searchParams;
  const productUrl = slug
    ? `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://olhai.com.br"}/produto/${slug}`
    : "";

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
      <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-whatsapp/10">
        <CheckCircle2 className="h-9 w-9 text-whatsapp" strokeWidth={1.75} />
      </span>

      <h1 className="mb-2 text-[20px] font-extrabold text-ink">
        Seu anúncio está no OLHAÍ!
      </h1>
      <p className="mb-8 text-[14px] text-muted">
        {titulo ? `"${titulo}" já está visível para compradores da sua região.` : "Já está visível para compradores da sua região."}
      </p>

      <div className="flex w-full flex-col gap-3">
        {id && (
          <ShareButton
            productId={id}
            title={titulo ?? "meu anúncio"}
            url={productUrl}
            variant="whatsapp"
          />
        )}

        {slug && (
          <Link
            href={`/produto/${slug}`}
            className="rounded-2xl border border-line bg-white py-3.5 text-[15px] font-semibold text-ink"
          >
            Ver anúncio
          </Link>
        )}

        <Link
          href="/conta"
          className="rounded-2xl py-3.5 text-[15px] font-semibold text-navy"
        >
          Meus anúncios
        </Link>
      </div>
    </main>
  );
}
