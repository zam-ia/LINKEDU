import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Linkedu - Plataforma Educativa Integral (Intranet SaaS)",
  description: "Centraliza la gestión académica, administrativa y financiera de tu colegio en un solo ecosistema moderno. Reemplaza WhatsApp, papeles y hojas de cálculo.",
  keywords: ["intranet escolar", "colegio privado", "plataforma educativa", "SaaS colegios", "gestión académica"],
  authors: [{ name: "Linkedu Dev Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-full flex flex-col bg-[#F8F9FB] text-[#111827]">
        {children}
      </body>
    </html>
  );
}

