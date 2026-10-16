'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Vehicle,
  WashRecord,
  RouteStop,
  WasherEarnings,
  LeaveRequest,
  NotificationItem,
  Society,
  ExceptionItem,
  TravelBooking,
  DetailPackage,
} from './types';
import {
  syncOwnerToFirestore,
  syncVehicleToFirestore,
  syncWashRecordToFirestore,
  syncWasherToFirestore,
  dismissWasherInFirestore,
  reinstateWasherInFirestore,
  deleteWasherInFirestore,
  appointWasherToVehicleInFirestore,
  recordUserLogin,
  resetOwnerFirestoreData,
  fetchAllWashersFromFirestore,
} from './firebaseService';
import { WasherPartner, initialWasherPartners } from './washerPartners';
import { isWashFromToday, getTodayISTDate } from './washUtils';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs } from 'firebase/firestore';
import { auth, db } from './firebase';
import {
  enqueueWashUpload,
  getPendingUploadsCount,
  drainUploadQueue,
} from './offlineUploadQueue';
import { signOutFirebaseUser } from './firebaseAuth';

interface StoreContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  user: User;
  setUser: (user: User) => void;
  vehicles: Vehicle[];
  setVehicles: (vehicles: Vehicle[]) => void;
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'owner_id' | 'owner_name' | 'washes_this_month' | 'subscription_status'>) => void;
  registerOwner: (
    ownerData: {
      id?: string;
      uid?: string;
      name: string;
      email?: string;
      phone: string;
      address?: string;
      flat?: string;
      flatNumber?: string;
      state?: string;
      city?: string;
      district?: string;
      society?: string;
      societyId?: string;
      societyName?: string;
      adminId?: string;
      assignedAdminId?: string;
      areaManagerId?: string;
      alt_phone?: string;
      selectedPlan?: string;
      selectedWasherId?: string;
      selectedWasherName?: string;
      price?: number;
      subscriptionPrice?: number;
      needWashBefore?: string;
      need_wash_before?: string;
      washerLeaveDay?: string;
      washerWeeklyLeaveDay?: string;
    },
    vehiclesList: Array<{
      make: string;
      model: string;
      registration_number: string;
      type: 'car' | 'suv' | 'luxury' | 'bike';
      color: string;
      parking_location: string;
      preferred_wash_time: string;
      society_id?: string;
      society_name?: string;
      assigned_washer_id?: string;
      assigned_washer_name?: string;
      adminId?: string;
      assignedAdminId?: string;
      flat?: string;
      flatNumber?: string;
      price?: number;
      subscription_price?: number;
      needWashBefore?: string;
      need_wash_before?: string;
      washerLeaveDay?: string;
      washerWeeklyLeaveDay?: string;
    }>
  ) => Promise<void> | void;
  washes: WashRecord[];
  todayWash: WashRecord | undefined;
  routeStops: RouteStop[];
  setRouteStops: React.Dispatch<React.SetStateAction<RouteStop[]>>;
  washers: WasherPartner[];
  setWashers: React.Dispatch<React.SetStateAction<WasherPartner[]>>;
  onboardWasher: (washerData: {
    id?: string;
    washerFirebaseUID?: string;
    name: string;
    phone: string;
    email?: string;
    society?: string;
    societies?: string[];
    assignedCarsPerDay?: number;
    routeWindow?: string;
    aadhaarNumber: string;
    aadhaarPhotoUrl?: string;
    bankAccount?: string;
    ifscCode?: string;
    address?: string;
    createdBy?: string;
  }) => WasherPartner;
  setWasherPassword: (washerIdOrPhoneOrEmail: string, newPassword: string) => void;
  dismissWasher: (washerId: string, reason?: string) => Promise<boolean>;
  reinstateWasher: (washerId: string) => Promise<boolean>;
  deleteWasher: (washerId: string) => Promise<boolean>;
  appointWasherToVehicle: (vehicleId: string, washerId: string, ownerId?: string) => Promise<boolean>;
  eraseAllData: () => void;
  resetOwnerData: () => Promise<void>;
  resetToDemoData: () => void;
  isDataErased: boolean;
  verifyPhoneNumber: (phone: string, otp: string) => Promise<boolean>;
  washerEarnings: WasherEarnings;
  setWasherEarnings: React.Dispatch<React.SetStateAction<WasherEarnings>>;
  societies: Society[];
  exceptions: ExceptionItem[];
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  sundayRequestState: {
    status: 'idle' | 'searching' | 'confirmed';
    washerName?: string;
    arrivalTime?: string;
    price?: number;
  };
  requestSundayWash: () => void;
  washerStartWash: (stopNumber: number) => void;
  washerCompleteWash: (stopNumber: number, afterImg?: string) => Promise<void> | void;
  washerReportUnavailable: (stopNumber: number, reason: string, evidence?: string) => void;
  washerRequestLeave: (startDate: string, endDate: string, backupWasherId: string) => boolean;
  withdrawEarnings: (amount: number) => boolean;
  resolveException: (id: string) => void;
  isOffline: boolean;
  toggleOffline: () => void;
  offlineQueueCount: number;
  syncOfflineQueue: () => void;
  travelBookings: TravelBooking[];
  createTravelBooking: (booking: Omit<TravelBooking, 'id' | 'is_active'>) => void;
  endTravelBooking: (id: string) => void;
  detailPackages: DetailPackage[];
  createDetailBooking: (packageId: string, vehicleId: string, date: string, time: string) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (loggedIn: boolean) => void;
  isHydrated: boolean;
  logout: () => void;
}


const defaultUser: User = {
  id: 'usr_guest',
  name: 'Unregistered Owner',
  phone: '',
  role: 'owner',
  status: 'active',
  created_at: '2026-01-15T00:00:00Z',
};

export const demoOwnerUser: User = {
  id: 'usr_pranav_1',
  name: 'Pranav Ghosh',
  owner_name: 'Pranav Ghosh',
  phone: '+91 98765 43210',
  email: 'pranav@example.com',
  role: 'owner',
  status: 'active',
  created_at: '2026-01-15T00:00:00Z',
  selected_plan: 'HOME BASIC',
  price: 499,
  subscription_price: 499,
};

const initialVehicles: Vehicle[] = [];

export const demoVehicles: Vehicle[] = [
  {
    id: 'veh_honda_city',
    owner_id: 'usr_pranav_1',
    owner_name: 'Pranav Ghosh',
    registration_number: 'DL 01 AB 4291',
    make: 'Honda',
    model: 'City ZX',
    type: 'car',
    color: 'Lunar Silver',
    parking_location: 'Block B • Parking 42',
    parking_floor: 'Basement 1',
    preferred_wash_time: '07:30 AM',
    society_id: 'soc_green_valley',
    society_name: 'Green Valley Residency',
    subscription_status: 'active',
    washes_this_month: 22,
    selected_plan: 'HOME BASIC',
    price: 499,
    subscription_price: 499,
  },
  {
    id: 'veh_creta_1',
    owner_id: 'usr_pranav_1',
    owner_name: 'Pranav Ghosh',
    registration_number: 'KA 01 HY 4567',
    make: 'Hyundai',
    model: 'Creta SX(O)',
    type: 'suv',
    color: 'Phantom Black',
    parking_location: 'Block C • Parking 108',
    parking_floor: 'Basement 1',
    preferred_wash_time: '08:00 AM',
    society_id: 'soc_green_valley',
    society_name: 'Green Valley Residency',
    subscription_status: 'active',
    washes_this_month: 20,
    selected_plan: 'HOME BASIC',
    price: 649,
    subscription_price: 649,
  },
];

export const detailPackages: DetailPackage[] = [
  {
    id: 'det_steam',
    name: 'Interior Steam Sanitization',
    duration: '2.5 hrs',
    price: 799,
    description: 'High-temperature steam extraction, upholstery shampooing, AC vent antibacterial fumigation & leather conditioning.',
    features: [
      'High-temp 140°C steam extraction',
      'Upholstery & deep mat stain removal',
      'AC vent antimicrobial duct fumigation',
      'Dashboard UV matte protection',
    ],
  },
  {
    id: 'det_foam_clay',
    name: 'Foam & Clay Bar Gloss Revival',
    duration: '3 hrs',
    price: 999,
    popular: true,
    description: 'Snow foam bath, clay bar iron decontamination, swirl-mark glaze sealant & tire dressing for mirror reflection.',
    features: [
      'pH-neutral snow foam bath',
      'Fine-grade clay bar contaminant pull',
      'Synthetic polymer paint sealant (90 days)',
      'Alloy decontamination & satin tire coat',
    ],
  },
  {
    id: 'det_ceramic',
    name: 'Ceramic Shield Maintenance',
    duration: '4 hrs',
    price: 1499,
    description: 'Specialized SiO2 ceramic booster topper, hydrophobic glass coating, scratch inspection and trim restoration.',
    features: [
      'SiO2 9H ceramic booster layer',
      'Full glass Rain-X hydrophobic treatment',
      'Unpainted exterior trim deep restoration',
      'Paint thickness & scratch optical survey',
    ],
  },
  {
    id: 'det_360',
    name: 'Torque 360° Studio Restoration',
    duration: '6 hrs',
    price: 2199,
    description: 'The ultimate bumper-to-bumper transformation: complete interior steam detailing + dual-action paint machine polish.',
    features: [
      'Complete interior steam & extraction',
      'Single-stage machine swirl removal',
      'Engine bay dust-safe dry clean & dress',
      'Full vehicle ceramic spray seal',
    ],
  },
];

