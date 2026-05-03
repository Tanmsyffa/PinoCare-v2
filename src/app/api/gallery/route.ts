import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const GALLERY_DIR = path.join(process.cwd(), "public", "images", "fotoDede");

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov"];

export async function GET() {
  try {
    if (!fs.existsSync(GALLERY_DIR)) {
      return NextResponse.json({ media: [] });
    }

    const files = fs.readdirSync(GALLERY_DIR);

    const media = files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return IMAGE_EXTENSIONS.includes(ext) || VIDEO_EXTENSIONS.includes(ext);
      })
      .map((file, index) => {
        const ext = path.extname(file).toLowerCase();
        const isVideo = VIDEO_EXTENSIONS.includes(ext);
        const stats = fs.statSync(path.join(GALLERY_DIR, file));

        return {
          src: `/images/fotoDede/${encodeURIComponent(file)}`,
          filename: file,
          type: isVideo ? "video" : "image",
          size: stats.size,
          modified: stats.mtimeMs,
          // Alternate tall/normal for aesthetic masonry
          span: index % 3 === 0 ? "tall" : "normal",
        };
      })
      // Sort by modified date descending (newest first)
      .sort((a, b) => b.modified - a.modified);

    return NextResponse.json({ media, total: media.length });
  } catch {
    return NextResponse.json({ media: [], error: "Failed to read gallery" }, { status: 500 });
  }
}
