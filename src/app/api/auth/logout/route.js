// src/app/api/auth/logout/route.js
import { NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebaseAdmin";

export async function POST(req) {
  console.log("Req comes to Logout");
  try {
    // read session cookie from request
    const sessionCookie = req.cookies?.get?.("session")?.value || null;
    console.log("Cookies reading at Logout");
    const admin = getFirebaseAdmin();
    const isProd = process.env.NODE_ENV === "production";

    if (sessionCookie) {
      try {
        // Verify and check revoked state (true) to ensure fresh validation
        const decoded = await admin
          .auth()
          .verifySessionCookie(sessionCookie, true);
        const uid = decoded.uid;

        // Revoke refresh tokens for the user so the session is invalidated server-side
        await admin.auth().revokeRefreshTokens(uid);

        // Note: revoking refresh tokens does not immediately invalidate existing session cookies,
        // but verifySessionCookie(..., true) above will detect revoked sessions on verify.
        // Clearing the cookie below ensures client no longer sends it.
      } catch (e) {
        // If verification fails, just log lightly and continue to clear cookie (idempotent)
        console.log(
          "Session cookie verify/revoke failed (maybe already revoked):",
          e?.message || e
        );
      }
    }

    // Prepare response and clear the cookie
    const res = NextResponse.json(
      { ok: true, message: "Logged out" },
      { status: 200 }
    );

    // Clear cookie on client (maxAge: 0)
    res.cookies.set("session", "", {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return res;
  } catch (err) {
    console.log("Logout error:", err?.message || err);
    return NextResponse.json(
      { ok: false, error: "Logout failed" },
      { status: 500 }
    );
  }
}
