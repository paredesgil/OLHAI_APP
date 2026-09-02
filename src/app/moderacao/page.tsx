import Link from "next/link";
import { ChevronLeft, ShieldAlert } from "lucide-react";
import { getCurrentUser } from "@/lib/data/seller";
import { isCurrentUserModerator, getReports } from "@/lib/data/moderation";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { ModerationPanel } from "@/components/ModerationPanel";

export default async function ModeracaoPage() {
  const user = await getCurrentUser();
  const ehModerador = await isCurrentUserModerator();

  if (!isSupabaseConfigured() || !user || !ehModerador) {
    return (
      <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-3 px-6 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-line text-muted">
          <ShieldAlert className="h-6 w-6" />
        </span>
        <p className="text-[16px] font-bold text-ink">Acesso restrito</p>
        <p className="text-[13px] text-muted">
          Essa área é só para a equipe de moderação do OLHAÍ.
        </p>
        <Link href="/" className="mt-2 text-[14px] font-semibold text-orange">
          Voltar para o início
        </Link>
      </main>
    );
  }

  const reports = await getReports();

  return (
    <main className="mx-auto max-w-md px-4 pt-5 pb-10 md:max-w-3xl md:px-8 md:pt-8">
      <header className="mb-5 flex items-center gap-3">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-line md:hidden"
          aria-label="Voltar"
        >
          <ChevronLeft className="h-5 w-5 text-navy" />
        </Link>
        <div>
          <h1 className="text-[18px] font-extrabold text-ink md:text-[22px]">
            Moderação
          </h1>
          <p className="text-[12px] text-muted">Denúncias de anúncios</p>
        </div>
      </header>

      <ModerationPanel initialReports={reports} />
    </main>
  );
}
