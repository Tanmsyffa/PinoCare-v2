import { NextRequest, NextResponse } from "next/server";
import {
  createPinSessionToken,
  isPinConfigured,
  PIN_COOKIE_NAME,
  PIN_SESSION_MAX_AGE_SECONDS,
  verifyPin,
} from "@/lib/auth/pin-session";
import { NO_STORE_VALUE, noStoreJson } from "@/lib/http/no-store-response";
import {
  checkPinRateLimit,
  clearPinRateLimit,
  recordFailedPinAttempt,
} from "@/lib/auth/pin-rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isPinConfigured()) {
    return noStoreJson(
      { error: "PIN belum dikonfigurasi" },
      { status: 500 }
    );
  }

  const rateLimit = checkPinRateLimit(request);
  if (!rateLimit.allowed) {
    return noStoreJson(
      { error: "Terlalu banyak percobaan PIN. Coba lagi nanti." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds || 60) },
      }
    );
  }

  const body = await request.json().catch(() => null);
  const pin = typeof body?.pin === "string" ? body.pin : "";

  if (!verifyPin(pin)) {
    const failedAttempt = recordFailedPinAttempt(request);
    if (!failedAttempt.allowed) {
      return noStoreJson(
        { error: "Terlalu banyak percobaan PIN. Coba lagi nanti." },
        {
          status: 429,
          headers: { "Retry-After": String(failedAttempt.retryAfterSeconds || 60) },
        }
      );
    }

    return noStoreJson({ error: "PIN salah" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  const token = await createPinSessionToken();
  clearPinRateLimit(request);
  response.headers.set("Cache-Control", NO_STORE_VALUE);

  response.cookies.set(PIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: PIN_SESSION_MAX_AGE_SECONDS,
    path: "/",
  });

  return response;
}
