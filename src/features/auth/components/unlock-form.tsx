"use client";

import { motion } from "framer-motion";
import { Heart, Loader2, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type UnlockFormProps = {
  nextPath: string;
};

export default function UnlockForm({ nextPath }: UnlockFormProps) {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "PIN salah");
      }

      router.replace(nextPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "PIN salah");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh px-5 py-10 max-w-md mx-auto flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        className="glass-card p-7 w-full text-center"
        style={{ background: "rgba(255, 255, 255, 0.92)" }}
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-5"
          style={{
            background:
              "linear-gradient(135deg, var(--color-brand-pink), var(--color-brand-pink-dark))",
            boxShadow: "0 10px 30px rgba(244,167,167,0.35)",
          }}
        >
          <LockKeyhole size={26} color="white" />
        </motion.div>

        <div className="flex items-center justify-center gap-2 mb-2">
          <Heart size={16} color="var(--color-brand-pink-dark)" fill="var(--color-brand-pink-dark)" />
          <h1
            className="text-xl font-bold"
            style={{ color: "var(--color-text-main)", fontFamily: "var(--font-heading)" }}
          >
            PinoCare
          </h1>
        </div>
        <p
          className="text-sm mb-6"
          style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}
        >
          Masukkan PIN dulu ya sayang
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            value={pin}
            onChange={(event) => setPin(event.target.value)}
            className="w-full px-5 py-4 rounded-3xl text-center text-lg font-bold outline-none tracking-[0.35em]"
            style={{
              background: "rgba(255,255,255,0.85)",
              border: "1px solid rgba(255,136,167,0.22)",
              color: "var(--color-text-main)",
              fontFamily: "var(--font-heading)",
            }}
            autoFocus
          />

          {error && (
            <p className="text-xs font-semibold" style={{ color: "#DC2626" }}>
              {error}
            </p>
          )}

          <motion.button
            type="submit"
            disabled={loading || !pin}
            whileTap={{ scale: 0.96 }}
            className="w-full py-4 rounded-3xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60"
            style={{
              background:
                "linear-gradient(135deg, var(--color-brand-pink), var(--color-brand-pink-dark))",
              boxShadow: "0 8px 25px rgba(244,167,167,0.35)",
              fontFamily: "var(--font-heading)",
            }}
          >
            {loading ? (
              <>
                <Loader2 size={17} className="animate-spin" /> Membuka...
              </>
            ) : (
              "Buka PinoCare"
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
