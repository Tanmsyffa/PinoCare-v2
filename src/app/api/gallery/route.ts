import { MAX_GALLERY_MEDIA_SIZE, STORAGE_BUCKETS } from "@/config/storage";
import { requirePinSession } from "@/lib/auth/require-pin-session";
import { noStoreJson } from "@/lib/http/no-store-response";
import {
  createPrivateSignedUrl,
  createPrivateSignedUrlMap,
  createStoragePath,
  getMediaKindFromPath,
  normalizeStoragePath,
  validateMediaFile,
} from "@/lib/supabase/media-storage";
import { getServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type GalleryMedia = {
  src: string;
  path: string;
  filename: string;
  type: "image" | "video";
  size: number;
  modified: number;
  span: "normal" | "tall";
};

function getFileTimestamp(file: { updated_at?: string | null; created_at?: string | null }) {
  return Date.parse(file.updated_at || file.created_at || "") || Date.now();
}

function getFileSize(file: { metadata?: Record<string, unknown> | null }) {
  const size = file.metadata?.size;
  return typeof size === "number" ? size : 0;
}

export async function GET(request: Request) {
  try {
    const authResponse = await requirePinSession(request);
    if (authResponse) return authResponse;

    const supabase = getServerSupabase();
    const { data: files, error } = await supabase.storage.from(STORAGE_BUCKETS.gallery).list("", {
      limit: 1000,
      offset: 0,
      sortBy: { column: "updated_at", order: "desc" },
    });

    if (error) {
      console.error("Supabase Gallery list error:", error);
      return noStoreJson({ media: [], error: "Failed to read gallery" }, { status: 500 });
    }

    const mediaFiles = (files || [])
      .filter((file) => Boolean(file.id))
      .map((file) => ({
        file,
        type: getMediaKindFromPath(file.name),
      }))
      .filter((item): item is { file: NonNullable<typeof files>[number]; type: "image" | "video" } =>
        Boolean(item.type)
      );

    const signedUrls = await createPrivateSignedUrlMap(
      STORAGE_BUCKETS.gallery,
      mediaFiles.map((item) => item.file.name)
    );

    const media: GalleryMedia[] = mediaFiles
      .map((item, index) => ({
        src: signedUrls.get(item.file.name) || "",
        path: item.file.name,
        filename: item.file.name,
        type: item.type,
        size: getFileSize(item.file),
        modified: getFileTimestamp(item.file),
        span: (index % 3 === 0 ? "tall" : "normal") as GalleryMedia["span"],
      }))
      .filter((item) => Boolean(item.src))
      .sort((a, b) => b.modified - a.modified);

    return noStoreJson({ media, total: media.length });
  } catch (err: unknown) {
    console.error("Gallery GET error:", err);
    return noStoreJson({ media: [], error: "Failed to read gallery" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authResponse = await requirePinSession(request);
    if (authResponse) return authResponse;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return noStoreJson({ error: "No file provided" }, { status: 400 });
    }

    const mediaFile = await validateMediaFile(file, {
      allowVideo: true,
      maxSize: MAX_GALLERY_MEDIA_SIZE,
    });
    const filePath = createStoragePath("gallery", mediaFile.extension);
    const supabase = getServerSupabase();

    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS.gallery)
      .upload(filePath, mediaFile.buffer, {
        contentType: mediaFile.contentType,
        upsert: false,
      });

    if (error) {
      console.error("Supabase Gallery upload error:", error);
      return noStoreJson({ error: "Failed to upload media" }, { status: 500 });
    }

    const signedUrl = await createPrivateSignedUrl(STORAGE_BUCKETS.gallery, filePath);
    if (!signedUrl) {
      await supabase.storage.from(STORAGE_BUCKETS.gallery).remove([filePath]);
      return noStoreJson({ error: "Failed to sign uploaded media" }, { status: 500 });
    }

    return noStoreJson(
      {
        media: {
          src: signedUrl,
          path: filePath,
          filename: filePath,
          type: mediaFile.kind,
          size: file.size,
          modified: Date.now(),
          span: "normal",
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("Gallery upload error:", err);
    return noStoreJson(
      { error: err instanceof Error ? err.message : "Failed to upload media" },
      { status: err instanceof Error ? 400 : 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const authResponse = await requirePinSession(request);
    if (authResponse) return authResponse;

    const body = await request.json().catch(() => null);
    const filePath = normalizeStoragePath(
      typeof body?.path === "string" ? body.path : null,
      STORAGE_BUCKETS.gallery
    );

    if (!filePath) {
      return noStoreJson({ error: "Media path is invalid" }, { status: 400 });
    }

    const supabase = getServerSupabase();
    const { error } = await supabase.storage.from(STORAGE_BUCKETS.gallery).remove([filePath]);

    if (error) {
      console.error("Supabase Gallery delete error:", error);
      return noStoreJson({ error: "Failed to delete media" }, { status: 500 });
    }

    return noStoreJson({ success: true });
  } catch (err: unknown) {
    console.error("Gallery delete error:", err);
    return noStoreJson({ error: "Failed to delete media" }, { status: 500 });
  }
}
