// Firebase Firestore Service Layer for Torque Care
// Clean Architecture: Uses Car_Owners (with nested Vehicles & Washes) and Washers

import {
  collection,
  collectionGroup,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from './firebase';
import { User, Vehicle, WashRecord, RouteStop } from './types';
import { WasherPartner } from './washerPartners';
import { isWashFromToday, getTodayISTDate } from './washUtils';

/**
 * Payout per vehicle wash:
 * Hatchback / Sedan: ₹12
 * Compact / Mid SUV: ₹16
 * Luxury / 7-Seater+: ₹21
 */
export function getWasherPayoutPerWash(vehicle: { type?: string; model?: string; make?: string }): number {
  const typeStr = (vehicle?.type || '').toLowerCase();
  const modelStr = `${vehicle?.make || ''} ${vehicle?.model || ''}`.toLowerCase();

  // Luxury / 7-seater check
  if (
    typeStr.includes('luxury') ||
    typeStr.includes('7-seater') ||
    typeStr.includes('7seater') ||
    modelStr.includes('fortuner') ||
    modelStr.includes('innova') ||
    modelStr.includes('audi') ||
    modelStr.includes('bmw') ||
    modelStr.includes('mercedes') ||
    modelStr.includes('safari') ||
    modelStr.includes('xuv700') ||
    modelStr.includes('scorpio') ||
    modelStr.includes('jaguar') ||
    modelStr.includes('land rover') ||
    modelStr.includes('volvo')
  ) {
    return 21;
  }

  // Compact / Mid SUV check
  if (
    typeStr.includes('suv') ||
    typeStr.includes('muv') ||
    modelStr.includes('creta') ||
    modelStr.includes('seltos') ||
    modelStr.includes('brezza') ||
    modelStr.includes('nexon') ||
    modelStr.includes('venue') ||
    modelStr.includes('sonet') ||
    modelStr.includes('punch') ||
    modelStr.includes('thar') ||
    modelStr.includes('harrier') ||
    modelStr.includes('kushaq') ||
    modelStr.includes('taigun')
  ) {
    return 16;
  }

  // Default / Hatchback / Sedan
  return 12;
}

export async function syncOwnerToFirestore(
  owner: User,
  vehicles?: Vehicle[],
  initialWash?: WashRecord
): Promise<{ success: boolean; error?: string }> {
  try {
    const ownerId = owner.id;
    const defaultPlanName = owner.selected_plan || 'HOME BASIC';

    const getBodyTypePrice = (vType?: string): number => {
      const t = (vType || 'car').toLowerCase();
      if (t === 'luxury') return 799;
      if (t === 'suv') return 649;
      if (t === 'bike') return 399;
      return 599; // Hatchback / Sedan
    };

    const calculatedTotal = vehicles && vehicles.length > 0
      ? vehicles.reduce((sum, v) => sum + (v.price || (v as any).subscription_price || getBodyTypePrice(v.type)), 0)
      : (owner.price || 599);

    const subscriptionPrice = owner.price || (owner as any).subscription_price || calculatedTotal;

    const resolvedSocietyId = (owner as any).societyId || (owner as any).society_id || null;
    const resolvedSocietyName = (owner as any).societyName || owner.society || (owner as any).society_name || null;
    const resolvedWasherId = (owner as any).selectedWasherId || owner.assigned_washer_id || '';
    const resolvedWasherName = (owner as any).selectedWasherName || owner.assigned_washer_name || '';
    const resolvedAdminId = (owner as any).adminId || (owner as any).assignedAdminId || (owner as any).areaManagerId || null;
    const resolvedState = (owner as any).state || null;
    const resolvedCity = (owner as any).city || null;
    const resolvedFlat = (owner as any).flat || (owner as any).flatNumber || owner.address || null;
    const resolvedFlatNumber = (owner as any).flatNumber || (owner as any).flat || null;

    // 1. CAR OWNER: Car_Owners/{ownerId}
    const carOwnerRef = doc(db, 'Car_Owners', ownerId);
    const carOwnerPayload = {
      customerId: ownerId,
      ownerId: ownerId,
      name: owner.name,
      phone: owner.phone,
      altPhone: owner.alt_phone || null,
      address: owner.address || null,
      flat: resolvedFlat,
      flatNumber: resolvedFlatNumber,
      state: resolvedState,
      city: resolvedCity,
      society: resolvedSocietyName,
      societyId: resolvedSocietyId,
      societyName: resolvedSocietyName,
      adminId: resolvedAdminId,
      assignedAdminId: resolvedAdminId,
      areaManagerId: resolvedAdminId,
      selectedWasherId: resolvedWasherId,
      selectedWasherName: resolvedWasherName,
      role: 'owner',
      status: owner.status || 'active',
      planId: defaultPlanName,
      selectedPlan: defaultPlanName,
      price: subscriptionPrice,
      subscriptionPrice: subscriptionPrice,
      subscription: {
        planId: defaultPlanName,
        price: subscriptionPrice,
        billingCycle: 'monthly',
        status: 'active',
        startDate: new Date().toISOString(),
      },
      assignedWasherId: resolvedWasherId,
      assignedWasherName: resolvedWasherName,
      createdAt: owner.created_at || new Date().toISOString(),
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      // Legacy helper compatibility
      id: ownerId,
      owner_name: owner.owner_name || owner.name,
      selected_plan: defaultPlanName,
      assigned_washer_id: resolvedWasherId,
      assigned_washer_name: resolvedWasherName,
    };
    await setDoc(carOwnerRef, carOwnerPayload, { merge: true });

    // 1B. SUBCOLLECTION: Societies/{societyId}/Car_Owners/{ownerId}
    if (resolvedSocietyId) {
      try {
        const societyOwnerRef = doc(db, 'Societies', resolvedSocietyId, 'Car_Owners', ownerId);
        await setDoc(societyOwnerRef, carOwnerPayload, { merge: true });

        // Also singular Society/{societyId}/Car_Owners/{ownerId} for compatibility
        const singSocOwnerRef = doc(db, 'Society', resolvedSocietyId, 'Car_Owners', ownerId);
        await setDoc(singSocOwnerRef, carOwnerPayload, { merge: true });
      } catch (socErr) {
        console.warn('Notice: saving to Societies Car_Owners subcollection:', socErr);
      }
    }

    // 2. VEHICLES: Car_Owners/{ownerId}/Vehicles/{vehicleId}
    if (vehicles && vehicles.length > 0) {
      for (const vehicle of vehicles) {
        const vehicleId = vehicle.id;
        const vehiclePlan = vehicle.selected_plan || defaultPlanName;
        const vehiclePrice = vehicle.price || (vehicle as any).subscription_price || getBodyTypePrice(vehicle.type);

        const vehicleDocRef = doc(db, 'Car_Owners', ownerId, 'Vehicles', vehicleId);
        const vehiclePayload = {
          vehicleId: vehicleId,
          ownerId: ownerId,
          ownerName: owner.name,
          make: vehicle.make,
          model: vehicle.model,
          registrationNumber: vehicle.registration_number,
          type: vehicle.type,
          color: vehicle.color || 'Pearl White',
          parkingLocation: vehicle.parking_location || 'Assigned Bay',
          preferredWashTime: vehicle.preferred_wash_time || '07:30 AM',
          societyId: vehicle.society_id || resolvedSocietyId,
          societyName: vehicle.society_name || resolvedSocietyName,
          flat: resolvedFlat,
          flatNumber: resolvedFlatNumber,
          adminId: (vehicle as any).adminId || (vehicle as any).admin_id || resolvedAdminId,
          assignedAdminId: (vehicle as any).assignedAdminId || (vehicle as any).assigned_admin_id || resolvedAdminId,
          price: vehiclePrice,
          subscriptionPrice: vehiclePrice,
          washerId: vehicle.assigned_washer_id || resolvedWasherId,
          washerName: vehicle.assigned_washer_name || resolvedWasherName,
          subscription: {
            planId: vehiclePlan,
            price: vehiclePrice,
            billingCycle: 'monthly',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            washesIncluded: 26,
            washesUsed: vehicle.washes_this_month || 0,
            carryForwardEarned: 0,
            carryForwardUsed: 0,
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          // Legacy field names for compatibility
          id: vehicleId,
          owner_id: ownerId,
          owner_name: owner.name,
          registration_number: vehicle.registration_number,
          parking_location: vehicle.parking_location || 'Assigned Bay',
          preferred_wash_time: vehicle.preferred_wash_time || '07:30 AM',
          society_name: vehicle.society_name || 'Green Valley Residency',
          selected_plan: vehiclePlan,
          assigned_washer_id: vehicle.assigned_washer_id || resolvedWasherId,
          assigned_washer_name: vehicle.assigned_washer_name || resolvedWasherName,
        };
        await setDoc(vehicleDocRef, vehiclePayload, { merge: true });

        // 2B. SUBCOLLECTION VEHICLE: Societies/{societyId}/Car_Owners/{ownerId}/Vehicles/{vehicleId}
        const effectiveVehicleSocId = vehicle.society_id || resolvedSocietyId;
        if (effectiveVehicleSocId) {
          try {
            const socVehDocRef = doc(db, 'Societies', effectiveVehicleSocId, 'Car_Owners', ownerId, 'Vehicles', vehicleId);
            await setDoc(socVehDocRef, vehiclePayload, { merge: true });
            const singSocVehDocRef = doc(db, 'Society', effectiveVehicleSocId, 'Car_Owners', ownerId, 'Vehicles', vehicleId);
            await setDoc(singSocVehDocRef, vehiclePayload, { merge: true });
          } catch (vSocErr) {
            // ignore
          }
        }

        // 3. WASHES: Only sync if an actual wash record is explicitly provided
        if (initialWash && initialWash.id) {
          const washId = initialWash.id;
          const washDocRef = doc(db, 'Car_Owners', ownerId, 'Vehicles', vehicleId, 'Washes', washId);
          const washPayload = {
            washId: washId,
            vehicleId: vehicleId,
            washerId: vehicle.assigned_washer_id || owner.assigned_washer_id || '',
            washerName: vehicle.assigned_washer_name || owner.assigned_washer_name || '',
            scheduledDate: initialWash.scheduled_date || 'Today',
            completedAt: initialWash.completed_at || null,
            status: initialWash.status || 'scheduled',
            proof: initialWash.after_photo
              ? {
                  photoUrl: initialWash.after_photo,
                  capturedAt: new Date().toISOString(),
                }
              : null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          await setDoc(washDocRef, washPayload, { merge: true });
        }
      }
    }

    return { success: true };
  } catch (error: any) {
    console.warn('Firebase syncOwnerToFirestore notice:', error?.message || error);
    return { success: false, error: error?.message || 'Sync failed' };
  }
}

/**
 * Saves or updates a Washer Partner profile in Firestore under Washers/{washerId}:
 * Washers - WasherID - data
 */
export async function syncWasherToFirestore(
  washer: WasherPartner
): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanPhone = (washer.phone || '').replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.length >= 10 ? `+91 ${cleanPhone.slice(-10)}` : washer.phone;
    const phoneRaw = cleanPhone.slice(-10);

    const currentAdminUid =
      auth?.currentUser?.uid ||
      (typeof window !== 'undefined' ? localStorage.getItem('torque_admin_uid') : null);
    const createdBy =
      auth?.currentUser?.uid ||
      washer.createdBy ||
      currentAdminUid ||
      'ADMIN_UID';

    const societiesList =
      washer.societies && Array.isArray(washer.societies) && washer.societies.length > 0
        ? washer.societies
        : washer.society
        ? washer.society.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

    const washerPayload = {
      id: washer.id,
      washerId: washer.id,
      name: washer.name,
      phone: phoneWithCountry,
      phone_raw: phoneRaw,
      email: washer.email ? washer.email.toLowerCase().trim() : null,
      ...(washer.password ? { password: washer.password, hasPassword: true } : {}),
      createdBy: createdBy,
      society: washer.society || societiesList.join(', '),
      societies: societiesList,
      assignedCarsPerDay: washer.assignedCarsPerDay || 30,
      assigned_cars_per_day: washer.assignedCarsPerDay || 30,
      routeWindow: washer.routeWindow || '06:30 AM - 09:30 AM',
      route_window: washer.routeWindow || '06:30 AM - 09:30 AM',
      aadhaarNumber: washer.aadhaarNumber || null,
      aadhaar_number: washer.aadhaarNumber || null,
      aadhaarPhotoUrl: washer.aadhaarPhotoUrl || null,
      aadhaar_photo_url: washer.aadhaarPhotoUrl || null,
      aadhaarVerified: !!washer.aadhaarVerified,
      aadhaar_verified: !!washer.aadhaarVerified,
      phoneVerified: !!washer.phoneVerified,
      phone_verified: !!washer.phoneVerified,
      bankAccount: washer.bankAccount || null,
      bank_account: washer.bankAccount || null,
      ifscCode: washer.ifscCode || null,
      ifsc_code: washer.ifscCode || null,
      address: washer.address || null,
      avatar: washer.avatar || '/images/washer_amit.jpg',
      avatar_url: washer.avatar || '/images/washer_amit.jpg',
      rating: washer.rating || '5.0',
      reviewsCount: washer.reviewsCount || 1,
      avgTimePerCar: washer.avgTimePerCar || '5.5 mins',
      completionRate: washer.completionRate || '100%',
      totalLifetimeWashes: washer.totalLifetimeWashes || 0,
      status: washer.status || 'active',
      kyc: washer.kyc || 'Verified (Aadhaar & Police Clear)',
      role: 'washer',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      created_at: washer.created_at || new Date().toISOString(),
      last_login_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    };

    // 1. Washers belong EXCLUSIVELY to the Washers collection (Private operational data)
    const washerRef = doc(db, 'Washers', washer.id);
    await setDoc(washerRef, washerPayload, { merge: true });

    // 2. Public sanitized discovery document specifically for /auth/signup discovery: washer_directory/{washerId}
    const isDismissed = washer.status === 'Dismissed' || (washer.status as any) === 'inactive';
    const directoryPayload = {
      washerId: washer.id,
      id: washer.id,
      name: washer.name,
      email: washer.email ? washer.email.toLowerCase().trim() : null,
      photoURL: washer.avatar || '/images/washer_amit.jpg',
      avatar: washer.avatar || '/images/washer_amit.jpg',
      societies: societiesList,
      society: washer.society || societiesList.join(', '),
      status: isDismissed ? 'inactive' : 'active',
      availableForSignup: !isDismissed,
      rating: String(washer.rating || '5.0'),
      reviewsCount: Number(washer.reviewsCount || 1),
      routeWindow: washer.routeWindow || '06:30 AM - 09:30 AM',
      completionRate: washer.completionRate || '100%',
      createdBy: createdBy,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const directoryRef = doc(db, 'washer_directory', washer.id);
    await setDoc(directoryRef, directoryPayload, { merge: true });

    return { success: true };
  } catch (error: any) {
    console.error('Firebase syncWasherToFirestore error:', error?.message || error);
    return { success: false, error: error?.message || 'Sync failed' };
  }
}

/**
 * Dismisses a washer partner from active service:
 * - Updates Washers/{washerId} status to 'Dismissed'
 * - Updates washer_directory/{washerId} status to 'dismissed' and availableForSignup to false
 */
export async function dismissWasherInFirestore(
  washerId: string,
  reason: string = 'Administrative dismissal'
): Promise<{ success: boolean; error?: string }> {
  try {
    const washerRef = doc(db, 'Washers', washerId);
    await setDoc(
      washerRef,
      {
        status: 'Dismissed',
        dismissalReason: reason,
        dismissedAt: serverTimestamp(),
        updated_at: serverTimestamp(),
      },
      { merge: true }
    );

    // Also update washer_directory
    try {
      const directoryRef = doc(db, 'washer_directory', washerId);
      await setDoc(
        directoryRef,
        {
          status: 'dismissed',
          availableForSignup: false,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (dirErr) {
      // safe ignore
    }

    return { success: true };
  } catch (error: any) {
    console.warn('Firebase dismissWasherInFirestore notice:', error?.message || error);
    return { success: false, error: error?.message || 'Dismissal sync failed' };
  }
}

/**
 * Reinstates a previously dismissed washer partner back to active duty:
 * - Updates Washers/{washerId} status to 'Active on Route'
 * - Updates washer_directory/{washerId} status to 'active' and availableForSignup to true
 */
export async function reinstateWasherInFirestore(
  washerId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const washerRef = doc(db, 'Washers', washerId);
    await setDoc(
      washerRef,
      {
        status: 'Active on Route',
        dismissalReason: null,
        reinstatedAt: serverTimestamp(),
        updated_at: serverTimestamp(),
      },
      { merge: true }
    );

    // Also update washer_directory
    try {
      const directoryRef = doc(db, 'washer_directory', washerId);
      await setDoc(
        directoryRef,
        {
          status: 'active',
          availableForSignup: true,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (dirErr) {
      // safe ignore
    }

    return { success: true };
  } catch (error: any) {
    console.warn('Firebase reinstateWasherInFirestore notice:', error?.message || error);
    return { success: false, error: error?.message || 'Reinstatement sync failed' };
  }
}

/**
 * Appoints / reassigns a washer partner to an owner's vehicle in Firestore:
 * Updates Car_Owners/{ownerId}/Vehicles/{vehicleId}
 */
export async function appointWasherToVehicleInFirestore(
  ownerId: string,
  vehicleId: string,
  washerId: string,
  washerName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const vehicleRef = doc(db, 'Car_Owners', ownerId, 'Vehicles', vehicleId);
    await setDoc(
      vehicleRef,
      {
        washerId,
        washerName,
        assigned_washer_id: washerId,
        assigned_washer_name: washerName,
        assignedWasherId: washerId,
        assignedWasherName: washerName,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    // Also keep the Car_Owners root document selectedWasher in sync
    const ownerRef = doc(db, 'Car_Owners', ownerId);
    await setDoc(
      ownerRef,
      {
        selectedWasherId: washerId,
        selectedWasherName: washerName,
        assigned_washer_id: washerId,
        assigned_washer_name: washerName,
        assignedWasherId: washerId,
        assignedWasherName: washerName,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return { success: true };
  } catch (error: any) {
    console.warn('Firebase appointWasherToVehicleInFirestore notice:', error?.message || error);
    return { success: false, error: error?.message || 'Appoint washer sync failed' };
  }
}

/**
 * Records user login by role:
 * - Admin: area_managers/{uid}
 * - Washer: Washers/{uid}
 * - Owner: Car_Owners/{uid}
 * Admins are strictly prohibited from being written to Car_Owners.
 */
export async function recordUserLogin(
  user: User,
  method: string = 'otp'
): Promise<{ success: boolean; error?: string }> {
  try {
    if (user.role === 'admin') {
      // 1. Admin belongs EXCLUSIVELY to area_managers collection
      const managerRef = doc(db, 'area_managers', user.id);
      await setDoc(
        managerRef,
        {
          id: user.id,
          lastLoginAt: serverTimestamp(),
          loginMethod: method,
          updated_at: new Date().toISOString(),
        },
        { merge: true }
      );

      // Clean up any stray admin document accidentally created in Car_Owners
      try {
        const strayOwnerRef = doc(db, 'Car_Owners', user.id);
        const straySnap = await getDoc(strayOwnerRef);
        if (straySnap.exists()) {
          await deleteDoc(strayOwnerRef);
          console.log('Cleaned up stray admin record from Car_Owners:', user.id);
        }
      } catch (cleanErr) {
        // Safe ignore
      }

      return { success: true };
    }

    if (user.role === 'washer') {
      // 2. Washers belong EXCLUSIVELY to Washers collection
      const washerRef = doc(db, 'Washers', user.id);
      await setDoc(
        washerRef,
        {
          id: user.id,
          last_login_at: serverTimestamp(),
          login_method: method,
          updated_at: serverTimestamp(),
        },
        { merge: true }
      );
      return { success: true };
    }

    // 3. Car Owners strictly belong to Car_Owners collection
    const ownerRef = doc(db, 'Car_Owners', user.id);
    await setDoc(
      ownerRef,
      {
        ownerId: user.id,
        name: user.name,
        phone: user.phone,
        role: 'owner',
        last_login_at: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        login_method: method,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return { success: true };
  } catch (error: any) {
    console.warn('Firebase recordUserLogin notice:', error?.message || error);
    return { success: false, error: error?.message || 'Sync failed' };
  }
}

/**
 * Records an Admin sign-in session.
 */
export async function recordAdminLoginToFirestore(
  adminUser: User,
  identifier: string
): Promise<{ success: boolean; error?: string }> {
  try {
    return { success: true };
  } catch (error: any) {
    console.warn('Firebase recordAdminLoginToFirestore notice:', error?.message || error);
    return { success: false, error: error?.message || 'Sync failed' };
  }
}

/**
 * Finds a registered user by phone in Firestore (checks Car_Owners then Washers).
 */
export async function findUserByPhoneInFirestore(phone: string): Promise<User | null> {
  try {
    const cleanPhone = phone.replace(/\D/g, '');
    const last10 = cleanPhone.slice(-10);

    // 1. Check Car_Owners directly (Primary customer collection)
    const ownersRef = collection(db, 'Car_Owners');
    const qOwner1 = query(ownersRef, where('phone', '==', phone));
    const sOwner1 = await getDocs(qOwner1);
    if (!sOwner1.empty) {
      const data = sOwner1.docs[0].data();
      const resolvedName = data.name || data.owner_name || 'Vehicle Owner';
      return {
        id: sOwner1.docs[0].id,
        name: resolvedName,
        owner_name: resolvedName,
        phone: data.phone || phone,
        role: 'owner',
        status: data.status || 'active',
        created_at: data.createdAt || data.created_at || new Date().toISOString(),
        selected_plan: data.selectedPlan || data.planId,
        assigned_washer_id: data.assignedWasherId || data.assigned_washer_id,
        assigned_washer_name: data.assignedWasherName || data.assigned_washer_name,
      };
    }

    if (last10) {
      const qOwner2 = query(ownersRef, where('phone', '==', `+91 ${last10}`));
      const sOwner2 = await getDocs(qOwner2);
      if (!sOwner2.empty) {
        const data = sOwner2.docs[0].data();
        const resolvedName = data.name || data.owner_name || 'Vehicle Owner';
        return {
          id: sOwner2.docs[0].id,
          name: resolvedName,
          owner_name: resolvedName,
          phone: data.phone || phone,
          role: 'owner',
          status: data.status || 'active',
          created_at: data.createdAt || data.created_at || new Date().toISOString(),
          selected_plan: data.selectedPlan || data.planId,
          assigned_washer_id: data.assignedWasherId || data.assigned_washer_id,
          assigned_washer_name: data.assignedWasherName || data.assigned_washer_name,
        };
      }
    }

    // 2. Check Washers
    const washersRef = collection(db, 'Washers');
    const qWasher1 = query(washersRef, where('phone', '==', phone));
    const sWasher1 = await getDocs(qWasher1);
    if (!sWasher1.empty) {
      const data = sWasher1.docs[0].data();
      return {
        id: sWasher1.docs[0].id,
        name: data.name || 'Washer Partner',
        phone: data.phone || phone,
        role: 'washer',
        status: 'active',
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
    const last10 = cleanPhone.slice(-10);

    const washersRef = collection(db, 'Washers');

    // 1. Direct phone query
    const q = query(washersRef, where('phone', '==', phone));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docSnap = snap.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as WasherPartner;
    }

    if (last10) {
      // 2. Query with +91 format
      const q2 = query(washersRef, where('phone', '==', `+91 ${last10}`));
      const snap2 = await getDocs(q2);
      if (!snap2.empty) {
        const docSnap = snap2.docs[0];
        return { id: docSnap.id, ...docSnap.data() } as WasherPartner;
      }

      // 3. Query with +91 without space
      const q3 = query(washersRef, where('phone', '==', `+91${last10}`));
      const snap3 = await getDocs(q3);
      if (!snap3.empty) {
        const docSnap = snap3.docs[0];
        return { id: docSnap.id, ...docSnap.data() } as WasherPartner;
      }

      // 4. Query with phone_raw field
      const q4 = query(washersRef, where('phone_raw', '==', last10));
      const snap4 = await getDocs(q4);
      if (!snap4.empty) {
        const docSnap = snap4.docs[0];
        return { id: docSnap.id, ...docSnap.data() } as WasherPartner;
      }

      // 5. Query with raw 10 digits
      const q5 = query(washersRef, where('phone', '==', last10));
      const snap5 = await getDocs(q5);
      if (!snap5.empty) {
        const docSnap = snap5.docs[0];
        return { id: docSnap.id, ...docSnap.data() } as WasherPartner;
      }
    }

    return null;
  } catch (error: any) {
    console.warn('Firebase findWasherByPhoneInFirestore notice:', error?.message || error);
    return null;
  }
}

/**
 * Finds an onboarded WasherPartner by email address in Firestore.
 */
export async function findWasherByEmailInFirestore(email: string): Promise<WasherPartner | null> {
  try {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail) return null;

    const washersRef = collection(db, 'Washers');
    const q = query(washersRef, where('email', '==', cleanEmail));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docSnap = snap.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as WasherPartner;
    }
    return null;
  } catch (error: any) {
    console.warn('Firebase findWasherByEmailInFirestore notice:', error?.message || error);
    return null;
  }
}

/**
 * Saves or updates a Washer Partner's secret password in Firestore Washers collection.
 */
export async function setWasherPasswordInFirestore(
  phoneOrIdOrEmail: string,
  newPassword: string
): Promise<{ success: boolean; washerId?: string; washerName?: string; error?: string }> {
  try {
    const rawInput = phoneOrIdOrEmail.trim();
    const cleanDigits = rawInput.replace(/\D/g, '');
    const washersRef = collection(db, 'Washers');

    let targetDocId: string | null = null;
    let existingData: any = null;

    // 1. Check if email
    if (rawInput.includes('@')) {
      const qEmail = query(washersRef, where('email', '==', rawInput.toLowerCase()));
      const snapEmail = await getDocs(qEmail);
      if (!snapEmail.empty) {
        targetDocId = snapEmail.docs[0].id;
        existingData = snapEmail.docs[0].data();
      }
    }

    // 2. Check if direct doc ID
    if (!targetDocId && !rawInput.startsWith('+') && cleanDigits.length !== 10) {
      const docRef = doc(db, 'Washers', rawInput);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        targetDocId = docSnap.id;
        existingData = docSnap.data();
      }
    }

    // 3. Query by phone if not found by direct ID or email
    if (!targetDocId && cleanDigits.length >= 10) {
      const last10 = cleanDigits.slice(-10);
      const q = query(washersRef, where('phone', '==', `+91 ${last10}`));
      const snap = await getDocs(q);
      if (!snap.empty) {
        targetDocId = snap.docs[0].id;
        existingData = snap.docs[0].data();
      } else {
        const q2 = query(washersRef, where('phone_raw', '==', last10));
        const snap2 = await getDocs(q2);
        if (!snap2.empty) {
          targetDocId = snap2.docs[0].id;
          existingData = snap2.docs[0].data();
        } else {
          const q3 = query(washersRef, where('phone', '==', `+91${last10}`));
          const snap3 = await getDocs(q3);
          if (!snap3.empty) {
            targetDocId = snap3.docs[0].id;
            existingData = snap3.docs[0].data();
          }
        }
      }
    }

    if (!targetDocId) {
      return { success: false, error: 'Washer partner record not found in database.' };
    }

    const targetRef = doc(db, 'Washers', targetDocId);
    await setDoc(
      targetRef,
      {
        password: newPassword,
        hasPassword: true,
        has_password: true,
        password_set_at: serverTimestamp(),
        updatedAt: serverTimestamp(),
        updated_at: serverTimestamp(),
      },
      { merge: true }
    );

    return {
      success: true,
      washerId: targetDocId,
      washerName: existingData?.name || 'Washer Partner',
    };
  } catch (err: any) {
    console.error('setWasherPasswordInFirestore error:', err);
    return { success: false, error: err?.message || 'Failed to save password in database' };
  }
}

/**
 * Validates a Washer Partner's credentials using email or phone and password.
 */
export async function verifyWasherPasswordInFirestore(
  identifier: string,
  passwordAttempt: string
): Promise<{
  success: boolean;
  washer?: WasherPartner;
  noPasswordSet?: boolean;
  error?: string;
}> {
  try {
    const cleanId = identifier.trim();
    let washer: WasherPartner | null = null;

    if (cleanId.includes('@')) {
      washer = await findWasherByEmailInFirestore(cleanId);
    } else {
      washer = await findWasherByPhoneInFirestore(cleanId);
    }

    if (!washer) {
      return {
        success: false,
        error: cleanId.includes('@')
          ? 'No washer partner registered with this email address. Please contact your Society Area Manager.'
          : 'Mobile number not found in verified partner network. Please contact your Society Area Manager.',
      };
    }

    const storedPassword = (washer as any).password;
    const hasPassword = Boolean(storedPassword || (washer as any).hasPassword || (washer as any).has_password);

    if (!hasPassword || !storedPassword) {
      return {
        success: false,
        noPasswordSet: true,
        washer,
        error: 'First-time partner: No password has been created for this account yet. Please set your password to continue.',
      };
    }

    if (storedPassword !== passwordAttempt) {
      return {
        success: false,
        washer,
        error: 'Incorrect password. Please re-enter your password.',
      };
    }

    return {
      success: true,
      washer,
    };
  } catch (err: any) {
    console.error('verifyWasherPasswordInFirestore error:', err);
    return {
      success: false,
      error: err?.message || 'Failed to verify washer credentials',
    };
  }
}

/**
 * Fetches an onboarded washer partner by ID or phone from Washers collection.
 */
export async function fetchWasherFromFirestore(
  washerId?: string,
  phone?: string
): Promise<WasherPartner | null> {
  try {
    // 1. Direct ID lookup in Washers collection
    if (washerId && washerId !== 'guest' && washerId !== 'usr_guest') {
      const washerDocRef = doc(db, 'Washers', washerId);
      const washerDocSnap = await getDoc(washerDocRef);
      if (washerDocSnap.exists()) {
        const data = washerDocSnap.data();
        return {
          id: washerDocSnap.id,
          ...data,
          name: data.name || 'Washer Partner',
        } as WasherPartner;
      }
    }

    // 2. Lookup by phone
    if (phone) {
      const foundByPhone = await findWasherByPhoneInFirestore(phone);
      if (foundByPhone) return foundByPhone;
    }

    // 3. Fallback: retrieve the first onboarded washer in Washers collection
    const washersRef = collection(db, 'Washers');
    const allWashersSnap = await getDocs(washersRef);
    if (!allWashersSnap.empty) {
      const docSnap = allWashersSnap.docs[0];
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        name: data.name || 'Washer Partner',
      } as WasherPartner;
    }

    return null;
  } catch (error: any) {
    console.warn('Firebase fetchWasherFromFirestore notice:', error?.message || error);
    return null;
  }
}

export interface WasherDashboardData {
  washer: WasherPartner | null;
  routeStops: RouteStop[];
  earnings: {
    available: number;
    this_week: number;
    total_earnings: number;
    pending: number;
    bank_account: string;
    ifsc_code: string;
  };
  metrics: {
    totalTarget: number;
    completedCount: number;
    pendingCount: number;
    unavailableCount: number;
    progressPercent: number;
    earnedSoFar: number;
    totalExpectedPayout: number;
  };
}

/**
 * Fetches real-time dashboard data for a washer partner from Firestore:
 * - Reads partner details from Washers/{washerId}
 * - Queries all assigned vehicles across Car_Owners/{ownerId}/Vehicles
 * - Reads each vehicle's Washes subcollection for today's wash record and proof photo
 * - Calculates live shift milestones and earnings
 */
export async function fetchWasherDashboardDataFromFirestore(
  washerId?: string,
  washerPhone?: string
): Promise<WasherDashboardData> {
  // 1. Fetch Washer Partner details
  let washer = await fetchWasherFromFirestore(washerId, washerPhone);

  const assignedWasherId = washer?.id || washerId || 'wsh_amit';
  const assignedWasherName = washer?.name || 'Washer Partner';

  // 2. Fetch all vehicles assigned to this washer from Car_Owners
  const stops: RouteStop[] = [];
  try {
    const ownersSnap = await getDocs(collection(db, 'Car_Owners'));
    for (const oDoc of ownersSnap.docs) {
      const oData = oDoc.data();
      const ownerId = oDoc.id;
      const ownerName = oData.name || oData.owner_name || 'Vehicle Owner';
      const ownerPhone = oData.phone || '';

      const vSnap = await getDocs(collection(db, 'Car_Owners', ownerId, 'Vehicles'));
      for (const vDoc of vSnap.docs) {
        const vData = vDoc.data();
        const vId = vDoc.id;

        // Check if assigned to this washer
        const isAssigned = (
          vData.washerId === assignedWasherId ||
          vData.assigned_washer_id === assignedWasherId ||
          (assignedWasherName && vData.washerName?.toLowerCase() === assignedWasherName.toLowerCase()) ||
          (assignedWasherName && vData.assigned_washer_name?.toLowerCase() === assignedWasherName.toLowerCase()) ||
          oData.assignedWasherId === assignedWasherId ||
          (assignedWasherName && oData.assignedWasherName?.toLowerCase() === assignedWasherName.toLowerCase())
        );

        if (isAssigned) {
          // Fetch wash record for this vehicle (check both Washes and current Month)
          let washRecord: any = null;
          const today = getTodayISTDate();

          try {
            // 1. Check current Month subcollection: Car_Owners/{ownerId}/Vehicles/{vId}/{today.monthKey}/{today.dateIso}
            const dateDoc = await getDoc(doc(db, 'Car_Owners', ownerId, 'Vehicles', vId, today.monthKey, today.dateIso));
            if (dateDoc.exists()) {
              washRecord = { id: dateDoc.id, ...dateDoc.data() };
            }
          } catch (mErr) {
            // ignore
          }

          if (!washRecord) {
            try {
              const wSnap = await getDocs(collection(db, 'Car_Owners', ownerId, 'Vehicles', vId, 'Washes'));
              // Find if any wash in Washes was completed TODAY
              const foundToday = wSnap.docs.find((d) => {
                const data = d.data();
                return isWashFromToday({
                  id: d.id,
                  status: data.status,
                  scheduled_date: data.scheduledDate,
                  captured_at: data.proof?.capturedAt,
                  created_at: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
                  completed_at: data.completedAt,
                } as any);
              });

              if (foundToday) {
                washRecord = { id: foundToday.id, ...foundToday.data() };
              }
            } catch (err) {
              console.warn('Could not fetch washes for vehicle:', vId, err);
            }
          }

          const isCompletedToday = Boolean(washRecord && isWashFromToday({
            id: washRecord.id || washRecord.washId,
            status: washRecord.status,
            scheduled_date: washRecord.scheduledDate || washRecord.date,
            captured_at: washRecord.proof?.capturedAt,
            created_at: washRecord.createdAt?.toDate ? washRecord.createdAt.toDate().toISOString() : washRecord.createdAt,
            completed_at: washRecord.completedAt,
          } as any));

          const status = isCompletedToday ? 'completed' : 'pending';
          const proofPhoto = isCompletedToday ? (washRecord?.proof?.photoUrl || washRecord?.after_photo) : undefined;
          const payoutAmount = getWasherPayoutPerWash(vData);

          stops.push({
            stop_number: stops.length + 1,
            wash_id: isCompletedToday ? (washRecord?.id || `wash_${vId}_${today.dateIso}`) : `wash_${vId}_${today.dateIso}`,
            vehicle_id: vId,
            vehicle_name: `${vData.make || ''} ${vData.model || ''}`.trim() || 'Assigned Vehicle',
            registration_number: vData.registrationNumber || vData.registration_number || '',
            parking_location: vData.parkingLocation || vData.parking_location || 'Assigned Bay',
            scheduled_time: vData.preferredWashTime || vData.preferred_wash_time || '07:30 AM',
            status: status as any,
            owner_name: vData.ownerName || vData.owner_name || ownerName,
            owner_phone: ownerPhone,
            owner_id: ownerId,
            payout_amount: payoutAmount,
            society_name: vData.societyName || vData.society_name || washer?.society || 'Green Valley Residency',
            proof_photo: proofPhoto,
            washer_id: assignedWasherId,
            washer_name: assignedWasherName,
          });
        }
      }
    }
  } catch (err) {
    console.warn('Error fetching washer vehicles from Firestore:', err);
  }

  // 3. Compute metrics: target is the count of vehicles assigned to this washer
  const targetQuota = stops.length;
  const completedCount = stops.filter((s) => s.status === 'completed').length;
  const unavailableCount = stops.filter((s) => s.status === 'vehicle_unavailable').length;
  const pendingCount = Math.max(0, targetQuota - completedCount - unavailableCount);
  const progressPercent = targetQuota > 0 ? Math.min(100, Math.round((completedCount / targetQuota) * 100)) : 0;
  const earnedSoFar = stops
    .filter((s) => s.status === 'completed' || s.status === 'vehicle_unavailable')
    .reduce((sum, s) => sum + (s.payout_amount || 12), 0);
  const totalExpectedPayout = stops.reduce((sum, s) => sum + (s.payout_amount || 12), 0);

  // 4. Compute live earnings
  const availableEarnings = Number(washer?.availableBalance ?? washer?.availableEarnings ?? earnedSoFar);
  const weeklyEarnings = Number(washer?.weeklyEarnings ?? (availableEarnings || earnedSoFar));

  return {
    washer,
    routeStops: stops,
    earnings: {
      available: availableEarnings,
      this_week: weeklyEarnings,
      total_earnings: weeklyEarnings,
      pending: pendingCount * 35,
      bank_account: washer?.bankAccount || '1111',
      ifsc_code: washer?.ifscCode || 'HDFC0001234',
    },
    metrics: {
      totalTarget: targetQuota,
      completedCount,
      pendingCount,
      unavailableCount,
      progressPercent,
      earnedSoFar,
      totalExpectedPayout,
    },
  };
}

/**
 * Fetches all vehicles for an owner from Car_Owners/{ownerId}/Vehicles.
 */
export async function fetchVehiclesByOwnerFromFirestore(ownerId: string): Promise<Vehicle[]> {
  try {
    const vehiclesSubRef = collection(db, 'Car_Owners', ownerId, 'Vehicles');
    const snap = await getDocs(vehiclesSubRef);
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
 * Saves a vehicle record to Firestore under Car_Owners/{ownerId}/Vehicles/{vehicleId}.
 */
export async function syncVehicleToFirestore(
  vehicle: Vehicle
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!vehicle.owner_id) return { success: false, error: 'owner_id required' };
    const vehicleRef = doc(db, 'Car_Owners', vehicle.owner_id, 'Vehicles', vehicle.id);
    await setDoc(
      vehicleRef,
      {
        ...vehicle,
        vehicleId: vehicle.id,
        updatedAt: serverTimestamp(),
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
 * Saves a wash record or proof submission to Car_Owners/{ownerId}/Vehicles/{vehicleId}/Washes/{washId}.
 */
export async function syncWashRecordToFirestore(
  wash: WashRecord,
  ownerId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    let resolvedOwnerId = ownerId;
    if (!resolvedOwnerId && typeof window !== 'undefined') {
      resolvedOwnerId = localStorage.getItem('torque_owner_id') || undefined;
    }

    if (!resolvedOwnerId && wash.vehicle_id) {
      try {
        const ownersSnap = await getDocs(collection(db, 'Car_Owners'));
        for (const oDoc of ownersSnap.docs) {
          const vehDoc = await getDoc(doc(db, 'Car_Owners', oDoc.id, 'Vehicles', wash.vehicle_id));
          if (vehDoc.exists()) {
            resolvedOwnerId = oDoc.id;
            break;
          }
        }
      } catch (findErr) {
        // ignore
      }
    }

    if (!resolvedOwnerId) {
      try {
        const ownersSnap = await getDocs(collection(db, 'Car_Owners'));
        if (!ownersSnap.empty) {
          resolvedOwnerId = ownersSnap.docs[0].id;
        }
      } catch (findOwnersErr) {
        // ignore
      }
    }

    if (resolvedOwnerId && wash.vehicle_id) {
      // 1. Compute exact date components in IST
      const now = new Date();
      const istInfo = getTodayISTDate(now);
      const dateIso = wash.scheduled_date && wash.scheduled_date.match(/^\d{4}-\d{2}-\d{2}$/)
        ? wash.scheduled_date
        : istInfo.dateIso;
      const monthKey = istInfo.monthKey; // e.g. "October_2026"
      const completedTime = wash.completed_at || now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const photoUrl = wash.after_photo || '/images/honda_city_after.jpg';
      const capturedAt = wash.captured_at || now.toISOString();

      const washId = wash.id && !wash.id.endsWith('_today')
        ? wash.id
        : `wash_${wash.vehicle_id}_${dateIso}`;

      const washDataToSave = {
        washId,
        date: dateIso,
        day: Number(istInfo.dayNum),
        month: istInfo.monthName,
        year: istInfo.year,
        monthKey,
        vehicleId: wash.vehicle_id,
        washerId: wash.washer_id || 'wsh_amit',
        washerName: wash.washer_name || 'Washer Partner',
        scheduledDate: dateIso,
        completedAt: completedTime,
        status: wash.status || 'completed',
        proof: {
          photoUrl,
          capturedAt,
        },
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      };

      // STRUCTURE: Car_Owners --> ID --> Vehicle --> Month (starts from sign-up month) --> Date --> data saved
      // 1. Direct collection per Month: Car_Owners/{ownerId}/Vehicles/{vehicleId}/{monthKey}/{dateIso}
      try {
        const monthDateDocRef = doc(db, 'Car_Owners', resolvedOwnerId, 'Vehicles', wash.vehicle_id, monthKey, dateIso);
        await setDoc(monthDateDocRef, washDataToSave, { merge: true });
      } catch (err1) {
        console.warn('Error saving to monthDateDocRef:', err1);
      }

      // 2. Nested Months collection: Car_Owners/{ownerId}/Vehicles/{vehicleId}/Months/{monthKey}/Dates/{dateIso}
      try {
        const nestedMonthDocRef = doc(db, 'Car_Owners', resolvedOwnerId, 'Vehicles', wash.vehicle_id, 'Months', monthKey, 'Dates', dateIso);
        await setDoc(nestedMonthDocRef, washDataToSave, { merge: true });
      } catch (err2) {
        console.warn('Error saving to nestedMonthDocRef:', err2);
      }

      // 3. Washes subcollection for compatibility: Car_Owners/{ownerId}/Vehicles/{vehicleId}/Washes/{washId}
      try {
        const washRef = doc(db, 'Car_Owners', resolvedOwnerId, 'Vehicles', wash.vehicle_id, 'Washes', washId);
        await setDoc(washRef, washDataToSave, { merge: true });
      } catch (err3) {
        console.warn('Error saving to washRef:', err3);
      }

      // Also update the vehicle document with last wash completion status
      try {
        const vehicleRef = doc(db, 'Car_Owners', resolvedOwnerId, 'Vehicles', wash.vehicle_id);
        await setDoc(
          vehicleRef,
          {
            lastWashDate: dateIso,
            lastWashTime: completedTime,
            lastWashStatus: 'completed',
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (vehUpdateErr) {
        console.warn('Could not update vehicle lastWash in Firestore:', vehUpdateErr);
      }
    }
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
 * - Car_Owners/{ownerId}
 * - Car_Owners/{ownerId}/Vehicles/{vehicleId}
 * - Car_Owners/{ownerId}/Vehicles/{vehicleId}/Washes/{washId}
 * - Assigned Washer Partner from Washers collection
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
    // 1. Check Car_Owners collection (Car_Owners/{ownerId})
    let carOwnerDocData: any = null;
    let resolvedOwnerId = userId;

    if (userId && userId !== 'usr_guest') {
      const carOwnerDocRef = doc(db, 'Car_Owners', userId);
      const snap = await getDoc(carOwnerDocRef);
      if (snap.exists()) {
        carOwnerDocData = { id: snap.id, ...snap.data() };
        resolvedOwnerId = snap.id;
      }
    }

    if (!carOwnerDocData && userPhone) {
      const cleanPhone = userPhone.replace(/\D/g, '');
      const last10 = cleanPhone.slice(-10);
      const ownersRef = collection(db, 'Car_Owners');

      const q1 = query(ownersRef, where('phone', '==', userPhone));
      const s1 = await getDocs(q1);
      if (!s1.empty) {
        carOwnerDocData = { id: s1.docs[0].id, ...s1.docs[0].data() };
        resolvedOwnerId = s1.docs[0].id;
      } else if (last10) {
        const q2 = query(ownersRef, where('phone', '==', `+91 ${last10}`));
        const s2 = await getDocs(q2);
        if (!s2.empty) {
          carOwnerDocData = { id: s2.docs[0].id, ...s2.docs[0].data() };
          resolvedOwnerId = s2.docs[0].id;
        }
      }
    }

    if (!carOwnerDocData && typeof window !== 'undefined') {
      const storedOwnerId = localStorage.getItem('torque_owner_id');
      const storedOwnerPhone = localStorage.getItem('torque_owner_phone');
      if (storedOwnerId) {
        try {
          const snap = await getDoc(doc(db, 'Car_Owners', storedOwnerId));
          if (snap.exists()) {
            carOwnerDocData = { id: snap.id, ...snap.data() };
            resolvedOwnerId = snap.id;
          }
        } catch (e) {
          // ignore
        }
      }
      if (!carOwnerDocData && storedOwnerPhone) {
        try {
          const ownersRef = collection(db, 'Car_Owners');
          const q = query(ownersRef, where('phone', '==', storedOwnerPhone));
          const s = await getDocs(q);
          if (!s.empty) {
            carOwnerDocData = { id: s.docs[0].id, ...s.docs[0].data() };
            resolvedOwnerId = s.docs[0].id;
          }
        } catch (e) {
          // ignore
        }
      }
    }

    if (!carOwnerDocData) {
      try {
        const ownersRef = collection(db, 'Car_Owners');
        const allOwnersSnap = await getDocs(ownersRef);
        if (!allOwnersSnap.empty) {
          let chosenDoc = allOwnersSnap.docs[allOwnersSnap.docs.length - 1];
          for (const docCandidate of allOwnersSnap.docs) {
            const vSub = await getDocs(collection(db, 'Car_Owners', docCandidate.id, 'Vehicles'));
            for (const vDoc of vSub.docs) {
              const wSub = await getDocs(collection(db, 'Car_Owners', docCandidate.id, 'Vehicles', vDoc.id, 'Washes'));
              if (!wSub.empty) {
                chosenDoc = docCandidate;
                break;
              }
            }
          }
          carOwnerDocData = { id: chosenDoc.id, ...chosenDoc.data() };
          resolvedOwnerId = chosenDoc.id;
        }
      } catch (e) {
        // ignore
      }
    }

    if (carOwnerDocData) {
      const resolvedOwnerName =
        carOwnerDocData.name || carOwnerDocData.owner_name || 'Vehicle Owner';
      const ownerPrice =
        carOwnerDocData.price ??
        carOwnerDocData.subscriptionPrice ??
        carOwnerDocData.subscription?.price;

      result.user = {
        id: resolvedOwnerId,
        name: resolvedOwnerName,
        owner_name: resolvedOwnerName,
        phone: carOwnerDocData.phone || userPhone || '',
        role: 'owner',
        status: carOwnerDocData.status || 'active',
        created_at: carOwnerDocData.createdAt || carOwnerDocData.created_at || new Date().toISOString(),
        selected_plan: carOwnerDocData.selectedPlan || carOwnerDocData.planId || carOwnerDocData.selected_plan || 'HOME BASIC',
        assigned_washer_id: carOwnerDocData.assignedWasherId || carOwnerDocData.assigned_washer_id,
        assigned_washer_name: carOwnerDocData.assignedWasherName || carOwnerDocData.assigned_washer_name || 'Shubham G',
        address: carOwnerDocData.address,
        alt_phone: carOwnerDocData.altPhone || carOwnerDocData.alt_phone,
        price: ownerPrice,
        subscription_price: ownerPrice,
      };
      result.source = 'firebase_live';

      // 2. Fetch Vehicles subcollection: Car_Owners/{ownerId}/Vehicles
      try {
        const vehiclesSubRef = collection(db, 'Car_Owners', resolvedOwnerId, 'Vehicles');
        const vSnap = await getDocs(vehiclesSubRef);
        const fetchedVehicles: Vehicle[] = [];
        const fetchedWashes: WashRecord[] = [];

        for (const vDoc of vSnap.docs) {
          const vData = vDoc.data();
          const vId = vDoc.id || vData.vehicleId || vData.id;
          const sub = vData.subscription || {};
          const vPrice =
            vData.price ??
            sub.price ??
            vData.subscriptionPrice ??
            vData.subscription_price;

          const vehicleObj: Vehicle = {
            id: vId,
            owner_id: resolvedOwnerId,
            owner_name: vData.ownerName || result.user.name,
            registration_number: vData.registrationNumber || vData.registration_number || '',
            make: vData.make || '',
            model: vData.model || '',
            type: vData.type || 'car',
            color: vData.color || 'Pearl White',
            parking_location: vData.parkingLocation || vData.parking_location || 'Assigned Bay',
            preferred_wash_time: vData.preferredWashTime || vData.preferred_wash_time || '07:30 AM',
            society_id: 'soc_green_valley',
            society_name: vData.societyName || vData.society_name || 'Green Valley Residency',
            subscription_status: 'active',
            washes_this_month: sub.washesUsed ?? vData.washes_this_month ?? 0,
            selected_plan: sub.planId || vData.selected_plan || result.user.selected_plan || 'HOME BASIC',
            assigned_washer_id: vData.washerId || vData.assigned_washer_id || result.user.assigned_washer_id || 'wsh_1790795559023',
            assigned_washer_name: vData.washerName || vData.assigned_washer_name || result.user.assigned_washer_name || 'Shubham G',
            price: vPrice,
            subscription_price: vPrice,
          };

          // 3. Fetch Month and Washes subcollections:
          // Car_Owners/{ownerId}/Vehicles/{vehicleId}/{monthKey}/{dateIso}
          // Car_Owners/{ownerId}/Vehicles/{vehicleId}/Months/{monthKey}/Dates/{dateIso}
          // Car_Owners/{ownerId}/Vehicles/{vehicleId}/Washes/{washId}
          try {
            const currentIst = getTodayISTDate();
            // Determine start month (from user created_at or subscription)
            const startDate = result.user?.created_at ? new Date(result.user.created_at) : new Date();
            const startYear = !isNaN(startDate.getTime()) ? startDate.getFullYear() : currentIst.year;
            const startMonth = !isNaN(startDate.getTime()) ? startDate.getMonth() : new Date().getMonth();

            const monthNames = [
              'January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'
            ];

            const monthsToQuery: string[] = [];
            // Generate list of months starting from owner signup month to current month
            let curY = startYear;
            let curM = startMonth;
            const targetY = currentIst.year;
            const targetM = new Date().getMonth();

            while (curY < targetY || (curY === targetY && curM <= targetM)) {
              monthsToQuery.push(`${monthNames[curM]}_${curY}`);
              curM++;
              if (curM > 11) {
                curM = 0;
                curY++;
              }
            }

            // Ensure current month is always included
            if (!monthsToQuery.includes(currentIst.monthKey)) {
              monthsToQuery.push(currentIst.monthKey);
            }

            const washMap = new Map<string, WashRecord>();
            let vehicleWashCount = 0;

            const processWashDoc = (wDocId: string, wData: any) => {
              const proof = wData.proof || {};
              const resolvedWasherName =
                (wData.washerName && wData.washerName !== 'Unregistered Owner' && wData.washerName !== 'Washer Partner'
                  ? wData.washerName
                  : null) ||
                vehicleObj.assigned_washer_name ||
                result.user?.assigned_washer_name ||
                'Shubham G';

              const washPhotoUrl = proof.photoUrl || wData.photoUrl || (wData.status === 'completed' ? '/images/honda_city_after.jpg' : null);
              const schedDate = wData.scheduledDate || wData.date || (wData.day ? `${wData.year}-${String(wData.monthNum || currentIst.monthNum).padStart(2, '0')}-${String(wData.day).padStart(2, '0')}` : 'Today');
              const washUniqueKey = wData.washId || wDocId || `wash_${vId}_${schedDate}`;

              const record: WashRecord = {
                id: washUniqueKey,
                vehicle_id: vId,
                vehicle_name: `${vehicleObj.make} ${vehicleObj.model}`.trim() || 'Your Vehicle',
                registration_number: vehicleObj.registration_number,
                parking_location: vehicleObj.parking_location,
                washer_id: wData.washerId || vehicleObj.assigned_washer_id || 'wsh_1790795559023',
                washer_name: resolvedWasherName,
                washer_avatar: wData.washerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(resolvedWasherName)}&background=0B132B&color=10B981&bold=true`,
                washer_rating: 4.9,
                status: (wData.status as any) || 'completed',
                scheduled_date: schedDate,
                scheduled_time: vehicleObj.preferred_wash_time,
                completed_at: wData.completedAt || null,
                location_verified: true,
                after_photo: washPhotoUrl,
                captured_at: proof.capturedAt || null,
                created_at: wData.createdAt?.toDate ? wData.createdAt.toDate().toISOString() : (typeof wData.createdAt === 'string' ? wData.createdAt : null),
                is_sunday_priority: false,
                is_backup_covered: false,
              };

              washMap.set(schedDate, record);
              if (record.status === 'completed') {
                vehicleWashCount++;
              }
            };

            // 1. Query Month subcollections (e.g. October_2026)
            for (const mKey of monthsToQuery) {
              try {
                const monthSubRef = collection(db, 'Car_Owners', resolvedOwnerId, 'Vehicles', vId, mKey);
                const mSnap = await getDocs(monthSubRef);
                mSnap.forEach((docSnap) => processWashDoc(docSnap.id, docSnap.data()));
              } catch (mErr) {
                // ignore
              }
              try {
                const nestedSubRef = collection(db, 'Car_Owners', resolvedOwnerId, 'Vehicles', vId, 'Months', mKey, 'Dates');
                const nSnap = await getDocs(nestedSubRef);
                nSnap.forEach((docSnap) => processWashDoc(docSnap.id, docSnap.data()));
              } catch (nErr) {
                // ignore
              }
            }

            // 2. Query legacy Washes subcollection for compatibility
            try {
              const washesSubRef = collection(db, 'Car_Owners', resolvedOwnerId, 'Vehicles', vId, 'Washes');
              const wSnap = await getDocs(washesSubRef);
              wSnap.forEach((wDoc) => processWashDoc(wDoc.id, wDoc.data()));
            } catch (wErr) {
              console.warn('Could not read vehicle washes subcollection:', wErr);
            }

            washMap.forEach((rec) => {
              fetchedWashes.push(rec);
            });

            if (vehicleWashCount > 0) {
              vehicleObj.washes_this_month = vehicleWashCount;
            } else if (vData.lastWashStatus === 'completed' && vehicleObj.washes_this_month === 0) {
              vehicleObj.washes_this_month = 1;
            }
          } catch (wErr) {
            console.warn('Could not read vehicle washes:', wErr);
          }

          fetchedVehicles.push(vehicleObj);
        }

        if (fetchedVehicles.length > 0) {
          result.vehicles = fetchedVehicles;
        }
        if (fetchedWashes.length > 0) {
          result.washes = fetchedWashes;
          // CRITICAL: ONLY set todayWash if a wash was ACTUALLY completed TODAY in IST!
          // This ensures that previous days' wash proofs are NOT shown every day!
          const todayWashCandidate = fetchedWashes.find((w) => isWashFromToday(w));
          result.todayWash = todayWashCandidate || null;
        } else {
          result.todayWash = null;
        }
      } catch (subErr) {
        console.warn('Error reading Car_Owners subcollections:', subErr);
      }
    }

    // 4. Fetch Assigned Washer Partner from Washers collection
    const washerId =
      result.user?.assigned_washer_id ||
      result.vehicles[0]?.assigned_washer_id;
    const washerName =
      result.user?.assigned_washer_name ||
      result.vehicles[0]?.assigned_washer_name;

    if (washerId || washerName) {
      try {
        const allWashers = await fetchAllWashersFromFirestore();
        let matched = allWashers.find(
          (w) =>
            (washerId && (w.id === washerId || (w as any).uid === washerId)) ||
            (washerName && w.name && w.name.toLowerCase().trim() === washerName.toLowerCase().trim())
        );

        if (!matched && washerId) {
          const washerDocRef = doc(db, 'Washers', washerId);
          const washerDocSnap = await getDoc(washerDocRef);
          if (washerDocSnap.exists()) {
            matched = { id: washerDocSnap.id, ...washerDocSnap.data() } as WasherPartner;
          }
        }

        if (matched) {
          result.assignedWasher = matched;
          result.source = 'firebase_live';
        } else if (washerName) {
          result.assignedWasher = {
            id: washerId || 'wsh_custom',
            name: washerName,
            phone: '+91 98765 43210',
            avatar: '/images/washer_amit.jpg',
            society: result.user?.society || result.vehicles[0]?.society_name || 'Assigned Society',
            societies: [result.user?.society || result.vehicles[0]?.society_name || 'Assigned Society'],
            assignedCarsPerDay: 30,
            routeWindow: '06:30 AM - 09:30 AM',
            rating: '4.98',
            reviewsCount: 140,
            avgTimePerCar: '5.5 mins',
            completionRate: '99.5%',
            totalLifetimeWashes: 1200,
            status: 'Active on Route',
            kyc: 'Verified (Aadhaar & Police Clear)',
          } as WasherPartner;
          result.source = 'firebase_live';
        }
      } catch (wErr) {
        console.warn('Firebase assigned washer lookup notice:', wErr);
      }
    }

    return result;
  } catch (error: any) {
    console.warn('Firebase fetchOwnerDashboardFromFirestore notice:', error?.message || error);
    return result;
  }
}

/**
 * Deletes an owner's record, their registered vehicles, and wash records from Car_Owners.
 */
export async function resetOwnerFirestoreData(
  userId?: string,
  userPhone?: string
): Promise<{ success: boolean; deletedCount: number; error?: string }> {
  try {
    let deletedCount = 0;

    // Delete from Car_Owners collection
    if (userId && userId !== 'usr_guest') {
      try {
        const carOwnerRef = doc(db, 'Car_Owners', userId);
        const vSubRef = collection(db, 'Car_Owners', userId, 'Vehicles');
        const vSubSnap = await getDocs(vSubRef);
        for (const vDoc of vSubSnap.docs) {
          const wSubRef = collection(db, 'Car_Owners', userId, 'Vehicles', vDoc.id, 'Washes');
          const wSubSnap = await getDocs(wSubRef);
          for (const wDoc of wSubSnap.docs) {
            await deleteDoc(wDoc.ref);
          }
          await deleteDoc(vDoc.ref);
        }
        await deleteDoc(carOwnerRef);
        deletedCount++;
      } catch (err) {
        console.warn('Delete Car_Owners doc notice:', err);
      }
    }

    if (userPhone) {
      try {
        const ownersRef = collection(db, 'Car_Owners');
        const q = query(ownersRef, where('phone', '==', userPhone));
        const snap = await getDocs(q);
        for (const oDoc of snap.docs) {
          const vSubRef = collection(db, 'Car_Owners', oDoc.id, 'Vehicles');
          const vSubSnap = await getDocs(vSubRef);
          for (const vDoc of vSubSnap.docs) {
            const wSubRef = collection(db, 'Car_Owners', oDoc.id, 'Vehicles', vDoc.id, 'Washes');
            const wSubSnap = await getDocs(wSubRef);
            for (const wDoc of wSubSnap.docs) {
              await deleteDoc(wDoc.ref);
            }
            await deleteDoc(vDoc.ref);
          }
          await deleteDoc(oDoc.ref);
          deletedCount++;
        }
      } catch (err) {
        console.warn('Delete Car_Owners by phone notice:', err);
      }
    }

    return { success: true, deletedCount };
  } catch (error: any) {
    console.warn('Firebase resetOwnerFirestoreData notice:', error?.message || error);
    return { success: false, deletedCount: 0, error: error?.message || 'Reset failed' };
  }
}

/**
 * Fetches all active washers from the Washers collection.
 * When called by an Area Manager, queries by createdBy == adminUid to align with Firestore Security Rules.
 */
export async function fetchAllWashersFromFirestore(adminUid?: string): Promise<WasherPartner[]> {
  try {
    const washersMap = new Map<string, WasherPartner>();
    const washersRef = collection(db, 'Washers');

    let snap;
    if (adminUid) {
      // Query washers for specific Area Manager
      const q = query(washersRef, where('createdBy', '==', adminUid));
      snap = await getDocs(q);
    } else {
      // Fetch all verified active washers across all routes
      snap = await getDocs(washersRef);
    }
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      const name = String(data.name || '').toLowerCase();
      const id = String(docSnap.id || '').toLowerCase();
      // Skip dummy mock and test partners (Lijo, Pranav Ghosh, Amit Kumar)
      if (
        id === 'wsh_amit' ||
        name.includes('lijo') ||
        name.includes('pranav ghosh') ||
        name.includes('amit kumar') ||
        id.includes('lijo') ||
        id.includes('pranav') ||
        id.includes('amit')
      ) {
        return;
      }
      if (!washersMap.has(docSnap.id)) {
        const parsedSocieties: string[] =
          data.societies && Array.isArray(data.societies) && data.societies.length > 0
            ? data.societies
            : typeof data.society === 'string' && data.society.trim()
            ? data.society.split(',').map((s: string) => s.trim()).filter(Boolean)
            : [];

        washersMap.set(docSnap.id, {
          id: docSnap.id,
          name: data.name || 'Washer Partner',
          phone: data.phone || '',
          avatar: data.avatar || data.avatar_url || '/images/washer_amit.jpg',
          rating: String(data.rating || '5.0'),
          reviewsCount: Number(data.reviewsCount || data.reviews_count || 0),
          society: data.society || (parsedSocieties.length > 0 ? parsedSocieties.join(', ') : 'Assigned Route'),
          societies: parsedSocieties,
          createdBy: data.createdBy || null,
          assignedCarsPerDay: Number(data.assignedCarsPerDay || data.assigned_cars_per_day || 0),
          routeWindow: data.routeWindow || data.route_window || '06:30 AM - 09:30 AM',
          avgTimePerCar: data.avgTimePerCar || data.avg_time_per_car || '5.5 mins',
          completionRate: data.completionRate || data.completion_rate || '100%',
          totalLifetimeWashes: Number(data.totalLifetimeWashes || data.total_lifetime_washes || 0),
          status: (data.status as any) || 'Active on Route',
          kyc: data.kyc || 'Verified (Aadhaar & Police Clear)',
          aadhaarNumber: data.aadhaarNumber || data.aadhaar_number,
          aadhaarVerified: data.aadhaarVerified ?? true,
          phoneVerified: data.phoneVerified ?? true,
          bankAccount: data.bankAccount || data.bank_account,
          ifscCode: data.ifscCode || data.ifsc_code,
          address: data.address,
          absentThisMonth: Number(data.absentThisMonth || 0),
          absentDates: data.absentDates || [],
          leaveReason: data.leaveReason || '',
          backupWasherName: data.backupWasherName || 'None',
          monthlyPayoutsGone: Number(data.monthlyPayoutsGone || 0),
          pendingPayoutDue: Number(data.pendingPayoutDue || 0),
          sundayBonusEarned: Number(data.sundayBonusEarned || 0),
          disbursements: data.disbursements || [],
          created_at: data.created_at || (data.updated_at ? new Date().toISOString() : undefined),
        });
      }
    });

    return Array.from(washersMap.values());
  } catch (error: any) {
    console.warn('fetchAllWashersFromFirestore error:', error?.message || error);
    return [];
  }
}

/**
 * Step 4 Customer Discovery Query for /auth/signup:
 * Queries the primary Washers collection (and washer_directory) from Firestore,
 * matching the customer's selected "Society Residence / Apartment" with the washer's "societies" array.
 */
export async function fetchWashersFromDirectory(
  selectedSociety?: string
): Promise<WasherPartner[]> {
  try {
    const washersMap = new Map<string, WasherPartner>();

    // 1. Primary: Fetch from Washers collection (source of truth for onboarded washers)
    try {
      const washersRef = collection(db, 'Washers');
      const snap = await getDocs(washersRef);
      snap.forEach((docSnap) => {
        if (docSnap.id === 'wsh_amit') return; // Skip dummy mock partner
        const data = docSnap.data();
        if (data.status === 'Dismissed' || data.isDismissed === true) return;

        const parsedSocieties: string[] =
          data.societies && Array.isArray(data.societies) && data.societies.length > 0
            ? data.societies
            : typeof data.society === 'string' && data.society.trim()
            ? data.society.split(',').map((s: string) => s.trim()).filter(Boolean)
            : [];

        washersMap.set(docSnap.id, {
          id: docSnap.id,
          washerId: docSnap.id,
          name: data.name || 'Washer Partner',
          phone: '', // Keep private
          avatar: data.avatar || data.avatar_url || data.photoURL || '/images/washer_amit.jpg',
          rating: String(data.rating || '5.0'),
          reviewsCount: Number(data.reviewsCount || data.reviews_count || 1),
          society: data.society || (parsedSocieties.length > 0 ? parsedSocieties.join(', ') : 'Assigned Route'),
          societies: parsedSocieties,
          createdBy: data.createdBy || null,
          assignedCarsPerDay: Number(data.assignedCarsPerDay || data.assigned_cars_per_day || 30),
          routeWindow: data.routeWindow || data.route_window || '06:30 AM - 09:30 AM',
          avgTimePerCar: data.avgTimePerCar || data.avg_time_per_car || '5.5 mins',
          completionRate: data.completionRate || data.completion_rate || '100%',
          totalLifetimeWashes: Number(data.totalLifetimeWashes || data.total_lifetime_washes || 0),
          status: (data.status as any) || 'Active on Route',
          kyc: data.kyc || 'Verified Partner',
          aadhaarVerified: true,
          phoneVerified: true,
          absentThisMonth: 0,
          absentDates: [],
          leaveReason: '',
          backupWasherName: 'None',
          monthlyPayoutsGone: 0,
          pendingPayoutDue: 0,
          sundayBonusEarned: 0,
          disbursements: [],
          isFirebaseLive: true,
        } as unknown as WasherPartner);
      });
    } catch (err: any) {
      console.warn('Notice querying Washers collection:', err?.message || err);
    }

    // 2. Secondary: Also check washer_directory collection for any legacy or directory-specific records
    try {
      const directoryRef = collection(db, 'washer_directory');
      const snap2 = await getDocs(directoryRef);
      snap2.forEach((docSnap) => {
        if (docSnap.id === 'wsh_amit' || washersMap.has(docSnap.id)) return;
        const data = docSnap.data();
        if (data.status === 'dismissed' || data.availableForSignup === false) return;

        const parsedSocieties: string[] =
          data.societies && Array.isArray(data.societies) && data.societies.length > 0
            ? data.societies
            : typeof data.society === 'string' && data.society.trim()
            ? data.society.split(',').map((s: string) => s.trim()).filter(Boolean)
            : [];

        washersMap.set(docSnap.id, {
          id: docSnap.id,
          washerId: docSnap.id,
          name: data.name || 'Washer Partner',
          phone: '',
          avatar: data.photoURL || data.avatar || '/images/washer_amit.jpg',
          rating: String(data.rating || '5.0'),
          reviewsCount: Number(data.reviewsCount || 1),
          society: data.society || (parsedSocieties.length > 0 ? parsedSocieties.join(', ') : 'Assigned Route'),
          societies: parsedSocieties,
          createdBy: data.createdBy || null,
          assignedCarsPerDay: 30,
          routeWindow: data.routeWindow || '06:30 AM - 09:30 AM',
          avgTimePerCar: '5.5 mins',
          completionRate: data.completionRate || '100%',
          totalLifetimeWashes: 0,
          status: 'Active on Route',
          kyc: 'Verified Partner',
          aadhaarVerified: true,
          phoneVerified: true,
          absentThisMonth: 0,
          absentDates: [],
          leaveReason: '',
          backupWasherName: 'None',
          monthlyPayoutsGone: 0,
          pendingPayoutDue: 0,
          sundayBonusEarned: 0,
          disbursements: [],
          isFirebaseLive: true,
        } as unknown as WasherPartner);
      });
    } catch (err2: any) {
      console.warn('Notice querying washer_directory collection:', err2?.message || err2);
    }

    const allWashers = Array.from(washersMap.values());

    // 3. Match against the selected "Society Residence / Apartment" with "societies"
    if (selectedSociety && selectedSociety.trim()) {
      const target = selectedSociety.trim().toLowerCase();
      return allWashers.filter((w) => {
        // A. Match against societies array from Firestore
        if (Array.isArray(w.societies) && w.societies.length > 0) {
          const matched = w.societies.some((soc) => {
            const clean = (soc || '').trim().toLowerCase();
            return clean === target || clean.includes(target) || target.includes(clean);
          });
          if (matched) return true;
        }

        // B. Match against society comma-delimited string fallback
        if (typeof w.society === 'string' && w.society.trim()) {
          const parts = w.society.split(',').map((s) => s.trim().toLowerCase());
          const matched = parts.some(
            (part) => part === target || part.includes(target) || target.includes(part)
          );
          if (matched) return true;
        }

        return false;
      });
    }

    return allWashers;
  } catch (error: any) {
    console.warn('fetchWashersFromDirectory notice:', error?.message || error);
    return [];
  }
}

/**
 * ===============================================================
 * AREA MANAGERS COLLECTION
 * ===============================================================
 */
export interface AreaManagerRecord {
  id?: string;
  fullName: string;
  phoneNumber: string;
  aadhaarNumber: string;
  aadhaarPhotoUrl?: string | null;
  role: 'Area Manager';
  updatedAt?: string;
  createdAt?: string;
  email?: string;
}

export async function saveAreaManagerToFirestore(data: AreaManagerRecord): Promise<{ success: boolean; id: string; error?: string }> {
  try {
    const currentAuthUid = auth?.currentUser?.uid;
    const docId = currentAuthUid || data.id || (typeof window !== 'undefined' ? localStorage.getItem('torque_admin_uid') : null);
    if (!docId) {
      return { success: false, id: '', error: 'Missing authenticated Admin UID. Please log in again.' };
    }
    const ref = doc(db, 'area_managers', docId);
    await setDoc(ref, {
      fullName: data.fullName,
      full_name: data.fullName,
      phoneNumber: data.phoneNumber,
      phone_number: data.phoneNumber,
      aadhaarNumber: data.aadhaarNumber,
      aadhaar_number: data.aadhaarNumber,
      aadhaarPhotoUrl: data.aadhaarPhotoUrl || null,
      aadhaar_photo_url: data.aadhaarPhotoUrl || null,
      role: 'Area Manager',
      email: data.email || null,
      updated_at: new Date().toISOString(),
      created_at: data.createdAt || new Date().toISOString(),
    }, { merge: true });

    // Ensure any stray admin document accidentally created in Car_Owners is erased
    try {
      const strayOwnerRef = doc(db, 'Car_Owners', docId);
      const straySnap = await getDoc(strayOwnerRef);
      if (straySnap.exists()) {
        await deleteDoc(strayOwnerRef);
        console.log('Cleaned up stray admin document from Car_Owners:', docId);
      }
    } catch (cleanErr) {
      // Safe ignore
    }

    return { success: true, id: docId };
  } catch (error: any) {
    console.error('Error saving area manager to Firestore:', error);
    return { success: false, id: data.id || '', error: error?.message || 'Failed to save to Firestore' };
  }
}

export async function fetchAreaManagerFromFirestore(managerId?: string): Promise<AreaManagerRecord | null> {
  try {
    if (!managerId) return null;
    const ref = doc(db, 'area_managers', managerId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const d = snap.data();
      return {
        id: snap.id,
        fullName: d.fullName || d.full_name || '',
        phoneNumber: d.phoneNumber || d.phone_number || '',
        aadhaarNumber: d.aadhaarNumber || d.aadhaar_number || '',
        aadhaarPhotoUrl: d.aadhaarPhotoUrl || d.aadhaar_photo_url || null,
        role: 'Area Manager',
        email: d.email || '',
        updatedAt: d.updated_at,
        createdAt: d.created_at,
      };
    }
    return null;
  } catch (error) {
    console.warn('fetchAreaManagerFromFirestore notice:', error);
    return null;
  }
}

export async function fetchAreaManagerByEmail(email: string): Promise<AreaManagerRecord | null> {
  try {
    if (!email) return null;
    const colRef = collection(db, 'area_managers');
    const q = query(colRef, where('email', '==', email.toLowerCase().trim()));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docSnap = snap.docs[0];
      const d = docSnap.data();
      return {
        id: docSnap.id,
        fullName: d.fullName || d.full_name || '',
        phoneNumber: d.phoneNumber || d.phone_number || '',
        aadhaarNumber: d.aadhaarNumber || d.aadhaar_number || '',
        aadhaarPhotoUrl: d.aadhaarPhotoUrl || d.aadhaar_photo_url || null,
        role: 'Area Manager',
        email: d.email || '',
        updatedAt: d.updated_at,
        createdAt: d.created_at,
      };
    }
    return null;
  } catch (err) {
    console.warn('fetchAreaManagerByEmail notice:', err);
    return null;
  }
}


// ===============================================================
// SOCIETIES — Production Firestore Collection
// ===============================================================

export interface FirestoreSociety {
  societyId: string;
  id?: string; // Convenience alias for societyId
  name: string;
  city: string;
  state: string;
  status: 'active' | 'inactive';
  createdBy: string;
  createdAt?: any;
  updatedAt?: any;
}

/**
 * Generates a unique society ID like "soc_8F3K2A"
 */
export function generateSocietyId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `soc_${suffix}`;
}

/**
 * Fetch all societies (admin use — all statuses).
 * Queries Firestore Societies collection.
 */
export async function fetchAllSocieties(): Promise<FirestoreSociety[]> {
  try {
    const colRef = collection(db, 'Societies');
    const snap = await getDocs(colRef);
    return snap.docs.map((d) => {
      const data = d.data();
      const sId = data.societyId || d.id;
      return {
        societyId: sId,
        id: sId,
        name: data.name || '',
        state: data.state || '',
        city: data.city || '',
        status: (data.status as 'active' | 'inactive') || 'active',
        createdBy: data.createdBy || '',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    });
  } catch (err: any) {
    console.warn('fetchAllSocieties notice:', err?.message || err);
    return [];
  }
}

/**
 * Fetch only active societies — for customer-facing signup dropdown.
 */
export async function fetchActiveSocieties(): Promise<FirestoreSociety[]> {
  try {
    const colRef = collection(db, 'Societies');
    const q = query(colRef, where('status', '==', 'active'));
    const snap = await getDocs(q);
    const activeDocs = snap.docs.map((d) => {
      const data = d.data();
      const sId = data.societyId || d.id;
      return {
        societyId: sId,
        id: sId,
        name: data.name || '',
        state: data.state || '',
        city: data.city || '',
        status: 'active' as const,
        createdBy: data.createdBy || '',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    });
    if (activeDocs.length > 0) return activeDocs;
    // Fallback if status filter unindexed
    const all = await fetchAllSocieties();
    return all.filter((s) => s.status === 'active');
  } catch (err: any) {
    console.warn('fetchActiveSocieties notice:', err?.message || err);
    return [];
  }
}

/**
 * Fetch societies created by the admin.
 */
export async function fetchSocietiesByAdmin(adminId?: string): Promise<FirestoreSociety[]> {
  try {
    const all = await fetchAllSocieties();
    const currentUid =
      adminId ||
      auth?.currentUser?.uid ||
      (typeof window !== 'undefined' ? (localStorage.getItem('torque_admin_uid') || localStorage.getItem('torque_owner_id')) : null) ||
      '';

    if (currentUid) {
      const filtered = all.filter((s) => {
        if (!s.createdBy) return false;
        return (
          s.createdBy === currentUid ||
          (auth?.currentUser?.uid && s.createdBy === auth.currentUser.uid) ||
          (typeof window !== 'undefined' && localStorage.getItem('torque_admin_uid') && s.createdBy === localStorage.getItem('torque_admin_uid')) ||
          (typeof window !== 'undefined' && localStorage.getItem('torque_owner_id') && s.createdBy === localStorage.getItem('torque_owner_id'))
        );
      });
      if (filtered.length > 0) {
        return filtered;
      }
      // Fallback for dev / mock session IDs if created under unknown_admin or admin-lead-1
      const fallback = all.filter(
        (s) => s.createdBy === 'unknown_admin' || s.createdBy === 'admin-lead-1' || s.createdBy === currentUid
      );
      if (fallback.length > 0) {
        return fallback;
      }
    }

    // Return any non-empty createdBy societies from Firestore
    return all.filter((s) => Boolean(s.createdBy));
  } catch (err: any) {
    console.warn('fetchSocietiesByAdmin notice:', err?.message || err);
    return [];
  }
}

/**
 * Create a new society in Firestore.
 * Firestore structure:
 * Societies/
 *     {societyId}
 * Fields:
 * societyId, name, state, city, status, createdBy, createdAt, updatedAt
 */
export async function createSociety(data: {
  name: string;
  city: string;
  state: string;
  createdBy?: string;
}): Promise<{ success: boolean; societyId: string; error?: string }> {
  try {
    const createdBy =
      data.createdBy ||
      auth?.currentUser?.uid ||
      (typeof window !== 'undefined' ? (localStorage.getItem('torque_admin_uid') || localStorage.getItem('torque_owner_id')) : null) ||
      'unknown_admin';

    const societyId = generateSocietyId();
    const cleanState = data.state.trim();
    const cleanCity = data.city.trim();
    const cleanName = data.name.trim();

    const societyPayload = {
      societyId,
      name: cleanName,
      state: cleanState,
      city: cleanCity,
      status: 'active' as const,
      createdBy,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const rootSocietyRef = doc(db, 'Societies', societyId);
    await setDoc(rootSocietyRef, societyPayload);

    return { success: true, societyId };
  } catch (err: any) {
    console.error('createSociety error:', err);
    return { success: false, societyId: '', error: err?.message || 'Failed to create society' };
  }
}

/**
 * Update an existing society (name, city, state, or status).
 */
export async function updateSociety(
  societyId: string,
  updates: Partial<{ name: string; city: string; state: string; status: 'active' | 'inactive' }>
): Promise<{ success: boolean; error?: string }> {
  try {
    const rootRef = doc(db, 'Societies', societyId);
    await setDoc(
      rootRef,
      {
        ...updates,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return { success: true };
  } catch (err: any) {
    console.error('updateSociety error:', err);
    return { success: false, error: err?.message || 'Failed to update society' };
  }
}

/**
 * Fetch washers from washer_directory assigned to a specific societyId.
 * Executes direct Firestore query:
 *   collection('washer_directory')
 *   where('societies', 'array-contains', selectedSocietyId)
 *   where('status', '==', 'active')
 *   where('availableForSignup', '==', true)
 */
export interface DirectoryWasher {
  id: string;
  washerId: string;
  name: string;
  photoURL: string;
  avatar?: string;
  societies: string[]; // array of societyIds
  status: string;
  availableForSignup: boolean;
  rating: string;
  reviewsCount: number;
  routeWindow: string;
  completionRate: string;
  createdBy?: string;
}

export async function fetchWashersBySocietyId(
  societyId: string
): Promise<DirectoryWasher[]> {
  try {
    const cleanId = (societyId || '').trim();
    if (!cleanId) return [];

    const colRef = collection(db, 'washer_directory');
    const q = query(
      colRef,
      where('societies', 'array-contains', cleanId),
      where('status', '==', 'active'),
      where('availableForSignup', '==', true)
    );
    const snap = await getDocs(q);

    return snap.docs.map((d) => {
      const data = d.data();
      const photo = data.photoURL || data.avatar || '';
      return {
        id: d.id,
        washerId: data.washerId || d.id,
        name: data.name || 'Washer Partner',
        photoURL: photo,
        avatar: photo,
        societies: Array.isArray(data.societies) ? data.societies : [],
        status: data.status || 'active',
        availableForSignup: data.availableForSignup ?? true,
        rating: String(data.rating || '5.0'),
        reviewsCount: Number(data.reviewsCount || 0),
        routeWindow: data.routeWindow || '06:30 AM – 09:30 AM',
        completionRate: data.completionRate || '100%',
        createdBy: data.createdBy || '',
      };
    });
  } catch (err: any) {
    console.warn('fetchWashersBySocietyId query error:', err?.message || err);
    try {
      const fallbackQuery = query(
        collection(db, 'washer_directory'),
        where('societies', 'array-contains', (societyId || '').trim())
      );
      const snap = await getDocs(fallbackQuery);
      return snap.docs
        .map((d) => {
          const data = d.data();
          const photo = data.photoURL || data.avatar || '';
          return {
            id: d.id,
            washerId: data.washerId || d.id,
            name: data.name || 'Washer Partner',
            photoURL: photo,
            avatar: photo,
            societies: Array.isArray(data.societies) ? data.societies : [],
            status: data.status || 'active',
            availableForSignup: data.availableForSignup ?? true,
            rating: String(data.rating || '5.0'),
            reviewsCount: Number(data.reviewsCount || 0),
            routeWindow: data.routeWindow || '06:30 AM – 09:30 AM',
            completionRate: data.completionRate || '100%',
            createdBy: data.createdBy || '',
          };
        })
        .filter((w) => w.status === 'active' && w.availableForSignup);
    } catch (fErr) {
      return [];
    }
  }
}

/**
 * Fetch all washers from washer_directory (admin use for society assignment UI).
 */
export async function fetchAllDirectoryWashers(): Promise<DirectoryWasher[]> {
  try {
    const colRef = collection(db, 'washer_directory');
    const snap = await getDocs(colRef);
    return snap.docs
      .map((d) => {
        const data = d.data();
        const photo = data.photoURL || data.avatar || '/images/washer_amit.jpg';
        return {
          id: d.id,
          washerId: d.id,
          name: data.name || 'Washer Partner',
          photoURL: photo,
          avatar: photo,
          societies: Array.isArray(data.societies) ? data.societies : [],
          status: data.status || 'active',
          availableForSignup: data.availableForSignup ?? true,
          rating: String(data.rating || '5.0'),
          reviewsCount: Number(data.reviewsCount || 0),
          routeWindow: data.routeWindow || '06:30 AM – 09:30 AM',
          completionRate: data.completionRate || '100%',
          createdBy: data.createdBy || '',
        };
      });
  } catch (err: any) {
    console.warn('fetchAllDirectoryWashers notice:', err?.message || err);
    return [];
  }
}

/**
 * Assign a washer to a society by updating their societies array in washer_directory
 * and Washers collections using arrayUnion (no duplicates).
 */
export async function assignWasherToSociety(
  washerId: string,
  societyId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { arrayUnion } = await import('firebase/firestore');

    // Update washer_directory (public, customer-facing)
    const dirRef = doc(db, 'washer_directory', washerId);
    await setDoc(dirRef, { societies: arrayUnion(societyId), updatedAt: serverTimestamp() }, { merge: true });

    // Also update Washers collection (private operational)
    const washerRef = doc(db, 'Washers', washerId);
    await setDoc(washerRef, { societies: arrayUnion(societyId), updatedAt: serverTimestamp() }, { merge: true });

    return { success: true };
  } catch (err: any) {
    console.error('assignWasherToSociety error:', err);
    return { success: false, error: err?.message || 'Failed to assign washer to society' };
  }
}

/**
 * Remove a washer from a society using arrayRemove.
 */
export async function removeWasherFromSociety(
  washerId: string,
  societyId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { arrayRemove } = await import('firebase/firestore');

    const dirRef = doc(db, 'washer_directory', washerId);
    await setDoc(dirRef, { societies: arrayRemove(societyId), updatedAt: serverTimestamp() }, { merge: true });

    const washerRef = doc(db, 'Washers', washerId);
    await setDoc(washerRef, { societies: arrayRemove(societyId), updatedAt: serverTimestamp() }, { merge: true });

    return { success: true };
  } catch (err: any) {
    console.error('removeWasherFromSociety error:', err);
    return { success: false, error: err?.message || 'Failed to remove washer from society' };
  }
}

/**
 * Server-side validation: Verify that a washer is actually assigned to the selected society.
 * Called before completing signup to prevent spoofed frontend submissions.
 *
 * Validates:
 *   washer_directory/{washerId}.societies contains societyId
 *   washer_directory/{washerId}.status == 'active'
 *   washer_directory/{washerId}.availableForSignup == true
 */
export async function validateWasherForSociety(
  washerId: string,
  societyId: string,
  societyName?: string
): Promise<{ valid: boolean; reason?: string }> {
  try {
    if (!washerId || (!societyId && !societyName)) {
      return { valid: false, reason: 'Missing washer or society ID' };
    }
    const dirRef = doc(db, 'washer_directory', washerId);
    let data: any = null;
    const snap = await getDoc(dirRef);
    if (snap.exists()) {
      data = snap.data();
    } else {
      const wRef = doc(db, 'Washers', washerId);
      const wSnap = await getDoc(wRef);
      if (wSnap.exists()) {
        data = wSnap.data();
      }
    }

    if (!data) {
      return { valid: false, reason: 'Washer not found in directory' };
    }

    const societies: string[] = Array.isArray(data.societies) ? data.societies : [];
    const singleSoc: string = typeof data.society === 'string' ? data.society : '';
    const idClean = (societyId || '').trim();
    const nameClean = (societyName || '').trim().toLowerCase();

    const isAssigned =
      (idClean && societies.includes(idClean)) ||
      (nameClean && societies.some((s) => s.toLowerCase() === nameClean)) ||
      (idClean && singleSoc.includes(idClean)) ||
      (nameClean && singleSoc.toLowerCase().includes(nameClean));

    if (!isAssigned) {
      return { valid: false, reason: 'Washer is not assigned to selected society' };
    }
    if (data.status === 'dismissed' || data.status === 'inactive') {
      return { valid: false, reason: 'Washer is not currently active' };
    }
    if (data.availableForSignup === false) {
      return { valid: false, reason: 'Washer is not available for signup' };
    }
    return { valid: true };
  } catch (err: any) {
    console.warn('validateWasherForSociety notice:', err?.message || err);
    return { valid: false, reason: 'Validation error — please try again' };
  }
}

/**
 * ===============================================================
 * CUSTOMER REGISTRY & SERVICE AUDITS (/admin/customers)
 * ===============================================================
 */

export interface AdminCustomerVehicle {
  id: string;
  name: string;
  plate: string;
  last4: string;
  parkingLocation: string;
  preferredTime: string;
  color?: string;
  type?: string;
  assignedWasherName?: string;
  assignedWasherId?: string;
}

export interface AdminCustomer {
  id: string;
  name: string;
  phone: string;
  society: string;
  societyId?: string;
  state?: string;
  city?: string;
  flat: string;
  status: 'Active' | 'Paused';
  plan: string;
  vehicles: AdminCustomerVehicle[];
  adminId?: string;
  assignedAdminId?: string;
  assignedWasherId?: string;
  assignedWasherName?: string;
  price?: number;
  createdAt?: string;
}

/**
 * Resolves the Admin (Area Manager) in charge of a given washer or society:
 * Checks washer_directory, Washers, and Societies collections.
 */
export async function resolveInchargeAdminId(
  washerId?: string,
  societyId?: string
): Promise<string> {
  try {
    if (washerId) {
      const dRef = doc(db, 'washer_directory', washerId);
      const dSnap = await getDoc(dRef);
      if (dSnap.exists() && dSnap.data()?.createdBy) {
        return dSnap.data().createdBy;
      }
      const wRef = doc(db, 'Washers', washerId);
      const wSnap = await getDoc(wRef);
      if (wSnap.exists() && wSnap.data()?.createdBy) {
        return wSnap.data().createdBy;
      }
    }

    if (societyId) {
      const sRef = doc(db, 'Societies', societyId);
      const sSnap = await getDoc(sRef);
      if (sSnap.exists() && sSnap.data()?.createdBy) {
        return sSnap.data().createdBy;
      }
    }
  } catch (err: any) {
    console.warn('resolveInchargeAdminId notice:', err?.message || err);
  }
  return '';
}

/**
 * Fetches car owners and their vehicle fleet from Firestore for /admin/customers.
 * Reads collection('Car_Owners') and nested collection('Car_Owners', ownerId, 'Vehicles').
 * Also checks fallback vehicles array in document data.
 */
export async function fetchAdminCustomers(adminId?: string): Promise<AdminCustomer[]> {
  try {
    const ownersRef = collection(db, 'Car_Owners');
    const snap = await getDocs(ownersRef);

    const customers: AdminCustomer[] = [];

    for (const docSnap of snap.docs) {
      const d = docSnap.data();

      // Extract vehicles
      const vehicles: AdminCustomerVehicle[] = [];

      try {
        const vehiclesRef = collection(db, 'Car_Owners', docSnap.id, 'Vehicles');
        const vSnap = await getDocs(vehiclesRef);

        vSnap.forEach((vDoc) => {
          const vd = vDoc.data();
          const regPlate = (vd.registrationNumber || vd.registration_number || '').trim();
          const cleanPlateDigits = regPlate.replace(/[^a-zA-Z0-9]/g, '');
          const last4 = cleanPlateDigits.length >= 4 ? cleanPlateDigits.slice(-4) : cleanPlateDigits || '0000';
          const vehicleName = `${vd.make || ''} ${vd.model || ''}`.trim() || 'Vehicle';

          vehicles.push({
            id: vDoc.id,
            name: vehicleName,
            plate: regPlate || 'UNREGISTERED',
            last4: last4.toUpperCase(),
            parkingLocation: vd.parkingLocation || vd.parking_location || 'Assigned Bay',
            preferredTime: vd.preferredWashTime || vd.preferred_wash_time || '07:30 AM',
            color: vd.color || 'Pearl White',
            type: vd.type || 'car',
            assignedWasherName: vd.washerName || vd.assigned_washer_name || d.assignedWasherName || d.selectedWasherName || '',
            assignedWasherId: vd.washerId || vd.assigned_washer_id || d.assignedWasherId || d.selectedWasherId || '',
          });
        });
      } catch (vErr) {
        console.warn(`Error loading vehicles for customer ${docSnap.id}:`, vErr);
      }

      // Fallback: If no subcollection docs found, check if array exists in doc data
      if (vehicles.length === 0 && Array.isArray(d.vehicles) && d.vehicles.length > 0) {
        d.vehicles.forEach((vd: any, idx: number) => {
          const regPlate = (vd.registrationNumber || vd.registration_number || '').trim();
          const cleanPlateDigits = regPlate.replace(/[^a-zA-Z0-9]/g, '');
          const last4 = cleanPlateDigits.length >= 4 ? cleanPlateDigits.slice(-4) : cleanPlateDigits || '0000';
          const vehicleName = `${vd.make || ''} ${vd.model || ''}`.trim() || 'Vehicle';

          vehicles.push({
            id: vd.id || `v_${docSnap.id}_${idx}`,
            name: vehicleName,
            plate: regPlate || 'UNREGISTERED',
            last4: last4.toUpperCase(),
            parkingLocation: vd.parkingLocation || vd.parking_location || 'Assigned Bay',
            preferredTime: vd.preferredWashTime || vd.preferred_wash_time || '07:30 AM',
            color: vd.color || 'Pearl White',
            type: vd.type || 'car',
            assignedWasherName: vd.washerName || vd.assigned_washer_name || d.assignedWasherName || d.selectedWasherName || '',
            assignedWasherId: vd.washerId || vd.assigned_washer_id || d.assignedWasherId || d.selectedWasherId || '',
          });
        });
      }

      // If still no vehicles, provide a fallback representation from owner metadata if registration exists
      if (vehicles.length === 0 && (d.registrationNumber || d.registration_number || d.vehicleName || d.make)) {
        const regPlate = (d.registrationNumber || d.registration_number || '').trim();
        const cleanPlateDigits = regPlate.replace(/[^a-zA-Z0-9]/g, '');
        const last4 = cleanPlateDigits.length >= 4 ? cleanPlateDigits.slice(-4) : cleanPlateDigits || '0000';
        vehicles.push({
          id: `veh_single_${docSnap.id}`,
          name: `${d.make || ''} ${d.model || ''}`.trim() || d.vehicleName || 'Vehicle',
          plate: regPlate || 'KA 01 HY 4567',
          last4: last4.toUpperCase(),
          parkingLocation: d.parkingLocation || d.parking_location || 'Assigned Bay',
          preferredTime: d.preferredWashTime || d.preferred_wash_time || '07:30 AM',
          color: d.color || 'Pearl White',
          type: d.type || 'car',
          assignedWasherName: d.assignedWasherName || d.selectedWasherName || '',
          assignedWasherId: d.assignedWasherId || d.selectedWasherId || '',
        });
      }

      const statusRaw = (d.status || 'Active').toLowerCase();
      const status: 'Active' | 'Paused' = statusRaw === 'paused' || statusRaw === 'suspended' ? 'Paused' : 'Active';

      const plan = d.selectedPlan || d.planId || d.selected_plan || (d.subscription && d.subscription.planId) || 'HOME BASIC';

      const customerItem: AdminCustomer = {
        id: docSnap.id,
        name: d.name || d.owner_name || 'Vehicle Owner',
        phone: d.phone || d.phoneNumber || '',
        society: d.society || d.societyName || d.society_name || 'Unassigned Society',
        societyId: d.societyId || d.society_id || '',
        state: d.state || '',
        city: d.city || '',
        flat: d.flat || d.flatNumber || d.address || 'Bay Assigned',
        status,
        plan,
        vehicles,
        adminId: d.adminId || d.assignedAdminId || d.areaManagerId || d.createdBy || '',
        assignedAdminId: d.assignedAdminId || d.adminId || '',
        assignedWasherId: d.assignedWasherId || d.selectedWasherId || '',
        assignedWasherName: d.assignedWasherName || d.selectedWasherName || '',
        price: d.price || d.subscriptionPrice || 599,
        createdAt: d.createdAt || d.created_at || (d.lastLoginAt ? new Date().toISOString() : ''),
      };

      customers.push(customerItem);
    }

    return customers;
  } catch (err: any) {
    console.warn('fetchAdminCustomers error:', err?.message || err);
    return [];
  }
}

