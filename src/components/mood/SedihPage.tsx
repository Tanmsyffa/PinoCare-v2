"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { MOOD_BOOSTERS } from "@/lib/constants";
import { useState } from "react";

const SLIDE_EMOJIS = ["🌸", "🌈", "🐻", "✨"];
const SLIDE_GRADIENTS = [
  "rgba(255,136,167,0.15), rgba(195,177,225,0.15)",
  "rgba(137,207,240,0.15), rgba(255,184,204,0.15)",
  "rgba(195,177,225,0.15), rgba(255,212,163,0.15)",
  "rgba(255,184,204,0.15), rgba(255,136,167,0.15)",
];

export default function SedihPage() {
  const [hugged, setHugged] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  const paginate = (newDirection: number) => {
    const nextSlide = currentSlide + newDirection;
    if (nextSlide >= 0 && nextSlide < MOOD_BOOSTERS.length) {
      setDirection(newDirection);
      setCurrentSlide(nextSlide);
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 pt-4 pb-6">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold mb-1" style={{ color: "var(--color-text-main)", fontFamily: "var(--font-heading)" }}>
          Jangan sedih ya Sayang...
        </h1>
        <p className="text-sm" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
          Everything&apos;s gonna be alright 💕
        </p>
      </div>

      <div className="flex justify-center mb-6">
        <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
          <Image src="/images/pino-sad.png" alt="Pino Peluk" width={140} height={140} className="rounded-3xl" />
        </motion.div>
      </div>

      {/* Peluk Virtual Button */}
      <motion.button whileTap={{ scale: 0.93 }} onClick={() => setHugged(true)}
        className="w-full py-4 rounded-3xl mb-2 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, var(--color-brand-pink), var(--color-brand-pink-dark))", boxShadow: "0 8px 30px rgba(255,136,167,0.35)", color: "white", fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "16px" }}>
        <span className="flex items-center justify-center gap-2">
          <Heart size={20} fill="white" /> Peluk Pino Virtual
        </span>
      </motion.button>

      {hugged && (
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="text-center text-sm mb-6" style={{ color: "var(--color-brand-pink)", fontFamily: "var(--font-body)" }}>
          Pino peluk Dede erat-erat! 🤗💕
        </motion.p>
      )}

      {/* Mood Booster Slide */}
      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--color-text-muted)" }}>
          Mood Booster 🌈
        </p>

        {/* Slide Container */}
        <div className="relative overflow-hidden rounded-3xl" style={{ minHeight: 160 }}>
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentSlide}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.x < -50) paginate(1);
                else if (info.offset.x > 50) paginate(-1);
              }}
              className="w-full rounded-3xl p-6 flex flex-col justify-between cursor-grab active:cursor-grabbing"
              style={{
                minHeight: 160,
                background: `linear-gradient(135deg, ${SLIDE_GRADIENTS[currentSlide]})`,
              }}
            >
              <p className="text-4xl mb-3">{SLIDE_EMOJIS[currentSlide]}</p>
              <p className="text-base font-semibold leading-relaxed" style={{ color: "var(--color-text-main)", fontFamily: "var(--font-heading)" }}>
                {MOOD_BOOSTERS[currentSlide].quote}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Nav Arrows */}
          {currentSlide > 0 && (
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => paginate(-1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.7)", backdropFilter: "blur(4px)" }}
            >
              <ChevronLeft size={16} color="var(--color-text-main)" />
            </motion.button>
          )}
          {currentSlide < MOOD_BOOSTERS.length - 1 && (
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => paginate(1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.7)", backdropFilter: "blur(4px)" }}
            >
              <ChevronRight size={16} color="var(--color-text-main)" />
            </motion.button>
          )}
        </div>

        {/* Dot Indicators */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {MOOD_BOOSTERS.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => { setDirection(i > currentSlide ? 1 : -1); setCurrentSlide(i); }}
              className="rounded-full transition-all duration-300"
              animate={{
                width: i === currentSlide ? 20 : 8,
                backgroundColor: i === currentSlide ? "var(--color-brand-pink)" : "rgba(255,136,167,0.25)",
              }}
              style={{ height: 8 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
