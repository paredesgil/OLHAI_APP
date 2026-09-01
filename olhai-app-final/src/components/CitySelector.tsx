"use client";

import { useState, useEffect } from "react";
import { ChevronDown, MapPin, X, Globe } from "lucide-react";
import { useLookups } from "@/lib/data/client-lookup";

const STORAGE_KEY = "olhai_city";
const TODAS = { id: "ALL", name: "Todas as cidades" };

export function CitySelector() {
  const { cities } = useLookups();
  const [aberto, setAberto] = useState(false);
  const [selecionada, setSelecionada] = useState<{ id: string; name: string } | null>(
    null
  );

  useEffect(() => {
    const salva = window.localStorage.getItem(STORAGE_KEY);
    if (salva) {
      try {
        setSelecionada(JSON.parse(salva));
      } catch {
        // ignora valor corrompido
      }
    }
  }, []);

  // Sem seleção salva = mostrando tudo, então o rótulo já reflete isso
  // (antes caía silenciosamente na primeira cidade da lista, o que não
  // batia com o que a Home realmente exibia).
  const cidadeExibida = selecionada?.name ?? TODAS.name;

  function escolher(cidade: { id: string; name: string }) {
    setSelecionada(cidade);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cidade));

    if (cidade.id === TODAS.id) {
      // Remove o cookie de filtro — a Home volta a mostrar tudo.
      document.cookie = "olhai_city_id=; path=/; max-age=0";
    } else {
      // Cookie (não-httpOnly, só preferência de UI) para a Home — que
      // roda no servidor — conseguir filtrar os destaques pela cidade.
      document.cookie = `olhai_city_id=${cidade.id}; path=/; max-age=${60 * 60 * 24 * 365}`;
    }

    setAberto(false);
    window.location.reload();
  }

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        className="inline-flex items-center gap-1 text-[13px] font-medium text-navy"
      >
        <MapPin className="h-4 w-4 text-orange" />
        {cidadeExibida}
        <ChevronDown className="h-3.5 w-3.5 text-muted" />
      </button>

      {aberto && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40">
          <div className="w-full rounded-t-3xl bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[16px] font-extrabold text-ink">
                Escolha sua cidade
              </h2>
              <button onClick={() => setAberto(false)} aria-label="Fechar">
                <X className="h-5 w-5 text-muted" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => escolher(TODAS)}
                className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-left text-[14px] font-medium ${
                  cidadeExibida === TODAS.name
                    ? "border-orange bg-orange/5 text-orange"
                    : "border-line text-ink"
                }`}
              >
                <Globe className="h-4 w-4" />
                {TODAS.name}
              </button>

              {cities.map((c) => (
                <button
                  key={c.id}
                  onClick={() => escolher({ id: c.id, name: c.name })}
                  className={`rounded-2xl border px-4 py-3 text-left text-[14px] font-medium ${
                    cidadeExibida === c.name
                      ? "border-orange bg-orange/5 text-orange"
                      : "border-line text-ink"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
