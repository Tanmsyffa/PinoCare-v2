"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, MessageCircleHeart } from "lucide-react";
import { MOOD_TYPES, getGreeting, getRandomQuote } from "@/lib/constants";
import { useState, useEffect } from "react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const [quote, setQuote] = useState("");
  const [greeting, setGreeting] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const contentTimer = window.setTimeout(() => {
      setQuote(getRandomQuote());
      setGreeting(getGreeting());
    }, 0);

    // Cek apakah popup sudah pernah muncul di sesi ini
    const hasSeenWelcome = sessionStorage.getItem("pinocare_welcomed");
    let welcomeTimer: number | undefined;
    if (!hasSeenWelcome) {
      // Kasih delay sedikit biar natural
      welcomeTimer = window.setTimeout(() => {
        setShowWelcome(true);
      }, 800);
    }

    return () => {
      window.clearTimeout(contentTimer);
      if (welcomeTimer !== undefined) window.clearTimeout(welcomeTimer);
    };
  }, []);

  const closeWelcome = () => {
    setShowWelcome(false);
    sessionStorage.setItem("pinocare_welcomed", "true");
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="px-5 pt-6 pb-4 max-w-md mx-auto"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between mb-6">
        <div>
          <p
            className="text-sm font-medium"
            style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}
          >
            PinoCare
          </p>
        </div>
        <motion.div
          whileTap={{ scale: 0.8 }}
          whileHover={{ scale: 1.15, rotate: 180 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer shadow-sm shadow-pink-100"
          style={{ backgroundColor: "rgba(255,136,167,0.1)" }}
        >
          <Sparkles size={18} color="var(--color-brand-pink)" />
        </motion.div>
      </motion.div>

      {/* Pino Character & Greeting */}
      <motion.div variants={item} className="flex items-center gap-4 mb-8">
        <div className="relative">
          <motion.div
            animate={{ y: [0, -8, 0], rotate: [0, -2, 2, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="cursor-pointer"
          >
            <Image
              src="/images/pino-main.png"
              alt="Pino"
              width={120}
              height={120}
              className="rounded-3xl shadow-lg shadow-pink-200/50"
              priority
            />
          </motion.div>
        </div>
        <div className="flex-1">
          <h1
            className="text-xl font-bold leading-tight mb-1"
            style={{ color: "var(--color-text-main)", fontFamily: "var(--font-heading)" }}
          >
            Haii sayangkuu...✨
          </h1>
          <p
            className="text-sm"
            style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}
          >
            {greeting || "Halo"}, gimana kabar Dede hari ini?
          </p>
        </div>
      </motion.div>

      {/* Mood Selector Grid */}
      <motion.div variants={item} className="mb-8">
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-3"
          style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}
        >
          Dede lagi ngerasa apa?
        </p>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(MOOD_TYPES).map(([key, mood], i) => (
            <Link key={key} href={`/mood/${key}`}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 + 0.3, type: "spring", stiffness: 200, damping: 15 }}
                whileHover={{ scale: 1.05, y: -5, boxShadow: `0 10px 25px ${mood.color}30` }}
                whileTap={{ scale: 0.92 }}
                className="glass-card p-4 flex flex-col items-center gap-2 cursor-pointer relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${mood.color}15, ${mood.color}08)`,
                  border: `1px solid ${mood.color}25`,
                }}
              >
                <motion.span 
                  className="text-3xl relative z-10"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2, delay: i * 0.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  {mood.emoji}
                </motion.span>
                <span
                  className="text-xs font-semibold text-center"
                  style={{
                    color: "var(--color-text-main)",
                    fontFamily: "var(--font-heading)",
                  }}
                >
                  {mood.label}
                </span>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Daily Quote */}
      <motion.div variants={item}>
        <div className="flex items-center gap-2 mb-3">
          <MessageCircleHeart size={16} color="var(--color-brand-pink)" />
          <p
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}
          >
            Pesan Pino Buat Kamu
          </p>
        </div>
        <motion.div
          className="glass-card p-5 relative overflow-hidden"
          whileHover={{ scale: 1.02, boxShadow: "0 15px 30px rgba(255,136,167,0.15)" }}
          whileTap={{ scale: 0.98 }}
        >
          <div
            className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-20"
            style={{ backgroundColor: "var(--color-brand-pink)" }}
          />
          <div className="flex items-start gap-3">
            <motion.div 
              className="text-2xl flex-shrink-0"
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
            >
              🐻
            </motion.div>
            <p
              className="text-sm leading-relaxed italic"
              style={{ color: "var(--color-text-main)", fontFamily: "var(--font-body)" }}
            >
              &ldquo;{quote || "Kamu sudah melakukan yang terbaik hari ini!"}&rdquo;
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Global Welcome Popup */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center px-5"
            style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 50, rotate: -5 }}
              animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20, rotate: 5 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="glass-card p-8 max-w-[320px] w-full text-center relative overflow-hidden"
              style={{ background: "rgba(255, 255, 255, 0.98)", borderRadius: 32 }}
            >
              {/* Dekorasi Latar */}
              <div
                className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-20"
                style={{ backgroundColor: "var(--color-brand-pink)" }}
              />
              <div
                className="absolute -bottom-10 -left-10 w-24 h-24 rounded-full opacity-15"
                style={{ backgroundColor: "var(--color-brand-pink-dark)" }}
              />
              
              <motion.div 
                className="text-6xl mb-4 relative z-10"
                animate={{ y: [0, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              >
                💌
              </motion.div>
              
              <h3 
                className="text-xl font-bold mb-3 relative z-10"
                style={{ color: "var(--color-text-main)", fontFamily: "var(--font-heading)" }}
              >
                Hai, Orang Hebat! ✨
              </h3>
              
              <p 
                className="text-sm leading-relaxed mb-8 relative z-10"
                style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}
              >
                Apapun yang sedang Dede lalui hari ini, ingatlah bahwa abang selalu ada di sini, bangga banget sama kamu. Jangan lupa senyum ya, karena senyummu adalah semangat abang. <br/><br/>
                <strong style={{ color: "var(--color-brand-pink-dark)" }}>You are doing great, sayang! 💖</strong>
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={closeWelcome}
                className="w-full py-4 rounded-2xl text-sm font-bold text-white shadow-lg shadow-pink-200 relative z-10"
                style={{ background: "linear-gradient(135deg, var(--color-brand-pink), var(--color-brand-pink-dark))" }}
              >
                Peluk Jauh! 🤗
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
