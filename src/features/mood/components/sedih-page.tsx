"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ChevronLeft, ChevronRight, Quote, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MagicCard } from "@/components/ui/magic-card";
import { Progress } from "@/components/ui/progress";
import { MOOD_BOOSTERS } from "@/config/app-content";
import { vibrate } from "@/lib/device/haptics";
import { cn } from "@/lib/utils";
import { useState } from "react";

const SLIDE_EMOJIS = ["🌸", "🌈", "🐻", "✨"];
const SLIDE_GRADIENTS = [
  "rgba(255,136,167,0.15), rgba(195,177,225,0.15)",
  "rgba(137,207,240,0.15), rgba(255,184,204,0.15)",
  "rgba(195,177,225,0.15), rgba(255,212,163,0.15)",
  "rgba(255,184,204,0.15), rgba(255,136,167,0.15)",
];
const HUG_REACTIONS = [
  { icon: "💖", left: "16%", top: "50%", x: -18, y: -52 },
  { icon: "✨", left: "28%", top: "28%", x: -10, y: -64 },
  { icon: "🤗", left: "46%", top: "18%", x: 4, y: -58 },
  { icon: "💕", left: "62%", top: "30%", x: 14, y: -66 },
  { icon: "⭐", left: "76%", top: "52%", x: 22, y: -54 },
  { icon: "💗", left: "50%", top: "62%", x: 0, y: -74 },
];

