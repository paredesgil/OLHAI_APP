"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";

interface Props {
  categories: { id: string; name: string; slug: string }[];
  cities: { id: string; name: string }[];
}

export function SearchFilters({ categories, cities }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [aberto, setAberto] = useState(false);

  const [categoria, setCategoria] = useState(searchParams.get("categoria") ?? "");
  const [cidade, setCidade] = useState(searchParams.get("cidade") ?? "");
  const [condicao, setCondicao] = useState(searchParams.get("condicao") ?? "");
  const [precoMin, setPrecoMin] = useState(searchParams.get("precoMin") ?? "");
  const [precoMax, setPrecoMax] = useState(searchParams.get("precoMax") ?? "");

  const filtrosAtivos = [categoria, cidade, condicao, precoMin, precoMax].filter(
    Boolean
  ).length;

  function aplicarFiltros() {
    const params = new URLSearchParams(searchParams.toString());
    const set = (key: string, value: string) =>
      value ? params.set(key, value) : params.delete(key);

    set("categoria", categoria);
    set("cidade", cidade);
    set("condicao", condicao);
    set("precoMin", precoMin);
    set("precoMax", precoMax);

    router.push(`/busca?${params.toString()}`);
    setAberto(false);
  }

  function limparFiltros() {
    setCategoria("");
    setCidade("");
    setCondicao("");
    setPrecoMin("");
    setPrecoMax("");
    const params = new URLSearchParams(searchParams.toString());
    ["categoria", "cidade", "condicao", "precoMin", "precoMax"].forEach((k) =>
      params.delete(k)
    );
    router.push(`/busca?${params.toString()}`);
    setAberto(false);
  }

  return (
    <div className="mb-2">
      <button
        onClick={() => setAberto(true)}
        className="mb-1 flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-1.5 text-[12px] font-medium text-ink"
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Filtros
        {filtrosAtivos > 0 && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-orange text-[10px] font-bold text-white">
            {filtrosAtivos}
          </span>
        )}
      </button>

      {aberto && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40">
          <div className="w-full rounded-t-3xl bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[16px] font-extrabold text-ink">Filtros</h2>
              <button onClick={() => setAberto(false)} aria-label="Fechar">
                <X className="h-5 w-5 text-muted" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <p className="mb-1 text-[12px] font-semibold text-muted">
                  Categoria
                </p>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full rounded-2xl border border-line px-4 py-3 text-[14px]"
                >
                  <option value="">Todas</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="mb-1 text-[12px] font-semibold text-muted">
                  Cidade
                </p>
                <select
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  className="w-full rounded-2xl border border-line px-4 py-3 text-[14px]"
                >
                  <option value="">Todas</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="mb-1 text-[12px] font-semibold text-muted">
                  Condição
                </p>
                <div className="flex gap-2">
                  {[
                    { v: "", label: "Todas" },
                    { v: "new", label: "Novo" },
                    { v: "used", label: "Usado" },
                  ].map((opt) => (
                    <button
                      key={opt.v}
                      onClick={() => setCondicao(opt.v)}
                      className={`flex-1 rounded-2xl border py-2.5 text-[13px] font-semibold ${
                        condicao === opt.v
                          ? "border-orange bg-orange/10 text-orange"
                          : "border-line text-ink"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-1 text-[12px] font-semibold text-muted">
                  Preço (R$)
                </p>
                <div className="flex gap-2">
                  <input
                    inputMode="numeric"
                    placeholder="Mínimo"
                    value={precoMin}
                    onChange={(e) => setPrecoMin(e.target.value)}
                    className="w-1/2 rounded-2xl border border-line px-4 py-3 text-[14px]"
                  />
                  <input
                    inputMode="numeric"
                    placeholder="Máximo"
                    value={precoMax}
                    onChange={(e) => setPrecoMax(e.target.value)}
                    className="w-1/2 rounded-2xl border border-line px-4 py-3 text-[14px]"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={limparFiltros}
                className="flex-1 rounded-2xl border border-line py-3.5 text-[14px] font-semibold text-ink"
              >
                Limpar
              </button>
              <button
                onClick={aplicarFiltros}
                className="flex-1 rounded-2xl bg-orange py-3.5 text-[14px] font-bold text-white"
              >
                Aplicar filtros
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
