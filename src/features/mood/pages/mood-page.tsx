"use client";

import { use } from "react";
import { MOOD_TYPES, type MoodType } from "@/config/app-content";
import BreathePage from "@/features/mood/components/breathe-page";
import KangenPage from "@/features/mood/components/kangen-page";
import SedihPage from "@/features/mood/components/sedih-page";
import CapekPage from "@/features/mood/components/capek-page";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

type Props = {
  params: Promise<{ type: string }>;
};

export default function MoodPage({ params }: Props) {
  const { type } = use(params);
  const moodType = type as MoodType;
  const mood = MOOD_TYPES[moodType];

  if (!mood) {
    return (
      <div className="px-5 pt-6 max-w-md mx-auto text-center">
        <p style={{ color: "var(--color-text-muted)" }}>Mood tidak ditemukan 😢</p>
        <Link href="/" className="text-brand-pink underline mt-4 inline-block">
          Kembali ke Home
        </Link>
      </div>
    );
  }

  const renderMoodContent = () => {
    switch (moodType) {
      case "stres":
        return <BreathePage />;
      case "kangen":
        return <KangenPage />;
      case "sedih":
        return <SedihPage />;
      case "capek":
        return <CapekPage />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-dvh max-w-md mx-auto">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="px-5 pt-5"
      >
        <Link href="/">
          <motion.div
            whileTap={{ scale: 0.9 }}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl"
            style={{ backgroundColor: "rgba(255,136,167,0.08)" }}
          >
            <ArrowLeft size={18} color="var(--color-text-main)" />
            <span
              className="text-sm font-medium"
              style={{ color: "var(--color-text-main)", fontFamily: "var(--font-body)" }}
            >
              Kembali
            </span>
          </motion.div>
        </Link>
      </motion.div>

      {renderMoodContent()}
    </div>
  );
}
