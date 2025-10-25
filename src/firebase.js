import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCKkLlChl2gg9WlbZ3KMp4EKRZhYDr2NU0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "stock-broker-a8511.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "stock-broker-a8511",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "stock-broker-a8511.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "118891476575",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:118891476575:web:46b93557b65da607924dea",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-0X8SK2E66H"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
