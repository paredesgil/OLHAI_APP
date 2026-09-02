"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, Trash2, RotateCcw, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { ReportItem } from "@/lib/data/moderation";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  reviewing: "Em análise",
  resolved: "Resolvida",
  dismissed: "Descartada",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-orange/10 text-orange",
  reviewing: "bg-blue-100 text-blue-700",
  resolved: "bg-whatsapp/10 text-whatsapp-dark",
  dismissed: "bg-line text-muted",
};

export function ModerationPanel({ initialReports }: { initialReports: ReportItem[] }) {
  const [reports, setReports] = useState(initialReports);
  const [filtro, setFiltro] = useState<"pending" | "all">("pending");
  const [carregandoId, setCarregandoId] = useState<string | null>(null);

  const visiveis = filtro === "pending"
    ? reports.filter((r) => r.status === "pending")
    : reports;

  async function atualizarDenuncia(id: string, status: ReportItem["status"]) {
    setCarregandoId(id);
    const supabase = createClient();
    await supabase.from("reports").update({ status }).eq("id", id);
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    setCarregandoId(null);
  }

  async function alterarAnuncio(report: ReportItem, novoStatus: "removed" | "active") {
    setCarregandoId(report.id);
    const supabase = createClient();
    await supabase.from("products").update({ status: novoStatus }).eq("id", report.productId);
    setReports((prev) =>
      prev.map((r) => (r.id === report.id ? { ...r, productStatus: novoStatus } : r))
    );
    setCarregandoId(null);
  }

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setFiltro("pending")}
          className={`rounded-full px-4 py-1.5 text-[13px] font-semibold ${
            filtro === "pending" ? "bg-orange text-white" : "border border-line text-ink"
          }`}
        >
          Pendentes ({reports.filter((r) => r.status === "pending").length})
        </button>
        <button
          onClick={() => setFiltro("all")}
          className={`rounded-full px-4 py-1.5 text-[13px] font-semibold ${
            filtro === "all" ? "bg-orange text-white" : "border border-line text-ink"
          }`}
        >
          Todas ({reports.length})
        </button>
      </div>

      {visiveis.length === 0 ? (
        <p className="py-12 text-center text-[14px] text-muted">
          Nenhuma denúncia por aqui.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {visiveis.map((r) => (
            <div key={r.id} className="rounded-2xl border border-line bg-white p-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <p className="text-[14px] font-semibold text-ink">{r.productTitle}</p>
                  <p className="text-[12px] text-muted">Vendedor: {r.sellerName}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_COLOR[r.status]}`}>
                  {STATUS_LABEL[r.status]}
                </span>
              </div>

              <p className="mb-3 rounded-xl bg-bg px-3 py-2 text-[13px] text-ink/85">
                {r.reason}
              </p>

              <div className="flex flex-wrap items-center gap-3 border-t border-line pt-2 text-[12px]">
                {r.productSlug && (
                  <Link
                    href={`/produto/${r.productSlug}`}
                    target="_blank"
                    className="flex items-center gap-1 font-medium text-navy"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Ver anúncio
                  </Link>
                )}

                {r.productStatus === "removed" ? (
                  <button
                    disabled={carregandoId === r.id}
                    onClick={() => alterarAnuncio(r, "active")}
                    className="flex items-center gap-1 font-medium text-whatsapp-dark disabled:opacity-50"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Reativar anúncio
                  </button>
                ) : (
                  <button
                    disabled={carregandoId === r.id}
                    onClick={() => alterarAnuncio(r, "removed")}
                    className="flex items-center gap-1 font-medium text-red-600 disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remover anúncio
                  </button>
                )}

                {r.status !== "resolved" && (
                  <button
                    disabled={carregandoId === r.id}
                    onClick={() => atualizarDenuncia(r.id, "resolved")}
                    className="flex items-center gap-1 font-medium text-navy disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Marcar resolvida
                  </button>
                )}

                {r.status !== "dismissed" && (
                  <button
                    disabled={carregandoId === r.id}
                    onClick={() => atualizarDenuncia(r.id, "dismissed")}
                    className="flex items-center gap-1 font-medium text-muted disabled:opacity-50"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Descartar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
