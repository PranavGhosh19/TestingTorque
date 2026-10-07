# Torque Care — Access Control & Privilege Management Architecture

**Audit Date:** October 7, 2026  
**Audited Commit Hash:** `b07fabc019ec452e175ba29302ace6862fbceec8`  
**Assessment Focus:** Role-Based Access Control (RBAC), Privilege Escalation, Admin Route Guards, Multi-Tenancy Isolation, and Audit Trail Resiliency  

---

## 1. Role Definitions & Enforcement Mechanisms

Torque Care defines four hierarchical identity tiers:

```
                  ROLE HIERARCHY
               ┌──────────────────┐
               │   super_admin    │
               └────────┬─────────┘
                        ▼
               ┌──────────────────┐
               │  admin / Manager │
               └────────┬─────────┘
                        ▼
               ┌──────────────────┐
               │      washer      │
               └────────┬─────────┘
                        ▼
               ┌──────────────────┐
               │     customer     │
               └──────────────────┘
```

### The Architectural Disconnect: Client-Side vs Server-Side Enforcement

```
┌──────────────────────────────────────────────┬──────────────────────────────────────────────┐
| INTENDED ARCHITECTURE (firebase.rules)       | ACTUAL IMPLEMENTATION (firestore.rules)      |
├──────────────────────────────────────────────┼──────────────────────────────────────────────┤
| - Canonical Auth: Custom Auth Claims         | - Canonical Auth: Checking document existence|
|   request.auth.token.role == 'admin'         |   exists(area_managers/$(request.auth.uid))  |
| - Super Admin creates Area Managers          | - Anyone creates their own area_manager doc  |
| - Client-side state reflects verified tokens | - Client-side state reads from localStorage  |
| - Server middleware blocks unauthorized URLs | - Zero Next.js middleware; pages render open |
└──────────────────────────────────────────────┴──────────────────────────────────────────────┘
```

1. **Client-Side Enforcement (UI Only):**
   - The application manages role state inside a Zustand store (`src/lib/store.tsx#L1250-L1270`) and mirrors it to `localStorage.getItem('torque_role')` and `torque_user`.
   - Navigation guards (e.g. redirecting to `/admin/login`) exist solely as client-side React `useEffect` hooks. An attacker disabling JavaScript execution or modifying React state locally completely bypasses UI checks.
2. **Server-Side Enforcement (Next.js Layer):**
   - **No Middleware:** The application contains **zero `middleware.ts` file**. Next.js server route handlers and page SSR components perform no session token decoding or cryptographic signature verification.
3. **Database Enforcement (Firestore Layer):**
   - Database operations execute against `firestore.rules`.
   - As documented below, critical flaws in `firestore.rules` negate the intended RBAC architecture and allow arbitrary privilege escalation.

---

## 2. Privilege Escalation & Role Hijacking Vectors

### Vector 1: Self-Service Database-Wide Admin Escalation via `area_managers`
- **File Reference:** `firestore.rules#L49-L67, L106` (*Confirmed*)
- **Vulnerability Mechanism:**
  1. `firestore.rules` defines helper functions `isAreaManager()` (Line 49) and `isAdmin()` (Line 58):
     ```javascript
     function isAdmin() {
       return isAuthenticated()
         && (
           ('role' in request.auth.token && (
             request.auth.token.role == 'admin'
             || request.auth.token.role == 'super_admin'
           ))
           || exists(/databases/$(database)/documents/area_managers/$(request.auth.uid))
         );
     }
     ```
  2. Notice that possessing a document under `/area_managers/$(request.auth.uid)` confers complete `isAdmin()` and `isAreaManager()` authorization.
  3. Now examine `match /area_managers/{managerId}` (Lines 99–115):
     ```javascript
     match /area_managers/{managerId} {
       // Area Manager creating their own profile, or Super Admin
       allow create: if isOwner(managerId)
         || isSuperAdmin();
     }
     ```
  4. `isOwner(managerId)` is defined on Line 74 as:
     ```javascript
     function isOwner(userId) {
       return isAuthenticated() && request.auth.uid == userId;
     }
     ```
- **Exploitation:**
  - Any user who authenticates via standard Firebase Phone Auth obtains a valid `request.auth.uid`.
  - The user calls `db.collection('area_managers').doc(auth.currentUser.uid).set({ role: 'Area Manager' })`.
  - Because `managerId == request.auth.uid`, `isOwner` evaluates to `true`, and the document is created.
  - From that moment forward, `exists(/.../area_managers/$(request.auth.uid))` evaluates to `true` for all subsequent queries.
  - The user has permanently escalated their privileges to full Admin across the entire Firestore database.
