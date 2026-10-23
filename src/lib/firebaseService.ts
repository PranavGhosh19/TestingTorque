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
  onSnapshot,
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from './firebase';
import { User, Vehicle, WashRecord, RouteStop, WasherSubstitutionAudit, LeadRegistration } from './types';
import { WasherPartner } from './washerPartners';
import { isWashFromToday, getTodayISTDate } from './washUtils';

export function getWasherPayoutPerWash(_vehicle?: { type?: string; model?: string; make?: string }): number {
  return 0;
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
      return 499; // Hatchback / Sedan
    };

    const calculatedTotal = vehicles && vehicles.length > 0
      ? vehicles.reduce((sum, v) => sum + (v.price || (v as any).subscription_price || getBodyTypePrice(v.type)), 0)
      : (owner.price || 499);

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

    const ownerNeedBefore = (owner as any).needWashBefore || (owner as any).need_wash_before || '8:00 AM';
    const tomorrowStart = new Date();
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    tomorrowStart.setHours(6, 0, 0, 0);
    const subStartDate = (owner as any).subscriptionStartDate || tomorrowStart.toISOString();
    const subEndDate = new Date(new Date(subStartDate).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // 1. CAR OWNER: Car_Owners/{ownerId}
    const carOwnerRef = doc(db, 'Car_Owners', ownerId);
    const carOwnerPayload: Record<string, any> = {
      customerId: ownerId,
      ownerId: ownerId,
      name: owner.name,
      email: owner.email || (owner as any).email || null,
      phone: owner.phone,
      altPhone: owner.alt_phone || null,
      address: owner.address || null,
      flat: resolvedFlat,
      flatNumber: resolvedFlatNumber,
      state: resolvedState,
      city: resolvedCity,
      district: (owner as any).district || null,
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
      needWashBefore: ownerNeedBefore,
      need_wash_before: ownerNeedBefore,
      washerLeaveDay: (owner as any).washerLeaveDay || (owner as any).washerWeeklyLeaveDay || null,
      washerWeeklyLeaveDay: (owner as any).washerLeaveDay || (owner as any).washerWeeklyLeaveDay || null,
      signupDate: (owner as any).signupDate || new Date().toISOString().split('T')[0],
      serviceStartDate: (owner as any).serviceStartDate || subStartDate.split('T')[0],
      assignedWasherId: resolvedWasherId,
      assignedWasherName: resolvedWasherName,
      createdAt: owner.created_at || new Date().toISOString(),
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      // Legacy helper compatibility
      id: ownerId,
      owner_name: owner.owner_name || owner.name,
      assigned_washer_id: resolvedWasherId,
      assigned_washer_name: resolvedWasherName,
    };

    // Only include subscription details if explicitly provided (not a subscription-based product anymore)
    if (owner.selected_plan || (owner as any).selectedPlan || (owner as any).subscription) {
      const planName = owner.selected_plan || (owner as any).selectedPlan || defaultPlanName;
      carOwnerPayload.planId = planName;
      carOwnerPayload.selectedPlan = planName;
      carOwnerPayload.selected_plan = planName;
      carOwnerPayload.price = subscriptionPrice;
      carOwnerPayload.subscriptionPrice = subscriptionPrice;
      carOwnerPayload.subscriptionStartDate = subStartDate;
      carOwnerPayload.subscription = {
        planId: planName,
        price: subscriptionPrice,
        billingCycle: 'monthly',
        status: 'active',
        startDate: subStartDate,
        endDate: subEndDate,
      };
    }
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
        const effectiveNeedBefore =
          (vehicle as any).needWashBefore ||
          (vehicle as any).need_wash_before ||
          ownerNeedBefore ||
          vehicle.preferred_wash_time ||
          '8:00 AM';
        const vSubStartDate = (vehicle as any).subscriptionStartDate || subStartDate;
        const vSubEndDate = new Date(new Date(vSubStartDate).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

        const vehicleDocRef = doc(db, 'Car_Owners', ownerId, 'Vehicles', vehicleId);
        const vehiclePayload: Record<string, any> = {
          vehicleId: vehicleId,
          ownerId: ownerId,
          ownerName: owner.name,
          make: vehicle.make,
          model: vehicle.model,
          registrationNumber: vehicle.registration_number,
          type: vehicle.type,
          color: vehicle.color || 'Pearl White',
          parkingLocation: vehicle.parking_location || 'Assigned Bay',
          preferredWashTime: effectiveNeedBefore,
          needWashBefore: effectiveNeedBefore,
          need_wash_before: effectiveNeedBefore,
          societyId: vehicle.society_id || resolvedSocietyId,
          societyName: vehicle.society_name || resolvedSocietyName,
          flat: resolvedFlat,
          flatNumber: resolvedFlatNumber,
          adminId: (vehicle as any).adminId || (vehicle as any).admin_id || resolvedAdminId,
          assignedAdminId: (vehicle as any).assignedAdminId || (vehicle as any).assigned_admin_id || resolvedAdminId,
          washerId: vehicle.assigned_washer_id || resolvedWasherId,
          washerName: vehicle.assigned_washer_name || resolvedWasherName,
          signupDate: (vehicle as any).signupDate || (owner as any).signupDate || new Date().toISOString().split('T')[0],
          serviceStartDate: (vehicle as any).serviceStartDate || (owner as any).serviceStartDate || vSubStartDate.split('T')[0],
          washerLeaveDay: (vehicle as any).washerLeaveDay || (vehicle as any).washerWeeklyLeaveDay || (owner as any).washerLeaveDay || null,
          washerWeeklyLeaveDay: (vehicle as any).washerLeaveDay || (vehicle as any).washerWeeklyLeaveDay || (owner as any).washerLeaveDay || null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          // Legacy field names for compatibility
          id: vehicleId,
          owner_id: ownerId,
          owner_name: owner.name,
          registration_number: vehicle.registration_number,
          parking_location: vehicle.parking_location || 'Assigned Bay',
          preferred_wash_time: effectiveNeedBefore,
          society_name: vehicle.society_name || resolvedSocietyName || '',
          assigned_washer_id: vehicle.assigned_washer_id || resolvedWasherId,
          assigned_washer_name: vehicle.assigned_washer_name || resolvedWasherName,
          washer_leave_day: (vehicle as any).washerLeaveDay || (owner as any).washerLeaveDay || null,
        };

        // Only include subscription details if explicitly provided
        if (vehicle.selected_plan || (vehicle as any).selectedPlan || (vehicle as any).subscription || (owner as any).subscription) {
          vehiclePayload.price = vehiclePrice;
          vehiclePayload.subscriptionPrice = vehiclePrice;
          vehiclePayload.subscriptionStartDate = vSubStartDate;
          vehiclePayload.selected_plan = vehiclePlan;
          vehiclePayload.subscription = {
            planId: vehiclePlan,
            price: vehiclePrice,
            billingCycle: 'monthly',
            startDate: vSubStartDate,
            endDate: vSubEndDate,
            washesIncluded: 26,
            washesUsed: vehicle.washes_this_month || 0,
            carryForwardEarned: 0,
            carryForwardUsed: 0,
          };
        }
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
      passwordSet: Boolean(washer.passwordSet || false),
      hasPassword: Boolean(washer.passwordSet || false),
      createdBy: createdBy,
      society: washer.society || societiesList.join(', '),
      societies: societiesList,
      state: washer.state || null,
      city: washer.city || null,
      district: washer.district || null,
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

    let remoteSynced = false;

    // 1. Primary: Washers/{washer.id}
    try {
      const washerRef = doc(db, 'Washers', washer.id);
      await setDoc(washerRef, washerPayload, { merge: true });
      remoteSynced = true;
    } catch (err: any) {
      console.warn(
        'Notice: Washers collection write requires deployed firestore.rules. Cached locally.',
        err?.message || err
      );
    }



    // 3. Public sanitized discovery document specifically for /auth/signup discovery: washer_directory/{washerId}
    try {
      const isDismissed = washer.status === 'Dismissed' || (washer.status as any) === 'inactive';
      const directoryPayload = {
        washerId: washer.id,
        id: washer.id,
        name: washer.name,
        phone: phoneWithCountry,
        phone_raw: phoneRaw,
        email: washer.email ? washer.email.toLowerCase().trim() : null,
        photoURL: washer.avatar || '/images/washer_amit.jpg',
        avatar: washer.avatar || '/images/washer_amit.jpg',
        societies: societiesList,
        society: washer.society || societiesList.join(', '),
        state: washer.state || null,
        city: washer.city || null,
        district: washer.district || null,
        passwordSet: Boolean(washer.passwordSet || false),
        hasPassword: Boolean(washer.passwordSet || false),
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
    } catch (e) {
      // ignore
    }

    return { success: true };
  } catch (error: any) {
    console.warn('Firebase syncWasherToFirestore handled warning:', error?.message || error);
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
 * Permanently deletes a washer partner from Firestore:
 * - Deletes Washers/{washerId}
 * - Deletes washer_directory/{washerId}
 */
export async function deleteWasherInFirestore(
  washerId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanId = washerId.trim();
    if (!cleanId) return { success: false, error: 'Invalid washer ID' };

    // 1. Delete from Washers
    try {
      await deleteDoc(doc(db, 'Washers', cleanId));
    } catch (e: any) {
      console.warn('Delete from Washers notice:', e?.message || e);
    }

    // 2. Delete from washer_directory
    try {
      await deleteDoc(doc(db, 'washer_directory', cleanId));
    } catch (e: any) {
      console.warn('Delete from washer_directory notice:', e?.message || e);
    }

    return { success: true };
  } catch (error: any) {
    console.error('deleteWasherInFirestore error:', error);
    return { success: false, error: error?.message || 'Failed to delete washer' };
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

    const formatWasherDoc = (id: string, data: any): WasherPartner => {
      const pwdSet = data.passwordSet === true || (data.passwordSet === undefined && Boolean(data.firebaseUid || data.authUid));
      return {
        id,
        ...data,
        passwordSet: pwdSet,
        hasPassword: pwdSet,
      } as WasherPartner;
    };

    // 1. Direct phone query on Washers
    try {
      const q = query(washersRef, where('phone', '==', phone));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        return formatWasherDoc(docSnap.id, docSnap.data());
      }
    } catch (e: any) {
      console.warn('findWasherByPhone query 1 warning:', e?.message || e);
    }

    if (last10) {
      const variants = [`+91 ${last10}`, `+91${last10}`, last10];
      for (const variant of variants) {
        try {
          const qVar = query(washersRef, where('phone', '==', variant));
          const snapVar = await getDocs(qVar);
          if (!snapVar.empty) {
            const docSnap = snapVar.docs[0];
            return formatWasherDoc(docSnap.id, docSnap.data());
          }
        } catch (e) {}
      }

      try {
        const qRaw = query(washersRef, where('phone_raw', '==', last10));
        const snapRaw = await getDocs(qRaw);
        if (!snapRaw.empty) {
          const docSnap = snapRaw.docs[0];
          return formatWasherDoc(docSnap.id, docSnap.data());
        }
      } catch (e) {}
    }

    // 2. Fallback: check washer_directory
    try {
      const dirRef = collection(db, 'washer_directory');
      const dirSnap = await getDocs(dirRef);
      for (const d of dirSnap.docs) {
        const data = d.data();
        const dPhone = (data.phone || data.phone_raw || '').replace(/\D/g, '');
        if (last10 && dPhone.endsWith(last10)) {
          const washerId = d.id || data.washerId || data.id;
          try {
            const fullDoc = await getDoc(doc(db, 'Washers', washerId));
            if (fullDoc.exists()) {
              return formatWasherDoc(fullDoc.id, fullDoc.data());
            }
          } catch (err) {}

          const pwdSet = data.passwordSet === true || (data.passwordSet === undefined && Boolean(data.firebaseUid || data.authUid));
          return {
            id: washerId,
            name: data.name || 'Washer Partner',
            phone: data.phone || phone,
            email: data.email || null,
            society: data.society || (Array.isArray(data.societies) ? data.societies.join(', ') : ''),
            societies: Array.isArray(data.societies) ? data.societies : [],
            status: data.status || 'Active on Route',
            rating: data.rating || '5.0',
            reviewsCount: data.reviewsCount || 1,
            routeWindow: data.routeWindow || '06:30 AM - 09:30 AM',
            completionRate: data.completionRate || '100%',
            avatar: data.avatar || data.photoURL || '/images/washer_amit.jpg',
            passwordSet: pwdSet,
            hasPassword: pwdSet,
          } as WasherPartner;
        }
      }
    } catch (e: any) {
      console.warn('findWasherByPhone directory fallback warning:', e?.message || e);
    }

    // 3. Fallback: collection scan of Washers
    try {
      const allWashers = await getDocs(washersRef);
      for (const d of allWashers.docs) {
        const data = d.data();
        const dPhone = (data.phone || data.phone_raw || '').replace(/\D/g, '');
        if (last10 && dPhone.endsWith(last10)) {
          return formatWasherDoc(d.id, data);
        }
      }
    } catch (e: any) {
      console.warn('findWasherByPhone full scan warning:', e?.message || e);
    }

    return null;
  } catch (error: any) {
    console.warn('Firebase findWasherByPhoneInFirestore notice:', error?.message || error);
    return null;
  }
}

/**
 * Finds an onboarded WasherPartner by email address in Firestore.
 * Performs multi-layer resolution across Washers collection and washer_directory.
 */
export async function findWasherByEmailInFirestore(email: string): Promise<WasherPartner | null> {
  try {
    const rawEmail = (email || '').trim();
    const cleanEmail = rawEmail.toLowerCase();
    if (!cleanEmail) return null;

    const washersRef = collection(db, 'Washers');

    // 1. Direct query in Washers collection by lowercase email
    try {
      const q = query(washersRef, where('email', '==', cleanEmail));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docData = snap.docs[0].data();
        const pwdSet = docData.passwordSet === true || (docData.passwordSet === undefined && Boolean(docData.firebaseUid || docData.authUid));
        return {
          id: snap.docs[0].id,
          ...docData,
          passwordSet: pwdSet,
          hasPassword: pwdSet,
        } as WasherPartner;
      }
    } catch (e: any) {
      console.warn('findWasherByEmail query 1 warning:', e?.message || e);
    }

    // 2. Direct query with raw email casing
    if (rawEmail !== cleanEmail) {
      try {
        const qRaw = query(washersRef, where('email', '==', rawEmail));
        const snapRaw = await getDocs(qRaw);
        if (!snapRaw.empty) {
          const docData = snapRaw.docs[0].data();
          const pwdSet = docData.passwordSet === true || (docData.passwordSet === undefined && Boolean(docData.firebaseUid || docData.authUid));
          return {
            id: snapRaw.docs[0].id,
            ...docData,
            passwordSet: pwdSet,
            hasPassword: pwdSet,
          } as WasherPartner;
        }
      } catch (e: any) {
        console.warn('findWasherByEmail query 2 warning:', e?.message || e);
      }
    }

    // 3. Query public-readable washer_directory collection
    try {
      const dirRef = collection(db, 'washer_directory');
      const qDir = query(dirRef, where('email', '==', cleanEmail));
      const snapDir = await getDocs(qDir);
      if (!snapDir.empty) {
        const dirData = snapDir.docs[0].data();
        const washerId = snapDir.docs[0].id || dirData.washerId || dirData.id;

        // Attempt to fetch full operational record from Washers
        if (washerId) {
          try {
            const fullDoc = await getDoc(doc(db, 'Washers', washerId));
            if (fullDoc.exists()) {
              const fullData = fullDoc.data();
              const pwdSet = fullData.passwordSet === true || (fullData.passwordSet === undefined && Boolean(fullData.firebaseUid || fullData.authUid));
              return {
                id: fullDoc.id,
                ...fullData,
                passwordSet: pwdSet,
                hasPassword: pwdSet,
              } as WasherPartner;
            }
          } catch (e) {}
        }

        const pwdSet = dirData.passwordSet === true || (dirData.passwordSet === undefined && Boolean(dirData.firebaseUid || dirData.authUid));
        // Return synthesized WasherPartner from washer_directory
        return {
          id: washerId,
          name: dirData.name || 'Washer Partner',
          phone: dirData.phone || '',
          email: dirData.email || cleanEmail,
          society: dirData.society || (Array.isArray(dirData.societies) ? dirData.societies.join(', ') : ''),
          societies: Array.isArray(dirData.societies) ? dirData.societies : [],
          status: dirData.status || 'Active on Route',
          rating: dirData.rating || '5.0',
          reviewsCount: dirData.reviewsCount || 1,
          routeWindow: dirData.routeWindow || '06:30 AM - 09:30 AM',
          completionRate: dirData.completionRate || '100%',
          avatar: dirData.avatar || dirData.photoURL || '/images/washer_amit.jpg',
          passwordSet: pwdSet,
          hasPassword: pwdSet,
        } as WasherPartner;
      }
    } catch (e: any) {
      console.warn('findWasherByEmail directory warning:', e?.message || e);
    }

    // 4. Fallback: collection scan of Washers (in case of whitespace, index lag or casing)
    try {
      const allWashers = await getDocs(washersRef);
      for (const d of allWashers.docs) {
        const data = d.data();
        const docEmail = (data.email || '').toString().toLowerCase().trim();
        if (docEmail === cleanEmail) {
          const pwdSet = data.passwordSet === true || (data.passwordSet === undefined && Boolean(data.firebaseUid || data.authUid));
          return {
            id: d.id,
            ...data,
            passwordSet: pwdSet,
            hasPassword: pwdSet,
          } as WasherPartner;
        }
      }
    } catch (e: any) {
      console.warn('findWasherByEmail scan 1 warning:', e?.message || e);
    }

    // 5. Fallback: collection scan of washer_directory
    try {
      const allDir = await getDocs(collection(db, 'washer_directory'));
      for (const d of allDir.docs) {
        const data = d.data();
        const docEmail = (data.email || '').toString().toLowerCase().trim();
        if (docEmail === cleanEmail) {
          const washerId = d.id || data.washerId || data.id;
          try {
            const fullDoc = await getDoc(doc(db, 'Washers', washerId));
            if (fullDoc.exists()) {
              const fullData = fullDoc.data();
              const pwdSet = fullData.passwordSet === true || (fullData.passwordSet === undefined && Boolean(fullData.firebaseUid || fullData.authUid));
              return {
                id: fullDoc.id,
                ...fullData,
                passwordSet: pwdSet,
                hasPassword: pwdSet,
              } as WasherPartner;
            }
          } catch (err) {}

          const pwdSet = data.passwordSet === true || (data.passwordSet === undefined && Boolean(data.firebaseUid || data.authUid));
          return {
            id: washerId,
            name: data.name || 'Washer Partner',
            phone: data.phone || '',
            email: data.email || cleanEmail,
            society: data.society || (Array.isArray(data.societies) ? data.societies.join(', ') : ''),
            societies: Array.isArray(data.societies) ? data.societies : [],
            status: data.status || 'Active on Route',
            rating: data.rating || '5.0',
            reviewsCount: data.reviewsCount || 1,
            routeWindow: data.routeWindow || '06:30 AM - 09:30 AM',
            completionRate: data.completionRate || '100%',
            avatar: data.avatar || data.photoURL || '/images/washer_amit.jpg',
            passwordSet: pwdSet,
            hasPassword: pwdSet,
          } as WasherPartner;
        }
      }
    } catch (e: any) {
      console.warn('findWasherByEmail scan 2 warning:', e?.message || e);
    }

    return null;
  } catch (error: any) {
    console.warn('Firebase findWasherByEmailInFirestore notice:', error?.message || error);
    return null;
  }
}

