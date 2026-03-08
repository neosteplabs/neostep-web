import "server-only";

import { cert, getApps, initializeApp, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

let app: App;

if (getApps().length > 0) {
  app = getApps()[0];
} else {
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase Admin environment variables are not set properly.");
  }

  app = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);