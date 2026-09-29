import { db, storage } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  addDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { User, Vehicle, WashRecord } from './types';
import { WasherPartner } from './washerPartners';

/**
 * Saves or updates a user/owner profile and their registered vehicles in Firestore.
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
        role: 'owner',
        created_at: owner.created_at || new Date().toISOString(),
        last_login_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      },
      { merge: true }
    );

    // Save login/signup event to auth_logs collection
    try {
      await addDoc(collection(db, 'auth_logs'), {
        user_id: owner.id,
        name: owner.name,
        phone: owner.phone,
        role: 'owner',
        event: 'owner_registered',
        timestamp: serverTimestamp(),
      });
    } catch (logErr) {
      // Non-blocking log warning
      console.warn('Auth log write notice:', logErr);
    }

    if (vehicles && vehicles.length > 0) {
      for (const vehicle of vehicles) {
        const vehicleRef = doc(db, 'vehicles', vehicle.id);
        await setDoc(
          vehicleRef,
          {
            ...vehicle,
            owner_id: owner.id,
            owner_name: owner.name,
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
 * Saves or updates a Washer Partner profile in Firestore.
 */
export async function syncWasherToFirestore(
  washer: WasherPartner
): Promise<{ success: boolean; error?: string }> {
  try {
    const washerRef = doc(db, 'washers', washer.id);
    await setDoc(
      washerRef,
      {
        ...washer,
        created_at: new Date().toISOString(),
        last_login_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      },
      { merge: true }
    );

    // Also mirror to users collection so they have a valid user profile
    const userRef = doc(db, 'users', washer.id);
    await setDoc(
      userRef,
      {
        id: washer.id,
        name: washer.name,
        phone: washer.phone,
        role: 'washer',
        avatar_url: washer.avatar,
        status: 'active',
        society: washer.society,
        aadhaar_number: washer.aadhaarNumber || null,
        aadhaar_verified: !!washer.aadhaarVerified,
        phone_verified: !!washer.phoneVerified,
        last_login_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      },
      { merge: true }
    );

    // Write audit event
    try {
      await addDoc(collection(db, 'auth_logs'), {
        user_id: washer.id,
        name: washer.name,
        phone: washer.phone,
        role: 'washer',
        event: 'washer_onboarded',
        society: washer.society,
        timestamp: serverTimestamp(),
      });
    } catch (logErr) {
      console.warn('Auth log write notice:', logErr);
    }

    return { success: true };
  } catch (error: any) {
    console.warn('Firebase syncWasherToFirestore notice:', error?.message || error);
    return { success: false, error: error?.message || 'Sync failed' };
  }
}

/**
 * Records every user login (Owner, Washer, Admin) into Firestore.
 */
export async function recordUserLogin(
  user: User,
  method: string = 'otp'
): Promise<{ success: boolean; error?: string }> {
  try {
    const userRef = doc(db, 'users', user.id);
    await setDoc(
      userRef,
      {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        avatar_url: user.avatar_url || null,
        status: user.status || 'active',
        last_login_at: serverTimestamp(),
        login_method: method,
        updated_at: serverTimestamp(),
      },
      { merge: true }
    );

    // Record login audit event
    try {
      await addDoc(collection(db, 'auth_logs'), {
        user_id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        event: 'user_login',
        method,
        timestamp: serverTimestamp(),
      });
    } catch (logErr) {
      console.warn('Auth log write notice:', logErr);
    }

    return { success: true };
  } catch (error: any) {
    console.warn('Firebase recordUserLogin notice:', error?.message || error);
    return { success: false, error: error?.message || 'Sync failed' };
  }
}

/**
 * Records an Admin sign-in session and adds to the immutable admin audit trail in Firestore.
 */
export async function recordAdminLoginToFirestore(
  adminUser: User,
  identifier: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const userRef = doc(db, 'users', adminUser.id);
    await setDoc(
      userRef,
      {
        ...adminUser,
        role: 'admin',
        identifier,
        last_login_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      },
      { merge: true }
    );

    // Record to admin audit trail
    try {
      await addDoc(collection(db, 'admin_audit_logs'), {
        admin_id: adminUser.id,
        name: adminUser.name,
        identifier,
        event: 'admin_console_login',
        timestamp: serverTimestamp(),
      });
    } catch (auditErr) {
      console.warn('Admin audit write notice:', auditErr);
    }

    return { success: true };
  } catch (error: any) {
    console.warn('Firebase recordAdminLoginToFirestore notice:', error?.message || error);
    return { success: false, error: error?.message || 'Sync failed' };
  }
}

/**
 * Finds a registered user by phone in Firestore (Owner or Washer).
 */
