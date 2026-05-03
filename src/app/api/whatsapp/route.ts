import { NextRequest, NextResponse } from "next/server";
import { requirePinSession } from "@/lib/auth/require-pin-session";

export const dynamic = "force-dynamic";

function getWhatsAppNumber() {
  return (process.env.WHATSAPP_NUMBER || "").replace(/\D/g, "");
}

export async function GET(request: NextRequest) {
  const authResponse = await requirePinSession(request);
  if (authResponse) return authResponse;

  const phoneNumber = getWhatsAppNumber();

  if (!phoneNumber) {
    return NextResponse.json(
      { error: "WhatsApp number is not configured" },
      { status: 500 }
    );
  }

  const message = request.nextUrl.searchParams.get("text") || "";
  const url = new URL("whatsapp://send");
  url.searchParams.set("phone", phoneNumber);

  if (message) {
    url.searchParams.set("text", message);
  }

  return new NextResponse(null, {
    status: 302,
    headers: {
      Location: url.toString(),
    },
  });
}