- **Severity:** **CRITICAL**.

---

### Vector 2: Admin Impersonation via URL Query Parameter on `/auth/verify`
- **File Reference:** `src/app/auth/verify/page.tsx#L39, L219-L255` (*Confirmed*)
- **Vulnerability Mechanism:**
  1. The phone verification page extracts the intended role directly from URL query parameters:
     ```typescript
     const roleParam = (searchParams.get('role') || 'owner') as 'owner' | 'washer' | 'admin';
     ```
  2. When the phone OTP is submitted successfully, the code checks:
     ```typescript
     } else if (roleParam === 'admin') {
       setRole('admin');

       await syncAuthUserToFirestore(
         { uid, phoneNumber: verifiedPhone },
         {
           name: 'Vikram Malhotra (Ops Lead)',
           role: 'admin',
           status: 'active',
         }
       );

       const adminUser = {
         id: uid,
         uid: uid,
         name: 'Vikram Malhotra (Ops Lead)',
         phone: verifiedPhone,
         role: 'admin' as const,
         status: 'active' as const,
         created_at: new Date().toISOString(),
       };

       setUser(adminUser);
       setIsLoggedIn(true);
       localStorage.setItem('torque_logged_in', 'true');
       localStorage.setItem('torque_user', JSON.stringify(adminUser));
       router.push('/admin/dashboard');
     ```
- **Exploitation:**
  - An attacker inputs their personal mobile number on `/auth/login`.
  - They edit the browser address bar to append `?role=admin`.
  - They enter the legitimate SMS OTP received on their phone.
  - The application automatically designates them an Administrator (`Vikram Malhotra (Ops Lead)`), sets their role to `admin` in local storage, and grants access to the administrative dashboard.
- **Severity:** **CRITICAL**.

---

### Vector 3: Default Admin Fallback on Admin Dashboard
- **File Reference:** `src/app/admin/dashboard/page.tsx#L34-L38` (*Confirmed*)
- **Vulnerability Mechanism:**
  - If a visitor navigates directly to `/admin/dashboard` with no active session or credentials, the code sets:
    ```typescript
    const currentAdminId =
      user?.uid ||
      user?.id ||
      (typeof window !== 'undefined' ? (localStorage.getItem('torque_admin_uid') || localStorage.getItem('torque_owner_id')) : null) ||
      'admin-lead-1';
    ```
  - Rather than redirecting unauthenticated users to `/admin/login`, the component assigns `'admin-lead-1'` as the active administrator ID and executes live data fetches:
    ```typescript
    const [socList, washersList, custList] = await Promise.all([
      fetchAllSocieties(),
      fetchAllWashersFromFirestore(currentAdminId),
      fetchAdminCustomers(),
    ]);
    ```
- **Severity:** **HIGH**.

---

## 3. Administrative Scope, Capabilities, and Multi-Tenancy

### 1. Super-Admin vs Area Manager Granularity
- In `firestore.rules`, `super_admin` has explicit delete permissions on `area_managers` (Line 114) and `State` hierarchy (Line 290).
- However, in the application UI, **there is zero distinction between a Super Admin and an Area Manager**. All managers have access to the same sidebar tabs: `/admin/dashboard`, `/admin/customers`, `/admin/washers`, `/admin/leads`, `/admin/societies`, `/admin/payouts`, `/admin/substitutions`.

### 2. Multi-Tenancy & Cross-Territory Isolation Gaps
- **File Reference:** `src/app/admin/customers/page.tsx#L100, L152-L179` (*Confirmed*)
- An Area Manager should legally and operationally only inspect customers and washers within their assigned residential society or operational sector.
- **Current Behavior:**
  - The page loads **all customers nationwide** into client memory (`loadCustomers()` calls `fetchAdminCustomers()`).
  - Territory restriction is handled purely by a client-side filter toggle (`adminScope === 'my_area'`), which defaults to `'all'`:
    ```typescript
    const [adminScope, setAdminScope] = useState<'all' | 'my_area'>('all');
    ```
  - Any Area Manager can inspect customer vehicles, flat numbers, and phone numbers in any other Area Manager's territory simply by leaving the filter on `'all'`.