const initialWashes: WashRecord[] = [
  {
    id: 'wash_oct_6',
    vehicle_id: 'veh_honda_city',
    vehicle_name: 'Honda City',
    registration_number: 'DL 01 AB 4291',
    parking_location: 'Block B • Parking 42',
    washer_id: 'wsh_amit_1',
    washer_name: 'Amit Kumar',
    washer_avatar: '/images/washer_amit.jpg',
    washer_rating: 4.9,
    status: 'completed',
    scheduled_date: '06 Oct',
    scheduled_time: '7:30 AM',
    started_at: '7:32 AM',
    completed_at: '7:42 AM',
    location_verified: true,
    service_type: 'home',
    city: 'Delhi',
    after_photo: '/images/honda_city_after.jpg',
    is_sunday_priority: false,
    is_backup_covered: false,
    notes: 'Home society bay clean completed. Microfiber wiped, windshield spotless.',
  },
  {
    id: 'wash_oct_3',
    vehicle_id: 'veh_honda_city',
    vehicle_name: 'Honda City',
    registration_number: 'DL 01 AB 4291',
    parking_location: 'C-Scheme • Bay P-08',
    washer_id: 'wsh_vikram_jaipur',
    washer_name: 'Vikram Singh (Away Partner)',
    washer_avatar: '/images/washer_amit.jpg',
    washer_rating: 4.9,
    status: 'completed',
    scheduled_date: '03 Oct',
    scheduled_time: '7:30 PM',
    completed_at: '7:48 PM',
    location_verified: true,
    service_type: 'away',
    city: 'Jaipur',
    after_photo: '/images/honda_city_after.jpg',
    is_sunday_priority: false,
    is_backup_covered: false,
    notes: 'Away Mode clean at Jaipur. Highway dust rinsed, glass cleaned, alloys dressed.',
  },
  {
    id: 'wash_sep_30',
    vehicle_id: 'veh_honda_city',
    vehicle_name: 'Honda City',
    registration_number: 'DL 01 AB 4291',
    parking_location: 'C-Scheme • Bay P-08',
    washer_id: 'wsh_vikram_jaipur',
    washer_name: 'Vikram Singh (Away Partner)',
    washer_avatar: '/images/washer_amit.jpg',
    washer_rating: 4.9,
    status: 'completed',
    scheduled_date: '30 Sep',
    scheduled_time: '7:30 PM',
    completed_at: '7:46 PM',
    location_verified: true,
    service_type: 'away',
    city: 'Jaipur',
    after_photo: '/images/honda_city_after.jpg',
    is_sunday_priority: false,
    is_backup_covered: false,
    notes: 'Away Mode wash executed upon arrival in Jaipur hotel parking bay.',
  },
  {
    id: 'wash_sep_28',
    vehicle_id: 'veh_honda_city',
    vehicle_name: 'Honda City',
    registration_number: 'DL 01 AB 4291',
    parking_location: 'Block B • Parking 42',
    washer_id: 'wsh_amit_1',
    washer_name: 'Amit Kumar',
    washer_avatar: '/images/washer_amit.jpg',
    washer_rating: 4.9,
    status: 'completed',
    scheduled_date: '28 Sep',
    scheduled_time: '7:30 AM',
    completed_at: '7:42 AM',
    location_verified: true,
    service_type: 'home',
    city: 'Delhi',
    after_photo: '/images/honda_city_after.jpg',
    is_sunday_priority: false,
    is_backup_covered: false,
    notes: 'Pre-trip wash completed before departure.',
  },
  {
    id: 'wash_sep_24_unavailable',
    vehicle_id: 'veh_honda_city',
    vehicle_name: 'Honda City',
    registration_number: 'DL 01 AB 4291',
    parking_location: 'Green Valley Residency • Bay D-14 (Basement 1)',
    washer_id: 'wsh_amit_1',
    washer_name: 'Amit Kumar',
    washer_avatar: '/images/washer_amit.jpg',
    washer_rating: 4.9,
    status: 'vehicle_unavailable',
    outcome_label: 'Customer / Vehicle Unavailable',
    washer_present: true,
    service_possible: false,
    payout_protected: true,
    bay_empty_photo: '/images/empty_parking_bay.jpg',
    scheduled_date: '24 Sep',
    scheduled_time: '7:30 AM',
    started_at: '7:31 AM',
    completed_at: '7:34 AM',
    location_verified: true,
    service_type: 'home',
    city: 'Delhi',
    after_photo: '/images/empty_parking_bay.jpg',
    is_sunday_priority: false,
    is_backup_covered: false,
    notes: 'Washer reached assigned parking bay D-14 during scheduled window, but owner and vehicle were not available. Live bay photo captured & verified. Washer: Present ✓ • Service: Not possible • Washer payout: Protected ✓ (Not classified as missed wash by washer).',
  },
  {
    id: 'wash_sep_20_detail',
    vehicle_id: 'veh_honda_city',
    vehicle_name: 'Honda City',
    registration_number: 'DL 01 AB 4291',
    parking_location: 'Torque Studio • Bay 3',
    washer_id: 'wsh_rajesh_detail',
    washer_name: 'Rajesh Soni (Master Detailer)',
    washer_avatar: '/images/washer_amit.jpg',
    washer_rating: 5.0,
    status: 'completed',
    scheduled_date: '20 Sep',
    scheduled_time: '11:00 AM',
    completed_at: '1:45 PM',
    location_verified: true,
    service_type: 'detail',
    city: 'Delhi',
    after_photo: '/images/hero_car.jpg',
    is_sunday_priority: false,
    is_backup_covered: false,
    notes: 'Torque Care Detail: Ceramic Gloss Sealant & Interior Steam Sanitization completed.',
  },
];

const initialRouteStops: RouteStop[] = [];

const initialEarnings: WasherEarnings = {
  total_earnings: 0,
  this_week: 0,
  available: 0,
  pending: 0,
  bank_account_last4: '',
  recent_payouts: [],
};

const initialSocieties: Society[] = [];

const initialExceptions: ExceptionItem[] = [];

