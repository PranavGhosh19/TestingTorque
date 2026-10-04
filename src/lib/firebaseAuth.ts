// Firebase Authentication & Phone OTP Service Layer
// Clean Architecture: Phone Auth -> OTP Verification -> Firebase Auth UID (Primary Identity) -> Firestore users/{uid}

import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  User as FirebaseUser,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

// In-memory reference for the active ConfirmationResult across navigation
let activeConfirmationResult: ConfirmationResult | null = null;
let activeRecaptchaVerifier: RecaptchaVerifier | null = null;

// Browser window augmentation for persistent confirmation reference across page transitions
declare global {
  interface Window {
    __torque_confirmation_result?: ConfirmationResult | null;
    __torque_recaptcha_verifier?: RecaptchaVerifier | null;
  }
}

/**
 * Formats any raw phone input to valid E.164 format (+91XXXXXXXXXX)
 */
export function formatPhoneE164(phone: string, defaultCountryCode: string = '+91'): string {
  if (!phone) return '';
  const trimmed = phone.trim();

  // If already starts with '+', strip spaces and dashes
  if (trimmed.startsWith('+')) {
    return trimmed.replace(/[\s-]/g, '');
  }

  // Extract all digits
  const digits = trimmed.replace(/\D/g, '');

  // 10-digit Indian mobile number
  if (digits.length === 10) {
    return `${defaultCountryCode}${digits}`;
  }

  // 12-digit number starting with 91
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }

  // Fallback: take last 10 digits
  if (digits.length > 10) {
    return `${defaultCountryCode}${digits.slice(-10)}`;
  }

  return `${defaultCountryCode}${digits}`;
}

/**
 * Sets up or retrieves an invisible RecaptchaVerifier attached to the container
 */
export function setupRecaptcha(containerId: string = 'recaptcha-container'): RecaptchaVerifier {
  if (typeof window === 'undefined') {
    throw new Error('reCAPTCHA can only be initialized on the client side');
  }

  // Check if we already have an active verifier on window or memory
  if (activeRecaptchaVerifier) {
    try {
      return activeRecaptchaVerifier;
    } catch {
      activeRecaptchaVerifier = null;
    }
  }

  if (window.__torque_recaptcha_verifier) {
    try {
      activeRecaptchaVerifier = window.__torque_recaptcha_verifier;
      return activeRecaptchaVerifier;
    } catch {
      window.__torque_recaptcha_verifier = null;
    }
  }

  // Ensure DOM container exists
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    document.body.appendChild(container);
  }

  // Clear previous rendered widgets if any
  try {
    container.innerHTML = '';
  } catch (e) {
    // ignore
  }

  const verifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved - allow signInWithPhoneNumber
    },
    'expired-callback': () => {
      console.warn('reCAPTCHA token expired, re-verifying required');
    },
  });

  activeRecaptchaVerifier = verifier;
  window.__torque_recaptcha_verifier = verifier;

  return verifier;
}

/**
 * Resets the reCAPTCHA verifier to avoid widget reuse errors
 */
export function resetRecaptcha(): void {
  if (typeof window !== 'undefined') {
    if (activeRecaptchaVerifier) {
      try {
        activeRecaptchaVerifier.clear();
      } catch (e) {
        // ignore
      }
      activeRecaptchaVerifier = null;
    }
    if (window.__torque_recaptcha_verifier) {
      try {
        window.__torque_recaptcha_verifier.clear();
      } catch (e) {
        // ignore
      }
      window.__torque_recaptcha_verifier = null;
    }
  }
}

/**
 * Sends phone OTP using Firebase Phone Authentication
 * Returns the ConfirmationResult
 */
export async function sendPhoneOtp(
  rawPhone: string,
  containerId: string = 'recaptcha-container'
): Promise<ConfirmationResult> {
  const formattedPhone = formatPhoneE164(rawPhone);
  if (!formattedPhone || formattedPhone.length < 12) {
    throw new Error('Please enter a valid 10-digit mobile number with country code');
  }

  // Setup appVerifier
  let appVerifier: RecaptchaVerifier;
  try {
    appVerifier = setupRecaptcha(containerId);
  } catch (err: any) {
    resetRecaptcha();
    appVerifier = setupRecaptcha(containerId);
  }

  try {
    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
    activeConfirmationResult = confirmationResult;
    if (typeof window !== 'undefined') {
      window.__torque_confirmation_result = confirmationResult;
    }
    return confirmationResult;
  } catch (error: any) {
    console.error('Firebase signInWithPhoneNumber error:', error);
    // Reset recaptcha on failure so the user can retry without getting widget errors
    resetRecaptcha();
    throw error;
  }
}

