import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { detectLocaleFromPath } from "@/lib/i18n/routing";

export function middleware(request: NextRequest) {
  const locale = detectLocaleFromPath(request.nextUrl.pathname);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-locale", locale);
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};