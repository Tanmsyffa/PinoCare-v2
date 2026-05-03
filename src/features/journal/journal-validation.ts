import { z } from "zod";
import { isAllowedStoragePath, normalizeStoragePath } from "@/lib/supabase/media-storage";
import { STORAGE_BUCKETS } from "@/config/storage";

const JOURNAL_MOODS = ["happy", "sad", "love", "sleepy", "angry"] as const;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const SAFE_ID_PATTERN = /^[a-zA-Z0-9_-]{1,128}$/;

function isValidIsoDate(value: string) {
  if (!ISO_DATE_PATTERN.test(value)) return false;

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

export const journalIdSchema = z
  .string()
  .trim()
  .regex(SAFE_ID_PATTERN, "Journal ID tidak valid");

export const journalInputSchema = z
  .object({
    title: z.string().trim().min(1).max(120),
    content: z.string().trim().min(1).max(5000),
    mood: z.enum(JOURNAL_MOODS),
    date: z.string().trim().refine(isValidIsoDate, "Tanggal tidak valid"),
    photo_path: z
      .string()
      .trim()
      .max(512)
      .transform((value) => normalizeStoragePath(value, STORAGE_BUCKETS.journals))
      .refine((value) => !value || isAllowedStoragePath(value), "Path foto tidak valid")
      .nullable()
      .optional(),
  })
  .strict()
  .transform((data) => ({
    ...data,
    photo_path: data.photo_path || null,
  }));
