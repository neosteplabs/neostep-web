import "server-only";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  throw new Error("Firebase Admin environment variables are not set properly.");
}

const firebaseAdminConfig = {
  credential: cert({
    projectId,
    clientEmail,
    privateKey,
  }),
};

const app = getApps().length
  ? getApps()[0]
  : initializeApp(firebaseAdminConfig);

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);