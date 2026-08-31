import { getNotifications } from "@/lib/data/notifications";
import { NotificationList } from "@/components/NotificationList";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function NotificacoesPage() {
  const notifications = await getNotifications();

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
        <h1 className="text-[18px] font-extrabold text-ink">Notificações</h1>
      </header>

      {notifications.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-2 text-center">
          <p className="text-[15px] font-semibold text-ink">
            Nenhuma notificação ainda
          </p>
          <p className="max-w-[240px] text-[13px] text-muted">
            Quando alguém chamar você no WhatsApp sobre um anúncio, vai
            aparecer aqui.
          </p>
        </div>
      ) : (
        <NotificationList initialNotifications={notifications} />
      )}
    </main>
  );
}
