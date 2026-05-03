import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getServerSupabase } from "@/lib/supabase-server";

const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;

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

type ImageKind = keyof typeof IMAGE_SIGNATURES;

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function getSafeExtension(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");
  return ext || "jpg";
}

function hasIsoBrand(buffer: Buffer, brands: string[]) {
  if (buffer.length < 12 || buffer.toString("ascii", 4, 8) !== "ftyp") {
    return false;
  }

  const brandPayload = buffer.toString("ascii", 8, Math.min(buffer.length, 64));
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

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type && !file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      return NextResponse.json({ error: "File size must be 10MB or smaller" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const imageKind = detectImageKind(buffer);

    if (!imageKind) {
      return NextResponse.json({ error: "Invalid image file" }, { status: 400 });
    }

    const imageConfig = IMAGE_SIGNATURES[imageKind];
    const ext = getSafeExtension(file.name);

    if (!(imageConfig.extensions as readonly string[]).includes(ext)) {
      return NextResponse.json({ error: "Image extension does not match file content" }, { status: 400 });
    }

    if (file.type && !(imageConfig.mimeTypes as readonly string[]).includes(file.type)) {
      return NextResponse.json({ error: "Image type does not match file content" }, { status: 400 });
    }

    const fileName = `journal_${Date.now()}_${randomUUID()}.${ext}`;

    // Upload ke Supabase Storage, bucket "journals"
    const supabase = getServerSupabase();
    const { error } = await supabase.storage
      .from("journals")
      .upload(fileName, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });

    if (error) {
      console.error("Supabase Storage error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Dapatkan URL publik untuk gambar
    const { data: publicUrlData } = supabase.storage
      .from("journals")
      .getPublicUrl(fileName);

    return NextResponse.json({
      url: publicUrlData.publicUrl,
    });
  } catch (err: unknown) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: getErrorMessage(err, "Failed to upload file") },
      { status: 500 }
    );
  }
}
