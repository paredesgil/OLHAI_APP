"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RotateCcw, CheckCircle, Share2, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfiguredClient } from "@/lib/supabase/config";
import { registerShareEvent } from "@/lib/data/events";

export function ProductActions({
  productId,
  slug,
  title,
  status,
}: {
  productId: string;
  slug: string;
  title: string;
  status: string;
}) {
  const router = useRouter();
  const [carregando, setCarregando] = useState<string | null>(null);

  async function atualizarStatus(
    novoStatus: "sold" | "active",
    extra?: Record<string, unknown>
  ) {
    if (!isSupabaseConfiguredClient()) {
      router.refresh();
      return;
    }
    setCarregando(novoStatus);
    const supabase = createClient();
    await supabase
      .from("products")
      .update({ status: novoStatus, ...extra })
      .eq("id", productId);
    setCarregando(null);
    router.refresh();
  }

  async function renovar() {
    await atualizarStatus("active", {
      published_at: new Date().toISOString(),
    });
  }

  async function compartilhar() {
    registerShareEvent(productId);
    const url = `${window.location.origin}/produto/${slug}`;
    const text = `Olha isso no OLHAÍ: ${title} ${url}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // cai no fallback
      }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  return (
    <div className="mt-2 flex flex-wrap gap-2 border-t border-line pt-2">
      <Link
        href={`/vender/editar/${productId}`}
        className="flex items-center gap-1 text-[11px] font-medium text-navy"
      >
        <Pencil className="h-3.5 w-3.5" /> Editar
      </Link>

      {status !== "sold" && (
        <button
          onClick={() => atualizarStatus("sold")}
          disabled={carregando !== null}
          className="flex items-center gap-1 text-[11px] font-medium text-whatsapp-dark disabled:opacity-50"
        >
          <CheckCircle className="h-3.5 w-3.5" /> Marcar como vendido
        </button>
      )}

      <button
        onClick={renovar}
        disabled={carregando !== null}
        className="flex items-center gap-1 text-[11px] font-medium text-orange disabled:opacity-50"
      >
        <RotateCcw className="h-3.5 w-3.5" /> Renovar
      </button>

      <button
        onClick={compartilhar}
        className="flex items-center gap-1 text-[11px] font-medium text-muted"
      >
        <Share2 className="h-3.5 w-3.5" /> Compartilhar
      </button>
    </div>
  );
}
