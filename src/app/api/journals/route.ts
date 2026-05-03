import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

// GET - Fetch all journals
export async function GET() {
  try {
    const supabase = getServerSupabase();
    const { data: journals, error } = await supabase
      .from("journals")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error("Supabase GET error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ journals: journals || [] });
  } catch (err: unknown) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Failed to fetch journals" },
      { status: 500 }
    );
  }
}

// POST - Create a new journal
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, mood, date, photo_url } = body;

    if (!title || !content || !mood || !date) {
      return NextResponse.json(
        { error: "Title, content, mood, and date are required" },
        { status: 400 }
      );
    }

    const newJournal = {
      title,
      content,
      mood,
      date,
      photo_url: photo_url || null,
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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ journal }, { status: 201 });
  } catch (err: unknown) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: getErrorMessage(err, "Failed to create journal") },
      { status: 500 }
    );
  }
}