export async function findUserByPhoneInFirestore(phone: string): Promise<User | null> {
  try {
    const cleanPhone = phone.replace(/\D/g, '');
    const usersRef = collection(db, 'users');
    
    // Check formatted phone or clean phone
    const q1 = query(usersRef, where('phone', '==', phone));
    const snap1 = await getDocs(q1);
    if (!snap1.empty) {
      const data = snap1.docs[0].data();
      return {
        id: snap1.docs[0].id,
        name: data.name || 'Registered User',
        phone: data.phone || phone,
        role: data.role || 'owner',
        status: data.status || 'active',
        avatar_url: data.avatar_url,
        created_at: data.created_at || new Date().toISOString(),
      };
    }

    // Try clean 10-digit match
    const q2 = query(usersRef, where('phone', '==', `+91 ${cleanPhone.slice(-10)}`));
    const snap2 = await getDocs(q2);
    if (!snap2.empty) {
      const data = snap2.docs[0].data();
      return {
        id: snap2.docs[0].id,
        name: data.name || 'Registered User',
        phone: data.phone || phone,
        role: data.role || 'owner',
        status: data.status || 'active',
        avatar_url: data.avatar_url,
        created_at: data.created_at || new Date().toISOString(),
      };
    }

    return null;
  } catch (error: any) {
    console.warn('Firebase findUserByPhoneInFirestore notice:', error?.message || error);
    return null;
  }
}

/**
 * Finds an onboarded WasherPartner by phone number in Firestore.
 */
export async function findWasherByPhoneInFirestore(phone: string): Promise<WasherPartner | null> {
  try {
    const cleanPhone = phone.replace(/\D/g, '');
    const washersRef = collection(db, 'washers');
    
    const q = query(washersRef, where('phone', '==', phone));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as WasherPartner;
    }

    // Try with +91 prefix
    const q2 = query(washersRef, where('phone', '==', `+91 ${cleanPhone.slice(-10)}`));
    const snap2 = await getDocs(q2);
    if (!snap2.empty) {
      return snap2.docs[0].data() as WasherPartner;
    }

    return null;
  } catch (error: any) {
    console.warn('Firebase findWasherByPhoneInFirestore notice:', error?.message || error);
    return null;
  }
}

/**
 * Fetches all vehicles for an owner from Firestore.
 */