const initialNotifications: NotificationItem[] = [
  {
    id: 'notif_1',
    title: 'Wash completed ✓',
    body: 'Your Honda City was washed today at 7:42 AM by Amit Kumar. Verified location & photos attached.',
    timestamp: '7:42 AM',
    read: false,
    category: 'wash',
    action_url: '/owner/washes/wash_today_1',
  },
  {
    id: 'notif_2',
    title: 'Backup washer assigned',
    body: 'Sep 25: Rahul Sharma successfully covered your wash while Amit was on approved leave.',
    timestamp: 'Sep 25',
    read: true,
    category: 'system',
  },
  {
    id: 'notif_3',
    title: 'Sunday Priority Open',
    body: 'Book your spot for Sunday 29 September before slots fill up.',
    timestamp: 'Yesterday',
    read: true,
    category: 'sunday',
  },
];

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>('owner');
  const [user, setUser] = useState<User>(defaultUser);
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [washes, setWashes] = useState<WashRecord[]>(initialWashes);
  const [routeStops, setRouteStops] = useState<RouteStop[]>(initialRouteStops);
  const [washers, setWashers] = useState<WasherPartner[]>(initialWasherPartners);
  const [isDataErased, setIsDataErased] = useState<boolean>(false);
  const [washerEarnings, setWasherEarnings] = useState<WasherEarnings>(initialEarnings);
  const [societies, setSocieties] = useState<Society[]>(initialSocieties);
  const [exceptions, setExceptions] = useState<ExceptionItem[]>(initialExceptions);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [offlineQueueCount, setOfflineQueueCount] = useState<number>(0);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [sundayRequestState, setSundayRequestState] = useState<{
    status: 'idle' | 'searching' | 'confirmed';
    washerName?: string;
    arrivalTime?: string;
    price?: number;
  }>({ status: 'idle' });

  // Hydrate from localStorage on client-side mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const erased = localStorage.getItem('torque_data_erased') === 'true';
      const ownerReset = localStorage.getItem('torque_owner_reset') === 'true';
      const storedLoggedIn = localStorage.getItem('torque_logged_in') === 'true';
      setIsDataErased(erased);

      if (erased || ownerReset) {
        setIsLoggedIn(false);
        setVehicles([]);
        setWashers(erased ? [] : initialWasherPartners);
        setWashes([]);
        setRouteStops([]);
        setUser({
          id: 'usr_guest',
          name: 'Unregistered Owner',
          phone: '',
          role: 'owner',
          status: 'active',
          created_at: new Date().toISOString(),
        });
      } else {
        const savedUser = localStorage.getItem('torque_user');
        const savedOwnerName = localStorage.getItem('torque_owner_name');
        const savedAdminUid = localStorage.getItem('torque_admin_uid');
        const savedWasherId = localStorage.getItem('torque_washer_id');
        let userLoaded = false;
        if (savedUser) {
          try {
            const parsed = JSON.parse(savedUser);
            if (parsed?.id && parsed.id !== 'usr_guest') {
              if (parsed.role) {
                setRoleState(parsed.role);
              }
              if (savedOwnerName && (!parsed.owner_name || parsed.name === 'Vehicle Owner')) {
                parsed.name = savedOwnerName;
                parsed.owner_name = savedOwnerName;
              } else if (!parsed.owner_name && parsed.name) {
                parsed.owner_name = parsed.name;
              }
              setUser(parsed);
              setIsLoggedIn(true);
              userLoaded = true;
            }
          } catch (e) {
            console.warn('Error parsing torque_user:', e);
          }
        }
        if (!userLoaded && storedLoggedIn) {
          if (savedAdminUid) {
            setRoleState('admin');
          } else if (savedWasherId) {
            setRoleState('washer');
          }
          setIsLoggedIn(true);
        }

        // Clean up legacy local entity caches so all data is strictly loaded from Firestore
        localStorage.removeItem('torque_washers');
        localStorage.removeItem('torque_vehicles');
        localStorage.removeItem('torque_washes');
        localStorage.removeItem('torque_routestops');
        localStorage.removeItem('torque_daily_wash_feedbacks');

        // Load all active washers directly from Firestore
        fetchAllWashersFromFirestore().then((remoteWashers) => {
          if (remoteWashers && remoteWashers.length > 0) {
            setWashers(remoteWashers);
          }
        }).catch((wErr) => {
          console.warn('Store fetchAllWashersFromFirestore notice:', wErr);
        });

        // Load vehicles for active owner directly from Firestore
        const activeOwnerId =
          (savedUser ? (() => { try { return JSON.parse(savedUser)?.id; } catch { return null; } })() : null) ||
          localStorage.getItem('torque_owner_id');
        if (activeOwnerId && activeOwnerId !== 'usr_guest') {
          getDocs(collection(db, 'Car_Owners', activeOwnerId, 'Vehicles')).then((vSnap) => {
            if (!vSnap.empty) {
              const loadedVehicles: Vehicle[] = [];
              vSnap.docs.forEach((d) => {
                const vd = d.data();
                loadedVehicles.push({
                  id: d.id,
                  owner_id: activeOwnerId,
                  owner_name: savedOwnerName || 'Vehicle Owner',
                  registration_number: vd.registrationNumber || vd.registration_number || '',
                  make: vd.make || '',
                  model: vd.model || '',
                  type: vd.type || 'car',
                  color: vd.color || 'Pearl White',
                  parking_location: vd.parkingLocation || vd.parking_location || 'Assigned Bay',
                  preferred_wash_time: vd.preferredWashTime || vd.preferred_wash_time || '8:00 AM',
                  society_id: vd.societyId || vd.society_id || 'soc_green_valley',
                  society_name: vd.societyName || vd.society_name || 'Green Valley Residency',
                  subscription_status: 'active',
                  washes_this_month: vd.washes_this_month || 0,
                  selected_plan: 'HOME BASIC',
                  assigned_washer_id: vd.assigned_washer_id || vd.washerId,
                  assigned_washer_name: vd.assigned_washer_name || vd.washerName,
                  signupDate: vd.signupDate || (vd.createdAt?.toDate ? vd.createdAt.toDate().toISOString().split('T')[0] : (typeof vd.createdAt === 'string' ? vd.createdAt.split('T')[0] : undefined)),
                  serviceStartDate: vd.serviceStartDate || (vd.subscriptionStartDate ? vd.subscriptionStartDate.split('T')[0] : undefined),
                  subscriptionStartDate: vd.subscriptionStartDate,
                  created_at: vd.createdAt?.toDate ? vd.createdAt.toDate().toISOString() : (typeof vd.createdAt === 'string' ? vd.createdAt : undefined),
                  washerLeaveDay: vd.washerLeaveDay || vd.washerWeeklyLeaveDay || vd.washer_leave_day,
                  washerWeeklyLeaveDay: vd.washerLeaveDay || vd.washerWeeklyLeaveDay || vd.washer_leave_day,
                  price: 0,
                  subscription_price: 0,
                });
              });
              if (loadedVehicles.length > 0) {
                setVehicles(loadedVehicles);
              }
            }
          }).catch((vErr) => {
            console.warn('Store owner vehicles Firestore notice:', vErr);
          });
        }
      }
    } catch (e) {
      console.warn('LocalStorage hydration notice:', e);
    } finally {
      setIsHydrated(true);
    }

    // Subscribe to Firebase Auth state to anchor identity to Firebase UID
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const uid = firebaseUser.uid;
        try {
          // Check role-based collections: Car_Owners, area_managers, Washers
          const ownerDoc = await getDoc(doc(db, 'Car_Owners', uid));
          if (ownerDoc.exists()) {
            const data = ownerDoc.data();
            setRoleState('owner');
            setUser((prev) => ({
              ...prev,
              id: uid,
              uid: uid,
              phone: firebaseUser.phoneNumber || data.phone || prev.phone,
              name: data.name || data.owner_name || prev.name,
              owner_name: data.name || data.owner_name || prev.name,
              role: 'owner',
              status: 'active',
            }));
            setIsLoggedIn(true);

            // Directly load this owner's vehicles from Firestore
            try {
              const vSnap = await getDocs(collection(db, 'Car_Owners', uid, 'Vehicles'));
              if (!vSnap.empty) {
                const loadedVehicles: Vehicle[] = [];
                vSnap.docs.forEach((d) => {
                  const vd = d.data();
                  loadedVehicles.push({
                    id: d.id,
                    owner_id: uid,
                    owner_name: data.name || data.owner_name || 'Vehicle Owner',
                    registration_number: vd.registrationNumber || vd.registration_number || '',
                    make: vd.make || '',
                    model: vd.model || '',
                    type: vd.type || 'car',
                    color: vd.color || 'Pearl White',
                    parking_location: vd.parkingLocation || vd.parking_location || 'Assigned Bay',
                    preferred_wash_time: vd.preferredWashTime || vd.preferred_wash_time || '8:00 AM',
                    society_id: vd.societyId || vd.society_id || 'soc_green_valley',
                    society_name: vd.societyName || vd.society_name || 'Green Valley Residency',
                    subscription_status: 'active',
                    washes_this_month: vd.washes_this_month || 0,
                    selected_plan: 'HOME BASIC',
                    assigned_washer_id: vd.assigned_washer_id || data.assignedWasherId,
                    assigned_washer_name: vd.assigned_washer_name || data.assignedWasherName,
                    price: 0,
                    subscription_price: 0,
                  });
                });
                if (loadedVehicles.length > 0) {
                  setVehicles(loadedVehicles);
                }
              }
            } catch (vErr) {
              console.warn('Error loading owner vehicles from Firestore in auth listener:', vErr);
            }
            return;
          }

          const adminDoc = await getDoc(doc(db, 'area_managers', uid));
          if (adminDoc.exists()) {
            const data = adminDoc.data();
            setRoleState('admin');
            setUser((prev) => ({
              ...prev,
              id: uid,
              uid: uid,
              phone: data.phoneNumber || data.phone_number || prev.phone,
              name: data.fullName || data.full_name || prev.name,
              owner_name: data.fullName || data.full_name || prev.name,
              role: 'admin',
              status: 'active',
            }));
            setIsLoggedIn(true);
            return;
          }

          const washerDoc = await getDoc(doc(db, 'Washers', uid));
          if (washerDoc.exists()) {
            const data = washerDoc.data();
            setRoleState('washer');
            setUser((prev) => ({
              ...prev,
              id: uid,
              uid: uid,
              phone: data.phone || prev.phone,
              name: data.name || prev.name,
              owner_name: data.name || prev.name,
              role: 'washer',
              status: 'active',
            }));
            setIsLoggedIn(true);
            return;
          }
        } catch (authErr) {
          console.warn('Error reading role document for authenticated user:', authErr);
        }
      }
    });

    // Initialize resilient upload queue count and wire change events
    setOfflineQueueCount(getPendingUploadsCount());
    const handleQueueChange = () => {
      setOfflineQueueCount(getPendingUploadsCount());
    };
    window.addEventListener('torque_upload_queue_changed', handleQueueChange);
    window.addEventListener('online', handleQueueChange);
    window.addEventListener('offline', handleQueueChange);

    return () => {
      unsubscribeAuth();
      window.removeEventListener('torque_upload_queue_changed', handleQueueChange);
      window.removeEventListener('online', handleQueueChange);
      window.removeEventListener('offline', handleQueueChange);
    };
  }, []);

  // Switch role helper with persona adjustment
  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (isDataErased || !isLoggedIn) {
      // Keep blank user if erased or not logged in
      return;
    }
    if (newRole === 'owner') {
      // Keep current owner if already set
      if (user.role !== 'owner' || user.id === 'usr_guest') {
        setUser(demoOwnerUser);
      }
    } else if (newRole === 'washer') {
      const savedWasherName = typeof window !== 'undefined' ? localStorage.getItem('torque_washer_name') : null;
      const savedWasherId = typeof window !== 'undefined' ? localStorage.getItem('torque_washer_id') : null;
      const savedWasherPhone = typeof window !== 'undefined' ? localStorage.getItem('torque_washer_phone') : null;
      setUser({
        id: savedWasherId || 'wsh_amit_1',
        name: savedWasherName || 'Amit Kumar',
        phone: savedWasherPhone || '+91 98100 12345',
        role: 'washer',
        avatar_url: '/images/washer_amit.jpg',
        status: 'active',
        created_at: '2025-06-10T00:00:00Z',
      });
    } else if (newRole === 'admin') {
      setUser({
        id: 'adm_ops_1',
        name: 'Torque Care Ops Team',
        phone: '+91 11 4000 5000',
        role: 'admin',
        status: 'active',
        created_at: '2025-01-01T00:00:00Z',
      });
    }
  };


  const addVehicle = (
    newVeh: Omit<Vehicle, 'id' | 'owner_id' | 'owner_name' | 'washes_this_month' | 'subscription_status'>
  ) => {
    const defaultPrice =
      newVeh.type === 'luxury' ? 799 : newVeh.type === 'suv' ? 649 : newVeh.type === 'bike' ? 399 : 499;
    const now = new Date();
    const signupYear = now.getFullYear();
    const signupMonth = String(now.getMonth() + 1).padStart(2, '0');
    const signupDay = String(now.getDate()).padStart(2, '0');
    const signupDateIso = `${signupYear}-${signupMonth}-${signupDay}`;

    const serviceStartDateIso = signupDateIso; // Care starts today upon signup

    const created: Vehicle = {
      ...newVeh,
      id: `veh_${Date.now()}`,
      owner_id: user.id,
      owner_name: user.name,
      subscription_status: 'active',
      washes_this_month: 0,
      signupDate: signupDateIso,
      serviceStartDate: serviceStartDateIso,
      subscriptionStartDate: (newVeh as any).subscriptionStartDate || now.toISOString(),
      created_at: now.toISOString(),
      selected_plan: newVeh.selected_plan || user.selected_plan || 'HOME BASIC',
      price: newVeh.price || defaultPrice,
      subscription_price: newVeh.subscription_price || defaultPrice,
    };
    setVehicles((prev) => [created, ...prev]);

    // Asynchronously sync vehicle to Firebase
    syncVehicleToFirestore(created).catch((err) => {
      console.warn('Firebase syncVehicle error:', err);
    });

    setNotifications((prev) => [
      {
        id: `notif_${Date.now()}`,
        title: 'Vehicle Added & Washer Assigned',
        body: `${created.make} ${created.model} (${created.registration_number}) has been added to ${created.society_name}. Route assignment active!`,
        timestamp: 'Just now',
        read: false,
        category: 'system',
      },
      ...prev,
    ]);
  };

  const registerOwner = async (
    ownerData: {
      id?: string;
      uid?: string;
      name: string;
      email?: string;
      phone: string;
      address?: string;
      flat?: string;
      flatNumber?: string;
      state?: string;
      city?: string;
      district?: string;
      society?: string;
      societyId?: string;
      societyName?: string;
      adminId?: string;
      assignedAdminId?: string;
      areaManagerId?: string;
      alt_phone?: string;
      selectedPlan?: string;
      selectedWasherId?: string;
      selectedWasherName?: string;
      price?: number;
      subscriptionPrice?: number;
      needWashBefore?: string;
      need_wash_before?: string;
      washerLeaveDay?: string;
      washerWeeklyLeaveDay?: string;
    },
    vehiclesList: Array<{
      make: string;
      model: string;
      registration_number: string;
      type: 'car' | 'suv' | 'luxury' | 'bike';
      color: string;
      parking_location: string;
      preferred_wash_time: string;
      society_id?: string;
      society_name?: string;
      assigned_washer_id?: string;
      assigned_washer_name?: string;
      adminId?: string;
      assignedAdminId?: string;
      flat?: string;
      flatNumber?: string;
      price?: number;
      subscription_price?: number;
      needWashBefore?: string;
      need_wash_before?: string;
      washerLeaveDay?: string;
      washerWeeklyLeaveDay?: string;
    }>
  ) => {
    // Primary Identity: Firebase Auth UID is canonical, fallback to phone primary UID
    const cleanPhoneDigits = (ownerData.phone || '').replace(/\D/g, '');
    const phonePrimaryUid = cleanPhoneDigits.length >= 10
      ? `+91${cleanPhoneDigits.slice(-10)}`
      : (ownerData.phone || `usr_${Date.now()}`);
    const newUserId = ownerData.uid || auth.currentUser?.uid || phonePrimaryUid;

    const getBodyTypePrice = (type?: string): number => {
      const t = (type || 'car').toLowerCase();
      if (t === 'luxury') return 799;
      if (t === 'suv') return 649;
      if (t === 'bike') return 399;
      return 499;
    };

    const calculatedTotal = vehiclesList.reduce(
      (sum, v) => sum + (v.price || v.subscription_price || getBodyTypePrice(v.type)),
      0
    );

    const finalPrice = ownerData.price || ownerData.subscriptionPrice || calculatedTotal || 499;

    const resolvedAdminId = ownerData.adminId || ownerData.assignedAdminId || '';

    const resolvedWasherLeaveDay =
      ownerData.washerLeaveDay || ownerData.washerWeeklyLeaveDay || '';

    const now = new Date();
    const signupYear = now.getFullYear();
    const signupMonth = String(now.getMonth() + 1).padStart(2, '0');
    const signupDay = String(now.getDate()).padStart(2, '0');
    const signupDateIso = `${signupYear}-${signupMonth}-${signupDay}`;

    // Service & recording starts today on signup date
    const serviceStartDateIso = signupDateIso;
    const tomorrowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    tomorrowDate.setHours(6, 0, 0, 0);
    const tomorrowIso = tomorrowDate.toISOString();

    const newUser: User = {
      id: newUserId,
      uid: newUserId,
      name: ownerData.name,
      owner_name: ownerData.name,
      email: ownerData.email,
      phone: ownerData.phone,
      phoneNumber: ownerData.phone,
      address: ownerData.address,
      flat: ownerData.flat || ownerData.flatNumber || ownerData.address,
      flatNumber: ownerData.flatNumber || ownerData.flat,
      state: ownerData.state,
      city: ownerData.city,
      district: (ownerData as any).district,
      society: ownerData.society,
      societyId: ownerData.societyId,
      societyName: ownerData.societyName || ownerData.society,
      adminId: resolvedAdminId,
      assignedAdminId: resolvedAdminId,
      areaManagerId: resolvedAdminId,
      selectedWasherId: ownerData.selectedWasherId,
      selectedWasherName: ownerData.selectedWasherName,
      alt_phone: ownerData.alt_phone,
      role: 'owner',
      status: 'active',
      created_at: now.toISOString(),
      signupDate: signupDateIso,
      serviceStartDate: serviceStartDateIso,
      assigned_washer_id: ownerData.selectedWasherId || '',
      assigned_washer_name: ownerData.selectedWasherName || '',
      needWashBefore: ownerData.needWashBefore || '8:00 AM',
      need_wash_before: ownerData.needWashBefore || '8:00 AM',
      washerLeaveDay: resolvedWasherLeaveDay,
      washerWeeklyLeaveDay: resolvedWasherLeaveDay,
      ...(ownerData.selectedPlan
        ? {
            selected_plan: ownerData.selectedPlan,
            price: finalPrice,
            subscription_price: finalPrice,
          }
        : {}),
    };

    setUser(newUser);
    setRole('owner');

    const createdVehicles: Vehicle[] = vehiclesList.map((v, index) => {
      const vPrice = v.price || v.subscription_price || getBodyTypePrice(v.type);
      const vLeaveDay =
        (v as any).washerLeaveDay || (v as any).washerWeeklyLeaveDay || resolvedWasherLeaveDay;
      return {
        id: `veh_${Date.now()}_${index}`,
        owner_id: newUserId,
        owner_name: ownerData.name,
        registration_number: v.registration_number,
        make: v.make,
        model: v.model,
        type: v.type,
        color: v.color || 'Pearl White',
        parking_location: v.parking_location || 'Assigned Bay',
        parking_floor: 'Basement 1',
        preferred_wash_time: (v as any).needWashBefore || (v as any).need_wash_before || v.preferred_wash_time || ownerData.needWashBefore || '8:00 AM',
        needWashBefore: (v as any).needWashBefore || (v as any).need_wash_before || ownerData.needWashBefore || '8:00 AM',
        need_wash_before: (v as any).needWashBefore || (v as any).need_wash_before || ownerData.needWashBefore || '8:00 AM',
        signupDate: signupDateIso,
        serviceStartDate: serviceStartDateIso,
        created_at: now.toISOString(),
        society_id: (v as any).society_id || ownerData.societyId || '',
        society_name: v.society_name || ownerData.societyName || ownerData.society || '',
        washes_this_month: 0,
        assigned_washer_id: (v as any).assigned_washer_id || ownerData.selectedWasherId || '',
        assigned_washer_name: (v as any).assigned_washer_name || ownerData.selectedWasherName || '',
        flat: v.flat || ownerData.flat || ownerData.flatNumber || ownerData.address,
        flatNumber: v.flatNumber || ownerData.flatNumber || ownerData.flat,
        adminId: v.adminId || ownerData.adminId || resolvedAdminId,
        assignedAdminId: v.assignedAdminId || ownerData.assignedAdminId || resolvedAdminId,
        areaManagerId: resolvedAdminId,
        washerLeaveDay: vLeaveDay,
        washerWeeklyLeaveDay: vLeaveDay,
        subscription_status: 'active' as const,
        ...(ownerData.selectedPlan
          ? {
              selected_plan: ownerData.selectedPlan,
              subscriptionStartDate: tomorrowIso,
              price: vPrice,
              subscription_price: vPrice,
            }
          : {}),
      };
    });

    setVehicles(createdVehicles);

    if (typeof window !== 'undefined') {
      localStorage.removeItem('torque_data_erased');
      localStorage.removeItem('torque_owner_reset');
      localStorage.setItem('torque_logged_in', 'true');
      localStorage.setItem('torque_owner_name', ownerData.name);
      localStorage.setItem('torque_owner_id', newUserId);
      localStorage.setItem('torque_owner_phone', newUser.phone);
      localStorage.setItem('torque_signup_date', signupDateIso);
      localStorage.setItem('torque_service_start_date', serviceStartDateIso);
      if (ownerData.selectedWasherName) {
        localStorage.setItem('torque_assigned_washer_name', ownerData.selectedWasherName);
      }
      if (ownerData.selectedWasherId) {
        localStorage.setItem('torque_assigned_washer_id', ownerData.selectedWasherId);
      }
      if (ownerData.societyId) {
        localStorage.setItem('torque_society_id', ownerData.societyId);
      }
      if (ownerData.societyName || ownerData.society) {
        localStorage.setItem('torque_society_name', ownerData.societyName || ownerData.society || '');
      }
      if (resolvedAdminId) {
        localStorage.setItem('torque_admin_id', resolvedAdminId);
      }
      if (ownerData.state) {
        localStorage.setItem('torque_owner_state', ownerData.state);
      }
      if (ownerData.city) {
        localStorage.setItem('torque_owner_city', ownerData.city);
      }
      if (ownerData.flat || ownerData.flatNumber) {
        localStorage.setItem('torque_owner_flat', ownerData.flat || ownerData.flatNumber || '');
      }
      if (ownerData.needWashBefore) {
        localStorage.setItem('torque_need_wash_before', ownerData.needWashBefore);
      }
      localStorage.setItem('torque_user', JSON.stringify(newUser));
      localStorage.removeItem('torque_vehicles');
    }
    setIsLoggedIn(true);
    setIsDataErased(false);

    // Requirement 3: If an Owner subscribes today, wash is effective from the next day onwards!
    // No today wash is generated; initial wash starts tomorrow morning.
    setWashes([]);

    // Reliably sync new owner & vehicles to Firebase
    try {
      await syncOwnerToFirestore(newUser, createdVehicles);
    } catch (err) {
      console.warn('Firebase syncOwner error:', err);
    }

    setNotifications((prev) => [
      {
        id: `notif_welcome_${Date.now()}`,
        title: `Welcome to Torque Care, ${ownerData.name}!`,
        body: `Your ${ownerData.selectedPlan || 'HOME BASIC'} plan is active with assigned partner ${ownerData.selectedWasherName || 'your assigned specialist'}. Morning care route active for ${createdVehicles.length} vehicle${createdVehicles.length > 1 ? 's' : ''}!`,
        timestamp: 'Just now',
        read: false,
        category: 'system',
      },
      ...prev,
    ]);
  };

  const eraseAllData = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('torque_data_erased', 'true');
      localStorage.setItem('torque_owner_reset', 'true');
      localStorage.removeItem('torque_logged_in');
      localStorage.removeItem('torque_vehicles');
      localStorage.removeItem('torque_washers');
      localStorage.removeItem('torque_user');
      localStorage.removeItem('torque_washes');
      localStorage.removeItem('torque_routestops');
    }
    setIsLoggedIn(false);
    setIsDataErased(true);
    setVehicles([]);
    setWashers([]);
    setWashes([]);
    setRouteStops([]);
    setUser({
      id: 'usr_guest',
      name: 'Unregistered User',
      phone: '',
      role: 'owner',
      status: 'active',
      created_at: new Date().toISOString(),
    });
    setWasherEarnings({
      total_earnings: 0,
      this_week: 0,
      available: 0,
      pending: 0,
      bank_account_last4: '4821',
      recent_payouts: [],
    });
    setNotifications([
      {
        id: `notif_erase_${Date.now()}`,
        title: 'All Data Erased',
        body: 'System data has been completely erased. Ready for sign up and onboarding with real test data.',
        timestamp: 'Just now',
        read: false,
        category: 'system',
      },
    ]);
  };

  const resetOwnerData = async () => {
    const currentOwnerId = user.id;
    const currentOwnerPhone = user.phone;

    if (typeof window !== 'undefined') {
      localStorage.removeItem('torque_logged_in');
      localStorage.removeItem('torque_vehicles');
      localStorage.removeItem('torque_user');
      localStorage.removeItem('torque_washes');
      localStorage.setItem('torque_owner_reset', 'true');
    }

    setIsLoggedIn(false);
    setVehicles([]);
    setUser({
      id: 'usr_guest',
      name: 'Unregistered Owner',
      phone: '',
      role: 'owner',
      status: 'active',
      created_at: new Date().toISOString(),
    });
    setWashes([]);
    setTravelBookings([]);
    setSundayRequestState({ status: 'idle' });
    setNotifications((prev) => [
      {
        id: `notif_owner_reset_${Date.now()}`,
        title: 'Owner Data Reset',
        body: 'Owner profile, garage vehicles, and wash history have been reset.',
        timestamp: 'Just now',
        read: false,
        category: 'system',
      },
      ...prev,
    ]);

    try {
      await resetOwnerFirestoreData(currentOwnerId, currentOwnerPhone);
    } catch (e) {
      console.warn('Firestore resetOwnerData notice:', e);
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('torque_logged_in');
      localStorage.removeItem('torque_user');
      localStorage.removeItem('torque_vehicles');
      localStorage.removeItem('torque_owner_name');
      localStorage.removeItem('torque_owner_id');
      localStorage.removeItem('torque_washer_id');
      localStorage.removeItem('torque_washer_phone');
      localStorage.removeItem('torque_washer_name');
      localStorage.removeItem('torque_washer_has_password');
      localStorage.removeItem('torque_washer_password_set');
      localStorage.removeItem('torque_admin_uid');
      localStorage.removeItem('torque_admin_email');
      localStorage.removeItem('torque_admin_profile_completed');
      localStorage.removeItem('torque_admin_name');
    }
    signOutFirebaseUser().catch((err) => console.warn('Sign out notice:', err));
    setIsLoggedIn(false);
    setRoleState('owner');
    setUser({
      id: 'usr_guest',
      name: 'Unregistered Owner',
      phone: '',
      role: 'owner',
      status: 'active',
      created_at: new Date().toISOString(),
    });
    setVehicles([]);
  };

  const resetToDemoData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('torque_data_erased');
      localStorage.removeItem('torque_owner_reset');
      localStorage.setItem('torque_logged_in', 'true');
      localStorage.setItem('torque_user', JSON.stringify(demoOwnerUser));
      localStorage.removeItem('torque_vehicles');
      localStorage.removeItem('torque_washers');
      localStorage.removeItem('torque_washes');
    }
    setIsLoggedIn(true);
    setIsDataErased(false);
    setVehicles(demoVehicles);
    setWashers(initialWasherPartners);
    setWashes(initialWashes);
    setRouteStops(initialRouteStops);
    setUser(demoOwnerUser);
    setWasherEarnings(initialEarnings);
    setNotifications(initialNotifications);
  };

  const onboardWasher = (washerData: {
    id?: string;
    washerFirebaseUID?: string;
    name: string;
    phone: string;
    email?: string;
    society?: string;
    societies?: string[];
    assignedCarsPerDay?: number;
    routeWindow?: string;
    aadhaarNumber: string;
    aadhaarPhotoUrl?: string;
    bankAccount?: string;
    ifscCode?: string;
    address?: string;
    createdBy?: string;
  }): WasherPartner => {
    const newId = washerData.id || washerData.washerFirebaseUID || `wsh_${Date.now()}`;
    const cleanPhone = washerData.phone.startsWith('+91')
      ? washerData.phone
      : `+91 ${washerData.phone.replace(/^\+91\s*/, '')}`;

    const assignedSocietiesList: string[] =
      washerData.societies && washerData.societies.length > 0
        ? washerData.societies
        : washerData.society
        ? washerData.society.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
    const joinedSocietiesStr = assignedSocietiesList.join(', ');

    const newPartner: WasherPartner = {
      id: newId,
      name: washerData.name,
      phone: cleanPhone,
      email: washerData.email?.toLowerCase().trim() || undefined,
      passwordSet: false,
      hasPassword: false,
      avatar: '/images/washer_amit.jpg',
      rating: '5.0',
      reviewsCount: 1,
      society: joinedSocietiesStr,
      societies: assignedSocietiesList,
      assignedCarsPerDay: washerData.assignedCarsPerDay || 30,
      routeWindow: washerData.routeWindow || '06:30 AM - 09:30 AM',
      avgTimePerCar: '5.5 mins',
      completionRate: '100%',
      totalLifetimeWashes: 0,
      status: 'Active on Route',
      kyc: 'Verified (Aadhaar & Police Clear)',
      aadhaarNumber: washerData.aadhaarNumber,
      aadhaarPhotoUrl: washerData.aadhaarPhotoUrl,
      aadhaarVerified: true,
      phoneVerified: true,
      bankAccount: washerData.bankAccount || 'State Bank of India •••• 9912',
      ifscCode: washerData.ifscCode || 'SBIN0001234',
      address: washerData.address || 'Assigned Society Quarter',
      absentThisMonth: 0,
      absentDates: [],
      leaveReason: 'Zero absences • New partner active with verified Aadhaar',
      backupWasherName: 'None Required',
      monthlyPayoutsGone: 0,
      pendingPayoutDue: 0,
      sundayBonusEarned: 0,
      disbursements: [],
      created_at: new Date().toISOString(),
      createdBy: washerData.createdBy || user?.id || 'admin-lead-1',
    };

    setWashers((prev) => [newPartner, ...prev]);

    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('torque_data_erased');
        localStorage.removeItem('torque_washers');
      } catch (storageErr) {}
    }

    setIsDataErased(false);

    // Asynchronously sync onboarded washer partner to Firebase Firestore
    syncWasherToFirestore(newPartner).catch((err) => {
      console.warn('Firebase syncWasher error:', err);
    });

    setNotifications((prev) => [
      {
        id: `notif_wsh_${Date.now()}`,
        title: 'Washer Partner Onboarded with Aadhaar ✓',
        body: `${newPartner.name} verified via UIDAI Aadhaar (${newPartner.aadhaarNumber}). Route assigned at ${newPartner.society}.`,
        timestamp: 'Just now',
        read: false,
        category: 'system',
      },
      ...prev,
    ]);

    return newPartner;
  };

  const setWasherPassword = (washerIdOrPhoneOrEmail: string, newPassword: string) => {
    const cleanLower = washerIdOrPhoneOrEmail.toLowerCase().trim();
    const cleanDigits = washerIdOrPhoneOrEmail.replace(/\D/g, '');
    const last10 = cleanDigits.slice(-10);

    setWashers((prev) =>
      prev.map((w) => {
        const wDigits = (w.phone || '').replace(/\D/g, '');
        const wEmail = (w.email || '').toLowerCase().trim();
        if (
          w.id === washerIdOrPhoneOrEmail ||
          (wEmail && wEmail === cleanLower) ||
          (last10 && wDigits.includes(last10))
        ) {
          return {
            ...w,
            password: newPassword,
            hasPassword: true,
          };
        }
        return w;
      })
    );


  };

  const dismissWasher = async (washerId: string, reason = 'Administrative dismissal'): Promise<boolean> => {
    const targetWasher = washers.find((w) => w.id === washerId);
    const washerName = targetWasher?.name || 'Washer Partner';

    // 1. Update local washer state
    setWashers((prev) =>
      prev.map((w) =>
        w.id === washerId
          ? {
              ...w,
              status: 'Dismissed',
              dismissalReason: reason,
              dismissedAt: new Date().toISOString(),
            }
          : w
      )
    );

    // 2. Mark route stops as needing reassignment
    setRouteStops((prev) =>
      prev.map((s) =>
        s.washer_id === washerId
          ? { ...s, washer_name: `${washerName} (Dismissed - Reassign)` }
          : s
      )
    );



    // 4. Sync dismissal to Firebase Firestore
    dismissWasherInFirestore(washerId, reason).catch((err) => {
      console.warn('Firebase dismissWasher error:', err);
    });

    // 5. Notify admin and system
    setNotifications((prev) => [
      {
        id: `notif_dismiss_${Date.now()}`,
        title: `Washer Partner Dismissed: ${washerName}`,
        body: `${washerName} has been relieved of duty (${reason}). Review and reassign their vehicles to another active partner.`,
        timestamp: 'Just now',
        read: false,
        category: 'system',
      },
      ...prev,
    ]);

    return true;
  };

  const reinstateWasher = async (washerId: string): Promise<boolean> => {
    const targetWasher = washers.find((w) => w.id === washerId);
    const washerName = targetWasher?.name || 'Washer Partner';

    setWashers((prev) =>
      prev.map((w) =>
        w.id === washerId
          ? {
              ...w,
              status: 'Active on Route',
              dismissalReason: undefined,
              dismissedAt: undefined,
            }
          : w
      )
    );



    reinstateWasherInFirestore(washerId).catch((err) => {
      console.warn('Firebase reinstateWasher error:', err);
    });

    setNotifications((prev) => [
      {
        id: `notif_reinstated_${Date.now()}`,
        title: `Washer Reinstated ✓: ${washerName}`,
        body: `${washerName} is restored to active status and available for route assignment.`,
        timestamp: 'Just now',
        read: false,
        category: 'system',
      },
      ...prev,
    ]);

    return true;
  };

  const deleteWasher = async (washerId: string): Promise<boolean> => {
    const targetWasher = washers.find((w) => w.id === washerId);
    const washerName = targetWasher?.name || 'Washer Partner';

    // 1. Remove from in-memory store
    setWashers((prev) => prev.filter((w) => w.id !== washerId));

    // 2. Remove from route stops
    setRouteStops((prev) =>
      prev.map((s) =>
        s.washer_id === washerId
          ? { ...s, washer_name: 'Unassigned', washer_id: '' }
          : s
      )
    );



    // 4. Delete from Firestore (Washers & washer_directory)
    deleteWasherInFirestore(washerId).catch((err) => {
      console.warn('Firebase deleteWasher error:', err);
    });

    // 5. Notify admin
    setNotifications((prev) => [
      {
        id: `notif_del_${Date.now()}`,
        title: `Washer Partner Deleted: ${washerName}`,
        body: `${washerName} record was removed from the database and local registry.`,
        timestamp: 'Just now',
        read: false,
        category: 'system',
      },
      ...prev,
    ]);

    return true;
  };

  const appointWasherToVehicle = async (
    vehicleId: string,
    washerId: string,
    ownerId?: string
  ): Promise<boolean> => {
    const targetWasher = washers.find((w) => w.id === washerId);
    const washerName = targetWasher?.name || 'Assigned Partner';

    // 1. Update vehicle state
    let targetPlate = '';
    let targetVehicleName = '';
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === vehicleId) {
          targetPlate = v.registration_number;
          targetVehicleName = `${v.make} ${v.model}`;
          return {
            ...v,
            assigned_washer_id: washerId,
            assigned_washer_name: washerName,
          };
        }
        return v;
      })
    );

    // 2. Update route stops state
    setRouteStops((prev) =>
      prev.map((s) => {
        if (s.vehicle_id === vehicleId) {
          return {
            ...s,
            washer_id: washerId,
            washer_name: washerName,
          };
        }
        return s;
      })
    );



    // 4. Sync appointment to Firestore
    const resolvedOwnerId = ownerId || user.id || (typeof window !== 'undefined' ? localStorage.getItem('torque_owner_id') || 'usr_guest' : 'usr_guest');
    appointWasherToVehicleInFirestore(resolvedOwnerId, vehicleId, washerId, washerName).catch((err) => {
      console.warn('Firebase appointWasher error:', err);
    });

    // 5. Send confirmation notification
    setNotifications((prev) => [
      {
        id: `notif_appoint_${Date.now()}`,
        title: `Washer Appointed ✓: ${washerName}`,
        body: `${washerName} has been appointed to care for ${targetPlate || 'Vehicle'} (${targetVehicleName || 'Customer Car'}).`,
        timestamp: 'Just now',
        read: false,
        category: 'system',
      },
      ...prev,
    ]);

    return true;
  };

  const verifyPhoneNumber = async (phone: string, otp: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return otp.trim().length === 4;
  };


  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const requestSundayWash = () => {
    setSundayRequestState({ status: 'searching' });
    setTimeout(() => {
      setSundayRequestState({
        status: 'confirmed',
        washerName: 'Amit Kumar',
        arrivalTime: '7:30 – 8:00 AM',
        price: 50,
      });

      setNotifications((prev) => [
        {
          id: `notif_sun_${Date.now()}`,
          title: '✓ Sunday Wash Confirmed',
          body: 'Amit Kumar will wash your Honda City on Sunday between 7:30 – 8:00 AM.',
          timestamp: 'Just now',
          read: false,
          category: 'sunday',
        },
        ...prev,
      ]);
    }, 2200);
  };

  const washerStartWash = (stopNumber: number) => {
    setRouteStops((prev) =>
      prev.map((s) => (s.stop_number === stopNumber ? { ...s, status: 'current' } : s))
    );
  };

  const washerCompleteWash = async (
    stopNumber: number,
    afterImg = '/images/honda_city_after.jpg'
  ) => {
    if (isOffline) {
      setOfflineQueueCount((c) => c + 1);
    }

    const now = new Date();
    const capturedIso = now.toISOString();
    const completedNowTime = now.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    setRouteStops((prev) => {
      const updated = prev.map((s) => {
        if (s.stop_number === stopNumber) {
          return {
            ...s,
            status: 'completed' as const,
            proof_photo: afterImg,
            completed_at: completedNowTime,
            captured_at: capturedIso,
          };
        }
        if (s.stop_number === stopNumber + 1 && s.status === 'pending') {
          return { ...s, status: 'current' as const };
        }
        return s;
      });
      return updated;
    });

    // Update earnings with actual stop payout
    const currentStop = routeStops.find((s) => s.stop_number === stopNumber);
    const stopPayout = currentStop?.payout_amount || 35;
    const activeWasherName = user?.name || (typeof window !== 'undefined' ? localStorage.getItem('torque_washer_name') : null) || 'Amit Kumar';
    const istInfo = getTodayISTDate();
    const washId = currentStop?.wash_id && !currentStop.wash_id.endsWith('_today')
      ? currentStop.wash_id
      : `wash_${currentStop?.vehicle_id || 'veh'}_${istInfo.dateIso}`;

    setWasherEarnings((prev) => ({
      ...prev,
      available: prev.available + stopPayout,
      this_week: prev.this_week + stopPayout,
      total_earnings: prev.total_earnings + stopPayout,
    }));

    const newWashRecord: WashRecord = {
      id: washId,
      vehicle_id: currentStop?.vehicle_id || 'veh_honda_city',
      vehicle_name: currentStop?.vehicle_name || 'Honda City',
      registration_number: currentStop?.registration_number || 'DL 01 AB 4291',
      parking_location: currentStop?.parking_location || 'Block B • Parking 42',
      washer_id: user?.id || 'wsh_amit_1',
      washer_name: activeWasherName,
      washer_avatar: user?.avatar_url || '/images/washer_amit.jpg',
      washer_rating: 4.9,
      status: 'completed',
      scheduled_date: istInfo.dateIso,
      scheduled_time: currentStop?.scheduled_time || '7:30 AM',
      started_at: '7:40 AM',
      completed_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      location_verified: true,
      after_photo: afterImg,
      captured_at: new Date().toISOString(),
      is_sunday_priority: false,
      is_backup_covered: Boolean(currentStop?.is_backup_covered),
      backup_washer_name: currentStop?.backup_washer_name || (currentStop?.is_backup_covered ? activeWasherName : undefined),
      original_washer_name: currentStop?.original_washer_name,
      original_washer_id: currentStop?.original_washer_id,
      offline_queued: isOffline,
    };

    setWashes((prev) => [newWashRecord, ...prev]);

    // Persist immediately to resilient offline upload queue and trigger background sync
    enqueueWashUpload(stopNumber, newWashRecord, currentStop?.owner_id);
    setOfflineQueueCount(getPendingUploadsCount());

    // Send owner notification
    setNotifications((prev) => [
      {
        id: `notif_wsh_${Date.now()}`,
        title: 'Wash completed ✓',
        body: `Your ${currentStop?.vehicle_name || 'Honda City'} was washed at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} by ${activeWasherName}. Verified photo attached.`,
        timestamp: 'Just now',
        read: false,
        category: 'wash',
      },
      ...prev,
    ]);
  };

  const washerReportUnavailable = (
    stopNumber: number,
    reason = 'Vehicle not at assigned parking bay',
    evidence = '/images/empty_parking_bay.jpg'
  ) => {
    const currentStop = routeStops.find((s) => s.stop_number === stopNumber);

    setRouteStops((prev) => {
      const updated = prev.map((s) => {
        if (s.stop_number === stopNumber) {
          return {
            ...s,
            status: 'vehicle_unavailable' as const,
            washer_present: true,
            service_possible: false,
            payout_protected: true,
            bay_empty_photo: evidence,
          };
        }
        if (s.stop_number === stopNumber + 1 && s.status === 'pending') {
          return { ...s, status: 'current' as const };
        }
        return s;
      });
      return updated;
    });

    // CRITICAL USER RULE:
    // Washer: Present ✓
    // Service: Not possible
    // Washer payout: Protected ✓
    // It should not be classified as a missed wash by the washer.
    const stopPayout = currentStop?.payout_amount || 20;
    setWasherEarnings((prev) => ({
      ...prev,
      available: prev.available + stopPayout,
      this_week: prev.this_week + stopPayout,
      total_earnings: prev.total_earnings + stopPayout,
    }));

    // Record in washes list
    const unavailWashRecord: WashRecord = {
      id: `wash_unavail_${Date.now()}`,
      vehicle_id: currentStop?.vehicle_id || 'veh_honda_city',
      vehicle_name: currentStop?.vehicle_name || 'Honda City',
      registration_number: currentStop?.registration_number || 'DL 01 AB 4291',
      parking_location: currentStop?.parking_location || 'Bay D-14',
      washer_id: 'wsh_amit_1',
      washer_name: 'Amit Kumar',
      washer_avatar: '/images/washer_amit.jpg',
      washer_rating: 4.9,
      status: 'vehicle_unavailable',
      outcome_label: 'Customer / Vehicle Unavailable',
      washer_present: true,
      service_possible: false,
      payout_protected: true,
      bay_empty_photo: evidence,
      scheduled_date: 'Today',
      scheduled_time: currentStop?.scheduled_time || '7:30 AM',
      completed_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      location_verified: true,
      is_sunday_priority: false,
      is_backup_covered: false,
      notes: 'Customer / Vehicle Unavailable. Washer reached assigned bay during scheduled window, but vehicle was not available. Washer present ✓. Service not possible. Washer payout protected ✓. Not classified as a missed wash by washer.',
    };

    setWashes((prev) => [unavailWashRecord, ...prev]);

    // Resilient offline queue persistence for empty bay proof
    enqueueWashUpload(stopNumber, unavailWashRecord, currentStop?.owner_id);
    setOfflineQueueCount(getPendingUploadsCount());

    // Send owner notification
    setNotifications((prev) => [
      {
        id: `notif_unavail_${Date.now()}`,
        title: 'Customer / Vehicle Unavailable',
        body: `Washer Amit Kumar reached your assigned parking bay (${currentStop?.parking_location || 'Bay D-14'}) at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, but vehicle was not parked. Verified empty bay photo recorded. Washer payout protected.`,
        timestamp: 'Just now',
        read: false,
        category: 'wash',
      },
      ...prev,
    ]);
  };

  const washerRequestLeave = (startDate: string, endDate: string, backupWasherId: string) => {
    const backupName = backupWasherId === 'wsh_rahul' ? 'Rahul' : backupWasherId === 'wsh_suresh' ? 'Suresh' : 'Vijay';
    setNotifications((prev) => [
      {
        id: `leave_${Date.now()}`,
        title: '✓ Leave Approved',
        body: `Your customers will be covered by ${backupName} from ${startDate} to ${endDate}.`,
        timestamp: 'Just now',
        read: false,
        category: 'system',
      },
      ...prev,
    ]);
    return true;
  };

  const withdrawEarnings = (amount: number) => {
    if (washerEarnings.available < amount) return false;
    const fee = 10;
    const net = amount - fee;
    setWasherEarnings((prev) => ({
      ...prev,
      available: prev.available - amount,
      recent_payouts: [
        {
          id: `po_${Date.now()}`,
          amount,
          fee,
          net,
          status: 'completed',
          date: 'Today',
          bank_last4: prev.bank_account_last4,
        },
        ...prev.recent_payouts,
      ],
    }));
    return true;
  };

  const resolveException = (id: string) => {
    setExceptions((prev) =>
      prev.map((e) => (e.id === id ? { ...e, resolved: true } : e))
    );
  };

  const toggleOffline = () => {
    setIsOffline((prev) => !prev);
  };

  const syncOfflineQueue = () => {
    setOfflineQueueCount(0);
    setWashes((prev) =>
      prev.map((w) => (w.offline_queued ? { ...w, offline_queued: false, location_verified: true } : w))
    );
  };

  const [travelBookings, setTravelBookings] = useState<TravelBooking[]>([
    {
      id: 'tb_jaipur_demo',
      vehicle_name: 'Honda City',
      registration_number: 'DL 01 AB 4291',
      destination_location: 'C-Scheme, Ashok Nagar, Jaipur',
      city: 'Jaipur',
      temporary_bay: 'Hotel Bay P-08',
      washer_name: 'Vikram Singh',
      washer_avatar: '/images/washer_amit.jpg',
      washer_rating: 4.9,
      start_date: '30 Sep',
      end_date: '12 Oct 2026',
      is_active: false,
      daily_rate: 39,
      booking_type: 'until_return',
      frequency: 'every_3_days',
      wash_count: 3,
      total_amount: 117,
    },
  ]);

  const createTravelBooking = (bookingData: Omit<TravelBooking, 'id' | 'is_active'>) => {
    const newBooking: TravelBooking = {
      ...bookingData,
      id: `tb_${Date.now()}`,
      is_active: true,
    };
    setTravelBookings((prev) => [newBooking, ...prev]);

    // Also add scheduled/active wash entry for vehicle history
    const newWash: WashRecord = {
      id: `wash_away_${Date.now()}`,
      vehicle_id: 'veh_honda_city',
      vehicle_name: bookingData.vehicle_name,
      registration_number: bookingData.registration_number,
      parking_location: `${bookingData.destination_location} • ${bookingData.temporary_bay}`,
      washer_id: `wsh_away_${Date.now()}`,
      washer_name: `${bookingData.washer_name} (Torque Partner)`,
      washer_avatar: bookingData.washer_avatar,
      washer_rating: bookingData.washer_rating,
      status: 'scheduled',
      scheduled_date: bookingData.start_date,
      scheduled_time: '7:30 PM',
      location_verified: true,
      service_type: 'away',
      city: bookingData.city,
      after_photo: '/images/honda_city_after.jpg',
      is_sunday_priority: false,
      is_backup_covered: false,
      notes: `Away Mode: Booked at ${bookingData.city} (${bookingData.booking_type === 'until_return' ? `Away until ${bookingData.end_date} • ${bookingData.frequency}` : 'One-time wash'}).`,
    };
    setWashes((prev) => [newWash, ...prev]);

    setNotifications((prev) => [
      {
        id: `notif_tb_${Date.now()}`,
        title: 'Away Mode Activated 📍🚗',
        body: `Your car will be cared for by ${bookingData.washer_name} in ${bookingData.city} until you return.`,
        timestamp: 'Just now',
        read: false,
        category: 'wash',
      },
      ...prev,
    ]);
  };

  const endTravelBooking = (id: string) => {
    setTravelBookings((prev) =>
      prev.map((tb) => (tb.id === id ? { ...tb, is_active: false } : tb))
    );
    setNotifications((prev) => [
      {
        id: `notif_tbdone_${Date.now()}`,
        title: 'Welcome Back! 🏠',
        body: 'Away Mode ended. Your regular Torque Care Home daily wash tracking has resumed seamlessly.',
        timestamp: 'Just now',
        read: false,
        category: 'wash',
      },
      ...prev,
    ]);
  };

  const createDetailBooking = (packageId: string, vehicleId: string, date: string, time: string) => {
    const pkg = detailPackages.find((p) => p.id === packageId) || detailPackages[0];
    const veh = vehicles.find((v) => v.id === vehicleId) || vehicles[0];
    const newWash: WashRecord = {
      id: `detail_${Date.now()}`,
      vehicle_id: veh.id,
      vehicle_name: `${veh.make} ${veh.model}`,
      registration_number: veh.registration_number,
      parking_location: veh.parking_location,
      washer_id: 'wsh_master_detailer',
      washer_name: 'Torque Studio Master Detailer',
      washer_avatar: '/images/washer_amit.jpg',
      washer_rating: 5.0,
      status: 'scheduled',
      scheduled_date: date,
      scheduled_time: time,
      location_verified: true,
      service_type: 'detail',
      city: 'Delhi',
      notes: `Torque Care Detail: ${pkg.name} (${pkg.duration}). Includes: ${pkg.features.join(', ')}.`,
      after_photo: '/images/hero_car.jpg',
      is_sunday_priority: false,
      is_backup_covered: false,
    };
    setWashes((prev) => [newWash, ...prev]);
    setNotifications((prev) => [
      {
        id: `notif_det_${Date.now()}`,
        title: 'Torque Care Detail Confirmed ✨',
        body: `${pkg.name} scheduled for ${veh.make} ${veh.model} on ${date} at ${time}.`,
        timestamp: 'Just now',
        read: false,
        category: 'wash',
      },
      ...prev,
    ]);
  };

  const todayWash = washes.find((w) => isWashFromToday(w));

  return (
    <StoreContext.Provider
      value={{
        role,
        setRole,
        user,
        setUser,
        vehicles,
        setVehicles,
        addVehicle,
        registerOwner,
        washes,
        todayWash,
        routeStops,
        setRouteStops,
        washers,
        setWashers,
        onboardWasher,
        setWasherPassword,
        dismissWasher,
        reinstateWasher,
        deleteWasher,
        appointWasherToVehicle,
        eraseAllData,
        resetOwnerData,
        resetToDemoData,
        isDataErased,
        verifyPhoneNumber,
        washerEarnings,
        setWasherEarnings,
        societies,
        exceptions,
        notifications,
        markNotificationRead,
        sundayRequestState,
        requestSundayWash,
        washerStartWash,
        washerCompleteWash,
        washerReportUnavailable,
        washerRequestLeave,
        withdrawEarnings,
        resolveException,
        isOffline,
        toggleOffline,
        offlineQueueCount,
        syncOfflineQueue,
        travelBookings,
        createTravelBooking,
        endTravelBooking,
        detailPackages,
        createDetailBooking,
        isLoggedIn,
        setIsLoggedIn,
        isHydrated,
        logout,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
