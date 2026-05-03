import { journalInputSchema } from "@/features/journal/journal-validation";
import { STORAGE_BUCKETS } from "@/config/storage";
import { requirePinSession } from "@/lib/auth/require-pin-session";
import { noStoreJson } from "@/lib/http/no-store-response";
import {
  createPrivateSignedUrlMap,
  normalizeStoragePath,
} from "@/lib/supabase/media-storage";
import { getServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type JournalRow = {
  photo_url: string | null;
  [key: string]: unknown;
};

async function attachSignedPhotoUrls(journals: JournalRow[]) {
  const photoPaths = journals
    .map((journal) => normalizeStoragePath(journal.photo_url, STORAGE_BUCKETS.journals))
    .filter(Boolean) as string[];
  const signedUrls = await createPrivateSignedUrlMap(STORAGE_BUCKETS.journals, photoPaths);

  return journals.map((journal) => {
    const photoPath = normalizeStoragePath(journal.photo_url, STORAGE_BUCKETS.journals);

    return {
      ...journal,
      photo_path: photoPath,
      photo_url: photoPath ? signedUrls.get(photoPath) || null : null,
    };
  });
}

// GET - Fetch all journals
export async function GET(request: Request) {
  try {
    const authResponse = await requirePinSession(request);
    if (authResponse) return authResponse;

    const supabase = getServerSupabase();
    const { data: journals, error } = await supabase
      .from("journals")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error("Supabase GET error:", error);
      return noStoreJson({ error: "Failed to fetch journals" }, { status: 500 });
    }

    return noStoreJson({
      journals: await attachSignedPhotoUrls((journals || []) as JournalRow[]),
    });
  } catch (err: unknown) {
    console.error("Unexpected error:", err);
    return noStoreJson(
      { error: "Failed to fetch journals" },
      { status: 500 }
    );
  }
}

// POST - Create a new journal
export async function POST(request: Request) {
  try {
    const authResponse = await requirePinSession(request);
    if (authResponse) return authResponse;

    const body = await request.json().catch(() => null);
    const parsedJournal = journalInputSchema.safeParse(body);

    if (!parsedJournal.success) {
      return noStoreJson({ error: "Data jurnal tidak valid" }, { status: 400 });
    }

    const { title, content, mood, date, photo_path } = parsedJournal.data;

    const newJournal = {
      title,
      content,
      mood,
      date,
      photo_url: photo_path || null,
      // created_at is usually handled by Supabase default values, 
      // but we can pass it if the schema doesn't default it.
      created_at: new Date().toISOString(),
    };

    const supabase = getServerSupabase();
    const { data: journal, error } = await supabase
      .from("journals")
      .insert([newJournal])
      .select()
      .single();

    if (error) {
      console.error("Supabase POST error:", error);
      return noStoreJson({ error: "Failed to create journal" }, { status: 500 });
    }

    const [journalWithSignedPhoto] = await attachSignedPhotoUrls([journal as JournalRow]);
    return noStoreJson({ journal: journalWithSignedPhoto }, { status: 201 });
  } catch (err: unknown) {
    console.error("Unexpected error:", err);
    return noStoreJson(
      { error: "Failed to create journal" },
      { status: 500 }
    );
  }
}
