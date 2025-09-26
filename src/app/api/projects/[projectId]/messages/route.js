// src/app/api/projects/[projectId]/messages/route.js
import { NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebaseAdmin";
import { dbConnect } from "@/lib/mongoose";
import Project from "@/models/Project";
import User from "@/models/User";
import Message from "@/models/Message";

export async function GET(req, { params }) {
  try {
    const { projectId } = params || {};
    if (!projectId) {
      return NextResponse.json(
        { ok: false, error: "Missing projectId" },
        { status: 400 }
      );
    }

    // read session cookie (same pattern as your other routes)
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
    if (!decoded) {
      return NextResponse.json(
        { ok: false, error: "Invalid session" },
        { status: 401 }
      );
    }

    await dbConnect();

    // find app user by firebaseUid
    const user = await User.findOne({ firebaseUid: decoded.uid }).exec();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "User not found" },
        { status: 404 }
      );
    }

    // find project and ensure it belongs to user
    const project = await Project.findById(projectId).exec();
    if (!project) {
      return NextResponse.json(
        { ok: false, error: "Project not found" },
        { status: 404 }
      );
    }

    if (project.userId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { ok: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // fetch messages (oldest -> newest)
    const messages = await Message.find({ projectId: project._id })
      .sort({ createdAt: 1 })
      .lean()
      .exec();

    return NextResponse.json({ ok: true, messages }, { status: 200 });
  } catch (err) {
    console.log("Failed to fetch messages:", err?.message || err);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
