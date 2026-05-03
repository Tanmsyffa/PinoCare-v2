import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-server";

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

// Helper untuk mengekstrak nama file dari public URL
function getFileNameFromUrl(url: string | null) {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    const pathnameParts = urlObj.pathname.split("/");
    return pathnameParts[pathnameParts.length - 1];
  } catch {
    return url.split("/").pop() || null;
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Journal ID is required" }, { status: 400 });
    }

    const supabase = getServerSupabase();
    const { data: journal, error } = await supabase
      .from("journals")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Supabase GET detail error:", error);
      return NextResponse.json({ error: "Journal not found" }, { status: 404 });
    }

    return NextResponse.json({ journal }, { status: 200 });
  } catch (err: unknown) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: getErrorMessage(err, "Failed to fetch journal") },
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
    if (!id) {
      return NextResponse.json({ error: "Journal ID is required" }, { status: 400 });
    }

    const body = await request.json();
    const { title, content, mood, date, photo_url } = body;

    const supabase = getServerSupabase();

    // Dapatkan data lama untuk mengecek apakah photo_url diubah/dihapus
    const { data: oldJournal, error: fetchError } = await supabase
      .from("journals")
      .select("photo_url")
      .eq("id", id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: "Journal not found" }, { status: 404 });
    }

    // Jika photo_url berubah dan ada foto lama, hapus foto lama dari storage
    if (oldJournal.photo_url && oldJournal.photo_url !== photo_url) {
      const oldFileName = getFileNameFromUrl(oldJournal.photo_url);
      if (oldFileName) {
        await supabase.storage.from("journals").remove([oldFileName]);
      }
    }

    const updatedJournal = {
      title,
      content,
      mood,
      date,
      photo_url: photo_url || null,
    };

    const { data: journal, error } = await supabase
      .from("journals")
      .update(updatedJournal)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase PUT error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ journal }, { status: 200 });
  } catch (err: unknown) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: getErrorMessage(err, "Failed to update journal") },
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
    if (!id) {
      return NextResponse.json({ error: "Journal ID is required" }, { status: 400 });
    }

    const supabase = getServerSupabase();

    // Ambil data jurnal dulu untuk mengecek apakah ada foto yang perlu dihapus
    const { data: journal, error: fetchError } = await supabase
      .from("journals")
      .select("photo_url")
      .eq("id", id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: "Journal not found" }, { status: 404 });
    }

    // Hapus file foto dari Supabase Storage jika ada
    if (journal.photo_url) {
      const fileName = getFileNameFromUrl(journal.photo_url);
      if (fileName) {
        const { error: storageError } = await supabase.storage
          .from("journals")
          .remove([fileName]);
        if (storageError) {
          console.error("Failed to delete photo from storage:", storageError);
          // Lanjutkan proses penghapusan data di tabel meskipun gagal hapus foto
        }
      }
    }

    // Hapus data dari tabel
    const { error } = await supabase
      .from("journals")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase DELETE error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: unknown) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: getErrorMessage(err, "Failed to delete journal") },
      { status: 500 }
    );
  }
}
