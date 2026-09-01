import Link from "next/link";
import { Heart, Bell, PlusCircle, User } from "lucide-react";
import { Logo } from "@/components/Logo";
import { SearchBar } from "@/components/SearchBar";
import { getUnreadNotificationCount } from "@/lib/data/notifications";

// Menu superior — só aparece em telas de desktop (md+). No celular, a
// navegação continua sendo a barra inferior (BottomNav).
export async function TopNav() {
  const unreadCount = await getUnreadNotificationCount();

  return (
    <header className="sticky top-0 z-40 hidden border-b border-line bg-white/95 backdrop-blur-sm md:block">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-8 py-3">
        <Link href="/" className="shrink-0">
          <Logo compact className="h-7 w-auto" />
        </Link>

        <div className="max-w-xl flex-1">
          <SearchBar />
        </div>

        <nav className="flex shrink-0 items-center gap-5">
          <Link
            href="/favoritos"
            className="flex items-center gap-1.5 text-[14px] font-medium text-ink/80 hover:text-orange"
          >
            <Heart className="h-5 w-5" />
            Favoritos
          </Link>

          <Link
            href="/notificacoes"
            className="relative flex items-center gap-1.5 text-[14px] font-medium text-ink/80 hover:text-orange"
          >
            <Bell className="h-5 w-5" />
            Notificações
            {unreadCount > 0 && (
              <span className="absolute -right-2 -top-1.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-orange px-1 text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          <Link
            href="/conta"
            className="flex items-center gap-1.5 text-[14px] font-medium text-ink/80 hover:text-orange"
          >
            <User className="h-5 w-5" />
            Minha conta
          </Link>

          <Link
            href="/vender"
            className="flex items-center gap-2 rounded-full bg-orange px-4 py-2 text-[14px] font-bold text-white shadow-sm shadow-orange/25 hover:bg-orange-dark"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            Vender
          </Link>
        </nav>
      </div>
    </header>
  );
}
