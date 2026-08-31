"use client";

import { useEffect, useRef } from "react";
import { registerProductView } from "@/lib/data/events";

// Registra 1 visualização por carregamento de página de produto.
export function ProductViewTracker({ productId }: { productId: string }) {
  const registrado = useRef(false);

  useEffect(() => {
    if (registrado.current) return;
    registrado.current = true;
    registerProductView(productId);
  }, [productId]);

  return null;
}
