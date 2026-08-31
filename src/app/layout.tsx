import type { Metadata, Viewport } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";

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
        <div className="mx-auto min-h-screen max-w-md bg-bg pb-20">
          {children}
        </div>
        <div className="mx-auto max-w-md">
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
