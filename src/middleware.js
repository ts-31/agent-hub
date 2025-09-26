import { NextResponse } from "next/server";

export function middleware(req) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  const SESSION_COOKIE_NAME = "session";
  const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  // Not logged in → block /chat
  if (!sessionCookie && pathname.startsWith("/chat")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Logged in → redirect from / (home page with login modal) to /chat
  if (sessionCookie && pathname === "/") {
    return NextResponse.redirect(new URL("/chat", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/chat"],
};
