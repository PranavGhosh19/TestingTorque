-- TORQUE CARE: Premium Consumer-Service PWA Database Schema
-- Architecture: PostgreSQL / Supabase with Row Level Security (RLS)
-- ====================================================================

-- 1. Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. Enumerations
create type user_role as enum ('owner', 'washer', 'admin');
create type user_status as enum ('active', 'suspended', 'pending_verification');
create type vehicle_type as enum ('car', 'suv', 'bike', 'luxury');
create type subscription_status as enum ('active', 'paused', 'cancelled', 'expired');
create type wash_status as enum ('scheduled', 'in_progress', 'completed', 'missed', 'attempted', 'cancelled');
create type unavailable_reason as enum ('vehicle_not_accessible', 'customer_unavailable', 'parking_blocked', 'gate_locked', 'other');
create type payout_status as enum ('pending', 'processing', 'completed', 'failed');
create type transaction_type as enum ('subscription', 'sunday_priority', 'washer_payout', 'refund');
create type leave_status as enum ('pending', 'approved', 'rejected', 'completed');

-- 3. Societies (Core Operational Entity)
create table societies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  city text not null default 'New Delhi',
  postal_code text,
  latitude double precision not null,
  longitude double precision not null,
  total_capacity integer not null default 150,
  daily_target integer not null default 100,
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Users Profile Table (Extends Supabase auth.users)
create table users (
  id uuid primary key default gen_random_uuid(),
  phone text unique not null,
  name text not null,
  email text,
  role user_role not null default 'owner',
  status user_status not null default 'active',
  avatar_url text,
  preferred_language text default 'en',
  fcm_token text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Washers Specific Profile
create table washers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  society_id uuid references societies(id),
  verification_status text not null default 'verified',
  rating numeric(3,2) not null default 4.90,
  total_washes integer not null default 0,
  daily_capacity integer not null default 35,
  bank_account_number text,
  bank_ifsc text,
  upi_id text,
  is_available boolean not null default true,
  current_latitude double precision,
  current_longitude double precision,
  last_active_at timestamp with time zone default timezone('utc'::text, now())
);

-- 6. Vehicles Table
create table vehicles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references users(id) on delete cascade not null,
  society_id uuid references societies(id) not null,
  registration_number text unique not null,
  make text not null,
  model text not null,
  type vehicle_type not null default 'car',
  color text,
  parking_location text not null, -- e.g., 'Block B • Parking 42'
  parking_floor text default 'Basement 1',
  preferred_wash_time text default '07:30 AM',
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Subscription Plans
create table subscription_plans (
  id text primary key, -- 'basic', 'standard', 'premium'
  name text not null,
  monthly_price numeric(10,2) not null,
  washes_per_week integer not null default 6,
  interior_cleaning_per_month integer not null default 1,
  sunday_wash_discount numeric(5,2) default 0.00,
  features text[] not null
);

-- 8. Subscriptions
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references users(id) on delete cascade not null,
  vehicle_id uuid references vehicles(id) on delete cascade not null,
  plan_id text references subscription_plans(id) not null,
  status subscription_status not null default 'active',
  start_date date not null default current_date,
  end_date date not null default (current_date + interval '30 days'),
  monthly_price numeric(10,2) not null,
  washes_completed_this_month integer not null default 0,
  missed_washes_count integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Wash Assignments (Mapping vehicle to washer in society)
create table wash_assignments (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references vehicles(id) on delete cascade not null,
  washer_id uuid references washers(id) on delete cascade not null,
  society_id uuid references societies(id) not null,
  route_order integer not null default 1,
  start_date date not null default current_date,
  end_date date,
  is_active boolean not null default true
);

