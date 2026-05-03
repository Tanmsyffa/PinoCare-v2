import { NextResponse, type NextRequest } from "next/server";
import { isValidPinSessionToken, PIN_COOKIE_NAME } from "@/lib/pin-auth";

const PUBLIC_FILE = /\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico|json|js|css|txt|xml|woff2?)$/i;

const PUBLIC_PATHS = new Set([
  "/unlock",
  "/api/auth/pin",
  "/manifest.json",
  "/sw.js",
  "/icon.png",
  "/file.svg",
  "/globe.svg",
  "/next.svg",
  "/vercel.svg",
  "/window.svg",
  "/images/pino-main.png",
  "/images/pino-sad.png",
  "/images/pino-sleeping.png",
  "/images/pino-love.png",
  "/images/pino-zen.png",
]);

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) return true;
  if (pathname.startsWith("/_next/static/")) return true;
  if (pathname.startsWith("/_next/webpack-hmr")) return true;
  if (pathname === "/api/auth/logout") return true;

  return false;
}

function isProtectedAsset(pathname: string) {
  return pathname.startsWith("/images/fotoDede/") || pathname.startsWith("/uploads/");
}

function isProtectedNextImageRequest(request: NextRequest) {
  if (request.nextUrl.pathname !== "/_next/image") return false;

  const imageUrl = request.nextUrl.searchParams.get("url") || "";
  return isProtectedAsset(imageUrl);
}

function isApiPath(pathname: string) {
  return pathname.startsWith("/api/");
}

function isPageRequest(request: NextRequest) {
  const accept = request.headers.get("accept") || "";
  return accept.includes("text/html");
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const isProtectedImage = isProtectedNextImageRequest(request);

  if (PUBLIC_FILE.test(pathname) && !isProtectedAsset(pathname) && !isProtectedImage) {
    return NextResponse.next();
  }

  const token = request.cookies.get(PIN_COOKIE_NAME)?.value;
  const isUnlocked = await isValidPinSessionToken(token);

  if (isUnlocked) {
    return NextResponse.next();
  }

  if (isApiPath(pathname) || isProtectedAsset(pathname) || isProtectedImage) {
    return NextResponse.json({ error: "PIN required" }, { status: 401 });
  }

  if (isPageRequest(request)) {
    const url = request.nextUrl.clone();
    url.pathname = "/unlock";
    url.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  return NextResponse.json({ error: "PIN required" }, { status: 401 });
}

export const config = {
  matcher: ["/((?!_next/static).*)"],
};
