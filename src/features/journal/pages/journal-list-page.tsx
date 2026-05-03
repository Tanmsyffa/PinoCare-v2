"use client";

/* eslint-disable @next/next/no-img-element */

import { motion, AnimatePresence } from "framer-motion";
import { Plus, BookHeart, Edit2, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { JOURNAL_MOODS } from "@/config/app-content";
import { toast } from "sonner";

type Journal = {
  id: string;
  title: string;
  content: string;
  mood: string;
  photo_url: string | null;
  date: string;
  created_at: string;
};

export default function JournalPage() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchJournals = () => {
    fetch(`/api/journals?t=${Date.now()}`)
      .then((res) => res.json())
      .then((data) => {
        setJournals(data.journals || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  const proceedDelete = async () => {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    setDeletingId(id);

    try {
      const res = await fetch(`/api/journals/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Gagal menghapus");

      toast.success("Cerita berhasil dihapus! 💨");
      fetchJournals(); // Refresh list
    } catch {
      toast.error("Gagal menghapus cerita, coba lagi ya...");
    }
    setDeletingId(null);
  };

  const getMoodEmoji = (mood: string) =>
    JOURNAL_MOODS.find((m) => m.id === mood)?.emoji || "😊";

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="px-5 pt-6 pb-4 max-w-md mx-auto relative min-h-dvh">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 mb-1">
          <BookHeart size={22} color="var(--color-brand-pink)" />
          <h1
            className="text-xl font-bold"
            style={{ color: "var(--color-text-main)", fontFamily: "var(--font-heading)" }}
          >
            Catatan Hati Dede
          </h1>
        </div>
        <p
          className="text-sm mb-6"
          style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}
        >
          Abadikan setiap momen kecil penuh cinta hari ini...
        </p>
      </motion.div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-card p-5">
              <div className="skeleton h-3 w-32 mb-3" />
              <div className="skeleton h-5 w-48 mb-2" />
              <div className="skeleton h-3 w-full mb-1" />
              <div className="skeleton h-3 w-3/4" />
            </div>
          ))}
        </div>
      ) : journals.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-8 text-center mt-10"
        >
          <div className="text-5xl mb-4">📝</div>
          <h2
            className="text-base font-bold mb-2"
            style={{ color: "var(--color-text-main)", fontFamily: "var(--font-heading)" }}
          >
            Belum ada cerita tersimpan
          </h2>
          <p
            className="text-sm mb-4"
            style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}
          >
            Mulai tulis cerita pertama Dede hari ini!
          </p>
          <Link href="/journal/create">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 rounded-3xl text-sm font-bold text-white"
              style={{
                background: "linear-gradient(135deg, var(--color-brand-pink), var(--color-brand-pink-dark))",
              }}
            >
              Tulis Sekarang ✨
            </motion.button>
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {journals.map((j, i) => (
              <motion.div
                layout
                key={j.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -50 }}
                transition={{ duration: 0.3, delay: i * 0.05, type: "spring", stiffness: 200, damping: 20 }}
                className="glass-card p-5"
                whileHover={{ scale: 1.01, boxShadow: "0 10px 30px rgba(255,136,167,0.15)" }}
              >
              <p
                className="text-[11px] font-medium uppercase tracking-wider mb-1"
                style={{ color: "var(--color-text-muted)" }}
              >
                {formatDate(j.date)}
              </p>
              <div className="flex items-start gap-3">
                <span className="text-2xl">{getMoodEmoji(j.mood)}</span>
                <div className="flex-1 min-w-0">
                  <h3
                    className="text-base font-bold mb-1 truncate"
                    style={{
                      color: "var(--color-text-main)",
                      fontFamily: "var(--font-heading)",
                    }}
                  >
                    {j.title}
                  </h3>
                  <p
                    className="text-sm line-clamp-2"
                    style={{
                      color: "var(--color-text-muted)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {j.content}
                  </p>
                </div>
              </div>
              {j.photo_url && (
                <div className="mt-3 rounded-2xl overflow-hidden">
                  <img
                    src={j.photo_url}
                    alt=""
                    className="w-full h-auto"
                  />
                </div>
              )}
              
              {/* Actions */}
              <div className="mt-4 pt-4 flex items-center justify-end gap-3" style={{ borderTop: "1px dashed rgba(255,136,167,0.2)" }}>
                <Link href={`/journal/edit/${j.id}`}>
                  <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(122,91,91,0.15)" }}
                    whileTap={{ scale: 0.9 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
                    style={{ background: "rgba(122,91,91,0.08)", color: "var(--color-text-main)" }}
                  >
                    <Edit2 size={14} /> Edit
                  </motion.button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(220,38,38,0.15)" }}
                  whileTap={{ scale: 0.9 }}
                  disabled={deletingId === j.id}
                  onClick={() => setConfirmDeleteId(j.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold disabled:opacity-50 transition-colors"
                  style={{ background: "rgba(220,38,38,0.1)", color: "#DC2626" }}
                >
                  {deletingId === j.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                  Hapus
                </motion.button>
              </div>
            </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Custom Alert Modal */}
      <AnimatePresence>
        {confirmDeleteId && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center px-5"
            style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotate: -5, y: 20 }}
              animate={{ scale: 1, opacity: 1, rotate: 0, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, rotate: 5, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="glass-card p-6 max-w-[300px] w-full text-center relative overflow-hidden"
              style={{ background: "rgba(255, 255, 255, 0.95)" }}
            >
              <div
                className="absolute -top-10 -right-10 w-24 h-24 rounded-full opacity-20"
                style={{ backgroundColor: "var(--color-brand-pink)" }}
              />
              <div
                className="absolute -bottom-8 -left-8 w-20 h-20 rounded-full opacity-10"
                style={{ backgroundColor: "#DC2626" }}
              />
              
              <div className="text-5xl mb-3 relative z-10">😢</div>
              <h3 
                className="text-lg font-bold mb-1 relative z-10"
                style={{ color: "var(--color-text-main)", fontFamily: "var(--font-heading)" }}
              >
                Yakin mau dihapus?
              </h3>
              <p 
                className="text-sm mb-6 relative z-10"
                style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}
              >
                Cerita yang dihapus tidak bisa dikembalikan lagi loh sayangg...
              </p>

              <div className="flex gap-3 relative z-10">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 py-3 rounded-2xl text-sm font-bold"
                  style={{ background: "rgba(122,91,91,0.08)", color: "var(--color-text-main)" }}
                >
                  Nggak jadi deh
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={proceedDelete}
                  className="flex-1 py-3 rounded-2xl text-sm font-bold text-white shadow-lg shadow-red-200"
                  style={{ background: "linear-gradient(135deg, #EF4444, #DC2626)" }}
                >
                  Iya, Hapus 🗑️
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <Link href="/journal/create">
        <motion.div
          whileTap={{ scale: 0.85 }}
          whileHover={{ scale: 1.1, rotate: 15 }}
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
          className="fixed z-50 flex items-center justify-center"
          style={{
            bottom: "calc(105px + env(safe-area-inset-bottom, 0px))",
            right: 20,
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--color-brand-pink), var(--color-brand-pink-dark))",
            boxShadow: "0 8px 25px rgba(244,167,167,0.4)",
          }}
        >
          <Plus size={24} color="white" strokeWidth={2.5} />
        </motion.div>
      </Link>
    </div>
  );
}