### 3. Inspection of Washer and Colleague Aadhaar Data
- In `src/app/admin/washers/[id]/page.tsx#L538`, any admin can view washer Aadhaar details.
- Furthermore, because `Washers` is world-readable, there is no boundary preventing an admin (or anonymous user) from scraping every washer's Aadhaar image and number.
- For Area Managers, `area_managers` allows `allow read: if isOwner(managerId) || isSuperAdmin();` (Line 102). An Area Manager cannot read other managers' records via Firestore rules, but a Super Admin can read all managers' unmasked Aadhaar documents.

---

## 4. Admin Authentication & Session Security Posture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
|                           ADMIN AUTHENTICATION CONTROLS                                |
├──────────────────────────────┬────────────────────────────┬────────────────────────────┤
| Security Control             | Current Implementation     | Assessment / Gap           |
├──────────────────────────────┼────────────────────────────┼────────────────────────────┤
| Multi-Factor Auth (MFA)      | NONE                       | Single factor (password or |
|                              |                            | phone OTP) only            |
├──────────────────────────────┼────────────────────────────┼────────────────────────────┤
| Password Complexity Policy   | password.length >= 6       | No complexity, entropy, or |
|                              | (admin/login/page.tsx:51)  | breached-password checks   |
├──────────────────────────────┼────────────────────────────┼────────────────────────────┤
| Account Lockout Mechanism    | NONE                       | Unlimited failed attempts; |
|                              |                            | vulnerable to brute force  |
├──────────────────────────────┼────────────────────────────┼────────────────────────────┤
| Session Lifetime & Expiry    | Indefinite                 | Stored in localStorage;    |
|                              |                            | never expires              |
├──────────────────────────────┼────────────────────────────┼────────────────────────────┤
| Network Origin Binding       | NONE                       | Can be accessed from any   |
|                              |                            | IP / country globally      |
├──────────────────────────────┼────────────────────────────┼────────────────────────────┤
| Admin Offline Fallback       | admin_${emailPrefix}       | Generates fake admin UID   |
|                              | (admin/login/page.tsx:81)  | if Firebase Auth fails     |
└──────────────────────────────┴────────────────────────────┴────────────────────────────┘
```

---

## 5. Bulk Export & Download Controls

### 1. Lead Data Exfiltration
- **Route:** `GET /api/leads?format=csv` (`src/app/api/leads/route.ts#L226-L261`)
- **UI Button:** `handleExportExcel()` on `/admin/leads` (`src/app/admin/leads/page.tsx#L108-L160`)
- **Authorization:** Zero authentication required on the API route; zero server-side authentication required on the UI page.
- **Audit Logging:** **ZERO**. Neither the API endpoint nor the UI handler writes an audit record when a bulk download occurs.
- **Impact:** An employee, contractor, or external attacker can download the entire customer dataset without leaving a digital trace.

---

## 6. Audit Logging & Non-Repudiation Integrity

1. **Existing Telemetry Logging:**
   - The application records operational events:
     - Washer logins: `recordUserLogin()` (`src/lib/firebaseService.ts#L2678`)
     - Admin logins: `recordAdminLoginToFirestore()` (`src/lib/firebaseService.ts#L2640`)
     - Supervisor substitutions: `saveWasherSubstitutionToFirestore()` (`src/lib/firebaseService.ts#L3680`)
2. **Structural Flaw: World-Writable Audit Collections:**
   - **File Reference:** `firestore.rules#L404, L408` (*Confirmed*)
     ```javascript
     match /Substitutions/{subId} {
       allow read, write: if true;
     }

     match /Admin_Notifications/{notifId} {
       allow read, write: if true;
     }
     ```
   - Because `Substitutions` and `Admin_Notifications` permit public writes, **audit records are completely mutable and non-tamper-resistant.**
   - An attacker or rogue administrator who modifies records or reassigns routes can delete or falsify the corresponding audit records in Firestore.

---

## 7. Admin Lifecycle: Creation, Suspension, and Offboarding

1. **Account Creation:**
   - Admin accounts are created ad-hoc via Firebase Authentication console or through the vulnerable `area_managers` self-creation flow.
   - Profile creation occurs on `/admin/profile-creation`, which collects personal phone and unmasked 12-digit Aadhaar.
2. **Deactivation & Suspension:**
   - There is no administrative panel for revoking an Area Manager's access.
   - Deleting a document from `area_managers` revokes Firestore database permissions; however, because the user's `localStorage` retains `torque_logged_in: true` and `torque_role: admin`, their browser client continues to display cached data until cleared.
3. **Offboarding Gaps:**
   - No token invalidation or session revocation mechanism exists (`revokeRefreshTokens` in Firebase Admin SDK is not implemented because no server SDK exists).
