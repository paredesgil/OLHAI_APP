import type { Metadata, Viewport } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";
import { TopNav } from "@/components/TopNav";
import { Footer } from "@/components/Footer";

// Poppins ExtraBold para títulos/logo, Medium como apoio — conforme o
// kit de marca OLHAÍ (paleta laranja #FF6A00 + navy #0D1B2A).
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

// Mantida como fallback/uso pontual onde já existia.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://olhaiapp.com.br"),
  title: "OLHAÍ — Negócio bom tá por perto.",
  description:
    "Marketplace de proximidade: encontre produtos novos e usados perto de você e negocie direto no WhatsApp.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "OLHAÍ",
  },
  // Imagem/dados usados quando o link é compartilhado no Facebook,
  // WhatsApp, etc. Sem isso, cada rede social tenta adivinhar uma
  // imagem sozinha — e geralmente corta errado.
  openGraph: {
    title: "OLHAÍ — Negócio bom tá por perto.",
    description:
      "Marketplace de proximidade: encontre produtos novos e usados perto de você e negocie direto no WhatsApp.",
    url: "https://olhaiapp.com.br",
    siteName: "OLHAÍ",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "OLHAÍ — Negócio bom tá por perto.",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OLHAÍ — Negócio bom tá por perto.",
    description:
      "Marketplace de proximidade: encontre produtos novos e usados perto de você e negocie direto no WhatsApp.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#ff6a00",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${poppins.variable} ${inter.variable} antialiased`}>
        <div className="flex min-h-screen flex-col bg-bg">
          <TopNav />
          <div className="flex-1 pb-20 md:pb-0">{children}</div>
          <Footer />
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
