"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setSalvando(true);
    const supabase = createClient();
    // O Supabase já abre uma sessão temporária de recuperação assim que
    // a pessoa clica no link do e-mail (o próprio link carrega o token).
    const { error } = await supabase.auth.updateUser({ password: senha });
    setSalvando(false);

    if (error) {
      setErro(
        "Não foi possível redefinir a senha. O link pode ter expirado — solicite um novo em 'Esqueci minha senha'."
      );
      return;
    }

    setSucesso(true);
    setTimeout(() => router.push("/entrar"), 2000);
  }

  return (
    <main className="flex min-h-[100dvh] flex-col px-6 pt-10">
      <div className="mb-10 flex flex-col items-center">
        <Logo className="h-8 w-auto" />
      </div>

      {sucesso ? (
        <p className="text-center text-[15px] font-semibold text-whatsapp-dark">
          Senha redefinida! Levando você para o login...
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <p className="mb-2 text-[15px] font-bold text-ink">
            Crie sua nova senha
          </p>

          <input
            type="password"
            required
            placeholder="Nova senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="rounded-2xl border border-line bg-white px-4 py-3.5 text-[15px] outline-none ring-orange/30 focus:ring-2"
          />
          <input
            type="password"
            required
            placeholder="Confirmar nova senha"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            className="rounded-2xl border border-line bg-white px-4 py-3.5 text-[15px] outline-none ring-orange/30 focus:ring-2"
          />

          {erro && <p className="text-[13px] text-red-600">{erro}</p>}

          <button
            type="submit"
            disabled={salvando}
            className="mt-2 rounded-2xl bg-orange py-3.5 text-[15px] font-bold text-white shadow-md shadow-orange/25 disabled:opacity-60"
          >
            {salvando ? "Salvando..." : "Salvar nova senha"}
          </button>
        </form>
      )}
    </main>
  );
}
