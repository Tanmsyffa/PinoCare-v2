import { isValidPinSessionToken, PIN_COOKIE_NAME } from "@/lib/auth/pin-session";
import { noStoreJson } from "@/lib/http/no-store-response";

function getCookieValue(cookieHeader: string | null, name: string) {
  if (!cookieHeader) return undefined;

  const cookies = cookieHeader.split(";");
  for (const cookie of cookies) {
    const [rawKey, ...rawValue] = cookie.trim().split("=");
    if (rawKey === name) {
      try {
        return decodeURIComponent(rawValue.join("="));
      } catch {
        return undefined;
      }
    }
  }

  return undefined;
}

export async function requirePinSession(request: Request) {
  const token = getCookieValue(request.headers.get("cookie"), PIN_COOKIE_NAME);
  const isUnlocked = await isValidPinSessionToken(token);

  if (isUnlocked) {
    return null;
  }

  return noStoreJson({ error: "PIN required" }, { status: 401 });
}
