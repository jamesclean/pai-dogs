import { NextResponse, type NextRequest } from "next/server";

// QR codes encode the URL in uppercase (a smaller, easier-to-engrave code),
// so phones open /D/K7M2X. Serve it as /d/K7M2X without an extra redirect hop
// on slow mobile data. (next.config redirects match case-insensitively, so they
// can't do this.)
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/D/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/d/" + pathname.slice(3);
    return NextResponse.rewrite(url);
  }
}

export const config = { matcher: "/D/:path*" };
