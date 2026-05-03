"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Moon, Coffee, Music } from "lucide-react";

const REST_TIPS = [
  { icon: Coffee, text: "Minum air putih sayangg", color: "#FFB8CC" },
  { icon: Moon, text: "Bobo ajaa sebentar sayanggg", color: "#C3B1E1" },
  { icon: Music, text: "Dengerin lagu atau scroll aja sayangg", color: "#89CFF0" },
];

export default function CapekPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 pt-4 pb-6">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold mb-1" style={{ color: "var(--color-text-main)", fontFamily: "var(--font-heading)" }}>
          Istirahat dulu ya, Dede...
        </h1>
        <p className="text-sm" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
          Kamu sudah bekerja keras hari ini 💪
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
          <Image src="/images/pino-sleeping.png" alt="Pino Tidur" width={160} height={160} className="rounded-3xl" />
        </motion.div>
      </div>

      <div className="glass-card p-5 mb-6 text-center" style={{ background: "linear-gradient(135deg, rgba(195,177,225,0.1), rgba(255,136,167,0.05))" }}>
        <p className="text-sm italic leading-relaxed" style={{ color: "var(--color-text-main)", fontFamily: "var(--font-body)" }}>
          &ldquo;Istirahat bukan berarti menyerah, tapi menyiapkan diri untuk melangkah lebih jauh&rdquo; 🌙
        </p>
      </div>

      <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--color-text-muted)" }}>
        Rekomendasi buat Dede 💆
      </p>
      <div className="space-y-3">
        {REST_TIPS.map((tip, i) => {
          const Icon = tip.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.12 }} className="glass-card px-4 py-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${tip.color}20` }}>
                <Icon size={20} color={tip.color} />
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--color-text-main)", fontFamily: "var(--font-body)" }}>{tip.text}</p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
