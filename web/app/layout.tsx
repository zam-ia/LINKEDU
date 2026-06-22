import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Doce — Sistema operativo educativo",
  description: "Aula virtual, gestión institucional, carnets y certificados verificables para colegios, institutos y centros de capacitación.",
  keywords: ["aula virtual", "gestión educativa", "certificados con QR", "carnets escolares", "software educativo"],
  authors: [{ name: "Doce" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-[#f7f7f5] text-black">{children}</body>
    </html>
  );
}
