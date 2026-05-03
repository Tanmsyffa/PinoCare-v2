"use client";

/* eslint-disable @next/next/no-img-element */

import { motion } from "framer-motion";
import { ArrowLeft, Camera, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { JOURNAL_MOODS } from "@/lib/constants";
import { toast } from "sonner";

const schema = z.object({
  title: z.string().min(1, "Judul harus diisi"),
  content: z.string().min(1, "Cerita harus diisi"),
  mood: z.string().min(1, "Pilih mood dulu ya"),
  date: z.string().min(1, "Tanggal harus diisi"),
});

type FormData = z.infer<typeof schema>;

export default function CreateJournalPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      mood: "",
      title: "",
      content: "",
    },
  });

  const selectedMood = useWatch({ control, name: "mood" });

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      let photo_url: string | null = null;

      // Upload photo if exists
      if (photo) {
        const formData = new FormData();
        formData.append("file", photo);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          photo_url = uploadData.url;
        }
      }

      // Create journal entry
      const res = await fetch("/api/journals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          content: data.content,
          mood: data.mood,
          date: data.date,
          photo_url,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast.success("Cerita Dede berhasil disimpan! ✨");
      router.push("/journal");
    } catch {
      toast.error("Gagal menyimpan, coba lagi ya...");
    }
    setSaving(false);
  };

  return (
    <div className="px-5 pt-5 pb-6 max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Link href="/journal">
          <motion.div
            whileTap={{ scale: 0.9 }}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl mb-4"
            style={{ backgroundColor: "rgba(255,136,167,0.08)" }}
          >
            <ArrowLeft size={18} color="var(--color-text-main)" />
            <span className="text-sm font-medium" style={{ color: "var(--color-text-main)" }}>
              Kembali
            </span>
          </motion.div>
        </Link>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-xl font-bold mb-6"
        style={{ color: "var(--color-text-main)", fontFamily: "var(--font-heading)" }}
      >
        Tulis Cerita Dede ✏️
      </motion.h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Date */}
        <div>
          <label
            className="text-xs font-semibold uppercase tracking-wider mb-2 block"
            style={{ color: "var(--color-text-muted)" }}
          >
            Pilih Tanggal
          </label>
          <input
            type="date"
            {...register("date")}
            className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
            style={{
              background: "rgba(255,255,255,0.8)",
              border: "1px solid rgba(255,136,167,0.15)",
              color: "var(--color-text-main)",
              fontFamily: "var(--font-body)",
            }}
          />
          {errors.date && (
            <p className="text-xs mt-1" style={{ color: "var(--color-brand-pink)" }}>
              {errors.date.message}
            </p>
          )}
        </div>

        {/* Mood Selector */}
        <div>
          <label
            className="text-xs font-semibold uppercase tracking-wider mb-2 block"
            style={{ color: "var(--color-text-muted)" }}
          >
            Mood Dede Hari Ini
          </label>
          <div className="flex gap-2">
            {JOURNAL_MOODS.map((m) => (
              <motion.button
                key={m.id}
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() =>
                  setValue("mood", m.id, { shouldValidate: true })
                }
                className="flex flex-col items-center gap-1 px-3 py-2.5 rounded-2xl flex-1 transition-all"
                style={{
                  background:
                    selectedMood === m.id
                      ? "rgba(255,136,167,0.15)"
                      : "rgba(255,255,255,0.6)",
                  border: `2px solid ${selectedMood === m.id ? "var(--color-brand-pink)" : "rgba(255,136,167,0.1)"}`,
                }}
              >
                <span className="text-xl">{m.emoji}</span>
                <span
                  className="text-[10px] font-medium"
                  style={{
                    color: selectedMood === m.id ? "var(--color-brand-pink)" : "var(--color-text-muted)",
                  }}
                >
                  {m.label}
                </span>
              </motion.button>
            ))}
          </div>
          {errors.mood && (
            <p className="text-xs mt-1" style={{ color: "var(--color-brand-pink)" }}>
              {errors.mood.message}
            </p>
          )}
        </div>

        {/* Title */}
        <div>
          <label
            className="text-xs font-semibold uppercase tracking-wider mb-2 block"
            style={{ color: "var(--color-text-muted)" }}
          >
            Judul
          </label>
          <input
            type="text"
            {...register("title")}
            placeholder="Judul cerita hari ini..."
            className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
            style={{
              background: "rgba(255,255,255,0.8)",
              border: "1px solid rgba(255,136,167,0.15)",
              color: "var(--color-text-main)",
              fontFamily: "var(--font-body)",
            }}
          />
          {errors.title && (
            <p className="text-xs mt-1" style={{ color: "var(--color-brand-pink)" }}>
              {errors.title.message}
            </p>
          )}
        </div>

        {/* Content */}
        <div>
          <label
            className="text-xs font-semibold uppercase tracking-wider mb-2 block"
            style={{ color: "var(--color-text-muted)" }}
          >
            Cerita
          </label>
          <textarea
            {...register("content")}
            placeholder="Isi cerita Dede hari ini..."
            rows={5}
            className="w-full px-4 py-3 rounded-2xl text-sm outline-none resize-none"
            style={{
              background: "rgba(255,255,255,0.8)",
              border: "1px solid rgba(255,136,167,0.15)",
              color: "var(--color-text-main)",
              fontFamily: "var(--font-body)",
            }}
          />
          {errors.content && (
            <p className="text-xs mt-1" style={{ color: "var(--color-brand-pink)" }}>
              {errors.content.message}
            </p>
          )}
        </div>

        {/* Photo */}
        <div>
          <label
            className="text-xs font-semibold uppercase tracking-wider mb-2 block"
            style={{ color: "var(--color-text-muted)" }}
          >
            Foto (Opsional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhoto}
            id="photo-input"
            className="hidden"
          />
          {photoPreview ? (
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src={photoPreview}
                alt="Preview"
                className="w-full h-auto"
              />
              <button
                type="button"
                onClick={() => {
                  setPhoto(null);
                  setPhotoPreview(null);
                }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white text-sm"
              >
                ✕
              </button>
            </div>
          ) : (
            <motion.label
              htmlFor="photo-input"
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl cursor-pointer"
              style={{
                border: "2px dashed rgba(255,136,167,0.25)",
                color: "var(--color-text-muted)",
              }}
            >
              <Camera size={18} /> Tambahkan Foto
            </motion.label>
          )}
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={saving}
          whileTap={{ scale: 0.95 }}
          className="w-full py-4 rounded-3xl text-base font-bold text-white flex items-center justify-center gap-2 disabled:opacity-70"
          style={{
            background: "linear-gradient(135deg, var(--color-text-main), var(--color-text-main))",
            boxShadow: "0 8px 25px rgba(138,107,107,0.3)",
            fontFamily: "var(--font-heading)",
          }}
        >
          {saving ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Menyimpan...
            </>
          ) : (
            "Simpan ✨"
          )}
        </motion.button>
      </form>
    </div>
  );
}
