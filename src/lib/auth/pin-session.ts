export const PIN_COOKIE_NAME = "pinocare_pin_session";
export const PIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const encoder = new TextEncoder();

function getSessionSecret() {
  return process.env.PIN_SESSION_SECRET || process.env.APP_PIN || "";
}

export function getAppPin() {
  return process.env.APP_PIN || "";
}

export function isPinConfigured() {
  return Boolean(getAppPin());
}

function toHex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function safeEqual(a: string, b: string) {
  const maxLength = Math.max(a.length, b.length);
  let mismatch = a.length === b.length ? 0 : 1;

  for (let i = 0; i < maxLength; i += 1) {
    const left = a.charCodeAt(i) || 0;
    const right = b.charCodeAt(i) || 0;
    mismatch |= left ^ right;
  }

  return mismatch === 0;
}

async function sign(value: string) {
  const secret = getSessionSecret();

  if (!secret) {
    throw new Error("PIN session secret is not configured");
  }

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));

  return toHex(signature);
}

export async function createPinSessionToken() {
  const expiresAt = Date.now() + PIN_SESSION_MAX_AGE_SECONDS * 1000;
  const signature = await sign(String(expiresAt));

  return `${expiresAt}.${signature}`;
}

export async function isValidPinSessionToken(token: string | undefined) {
  if (!token) return false;

  const [expiresAt, signature] = token.split(".");
  const expiresAtNumber = Number(expiresAt);

  if (!expiresAt || !signature || !Number.isFinite(expiresAtNumber)) {
    return false;
  }

  if (expiresAtNumber <= Date.now()) {
    return false;
  }

  try {
    const expectedSignature = await sign(expiresAt);
    return safeEqual(signature, expectedSignature);
  } catch {
    return false;
  }
}

export function verifyPin(pin: string) {
  const appPin = getAppPin();

  if (!appPin) {
    return false;
  }

  return safeEqual(pin.trim(), appPin);
}
