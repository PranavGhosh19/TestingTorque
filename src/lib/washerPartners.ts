export interface PayoutDisbursement {
  id: string;
  date: string;
  utr: string;
  bankAccount: string;
  grossAmount: number;
  fee: number;
  netAmount: number;
  type: 'Weekly Auto-Disbursement' | 'Instant On-Demand';
  status: 'Settled' | 'Processing';
}

export interface WasherPartner {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  rating: string;
  reviewsCount: number;
  society: string;
  assignedCarsPerDay: number;
  routeWindow: string;
  avgTimePerCar: string;
  completionRate: string;
  totalLifetimeWashes: number;
  status: 'Active on Route' | 'Available Backup';
  kyc: string;
  aadhaarNumber?: string;
  aadhaarPhotoUrl?: string;
  aadhaarVerified?: boolean;
  phoneVerified?: boolean;
  bankAccount?: string;
  ifscCode?: string;
  address?: string;
  absentThisMonth: number;
  absentDates: string[];
  leaveReason: string;
  backupWasherName: string;
  monthlyPayoutsGone: number;
  pendingPayoutDue: number;
  availableBalance?: number;
  availableEarnings?: number;
  weeklyEarnings?: number;
  totalEarnings?: number;
  sundayBonusEarned: number;
  disbursements: PayoutDisbursement[];
  created_at?: string;
}


export const washerPartners: WasherPartner[] = [
  {
    id: 'wsh_amit',
    name: 'Amit Kumar',
    phone: '+91 98101 22334',
    avatar: '/images/washer_amit.jpg',
    rating: '4.9',
    reviewsCount: 312,
    society: 'Green Valley Residency',
    assignedCarsPerDay: 34,
    routeWindow: '06:30 AM - 09:30 AM',
    avgTimePerCar: '5.8 mins',
    completionRate: '99.2%',
    totalLifetimeWashes: 1240,
    status: 'Active on Route',
    kyc: 'Verified (Aadhaar & Police Clear)',
    aadhaarNumber: '4821 9912 3410',
    aadhaarVerified: true,
    phoneVerified: true,
    bankAccount: 'HDFC Bank •••• 4021',
    ifscCode: 'HDFC0001234',
    address: 'B-12, Sector 4, Noida',
    absentThisMonth: 1,
    absentDates: ['14 Sep 2026'],
    leaveReason: 'Family emergency • Peer backup coverage assigned to Suresh Verma (0 missed customer washes)',
    backupWasherName: 'Suresh Verma',
    monthlyPayoutsGone: 18480,
    pendingPayoutDue: 1940,
    sundayBonusEarned: 3200,
    disbursements: [
      {
        id: 'disb_1',
        date: '28 Sep 2026, 09:00 AM',
        utr: 'CMS260928987112',
        bankAccount: 'HDFC Bank •••• 4021',
        grossAmount: 4620,
        fee: 0,
        netAmount: 4620,
        type: 'Weekly Auto-Disbursement',
        status: 'Settled',
      },
      {
        id: 'disb_2',
        date: '21 Sep 2026, 09:00 AM',
        utr: 'CMS260921876543',
        bankAccount: 'HDFC Bank •••• 4021',
        grossAmount: 4620,
        fee: 0,
        netAmount: 4620,
        type: 'Weekly Auto-Disbursement',
        status: 'Settled',
      },
      {
        id: 'disb_3',
        date: '14 Sep 2026, 09:00 AM',
        utr: 'CMS260914765432',
        bankAccount: 'HDFC Bank •••• 4021',
        grossAmount: 4620,
        fee: 0,
        netAmount: 4620,
        type: 'Weekly Auto-Disbursement',
        status: 'Settled',
      },
      {
        id: 'disb_4',
        date: '07 Sep 2026, 09:00 AM',
        utr: 'CMS260907654321',
        bankAccount: 'HDFC Bank •••• 4021',
        grossAmount: 4620,
        fee: 0,
        netAmount: 4620,
        type: 'Weekly Auto-Disbursement',
        status: 'Settled',
      },
    ],
  },
];

export const initialWasherPartners: WasherPartner[] = [...washerPartners];

export function getWasherById(id: string): WasherPartner | undefined {
  return washerPartners.find((w) => w.id === id);
}

