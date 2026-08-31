"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfiguredClient } from "@/lib/supabase/config";
import { useLookups } from "@/lib/data/client-lookup";
import { isValidBrazilianPhone, formatBrazilianPhone } from "@/lib/utils";

type Etapa1 = { nome: string; email: string; whatsapp: string; senha: string };
type Etapa2 = { tipo: "particular" | "empresa"; cidadeId: string };

export default function CadastroPage() {
  const router = useRouter();
  const { cities } = useLookups();
  const [passo, setPasso] = useState<1 | 2>(1);
  const [etapa1, setEtapa1] = useState<Etapa1>({
    nome: "",
    email: "",
    whatsapp: "",
    senha: "",
  });
  const [etapa2, setEtapa2] = useState<Etapa2>({
    tipo: "particular",
    cidadeId: "",
  });
  const [erro, setErro] = useState<string | null>(null);
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [carregando, setCarregando] = useState(false);

  // Assim que as cidades reais carregam, seleciona a primeira por padrão
  // (o select abaixo é controlado, então precisa de um valor).
  if (!etapa2.cidadeId && cities.length > 0) {
    setEtapa2((prev) => ({ ...prev, cidadeId: cities[0].id }));
  }

  async function finalizarCadastro() {
    setErro(null);

    if (!aceitouTermos) {
      setErro("Você precisa aceitar os Termos de Uso para continuar.");
      return;
    }

    if (!isSupabaseConfiguredClient()) {
      router.push("/conta");
      return;
    }

    setCarregando(true);
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email: etapa1.email,
      password: etapa1.senha,
      options: {
        data: {
          display_name: etapa1.nome,
          whatsapp: etapa1.whatsapp,
          city_id: etapa2.cidadeId,
          seller_type: etapa2.tipo,
        },
      },
    });

    if (error || !data.user) {
      setCarregando(false);
      setErro(error?.message ?? "Não foi possível criar sua conta.");
      return;
    }

    // Se a confirmação de e-mail estiver ativada no seu projeto Supabase
    // (padrão em projetos novos), o signUp cria o usuário mas NÃO abre
    // sessão até o e-mail ser confirmado — e sem sessão, o insert abaixo
    // é bloqueado pela RLS (a policy exige auth.uid() = id).
    if (!data.session) {
      setCarregando(false);
      setErro(
        "Conta criada! Verifique seu e-mail para confirmar antes de entrar (Authentication → Providers → Email, no Supabase, controla essa exigência)."
      );
      return;
    }

    // Cria o registro correspondente em `profiles` (dados comerciais/públicos),
    // conforme o princípio de identidade da seção 25.2 do Documento Mestre.
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      display_name: etapa1.nome,
      whatsapp: etapa1.whatsapp,
      city_id: etapa2.cidadeId,
      seller_type: etapa2.tipo,
    });

    setCarregando(false);

    if (profileError) {
      setErro(`Conta criada, mas houve um erro ao salvar seu perfil: ${profileError.message}`);
      return;
    }

    router.push("/conta");
    router.refresh();
  }

  return (
    <main className="flex min-h-[100dvh] flex-col px-6 pt-6">
      <button
        onClick={() => (passo === 1 ? router.push("/entrar") : setPasso(1))}
        className="mb-6 flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-line"
        aria-label="Voltar"
      >
        <ChevronLeft className="h-5 w-5 text-navy" />
      </button>

      <div className="mb-8 flex flex-col items-center">
        <Logo className="h-7 w-auto" />
        <p className="mt-2 text-[13px] font-medium text-muted">
          Etapa {passo} de 2
        </p>
        <div className="mt-2 flex gap-1.5">
          <span className={`h-1.5 w-8 rounded-full ${passo >= 1 ? "bg-orange" : "bg-line"}`} />
          <span className={`h-1.5 w-8 rounded-full ${passo >= 2 ? "bg-orange" : "bg-line"}`} />
        </div>
      </div>

      {passo === 1 ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!isValidBrazilianPhone(etapa1.whatsapp)) {
              setErro("Digite um WhatsApp válido, com DDD (ex: 67999990000).");
              return;
            }
            setErro(null);
            setPasso(2);
          }}
          className="flex flex-col gap-3"
        >
          <input
            required
            placeholder="Nome"
            value={etapa1.nome}
            onChange={(e) => setEtapa1({ ...etapa1, nome: e.target.value })}
            className="rounded-2xl border border-line bg-white px-4 py-3.5 text-[15px] outline-none ring-orange/30 focus:ring-2"
          />
          <input
            required
            type="email"
            placeholder="E-mail"
            value={etapa1.email}
            onChange={(e) => setEtapa1({ ...etapa1, email: e.target.value })}
            className="rounded-2xl border border-line bg-white px-4 py-3.5 text-[15px] outline-none ring-orange/30 focus:ring-2"
          />
          <input
            required
            inputMode="numeric"
            placeholder="WhatsApp (com DDD)"
            value={etapa1.whatsapp}
            onChange={(e) =>
              setEtapa1({ ...etapa1, whatsapp: formatBrazilianPhone(e.target.value) })
            }
            maxLength={15}
            className="rounded-2xl border border-line bg-white px-4 py-3.5 text-[15px] outline-none ring-orange/30 focus:ring-2"
          />
          <input
            required
            type="password"
            placeholder="Senha"
            value={etapa1.senha}
            onChange={(e) => setEtapa1({ ...etapa1, senha: e.target.value })}
            className="rounded-2xl border border-line bg-white px-4 py-3.5 text-[15px] outline-none ring-orange/30 focus:ring-2"
          />
          {erro && <p className="text-[13px] text-red-600">{erro}</p>}
          <button
            type="submit"
            className="mt-2 rounded-2xl bg-orange py-3.5 text-[15px] font-bold text-white shadow-md shadow-orange/25 transition active:scale-[0.98]"
          >
            Continuar
          </button>
        </form>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="mb-1 text-[13px] font-semibold text-ink">
            Você é...
          </p>
          <div className="flex gap-2">
            {(["particular", "empresa"] as const).map((tipo) => (
              <button
                key={tipo}
                type="button"
                onClick={() => setEtapa2({ ...etapa2, tipo })}
                className={`flex-1 rounded-2xl border py-3 text-[14px] font-semibold capitalize ${
                  etapa2.tipo === tipo
                    ? "border-orange bg-orange/10 text-orange"
                    : "border-line bg-white text-ink"
                }`}
              >
                {tipo === "particular" ? "Pessoa física" : "Empresa"}
              </button>
            ))}
          </div>

          <p className="mb-1 mt-2 text-[13px] font-semibold text-ink">
            Cidade
          </p>
          <select
            value={etapa2.cidadeId}
            onChange={(e) => setEtapa2({ ...etapa2, cidadeId: e.target.value })}
            className="rounded-2xl border border-line bg-white px-4 py-3.5 text-[15px] outline-none"
          >
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <label className="mt-2 flex items-start gap-2 text-[12.5px] text-muted">
            <input
              type="checkbox"
              checked={aceitouTermos}
              onChange={(e) => setAceitouTermos(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-orange"
            />
            <span>
              Li e concordo com os{" "}
              <Link href="/termos" className="font-semibold text-orange" target="_blank">
                Termos de Uso
              </Link>{" "}
              e a{" "}
              <Link href="/privacidade" className="font-semibold text-orange" target="_blank">
                Política de Privacidade
              </Link>{" "}
              do OLHAÍ.
            </span>
          </label>

          {erro && <p className="text-[13px] text-red-600">{erro}</p>}

          <button
            type="button"
            disabled={carregando || !aceitouTermos}
            onClick={finalizarCadastro}
            className="mt-2 rounded-2xl bg-orange py-3.5 text-[15px] font-bold text-white shadow-md shadow-orange/25 transition active:scale-[0.98] disabled:opacity-60"
          >
            {carregando ? "Criando conta..." : "Criar minha conta"}
          </button>
        </div>
      )}

      <div className="mt-8 flex items-center justify-center gap-1 text-[14px]">
        <span className="text-muted">Já tem conta?</span>
        <Link href="/entrar" className="font-semibold text-orange">
          Entrar
        </Link>
      </div>
    </main>
  );
}
