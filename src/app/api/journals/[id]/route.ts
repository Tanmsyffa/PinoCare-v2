import { journalIdSchema, journalInputSchema } from "@/features/journal/journal-validation";
import { STORAGE_BUCKETS } from "@/config/storage";
import { requirePinSession } from "@/lib/auth/require-pin-session";
import { noStoreJson } from "@/lib/http/no-store-response";
import {
  createPrivateSignedUrl,
  normalizeStoragePath,
} from "@/lib/supabase/media-storage";
import { getServerSupabase } from "@/lib/supabase/server";

type JournalRow = {
  photo_url: string | null;
  [key: string]: unknown;
};

async function attachSignedPhotoUrl(journal: JournalRow) {
  const photoPath = normalizeStoragePath(journal.photo_url, STORAGE_BUCKETS.journals);

  return {
    ...journal,
    photo_path: photoPath,
    photo_url: await createPrivateSignedUrl(STORAGE_BUCKETS.journals, photoPath),
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authResponse = await requirePinSession(_request);
    if (authResponse) return authResponse;

    const parsedId = journalIdSchema.safeParse(id);
    if (!parsedId.success) {
      return noStoreJson({ error: "Journal ID is invalid" }, { status: 400 });
    }

    const supabase = getServerSupabase();
    const { data: journal, error } = await supabase
      .from("journals")
      .select("*")
      .eq("id", parsedId.data)
      .single();

    if (error) {
      console.error("Supabase GET detail error:", error);
      return noStoreJson({ error: "Journal not found" }, { status: 404 });
    }

    return noStoreJson({ journal: await attachSignedPhotoUrl(journal as JournalRow) }, { status: 200 });
  } catch (err: unknown) {
    console.error("Unexpected error:", err);
    return noStoreJson(
      { error: "Failed to fetch journal" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authResponse = await requirePinSession(request);
    if (authResponse) return authResponse;

    const parsedId = journalIdSchema.safeParse(id);
    if (!parsedId.success) {
      return noStoreJson({ error: "Journal ID is invalid" }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    const parsedJournal = journalInputSchema.safeParse(body);

    if (!parsedJournal.success) {
      return noStoreJson({ error: "Data jurnal tidak valid" }, { status: 400 });
    }

    const { title, content, mood, date, photo_path } = parsedJournal.data;

    const supabase = getServerSupabase();

    // Dapatkan data lama untuk mengecek apakah photo_url diubah/dihapus
    const { data: oldJournal, error: fetchError } = await supabase
      .from("journals")
      .select("photo_url")
      .eq("id", parsedId.data)
      .single();

    if (fetchError) {
      return noStoreJson({ error: "Journal not found" }, { status: 404 });
    }

    const oldPhotoPath = normalizeStoragePath(oldJournal.photo_url, STORAGE_BUCKETS.journals);

    // Jika foto berubah atau dihapus, hapus file lama dari storage
    if (oldPhotoPath && oldPhotoPath !== photo_path) {
      await supabase.storage.from(STORAGE_BUCKETS.journals).remove([oldPhotoPath]);
    }

    const updatedJournal = {
      title,
      content,
      mood,
      date,
      photo_url: photo_path || null,
    };

    const { data: journal, error } = await supabase
      .from("journals")
      .update(updatedJournal)
      .eq("id", parsedId.data)
      .select()
      .single();

    if (error) {
      console.error("Supabase PUT error:", error);
      return noStoreJson({ error: "Failed to update journal" }, { status: 500 });
    }

    return noStoreJson({ journal: await attachSignedPhotoUrl(journal as JournalRow) }, { status: 200 });
  } catch (err: unknown) {
    console.error("Unexpected error:", err);
    return noStoreJson(
      { error: "Failed to update journal" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authResponse = await requirePinSession(request);
    if (authResponse) return authResponse;

    const parsedId = journalIdSchema.safeParse(id);
    if (!parsedId.success) {
      return noStoreJson({ error: "Journal ID is invalid" }, { status: 400 });
    }

    const supabase = getServerSupabase();

    // Ambil data jurnal dulu untuk mengecek apakah ada foto yang perlu dihapus
    const { data: journal, error: fetchError } = await supabase
      .from("journals")
      .select("photo_url")
      .eq("id", parsedId.data)
      .single();

    if (fetchError) {
      return noStoreJson({ error: "Journal not found" }, { status: 404 });
    }

    // Hapus file foto dari Supabase Storage jika ada
    const photoPath = normalizeStoragePath(journal.photo_url, STORAGE_BUCKETS.journals);
    if (photoPath) {
      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKETS.journals)
        .remove([photoPath]);
      if (storageError) {
        console.error("Failed to delete photo from storage:", storageError);
        // Lanjutkan proses penghapusan data di tabel meskipun gagal hapus foto
      }
    }

    // Hapus data dari tabel
    const { error } = await supabase
      .from("journals")
      .delete()
      .eq("id", parsedId.data);

    if (error) {
      console.error("Supabase DELETE error:", error);
      return noStoreJson({ error: "Failed to delete journal" }, { status: 500 });
    }

    return noStoreJson({ success: true }, { status: 200 });
  } catch (err: unknown) {
    console.error("Unexpected error:", err);
    return noStoreJson(
      { error: "Failed to delete journal" },
      { status: 500 }
    );
  }
}
