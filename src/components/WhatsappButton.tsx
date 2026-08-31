"use client";

import { MessageCircle } from "lucide-react";
import { registerWhatsappClick } from "@/lib/data/events";

function buildWhatsappLink(whatsapp: string, message: string) {
  const digits = whatsapp.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function WhatsappButton({
  productId,
  whatsapp,
  productTitle,
}: {
  productId: string;
  whatsapp: string;
  productTitle: string;
}) {
  const message = `Olá! Vi seu anúncio "${productTitle}" no OLHAÍ. Ainda está disponível?`;

  const handleClick = () => {
    registerWhatsappClick(productId);
    window.open(buildWhatsappLink(whatsapp, message), "_blank");
  };

  return (
    <button
      onClick={handleClick}
      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-whatsapp py-4 text-[16px] font-bold text-white shadow-lg shadow-whatsapp/30 transition active:scale-[0.98]"
    >
      <MessageCircle className="h-5 w-5" fill="white" strokeWidth={0} />
      Chamar no WhatsApp
    </button>
  );
}
