export const STORAGE_BUCKETS = {
  gallery: "gallery",
  journals: "journals",
} as const;

export const SIGNED_URL_MAX_AGE_SECONDS = 60 * 60;

export const MAX_JOURNAL_IMAGE_SIZE = 10 * 1024 * 1024;
export const MAX_GALLERY_MEDIA_SIZE = 50 * 1024 * 1024;
