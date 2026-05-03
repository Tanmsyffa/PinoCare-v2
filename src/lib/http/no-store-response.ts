import { NextResponse } from "next/server";

export const NO_STORE_VALUE = "no-store, max-age=0";

export function noStoreJson(body: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Cache-Control", NO_STORE_VALUE);

  return NextResponse.json(body, {
    ...init,
    headers,
  });
}