export default function SedihPage() {
  const [hugged, setHugged] = useState(false);
  const [hugBurstKey, setHugBurstKey] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  const handleVirtualHug = () => {
    vibrate([35, 30, 65]);
    setHugged(true);
    setHugBurstKey((key) => key + 1);
  };

  const paginate = (newDirection: number) => {
    const nextSlide = currentSlide + newDirection;
    if (nextSlide >= 0 && nextSlide < MOOD_BOOSTERS.length) {
      setDirection(newDirection);
      setCurrentSlide(nextSlide);
    }
  };

  const goToSlide = (slideIndex: number) => {
    if (slideIndex === currentSlide) {
      return;
    }

    setDirection(slideIndex > currentSlide ? 1 : -1);
    setCurrentSlide(slideIndex);
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };
  const progressValue = ((currentSlide + 1) / MOOD_BOOSTERS.length) * 100;

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
        <motion.div className="relative" animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
          <motion.div
            key={hugBurstKey}
            animate={hugged ? { scale: [1, 1.08, 0.98, 1], rotate: [0, -3, 3, 0] } : { scale: 1, rotate: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <Image src="/images/pino-sad.png" alt="Pino Peluk" width={140} height={140} className="rounded-3xl" />
          </motion.div>
          <AnimatePresence>
            {hugBurstKey > 0 ? (
              <motion.div key={hugBurstKey} className="pointer-events-none absolute inset-0">
                {HUG_REACTIONS.map((reaction, index) => (
                  <motion.span
                    key={`${reaction.icon}-${index}`}
                    className="absolute text-xl"
                    initial={{ opacity: 0, scale: 0.45, x: 0, y: 8, rotate: 0 }}
                    animate={{ opacity: [0, 1, 0], scale: [0.45, 1.25, 0.8], x: reaction.x, y: reaction.y, rotate: index % 2 === 0 ? -14 : 14 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.15, delay: index * 0.04, ease: "easeOut" }}
                    style={{ left: reaction.left, top: reaction.top }}
                  >
                    {reaction.icon}
                  </motion.span>
                ))}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Peluk Virtual Button */}
      <motion.button whileTap={{ scale: 0.93 }} onClick={handleVirtualHug}
        className="w-full py-4 rounded-3xl mb-2 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, var(--color-brand-pink), var(--color-brand-pink-dark))", boxShadow: "0 8px 30px rgba(255,136,167,0.35)", color: "white", fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "16px" }}>
        <AnimatePresence>
          {hugBurstKey > 0 ? (
            <motion.span
              key={hugBurstKey}
              className="pointer-events-none absolute inset-y-0 left-0 w-1/2"
              initial={{ x: "-120%", opacity: 0 }}
              animate={{ x: "240%", opacity: [0, 0.45, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.75, ease: "easeOut" }}
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)" }}
            />
          ) : null}
        </AnimatePresence>
        <span className="relative z-10 flex items-center justify-center gap-2">
          <Heart size={20} fill="white" /> Peluk Pino Virtual
        </span>
      </motion.button>

      <AnimatePresence mode="wait">
        {hugged ? (
          <motion.p
            key={hugBurstKey}
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="text-center text-sm mb-6"
            style={{ color: "var(--color-brand-pink)", fontFamily: "var(--font-body)" }}
          >
            Pino peluk Dede erat-erat! 🤗💕
          </motion.p>
        ) : null}
      </AnimatePresence>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-2xl"
              style={{ backgroundColor: "rgba(255, 209, 209, 0.45)", color: "var(--color-brand-pink-dark)" }}
            >
              <Sparkles size={16} />
            </span>
            <h2 className="text-sm font-bold" style={{ color: "var(--color-text-main)", fontFamily: "var(--font-heading)" }}>
              Mood Booster
            </h2>
          </div>
          <p className="text-xs font-semibold" style={{ color: "rgba(99, 88, 88, 0.62)", fontFamily: "var(--font-body)" }}>
            {currentSlide + 1}/{MOOD_BOOSTERS.length}
          </p>
        </div>

        <div className="relative">
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
              dragElastic={0.18}
              onDragEnd={(_, info) => {
                if (info.offset.x < -50) paginate(1);
                else if (info.offset.x > 50) paginate(-1);
              }}
              className="cursor-grab active:cursor-grabbing"
            >
              <MagicCard
                gradientFrom="#FFD1D1"
                gradientTo="#C3B1E1"
                gradientColor="rgba(255, 209, 209, 0.38)"
                gradientOpacity={0.55}
                gradientSize={260}
                className="rounded-[2rem]"
              >
                <Card className="relative min-h-[204px] overflow-hidden border-0 bg-transparent py-0 shadow-none ring-0">
                  <motion.div
                    aria-hidden="true"
                    className="absolute inset-0"
                    animate={{ background: `linear-gradient(135deg, ${SLIDE_GRADIENTS[currentSlide]})` }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  />
                  <motion.div
                    aria-hidden="true"
                    className="absolute -right-10 -top-12 size-32 rounded-full bg-primary/20 blur-2xl"
                    animate={{ scale: [1, 1.14, 1], opacity: [0.45, 0.72, 0.45] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.div
                    aria-hidden="true"
                    className="absolute -bottom-14 -left-12 size-36 rounded-full bg-accent/50 blur-2xl"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.35, 0.58, 0.35] }}
                    transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
                  />

                  <CardHeader className="relative z-10 flex-row items-start justify-between gap-4 px-5 pt-5">
                    <motion.div
                      className="flex size-16 shrink-0 items-center justify-center rounded-3xl bg-background/65 text-4xl shadow-inner ring-1 ring-white/70"
                      animate={{ rotate: [0, -4, 4, 0], scale: [1, 1.05, 1] }}
                      transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                    >
                      {SLIDE_EMOJIS[currentSlide]}
                    </motion.div>
                    <CardAction className="rounded-2xl bg-background/60 p-2 text-primary shadow-sm">
                      <Quote />
                    </CardAction>
                  </CardHeader>

                  <CardContent className="relative z-10 px-5">
                    <CardTitle className="text-lg font-bold leading-snug text-card-foreground">
                      {MOOD_BOOSTERS[currentSlide].quote}
                    </CardTitle>
                  </CardContent>

                  <CardFooter className="relative z-10 gap-3 border-0 bg-transparent px-5 pb-5 pt-0">
                    <Button
                      variant="secondary"
                      size="icon-lg"
                      onClick={() => paginate(-1)}
                      disabled={currentSlide === 0}
                      aria-label="Mood booster sebelumnya"
                      className="rounded-2xl bg-background/65 shadow-sm hover:bg-background/80"
                    >
                      <ChevronLeft />
                    </Button>

                    <Progress
                      value={progressValue}
                      className="flex-1 [&_[data-slot=progress-indicator]]:bg-gradient-to-r [&_[data-slot=progress-indicator]]:from-[var(--color-brand-pink)] [&_[data-slot=progress-indicator]]:to-[var(--color-brand-pink-dark)] [&_[data-slot=progress-track]]:h-2 [&_[data-slot=progress-track]]:bg-primary/15"
                    />

                    <Button
                      variant="secondary"
                      size="icon-lg"
                      onClick={() => paginate(1)}
                      disabled={currentSlide === MOOD_BOOSTERS.length - 1}
                      aria-label="Mood booster berikutnya"
                      className="rounded-2xl bg-background/65 shadow-sm hover:bg-background/80"
                    >
                      <ChevronRight />
                    </Button>
                  </CardFooter>
                </Card>
              </MagicCard>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-3 grid grid-cols-4 gap-2">
          {MOOD_BOOSTERS.map((booster, i) => (
            <Button
              key={booster.id}
              type="button"
              variant="secondary"
              size="icon-lg"
              onClick={() => goToSlide(i)}
              aria-label={`Pilih mood booster ${i + 1}`}
              className={cn(
                "size-11 rounded-2xl bg-card/65 text-xl shadow-none ring-1 ring-white/65 transition-all hover:bg-card/80",
                i === currentSlide && "scale-105 bg-secondary text-foreground shadow-[0_10px_26px_rgba(244,167,167,0.18)] ring-primary/45",
                i !== currentSlide && "opacity-60"
              )}
            >
              {SLIDE_EMOJIS[i]}
            </Button>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
