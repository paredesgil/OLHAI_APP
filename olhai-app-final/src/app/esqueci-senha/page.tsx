"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfiguredClient } from "@/lib/supabase/config";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (!isSupabaseConfiguredClient()) {
      setEnviado(true);
      return;
    }

    setEnviando(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    setEnviando(false);

    if (error) {
      setErro("Não foi possível enviar o e-mail. Confira o endereço digitado.");
      return;
    }
    setEnviado(true);
  }

  return (
    <main className="flex min-h-[100dvh] flex-col px-6 pt-6">
      <Link
        href="/entrar"
        className="mb-8 flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-line"
        aria-label="Voltar"
      >
        <ChevronLeft className="h-5 w-5 text-navy" />
      </Link>

      {enviado ? (
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp/10 text-whatsapp-dark">
            <Mail className="h-6 w-6" />
          </span>
          <p className="text-[16px] font-bold text-ink">Confira seu e-mail</p>
          <p className="text-[13px] text-muted">
            Enviamos um link para {email || "o seu e-mail"} com as instruções
            para criar uma nova senha.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <p className="text-[18px] font-extrabold text-ink">
              Esqueceu sua senha?
            </p>
            <p className="mt-1 text-[13px] text-muted">
              Digite seu e-mail e enviaremos um link para você criar uma nova.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              required
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-2xl border border-line bg-white px-4 py-3.5 text-[15px] outline-none ring-orange/30 focus:ring-2"
            />

            {erro && <p className="text-[13px] text-red-600">{erro}</p>}

            <button
              type="submit"
              disabled={enviando}
              className="mt-2 rounded-2xl bg-orange py-3.5 text-[15px] font-bold text-white shadow-md shadow-orange/25 disabled:opacity-60"
            >
              {enviando ? "Enviando..." : "Enviar link"}
            </button>
          </form>
        </>
      )}
    </main>
  );
}
