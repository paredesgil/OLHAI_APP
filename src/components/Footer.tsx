import Link from "next/link";
import { Logo } from "@/components/Logo";

// Rodapé — só aparece em telas de desktop (no celular, a navegação
// inferior já cumpre esse papel e o espaço é mais precioso).
export function Footer() {
  return (
    <footer className="hidden border-t border-line bg-white md:block">
      <div className="mx-auto max-w-6xl px-8 py-10">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div>
            <Logo compact className="h-6 w-auto" />
            <p className="mt-2 max-w-[260px] text-[13px] text-muted">
              Marketplace regional: encontre produtos perto de você e
              negocie direto no WhatsApp.
            </p>
          </div>

          <div className="flex gap-16">
            <div>
              <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-muted">
                OLHAÍ
              </p>
              <ul className="flex flex-col gap-2 text-[14px] text-ink/80">
                <li><Link href="/" className="hover:text-orange">Início</Link></li>
                <li><Link href="/busca" className="hover:text-orange">Buscar</Link></li>
                <li><Link href="/vender" className="hover:text-orange">Vender</Link></li>
              </ul>
            </div>

            <div>
              <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-muted">
                Legal
              </p>
              <ul className="flex flex-col gap-2 text-[14px] text-ink/80">
                <li><Link href="/termos" className="hover:text-orange">Termos de Uso</Link></li>
                <li><Link href="/privacidade" className="hover:text-orange">Política de Privacidade</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-line pt-6 text-[12px] text-muted">
          © {new Date().getFullYear()} OLHAÍ. Negócio bom tá por perto.
        </div>
      </div>
    </footer>
  );
}
