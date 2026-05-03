"use client";

/* eslint-disable @next/next/no-img-element */

import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Heart, Play, Upload, Trash2, Loader2 } from "lucide-react";
import { useCallback, useState, useEffect } from "react";
import { toast } from "sonner";

type MediaItem = {
  src: string;
  path: string;
  filename: string;
  type: "image" | "video";
  span: "normal" | "tall";
};

export default function GalleryContent() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingPath, setDeletingPath] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [confirmDeleteMedia, setConfirmDeleteMedia] = useState<MediaItem | null>(null);
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

  const loadGallery = useCallback((showLoading = true) => {
    if (showLoading) setLoading(true);
    fetch("/api/gallery")
      .then((res) => res.json())
      .then((data) => {
        setMedia(data.media || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => loadGallery(), 0);
    return () => window.clearTimeout(timer);
  }, [loadGallery]);

  const handleMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/gallery", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Gagal mengupload media");
      }

      const data = await response.json();
      if (data.media) {
        setMedia((prev) => [data.media, ...prev]);
      } else {
        loadGallery(false);
      }

      setFileInputKey((prev) => prev + 1);
      toast.success("Kenangan baru berhasil ditambahkan!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengupload media");
    } finally {
      setUploading(false);
    }
  };

  const deleteMedia = async (item: MediaItem) => {
    setDeletingPath(item.path);
    try {
      const response = await fetch("/api/gallery", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: item.path }),
      });

      if (!response.ok) {
        throw new Error("Gagal menghapus media");
      }

      setMedia((prev) => prev.filter((mediaItem) => mediaItem.path !== item.path));
      setLikedItems((prev) => {
        const next = new Set(prev);
        next.delete(item.filename);
        localStorage.setItem("pinocare_likes", JSON.stringify([...next]));
        return next;
      });
      setConfirmDeleteMedia(null);
      if (selectedMedia?.path === item.path) setSelectedMedia(null);
      toast.success("Kenangan berhasil dihapus");
    } catch {
      toast.error("Gagal menghapus media, coba lagi ya...");
    } finally {
      setDeletingPath(null);
    }
  };

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
        <div className="flex items-center mb-1">
          <h1
            className="text-xl font-bold"
            style={{ color: "var(--color-text-main)", fontFamily: "var(--font-heading)" }}
          >
            Galeri Senyum Dede ✨
          </h1>
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
            Upload foto atau video pertama dari tombol tambah
          </p>
        </motion.div>
      ) : (
        <div className="columns-2 gap-3 space-y-3">
          {media.map((item, i) => (
            <motion.div
              key={item.filename}
              layoutId={`gallery-media-${item.path}`}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              whileHover={{ y: -5 }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 150, damping: 15 }}
              className="break-inside-avoid cursor-pointer group relative overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
              style={{ borderRadius: 20 }}
              onClick={() => setSelectedMedia(item)}
            >
              <motion.button
                whileTap={{ scale: 0.9 }}
                disabled={deletingPath === item.path}
                onClick={(event) => {
                  event.stopPropagation();
                  setConfirmDeleteMedia(item);
                }}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-60"
                style={{
                  backgroundColor: "rgba(0,0,0,0.35)",
                  backdropFilter: "blur(6px)",
                }}
              >
                {deletingPath === item.path ? (
                  <Loader2 size={14} color="white" className="animate-spin" />
                ) : (
                  <Trash2 size={14} color="white" />
                )}
              </motion.button>

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
                    className="absolute bottom-3 right-3 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: "rgba(0,0,0,0.4)",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    <Play size={12} color="white" fill="white" />
                  </div>
                </div>
              ) : (
                <img
                  src={item.src}
                  alt={`Kenangan ${i + 1}`}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  style={{ borderRadius: 20 }}
                  loading="lazy"
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
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="absolute top-5 left-5 w-10 h-10 rounded-full flex items-center justify-center z-10 disabled:opacity-60"
              style={{
                backgroundColor: "rgba(220,38,38,0.35)",
                backdropFilter: "blur(8px)",
              }}
              disabled={deletingPath === selectedMedia.path}
              onClick={(event) => {
                event.stopPropagation();
                setConfirmDeleteMedia(selectedMedia);
              }}
            >
              {deletingPath === selectedMedia.path ? (
                <Loader2 size={20} color="white" className="animate-spin" />
              ) : (
                <Trash2 size={20} color="white" />
              )}
            </motion.button>

            <motion.div
              layoutId={`gallery-media-${selectedMedia.path}`}
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
                <img
                  src={selectedMedia.src}
                  alt="Kenangan Dede"
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

      <AnimatePresence>
        {confirmDeleteMedia && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center px-5"
            style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmDeleteMedia(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 18 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 18 }}
              className="glass-card p-6 max-w-[310px] w-full text-center"
              style={{ background: "rgba(255, 255, 255, 0.96)" }}
              onClick={(event) => event.stopPropagation()}
            >
              <Camera size={30} color="var(--color-brand-pink)" className="mx-auto mb-3" />
              <h3
                className="text-base font-bold mb-2"
                style={{ color: "var(--color-text-main)", fontFamily: "var(--font-heading)" }}
              >
                Hapus kenangan ini?
              </h3>
              <p className="text-sm mb-5" style={{ color: "var(--color-text-muted)" }}>
                File akan dihapus dari bucket private dan tidak tampil lagi di galeri.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteMedia(null)}
                  className="flex-1 py-3 rounded-2xl text-sm font-bold"
                  style={{ background: "rgba(122,91,91,0.08)", color: "var(--color-text-main)" }}
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={deletingPath === confirmDeleteMedia.path}
                  onClick={() => deleteMedia(confirmDeleteMedia)}
                  className="flex-1 py-3 rounded-2xl text-sm font-bold text-white disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #EF4444, #DC2626)" }}
                >
                  {deletingPath === confirmDeleteMedia.path ? "Menghapus..." : "Hapus"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <input
        key={fileInputKey}
        type="file"
        id="gallery-upload"
        accept="image/*,video/mp4,video/webm,video/quicktime"
        onChange={handleMediaUpload}
        className="hidden"
      />
      <motion.label
        htmlFor="gallery-upload"
        whileTap={{ scale: 0.85 }}
        whileHover={{ scale: 1.1, rotate: 12 }}
        className="fixed z-50 flex items-center justify-center cursor-pointer"
        style={{
          bottom: "calc(105px + env(safe-area-inset-bottom, 0px))",
          right: 20,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "linear-gradient(135deg, var(--color-brand-pink), var(--color-brand-pink-dark))",
          boxShadow: "0 8px 25px rgba(244,167,167,0.4)",
          pointerEvents: uploading ? "none" : "auto",
        }}
        aria-label="Tambah foto atau video"
      >
        {uploading ? (
          <Loader2 size={24} color="white" className="animate-spin" />
        ) : (
          <Upload size={24} color="white" strokeWidth={2.5} />
        )}
      </motion.label>
    </div>
  );
}
