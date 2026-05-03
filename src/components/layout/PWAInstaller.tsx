"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("SW registered"))
        .catch(() => console.log("SW registration failed"));
    }

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show install banner if not dismissed before
      const dismissed = localStorage.getItem("pinocare_install_dismissed");
      if (!dismissed) {
        setTimeout(() => setShowBanner(true), 3000); // Show after 3s
      }
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pinocare_install_dismissed", "true");
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
          className="fixed z-[70] left-4 right-4 flex items-center gap-3 px-5 py-4"
          style={{
            bottom: "calc(90px + env(safe-area-inset-bottom, 0px))",
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(16px)",
            borderRadius: 24,
            border: "1px solid rgba(255,136,167,0.2)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          }}
        >
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, var(--color-brand-pink), var(--color-brand-pink-dark))",
            }}
          >
            <Download size={20} color="white" />
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-bold"
              style={{
                color: "var(--color-text-main)",
                fontFamily: "var(--font-heading)",
              }}
            >
              Install PinoCare
            </p>
            <p
              className="text-xs"
              style={{
                color: "var(--color-text-muted)",
                fontFamily: "var(--font-body)",
              }}
            >
              Tambahkan ke layar utama HP 💕
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleInstall}
            className="px-4 py-2 rounded-2xl text-xs font-bold text-white flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, var(--color-brand-pink), var(--color-brand-pink-dark))",
            }}
          >
            Install
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={handleDismiss}
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "rgba(0,0,0,0.05)" }}
          >
            <X size={14} color="var(--color-text-muted)" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
