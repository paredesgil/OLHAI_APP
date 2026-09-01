"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusCircle, User } from "lucide-react";

const ITEMS = [
  { href: "/", label: "Início", icon: Home },
  { href: "/busca", label: "Buscar", icon: Search },
  { href: "/vender", label: "Vender", icon: PlusCircle, highlight: true },
  { href: "/conta", label: "Conta", icon: User }, // painel do vendedor / login
];

// Telas que já têm seu próprio rodapé fixo (CTA do WhatsApp, botões de
// wizard em tela cheia) escondem a navegação global para não sobrepor.
const HIDDEN_ON_PREFIXES = ["/produto/", "/vender", "/cadastro", "/entrar"];

export function BottomNav() {
  const pathname = usePathname();

  if (HIDDEN_ON_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur-sm md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {ITEMS.map(({ href, label, icon: Icon, highlight }) => {
          const active = pathname === href;
          if (highlight) {
            return (
              <Link
                key={href}
                href={href}
                className="-mt-6 flex flex-col items-center gap-1"
              >
                <span className="flex h-13 w-13 h-13 items-center justify-center rounded-full bg-orange p-3.5 text-white shadow-lg shadow-orange/30">
                  <Icon className="h-6 w-6" strokeWidth={2} />
                </span>
                <span className="text-[11px] font-medium text-orange">{label}</span>
              </Link>
            );
          }
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-3 py-1 ${
                active ? "text-navy" : "text-muted"
              }`}
            >
              <Icon className="h-5.5 w-5.5" strokeWidth={active ? 2.25 : 1.75} />
              <span className="text-[11px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
