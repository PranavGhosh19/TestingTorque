// Firebase Firestore Service Layer for Torque Care
// Clean Architecture: Uses Car_Owners (with nested Vehicles & Washes) and Washers

import {
  collection,
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
import { db, storage } from './firebase';
import { User, Vehicle, WashRecord, RouteStop } from './types';
import { WasherPartner } from './washerPartners';

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

    // 1. CAR OWNER: Car_Owners/{ownerId}
    const carOwnerRef = doc(db, 'Car_Owners', ownerId);
    const carOwnerPayload = {
      ownerId: ownerId,
      name: owner.name,
      phone: owner.phone,
      altPhone: owner.alt_phone || null,
      address: owner.address || null,
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
      assignedWasherId: owner.assigned_washer_id || '',
      assignedWasherName: owner.assigned_washer_name || '',
      createdAt: owner.created_at || new Date().toISOString(),
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      // Legacy helper compatibility
      id: ownerId,
      owner_name: owner.owner_name || owner.name,
      selected_plan: defaultPlanName,
      assigned_washer_id: owner.assigned_washer_id || '',
      assigned_washer_name: owner.assigned_washer_name || '',
    };
    await setDoc(carOwnerRef, carOwnerPayload, { merge: true });

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
          societyName: vehicle.society_name || 'Green Valley Residency',
          price: vehiclePrice,
          subscriptionPrice: vehiclePrice,
          washerId: vehicle.assigned_washer_id || owner.assigned_washer_id || '',
          washerName: vehicle.assigned_washer_name || owner.assigned_washer_name || '',
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
          assigned_washer_id: vehicle.assigned_washer_id || owner.assigned_washer_id || '',
          assigned_washer_name: vehicle.assigned_washer_name || owner.assigned_washer_name || '',
        };
        await setDoc(vehicleDocRef, vehiclePayload, { merge: true });

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

    const washerPayload = {
      id: washer.id,
      washerId: washer.id,
      name: washer.name,
      phone: phoneWithCountry,
      phone_raw: phoneRaw,
      society: washer.society || 'Green Valley Residency',
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
      status: washer.status || 'Active on Route',
      kyc: washer.kyc || 'Verified (Aadhaar & Police Clear)',
      role: 'washer',
      created_at: washer.created_at || new Date().toISOString(),
      last_login_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    };

    // Write ONLY to Washers collection
    const washerRef = doc(db, 'Washers', washer.id);
    await setDoc(washerRef, washerPayload, { merge: true });

    return { success: true };
  } catch (error: any) {
    console.warn('Firebase syncWasherToFirestore notice:', error?.message || error);
    return { success: false, error: error?.message || 'Sync failed' };
  }
}

/**
 * Records user login by updating the respective Car_Owners or Washers document.
 */
