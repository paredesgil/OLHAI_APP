"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfiguredClient } from "@/lib/supabase/config";

export function FavoriteButton({
  productId,
  initialFavorited = false,
  variant = "large",
}: {
  productId: string;
  initialFavorited?: boolean;
  variant?: "large" | "small";
}) {
  const router = useRouter();
  const [favorito, setFavorito] = useState(initialFavorited);
  const [carregando, setCarregando] = useState(false);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!isSupabaseConfiguredClient()) {
      setFavorito((v) => !v);
      return;
    }

    setCarregando(true);
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      setCarregando(false);
      router.push("/entrar");
      return;
    }

    if (favorito) {
      await supabase
        .from("favorites")
        .delete()
        .eq("product_id", productId)
        .eq("user_id", userData.user.id);
      setFavorito(false);
    } else {
      await supabase
        .from("favorites")
        .insert({ product_id: productId, user_id: userData.user.id });
      setFavorito(true);
    }
    setCarregando(false);
  }

  const sizeClasses = variant === "large" ? "h-10 w-10" : "h-7 w-7";
  const iconSize = variant === "large" ? "h-4.5 w-4.5" : "h-4 w-4";

  return (
    <button
      onClick={handleClick}
      disabled={carregando}
      aria-label={favorito ? "Remover dos favoritos" : "Favoritar anúncio"}
      className={`flex ${sizeClasses} items-center justify-center rounded-full bg-white/90 shadow-sm ${
        favorito ? "text-orange" : "text-navy"
      }`}
    >
      <Heart className={iconSize} fill={favorito ? "currentColor" : "none"} />
    </button>
  );
}
