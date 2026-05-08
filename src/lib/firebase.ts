import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

let authInstance: Auth | null = null;

export function getClientAuth() {
  if (typeof window === "undefined") {
    throw new Error("Firebase Auth can only be used in the browser.");
  }

  if (!authInstance) {
    authInstance = getAuth(firebaseApp);
  }

  return authInstance;
}

export const googleProvider = new GoogleAuthProvider();

let analyticsInstance: Analytics | null = null;

export async function getFirebaseAnalytics() {
  if (typeof window === "undefined") return null;
  if (analyticsInstance) return analyticsInstance;

  const supported = await isSupported();
  if (!supported) return null;

  analyticsInstance = getAnalytics(firebaseApp);
  return analyticsInstance;
}