/**
 * Updates a Washer Partner's record with `passwordSet: true` after they create their password
 * in Firebase Authentication. Strictly never stores plaintext passwords in Firestore.
 */
export async function markWasherPasswordSetInFirestore(
  washerId: string,
  firebaseAuthUid?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { deleteField } = await import('firebase/firestore');

    const updatePayload: Record<string, any> = {
      passwordSet: true,
      hasPassword: true,
      updatedAt: serverTimestamp(),
      updated_at: serverTimestamp(),
      password: deleteField(),
    };
    if (firebaseAuthUid) {
      updatePayload.firebaseUid = firebaseAuthUid;
      updatePayload.authUid = firebaseAuthUid;
    }

    // 1. Update Washers operational record
    try {
      const washerRef = doc(db, 'Washers', washerId);
      await setDoc(washerRef, updatePayload, { merge: true });
    } catch (wErr: any) {
      console.warn('markWasherPasswordSet Washers notice:', wErr?.message || wErr);
    }

    // 2. Update washer_directory record
    try {
      const dirRef = doc(db, 'washer_directory', washerId);
      await setDoc(
        dirRef,
        {
          passwordSet: true,
          hasPassword: true,
          updatedAt: serverTimestamp(),
          password: deleteField(),
        },
        { merge: true }
      );
    } catch (dirErr: any) {
      console.warn('markWasherPasswordSet washer_directory notice:', dirErr?.message || dirErr);
    }

    return { success: true };
  } catch (err: any) {
    console.error('markWasherPasswordSetInFirestore error:', err);
    return { success: false, error: err?.message || 'Failed to update password flag' };
  }
}

/**
 * Saves or updates a Washer Partner's secret password flag in Firestore.
 */
