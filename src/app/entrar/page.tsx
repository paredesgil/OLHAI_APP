"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfiguredClient } from "@/lib/supabase/config";
import { ensureProfileExists } from "@/lib/data/client-lookup";

export default function EntrarPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (!isSupabaseConfiguredClient()) {
      // Modo demonstração: sem Supabase conectado, apenas simula o login.
      router.push("/conta");
      return;
    }

    setCarregando(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });
    setCarregando(false);

    if (error) {
      setErro("E-mail ou senha inválidos.");
      return;
    }

    await ensureProfileExists();

    router.push("/conta");
    router.refresh();
  }

  return (
    <main className="flex min-h-[100dvh] flex-col px-6 pt-6">
      <Link
        href="/"
        className="mb-8 flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-line"
        aria-label="Voltar"
      >
        <ChevronLeft className="h-5 w-5 text-navy" />
      </Link>

      <div className="mb-10 flex flex-col items-center">
        <Logo className="h-8 w-auto" />
        <p className="mt-1 text-[13px] text-muted">Negócio bom tá por perto.</p>
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
        <input
          type="password"
          required
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="rounded-2xl border border-line bg-white px-4 py-3.5 text-[15px] outline-none ring-orange/30 focus:ring-2"
        />

        {erro && <p className="text-[13px] text-red-600">{erro}</p>}

        <button
          type="submit"
          disabled={carregando}
          className="mt-2 rounded-2xl bg-orange py-3.5 text-[15px] font-bold text-white shadow-md shadow-orange/25 transition active:scale-[0.98] disabled:opacity-60"
        >
          {carregando ? "Entrando..." : "Entrar"}
        </button>

        <Link
          href="/esqueci-senha"
          className="mt-1 text-center text-[13px] text-muted"
        >
          Esqueci minha senha
        </Link>
      </form>

      <div className="mt-auto mb-8 flex items-center justify-center gap-1 text-[14px]">
        <span className="text-muted">Ainda não tem conta?</span>
        <Link href="/cadastro" className="font-semibold text-orange">
          Criar conta
        </Link>
      </div>

      <p className="mb-6 text-center text-[12px] text-muted">
        Compradores não precisam criar conta para navegar e negociar.
      </p>
    </main>
  );
}
