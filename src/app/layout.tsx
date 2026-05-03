import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import BottomNav from "@/components/layout/BottomNav";
import PWAInstaller from "@/components/layout/PWAInstaller";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "PinoCare - Ruang Sayang Dede & Abang",
  description:
    "Aplikasi penuh cinta dari Abang untuk Dede. Mood tracker, jurnal hati, dan pelukan virtual dari Pino 💕",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PinoCare",
  },
  icons: {
    icon: "/images/pino-main.png",
    apple: "/images/pino-main.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "var(--color-brand-pink)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${jakarta.variable}`} data-scroll-behavior="smooth">
      <body className="min-h-dvh flex flex-col">
        <main className="flex-1 safe-bottom">{children}</main>
        <BottomNav />
        <PWAInstaller />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,136,167,0.2)",
              borderRadius: "20px",
              color: "var(--color-text-main)",
              fontFamily: "var(--font-body)",
            },
          }}
        />
      </body>
    </html>
  );
}
