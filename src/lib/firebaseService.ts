import { db, storage } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { User, Vehicle, WashRecord } from './types';

/**
 * Saves or updates a user/owner profile in Firestore.
 */
export async function syncOwnerToFirestore(
  owner: User,
  vehicles?: Vehicle[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const userRef = doc(db, 'users', owner.id);
    await setDoc(
      userRef,
      {
        ...owner,
        updated_at: serverTimestamp(),
      },
      { merge: true }
    );

    if (vehicles && vehicles.length > 0) {
      for (const vehicle of vehicles) {
        const vehicleRef = doc(db, 'vehicles', vehicle.id);
        await setDoc(
          vehicleRef,
          {
            ...vehicle,
            updated_at: serverTimestamp(),
          },
          { merge: true }
        );
      }
    }

    return { success: true };
  } catch (error: any) {
    console.warn('Firebase syncOwnerToFirestore notice:', error?.message || error);
    return { success: false, error: error?.message || 'Sync failed' };
  }
}

/**
 * Saves a vehicle record to Firestore.
 */
export async function syncVehicleToFirestore(
  vehicle: Vehicle
): Promise<{ success: boolean; error?: string }> {
  try {
    const vehicleRef = doc(db, 'vehicles', vehicle.id);
    await setDoc(
      vehicleRef,
      {
        ...vehicle,
        updated_at: serverTimestamp(),
      },
      { merge: true }
    );
    return { success: true };
  } catch (error: any) {
    console.warn('Firebase syncVehicleToFirestore notice:', error?.message || error);
    return { success: false, error: error?.message || 'Sync failed' };
  }
}

/**
 * Saves a wash record or proof submission to Firestore.
 */
export async function syncWashRecordToFirestore(
  wash: WashRecord
): Promise<{ success: boolean; error?: string }> {
  try {
    const washRef = doc(db, 'washes', wash.id);
    await setDoc(
      washRef,
      {
        ...wash,
        updated_at: serverTimestamp(),
      },
      { merge: true }
    );
    return { success: true };
  } catch (error: any) {
    console.warn('Firebase syncWashRecordToFirestore notice:', error?.message || error);
    return { success: false, error: error?.message || 'Sync failed' };
  }
}

/**
 * Optional helper to upload base64 or data URL proof image to Firebase Storage.
 */
export async function uploadProofPhotoToStorage(
  washId: string,
  dataUrlOrBase64: string
): Promise<string | null> {
  try {
    if (!dataUrlOrBase64.startsWith('data:')) {
      // If it's a relative URL or placeholder, return as is
      return dataUrlOrBase64;
    }
    const storageRef = ref(storage, `proofs/${washId}_${Date.now()}.jpg`);
    await uploadString(storageRef, dataUrlOrBase64, 'data_url');
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (error: any) {
    console.warn('Firebase Storage upload notice:', error?.message || error);
    return null;
  }
}
