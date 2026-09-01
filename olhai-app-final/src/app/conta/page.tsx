import Link from "next/link";
import Image from "next/image";
import { Eye, MessageCircle, ChevronRight, Heart } from "lucide-react";
import { getCurrentUser, getSellerStats, getMyProducts } from "@/lib/data/seller";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { Logo } from "@/components/Logo";
import { LogoutButton } from "@/components/LogoutButton";
import { ProductActions } from "@/components/ProductActions";

const priceFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const STATUS_LABEL: Record<string, string> = {
  active: "Ativo",
  paused: "Pausado",
  sold: "Vendido",
  expired: "Expirado",
  draft: "Rascunho",
  removed: "Removido",
};

function validadeLabel(expiresAt?: string | null, status?: string) {
  if (!expiresAt || status !== "active") return null;
  const dias = Math.ceil(
    (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (dias <= 0) return { texto: "Expira hoje", urgente: true };
  if (dias <= 5) return { texto: `Expira em ${dias} dia${dias > 1 ? "s" : ""}`, urgente: true };
  return { texto: `Expira em ${dias} dias`, urgente: false };
}

export default async function ContaPage() {
  const user = await getCurrentUser();

  // Em modo demonstração (Supabase não configurado) ou sem usuário logado,
  // mostramos o painel com dados de exemplo para visualização do fluxo.
  const sellerId = user?.id ?? "demo";
  const [stats, produtos] = await Promise.all([
    getSellerStats(sellerId),
    getMyProducts(sellerId),
  ]);

  const semSupabase = !isSupabaseConfigured();

  return (
    <main className="px-4 pt-5">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <Logo compact className="h-6 w-auto" />
          <p className="mt-0.5 text-[13px] text-muted">Painel do vendedor</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/favoritos"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white ring-1 ring-line text-navy"
            aria-label="Favoritos"
          >
            <Heart className="h-4.5 w-4.5" />
          </Link>
          {user ? (
            <LogoutButton />
          ) : (
            <Link
              href="/entrar"
              className="flex items-center gap-1 text-[13px] font-semibold text-orange"
            >
              Entrar <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </header>

      {semSupabase && (
        <div className="mb-4 rounded-2xl bg-navy/5 px-4 py-3 text-[12px] text-navy">
          Exibindo dados de demonstração — conecte o Supabase para ver seus
          dados reais.
        </div>
      )}

      <section className="mb-6 grid grid-cols-2 gap-3">
        <StatCard label="Anúncios ativos" value={stats.activeCount} />
        <StatCard label="Vendidos" value={stats.soldCount} />
        <StatCard label="Visualizações" value={stats.viewsCount} />
        <StatCard
          label="Contatos recebidos"
          value={stats.contactsCount}
          highlight
        />
      </section>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[16px] font-extrabold text-ink">Meus anúncios</h2>
        <Link href="/vender" className="text-[13px] font-semibold text-orange">
          + Novo anúncio
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {produtos.map((p) => (
          <div
            key={p.id}
            className="flex gap-3 rounded-2xl border border-line bg-white p-3"
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-line">
              {p.coverImageUrl && (
                <Image
                  src={p.coverImageUrl}
                  alt={p.title}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="truncate text-[13px] font-semibold text-ink">
                  {p.title}
                </p>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    p.status === "active"
                      ? "bg-whatsapp/10 text-whatsapp-dark"
                      : "bg-line text-muted"
                  }`}
                >
                  {STATUS_LABEL[p.status] ?? p.status}
                </span>
              </div>
              <p className="mt-0.5 text-[14px] font-bold text-ink">
                {priceFormatter.format(p.price)}
              </p>
              <div className="mt-1 flex items-center gap-3 text-[11px] text-muted">
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" /> {p.views}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5" /> {p.contacts}
                </span>
                {(() => {
                  const validade = validadeLabel((p as any).expiresAt, p.status);
                  if (!validade) return null;
                  return (
                    <span
                      className={validade.urgente ? "font-semibold text-orange" : ""}
                    >
                      {validade.texto}
                    </span>
                  );
                })()}
              </div>
              <ProductActions
                productId={p.id}
                slug={p.slug}
                title={p.title}
                status={p.status}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-8 text-center text-[11px] text-muted">
        <Link href="/termos" className="underline">
          Termos de Uso
        </Link>{" "}
        ·{" "}
        <Link href="/privacidade" className="underline">
          Política de Privacidade
        </Link>
      </p>
    </main>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlight ? "border-orange/30 bg-orange/5" : "border-line bg-white"
      }`}
    >
      <p className={`text-[22px] font-extrabold ${highlight ? "text-orange" : "text-ink"}`}>
        {value}
      </p>
      <p className="mt-0.5 text-[12px] text-muted">{label}</p>
    </div>
  );
}
