// src/app/api/projects/route.js
import { NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebaseAdmin";
import { dbConnect } from "@/lib/mongoose";
import Project from "@/models/Project";
import User from "@/models/User";

export async function POST(req) {
  try {
    const cookies = req.cookies;
    const sessionCookie = cookies.get("session")?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const admin = getFirebaseAdmin();
    const decoded = await admin.auth().verifySessionCookie(sessionCookie, true);

    await dbConnect();

    const user = await User.findOne({ firebaseUid: decoded.uid }).exec();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "User not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { name, description, systemPrompt, meta } = body;

    if (!name) {
      return NextResponse.json(
        { ok: false, error: "Project name is required" },
        { status: 400 }
      );
    }

    const project = await Project.create({
      userId: user._id,
      name,
      description,
      systemPrompt,
      meta,
    });

    return NextResponse.json({ ok: true, project }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: "Failed to create project" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const cookies = req.cookies;
    const sessionCookie = cookies.get("session")?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const admin = getFirebaseAdmin();
    const decoded = await admin.auth().verifySessionCookie(sessionCookie, true);

    await dbConnect();

    const user = await User.findOne({ firebaseUid: decoded.uid }).exec();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "User not found" },
        { status: 404 }
      );
    }

    const projects = await Project.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .exec();

    return NextResponse.json({ ok: true, projects }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
