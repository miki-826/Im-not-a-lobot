import type { Metadata, Viewport } from "next";
import { Orbitron, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["500", "700", "800"],
});

const jbmono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jbmono",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "I am not a robot — 境界入国管理局",
  description:
    "人間界とAI世界の境界にある入国審査場。表情・声・愚痴・不完全さで、あなたが人間であることを証明せよ。",
};

export const viewport: Viewport = {
  themeColor: "#05070d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={`${orbitron.variable} ${jbmono.variable}`}>
      <body className="scanlines vignette min-h-dvh">{children}</body>
    </html>
  );
}
