// src/lib/mongoose.js
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

/**
 * Mongoose connection helper for Next.js (handles hot-reload in dev)
 * Uses globalThis to cache the connection across module reloads.
 */
let cached = globalThis._mongoose;

if (!cached) {
  cached = globalThis._mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      // Recommended options
      bufferCommands: false,
      // useNewUrlParser / useUnifiedTopology are true by default in modern mongoose versions
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseConn) => {
        return mongooseConn;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
