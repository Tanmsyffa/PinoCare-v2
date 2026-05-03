const CACHE_NAME = "pinocare-v4";

// Files to cache for offline use
const PRECACHE_URLS = [
  "/unlock",
  "/images/pino-main.png",
  "/images/pino-sad.png",
  "/images/pino-sleeping.png",
  "/images/pino-love.png",
  "/images/pino-zen.png",
];

// Install: cache essential files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        PRECACHE_URLS.map((url) =>
          cache.add(url).catch((error) => {
            console.warn("Failed to precache", url, error);
          })
        )
      );
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

function isProtectedStaticAsset(url) {
  if (url.pathname.startsWith("/images/fotoDede/")) return true;
  if (url.pathname.startsWith("/uploads/")) return true;

  if (url.pathname === "/_next/image") {
    const imageUrl = url.searchParams.get("url") || "";
    return imageUrl.startsWith("/images/fotoDede/") || imageUrl.startsWith("/uploads/");
  }

  return false;
}

// Fetch: network-first for API, cache-first for assets
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Never cache Next.js generated assets. Stale chunks can cause hydration errors.
  if (url.pathname.startsWith("/_next/")) {
    event.respondWith(fetch(request));
    return;
  }

  if (isProtectedStaticAsset(url)) {
    event.respondWith(fetch(request));
    return;
  }

  // Network-first for API routes and navigation, without caching private pages
  if (url.pathname.startsWith("/api/") || request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .catch(async () => {
          if (request.mode === "navigate") return caches.match("/unlock");
          return Response.error();
        })
    );
    return;
  }

  if (url.origin === self.location.origin && PRECACHE_URLS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request);
      })
    );
    return;
  }

  event.respondWith(fetch(request));
});
