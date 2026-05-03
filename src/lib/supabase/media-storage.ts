import { randomUUID } from "crypto";
import { SIGNED_URL_MAX_AGE_SECONDS } from "@/config/storage";
import { getServerSupabase } from "@/lib/supabase/server";

const IMAGE_SIGNATURES = {
  jpg: {
    extensions: ["jpg", "jpeg"],
    mimeTypes: ["image/jpeg"],
  },
  png: {
    extensions: ["png"],
    mimeTypes: ["image/png"],
  },
  gif: {
    extensions: ["gif"],
    mimeTypes: ["image/gif"],
  },
  webp: {
    extensions: ["webp"],
    mimeTypes: ["image/webp"],
  },
  avif: {
    extensions: ["avif"],
    mimeTypes: ["image/avif"],
  },
  heic: {
    extensions: ["heic", "heif"],
    mimeTypes: ["image/heic", "image/heif"],
  },
} as const;

const VIDEO_SIGNATURES = {
  mp4: {
    extensions: ["mp4", "m4v"],
    mimeTypes: ["video/mp4", "video/x-m4v"],
  },
  mov: {
    extensions: ["mov"],
    mimeTypes: ["video/quicktime"],
  },
  webm: {
    extensions: ["webm"],
    mimeTypes: ["video/webm"],
  },
} as const;

type ImageKind = keyof typeof IMAGE_SIGNATURES;
type VideoKind = keyof typeof VIDEO_SIGNATURES;

export type MediaKind = "image" | "video";

export type ValidatedMediaFile = {
  buffer: Buffer;
  contentType: string;
  extension: string;
  kind: MediaKind;
};

const SAFE_STORAGE_PATH_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._/-]{0,511}$/;

function getSafeExtension(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");
  return ext || "";
}

function hasIsoBrand(buffer: Buffer, brands: string[]) {
  if (buffer.length < 12 || buffer.toString("ascii", 4, 8) !== "ftyp") {
    return false;
  }

  const brandPayload = buffer.toString("ascii", 8, Math.min(buffer.length, 96));
  return brands.some((brand) => brandPayload.includes(brand));
}

function detectImageKind(buffer: Buffer): ImageKind | null {
  if (buffer.length < 12) return null;

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "jpg";
  }

  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "png";
  }

  const gifHeader = buffer.toString("ascii", 0, 6);
  if (gifHeader === "GIF87a" || gifHeader === "GIF89a") {
    return "gif";
  }

  if (
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp";
  }

  if (hasIsoBrand(buffer, ["avif", "avis"])) {
    return "avif";
  }

  if (hasIsoBrand(buffer, ["heic", "heix", "hevc", "hevx", "heif", "mif1", "msf1"])) {
    return "heic";
  }

  return null;
}

function detectVideoKind(buffer: Buffer): VideoKind | null {
  if (buffer.length < 12) return null;

  if (
    buffer[0] === 0x1a &&
    buffer[1] === 0x45 &&
    buffer[2] === 0xdf &&
    buffer[3] === 0xa3
  ) {
    return "webm";
  }

  if (hasIsoBrand(buffer, ["qt  "])) {
    return "mov";
  }

  if (hasIsoBrand(buffer, ["isom", "iso2", "mp41", "mp42", "avc1", "M4V "])) {
    return "mp4";
  }

  return null;
}

function isSafeStoragePath(path: string) {
  return (
    SAFE_STORAGE_PATH_PATTERN.test(path) &&
    !path.startsWith("/") &&
    !path.includes("..") &&
    !path.includes("//")
  );
}

export function isAllowedStoragePath(path: string | null | undefined) {
  return Boolean(path && isSafeStoragePath(path));
}

export async function validateMediaFile(
  file: File,
  options: {
    allowVideo: boolean;
    maxSize: number;
  }
): Promise<ValidatedMediaFile> {
  if (file.size > options.maxSize) {
    throw new Error("File terlalu besar");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const imageKind = detectImageKind(buffer);
  const videoKind = options.allowVideo ? detectVideoKind(buffer) : null;
  const kind = imageKind ? "image" : videoKind ? "video" : null;

  if (!kind) {
    throw new Error(options.allowVideo ? "File harus berupa foto atau video" : "File harus berupa foto");
  }

  const config = imageKind ? IMAGE_SIGNATURES[imageKind] : VIDEO_SIGNATURES[videoKind as VideoKind];
  const extension = getSafeExtension(file.name);

  if (!(config.extensions as readonly string[]).includes(extension)) {
    throw new Error("Ekstensi file tidak sesuai dengan isi file");
  }

  if (file.type && !(config.mimeTypes as readonly string[]).includes(file.type)) {
    throw new Error("Tipe file tidak sesuai dengan isi file");
  }

  return {
    buffer,
    contentType: file.type || config.mimeTypes[0],
    extension,
    kind,
  };
}

export function createStoragePath(prefix: string, extension: string) {
  return `${prefix}_${Date.now()}_${randomUUID()}.${extension}`;
}

export function normalizeStoragePath(value: string | null | undefined, bucket: string) {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  if (isSafeStoragePath(trimmed)) {
    return trimmed;
  }

  try {
    const parsedUrl = new URL(trimmed);
    const decodedPath = decodeURIComponent(parsedUrl.pathname);
    const bucketMarkers = [
      `/storage/v1/object/public/${bucket}/`,
      `/storage/v1/object/sign/${bucket}/`,
      `/storage/v1/render/image/public/${bucket}/`,
      `/storage/v1/render/image/authenticated/${bucket}/`,
    ];

    for (const marker of bucketMarkers) {
      const markerIndex = decodedPath.indexOf(marker);
      if (markerIndex >= 0) {
        const path = decodedPath.slice(markerIndex + marker.length);
        return isSafeStoragePath(path) ? path : null;
      }
    }
  } catch {
    return null;
  }

  return null;
}

export async function createPrivateSignedUrl(bucket: string, path: string | null | undefined) {
  const normalizedPath = normalizeStoragePath(path, bucket);
  if (!normalizedPath) return null;

  const supabase = getServerSupabase();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(normalizedPath, SIGNED_URL_MAX_AGE_SECONDS);

  if (error) {
    console.error("Failed to create signed URL:", error);
    return null;
  }

  return data.signedUrl;
}

export async function createPrivateSignedUrlMap(bucket: string, paths: string[]) {
  const normalizedPaths = Array.from(
    new Set(paths.map((path) => normalizeStoragePath(path, bucket)).filter(Boolean))
  ) as string[];

  if (normalizedPaths.length === 0) {
    return new Map<string, string>();
  }

  const supabase = getServerSupabase();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrls(normalizedPaths, SIGNED_URL_MAX_AGE_SECONDS);

  if (error) {
    console.error("Failed to create signed URLs:", error);
    return new Map<string, string>();
  }

  return new Map(
    (data || [])
      .flatMap((item) =>
        item.path && item.signedUrl ? ([[item.path, item.signedUrl]] as const) : []
      )
  );
}

export function getMediaKindFromPath(path: string): MediaKind | null {
  const ext = getSafeExtension(path);

  if (
    Object.values(IMAGE_SIGNATURES).some((config) =>
      (config.extensions as readonly string[]).includes(ext)
    )
  ) {
    return "image";
  }

  if (
    Object.values(VIDEO_SIGNATURES).some((config) =>
      (config.extensions as readonly string[]).includes(ext)
    )
  ) {
    return "video";
  }

  return null;
}
