const WINDOW_MS = 10 * 60 * 1000;
const LOCK_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

type RateLimitEntry = {
  attempts: number;
  resetAt: number;
  lockedUntil: number;
};

type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds?: number;
};

const attemptsByClient = new Map<string, RateLimitEntry>();

function getClientKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const forwardedIp = forwardedFor?.split(",")[0]?.trim();

  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    forwardedIp ||
    "unknown"
  );
}

function getActiveEntry(key: string, now: number) {
  const entry = attemptsByClient.get(key);
  if (!entry || entry.resetAt <= now) {
    return {
      attempts: 0,
      resetAt: now + WINDOW_MS,
      lockedUntil: 0,
    };
  }

  return entry;
}

function retryAfter(lockedUntil: number, now: number) {
  return Math.max(1, Math.ceil((lockedUntil - now) / 1000));
}

export function checkPinRateLimit(request: Request): RateLimitResult {
  const now = Date.now();
  const key = getClientKey(request);
  const entry = getActiveEntry(key, now);

  if (entry.lockedUntil > now) {
    attemptsByClient.set(key, entry);
    return {
      allowed: false,
      retryAfterSeconds: retryAfter(entry.lockedUntil, now),
    };
  }

  attemptsByClient.set(key, entry);
  return { allowed: true };
}

export function recordFailedPinAttempt(request: Request): RateLimitResult {
  const now = Date.now();
  const key = getClientKey(request);
  const entry = getActiveEntry(key, now);

  entry.attempts += 1;
  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCK_MS;
  }

  attemptsByClient.set(key, entry);

  if (entry.lockedUntil > now) {
    return {
      allowed: false,
      retryAfterSeconds: retryAfter(entry.lockedUntil, now),
    };
  }

  return { allowed: true };
}

export function clearPinRateLimit(request: Request) {
  attemptsByClient.delete(getClientKey(request));
}
