// TypeScript Domain Types for Torque Care

export type UserRole = 'owner' | 'washer' | 'admin';

export interface User {
  id: string;
  uid?: string;
  phone: string;
  phoneNumber?: string;
  name: string;
  owner_name?: string;
  email?: string;
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
  selectedWasherId?: string;
  selectedWasherName?: string;
  alt_phone?: string;
  role: UserRole;
  avatar_url?: string;
  status: 'active' | 'suspended';
  created_at: string;
  selected_plan?: string;
  assigned_washer_id?: string;
  assigned_washer_name?: string;
  price?: number;
  subscription_price?: number;
  needWashBefore?: string;
  need_wash_before?: string;
}

export interface Society {
  id: string;
  name: string;
  address: string;
  city: string;
  total_vehicles: number;
  active_washers: number;
  daily_capacity: number;
  today_completion_rate: number; // e.g. 91 (91%)
  status_indicator: 'green' | 'yellow' | 'red';
  completed_count: number;
  total_today: number;
}

export interface WasherProfile {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  email?: string;
  password?: string;
  hasPassword?: boolean;
  rating: number;
  avatar_url: string;
  society_id: string;
  society_name: string;
  total_washes: number;
  daily_capacity: number;
  is_available: boolean;
  bank_account_last4: string;
}

export interface Vehicle {
  id: string;
  owner_id: string;
  owner_name: string;
  registration_number: string;
  make: string;
  model: string;
  type: 'car' | 'suv' | 'luxury' | 'bike';
  color: string;
  parking_location: string; // e.g. 'Block B • Parking 42'
  parking_floor?: string;
  preferred_wash_time: string;
  society_id: string;
  society_name: string;
  subscription_status: 'active' | 'paused' | 'expired';
  washes_this_month: number;
  selected_plan?: string;
  assigned_washer_id?: string;
  assigned_washer_name?: string;
  primaryWasherId?: string;
  primaryWasherName?: string;
  activeWasherId?: string;
  activeWasherName?: string;
  isBackupActive?: boolean;
  backupWasherId?: string;
  backupWasherName?: string;
  backupStartDate?: string;
  backupEndDate?: string;
  backupReason?: string;
  backupInitiatedBy?: string;
  backupAssignedAt?: string;
  price?: number;
  subscription_price?: number;
  flat?: string;
  flatNumber?: string;
  adminId?: string;
  assignedAdminId?: string;
  areaManagerId?: string;
  lastWashStatus?: string;
  lastWashDate?: string;
  lastWashTime?: string;
  needWashBefore?: string;
  need_wash_before?: string;
  subscriptionStartDate?: string;
}

export interface WashRecord {
  id: string;
  vehicle_id: string;
  vehicle_name: string;
  registration_number: string;
  parking_location: string;
  washer_id: string;
  washer_name: string;
  washer_avatar: string;
  washer_rating: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'missed' | 'attempted' | 'vehicle_unavailable';
  outcome_label?: string; // 'Customer / Vehicle Unavailable'
  washer_present?: boolean; // Washer: Present ✓
  service_possible?: boolean; // Service: Not possible
  payout_protected?: boolean; // Washer payout: Protected ✓
  bay_empty_photo?: string; // Live photo of assigned parking bay
  scheduled_date: string;
  scheduled_time: string;
  started_at?: string;
  completed_at?: string;
  latitude?: number;
  longitude?: number;
  location_verified: boolean;
  before_photo?: string;
  after_photo?: string;
  captured_at?: string;
  created_at?: string;
  is_sunday_priority: boolean;
  priority_price?: number;
  is_backup_covered: boolean;
  backup_washer_name?: string;
  original_washer_name?: string;
  original_washer_id?: string;
  notes?: string;
  attempt_reason?: string;
  attempt_evidence?: string;
  offline_queued?: boolean;
  service_type?: 'home' | 'away' | 'detail';
  city?: string; // e.g. 'Delhi', 'Jaipur'
  flaggedNotCleaned?: boolean;
  ownerFeedback?: 'yes' | 'no' | string;
  feedbackSubmittedAt?: string;
  updatedAt?: any;
}

export interface RouteStop {
  stop_number: number;
  wash_id: string;
  vehicle_id: string;
  vehicle_name: string;
  registration_number: string;
  parking_location: string;
  scheduled_time: string;
  status: 'completed' | 'current' | 'pending' | 'vehicle_unavailable' | 'covered_by_backup';
  washer_present?: boolean;
  service_possible?: boolean;
  payout_protected?: boolean;
  bay_empty_photo?: string;
  owner_name: string;
  owner_phone: string;
  notes?: string;
  payout_amount: number;
  society_name?: string;
  proof_photo?: string;
  owner_id?: string;
  washer_id?: string;
  washer_name?: string;
  is_backup_covered?: boolean;
  backup_washer_name?: string;
  original_washer_name?: string;
  original_washer_id?: string;
  is_covered_for_me?: boolean;
  covered_by_washer_name?: string;
  needWashBefore?: string;
  need_wash_before?: string;
  completed_at?: string;
  captured_at?: string;
}

export interface WasherSubstitutionAudit {
  id: string;
  originalWasherId: string;
  originalWasher: string;
  backupWasherId: string;
  backupWasher: string;
  society: string;
  societyId?: string;
  dates: string;
  startDate: string;
  endDate: string;
  reason: string;
  initiatedBy: string;
  timestamp: string;
  carsAffected: number;
  affectedVehicleIds?: string[];
  status: 'Active' | 'Completed' | 'Reverted';
}

export interface WasherEarnings {
  total_earnings: number;
  this_week: number;
  available: number;
  pending: number;
  bank_account_last4: string;
  recent_payouts: {
    id: string;
    amount: number;
    fee: number;
    net: number;
    status: 'completed' | 'processing';
    date: string;
    bank_last4: string;
  }[];
}

export interface LeaveRequest {
  id: string;
  washer_id: string;
  washer_name: string;
  start_date: string;
  end_date: string;
  backup_washer_id: string;
  backup_washer_name: string;
  status: 'approved' | 'pending';
  society_name: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  category: 'wash' | 'system' | 'payout' | 'sunday';
  action_url?: string;
}

export interface ExceptionItem {
  id: string;
  type: 'missed_wash' | 'washer_unavailable' | 'customer_complaint' | 'replacement_required';
  title: string;
  description: string;
  society: string;
  vehicle: string;
  washer: string;
  time: string;
  resolved: boolean;
}

export type AwayFrequency = 'once' | 'every_3_days' | 'every_5_days' | 'weekly';

export interface TravelBooking {
  id: string;
  vehicle_name: string;
  registration_number: string;
  destination_location: string;
  city: string;
  temporary_bay: string;
  washer_name: string;
  washer_avatar: string;
  washer_rating: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  daily_rate: number;
  booking_type: 'single' | 'until_return';
  frequency?: AwayFrequency;
  wash_count?: number;
  total_amount?: number;
}

export interface DetailPackage {
  id: string;
  name: string;
  duration: string;
  price: number;
  popular?: boolean;
  description: string;
  features: string[];
}

export type { WasherPartner, PayoutDisbursement } from './washerPartners';

export interface LeadRegistration {
  id?: string;
  fullName: string;
  phone: string;
  vehicleNumber: string; // Car number plate / License plate
  societyName: string;
  district: string;
  city: string;
  state: string;
  createdAt?: string;
  createdAtIST?: string;
  status?: 'new' | 'contacted' | 'converted' | 'archived';
  syncedToGoogleSheets?: boolean;
  notes?: string;
  source?: string;
}
