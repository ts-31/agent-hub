// src/lib/firebaseAdmin.js
import admin from "firebase-admin";
import fs from "fs";
import path from "path";

let firebaseAdminApp;

export function getFirebaseAdmin() {
  if (firebaseAdminApp) return firebaseAdminApp;

  const filePath = path.join(process.cwd(), "serviceAccountKey.json");

  if (!fs.existsSync(filePath)) {
    throw new Error("serviceAccountKey.json not found in project root");
  }

  const raw = fs.readFileSync(filePath, "utf8");
  let serviceAccount;

  try {
    serviceAccount = JSON.parse(raw);
  } catch (err) {
    console.error("Invalid JSON inside serviceAccountKey.json:", err);
    throw err;
  }

  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(
      /\\n/g,
      "\n"
    );
  }

  firebaseAdminApp = admin.apps.length
    ? admin.app()
    : admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

  return firebaseAdminApp;
}
