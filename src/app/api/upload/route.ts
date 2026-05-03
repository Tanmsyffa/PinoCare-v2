import { MAX_JOURNAL_IMAGE_SIZE, STORAGE_BUCKETS } from "@/config/storage";
import { requirePinSession } from "@/lib/auth/require-pin-session";
import { noStoreJson } from "@/lib/http/no-store-response";
import {
  createPrivateSignedUrl,
  createStoragePath,
  validateMediaFile,
} from "@/lib/supabase/media-storage";
import { getServerSupabase } from "@/lib/supabase/server";

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
      allowVideo: false,
      maxSize: MAX_JOURNAL_IMAGE_SIZE,
    });
    const filePath = createStoragePath("journal", mediaFile.extension);

    const supabase = getServerSupabase();
    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS.journals)
      .upload(filePath, mediaFile.buffer, {
        contentType: mediaFile.contentType,
        upsert: false,
      });

    if (error) {
      console.error("Supabase Storage error:", error);
      return noStoreJson({ error: "Failed to upload file" }, { status: 500 });
    }

    const signedUrl = await createPrivateSignedUrl(STORAGE_BUCKETS.journals, filePath);
    if (!signedUrl) {
      await supabase.storage.from(STORAGE_BUCKETS.journals).remove([filePath]);
      return noStoreJson({ error: "Failed to sign uploaded file" }, { status: 500 });
    }

    return noStoreJson({
      path: filePath,
      url: signedUrl,
    });
  } catch (err: unknown) {
    console.error("Upload error:", err);
    return noStoreJson(
      { error: err instanceof Error ? err.message : "Failed to upload file" },
      { status: err instanceof Error ? 400 : 500 }
    );
  }
}
