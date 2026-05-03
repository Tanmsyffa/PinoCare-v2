"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Phone, Heart, MessageCircle } from "lucide-react";

const QUICK_MESSAGES = [
  { text: "abanggg dede kangennn💕", emoji: "💕" },
  { text: "abang nak vc", emoji: "📱" },
  { text: "abang lagi apa? dede mau ceritaaa", emoji: "💭" },
];

export default function KangenPage() {
  const getWhatsAppUrl = (message: string) =>
    `/api/whatsapp?text=${encodeURIComponent(message)}`;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 pt-4 pb-6">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold mb-1" style={{ color: "var(--color-text-main)", fontFamily: "var(--font-heading)" }}>
          Kangen Abang 💕
        </h1>
        <p className="text-sm" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
          abangg disinii sayanggg..
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} className="relative">
          {[...Array(5)].map((_, i) => (
            <motion.div key={i} className="absolute text-lg"
              initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0], y: [-20, -60] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
              style={{ left: `${30 + i * 10}%`, top: "10%" }}>💕</motion.div>
          ))}
          <Image src="/images/pino-love.png" alt="Pino Kangen" width={160} height={160} className="rounded-3xl relative z-10" />
        </motion.div>
      </div>

      <motion.a href={getWhatsAppUrl("abangg, dede kangenn💕")} target="_blank" rel="noopener noreferrer"
        whileTap={{ scale: 0.95 }}
        className="flex items-center justify-center gap-3 w-full py-4 rounded-3xl mb-6"
        style={{ background: "linear-gradient(135deg, var(--color-brand-pink), var(--color-brand-pink-dark))", boxShadow: "0 8px 30px rgba(255,136,167,0.35)", color: "white", fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "16px" }}>
        <Phone size={20} /> Call abang 💕
      </motion.a>

      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--color-text-muted)" }}>Atau kirim pesan cepat...</p>
        <div className="space-y-2">
          {QUICK_MESSAGES.map((msg, i) => (
            <motion.a key={i} href={getWhatsAppUrl(msg.text)} target="_blank" rel="noopener noreferrer"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
              whileTap={{ scale: 0.97 }} className="glass-card px-4 py-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0" style={{ backgroundColor: "rgba(255,136,167,0.1)" }}>{msg.emoji}</div>
              <p className="text-sm font-medium flex-1" style={{ color: "var(--color-text-main)" }}>{msg.text}</p>
              <MessageCircle size={16} color="var(--color-text-muted)" />
            </motion.a>
          ))}
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
        className="glass-card p-5 text-center" style={{ background: "linear-gradient(135deg, rgba(255,136,167,0.08), rgba(255,136,167,0.03))" }}>
        <Heart size={24} color="var(--color-brand-pink)" className="mx-auto mb-2" fill="var(--color-brand-pink)" />
        <p className="text-sm italic leading-relaxed" style={{ color: "var(--color-text-main)" }}>
          &ldquo;Jarak itu cuma angka, tapi cinta abang buat dede itu tanpa batas&rdquo; 💗
        </p>
      </motion.div>
    </motion.div>
  );
}
