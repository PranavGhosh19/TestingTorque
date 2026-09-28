import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyC3m0jvG-VnQDeLOuAKPPquhW-8Vnhgywg",
  authDomain: "cargoflow-j35du.firebaseapp.com",
  projectId: "cargoflow-j35du",
  storageBucket: "cargoflow-j35du.firebasestorage.app",
  messagingSenderId: "866863583313",
  appId: "1:866863583313:web:8164df2f5bfab9aa7b6870"
};

// Initialize Firebase safely for Next.js SSR and client side
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