export async function fetchVehiclesByOwnerFromFirestore(ownerId: string): Promise<Vehicle[]> {
  try {
    const vehiclesRef = collection(db, 'vehicles');
    const q = query(vehiclesRef, where('owner_id', '==', ownerId));
    const snap = await getDocs(q);
    const list: Vehicle[] = [];
    snap.forEach((docSnap) => {
      list.push(docSnap.data() as Vehicle);
    });
    return list;
  } catch (error: any) {
    console.warn('Firebase fetchVehiclesByOwnerFromFirestore notice:', error?.message || error);
    return [];
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

export interface OwnerDashboardFirebaseData {
  user: User | null;
  vehicles: Vehicle[];
  todayWash: WashRecord | null;
  washes: WashRecord[];
  assignedWasher: WasherPartner | null;
  source: 'firebase_live' | 'local_fallback';
}

/**
 * Fetches real-time dashboard data for an owner directly from Firebase Firestore:
 * - User profile (plan, assigned washer, phone)
 * - Registered vehicles in society parking bay
 * - Wash records and today's proof photo
 * - Assigned Washer Partner details
 */
export async function fetchOwnerDashboardFromFirestore(
  userId: string,
  userPhone?: string
): Promise<OwnerDashboardFirebaseData> {
  const result: OwnerDashboardFirebaseData = {
    user: null,
    vehicles: [],
    todayWash: null,
    washes: [],
    assignedWasher: null,
    source: 'local_fallback',
  };

  try {
    // 1. Fetch User document from Firestore
    let userDocData: any = null;
    if (userId && userId !== 'usr_guest') {
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        userDocData = { id: userDocSnap.id, ...userDocSnap.data() };
      }
    }

    // Fallback: If not found by ID and phone is provided, lookup by phone
    if (!userDocData && userPhone) {
      userDocData = await findUserByPhoneInFirestore(userPhone);
    }

    if (userDocData) {
      result.user = {
        id: userDocData.id,
        name: userDocData.name || 'Vehicle Owner',
        phone: userDocData.phone || userPhone || '',
        role: 'owner',
        status: userDocData.status || 'active',
        created_at: userDocData.created_at || new Date().toISOString(),
        selected_plan: userDocData.selected_plan,
        assigned_washer_id: userDocData.assigned_washer_id,
        assigned_washer_name: userDocData.assigned_washer_name,
        address: userDocData.address,
        alt_phone: userDocData.alt_phone,
      };
      result.source = 'firebase_live';
    }

    // 2. Fetch Owner's Vehicles from Firestore
    const targetOwnerId = result.user?.id || userId;
    if (targetOwnerId) {
      const vehiclesRef = collection(db, 'vehicles');
      const qVehicles = query(vehiclesRef, where('owner_id', '==', targetOwnerId));
      const vSnap = await getDocs(qVehicles);
      const fetchedVehicles: Vehicle[] = [];
      vSnap.forEach((vDoc) => {
        fetchedVehicles.push({ id: vDoc.id, ...vDoc.data() } as Vehicle);
      });

      if (fetchedVehicles.length > 0) {
        result.vehicles = fetchedVehicles;
        result.source = 'firebase_live';
      }
    }

    // 3. Fetch Washes (Proof Records) for the owner's vehicles
    const vehicleIds = result.vehicles.map((v) => v.id);
    if (vehicleIds.length > 0) {
      const washesRef = collection(db, 'washes');
      const qWashes = query(
        washesRef,
        where('vehicle_id', 'in', vehicleIds.slice(0, 10))
      );
      const wSnap = await getDocs(qWashes);
      const fetchedWashes: WashRecord[] = [];
      wSnap.forEach((wDoc) => {
        fetchedWashes.push({ id: wDoc.id, ...wDoc.data() } as WashRecord);
      });

      if (fetchedWashes.length > 0) {
        result.washes = fetchedWashes;
        result.todayWash = fetchedWashes[0] || null;
        result.source = 'firebase_live';
      }
    }

    // 4. Fetch Assigned Washer Partner if specified
    const washerId =
      result.user?.assigned_washer_id ||
      result.vehicles[0]?.assigned_washer_id;

    if (washerId) {
      const washerDocRef = doc(db, 'washers', washerId);
      const washerDocSnap = await getDoc(washerDocRef);
      if (washerDocSnap.exists()) {
        result.assignedWasher = {
          id: washerDocSnap.id,
          ...washerDocSnap.data(),
        } as WasherPartner;
        result.source = 'firebase_live';
      }
    }

    return result;
  } catch (error: any) {
    console.warn('Firebase fetchOwnerDashboardFromFirestore notice:', error?.message || error);
    return result;
  }
}

/**
 * Deletes an owner's record, their registered vehicles, and wash records from Firestore.
 */
export async function resetOwnerFirestoreData(
  userId?: string,
  userPhone?: string
): Promise<{ success: boolean; deletedCount: number; error?: string }> {
  try {
    let deletedCount = 0;
    const vehicleIds: string[] = [];

    // 1. Delete Owner document from users collection
    if (userId && userId !== 'usr_guest') {
      try {
        const userRef = doc(db, 'users', userId);
        await deleteDoc(userRef);
        deletedCount++;
      } catch (err) {
        console.warn('Delete user doc notice:', err);
      }
    }

    if (userPhone) {
      try {
        const usersRef = collection(db, 'users');
        const qUsers = query(usersRef, where('phone', '==', userPhone));
        const snapUsers = await getDocs(qUsers);
        for (const uDoc of snapUsers.docs) {
          await deleteDoc(uDoc.ref);
          deletedCount++;
        }
      } catch (err) {
        console.warn('Delete user by phone notice:', err);
      }
    }

    // 2. Query and delete Owner's vehicles
    const vehiclesRef = collection(db, 'vehicles');
    if (userId && userId !== 'usr_guest') {
      try {
        const qVehicles = query(vehiclesRef, where('owner_id', '==', userId));
        const snapVehicles = await getDocs(qVehicles);
        for (const vDoc of snapVehicles.docs) {
          vehicleIds.push(vDoc.id);
          await deleteDoc(vDoc.ref);
          deletedCount++;
        }
      } catch (err) {
        console.warn('Delete vehicles by owner_id notice:', err);
      }
    }

    if (userPhone) {
      try {
        const qVehiclesPhone = query(vehiclesRef, where('owner_phone', '==', userPhone));
        const snapVehiclesPhone = await getDocs(qVehiclesPhone);
        for (const vDoc of snapVehiclesPhone.docs) {
          if (!vehicleIds.includes(vDoc.id)) vehicleIds.push(vDoc.id);
          await deleteDoc(vDoc.ref);
          deletedCount++;
        }
      } catch (err) {
        console.warn('Delete vehicles by phone notice:', err);
      }
    }

    // 3. Delete any washes associated with these vehicles
    if (vehicleIds.length > 0) {
      try {
        const washesRef = collection(db, 'washes');
        for (const vId of vehicleIds) {
          const qWashes = query(washesRef, where('vehicle_id', '==', vId));
          const snapWashes = await getDocs(qWashes);
          for (const wDoc of snapWashes.docs) {
            await deleteDoc(wDoc.ref);
            deletedCount++;
          }
        }
      } catch (err) {
        console.warn('Delete washes notice:', err);
      }
    }

    return { success: true, deletedCount };
  } catch (error: any) {
    console.warn('Firebase resetOwnerFirestoreData notice:', error?.message || error);
    return { success: false, deletedCount: 0, error: error?.message || 'Reset failed' };
  }
}

