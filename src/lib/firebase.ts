import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyDdqU-AV0L_Pad7WSBk_Rvq4hlRzOq6OjM",
  authDomain: "torque-care.firebaseapp.com",
  projectId: "torque-care",
  storageBucket: "torque-care.firebasestorage.app",
  messagingSenderId: "567424583412",
  appId: "1:567424583412:web:c06fe86657c3b620a940a1",
  measurementId: "G-8G1THXMJ1F"
};

// Lazy singletons to prevent SSR from opening persistent WebChannel connections in Node.js
let _app: any;
let _auth: any;
let _db: any;
let _storage: any;
let _analytics: any;

export function getSafeApp() {
  if (!_app) {
    _app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }
  return _app;
}

export function getSafeAuth() {
  if (!_auth) {
    _auth = getAuth(getSafeApp());
  }
  return _auth;
}

export function getSafeDb() {
  if (!_db) {
    _db = getFirestore(getSafeApp());
  }
  return _db;
}

export function getSafeStorage() {
  if (!_storage) {
    _storage = getStorage(getSafeApp());
  }
  return _storage;
}

export function getSafeAnalytics() {
  if (typeof window !== 'undefined' && !_analytics) {
    try {
      _analytics = getAnalytics(getSafeApp());
    } catch {
      // Analytics might not be supported in some environments (e.g., SSR or disabled storage)
    }
  }
  return _analytics;
}

export const app = typeof window !== 'undefined'
  ? getSafeApp()
  : (new Proxy({} as any, { get: (_, prop) => (getSafeApp() as any)[prop] }));

export const auth = typeof window !== 'undefined'
  ? getSafeAuth()
  : (new Proxy({} as any, { get: (_, prop) => (getSafeAuth() as any)[prop] }));

export const db = typeof window !== 'undefined'
  ? getSafeDb()
  : (new Proxy({} as any, { get: (_, prop) => (getSafeDb() as any)[prop] }));

export const storage = typeof window !== 'undefined'
  ? getSafeStorage()
  : (new Proxy({} as any, { get: (_, prop) => (getSafeStorage() as any)[prop] }));

export const analytics = typeof window !== 'undefined'
  ? getSafeAnalytics()
  : null;

export default app;
