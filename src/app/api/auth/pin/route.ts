import { NextRequest, NextResponse } from "next/server";
import {
  createPinSessionToken,
  isPinConfigured,
  PIN_COOKIE_NAME,
  PIN_SESSION_MAX_AGE_SECONDS,
  verifyPin,
} from "@/lib/pin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isPinConfigured()) {
    return NextResponse.json(
      { error: "PIN belum dikonfigurasi" },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null);
  const pin = typeof body?.pin === "string" ? body.pin : "";

  if (!verifyPin(pin)) {
    return NextResponse.json({ error: "PIN salah" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  const token = await createPinSessionToken();

  response.cookies.set(PIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: PIN_SESSION_MAX_AGE_SECONDS,
    path: "/",
  });

  return response;
}