export async function setWasherPasswordInFirestore(
  phoneOrIdOrEmail: string,
  newPassword: string
): Promise<{ success: boolean; washerId?: string; washerName?: string; error?: string }> {
  try {
    const rawInput = phoneOrIdOrEmail.trim();
    let targetDocId: string | null = null;
    let existingData: any = null;

    // 1. Direct doc ID check
    if (!rawInput.includes('@') && !rawInput.startsWith('+') && rawInput.replace(/\D/g, '').length !== 10) {
      try {
        const docRef = doc(db, 'Washers', rawInput);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          targetDocId = docSnap.id;
          existingData = docSnap.data();
        }
      } catch (e) {}

      if (!targetDocId) {
        try {
          const dirRef = doc(db, 'washer_directory', rawInput);
          const dirSnap = await getDoc(dirRef);
          if (dirSnap.exists()) {
            targetDocId = dirSnap.id;
            existingData = dirSnap.data();
          }
        } catch (e) {}
      }
    }

    // 2. Email lookup
    if (!targetDocId && rawInput.includes('@')) {
      const washer = await findWasherByEmailInFirestore(rawInput);
      if (washer?.id) {
        targetDocId = washer.id;
        existingData = washer;
      }
    }

    // 3. Phone lookup
    if (!targetDocId) {
      const washer = await findWasherByPhoneInFirestore(rawInput);
      if (washer?.id) {
        targetDocId = washer.id;
        existingData = washer;
      }
    }

    if (!targetDocId) {
      return { success: false, error: 'Washer partner record not found in database.' };
    }

    // 4. Save to Washers collection
    try {
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
    } catch (wErr: any) {
      console.warn('Saving password to Washers warning:', wErr?.message || wErr);
    }

    // 5. Also sync password state to washer_directory
    try {
      const dirRef = doc(db, 'washer_directory', targetDocId);
      await setDoc(
        dirRef,
        {
          password: newPassword,
          hasPassword: true,
          has_password: true,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (dirErr: any) {
      console.warn('Saving password to washer_directory notice:', dirErr?.message || dirErr);
    }

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
        const pwdSet = data.passwordSet === true || (data.passwordSet === undefined && Boolean(data.firebaseUid || data.authUid));
        return {
          id: washerDocSnap.id,
          ...data,
          name: data.name || 'Washer Partner',
          passwordSet: pwdSet,
          hasPassword: pwdSet,
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
      const pwdSet = data.passwordSet === true || (data.passwordSet === undefined && Boolean(data.firebaseUid || data.authUid));
      return {
        id: docSnap.id,
        ...data,
        name: data.name || 'Washer Partner',
        passwordSet: pwdSet,
        hasPassword: pwdSet,
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
  isCoveredByBackup?: boolean;
  backupCoverageDetails?: {
    backupWasherName?: string;
    backupWasherId?: string;
    dates?: string;
    reason?: string;
  };
  isCoveringBackup?: boolean;
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

        // Check if assigned to this washer (including backup active assignments)
        let isAssigned = false;
        let isBackupCovering = false;
        let isCoveredForMe = false;

        if (vData.isBackupActive) {
          if (
            vData.backupWasherId === assignedWasherId ||
            vData.activeWasherId === assignedWasherId ||
            (assignedWasherName && vData.backupWasherName?.toLowerCase() === assignedWasherName.toLowerCase())
          ) {
            // This washer IS the active backup washer covering this vehicle
            isAssigned = true;
            isBackupCovering = true;
          } else if (
            vData.primaryWasherId === assignedWasherId ||
            (assignedWasherName && vData.primaryWasherName?.toLowerCase() === assignedWasherName.toLowerCase())
          ) {
            // This washer IS the primary washer who is on leave/covered
            isAssigned = true;
            isCoveredForMe = true;
          }
        } else {
          isAssigned = Boolean(
            vData.activeWasherId === assignedWasherId ||
            vData.washerId === assignedWasherId ||
            vData.assigned_washer_id === assignedWasherId ||
            (assignedWasherName && vData.washerName?.toLowerCase() === assignedWasherName.toLowerCase()) ||
            (assignedWasherName && vData.assigned_washer_name?.toLowerCase() === assignedWasherName.toLowerCase()) ||
            oData.assignedWasherId === assignedWasherId ||
            (assignedWasherName && oData.assignedWasherName?.toLowerCase() === assignedWasherName.toLowerCase())
          );
        }

        if (isAssigned) {
          const today = getTodayISTDate();

          // Requirement 3: If an Owner subscribes today, his wash will be effective from the next day onwards.
          const subStartDateStr = vData.subscription?.startDate || vData.subscriptionStartDate;
          if (subStartDateStr) {
            try {
              const subStart = new Date(subStartDateStr);
              const subStartIST = getTodayISTDate(subStart);
              if (subStartIST.dateIso > today.dateIso) {
                // Subscription starts tomorrow or later — do NOT include in today's active morning route!
                continue;
              }
            } catch (dErr) {
              // fallback
            }
          }

          // Fetch wash record for this vehicle (check both Washes and current Month)
          let washRecord: any = null;

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

          const status = isCompletedToday
            ? 'completed'
            : isCoveredForMe
            ? 'covered_by_backup'
            : 'pending';

          const proofPhoto = isCompletedToday ? (washRecord?.proof?.photoUrl || washRecord?.after_photo) : undefined;
          const payoutAmount = getWasherPayoutPerWash(vData);

          const needBefore = vData.needWashBefore || vData.need_wash_before || vData.preferredWashTime || vData.preferred_wash_time || '8:00 AM';

          const exactCapturedAt = isCompletedToday
            ? (washRecord?.proof?.capturedAt ||
               washRecord?.captured_at ||
               washRecord?.completedAt ||
               washRecord?.completed_at ||
               (washRecord?.createdAt?.toDate ? washRecord.createdAt.toDate().toISOString() : washRecord?.createdAt) ||
               undefined)
            : undefined;

          const exactCompletedAt = isCompletedToday
            ? (washRecord?.completedAt ||
               washRecord?.completed_at ||
               exactCapturedAt ||
               undefined)
            : undefined;

          stops.push({
            stop_number: stops.length + 1,
            wash_id: isCompletedToday ? (washRecord?.id || `wash_${vId}_${today.dateIso}`) : `wash_${vId}_${today.dateIso}`,
            vehicle_id: vId,
            vehicle_name: `${vData.make || ''} ${vData.model || ''}`.trim() || 'Assigned Vehicle',
            registration_number: vData.registrationNumber || vData.registration_number || '',
            parking_location: vData.parkingLocation || vData.parking_location || 'Assigned Bay',
            scheduled_time: `Before ${needBefore}`,
            needWashBefore: needBefore,
            need_wash_before: needBefore,
            status: status as any,
            owner_name: vData.ownerName || vData.owner_name || ownerName,
            owner_phone: ownerPhone,
            owner_id: ownerId,
            payout_amount: payoutAmount,
            society_name: vData.societyName || vData.society_name || washer?.society || 'Green Valley Residency',
            proof_photo: proofPhoto,
            washer_id: assignedWasherId,
            washer_name: assignedWasherName,
            is_backup_covered: Boolean(vData.isBackupActive && isBackupCovering),
            backup_washer_name: vData.backupWasherName,
            original_washer_name: vData.primaryWasherName,
            original_washer_id: vData.primaryWasherId,
            is_covered_for_me: Boolean(vData.isBackupActive && isCoveredForMe),
            covered_by_washer_name: vData.backupWasherName,
            completed_at: exactCompletedAt,
            captured_at: exactCapturedAt,
          });
        }
      }
    }
  } catch (err) {
    console.warn('Error fetching washer vehicles from Firestore:', err);
  }

  // 3. Compute metrics: if the backup washer has washed, target for current washer is reduced
  const backupWashedCount = stops.filter((s) => s.is_covered_for_me && (s.status === 'completed' || s.status === 'vehicle_unavailable')).length;
  const targetQuota = Math.max(0, stops.length - backupWashedCount);
  const completedCount = stops.filter((s) => s.status === 'completed' && !s.is_covered_for_me).length;
  const unavailableCount = stops.filter((s) => s.status === 'vehicle_unavailable' && !s.is_covered_for_me).length;
  const pendingCount = Math.max(0, targetQuota - completedCount - unavailableCount);
  const progressPercent = targetQuota > 0 ? Math.min(100, Math.round((completedCount / targetQuota) * 100)) : 0;
  const actionableStops = stops.filter((s) => !s.is_covered_for_me);
  const earnedSoFar = actionableStops
    .filter((s) => s.status === 'completed' || s.status === 'vehicle_unavailable')
    .reduce((sum, s) => sum + (s.payout_amount || 12), 0);
  const totalExpectedPayout = actionableStops.reduce((sum, s) => sum + (s.payout_amount || 12), 0);

  // 4. Compute live earnings
  const availableEarnings = Number(washer?.availableBalance ?? washer?.availableEarnings ?? earnedSoFar);
  const weeklyEarnings = Number(washer?.weeklyEarnings ?? (availableEarnings || earnedSoFar));

  const hasCoveredStops = stops.some((s) => s.is_covered_for_me);
  const isCovered = Boolean(washer?.isCoveredByBackup || hasCoveredStops);
  const coveredStop = stops.find((s) => s.is_covered_for_me);
  const backupCoverageDetails = isCovered ? {
    backupWasherName: washer?.backupWasherName || coveredStop?.covered_by_washer_name || 'Backup Partner',
    backupWasherId: washer?.backupWasherId,
    dates: washer?.currentSubstitutionStartDate
      ? `${washer.currentSubstitutionStartDate} → ${washer.currentSubstitutionEndDate || 'Tomorrow'}`
      : 'Active Coverage',
    reason: washer?.leaveReason || 'Leave / Unavailable',
  } : undefined;

  return {
    washer,
    routeStops: stops,
    earnings: {
      available: availableEarnings,
      this_week: weeklyEarnings,
      total_earnings: weeklyEarnings,
      pending: Number(washer?.pendingPayoutDue || 0),
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
    isCoveredByBackup: isCovered,
    backupCoverageDetails,
    isCoveringBackup: Boolean(washer?.isCoveringBackup || stops.some((s) => s.is_backup_covered)),
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
        is_backup_covered: Boolean(wash.is_backup_covered),
        backup_washer_name: wash.backup_washer_name || (wash.is_backup_covered ? (wash.washer_name || null) : null),
        original_washer_name: wash.original_washer_name || null,
        original_washer_id: wash.original_washer_id || null,
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

      // 4. Update the active washer's completed count
      if (wash.washer_id) {
        try {
          const washerRef = doc(db, 'Washers', wash.washer_id);
          const washerSnap = await getDoc(washerRef);
          if (washerSnap.exists()) {
            const wData = washerSnap.data();
            const curCompleted = Number(wData.completedToday ?? 0);
            await setDoc(
              washerRef,
              {
                completedToday: curCompleted + 1,
                updated_at: serverTimestamp(),
              },
              { merge: true }
            );
          }
        } catch (wErr) {
          // non-critical
        }
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
  userId?: string,
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
        assigned_washer_id: carOwnerDocData.assignedWasherId || carOwnerDocData.assigned_washer_id || '',
        assigned_washer_name: carOwnerDocData.assignedWasherName || carOwnerDocData.assigned_washer_name || '',
        address: carOwnerDocData.address,
        alt_phone: carOwnerDocData.altPhone || carOwnerDocData.alt_phone,
        price: ownerPrice,
        subscription_price: ownerPrice,
        needWashBefore: carOwnerDocData.needWashBefore || carOwnerDocData.need_wash_before || '8:00 AM',
        need_wash_before: carOwnerDocData.needWashBefore || carOwnerDocData.need_wash_before || '8:00 AM',
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

          const effectiveNeedBefore =
            vData.needWashBefore ||
            vData.need_wash_before ||
            vData.preferredWashTime ||
            vData.preferred_wash_time ||
            result.user.needWashBefore ||
            '8:00 AM';

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
            preferred_wash_time: effectiveNeedBefore,
            needWashBefore: effectiveNeedBefore,
            need_wash_before: effectiveNeedBefore,
            subscriptionStartDate: vData.subscription?.startDate || vData.subscriptionStartDate,
            society_id: vData.societyId || vData.society_id || result.user.societyId || '',
            society_name: vData.societyName || vData.society_name || result.user.societyName || result.user.society || '',
            subscription_status: 'active',
            washes_this_month: sub.washesUsed ?? vData.washes_this_month ?? 0,
            selected_plan: sub.planId || vData.selected_plan || result.user.selected_plan || 'HOME BASIC',
            assigned_washer_id: vData.isBackupActive
              ? (vData.backupWasherId || vData.activeWasherId || vData.assigned_washer_id || '')
              : (vData.activeWasherId || vData.washerId || vData.assigned_washer_id || result.user.assigned_washer_id || ''),
            assigned_washer_name: vData.isBackupActive
              ? (vData.backupWasherName || vData.activeWasherName || vData.assigned_washer_name || '')
              : (vData.activeWasherName || vData.washerName || vData.assigned_washer_name || result.user.assigned_washer_name || ''),
            price: vPrice,
            subscription_price: vPrice,
            primaryWasherId: vData.primaryWasherId,
            primaryWasherName: vData.primaryWasherName,
            activeWasherId: vData.activeWasherId,
            activeWasherName: vData.activeWasherName,
            isBackupActive: Boolean(vData.isBackupActive),
            backupWasherId: vData.backupWasherId,
            backupWasherName: vData.backupWasherName,
            backupStartDate: vData.backupStartDate,
            backupEndDate: vData.backupEndDate,
            backupReason: vData.backupReason,
            backupInitiatedBy: vData.backupInitiatedBy,
            backupAssignedAt: vData.backupAssignedAt,
          };

          if (vData.isBackupActive) {
            result.user.assigned_washer_id = vData.backupWasherId || vData.activeWasherId || result.user.assigned_washer_id;
            result.user.assigned_washer_name = vData.backupWasherName || vData.activeWasherName || result.user.assigned_washer_name;
          }

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
                '';

              const washPhotoUrl = proof.photoUrl || wData.photoUrl || (wData.status === 'completed' ? '/images/honda_city_after.jpg' : null);
              const schedDate =
                wData.scheduled_date ||
                wData.scheduledDate ||
                wData.date ||
                (wDocId && wDocId.startsWith('202') ? wDocId : null) ||
                (wData.day ? `${wData.year || currentIst.year}-${String(wData.monthNum || currentIst.monthNum).padStart(2, '0')}-${String(wData.day).padStart(2, '0')}` : 'Today');
              const washUniqueKey = wData.washId || (wDocId && wDocId.startsWith('wash_') ? wDocId : `wash_${vId}_${schedDate}`);

              const rawOwnerFeedback =
                wData.ownerFeedback ||
                wData.answer ||
                (wData.flaggedOrange || wData.flaggedNotCleaned || wData.status === 'missed'
                  ? 'no'
                  : wData.ownerFeedback === 'yes' || wData.isCleaned
                  ? 'yes'
                  : undefined);

              const resolvedStatus =
                rawOwnerFeedback === 'no'
                  ? 'missed'
                  : (wData.status as any) ||
                    (wData.isCleaned ? 'completed' : 'completed');

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
                status: resolvedStatus,
                scheduled_date: schedDate,
                scheduled_time: vehicleObj.preferred_wash_time,
                completed_at: wData.completedAt || null,
                location_verified: true,
                after_photo: washPhotoUrl,
                captured_at: proof.capturedAt || null,
                created_at: wData.createdAt?.toDate ? wData.createdAt.toDate().toISOString() : (typeof wData.createdAt === 'string' ? wData.createdAt : null),
                is_sunday_priority: false,
                is_backup_covered: false,
                ownerFeedback: rawOwnerFeedback,
                flaggedNotCleaned: rawOwnerFeedback === 'no' || !!wData.flaggedNotCleaned || !!wData.flaggedOrange,
                notes: wData.notes || (rawOwnerFeedback === 'no' ? 'Owner flagged: Car not cleaned today by washer (Orange)' : undefined),
              };

              washMap.set(schedDate, record);
              if (record.status === 'completed' && record.ownerFeedback !== 'no' && !record.flaggedNotCleaned) {
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

    // 4. Fetch Assigned / Location-Matched Washer Partner from Washers collection
    try {
      const allWashers = await fetchAllWashersFromFirestore();

      // Priority 1: Check if any onboarded Washer has the SAME State, City, District, and Societies as the Car Owner!
      let matchedWasher: WasherPartner | null = null;
      if (result.user) {
        matchedWasher = allWashers.find((w) => isWasherMatchForOwner(w, result.user!)) || null;
      }

      if (!matchedWasher && result.vehicles && result.vehicles.length > 0) {
        for (const veh of result.vehicles) {
          const vehLocation = {
            state: result.user?.state,
            city: result.user?.city,
            district: result.user?.district,
            society: veh.society_name || result.user?.society,
            societyName: veh.society_name || result.user?.societyName,
          };
          matchedWasher = allWashers.find((w) => isWasherMatchForOwner(w, vehLocation)) || null;
          if (matchedWasher) break;
        }
      }

      // Priority 2: Fallback to explicitly assigned washer ID or washer Name
      if (!matchedWasher) {
        const washerId =
          result.user?.assigned_washer_id ||
          result.vehicles[0]?.assigned_washer_id;
        const washerName =
          result.user?.assigned_washer_name ||
          result.vehicles[0]?.assigned_washer_name;

        if (washerId || washerName) {
          matchedWasher = allWashers.find(
            (w) =>
              (washerId && (w.id === washerId || (w as any).uid === washerId)) ||
              (washerName && w.name && w.name.toLowerCase().trim() === washerName.toLowerCase().trim())
          ) || null;

          if (!matchedWasher && washerId) {
            const washerDocRef = doc(db, 'Washers', washerId);
            const washerDocSnap = await getDoc(washerDocRef);
            if (washerDocSnap.exists()) {
              const d = washerDocSnap.data();
              matchedWasher = {
                id: washerDocSnap.id,
                ...d,
                state: d.state || '',
                city: d.city || '',
                district: d.district || '',
              } as WasherPartner;
            }
          }
        }
      }

      if (matchedWasher) {
        result.assignedWasher = matchedWasher;
        result.source = 'firebase_live';
        if (result.user) {
          result.user.assigned_washer_id = matchedWasher.id;
          result.user.assigned_washer_name = matchedWasher.name;
          result.user.selectedWasherId = matchedWasher.id;
          result.user.selectedWasherName = matchedWasher.name;
        }
        if (result.vehicles && result.vehicles.length > 0) {
          result.vehicles.forEach((v) => {
            if (!v.assigned_washer_name || v.assigned_washer_name === 'Unassigned') {
              v.assigned_washer_id = matchedWasher!.id;
              v.assigned_washer_name = matchedWasher!.name;
            }
          });
        }
      }
    } catch (wErr) {
      console.warn('Firebase assigned washer lookup notice:', wErr);
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
      // Skip hardcoded mock partner wsh_amit
      if (id === 'wsh_amit') {
        return;
      }
      if (!washersMap.has(docSnap.id)) {
        const parsedSocieties: string[] =
          data.societies && Array.isArray(data.societies) && data.societies.length > 0
            ? data.societies
            : typeof data.society === 'string' && data.society.trim()
            ? data.society.split(',').map((s: string) => s.trim()).filter(Boolean)
            : [];

        const pwdSet = data.passwordSet === true || (data.passwordSet === undefined && Boolean(data.firebaseUid || data.authUid));
        washersMap.set(docSnap.id, {
          id: docSnap.id,
          name: data.name || 'Washer Partner',
          phone: data.phone || '',
          email: data.email ? String(data.email).toLowerCase().trim() : undefined,
          passwordSet: pwdSet,
          hasPassword: pwdSet,
          firebaseUid: data.firebaseUid || data.authUid,
          avatar: data.avatar || data.avatar_url || '/images/washer_amit.jpg',
          rating: String(data.rating || '5.0'),
          reviewsCount: Number(data.reviewsCount || data.reviews_count || 0),
          society: data.society || (parsedSocieties.length > 0 ? parsedSocieties.join(', ') : 'Assigned Route'),
          societies: parsedSocieties,
          state: data.state || '',
          city: data.city || '',
          district: data.district || '',
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
          state: data.state || '',
          city: data.city || '',
          district: data.district || '',
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
          state: data.state || '',
          city: data.city || '',
          district: data.district || '',
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
 * Checks if a Washer Partner and a Car Owner match on location criteria:
 * - Washer selects: State, City, District, Societies (array)
 * - Car Owner selects: State, City, District, Society (string)
 * Returns true if State, City, District are equal and Car Owner's Society is common/in Washer's Societies.
 */
export function isWasherMatchForOwner(
  washer: WasherPartner,
  ownerLocation: {
    state?: string;
    city?: string;
    district?: string;
    society?: string;
    societyName?: string;
  }
): boolean {
  if (!washer || !ownerLocation) return false;

  const rawOwnerSociety = (ownerLocation.societyName || ownerLocation.society || '').trim().toLowerCase();
  if (!rawOwnerSociety) return false;

  // Extract clean society name (e.g., "Oberoi Springs" from "Oberoi Springs, Andheri West, Mumbai")
  const ownerSocietyClean = rawOwnerSociety.split(',')[0].trim().toLowerCase();

  // 1. SOCIETY CHECK:
  // Must be common / equal in washer's societies list
  const washerSocieties: string[] =
    Array.isArray(washer.societies) && washer.societies.length > 0
      ? washer.societies
      : typeof washer.society === 'string' && washer.society.trim()
      ? washer.society.split(',').map((s) => s.trim())
      : [];

  const societyMatched = washerSocieties.some((ws) => {
    const cleanWs = (ws || '').trim().toLowerCase();
    const cleanWsName = cleanWs.split(',')[0].trim();
    return (
      cleanWs === rawOwnerSociety ||
      cleanWs === ownerSocietyClean ||
      cleanWsName === ownerSocietyClean ||
      cleanWs.includes(ownerSocietyClean) ||
      ownerSocietyClean.includes(cleanWsName)
    );
  });

  if (!societyMatched) return false;

  // 2. STATE CHECK:
  const ownerState = (ownerLocation.state || '').trim().toLowerCase();
  const washerState = (washer.state || '').trim().toLowerCase();
  if (ownerState && washerState) {
    if (ownerState !== washerState && !ownerState.includes(washerState) && !washerState.includes(ownerState)) {
      return false;
    }
  }

  // 3. CITY CHECK:
  const ownerCity = (ownerLocation.city || '').trim().toLowerCase();
  const washerCity = (washer.city || '').trim().toLowerCase();
  if (ownerCity && washerCity) {
    if (ownerCity !== washerCity && !ownerCity.includes(washerCity) && !washerCity.includes(ownerCity)) {
      return false;
    }
  }

  // 4. DISTRICT CHECK:
  const ownerDistrict = (ownerLocation.district || '').trim().toLowerCase();
  const washerDistrict = (washer.district || '').trim().toLowerCase();
  if (ownerDistrict && washerDistrict) {
    if (ownerDistrict !== washerDistrict && !ownerDistrict.includes(washerDistrict) && !washerDistrict.includes(ownerDistrict)) {
      return false;
    }
  }

  return true;
}

/**
 * Filters a list of washers to find those whose State, City, District,
 * and Societies match the Car Owner's selected location.
 */
export function findMatchingWashersForOwner(
  washers: WasherPartner[],
  ownerLocation: {
    state?: string;
    city?: string;
    district?: string;
    society?: string;
    societyName?: string;
  }
): WasherPartner[] {
  return washers.filter((w) => isWasherMatchForOwner(w, ownerLocation));
}

/**
 * Fetches all washers from Firestore and returns only those that match
 * the Car Owner's State, City, District, and Society.
 */
export async function fetchMatchingWashersForOwner(
  ownerLocation: {
    state?: string;
    city?: string;
    district?: string;
    society?: string;
    societyName?: string;
  }
): Promise<WasherPartner[]> {
  try {
    const allWashers = await fetchAllWashersFromFirestore();
    return findMatchingWashersForOwner(allWashers, ownerLocation);
  } catch (err) {
    console.warn('fetchMatchingWashersForOwner error:', err);
    return [];
  }
}

/**
 * Fetches all registered Car Owner documents from Firestore Car_Owners collection.
 */
export async function fetchCarOwnersFromFirestore(): Promise<any[]> {
  try {
    const ownersSnap = await getDocs(collection(db, 'Car_Owners'));
    const list: any[] = [];
    ownersSnap.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
    return list;
  } catch (err) {
    console.warn('fetchCarOwnersFromFirestore notice:', err);
    return [];
  }
}

export interface WasherDistrictSociety {
  societyName: string;
  washerName: string;
  washerId: string;
  washerRating: string;
  washerAvatar: string;
  washerPhone?: string;
  district: string;
  city: string;
  state: string;
}

/**
 * When a Car Owner selects a District:
 * Returns all common societies serviced by Washers in that district,
 * along with the Washer's name and details so the Car Owner can see them.
 */
export async function fetchDistrictSocietiesForOwner(
  location: { state?: string; city?: string; district?: string }
): Promise<WasherDistrictSociety[]> {
  if (!location.district) return [];
  const cleanDistrict = location.district.trim().toLowerCase();
  const cleanCity = (location.city || '').trim().toLowerCase();
  const cleanState = (location.state || '').trim().toLowerCase();

  try {
    const allWashers = await fetchAllWashersFromFirestore();
    const result: WasherDistrictSociety[] = [];
    const seenSocieties = new Set<string>();

    allWashers.forEach((washer) => {
      const wDist = (washer.district || '').trim().toLowerCase();
      const wCity = (washer.city || '').trim().toLowerCase();
      const wState = (washer.state || '').trim().toLowerCase();

      const distMatch = !wDist || wDist === cleanDistrict || wDist.includes(cleanDistrict) || cleanDistrict.includes(wDist);
      const cityMatch = !cleanCity || !wCity || wCity === cleanCity;
      const stateMatch = !cleanState || !wState || wState === cleanState;

      if (distMatch && cityMatch && stateMatch) {
        const societiesList: string[] =
          Array.isArray(washer.societies) && washer.societies.length > 0
            ? washer.societies
            : typeof washer.society === 'string' && washer.society.trim()
            ? washer.society.split(',').map((s) => s.trim())
            : [];

        societiesList.forEach((soc) => {
          const cleanSoc = soc.trim();
          const socKey = cleanSoc.toLowerCase();
          if (cleanSoc && !seenSocieties.has(socKey)) {
            seenSocieties.add(socKey);
            result.push({
              societyName: cleanSoc,
              washerName: washer.name,
              washerId: washer.id,
              washerRating: String(washer.rating || '5.0'),
              washerAvatar: washer.avatar || '/images/washer_amit.jpg',
              washerPhone: washer.phone,
              district: washer.district || location.district || '',
              city: washer.city || location.city || '',
              state: washer.state || location.state || '',
            });
          }
        });
      }
    });

    return result;
  } catch (err) {
    console.warn('fetchDistrictSocietiesForOwner error:', err);
    return [];
  }
}

export interface OwnerDistrictSociety {
  societyName: string;
  ownerCount: number;
  ownerNames: string[];
  district: string;
  city: string;
  state: string;
}

/**
 * When a Washer selects a District:
 * Returns all common societies where Car Owners are registered in that district,
 * along with the Car Owner count and names so the Washer can see them and add them.
 */
export async function fetchDistrictSocietiesForWasher(
  location: { state?: string; city?: string; district?: string }
): Promise<OwnerDistrictSociety[]> {
  if (!location.district) return [];
  const cleanDistrict = location.district.trim().toLowerCase();
  const cleanCity = (location.city || '').trim().toLowerCase();
  const cleanState = (location.state || '').trim().toLowerCase();

  try {
    const allOwners = await fetchCarOwnersFromFirestore();
    const map = new Map<string, { societyName: string; ownerNames: string[] }>();

    allOwners.forEach((owner) => {
      const oDist = (owner.district || '').trim().toLowerCase();
      const oCity = (owner.city || '').trim().toLowerCase();
      const oState = (owner.state || '').trim().toLowerCase();

      const distMatch = !oDist || oDist === cleanDistrict || oDist.includes(cleanDistrict) || cleanDistrict.includes(oDist);
      const cityMatch = !cleanCity || !oCity || oCity === cleanCity;
      const stateMatch = !cleanState || !oState || oState === cleanState;

      if (distMatch && cityMatch && stateMatch) {
        const rawSoc = owner.societyName || (owner.society ? owner.society.split(',')[0].trim() : '');
        if (rawSoc) {
          const socKey = rawSoc.trim().toLowerCase();
          const cleanSocName = rawSoc.trim();
          const ownerName = owner.name || owner.owner_name || 'Car Owner';

          if (!map.has(socKey)) {
            map.set(socKey, {
              societyName: cleanSocName,
              ownerNames: [ownerName],
            });
          } else {
            const entry = map.get(socKey)!;
            if (!entry.ownerNames.includes(ownerName)) {
              entry.ownerNames.push(ownerName);
            }
          }
        }
      }
    });

    // Also check active user in localStorage cache
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('torque_user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed && (parsed.role === 'owner' || !parsed.role)) {
            const uDist = (parsed.district || '').trim().toLowerCase();
            if (uDist === cleanDistrict || cleanDistrict.includes(uDist)) {
              const uSoc = parsed.societyName || (parsed.society ? parsed.society.split(',')[0].trim() : '');
              if (uSoc) {
                const uKey = uSoc.trim().toLowerCase();
                const uName = parsed.name || 'Current Owner';
                if (!map.has(uKey)) {
                  map.set(uKey, { societyName: uSoc.trim(), ownerNames: [uName] });
                }
              }
            }
          }
        }
      } catch {}
    }

    const result: OwnerDistrictSociety[] = [];
    map.forEach((val) => {
      result.push({
        societyName: val.societyName,
        ownerCount: val.ownerNames.length,
        ownerNames: val.ownerNames,
        district: location.district || '',
        city: location.city || '',
        state: location.state || '',
      });
    });

    return result;
  } catch (err) {
    console.warn('fetchDistrictSocietiesForWasher error:', err);
    return [];
  }
}

/**
 * Updates a Car Owner's State, City, District, and Society in Firestore:
 * Updates Car_Owners/{ownerId} and its Vehicles subcollection.
 * Automatically looks up if any verified Washer matches this cluster,
 * and if so, appoints them so the Car Owner immediately sees their name.
 */
export async function updateOwnerLocationInFirestore(
  ownerId: string,
  locationData: {
    state: string;
    city: string;
    district: string;
    society: string;
    societyName?: string;
    flat?: string;
    flatNumber?: string;
  }
): Promise<{ success: boolean; matchedWasher: WasherPartner | null; error?: string }> {
  try {
    const cleanSocietyName = (locationData.societyName || locationData.society.split(',')[0]).trim();
    const fullSocietyString = `${cleanSocietyName}, ${locationData.district}, ${locationData.city}`;

    // 1. Find matching washer from Washers collection
    let matchedWasher: WasherPartner | null = null;
    try {
      const allWashers = await fetchAllWashersFromFirestore();
      matchedWasher = allWashers.find((w) =>
        isWasherMatchForOwner(w, {
          state: locationData.state,
          city: locationData.city,
          district: locationData.district,
          society: fullSocietyString,
          societyName: cleanSocietyName,
        })
      ) || null;
    } catch (wErr) {
      console.warn('Notice looking up matching washer on location update:', wErr);
    }

    const updates: Record<string, any> = {
      state: locationData.state,
      city: locationData.city,
      district: locationData.district,
      society: fullSocietyString,
      societyName: cleanSocietyName,
      address: locationData.flat ? `${locationData.flat}, ${fullSocietyString}` : fullSocietyString,
      flat: locationData.flat || null,
      flatNumber: locationData.flatNumber || locationData.flat || null,
      updatedAt: serverTimestamp(),
    };

    if (matchedWasher) {
      updates.selectedWasherId = matchedWasher.id;
      updates.selectedWasherName = matchedWasher.name;
      updates.assigned_washer_id = matchedWasher.id;
      updates.assigned_washer_name = matchedWasher.name;
      updates.assignedWasherId = matchedWasher.id;
      updates.assignedWasherName = matchedWasher.name;
    }

    const ownerRef = doc(db, 'Car_Owners', ownerId);
    await setDoc(ownerRef, updates, { merge: true });

    // Also update all vehicles for this owner to reflect new society and matched washer
    try {
      const vehiclesSnap = await getDocs(collection(db, 'Car_Owners', ownerId, 'Vehicles'));
      for (const vDoc of vehiclesSnap.docs) {
        const vUpdate: Record<string, any> = {
          society_name: cleanSocietyName,
          society_id: `soc_${cleanSocietyName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
          updatedAt: serverTimestamp(),
        };
        if (matchedWasher) {
          vUpdate.assigned_washer_id = matchedWasher.id;
          vUpdate.assigned_washer_name = matchedWasher.name;
          vUpdate.washerId = matchedWasher.id;
          vUpdate.washerName = matchedWasher.name;
        }
        await setDoc(doc(db, 'Car_Owners', ownerId, 'Vehicles', vDoc.id), vUpdate, { merge: true });
      }
    } catch (vErr) {
      console.warn('Notice updating vehicle society on location update:', vErr);
    }

    return { success: true, matchedWasher };
  } catch (error: any) {
    console.error('updateOwnerLocationInFirestore error:', error);
    return { success: false, matchedWasher: null, error: error?.message || 'Update failed' };
  }
}

/**
 * Updates an owner's phone number in Firestore.
 */
export async function updateOwnerPhoneInFirestore(
  ownerId: string,
  phone: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanPhone = phone.trim();
    const ownerRef = doc(db, 'Car_Owners', ownerId);
    await setDoc(
      ownerRef,
      {
        phone: cleanPhone,
        phoneNumber: cleanPhone,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return { success: true };
  } catch (error: any) {
    console.error('updateOwnerPhoneInFirestore error:', error);
    return { success: false, error: error?.message || 'Failed to update phone' };
  }
}

/**
 * Updates an owner's dedicated washer specialist (name and phone) in Firestore.
 */
export async function updateOwnerWasherInFirestore(
  ownerId: string,
  washerName: string,
  washerPhone: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanName = washerName.trim();
    const cleanPhone = washerPhone.trim();

    // 1. Create / Update record in Washers collection with name and phone number
    const cleanDigits = cleanPhone.replace(/\D/g, '');
    const washerDocId = cleanDigits.length >= 10 ? `+91${cleanDigits.slice(-10)}` : `wsh_${Date.now()}`;
    const washerRecord = {
      id: washerDocId,
      name: cleanName,
      phone: cleanPhone,
      role: 'washer',
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, 'Washers', washerDocId), washerRecord, { merge: true });
      // Also mirror to Washer collection
      await setDoc(doc(db, 'Washer', washerDocId), washerRecord, { merge: true });
    } catch (wErr) {
      console.warn('Notice saving to Washers collection:', wErr);
    }

    // 2. Update owner in Car_Owners collection
    const ownerRef = doc(db, 'Car_Owners', ownerId);
    await setDoc(
      ownerRef,
      {
        assigned_washer_name: cleanName,
        assignedWasherName: cleanName,
        selectedWasherName: cleanName,
        assigned_washer_phone: cleanPhone,
        assignedWasherPhone: cleanPhone,
        selectedWasherPhone: cleanPhone,
        assigned_washer_id: washerDocId,
        assignedWasherId: washerDocId,
        selectedWasherId: washerDocId,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    // 3. Also update all vehicles under this owner
    try {
      const vehiclesSnap = await getDocs(collection(db, 'Car_Owners', ownerId, 'Vehicles'));
      for (const vDoc of vehiclesSnap.docs) {
        await setDoc(
          doc(db, 'Car_Owners', ownerId, 'Vehicles', vDoc.id),
          {
            assigned_washer_name: cleanName,
            washerName: cleanName,
            assigned_washer_phone: cleanPhone,
            assigned_washer_id: washerDocId,
            washerId: washerDocId,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }
    } catch (vErr) {
      console.warn('Notice updating vehicle washer info:', vErr);
    }

    return { success: true };
  } catch (error: any) {
    console.error('updateOwnerWasherInFirestore error:', error);
    return { success: false, error: error?.message || 'Failed to update washer' };
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
  district?: string;
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
        district: data.district || '',
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
        district: data.district || '',
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
  district?: string;
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
    const cleanDistrict = (data.district || '').trim();
    const cleanCity = data.city.trim();
    const cleanName = data.name.trim();

    const societyPayload = {
      societyId,
      name: cleanName,
      district: cleanDistrict,
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
 * Update an existing society (name, district, city, state, or status).
 */
export async function updateSociety(
  societyId: string,
  updates: Partial<{ name: string; district: string; city: string; state: string; status: 'active' | 'inactive' }>
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
        price: d.price || d.subscriptionPrice || 499,
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

/**
 * Fetches other Washer Partners who operate in the same society / societies.
 */
export async function fetchPeerWashersInSameSocieties(
  currentWasherId?: string,
  societiesInput?: string[] | string
): Promise<WasherPartner[]> {
  try {
    const allWashers = await fetchAllWashersFromFirestore();

    const normalizedMySocieties: string[] = [];
    if (Array.isArray(societiesInput)) {
      societiesInput.forEach((s) => {
        if (s && typeof s === 'string') {
          normalizedMySocieties.push(s.toLowerCase().trim());
        }
      });
    } else if (typeof societiesInput === 'string' && societiesInput.trim()) {
      societiesInput.split(',').forEach((s) => {
        if (s.trim()) normalizedMySocieties.push(s.toLowerCase().trim());
      });
    }

    if (normalizedMySocieties.length === 0) {
      // If washer has no society assigned yet, return other active washers (up to 3)
      return allWashers.filter((w) => w.id !== currentWasherId).slice(0, 3);
    }

    return allWashers.filter((w) => {
      if (w.id === currentWasherId) return false;
      if (w.status === 'Dismissed') return false;

      const otherSocieties: string[] = [];
      if (Array.isArray(w.societies)) {
        w.societies.forEach((s) => {
          if (s) otherSocieties.push(String(s).toLowerCase().trim());
        });
      }
      if (typeof w.society === 'string') {
        w.society.split(',').forEach((s) => {
          if (s.trim()) otherSocieties.push(s.toLowerCase().trim());
        });
      }

      // Check for society overlap
      return normalizedMySocieties.some((mySoc) =>
        otherSocieties.some(
          (otherSoc) =>
            otherSoc === mySoc ||
            otherSoc.includes(mySoc) ||
            mySoc.includes(otherSoc)
        )
      );
    });
  } catch (err) {
    console.warn('fetchPeerWashersInSameSocieties error:', err);
    return [];
  }
}

/**
 * Marks a washer as absent specifically for the current day.
 * Toggles today's absence on or off in Washers collection.
 */
export async function markWasherAbsentTodayInFirestore(
  washerId: string,
  dateIso?: string
): Promise<{ success: boolean; isAbsent: boolean; absentDates: string[]; error?: string }> {
  try {
    const today = dateIso || new Date().toISOString().split('T')[0];
    const washerRef = doc(db, 'Washers', washerId);
    const snap = await getDoc(washerRef);

    let absentDates: string[] = [];
    let absentThisMonth = 0;

    if (snap.exists()) {
      const data = snap.data();
      absentDates = Array.isArray(data.absentDates) ? [...data.absentDates] : [];
      absentThisMonth = Number(data.absentThisMonth || 0);
    }

    const alreadyAbsent = absentDates.includes(today);
    let newAbsentDates: string[];
    let newCount: number;

    if (alreadyAbsent) {
      // Toggle off / revoke today's absence
      newAbsentDates = absentDates.filter((d) => d !== today);
      newCount = Math.max(0, absentThisMonth - 1);
    } else {
      // Mark absent today
      newAbsentDates = [...absentDates, today];
      newCount = absentThisMonth + 1;
    }

    await setDoc(
      washerRef,
      {
        absentDates: newAbsentDates,
        absentThisMonth: newCount,
        leaveReason: alreadyAbsent ? 'Active on Route' : `Absent today (${today})`,
        status: alreadyAbsent ? 'Active on Route' : 'On Leave',
        updated_at: serverTimestamp(),
      },
      { merge: true }
    );



    return {
      success: true,
      isAbsent: !alreadyAbsent,
      absentDates: newAbsentDates,
    };
  } catch (err: any) {
    console.error('markWasherAbsentTodayInFirestore error:', err);
    return {
      success: false,
      isAbsent: false,
      absentDates: [],
      error: err?.message || 'Failed to update absence',
    };
  }
}

export interface AssignBackupParams {
  primaryWasherId: string;
  primaryWasherName?: string;
  backupWasherId: string;
  backupWasherName?: string;
  startDate: string;
  endDate: string;
  reason?: string;
  initiatedBy?: string;
}

/**
 * Assigns a Backup Washer for an Assigned Washer on leave or unavailable.
 *
 * Requirements guaranteed:
 * 1. Updates assignment immediately so Backup Washer becomes the active washer for affected vehicles/service schedule.
 * 2. Notifies the Admin with original Assigned Washer, Backup Washer, society, affected vehicles, date, and reason.
 * 3. Preserves original Assigned Washer as primary/original washer (primaryWasherId/primaryWasherName) for historical & audit purposes.
 * 4. Records assignment timestamp, effective dates, reason, and initiator in Substitutions audit trail.
 * 5. Ensures exactly ONE active washer per vehicle at any time.
 * 6. Propagates immediately across Firestore so all dashboards (Owner, Primary Washer, Backup Washer, Admin) reflect real-time state.
 */
export async function assignBackupWasherInFirestore(params: AssignBackupParams): Promise<{
  success: boolean;
  substitutionId?: string;
  affectedCount: number;
  originalWasherName: string;
  backupWasherName: string;
  society: string;
  error?: string;
}> {
  try {
    const { primaryWasherId, backupWasherId, startDate, endDate, reason } = params;

    // 1. Fetch Primary & Backup washers from Firestore
    let primaryWasher = await fetchWasherFromFirestore(primaryWasherId);
    let backupWasher = await fetchWasherFromFirestore(backupWasherId);

    const primaryWasherName = params.primaryWasherName || primaryWasher?.name || 'Assigned Washer';
    const backupWasherName = params.backupWasherName || backupWasher?.name || 'Backup Partner';
    const initiatedBy = params.initiatedBy || `${primaryWasherName} (Assigned Washer)`;
    const societyName = primaryWasher?.society || backupWasher?.society || 'Assigned Society';

    // 2. Scan all vehicles across Car_Owners collection to find vehicles assigned to primaryWasherId
    const ownersSnap = await getDocs(collection(db, 'Car_Owners'));
    const affectedVehicles: { ownerId: string; vehicleId: string; regNumber: string }[] = [];

    for (const oDoc of ownersSnap.docs) {
      const ownerId = oDoc.id;
      const oData = oDoc.data();
      const vSnap = await getDocs(collection(db, 'Car_Owners', ownerId, 'Vehicles'));

      let ownerHasMatchingVehicle = false;

      for (const vDoc of vSnap.docs) {
        const vData = vDoc.data();
        const vId = vDoc.id;

        const isMatch =
          vData.assigned_washer_id === primaryWasherId ||
          vData.activeWasherId === primaryWasherId ||
          vData.washerId === primaryWasherId ||
          vData.primaryWasherId === primaryWasherId ||
          (primaryWasherName && vData.assigned_washer_name?.toLowerCase() === primaryWasherName.toLowerCase()) ||
          oData.assignedWasherId === primaryWasherId ||
          (primaryWasherName && oData.assignedWasherName?.toLowerCase() === primaryWasherName.toLowerCase());

        if (isMatch) {
          affectedVehicles.push({
            ownerId,
            vehicleId: vId,
            regNumber: vData.registrationNumber || vData.registration_number || vId,
          });
          ownerHasMatchingVehicle = true;

          // Update vehicle document immediately:
          // PRESERVE original washer in primaryWasherId (Rule 4),
          // SET backup washer as currently active washer (Rule 1 & Rule 8)
          const vehicleDocRef = doc(db, 'Car_Owners', ownerId, 'Vehicles', vId);
          await setDoc(
            vehicleDocRef,
            {
              primaryWasherId: vData.primaryWasherId || primaryWasherId,
              primaryWasherName: vData.primaryWasherName || primaryWasherName,
              assigned_washer_id: backupWasherId,
              assigned_washer_name: backupWasherName,
              activeWasherId: backupWasherId,
              activeWasherName: backupWasherName,
              isBackupActive: true,
              backupWasherId,
              backupWasherName,
              backupStartDate: startDate,
              backupEndDate: endDate,
              backupReason: reason || 'Washer Leave / Unavailable',
              backupInitiatedBy: initiatedBy,
              backupAssignedAt: new Date().toISOString(),
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        }
      }

      if (ownerHasMatchingVehicle) {
        // Also update the Car_Owners document to reflect the active washer
        await setDoc(
          doc(db, 'Car_Owners', ownerId),
          {
            primaryWasherId: oData.primaryWasherId || primaryWasherId,
            primaryWasherName: oData.primaryWasherName || primaryWasherName,
            assignedWasherId: backupWasherId,
            assignedWasherName: backupWasherName,
            isBackupActive: true,
            backupWasherId,
            backupWasherName,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }
    }

    // 3. Update Primary Washer in Washers collection
    const primaryRef = doc(db, 'Washers', primaryWasherId);
    await setDoc(
      primaryRef,
      {
        status: 'On Leave / Backup Active',
        isCoveredByBackup: true,
        backupWasherId,
        backupWasherName,
        currentSubstitutionStartDate: startDate,
        currentSubstitutionEndDate: endDate,
        updated_at: serverTimestamp(),
      },
      { merge: true }
    );

    // 4. Update Backup Washer in Washers collection
    const backupRef = doc(db, 'Washers', backupWasherId);
    await setDoc(
      backupRef,
      {
        isCoveringBackup: true,
        coveringForWasherId: primaryWasherId,
        coveringForWasherName: primaryWasherName,
        updated_at: serverTimestamp(),
      },
      { merge: true }
    );

    // 5. Create Substitution Audit Record in Substitutions collection (Rule 2, 4, 5)
    const subId = `sub_${Date.now()}`;
    const subRecord: WasherSubstitutionAudit = {
      id: subId,
      originalWasherId: primaryWasherId,
      originalWasher: primaryWasherName,
      backupWasherId,
      backupWasher: backupWasherName,
      society: societyName,
      dates: `${startDate} → ${endDate}`,
      startDate,
      endDate,
      reason: reason || 'Washer Leave / Unavailable',
      initiatedBy,
      timestamp: new Date().toISOString(),
      carsAffected: affectedVehicles.length,
      affectedVehicleIds: affectedVehicles.map((v) => v.vehicleId),
      status: 'Active',
    };
    await setDoc(doc(db, 'Substitutions', subId), {
      ...subRecord,
      createdAt: serverTimestamp(),
    });

    // 6. Notify Admin in Admin_Notifications collection (Rule 2)
    const notifId = `notif_sub_${Date.now()}`;
    const adminNotif = {
      id: notifId,
      title: '⚡ Washer Substitution Assigned',
      body: `${primaryWasherName} has assigned ${backupWasherName} to cover ${affectedVehicles.length} vehicles in ${societyName} (${startDate} to ${endDate}). Reason: ${reason || 'Leave / Unavailable'}. Initiated by: ${initiatedBy}.`,
      type: 'washer_substitution',
      originalWasher: primaryWasherName,
      originalWasherId: primaryWasherId,
      backupWasher: backupWasherName,
      backupWasherId,
      society: societyName,
      affectedCarsCount: affectedVehicles.length,
      startDate,
      endDate,
      reason: reason || 'Leave / Unavailable',
      initiatedBy,
      timestamp: new Date().toISOString(),
      read: false,
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'Admin_Notifications', notifId), adminNotif);

    return {
      success: true,
      substitutionId: subId,
      affectedCount: affectedVehicles.length,
      originalWasherName: primaryWasherName,
      backupWasherName,
      society: societyName,
    };
  } catch (err: any) {
    console.error('assignBackupWasherInFirestore error:', err);
    return {
      success: false,
      affectedCount: 0,
      originalWasherName: '',
      backupWasherName: '',
      society: '',
      error: err?.message || 'Failed to assign backup washer',
    };
  }
}

/**
 * Fetches all substitution & leave records from Substitutions collection for the Admin audit trail.
 */
export async function fetchSubstitutionsFromFirestore(): Promise<WasherSubstitutionAudit[]> {
  try {
    const snap = await getDocs(collection(db, 'Substitutions'));
    const list: WasherSubstitutionAudit[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as WasherSubstitutionAudit);
    });
    // Sort newest first
    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return list;
  } catch (err) {
    console.warn('fetchSubstitutionsFromFirestore error:', err);
    return [];
  }
}

/**
 * Reverts an active backup assignment back to the original primary washer.
 */
export async function revertBackupAssignmentInFirestore(substitutionId: string): Promise<boolean> {
  try {
    const subDoc = await getDoc(doc(db, 'Substitutions', substitutionId));
    if (!subDoc.exists()) return false;
    const sub = subDoc.data() as WasherSubstitutionAudit;

    // Scan vehicles and restore original washer
    const ownersSnap = await getDocs(collection(db, 'Car_Owners'));
    for (const oDoc of ownersSnap.docs) {
      const ownerId = oDoc.id;
      const vSnap = await getDocs(collection(db, 'Car_Owners', ownerId, 'Vehicles'));
      for (const vDoc of vSnap.docs) {
        const vData = vDoc.data();
        if (
          vData.isBackupActive &&
          vData.backupWasherId === sub.backupWasherId &&
          (vData.primaryWasherId === sub.originalWasherId || vData.assigned_washer_id === sub.backupWasherId)
        ) {
          await setDoc(
            doc(db, 'Car_Owners', ownerId, 'Vehicles', vDoc.id),
            {
              assigned_washer_id: sub.originalWasherId,
              assigned_washer_name: sub.originalWasher,
              activeWasherId: sub.originalWasherId,
              activeWasherName: sub.originalWasher,
              isBackupActive: false,
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        }
      }
    }

    // Restore primary washer status
    await setDoc(
      doc(db, 'Washers', sub.originalWasherId),
      {
        status: 'Active on Route',
        isCoveredByBackup: false,
        backupWasherId: null,
        backupWasherName: null,
        updated_at: serverTimestamp(),
      },
      { merge: true }
    );

    // Update substitution status
    await setDoc(
      doc(db, 'Substitutions', substitutionId),
      {
        status: 'Completed',
        completedAt: new Date().toISOString(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return true;
  } catch (err) {
    console.error('revertBackupAssignmentInFirestore error:', err);
    return false;
  }
}

// ===============================================================
// LEAD REGISTRATIONS (INTERESTED CUSTOMERS & EARLY ACCESS)
// ===============================================================

export async function createLeadRegistrationInFirestore(
  lead: LeadRegistration
): Promise<{ success: boolean; id: string; error?: string }> {
  try {
    const leadId = lead.id || `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const docData: LeadRegistration = {
      ...lead,
      id: leadId,
      createdAt: lead.createdAt || new Date().toISOString(),
      status: lead.status || 'new',
      source: lead.source || 'landing_modal',
      syncedToGoogleSheets: lead.syncedToGoogleSheets ?? false,
    };

    // 1. Write to Lead_Registrations
    try {
      await setDoc(doc(db, 'Lead_Registrations', leadId), {
        ...docData,
        serverCreatedAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn('Lead_Registrations write note:', e);
    }

    // 2. Also write to Car_Owners as resilient fallback
    try {
      await setDoc(doc(db, 'Car_Owners', leadId), {
        ...docData,
        name: lead.fullName,
        fullName: lead.fullName,
        phone: lead.phone,
        vehicleNumber: lead.vehicleNumber,
        society: lead.societyName,
        societyName: lead.societyName,
        district: lead.district,
        city: lead.city,
        state: lead.state,
        isLead: true,
        role: 'lead',
        serverCreatedAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn('Car_Owners lead fallback note:', e);
    }

    return { success: true, id: leadId };
  } catch (err: any) {
    console.error('createLeadRegistrationInFirestore error:', err);
    return { success: false, id: '', error: err?.message || 'Database error' };
  }
}

export async function fetchLeadRegistrationsFromFirestore(): Promise<LeadRegistration[]> {
  try {
    const leadsMap = new Map<string, LeadRegistration>();

    // 1. Fetch from Lead_Registrations
    try {
      const snap = await getDocs(collection(db, 'Lead_Registrations'));
      snap.forEach((docSnap) => {
        leadsMap.set(docSnap.id, { id: docSnap.id, ...(docSnap.data() as any) });
      });
    } catch (e) {
      // ignore
    }

    // 2. Fetch from Car_Owners where isLead is true
    try {
      const snapOwners = await getDocs(collection(db, 'Car_Owners'));
      snapOwners.forEach((docSnap) => {
        const d = docSnap.data();
        if (d?.isLead || docSnap.id.startsWith('lead_')) {
          if (!leadsMap.has(docSnap.id)) {
            leadsMap.set(docSnap.id, {
              id: docSnap.id,
              fullName: d.fullName || d.name || 'Interested Customer',
              phone: d.phone || '',
              vehicleNumber: d.vehicleNumber || '',
              societyName: d.societyName || d.society || '',
              district: d.district || '',
              city: d.city || '',
              state: d.state || '',
              createdAt: d.createdAt || '',
              status: d.status || 'new',
              syncedToGoogleSheets: d.syncedToGoogleSheets ?? false,
              source: d.source || 'Car_Owners lead',
            });
          }
        }
      });
    } catch (e) {
      // ignore
    }

    const leads = Array.from(leadsMap.values()).filter((l: any) => {
      // Filter out dummy/test registrations
      if (l.isDeleted) return false;
      if (l.id?.startsWith('lead_sample_') || l.id?.startsWith('lead_test_')) return false;
      const lowerName = (l.fullName || '').toLowerCase();
      if (lowerName.includes('test') || lowerName === 'rahul verma') return false;
      return true;
    });

    // Ensure phone numbers have clean 10-digit format
    leads.forEach((l) => {
      const digits = (l.phone || '').replace(/\D/g, '');
      if (digits.length >= 10) {
        l.phone = digits.slice(-10);
      }
    });

    leads.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return leads;
  } catch (err) {
    console.error('fetchLeadRegistrationsFromFirestore error:', err);
    return [];
  }
}

export async function updateLeadRegistrationInFirestore(
  id: string,
  updates: Partial<LeadRegistration>
): Promise<boolean> {
  try {
    await setDoc(doc(db, 'Lead_Registrations', id), { ...updates, updatedAt: serverTimestamp() }, { merge: true });
    await setDoc(doc(db, 'Car_Owners', id), { ...updates, updatedAt: serverTimestamp() }, { merge: true });
    return true;
  } catch (err) {
    console.error('updateLeadRegistrationInFirestore error:', err);
    return false;
  }
}

export async function deleteLeadRegistrationInFirestore(id: string): Promise<boolean> {
  try {
    await setDoc(doc(db, 'Lead_Registrations', id), { isDeleted: true, status: 'deleted', updatedAt: serverTimestamp() }, { merge: true });
    await setDoc(doc(db, 'Car_Owners', id), { isDeleted: true, status: 'deleted', updatedAt: serverTimestamp() }, { merge: true });
    return true;
  } catch (err) {
    console.error('deleteLeadRegistrationInFirestore error:', err);
    return false;
  }
}

/**
 * Direct lookup for a Car Owner profile by Firebase Auth UID.
 */
export async function findCarOwnerByIdInFirestore(uid: string): Promise<User | null> {
  try {
    if (!uid) return null;
    const snap = await getDoc(doc(db, 'Car_Owners', uid));
    if (snap.exists()) {
      return { id: snap.id, uid: snap.id, ...snap.data() } as User;
    }
    return null;
  } catch (err) {
    console.warn('findCarOwnerByIdInFirestore error:', err);
    return null;
  }
}

/**
 * Lookup for a Car Owner profile by email address.
 */
export async function findCarOwnerByEmailInFirestore(email: string): Promise<User | null> {
  try {
    if (!email) return null;
    const trimmed = email.trim();
    const q = query(collection(db, 'Car_Owners'), where('email', '==', trimmed.toLowerCase()));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const d = snap.docs[0];
      return { id: d.id, uid: d.id, ...d.data() } as User;
    }
    const qExact = query(collection(db, 'Car_Owners'), where('email', '==', trimmed));
    const snapExact = await getDocs(qExact);
    if (!snapExact.empty) {
      const d = snapExact.docs[0];
      return { id: d.id, uid: d.id, ...d.data() } as User;
    }
    return null;
  } catch (err) {
    console.warn('findCarOwnerByEmailInFirestore error:', err);
    return null;
  }
}

/**
 * Fetch all registered vehicles under a specific Car Owner UID from subcollection.
 */
export async function fetchCarOwnerVehiclesFromFirestore(uid: string): Promise<Vehicle[]> {
  try {
    if (!uid) return [];
    const vehiclesRef = collection(db, 'Car_Owners', uid, 'Vehicles');
    const snap = await getDocs(vehiclesRef);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Vehicle));
  } catch (err) {
    console.warn('fetchCarOwnerVehiclesFromFirestore error:', err);
    return [];
  }
}

/**
 * Comprehensive fetch for a Car Owner profile and their registered vehicles from Firestore.
 */
export async function fetchCarOwnerProfileData(
  ownerId?: string,
  phone?: string
): Promise<{ owner: any; vehicles: Vehicle[] } | null> {
  try {
    let resolvedOwner: any = null;
    let resolvedId = ownerId;

    // 1. Direct document lookup by ID
    if (resolvedId && resolvedId !== 'usr_guest') {
      const snap = await getDoc(doc(db, 'Car_Owners', resolvedId));
      if (snap.exists()) {
        resolvedOwner = { id: snap.id, uid: snap.id, ...snap.data() };
      }
    }

    // 2. Lookup by phone if not found yet
    if (!resolvedOwner && phone) {
      const cleanDigits = phone.replace(/\D/g, '').slice(-10);
      const snapAll = await getDocs(collection(db, 'Car_Owners'));
      const found = snapAll.docs.find((d) => {
        const dPhone = (d.data().phone || '').replace(/\D/g, '').slice(-10);
        return cleanDigits && dPhone === cleanDigits;
      });
      if (found) {
        resolvedOwner = { id: found.id, uid: found.id, ...found.data() };
        resolvedId = found.id;
      }
    }

    // 3. Fallback: Check first document if any exist
    if (!resolvedOwner) {
      const snapAll = await getDocs(collection(db, 'Car_Owners'));
      if (!snapAll.empty) {
        resolvedOwner = { id: snapAll.docs[0].id, uid: snapAll.docs[0].id, ...snapAll.docs[0].data() };
        resolvedId = snapAll.docs[0].id;
      }
    }

    if (!resolvedOwner) return null;

    // 4. Fetch vehicles from subcollection
    let vehiclesList: Vehicle[] = [];
    if (resolvedId) {
      const vSnap = await getDocs(collection(db, 'Car_Owners', resolvedId, 'Vehicles'));
      vehiclesList = vSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Vehicle));
    }

    return { owner: resolvedOwner, vehicles: vehiclesList };
  } catch (err) {
    console.warn('fetchCarOwnerProfileData notice:', err);
    return null;
  }
}

/**
 * Resolves the active owner document ID from direct argument, localStorage, or torque_user.
 */
export function resolveEffectiveOwnerId(ownerId?: string): string | null {
  if (ownerId && ownerId !== 'usr_guest') return ownerId;
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('torque_owner_id');
    if (stored && stored !== 'usr_guest') return stored;
    try {
      const u = localStorage.getItem('torque_user');
      if (u) {
        const parsed = JSON.parse(u);
        if (parsed?.id && parsed.id !== 'usr_guest') return parsed.id;
      }
    } catch {}
    const adminUid = localStorage.getItem('torque_admin_uid');
    if (adminUid && adminUid !== 'usr_guest') return adminUid;
  }
  return null;
}

/**
 * Saves owner daily feedback for any calendar wash date ("Was your Car cleaned today by the washer? Yes / No")
 * - If "yes": records status as completed / cleaned.
 * - If "no": flags the wash as missed / not cleaned (Orange in Calendar).
 * Writes reliably to:
 * 1. Car_Owners/{ownerId}/DailyFeedback/{dateIso}
 * 2. Car_Owners/{ownerId}/Vehicles/{vehicleId}/{monthKey}/{dateIso} & Months/{monthKey}/Dates/{dateIso}
 * 3. Car_Owners/{ownerId}/Vehicles/{vehicleId}/Washes/wash_{vehicleId}_{dateIso}
 * 4. Car_Owners/{ownerId} top-level document fields
 */
export async function saveDailyWashFeedbackToFirestore(
  ownerId?: string,
  vehicleId?: string,
  dateIso?: string,
  answer: 'yes' | 'no' = 'yes'
): Promise<{ success: boolean; error?: string }> {
  try {
    const today = getTodayISTDate();
    const effectiveDate = dateIso || today.dateIso;
    let resolvedOwnerId = resolveEffectiveOwnerId(ownerId);
    if (!resolvedOwnerId) {
      try {
        const snap = await getDocs(collection(db, 'Car_Owners'));
        if (!snap.empty) {
          resolvedOwnerId = snap.docs[snap.docs.length - 1].id;
        }
      } catch (e) {}
    }
    if (!resolvedOwnerId) {
      resolvedOwnerId = 'usr_pranav_1';
    }

    // Clean up any legacy local storage if present and sync current day
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('torque_daily_wash_feedbacks');
        localStorage.setItem(`torque_daily_feedback_answered_${effectiveDate}`, answer);
      } catch (e) {}
    }

    // Determine accurate monthKey for this effectiveDate (e.g. "October_2026")
    let monthKey: string;
    if (effectiveDate && effectiveDate.includes('-')) {
      const [y, m, d] = effectiveDate.split('-').map(Number);
      const dObj = new Date(y, m - 1, d, 12, 0, 0);
      monthKey = getTodayISTDate(dObj).monthKey;
    } else {
      monthKey = today.monthKey;
    }

    const washStatus = answer === 'yes' ? 'completed' : 'missed';
    const washPatch = {
      status: washStatus,
      ownerFeedback: answer,
      flaggedNotCleaned: answer === 'no',
      isCleaned: answer === 'yes',
      scheduled_date: effectiveDate,
      month_key: monthKey,
      notes:
        answer === 'no'
          ? 'Owner flagged: Car not cleaned today by washer (Orange)'
          : 'Owner confirmed: Cleaned ✓',
      updatedAt: serverTimestamp(),
    };

    // 1. Write feedback record to Car_Owners/{ownerId}/DailyFeedback/{dateIso}
    try {
      const fbRef = doc(db, 'Car_Owners', resolvedOwnerId, 'DailyFeedback', effectiveDate);
      await setDoc(
        fbRef,
        {
          date: effectiveDate,
          vehicleId: vehicleId || null,
          answer,
          ownerFeedback: answer,
          isCleaned: answer === 'yes',
          flaggedOrange: answer === 'no',
          flaggedNotCleaned: answer === 'no',
          status: washStatus,
          timestamp: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('saveDailyWashFeedbackToFirestore daily feedback notice:', e);
    }

    // 2. If vehicleId exists, update wash records for this date across month collections & washes
    if (vehicleId) {
      try {
        // Direct month subcollection
        const monthDateDocRef = doc(
          db,
          'Car_Owners',
          resolvedOwnerId,
          'Vehicles',
          vehicleId,
          monthKey,
          effectiveDate
        );
        await setDoc(monthDateDocRef, washPatch, { merge: true });
      } catch (err) {}

      try {
        // Nested Months subcollection
        const nestedMonthDocRef = doc(
          db,
          'Car_Owners',
          resolvedOwnerId,
          'Vehicles',
          vehicleId,
          'Months',
          monthKey,
          'Dates',
          effectiveDate
        );
        await setDoc(nestedMonthDocRef, washPatch, { merge: true });
      } catch (err) {}

      try {
        const washId = `wash_${vehicleId}_${effectiveDate}`;
        const washRef = doc(
          db,
          'Car_Owners',
          resolvedOwnerId,
          'Vehicles',
          vehicleId,
          'Washes',
          washId
        );
        await setDoc(washRef, washPatch, { merge: true });
      } catch (err) {}
    }

    // 3. Save feedback record to Car_Owners/{ownerId} top-level document
    try {
      const ownerDocRef = doc(db, 'Car_Owners', resolvedOwnerId);
      await setDoc(
        ownerDocRef,
        {
          lastWashFeedbackDate: effectiveDate,
          lastWashFeedbackAnswer: answer,
          lastOwnerFeedback: answer,
          [`wash_feedback_${effectiveDate}`]: answer,
          [`owner_feedback_${effectiveDate}`]: answer,
          [`ownerFeedback_${effectiveDate}`]: answer,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (e) {}

    return { success: true };
  } catch (err: any) {
    console.warn('saveDailyWashFeedbackToFirestore notice:', err);
    return { success: false, error: err?.message || 'Failed to save feedback' };
  }
}

/**
 * Fetches all daily feedback records from Car_Owners/{ownerId}/DailyFeedback, top-level document, and Vehicles/Washes/Months
 */
export async function fetchDailyWashFeedbackFromFirestore(
  ownerId?: string
): Promise<Record<string, 'yes' | 'no'>> {
  const result: Record<string, 'yes' | 'no'> = {};

  // Remove legacy local feedback cache if present
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('torque_daily_wash_feedbacks');
    } catch (e) {}
  }

  try {
    let resolvedOwnerId = resolveEffectiveOwnerId(ownerId);
    if (!resolvedOwnerId) {
      try {
        const snap = await getDocs(collection(db, 'Car_Owners'));
        if (!snap.empty) {
          resolvedOwnerId = snap.docs[snap.docs.length - 1].id;
        }
      } catch (e) {}
    }
    if (!resolvedOwnerId) {
      resolvedOwnerId = 'usr_pranav_1';
    }

    // 1. Fetch from Car_Owners/{resolvedOwnerId}/DailyFeedback (isolated try/catch)
    try {
      const snap = await getDocs(
        collection(db, 'Car_Owners', resolvedOwnerId, 'DailyFeedback')
      );
      snap.docs.forEach((d) => {
        const data = d.data();
        const rawAns =
          data.ownerFeedback ||
          data.answer ||
          (data.flaggedOrange || data.flaggedNotCleaned || data.status === 'missed' ? 'no' : (data.status === 'completed' || data.isCleaned ? 'yes' : undefined));
        if (rawAns === 'no') {
          result[d.id] = 'no';
        } else if (rawAns === 'yes' && !result[d.id]) {
          result[d.id] = 'yes';
        }
      });
    } catch (e) {
      // Ignore permission or collection missing errors
    }

    // 2. Fetch top-level fields from Car_Owners/{resolvedOwnerId}
    try {
      const ownerDocSnap = await getDoc(doc(db, 'Car_Owners', resolvedOwnerId));
      if (ownerDocSnap.exists()) {
        const oData = ownerDocSnap.data();
        Object.keys(oData).forEach((k) => {
          if (
            k.startsWith('wash_feedback_') ||
            k.startsWith('owner_feedback_') ||
            k.startsWith('ownerFeedback_') ||
            k.startsWith('feedback_')
          ) {
            const date = k.replace(/^wash_feedback_|^owner_feedback_|^ownerFeedback_|^feedback_/, '');
            const val = oData[k];
            if (val === 'no') {
              result[date] = 'no';
            } else if (val === 'yes' && !result[date]) {
              result[date] = 'yes';
            }
          }
        });
        if (
          oData.lastWashFeedbackDate &&
          (oData.lastWashFeedbackAnswer || oData.lastOwnerFeedback)
        ) {
          const lastAns = oData.lastOwnerFeedback || oData.lastWashFeedbackAnswer;
          if (lastAns === 'no') {
            result[oData.lastWashFeedbackDate] = 'no';
          } else if (lastAns === 'yes' && !result[oData.lastWashFeedbackDate]) {
            result[oData.lastWashFeedbackDate] = 'yes';
          }
        }
        if (oData.dailyFeedbacks && typeof oData.dailyFeedbacks === 'object') {
          Object.keys(oData.dailyFeedbacks).forEach((d) => {
            const v = oData.dailyFeedbacks[d];
            if (v === 'no') {
              result[d] = 'no';
            } else if (v === 'yes' && !result[d]) {
              result[d] = 'yes';
            }
          });
        }
      }
    } catch (e) {}

    // 3. Scan vehicle washes and month subcollections for any documents with ownerFeedback or status
    try {
      const vSnap = await getDocs(collection(db, 'Car_Owners', resolvedOwnerId, 'Vehicles'));
      const today = getTodayISTDate();
      const currentMonthKey = today.monthKey;
      for (const vDoc of vSnap.docs) {
        const vId = vDoc.id;

        // A. Washes subcollection
        try {
          const wSnap = await getDocs(collection(db, 'Car_Owners', resolvedOwnerId, 'Vehicles', vId, 'Washes'));
          wSnap.docs.forEach((w) => {
            const wData = w.data();
            const date = wData.scheduled_date || wData.scheduledDate || wData.date;
            const fb =
              wData.ownerFeedback ||
              wData.answer ||
              (wData.flaggedOrange || wData.flaggedNotCleaned || wData.status === 'missed' ? 'no' : (wData.status === 'completed' || wData.isCleaned ? 'yes' : undefined));
            if (date) {
              if (fb === 'no') {
                result[date] = 'no';
              } else if (fb === 'yes' && !result[date]) {
                result[date] = 'yes';
              }
            }
          });
        } catch (e) {}

        // B. Month subcollection (e.g. October_2026)
        try {
          const mSnap = await getDocs(collection(db, 'Car_Owners', resolvedOwnerId, 'Vehicles', vId, currentMonthKey));
          mSnap.docs.forEach((m) => {
            const mData = m.data();
            const date = mData.scheduled_date || mData.scheduledDate || mData.date || m.id;
            const fb =
              mData.ownerFeedback ||
              mData.answer ||
              (mData.flaggedOrange || mData.flaggedNotCleaned || mData.status === 'missed' ? 'no' : (mData.status === 'completed' || mData.isCleaned ? 'yes' : undefined));
            if (date) {
              if (fb === 'no') {
                result[date] = 'no';
              } else if (fb === 'yes' && !result[date]) {
                result[date] = 'yes';
              }
            }
          });
        } catch (e) {}

        // C. Nested Months subcollection
        try {
          const nSnap = await getDocs(collection(db, 'Car_Owners', resolvedOwnerId, 'Vehicles', vId, 'Months', currentMonthKey, 'Dates'));
          nSnap.docs.forEach((n) => {
            const nData = n.data();
            const date = nData.scheduled_date || nData.scheduledDate || nData.date || n.id;
            const fb =
              nData.ownerFeedback ||
              nData.answer ||
              (nData.flaggedOrange || nData.flaggedNotCleaned || nData.status === 'missed' ? 'no' : (nData.status === 'completed' || nData.isCleaned ? 'yes' : undefined));
            if (date) {
              if (fb === 'no') {
                result[date] = 'no';
              } else if (fb === 'yes' && !result[date]) {
                result[date] = 'yes';
              }
            }
          });
        } catch (e) {}
      }
    } catch (e) {}
  } catch (err) {
    console.warn('fetchDailyWashFeedbackFromFirestore notice:', err);
  }

  return result;
}

/**
 * Subscribes to real-time changes in owner feedback across Car_Owners doc and DailyFeedback.
 * Returns an unsubscribe cleanup function.
 */
export function subscribeToDailyWashFeedbackFromFirestore(
  ownerId?: string,
  callback?: (feedbacks: Record<string, 'yes' | 'no'>) => void
): () => void {
  if (!callback) {
    return () => {};
  }

  let resolvedOwnerId = resolveEffectiveOwnerId(ownerId);
  if (!resolvedOwnerId && typeof window !== 'undefined') {
    resolvedOwnerId = localStorage.getItem('torque_owner_id');
  }

  const unsubs: (() => void)[] = [];

  const attach = (activeOwnerId: string) => {
    // 1. Subscribe to Car_Owners/{activeOwnerId} top-level document
    try {
      const ownerDocRef = doc(db, 'Car_Owners', activeOwnerId);
      const unsubOwner = onSnapshot(
        ownerDocRef,
        (snap) => {
          if (!snap.exists()) return;
          const oData = snap.data();
          const feedbacks: Record<string, 'yes' | 'no'> = {};
          Object.keys(oData).forEach((k) => {
            if (
              k.startsWith('wash_feedback_') ||
              k.startsWith('owner_feedback_') ||
              k.startsWith('ownerFeedback_') ||
              k.startsWith('feedback_')
            ) {
              const date = k.replace(/^wash_feedback_|^owner_feedback_|^ownerFeedback_|^feedback_/, '');
              const val = oData[k];
              if (val === 'no') {
                feedbacks[date] = 'no';
              } else if (val === 'yes' && !feedbacks[date]) {
                feedbacks[date] = 'yes';
              }
            }
          });
          if (
            oData.lastWashFeedbackDate &&
            (oData.lastWashFeedbackAnswer || oData.lastOwnerFeedback)
          ) {
            const lastAns = oData.lastOwnerFeedback || oData.lastWashFeedbackAnswer;
            if (lastAns === 'no') {
              feedbacks[oData.lastWashFeedbackDate] = 'no';
            } else if (lastAns === 'yes' && !feedbacks[oData.lastWashFeedbackDate]) {
              feedbacks[oData.lastWashFeedbackDate] = 'yes';
            }
          }
          if (Object.keys(feedbacks).length > 0) {
            callback(feedbacks);
          }
        },
        (err) => {
          console.warn('subscribeToDailyWashFeedbackFromFirestore owner notice:', err);
        }
      );
      unsubs.push(unsubOwner);
    } catch (e) {}

    // 2. Subscribe to DailyFeedback subcollection
    try {
      const fbCollectionRef = collection(db, 'Car_Owners', activeOwnerId, 'DailyFeedback');
      const unsubDaily = onSnapshot(
        fbCollectionRef,
        (snap) => {
          const feedbacks: Record<string, 'yes' | 'no'> = {};
          snap.docs.forEach((d) => {
            const data = d.data();
            const rawAns =
              data.ownerFeedback ||
              data.answer ||
              (data.flaggedOrange || data.flaggedNotCleaned || data.status === 'missed' ? 'no' : (data.status === 'completed' || data.isCleaned ? 'yes' : undefined));
            if (rawAns === 'no') {
              feedbacks[d.id] = 'no';
            } else if (rawAns === 'yes' && !feedbacks[d.id]) {
              feedbacks[d.id] = 'yes';
            }
          });
          if (Object.keys(feedbacks).length > 0) {
            callback(feedbacks);
          }
        },
        () => {
          // Ignore permission denied on subcollection
        }
      );
      unsubs.push(unsubDaily);
    } catch (e) {}
  };

  if (resolvedOwnerId) {
    attach(resolvedOwnerId);
  } else {
    getDocs(collection(db, 'Car_Owners'))
      .then((snap) => {
        if (!snap.empty) {
          const foundId = snap.docs[snap.docs.length - 1].id;
          attach(foundId);
        } else {
          attach('usr_pranav_1');
        }
      })
      .catch(() => {
        attach('usr_pranav_1');
      });
  }

  return () => {
    unsubs.forEach((u) => u());
  };
}



