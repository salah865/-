import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyA_75j1IeWUEiiMzy6h92ArqcKGsrUdGpw",
  authDomain: `${process.env.VITE_FIREBASE_PROJECT_ID || "tajer-ee602"}.firebaseapp.com`,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "tajer-ee602",
  storageBucket: `${process.env.VITE_FIREBASE_PROJECT_ID || "tajer-ee602"}.firebasestorage.app`,
  appId: process.env.VITE_FIREBASE_APP_ID || "1:301383072900:android:161e7695aabaea5ffd56d1",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

console.log('🔥 Firebase تم تهيئته بنجاح للمشروع:', firebaseConfig.projectId);