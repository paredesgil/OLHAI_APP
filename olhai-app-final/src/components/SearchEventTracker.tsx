"use client";

import { useEffect, useRef } from "react";
import { registerSearchEvent } from "@/lib/data/events";

export function SearchEventTracker({
  term,
  hasResults,
}: {
  term: string;
  hasResults: boolean;
}) {
  const ultimoRegistrado = useRef<string | null>(null);

  useEffect(() => {
    if (!term || ultimoRegistrado.current === term) return;
    ultimoRegistrado.current = term;
    registerSearchEvent(term, hasResults);
  }, [term, hasResults]);

  return null;
}