-- 10. Wash Records (The Core Proof & Verification Entity)
create table wash_records (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references vehicles(id) on delete cascade not null,
  washer_id uuid references washers(id) on delete cascade not null,
  assignment_id uuid references wash_assignments(id),
  society_id uuid references societies(id) not null,
  scheduled_date date not null default current_date,
  status wash_status not null default 'scheduled',
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  latitude double precision,
  longitude double precision,
  location_verified boolean default false,
  before_photo_url text,
  after_photo_url text,
  is_sunday_priority boolean not null default false,
  is_backup_covered boolean not null default false,
  original_washer_id uuid references washers(id),
  washer_payout_amount numeric(10,2) default 20.00,
  customer_rating integer check (customer_rating >= 1 and customer_rating <= 5),
  customer_feedback text,
  offline_queued boolean default false,
  synced_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. Wash Attempts (Customer Unavailable / Parking Blocked evidence)
create table wash_attempts (
  id uuid primary key default gen_random_uuid(),
  wash_id uuid references wash_records(id) on delete cascade not null,
  vehicle_id uuid references vehicles(id) on delete cascade not null,
  washer_id uuid references washers(id) on delete cascade not null,
  reason unavailable_reason not null,
  notes text,
  evidence_photo_url text,
  attempted_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. Washer Leave Requests & Backup Network
create table leave_requests (
  id uuid primary key default gen_random_uuid(),
  washer_id uuid references washers(id) on delete cascade not null,
  backup_washer_id uuid references washers(id),
  society_id uuid references societies(id) not null,
  start_date date not null,
  end_date date not null,
  reason text,
  status leave_status not null default 'approved',
  auto_reassigned_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 13. Payouts (Washer Fintech Wallet)
create table payouts (
  id uuid primary key default gen_random_uuid(),
  washer_id uuid references washers(id) on delete cascade not null,
  amount numeric(10,2) not null,
  fee numeric(10,2) not null default 10.00,
  net_amount numeric(10,2) not null,
  status payout_status not null default 'pending',
  bank_account text not null,
  processed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 14. Transactions (Owner Subscriptions, Razorpay payments)
create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  type transaction_type not null,
  amount numeric(10,2) not null,
  currency text not null default 'INR',
  status text not null default 'success',
  razorpay_order_id text,
  razorpay_payment_id text,
  description text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 15. Notifications
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  title text not null,
  body text not null,
  category text not null default 'wash_update',
  action_url text,
  read_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 16. Indexes for High Performance Querying
create index idx_vehicles_owner on vehicles(owner_id);
create index idx_vehicles_society on vehicles(society_id);
create index idx_wash_records_date on wash_records(scheduled_date, status);
create index idx_wash_records_washer on wash_records(washer_id, scheduled_date);
create index idx_wash_records_vehicle on wash_records(vehicle_id);
create index idx_subscriptions_owner on subscriptions(owner_id);
create index idx_notifications_user on notifications(user_id, read_at);

-- 17. Row Level Security (RLS)
alter table users enable row level security;
alter table vehicles enable row level security;
alter table wash_records enable row level security;
alter table subscriptions enable row level security;
alter table payouts enable row level security;
alter table notifications enable row level security;

-- Policies: Owners can only read/manage their own vehicles and records
create policy "Owners read own profile" on users for select using (auth.uid() = id);
create policy "Owners manage own vehicles" on vehicles for all using (auth.uid() = owner_id);
create policy "Owners view own wash records" on wash_records for select using (
  vehicle_id in (select id from vehicles where owner_id = auth.uid())
);

-- Washers can view their assigned route and update wash records
create policy "Washers manage assigned wash records" on wash_records for all using (
  washer_id in (select id from washers where user_id = auth.uid())
);

-- Admins full access
create policy "Admins full access users" on users for all using (
  auth.jwt()->>'role' = 'admin' or exists (select 1 from users where id = auth.uid() and role = 'admin')
);
create policy "Admins full access washes" on wash_records for all using (
  auth.jwt()->>'role' = 'admin' or exists (select 1 from users where id = auth.uid() and role = 'admin')
);
