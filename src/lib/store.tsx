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
} from './firebaseService';
import { WasherPartner, initialWasherPartners } from './washerPartners';

interface StoreContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  user: User;
  setUser: (user: User) => void;
  vehicles: Vehicle[];
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'owner_id' | 'owner_name' | 'washes_this_month' | 'subscription_status'>) => void;
  registerOwner: (
    ownerData: { name: string; phone: string; address?: string; alt_phone?: string },
    vehiclesList: Array<{
      make: string;
      model: string;
      registration_number: string;
      type: 'car' | 'suv' | 'bike';
      color: string;
      parking_location: string;
      preferred_wash_time: string;
      society_name?: string;
    }>
  ) => void;
  washes: WashRecord[];
  todayWash: WashRecord | undefined;
  routeStops: RouteStop[];
  washers: WasherPartner[];
  onboardWasher: (washerData: {
    name: string;
    phone: string;
    society: string;
    assignedCarsPerDay?: number;
    routeWindow?: string;
    aadhaarNumber: string;
    aadhaarPhotoUrl?: string;
    bankAccount?: string;
    ifscCode?: string;
    address?: string;
  }) => WasherPartner;
  eraseAllData: () => void;
  resetToDemoData: () => void;
  isDataErased: boolean;
  verifyPhoneNumber: (phone: string, otp: string) => Promise<boolean>;
  washerEarnings: WasherEarnings;
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
  washerCompleteWash: (stopNumber: number, beforeImg?: string, afterImg?: string) => void;
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
}


const defaultUser: User = {
  id: 'usr_pranav_1',
  name: 'Pranav Ghosh',
  phone: '+91 98765 43210',
  email: 'pranav@example.com',
  role: 'owner',
  status: 'active',
  created_at: '2026-01-15T00:00:00Z',
};

