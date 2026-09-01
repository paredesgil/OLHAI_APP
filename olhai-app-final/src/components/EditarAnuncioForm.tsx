"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfiguredClient } from "@/lib/supabase/config";

interface ProductEdit {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: "new" | "used";
  status: string;
}

export function EditarAnuncioForm({ product }: { product: ProductEdit }) {
  const router = useRouter();
  const [titulo, setTitulo] = useState(product.title);
  const [descricao, setDescricao] = useState(product.description);
  const [preco, setPreco] = useState(String(product.price));
  const [condicao, setCondicao] = useState<"new" | "used">(product.condition);
  const [pausado, setPausado] = useState(product.status === "paused");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar() {
    setErro(null);
    setSalvando(true);

    if (!isSupabaseConfiguredClient()) {
      await new Promise((r) => setTimeout(r, 400));
      setSalvando(false);
      router.push("/conta");
      return;
    }

    const supabase = createClient();
    const { error } = await supabase
      .from("products")
      .update({
        title: titulo,
        description: descricao,
        price: Number(preco.replace(",", ".")),
        condition: condicao,
        status: pausado ? "paused" : "active",
      })
      .eq("id", product.id);

    setSalvando(false);

    if (error) {
      setErro("Não foi possível salvar as alterações.");
      return;
    }
    router.push("/conta");
    router.refresh();
  }

  return (
    <main className="flex min-h-[100dvh] flex-col px-4 pt-5 pb-8">
      <header className="mb-6 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-line"
          aria-label="Voltar"
        >
          <ChevronLeft className="h-5 w-5 text-navy" />
        </button>
        <h1 className="text-[16px] font-extrabold text-ink">Editar anúncio</h1>
      </header>

      <div className="flex flex-1 flex-col gap-3">
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="rounded-2xl border border-line bg-white px-4 py-3.5 text-[15px] outline-none ring-orange/30 focus:ring-2"
        />

        <div className="flex gap-2">
          {(["new", "used"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCondicao(c)}
              className={`flex-1 rounded-2xl border py-3 text-[14px] font-semibold ${
                condicao === c
                  ? "border-orange bg-orange/10 text-orange"
                  : "border-line bg-white text-ink"
              }`}
            >
              {c === "new" ? "Novo" : "Usado"}
            </button>
          ))}
        </div>

        <input
          inputMode="decimal"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          className="rounded-2xl border border-line bg-white px-4 py-3.5 text-[15px] outline-none ring-orange/30 focus:ring-2"
        />

        <textarea
          rows={4}
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="resize-none rounded-2xl border border-line bg-white px-4 py-3.5 text-[15px] outline-none ring-orange/30 focus:ring-2"
        />

        <button
          type="button"
          onClick={() => setPausado((v) => !v)}
          className={`flex items-center justify-between rounded-2xl border px-4 py-3.5 text-[14px] font-semibold ${
            pausado ? "border-orange/40 bg-orange/5 text-orange" : "border-line bg-white text-ink"
          }`}
        >
          Anúncio pausado
          <span
            className={`h-5 w-9 rounded-full transition ${pausado ? "bg-orange" : "bg-line"}`}
          >
            <span
              className={`block h-4 w-4 translate-y-0.5 rounded-full bg-white transition ${
                pausado ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </span>
        </button>

        {erro && <p className="text-[13px] text-red-600">{erro}</p>}

        <button
          onClick={salvar}
          disabled={salvando}
          className="mt-auto rounded-2xl bg-orange py-3.5 text-[15px] font-bold text-white shadow-md shadow-orange/25 transition active:scale-[0.98] disabled:opacity-60"
        >
          {salvando ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>
    </main>
  );
}
