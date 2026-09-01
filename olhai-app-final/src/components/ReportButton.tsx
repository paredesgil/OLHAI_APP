"use client";

import { useState } from "react";
import { Flag, X } from "lucide-react";
import { reportProduct } from "@/lib/data/events";

const MOTIVOS = [
  "Produto suspeito ou golpe",
  "Anúncio duplicado",
  "Preço ou descrição enganosa",
  "Conteúdo proibido",
  "Outro motivo",
];

export function ReportButton({ productId }: { productId: string }) {
  const [aberto, setAberto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function enviarDenuncia(motivo: string) {
    setEnviando(true);
    const { ok } = await reportProduct(productId, motivo);
    setEnviando(false);
    if (ok) {
      setEnviado(true);
      setTimeout(() => setAberto(false), 1500);
    }
  }

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        className="flex items-center gap-1.5 text-[12px] text-muted"
      >
        <Flag className="h-3.5 w-3.5" />
        Denunciar anúncio
      </button>

      {aberto && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40">
          <div className="w-full rounded-t-3xl bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[16px] font-extrabold text-ink">
                Por que você está denunciando?
              </h2>
              <button onClick={() => setAberto(false)} aria-label="Fechar">
                <X className="h-5 w-5 text-muted" />
              </button>
            </div>

            {enviado ? (
              <p className="py-4 text-center text-[14px] font-medium text-whatsapp-dark">
                Denúncia enviada. Obrigado por ajudar a manter o OLHAÍ seguro.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {MOTIVOS.map((motivo) => (
                  <button
                    key={motivo}
                    disabled={enviando}
                    onClick={() => enviarDenuncia(motivo)}
                    className="rounded-2xl border border-line px-4 py-3 text-left text-[14px] text-ink disabled:opacity-50"
                  >
                    {motivo}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
