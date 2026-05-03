"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, Info, Smartphone, Check } from "lucide-react";
import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function MePage() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    const installedTimer = window.setTimeout(() => {
      if (
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone: boolean }).standalone
      ) {
        setIsInstalled(true);
      }
    }, 0);

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => {
      window.clearTimeout(installedTimer);
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) {
      // Fallback: show manual instructions
      alert(
        "Untuk install PinoCare:\n\n" +
          "📱 Android: Tap menu ⋮ → 'Add to Home Screen'\n" +
          "🍎 iPhone: Tap Share → 'Add to Home Screen'"
      );
      return;
    }
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
      setInstallPrompt(null);
    }
  };

  return (
    <div className="px-5 pt-6 pb-4 max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1
          className="text-xl font-bold mb-6"
          style={{ color: "var(--color-text-main)", fontFamily: "var(--font-heading)" }}
        >
          Profil 💕
        </h1>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 flex flex-col items-center mb-6"
      >
        <motion.div
          animate={{ y: [0, -8, 0], rotate: [0, -2, 2, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <Image
            src="/images/pino-main.png"
            alt="Pino"
            width={120}
            height={120}
            className="rounded-3xl mb-4 shadow-lg shadow-pink-200/50"
          />
        </motion.div>
        <h2
          className="text-lg font-bold mb-1"
          style={{ color: "var(--color-text-main)", fontFamily: "var(--font-heading)" }}
        >
          Wanita Tercantik
        </h2>
        <p
          className="text-sm"
          style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}
        >
          Masa depan abang 💗
        </p>
      </motion.div>

      {/* Menu Items */}
      <div className="space-y-3">
        {/* Install Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, type: "spring" }}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.9)" }}
          onClick={handleInstall}
          className="glass-card px-5 py-4 flex items-center gap-4 w-full text-left"
        >
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{
              backgroundColor: isInstalled
                ? "rgba(76,175,80,0.1)"
                : "rgba(255,136,167,0.1)",
            }}
          >
            {isInstalled ? (
              <Check size={18} color="#4CAF50" />
            ) : (
              <Smartphone size={18} color="var(--color-brand-pink)" />
            )}
          </div>
          <div className="flex-1">
            <p
              className="text-sm font-semibold"
              style={{
                color: "var(--color-text-main)",
                fontFamily: "var(--font-heading)",
              }}
            >
              {isInstalled ? "Sudah Terinstall ✅" : "Install Aplikasi"}
            </p>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {isInstalled
                ? "PinoCare sudah ada di layar utama"
                : "Tambahkan ke layar utama HP"}
            </p>
          </div>
        </motion.button>

        {/* About */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, type: "spring" }}
          whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.9)" }}
          className="glass-card px-5 py-4 flex items-center gap-4"
        >
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: "rgba(195,177,225,0.15)" }}
          >
            <Info size={18} color="#C3B1E1" />
          </div>
          <div className="flex-1">
            <p
              className="text-sm font-semibold"
              style={{
                color: "var(--color-text-main)",
                fontFamily: "var(--font-heading)",
              }}
            >
              Tentang PinoCare
            </p>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              Versi 1.0.0
            </p>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-10 text-center"
      >
        <div className="flex items-center justify-center gap-1 mb-2">
          <span
            className="text-sm"
            style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}
          >
            Made with
          </span>
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Heart size={14} color="var(--color-brand-pink)" fill="var(--color-brand-pink)" />
          </motion.div>
          <span
            className="text-sm"
            style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}
          >
            buat dede
          </span>
        </div>
        <p className="text-xs" style={{ color: "#C4ABAB" }}>
          © 2026 PinoCare • Dari abang untuk dede 💗
        </p>
      </motion.div>
    </div>
  );
}
