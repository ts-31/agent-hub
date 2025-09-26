// src/lib/firebaseAdmin.js
import admin from "firebase-admin";

let firebaseAdminApp;

export function getFirebaseAdmin() {
  if (firebaseAdminApp) return firebaseAdminApp;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!raw) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY env variable is missing");
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(raw);
  } catch (err) {
    console.error("Invalid JSON inside FIREBASE_SERVICE_ACCOUNT_KEY:", err);
    throw err;
  }

  // Fix newline characters in private_key if necessary
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
