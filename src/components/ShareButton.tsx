"use client";

import { Share2 } from "lucide-react";
import { registerShareEvent } from "@/lib/data/events";

export function ShareButton({
  productId,
  title,
  url,
  variant = "icon",
}: {
  productId: string;
  title: string;
  url: string;
  variant?: "icon" | "whatsapp";
}) {
  async function handleShare() {
    registerShareEvent(productId);

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // usuário cancelou o compartilhamento nativo — cai no fallback abaixo
      }
    }

    const text = `Olha isso no OLHAÍ: ${title} ${url}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  }

  if (variant === "whatsapp") {
    return (
      <button
        onClick={handleShare}
        className="flex items-center justify-center gap-2 rounded-2xl bg-whatsapp py-3.5 text-[15px] font-bold text-white shadow-md shadow-whatsapp/25"
      >
        <Share2 className="h-4.5 w-4.5" />
        Compartilhar no WhatsApp
      </button>
    );
  }

  return (
    <button
      onClick={handleShare}
      aria-label="Compartilhar"
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-navy"
    >
      <Share2 className="h-4.5 w-4.5" />
    </button>
  );
}