/**
 * Gets the current active ConfirmationResult from memory or window
 */
export function getConfirmationResult(): ConfirmationResult | null {
  if (activeConfirmationResult) return activeConfirmationResult;
  if (typeof window !== 'undefined' && window.__torque_confirmation_result) {
    return window.__torque_confirmation_result;
  }
  return null;
}

/**
 * Explicitly sets the active ConfirmationResult
 */
export function setConfirmationResult(cr: ConfirmationResult | null): void {
  activeConfirmationResult = cr;
  if (typeof window !== 'undefined') {
    window.__torque_confirmation_result = cr;
  }
}

/**
 * Confirms OTP code and returns the authenticated Firebase User (with stable UID)
 */
export async function verifyPhoneOtp(
  otpCode: string,
  passedConfirmationResult?: ConfirmationResult
): Promise<FirebaseUser> {
  const cr = passedConfirmationResult || getConfirmationResult();
  if (!cr) {
    throw new Error('No active verification session found. Please request a new OTP code.');
  }

  const cleanOtp = otpCode.replace(/\D/g, '');
  if (!cleanOtp) {
    throw new Error('Please enter the verification code');
  }

  const result = await cr.confirm(cleanOtp);
  const user = result.user;

  // Clear confirmation result once confirmed
  activeConfirmationResult = null;
  if (typeof window !== 'undefined') {
    window.__torque_confirmation_result = null;
  }

  return user;
}

/**
 * Writes or updates the primary identity document in Firestore:
 * Firestore -> users/{uid}
 *
 * Stores:
 * - uid: Firebase Auth stable UID (Primary Identity)
 * - phoneNumber: E.164 verified phone number
 * - name: Display name or provided name
 * - role: 'owner' | 'washer' | 'admin'
 * - createdAt / updatedAt
 */
export async function syncAuthUserToFirestore(
  user: { uid: string; phoneNumber?: string | null },
  profileData: {
    name?: string;
    role?: 'owner' | 'washer' | 'admin';
    status?: string;
    [key: string]: any;
  }
): Promise<{ uid: string; name: string; role: string; phoneNumber: string }> {
  const uid = user.uid;
  const phoneNumber = user.phoneNumber || profileData.phone || '';
  const ownerRef = doc(db, 'Car_Owners', uid);

  // Read existing doc if present to preserve fields
  let existingData: any = {};
  try {
    const snap = await getDoc(ownerRef);
    if (snap.exists()) {
      existingData = snap.data();
    }
  } catch (e) {
    // ignore
  }

  const finalRole = profileData.role || existingData.role || 'owner';
  const finalName = profileData.name || existingData.name || 'Vehicle Owner';

  const ownerDocPayload = {
    ownerId: uid,
    id: uid,
    phone: phoneNumber || existingData.phone || '',
    name: finalName,
    role: finalRole,
    status: profileData.status || existingData.status || 'active',
    updatedAt: serverTimestamp(),
    ...(!existingData.createdAt ? { createdAt: serverTimestamp() } : {}),
  };

  await setDoc(ownerRef, ownerDocPayload, { merge: true });

  return {
    uid,
    name: finalName,
    role: finalRole,
    phoneNumber: phoneNumber || existingData.phone || '',
  };
}

/**
 * Fetches customer profile from Car_Owners/{uid} in Firestore
 */
export async function fetchUserFromFirestore(uid: string): Promise<any | null> {
  try {
    const ownerRef = doc(db, 'Car_Owners', uid);
    const snap = await getDoc(ownerRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (error) {
    console.warn('fetchUserFromFirestore error:', error);
    return null;
  }
}

/**
 * Signs out the current Firebase user and resets tokens
 */
export async function signOutFirebaseUser(): Promise<void> {
  try {
    await signOut(auth);
    resetRecaptcha();
    setConfirmationResult(null);
  } catch (error) {
    console.warn('Firebase signOut notice:', error);
  }
}