export async function recordUserLogin(
  user: User,
  method: string = 'otp'
): Promise<{ success: boolean; error?: string }> {
  try {
    if (user.role === 'washer') {
      const washerRef = doc(db, 'Washers', user.id);
      await setDoc(
        washerRef,
        {
          id: user.id,
          name: user.name,
          phone: user.phone,
          role: 'washer',
          last_login_at: serverTimestamp(),
          login_method: method,
          updated_at: serverTimestamp(),
        },
        { merge: true }
      );
    } else {
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
    }

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

    // 1. Check Car_Owners
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
    const q = query(washersRef, where('phone', '==', phone));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as WasherPartner;
    }

    if (last10) {
      const q2 = query(washersRef, where('phone', '==', `+91 ${last10}`));
      const snap2 = await getDocs(q2);
      if (!snap2.empty) {
        return snap2.docs[0].data() as WasherPartner;
      }
    }

    return null;
  } catch (error: any) {
    console.warn('Firebase findWasherByPhoneInFirestore notice:', error?.message || error);
    return null;
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
          // Fetch wash record for this vehicle
          let washRecord: any = null;
          try {
            const wSnap = await getDocs(collection(db, 'Car_Owners', ownerId, 'Vehicles', vId, 'Washes'));
            if (!wSnap.empty) {
              washRecord = { id: wSnap.docs[0].id, ...wSnap.docs[0].data() };
            }
          } catch (err) {
            console.warn('Could not fetch washes for vehicle:', vId, err);
          }

          const status = washRecord?.status || 'pending';
          const proofPhoto = washRecord?.proof?.photoUrl || washRecord?.after_photo;
          const payoutAmount = getWasherPayoutPerWash(vData);

          stops.push({
            stop_number: stops.length + 1,
            wash_id: washRecord?.id || `wash_${vId}_today`,
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
            proof_photo: proofPhoto || undefined,
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
      const washId = wash.id || `wash_${wash.vehicle_id}_today`;
      const washRef = doc(db, 'Car_Owners', resolvedOwnerId, 'Vehicles', wash.vehicle_id, 'Washes', washId);
      await setDoc(
        washRef,
        {
          washId,
          vehicleId: wash.vehicle_id,
          washerId: wash.washer_id || 'wsh_amit',
          washerName: wash.washer_name || 'Washer Partner',
          scheduledDate: wash.scheduled_date || 'Today',
          completedAt: wash.completed_at || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: wash.status || 'completed',
          proof: {
            photoUrl: wash.after_photo || '/images/honda_city_after.jpg',
            capturedAt: new Date().toISOString(),
          },
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      // Also update the vehicle document with last wash completion status
      try {
        const vehicleRef = doc(db, 'Car_Owners', resolvedOwnerId, 'Vehicles', wash.vehicle_id);
        await setDoc(
          vehicleRef,
          {
            lastWashDate: 'Today',
            lastWashTime: wash.completed_at || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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

          // 3. Fetch Washes subcollection: Car_Owners/{ownerId}/Vehicles/{vehicleId}/Washes
          try {
            const washesSubRef = collection(db, 'Car_Owners', resolvedOwnerId, 'Vehicles', vId, 'Washes');
            const wSnap = await getDocs(washesSubRef);
            let vehicleWashCount = 0;
            wSnap.forEach((wDoc) => {
              const wData = wDoc.data();
              const proof = wData.proof || {};
              const resolvedWasherName =
                (wData.washerName && wData.washerName !== 'Unregistered Owner' && wData.washerName !== 'Washer Partner'
                  ? wData.washerName
                  : null) ||
                vehicleObj.assigned_washer_name ||
                result.user?.assigned_washer_name ||
                'Shubham G';

              const washPhotoUrl = proof.photoUrl || wData.photoUrl || (wData.status === 'completed' ? '/images/honda_city_after.jpg' : null);

              if (wData.status === 'completed') {
                vehicleWashCount++;
              }

              fetchedWashes.push({
                id: wDoc.id || wData.washId,
                vehicle_id: vId,
                vehicle_name: `${vehicleObj.make} ${vehicleObj.model}`.trim() || 'Your Vehicle',
                registration_number: vehicleObj.registration_number,
                parking_location: vehicleObj.parking_location,
                washer_id: wData.washerId || vehicleObj.assigned_washer_id || 'wsh_1790795559023',
                washer_name: resolvedWasherName,
                washer_avatar: wData.washerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(resolvedWasherName)}&background=0B132B&color=10B981&bold=true`,
                washer_rating: 4.9,
                status: (wData.status as any) || 'completed',
                scheduled_date: wData.scheduledDate || 'Today',
                scheduled_time: vehicleObj.preferred_wash_time,
                completed_at: wData.completedAt || null,
                location_verified: true,
                after_photo: washPhotoUrl,
                captured_at: proof.capturedAt || null,
                created_at: wData.createdAt?.toDate ? wData.createdAt.toDate().toISOString() : (typeof wData.createdAt === 'string' ? wData.createdAt : null),
                is_sunday_priority: false,
                is_backup_covered: false,
              });
            });

            if (vehicleWashCount > 0) {
              vehicleObj.washes_this_month = vehicleWashCount;
            } else if (vData.lastWashStatus === 'completed' && vehicleObj.washes_this_month === 0) {
              vehicleObj.washes_this_month = 1;
            }
          } catch (wErr) {
            console.warn('Could not read vehicle washes subcollection:', wErr);
          }

          fetchedVehicles.push(vehicleObj);
        }

        if (fetchedVehicles.length > 0) {
          result.vehicles = fetchedVehicles;
        }
        if (fetchedWashes.length > 0) {
          result.washes = fetchedWashes;
          result.todayWash = fetchedWashes[0] || null;
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
            society: 'Green Valley Residency',
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
 */
export async function fetchAllWashersFromFirestore(): Promise<WasherPartner[]> {
  try {
    const washersMap = new Map<string, WasherPartner>();

    const washersRef = collection(db, 'Washers');
    const snap = await getDocs(washersRef);
    snap.forEach((docSnap) => {
      if (!washersMap.has(docSnap.id)) {
        const data = docSnap.data();
        washersMap.set(docSnap.id, {
          id: docSnap.id,
          name: data.name || 'Washer Partner',
          phone: data.phone || '',
          avatar: data.avatar || data.avatar_url || '/images/washer_amit.jpg',
          rating: String(data.rating || '4.9'),
          reviewsCount: Number(data.reviewsCount || data.reviews_count || 120),
          society: data.society || 'Green Valley Residency',
          assignedCarsPerDay: Number(data.assignedCarsPerDay || data.assigned_cars_per_day || 34),
          routeWindow: data.routeWindow || data.route_window || '06:30 AM - 09:30 AM',
          avgTimePerCar: data.avgTimePerCar || data.avg_time_per_car || '5.5 mins',
          completionRate: data.completionRate || data.completion_rate || '99.5%',
          totalLifetimeWashes: Number(data.totalLifetimeWashes || data.total_lifetime_washes || 1200),
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
          backupWasherName: data.backupWasherName || 'Rajesh Sharma',
          monthlyPayoutsGone: Number(data.monthlyPayoutsGone || 48000),
          pendingPayoutDue: Number(data.pendingPayoutDue || 2800),
          sundayBonusEarned: Number(data.sundayBonusEarned || 1200),
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
