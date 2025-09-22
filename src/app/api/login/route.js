// src/app/api/auth/login/route.js
import { NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebaseAdmin";
import { dbConnect } from "@/lib/mongoose";
import User from "@/models/User";

export async function POST(req) {
  try {
    const authHeader = req.headers.get("authorization");
    let idToken = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      idToken = authHeader.split(" ")[1];
    } else {
      const body = await req.json().catch(() => ({}));
      idToken = body?.idToken || null;
    }

    if (!idToken) {
      return NextResponse.json(
        { ok: false, error: "Missing idToken" },
        { status: 400 }
      );
    }

    const admin = getFirebaseAdmin();

    const decoded = await admin.auth().verifyIdToken(idToken);

    const firebaseUser = await admin.auth().getUser(decoded.uid);

    await dbConnect();

    const email = firebaseUser.email || decoded.email || null;
    const name = firebaseUser.displayName || decoded.name || null;

    let user = null;
    if (email) {
      user = await User.findOne({ email }).exec();
    }

    if (!user) {
      user = await User.create({
        email,
        name,
      });
    } else {
      if (!user.name && name) {
        user.name = name;
        await user.save();
      }
    }

    const expiresIn = 14 * 24 * 60 * 60 * 1000; // 14 days in ms
    const sessionCookie = await admin
      .auth()
      .createSessionCookie(idToken, { expiresIn });

    const res = NextResponse.json(
      {
        ok: true,
        message: "Token verified and session cookie set",
        uid: decoded.uid,
        email,
        name,
        userId: user?._id || null,
      },
      { status: 200 }
    );

    const isProd = process.env.NODE_ENV === "production";
    const maxAgeSeconds = 14 * 24 * 60 * 60; // 14 days in seconds

    res.cookies.set("session", sessionCookie, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: maxAgeSeconds,
    });

    return res;
  } catch (err) {
    console.error("❌ Token verification / login failed:", err);
    return NextResponse.json(
      { ok: false, error: "Invalid or expired token" },
      { status: 401 }
    );
  }
}
