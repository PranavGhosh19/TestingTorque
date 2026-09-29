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
  absentThisMonth: number;
  absentDates: string[];
  leaveReason: string;
  backupWasherName: string;
  monthlyPayoutsGone: number;
  pendingPayoutDue: number;
  sundayBonusEarned: number;
  disbursements: PayoutDisbursement[];
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
  {
    id: 'wsh_rahul',
    name: 'Rahul Sharma',
    phone: '+91 98222 33445',
    avatar: '/images/washer_amit.jpg',
    rating: '4.8',
    reviewsCount: 245,
    society: 'Green Valley Residency',
    assignedCarsPerDay: 33,
    routeWindow: '06:45 AM - 09:45 AM',
    avgTimePerCar: '6.0 mins',
    completionRate: '98.8%',
    totalLifetimeWashes: 980,
    status: 'Active on Route',
    kyc: 'Verified (Aadhaar & Police Clear)',
    absentThisMonth: 0,
    absentDates: [],
    leaveReason: 'Zero absences this month (Qualified for Monthly Perfect Attendance Bonus)',
    backupWasherName: 'None Required',
    monthlyPayoutsGone: 19140,
    pendingPayoutDue: 2100,
    sundayBonusEarned: 3300,
    disbursements: [
      {
        id: 'disb_r1',
        date: '28 Sep 2026, 09:00 AM',
        utr: 'CMS260928771190',
        bankAccount: 'State Bank of India •••• 1189',
        grossAmount: 4785,
        fee: 0,
        netAmount: 4785,
        type: 'Weekly Auto-Disbursement',
        status: 'Settled',
      },
      {
        id: 'disb_r2',
        date: '21 Sep 2026, 09:00 AM',
        utr: 'CMS260921662281',
        bankAccount: 'State Bank of India •••• 1189',
        grossAmount: 4785,
        fee: 0,
        netAmount: 4785,
        type: 'Weekly Auto-Disbursement',
        status: 'Settled',
      },
      {
        id: 'disb_r3',
        date: '14 Sep 2026, 09:00 AM',
        utr: 'CMS260914553372',
        bankAccount: 'State Bank of India •••• 1189',
        grossAmount: 4785,
        fee: 0,
        netAmount: 4785,
        type: 'Weekly Auto-Disbursement',
        status: 'Settled',
      },
      {
        id: 'disb_r4',
        date: '07 Sep 2026, 09:00 AM',
        utr: 'CMS260907444463',
        bankAccount: 'State Bank of India •••• 1189',
        grossAmount: 4785,
        fee: 0,
        netAmount: 4785,
        type: 'Weekly Auto-Disbursement',
        status: 'Settled',
      },
    ],
  },
  {
    id: 'wsh_suresh',
    name: 'Suresh Verma',
    phone: '+91 99111 88776',
    avatar: '/images/washer_amit.jpg',
    rating: '4.9',
    reviewsCount: 289,
    society: 'Palm Residency',
    assignedCarsPerDay: 33,
    routeWindow: '06:30 AM - 09:30 AM',
    avgTimePerCar: '5.9 mins',
    completionRate: '99.5%',
    totalLifetimeWashes: 1120,
    status: 'Active on Route',
    kyc: 'Verified (Aadhaar & Police Clear)',
    absentThisMonth: 1,
    absentDates: ['08 Sep 2026'],
    leaveReason: 'Approved scheduled leave • Covered by Amit Kumar as peer proxy with full completion',
    backupWasherName: 'Amit Kumar',
    monthlyPayoutsGone: 17820,
    pendingPayoutDue: 2350,
    sundayBonusEarned: 3100,
    disbursements: [
      {
        id: 'disb_s1',
        date: '28 Sep 2026, 09:00 AM',
        utr: 'CMS260928114422',
        bankAccount: 'ICICI Bank •••• 8841',
        grossAmount: 4455,
        fee: 0,
        netAmount: 4455,
        type: 'Weekly Auto-Disbursement',
        status: 'Settled',
      },
      {
        id: 'disb_s2',
        date: '21 Sep 2026, 09:00 AM',
        utr: 'CMS260921225533',
        bankAccount: 'ICICI Bank •••• 8841',
        grossAmount: 4455,
        fee: 0,
        netAmount: 4455,
        type: 'Weekly Auto-Disbursement',
        status: 'Settled',
      },
      {
        id: 'disb_s3',
        date: '14 Sep 2026, 09:00 AM',
        utr: 'CMS260914336644',
        bankAccount: 'ICICI Bank •••• 8841',
        grossAmount: 4455,
        fee: 0,
        netAmount: 4455,
        type: 'Weekly Auto-Disbursement',
        status: 'Settled',
      },
      {
        id: 'disb_s4',
        date: '07 Sep 2026, 09:00 AM',
        utr: 'CMS260907447755',
        bankAccount: 'ICICI Bank •••• 8841',
        grossAmount: 4455,
        fee: 0,
        netAmount: 4455,
        type: 'Weekly Auto-Disbursement',
        status: 'Settled',
      },
    ],
  },
  {
    id: 'wsh_vijay',
    name: 'Vijay Pal',
    phone: '+91 97119 44332',
    avatar: '/images/washer_amit.jpg',
    rating: '4.7',
    reviewsCount: 164,
    society: 'Sunrise Heights',
    assignedCarsPerDay: 28,
    routeWindow: '07:00 AM - 09:45 AM',
    avgTimePerCar: '6.4 mins',
    completionRate: '98.2%',
    totalLifetimeWashes: 670,
    status: 'Available Backup',
    kyc: 'Verified (Aadhaar & Police Clear)',
    absentThisMonth: 0,
    absentDates: [],
    leaveReason: 'Zero absences this month',
    backupWasherName: 'None Required',
    monthlyPayoutsGone: 15400,
    pendingPayoutDue: 1200,
    sundayBonusEarned: 2400,
    disbursements: [
      {
        id: 'disb_v1',
        date: '28 Sep 2026, 09:00 AM',
        utr: 'CMS260928990011',
        bankAccount: 'Axis Bank •••• 5590',
        grossAmount: 3850,
        fee: 0,
        netAmount: 3850,
        type: 'Weekly Auto-Disbursement',
        status: 'Settled',
      },
      {
        id: 'disb_v2',
        date: '21 Sep 2026, 09:00 AM',
        utr: 'CMS260921881122',
        bankAccount: 'Axis Bank •••• 5590',
        grossAmount: 3850,
        fee: 0,
        netAmount: 3850,
        type: 'Weekly Auto-Disbursement',
        status: 'Settled',
      },
      {
        id: 'disb_v3',
        date: '14 Sep 2026, 09:00 AM',
        utr: 'CMS260914772233',
        bankAccount: 'Axis Bank •••• 5590',
        grossAmount: 3850,
        fee: 0,
        netAmount: 3850,
        type: 'Weekly Auto-Disbursement',
        status: 'Settled',
      },
      {
        id: 'disb_v4',
        date: '07 Sep 2026, 09:00 AM',
        utr: 'CMS260907663344',
        bankAccount: 'Axis Bank •••• 5590',
        grossAmount: 3850,
        fee: 0,
        netAmount: 3850,
        type: 'Weekly Auto-Disbursement',
        status: 'Settled',
      },
    ],
  },
];

export function getWasherById(id: string): WasherPartner | undefined {
  return washerPartners.find((w) => w.id === id);
}
