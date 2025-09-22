// src/app/api/ping/route.js
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import User from "@/models/User";
import Project from "@/models/Project";
import Message from "@/models/Message";

export async function GET() {
  try {
    await dbConnect();

    // lightweight checks (counts)
    const [usersCount, projectsCount, messagesCount] = await Promise.all([
      User.countDocuments().catch(() => 0),
      Project.countDocuments().catch(() => 0),
      Message.countDocuments().catch(() => 0),
    ]);

    return NextResponse.json({
      status: "ok",
      ts: new Date().toISOString(),
      usersCount,
      projectsCount,
      messagesCount,
    });
  } catch (err) {
    console.error("DB connection error:", err);
    return NextResponse.json(
      { status: "error", message: err.message },
      { status: 500 }
    );
  }
}
