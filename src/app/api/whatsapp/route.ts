import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getWhatsAppNumber() {
  return (process.env.WHATSAPP_NUMBER || "").replace(/\D/g, "");
}

export function GET(request: NextRequest) {
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
