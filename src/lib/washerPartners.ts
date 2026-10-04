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
  societies?: string[];
  createdBy?: string;
  assignedCarsPerDay: number;
  routeWindow: string;
  avgTimePerCar: string;
  completionRate: string;
  totalLifetimeWashes: number;
  status: 'Active on Route' | 'Available Backup' | 'Dismissed' | 'On Leave';
  dismissedAt?: string;
  dismissalReason?: string;
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


export const washerPartners: WasherPartner[] = [];

export const initialWasherPartners: WasherPartner[] = [];

export function getWasherById(id: string): WasherPartner | undefined {
  return washerPartners.find((w) => w.id === id);
}

