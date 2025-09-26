// middleware.js
import { NextResponse } from "next/server";

export function middleware(req) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  const SESSION_COOKIE_NAME = "session";
  const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  // Block access to /chat if not logged in
  if (!sessionCookie && pathname.startsWith("/chat")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/chat"],
};