const initialVehicles: Vehicle[] = [
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

const initialRouteStops: RouteStop[] = [
  {
    stop_number: 1,
    wash_id: 'wsh_route_1',
    vehicle_id: 'v_1',
    vehicle_name: 'Honda City',
    registration_number: 'DL 01 AB 4291',
    parking_location: 'Block B • Parking 42',
    scheduled_time: '07:30 AM',
    status: 'completed',
    owner_name: 'Pranav Ghosh',
    owner_phone: '+91 98765 43210',
    payout_amount: 20,
    society_name: 'Green Valley Residency',
    proof_photo: '/images/honda_city_after.jpg',
  },
  {
    stop_number: 2,
    wash_id: 'wsh_route_2',
    vehicle_id: 'v_2',
    vehicle_name: 'Hyundai Creta',
    registration_number: 'DL 04 EF 2281',
    parking_location: 'Block B • Parking 45',
    scheduled_time: '07:45 AM',
    status: 'completed',
    owner_name: 'Ananya Sharma',
    owner_phone: '+91 98111 22334',
    payout_amount: 20,
    society_name: 'Green Valley Residency',
    proof_photo: '/images/creta_after.jpg',
  },
  {
    stop_number: 3,
    wash_id: 'wsh_route_3',
    vehicle_id: 'v_3',
    vehicle_name: 'Maruti Swift',
    registration_number: 'DL 09 PQ 9821',
    parking_location: 'Block B • Parking 48',
    scheduled_time: '08:00 AM',
    status: 'completed',
    owner_name: 'Vikram Mehta',
    owner_phone: '+91 99223 34455',
    payout_amount: 20,
    society_name: 'Green Valley Residency',
    proof_photo: '/images/hero_car.jpg',
  },
  {
    stop_number: 4,
    wash_id: 'wsh_route_4',
    vehicle_id: 'v_4',
    vehicle_name: 'Tata Nexon',
    registration_number: 'DL 02 ZB 5512',
    parking_location: 'Block B • Parking 50',
    scheduled_time: '08:15 AM',
    status: 'completed',
    owner_name: 'Rohan Gupta',
    owner_phone: '+91 98711 00223',
    payout_amount: 20,
    society_name: 'Green Valley Residency',
    proof_photo: '/images/creta_after.jpg',
  },
  {
    stop_number: 5,
    wash_id: 'wsh_route_5',
    vehicle_id: 'v_5',
    vehicle_name: 'Kia Seltos',
    registration_number: 'HR 26 AK 1190',
    parking_location: 'Block B • Parking 52',
    scheduled_time: '08:30 AM',
    status: 'completed',
    owner_name: 'Pooja Verma',
    owner_phone: '+91 98100 44556',
    payout_amount: 20,
    society_name: 'Green Valley Residency',
    proof_photo: '/images/honda_city_after.jpg',
  },
  {
    stop_number: 6,
    wash_id: 'wsh_route_6',
    vehicle_id: 'v_6',
    vehicle_name: 'Toyota Fortuner',
    registration_number: 'UP 16 AX 8800',
    parking_location: 'Block C • Parking 04',
    scheduled_time: '08:45 AM',
    status: 'completed',
    owner_name: 'Col. Rajesh Singh',
    owner_phone: '+91 97112 33445',
    payout_amount: 25,
    society_name: 'Green Valley Residency',
    proof_photo: '/images/hero_car.jpg',
  },
  {
    stop_number: 7,
    wash_id: 'wsh_route_7',
    vehicle_id: 'v_7',
    vehicle_name: 'Mahindra XUV700',
    registration_number: 'DL 10 CP 3491',
    parking_location: 'Block C • Parking 08',
    scheduled_time: '09:00 AM',
    status: 'completed',
    owner_name: 'Sameer Sen',
    owner_phone: '+91 99990 11223',
    payout_amount: 25,
    society_name: 'Palm Residency',
    proof_photo: '/images/creta_after.jpg',
  },
  {
    stop_number: 8,
    wash_id: 'wsh_route_8',
    vehicle_id: 'v_8',
    vehicle_name: 'Honda Elevate',
    registration_number: 'DL 05 TR 7721',
    parking_location: 'Block C • Parking 12',
    scheduled_time: '09:15 AM',
    status: 'completed',
    owner_name: 'Divya Rao',
    owner_phone: '+91 98450 99887',
    payout_amount: 20,
    society_name: 'Palm Residency',
    proof_photo: '/images/honda_city_after.jpg',
  },
  {
    stop_number: 9,
    wash_id: 'wsh_route_9',
    vehicle_id: 'v_9',
    vehicle_name: 'BMW 3 Series',
    registration_number: 'DL 01 ZZ 0007',
    parking_location: 'Block C • Parking 21',
    scheduled_time: '09:30 AM',
    status: 'current',
    owner_name: 'Aditya Kapoor',
    owner_phone: '+91 98111 88899',
    payout_amount: 30,
    society_name: 'Palm Residency',
    notes: 'Covered parking bay. Customer requested tire dressing extra.',
  },
  {
    stop_number: 10,
    wash_id: 'wsh_route_10',
    vehicle_id: 'v_10',
    vehicle_name: 'Volkswagen Taigun',
    registration_number: 'DL 03 YK 4421',
    parking_location: 'Block C • Parking 25',
    scheduled_time: '09:45 AM',
    status: 'pending',
    owner_name: 'Neha Chawla',
    owner_phone: '+91 98223 44556',
    payout_amount: 20,
    society_name: 'Sunrise Heights',
  },
  {
    stop_number: 11,
    wash_id: 'wsh_route_11',
    vehicle_id: 'v_11',
    vehicle_name: 'Hyundai Verna',
    registration_number: 'DL 08 BL 6612',
    parking_location: 'Block D • Parking 02',
    scheduled_time: '10:00 AM',
    status: 'pending',
    owner_name: 'Karan Malhotra',
    owner_phone: '+91 99100 12345',
    payout_amount: 20,
    society_name: 'Sunrise Heights',
  },
  {
    stop_number: 12,
    wash_id: 'wsh_route_12',
    vehicle_id: 'v_12',
    vehicle_name: 'Skoda Kushaq',
    registration_number: 'DL 07 MN 3311',
    parking_location: 'Block D • Parking 08',
    scheduled_time: '10:15 AM',
    status: 'pending',
    owner_name: 'Shreya Patel',
    owner_phone: '+91 98334 55667',
    payout_amount: 20,
    society_name: 'Sunrise Heights',
  },
];

const initialEarnings: WasherEarnings = {
  total_earnings: 18420,
  this_week: 2840,
  available: 1940,
  pending: 900,
  bank_account_last4: '4821',
  recent_payouts: [
    {
      id: 'po_01',
      amount: 2840,
      fee: 10,
      net: 2830,
      status: 'completed',
      date: '20 Sep 2026',
      bank_last4: '4821',
    },
    {
      id: 'po_02',
      amount: 3100,
      fee: 10,
      net: 3090,
      status: 'completed',
      date: '13 Sep 2026',
      bank_last4: '4821',
    },
  ],
};

const initialSocieties: Society[] = [
  {
    id: 'soc_green_valley',
    name: 'Green Valley Residency',
    address: 'Sector 48, Gurgaon',
    city: 'Gurgaon',
    total_vehicles: 100,
    active_washers: 3,
    daily_capacity: 120,
    today_completion_rate: 91,
    status_indicator: 'green',
    completed_count: 91,
    total_today: 100,
  },
  {
    id: 'soc_palm_residency',
    name: 'Palm Residency',
    address: 'Golf Course Extension Road',
    city: 'Gurgaon',
    total_vehicles: 88,
    active_washers: 3,
    daily_capacity: 105,
    today_completion_rate: 84,
    status_indicator: 'green',
    completed_count: 84,
    total_today: 100,
  },
  {
    id: 'soc_sunrise_heights',
    name: 'Sunrise Heights',
    address: 'Sector 56, Gurgaon',
    city: 'Gurgaon',
    total_vehicles: 65,
    active_washers: 2,
    daily_capacity: 70,
    today_completion_rate: 63,
    status_indicator: 'yellow',
    completed_count: 63,
    total_today: 100,
  },
  {
    id: 'soc_metro_homes',
    name: 'Metro Homes',
    address: 'Sector 72, Gurgaon',
    city: 'Gurgaon',
    total_vehicles: 50,
    active_washers: 1,
    daily_capacity: 35,
    today_completion_rate: 42,
    status_indicator: 'red',
    completed_count: 42,
    total_today: 100,
  },
];

const initialExceptions: ExceptionItem[] = [
  {
    id: 'exc_1',
    type: 'missed_wash',
    title: '12 Missed Washes Alert',
    description: 'Metro Homes Block C washer reported delayed route due to water pressure shutoff.',
    society: 'Metro Homes',
    vehicle: '12 vehicles affected',
    washer: 'Dinesh Kumar',
    time: '8:15 AM',
    resolved: false,
  },
  {
    id: 'exc_2',
    type: 'washer_unavailable',
    title: '7 Washer Unavailable Attempts',
    description: 'Owners parked in visitor zone without updating parking bay in app.',
    society: 'Sunrise Heights',
    vehicle: 'DL 04 KL 1122 and 6 others',
    washer: 'Suresh Verma',
    time: '7:50 AM',
    resolved: false,
  },
  {
    id: 'exc_3',
    type: 'customer_complaint',
    title: '4 Customer Inquiries / Complaints',
    description: 'Owner noted windshield had smudge marks after heavy dust storm.',
    society: 'Palm Residency',
    vehicle: 'HR 26 DQ 7891 (Creta)',
    washer: 'Vijay Pal',
    time: '8:45 AM',
    resolved: false,
  },
  {
    id: 'exc_4',
    type: 'replacement_required',
    title: '3 Washer Replacements Required',
    description: 'Washer on medical emergency leave; auto-backup assigned to Rahul.',
    society: 'Green Valley',
    vehicle: 'Route 3 (33 vehicles)',
    washer: 'Ramesh Singh -> Backup Rahul',
    time: '6:30 AM',
    resolved: true,
  },
];

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
      setIsDataErased(erased);

      if (erased) {
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
      } else {
        const savedWashers = localStorage.getItem('torque_washers');
        if (savedWashers) {
          const parsed = JSON.parse(savedWashers);
          if (Array.isArray(parsed)) setWashers(parsed);
        }
        const savedVehicles = localStorage.getItem('torque_vehicles');
        if (savedVehicles) {
          const parsed = JSON.parse(savedVehicles);
          if (Array.isArray(parsed)) setVehicles(parsed);
        }
        const savedUser = localStorage.getItem('torque_user');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          if (parsed?.id) setUser(parsed);
        }
      }
    } catch (e) {
      console.warn('LocalStorage hydration notice:', e);
    }
  }, []);

  // Switch role helper with persona adjustment
  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (isDataErased) {
      // Keep blank user if erased
      return;
    }
    if (newRole === 'owner') {
      setUser({
        id: 'usr_pranav_1',
        name: 'Pranav Ghosh',
        phone: '+91 98765 43210',
        role: 'owner',
        status: 'active',
        created_at: '2026-01-15T00:00:00Z',
      });
    } else if (newRole === 'washer') {
      setUser({
        id: 'wsh_amit_1',
        name: 'Amit Kumar',
        phone: '+91 98100 12345',
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
    const created: Vehicle = {
      ...newVeh,
      id: `veh_${Date.now()}`,
      owner_id: user.id,
      owner_name: user.name,
      subscription_status: 'active',
      washes_this_month: 0,
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

  const registerOwner = (
    ownerData: { name: string; phone: string; address?: string; alt_phone?: string },
    vehiclesList: Array<{
      make: string;
      model: string;
      registration_number: string;
      type: 'car' | 'suv' | 'bike';
      color: string;
      parking_location: string;
      preferred_wash_time: string;
      society_name?: string;
    }>
  ) => {
    const newUserId = `usr_${Date.now()}`;
    const newUser: User = {
      id: newUserId,
      name: ownerData.name,
      phone: ownerData.phone,
      address: ownerData.address,
      alt_phone: ownerData.alt_phone,
      role: 'owner',
      status: 'active',
      created_at: new Date().toISOString(),
    };

    setUser(newUser);
    setRole('owner');

    const createdVehicles: Vehicle[] = vehiclesList.map((v, index) => ({
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
      preferred_wash_time: v.preferred_wash_time || '07:30 AM',
      society_id: 'soc_green_valley',
      society_name: v.society_name || 'Green Valley Residency',
      subscription_status: 'active',
      washes_this_month: 0,
    }));

    setVehicles(createdVehicles);

    if (typeof window !== 'undefined') {
      localStorage.removeItem('torque_data_erased');
      localStorage.setItem('torque_user', JSON.stringify(newUser));
      localStorage.setItem('torque_vehicles', JSON.stringify(createdVehicles));
    }
    setIsDataErased(false);

    // Add route stops for the registered vehicles
    const newStops: RouteStop[] = createdVehicles.map((cv, idx) => ({
      stop_number: (routeStops.length || 0) + idx + 1,
      vehicle_id: cv.id,
      vehicle_name: `${cv.make} ${cv.model}`,
      registration_number: cv.registration_number,
      parking_location: cv.parking_location,
      time_window: cv.preferred_wash_time || '07:30 AM',
      owner_name: cv.owner_name,
      owner_phone: newUser.phone,
      wash_type: 'exterior',
      status: 'pending',
    }));
    setRouteStops((prev) => [...prev, ...newStops]);

    // Asynchronously sync new owner & vehicles to Firebase
    syncOwnerToFirestore(newUser, createdVehicles).catch((err) => {
      console.warn('Firebase syncOwner error:', err);
    });

    setNotifications((prev) => [
      {
        id: `notif_welcome_${Date.now()}`,
        title: `Welcome to Torque Care, ${ownerData.name}!`,
        body: `Your account and ${createdVehicles.length} vehicle${createdVehicles.length > 1 ? 's' : ''} have been registered. Verified morning care route active!`,
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
      localStorage.removeItem('torque_vehicles');
      localStorage.removeItem('torque_washers');
      localStorage.removeItem('torque_user');
      localStorage.removeItem('torque_washes');
      localStorage.removeItem('torque_routestops');
    }
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
      today_count: 0,
      today_estimated_earnings: 0,
      weekly_total: 0,
      sunday_priority_count: 0,
      sunday_earnings: 0,
      available_for_withdrawal: 0,
      streak_days: 0,
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

  const resetToDemoData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('torque_data_erased');
      localStorage.removeItem('torque_vehicles');
      localStorage.removeItem('torque_washers');
      localStorage.removeItem('torque_user');
      localStorage.removeItem('torque_washes');
    }
    setIsDataErased(false);
    setVehicles(initialVehicles);
    setWashers(initialWasherPartners);
    setWashes(initialWashes);
    setRouteStops(initialRouteStops);
    setUser(defaultUser);
    setWasherEarnings(initialEarnings);
    setNotifications(initialNotifications);
  };

  const onboardWasher = (washerData: {
    name: string;
    phone: string;
    society: string;
    assignedCarsPerDay?: number;
    routeWindow?: string;
    aadhaarNumber: string;
    aadhaarPhotoUrl?: string;
    bankAccount?: string;
    ifscCode?: string;
    address?: string;
  }): WasherPartner => {
    const newId = `wsh_${Date.now()}`;
    const cleanPhone = washerData.phone.startsWith('+91')
      ? washerData.phone
      : `+91 ${washerData.phone.replace(/^\+91\s*/, '')}`;

    const newPartner: WasherPartner = {
      id: newId,
      name: washerData.name,
      phone: cleanPhone,
      avatar: '/images/washer_amit.jpg',
      rating: '5.0',
      reviewsCount: 1,
      society: washerData.society || 'Green Valley Residency',
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
    };

    setWashers((prev) => {
      const updated = [newPartner, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('torque_washers', JSON.stringify(updated));
        localStorage.removeItem('torque_data_erased');
      }
      return updated;
    });

    setIsDataErased(false);

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
          body: 'Amit Kumar will wash your Honda City on Sunday between 7:30 – 8:00 AM (Priority ₹50).',
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

  const washerCompleteWash = (
    stopNumber: number,
    beforeImg = '/images/honda_city_before.jpg',
    afterImg = '/images/honda_city_after.jpg'
  ) => {
    if (isOffline) {
      setOfflineQueueCount((c) => c + 1);
    }

    setRouteStops((prev) => {
      const updated = prev.map((s) => {
        if (s.stop_number === stopNumber) {
          return { ...s, status: 'completed' as const, proof_photo: afterImg };
        }
        if (s.stop_number === stopNumber + 1 && s.status === 'pending') {
          return { ...s, status: 'current' as const };
        }
        return s;
      });
      return updated;
    });

    // Update earnings
    setWasherEarnings((prev) => ({
      ...prev,
      available: prev.available + 20,
      this_week: prev.this_week + 20,
      total_earnings: prev.total_earnings + 20,
    }));

    const newWashRecord: WashRecord = {
      id: `wash_live_${Date.now()}`,
      vehicle_id: 'veh_honda_city',
      vehicle_name: 'Honda City',
      registration_number: 'DL 01 AB 4291',
      parking_location: 'Block B • Parking 42',
      washer_id: 'wsh_amit_1',
      washer_name: 'Amit Kumar',
      washer_avatar: '/images/washer_amit.jpg',
      washer_rating: 4.9,
      status: 'completed',
      scheduled_date: 'Today',
      scheduled_time: '7:30 AM',
      started_at: '7:40 AM',
      completed_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      location_verified: true,
      latitude: 28.5355,
      longitude: 77.3910,
      before_photo: beforeImg,
      after_photo: afterImg,
      is_sunday_priority: false,
      is_backup_covered: false,
      offline_queued: isOffline,
    };

    setWashes((prev) => [newWashRecord, ...prev]);

    // Asynchronously sync wash record to Firebase
    syncWashRecordToFirestore(newWashRecord).catch((err) => {
      console.warn('Firebase syncWashRecord error:', err);
    });

    // Send owner notification
    setNotifications((prev) => [
      {
        id: `notif_wsh_${Date.now()}`,
        title: 'Wash completed ✓',
        body: `Your Honda City was washed at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} by Amit Kumar. Verified photo attached.`,
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
    setWashes((prev) => [
      {
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
      },
      ...prev,
    ]);

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
        body: 'Away Mode ended. Your regular Torque Care Home subscription (₹599/mo) has resumed seamlessly.',
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

  const todayWash = washes.find((w) => w.scheduled_date === '06 Oct' && w.status === 'completed');

  return (
    <StoreContext.Provider
      value={{
        role,
        setRole,
        user,
        setUser,
        vehicles,
        addVehicle,
        registerOwner,
        washes,
        todayWash,
        routeStops,
        washers,
        onboardWasher,
        eraseAllData,
        resetToDemoData,
        isDataErased,
        verifyPhoneNumber,
        washerEarnings,
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
