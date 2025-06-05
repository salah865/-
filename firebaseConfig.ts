import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDummy", // يمكن استخدام مفتاح وهمي للخادم
  authDomain: `${process.env.FIREBASE_PROJECT_ID || 'tajer-ee602'}.firebaseapp.com`,
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID || 'tajer-ee602'}-default-rtdb.firebaseio.com`,
  projectId: process.env.FIREBASE_PROJECT_ID || 'tajer-ee602',
  storageBucket: `${process.env.FIREBASE_PROJECT_ID || 'tajer-ee602'}.firebasestorage.app`,
  messagingSenderId: "429484778644",
  appId: "1:429484778644:web:dummy"
};

// Initialize Firebase for server
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;