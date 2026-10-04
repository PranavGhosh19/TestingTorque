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

// Lazy singletons to prevent SSR from opening persistent WebChannel connections in Node.js
let _app: any;
let _auth: any;
let _db: any;
let _storage: any;

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

export default app;
