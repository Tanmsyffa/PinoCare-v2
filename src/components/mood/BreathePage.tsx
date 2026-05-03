"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Wind } from "lucide-react";
import { CALMING_TIPS } from "@/lib/constants";
import { useState, useEffect } from "react";

export default function BreathePage() {
  const [phase, setPhase] = useState<"inhale" | "exhale">("inhale");

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((p) => (p === "inhale" ? "exhale" : "inhale"));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-5 pt-4 pb-6"
    >
      {/* Title */}
      <div className="text-center mb-2">
        <h1
          className="text-xl font-bold mb-1"
          style={{ color: "var(--color-text-main)", fontFamily: "var(--font-heading)" }}
        >
          Pusing / Stres
        </h1>
        <p
          className="text-sm"
          style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}
        >
          Tarik napas pelan-pelan ya, Dede...
        </p>
      </div>

      {/* Breathing Circle */}
      <div className="flex flex-col items-center justify-center py-10">
        <div className="relative flex items-center justify-center">
          {/* Outer glow ring */}
          <motion.div
            animate={{ scale: [1, 1.5, 1] }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute rounded-full"
            style={{
              width: 200,
              height: 200,
              background:
                "radial-gradient(circle, rgba(255,136,167,0.15) 0%, rgba(255,136,167,0.05) 60%, transparent 100%)",
            }}
          />

          {/* Middle ring */}
          <motion.div
            animate={{ scale: [1, 1.35, 1] }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.3,
            }}
            className="absolute rounded-full"
            style={{
              width: 160,
              height: 160,
              border: "2px solid rgba(255,136,167,0.15)",
            }}
          />

          {/* Inner breathing circle */}
          <motion.div
            animate={{ scale: [1, 1.25, 1] }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative rounded-full flex items-center justify-center"
            style={{
              width: 130,
              height: 130,
              background:
                "linear-gradient(135deg, rgba(255,136,167,0.2), rgba(195,177,225,0.2))",
              boxShadow: "0 0 40px rgba(255,136,167,0.15)",
            }}
          >
            <Image
              src="/images/pino-zen.png"
              alt="Pino meditasi"
              width={90}
              height={90}
              className="rounded-full"
            />
          </motion.div>
        </div>

        {/* Breathing text */}
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 flex items-center gap-2"
        >
          <Wind size={16} color="var(--color-text-muted)" />
          <p
            className="text-lg font-semibold"
            style={{ color: "var(--color-text-main)", fontFamily: "var(--font-heading)" }}
          >
            {phase === "inhale" ? "Tarik Napas..." : "Buang Napas..."}
          </p>
        </motion.div>
      </div>

      {/* Calming Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2
          className="text-base font-bold mb-3"
          style={{ color: "var(--color-text-main)", fontFamily: "var(--font-heading)" }}
        >
          💆 Hal kecil yang bikin tenang
        </h2>
        <div className="space-y-2">
          {CALMING_TIPS.map((tip, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="glass-card px-4 py-3 flex items-center gap-3"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  backgroundColor: "rgba(255,136,167,0.1)",
                  color: "var(--color-brand-pink)",
                  fontFamily: "var(--font-heading)",
                }}
              >
                {i + 1}
              </div>
              <p
                className="text-sm"
                style={{ color: "var(--color-text-main)", fontFamily: "var(--font-body)" }}
              >
                {tip}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
