import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

let app;

if (getApps().length > 0) {
  app = getApps()[0];
} else if (projectId && clientEmail && privateKey) {
  app = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
} else {
  // During build phase env vars may not exist
  console.warn("Firebase Admin initialized without credentials (build phase)");
  app = initializeApp();
}

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);