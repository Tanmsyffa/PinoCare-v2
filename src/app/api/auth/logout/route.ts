import { NextResponse } from "next/server";
import { PIN_COOKIE_NAME } from "@/lib/auth/pin-session";
import { NO_STORE_VALUE } from "@/lib/http/no-store-response";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.headers.set("Cache-Control", NO_STORE_VALUE);

  response.cookies.set(PIN_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });

  return response;
}
