"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Heart, Play } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";

type MediaItem = {
  src: string;
  filename: string;
  type: "image" | "video";
  span: "normal" | "tall";
};

export default function GalleryContent() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());

  // Load likes from localStorage
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem("pinocare_likes");
        if (saved) setLikedItems(new Set(JSON.parse(saved)));
      } catch {
        // ignore
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetch("/api/gallery")
      .then((res) => res.json())
      .then((data) => {
        setMedia(data.media || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggleLike = (filename: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedItems((prev) => {
      const next = new Set(prev);
      if (next.has(filename)) next.delete(filename);
      else next.add(filename);
      localStorage.setItem("pinocare_likes", JSON.stringify([...next]));
      return next;
    });
  };

  return (
    <div className="px-4 pt-6 pb-4 max-w-md mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-1">
          <h1
            className="text-xl font-bold"
            style={{ color: "var(--color-text-main)", fontFamily: "var(--font-heading)" }}
          >
            Galeri Senyum Dede ✨
          </h1>
          <motion.div
            whileHover={{ scale: 1.1, rotate: [0, -15, 15, -15, 0] }}
            transition={{ duration: 0.5 }}
            className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer shadow-sm shadow-pink-100"
            style={{ backgroundColor: "rgba(255,136,167,0.1)" }}
          >
            <Camera size={18} color="var(--color-brand-pink)" />
          </motion.div>
        </div>
        <p
          className="text-sm mb-5"
          style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}
        >
          Favorit Abang • {loading ? "..." : media.length} Kenangan
        </p>
      </motion.div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="columns-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="skeleton mb-3"
              style={{
                height: [180, 220, 160, 240, 180, 200][i],
                borderRadius: 20,
              }}
            />
          ))}
        </div>
      ) : media.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-8 text-center mt-10"
        >
          <div className="text-5xl mb-4">📸</div>
          <h2
            className="text-base font-bold mb-2"
            style={{ color: "var(--color-text-main)", fontFamily: "var(--font-heading)" }}
          >
            Belum ada kenangan tersimpan
          </h2>
          <p
            className="text-sm"
            style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}
          >
            Tambahkan foto atau video ke folder public/images/fotoDede
          </p>
        </motion.div>
      ) : (
        <div className="columns-2 gap-3 space-y-3">
          {media.map((item, i) => (
            <motion.div
              key={item.filename}
              layoutId={`media-${i}`}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              whileHover={{ y: -5 }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 150, damping: 15 }}
              className="break-inside-avoid cursor-pointer group relative overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
              style={{ borderRadius: 20 }}
              onClick={() => setSelectedMedia(item)}
            >
              {item.type === "video" ? (
                <div className="relative">
                  <video
                    src={item.src}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full object-cover"
                    style={{ borderRadius: 20 }}
                  />
                  <div
                    className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: "rgba(0,0,0,0.4)",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    <Play size={12} color="white" fill="white" />
                  </div>
                </div>
              ) : (
                <Image
                  src={item.src}
                  alt={`Kenangan ${i + 1}`}
                  width={400}
                  height={350}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  style={{ borderRadius: 20 }}
                />
              )}

              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 50%)",
                  borderRadius: 20,
                }}
              >
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.8 }}
                  onClick={(e) => toggleLike(item.filename, e)}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.25)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <Heart
                    size={14}
                    color="white"
                    fill={likedItems.has(item.filename) ? "var(--color-brand-pink)" : "none"}
                  />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            style={{
              backgroundColor: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(16px)",
            }}
            onClick={() => setSelectedMedia(null)}
          >
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center z-10"
              style={{
                backgroundColor: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(8px)",
              }}
              onClick={() => setSelectedMedia(null)}
            >
              <X size={20} color="white" />
            </motion.button>

            <motion.div
              layoutId={`media-${media.indexOf(selectedMedia)}`}
              className="max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedMedia.type === "video" ? (
                <video
                  src={selectedMedia.src}
                  autoPlay
                  loop
                  controls
                  playsInline
                  className="w-full rounded-3xl"
                  style={{ maxHeight: "75dvh" }}
                />
              ) : (
                <Image
                  src={selectedMedia.src}
                  alt="Kenangan Dede"
                  width={600}
                  height={800}
                  className="w-full h-auto rounded-3xl"
                  style={{ maxHeight: "75dvh", objectFit: "contain" }}
                />
              )}

              <div className="flex justify-center mt-4">
                <motion.button
                  whileTap={{ scale: 1.3 }}
                  onClick={() => {
                    if (!selectedMedia) return;
                    setLikedItems((prev) => {
                      const next = new Set(prev);
                      if (next.has(selectedMedia.filename)) next.delete(selectedMedia.filename);
                      else next.add(selectedMedia.filename);
                      localStorage.setItem("pinocare_likes", JSON.stringify([...next]));
                      return next;
                    });
                  }}
                >
                  <motion.div
                    animate={selectedMedia && likedItems.has(selectedMedia.filename) ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <Heart
                      size={28}
                      color={selectedMedia && likedItems.has(selectedMedia.filename) ? "var(--color-brand-pink)" : "white"}
                      fill={selectedMedia && likedItems.has(selectedMedia.filename) ? "var(--color-brand-pink)" : "none"}
                      style={{ transition: "all 0.2s ease" }}
                    />
                  </motion.div>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
