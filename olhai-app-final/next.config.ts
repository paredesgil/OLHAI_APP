import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Fotos de demonstração (remova depois de conectar o Storage real)
      { protocol: "https", hostname: "images.unsplash.com" },
      // Substitua pelo host do seu bucket product-images no Supabase Storage,
      // ex: SEU-PROJETO.supabase.co
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
