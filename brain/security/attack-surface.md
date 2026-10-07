# Torque Care — Attack Surface & Exposure Analysis

**Audit Date:** October 7, 2026  
**Audited Commit Hash:** `b07fabc019ec452e175ba29302ace6862fbceec8`  
**Assessment Scope:** HTTP Route Handlers, Direct Firestore Operations, Client-Side Routing, IDOR Vectors, and Telemetry Channels  

---

## 1. Exhaustive API Endpoint Inventory

The Next.js application exposes route handlers under `src/app/api/`. Below is the complete inventory of server endpoints:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
|                                      API ENDPOINT AUDIT TABLE                                          |
├────────┬─────────────────┬───────────┬───────────────┬───────────────────────────┬─────────────────────┤
| Method | Route           | Auth Req? | Role Required | Data Returned / Action    | Rate Limiting?      |
├────────┼─────────────────┼───────────┼───────────────┼───────────────────────────┼─────────────────────┤
| POST   | /api/leads      | NO (None) | None (Public) | Ingests new lead record;  | NONE (0 protection) |
|        |                 |           |               | returns { id, success }   |                     |
├────────┼─────────────────┼───────────┼───────────────┼───────────────────────────┼─────────────────────┤
| GET    | /api/leads      | NO (None) | None (Public) | Complete JSON array of    | NONE (0 protection) |
|        |                 |           |               | all customer leads        |                     |
├────────┼─────────────────┼───────────┼───────────────┼───────────────────────────┼─────────────────────┤
| GET    | /api/leads      | NO (None) | None (Public) | Unrestricted CSV download | NONE (0 protection) |
|        | ?format=csv     |           |               | of entire customer lead DB|                     |
├────────┼─────────────────┼───────────┼───────────────┼───────────────────────────┼─────────────────────┤
| DELETE | /api/leads      | NO (None) | None (Public) | Soft-deletes specified    | NONE (0 protection) |
|        | ?id={leadId}    |           |               | lead record in Firestore  |                     |
└────────┴─────────────────┴───────────┴───────────────┴───────────────────────────┴─────────────────────┘
```

### Detailed Endpoint Breakdown

#### 1. `POST /api/leads`
- **File Reference:** `src/app/api/leads/route.ts#L5-L162` (*Confirmed*)
- **Auth Required:** No.
- **Role Required:** None.
- **Input Parameters:** `fullName`, `phone`, `vehicleNumber`, `societyName`, `district`, `city`, `state`, `notes`.
- **Validation:** Enforces non-empty name, phone, vehicle plate, society; enforces 10 digits for phone.
- **Data Ingress & Side Effects:**
  - Writes directly to Firestore `Lead_Registrations/{leadId}`.
  - Dual-writes to Firestore `Car_Owners/{leadId}` with `role: 'lead'` (Lines 129–144).
  - Forwards plain PII payload to `GOOGLE_SHEETS_WEBHOOK_URL` via HTTP POST (Lines 82–114).
- **Security Deficiencies:**
  - Zero IP-based or session-based rate limiting.
  - Zero CAPTCHA challenge (reCAPTCHA/Cloudflare Turnstile).
  - Enables unbounded database pollution and third-party webhook exhaustion.

#### 2. `GET /api/leads` & `GET /api/leads?format=csv`
- **File Reference:** `src/app/api/leads/route.ts#L164-L271` (*Confirmed*)
- **Auth Required:** **NO** (Completely unauthenticated).
- **Role Required:** **NONE**.
- **Data Returned:**
  - Queries both `Lead_Registrations` and `Car_Owners` collections (Lines 172, 181).
  - Returns array or CSV stream containing: `Registration Date`, `Full Name`, `Phone Number` (`+91 XXXXXXXXXX`), `Car License Plate`, `Society Name`, `District`, `City`, `State`, `Status`, `Source`.
- **Security Deficiencies:**
  - **Critical Information Disclosure:** An unauthenticated visitor running a single `curl` command downloads the entire database of prospective customers.
  - Bypasses all admin interface authentication.

#### 3. `DELETE /api/leads?id={leadId}`
- **File Reference:** `src/app/api/leads/route.ts#L273-L298` (*Confirmed*)
- **Auth Required:** **NO**.
- **Role Required:** **NONE**.
- **Data Returned / Action:** Marks `isDeleted: true` and `status: 'deleted'` in both `Lead_Registrations` and `Car_Owners`.
- **Security Deficiencies:**
  - Any attacker who enumerates or scrapes lead IDs can delete records at will.
  - Zero audit logging of who performed the deletion.

---

## 2. Direct Firestore Client Attack Surface

Because the application uses the Firebase Client SDK directly in the browser, Firestore collections act as primary network APIs. The attack surface is governed strictly by `firestore.rules`.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
|                                FIRESTORE COLLECTION EXPOSURE                                   |
├───────────────────────────────┬─────────────────────────┬────────────────────────┬─────────────┤
| Collection Path               | Read Rule               | Write / Update Rule    | Exposure    |
├───────────────────────────────┼─────────────────────────┼────────────────────────┼─────────────┤
| /Washers/{id}                 | allow read: if true;    | allow update: if true; | CRITICAL    |
|                               | (L129)                  | (L145)                 | (World RW)  |
├───────────────────────────────┼─────────────────────────┼────────────────────────┼─────────────┤
| /washer_directory/{id}        | allow read: if true;    | allow update: if true; | CRITICAL    |
|                               | (L184)                  | (L200)                 | (Passwords) |
├───────────────────────────────┼─────────────────────────┼────────────────────────┼─────────────┤
| /Car_Owners/{id}              | allow read: if true;    | allow create, update:  | HIGH        |
|                               | (L342)                  | if true; (L344)        | (World RW)  |
├───────────────────────────────┼─────────────────────────┼────────────────────────┼─────────────┤
| /Car_Owners/{id}/Vehicles/... | allow read: if true;    | allow write: if true;  | HIGH        |
| /Washes/{washId}              | (L355, L393)            | (L357, L393)           | (World RW)  |
├───────────────────────────────┼─────────────────────────┼────────────────────────┼─────────────┤
| /area_managers/{id}           | allow read: if isOwner  | allow create: if       | CRITICAL    |
|                               | or isSuperAdmin (L102)  | isOwner (L106)         | (Priv Esc)  |
├───────────────────────────────┼─────────────────────────┼────────────────────────┼─────────────┤
| /Societies/{id}               | allow read: if true;    | allow write: if        | Low         |
|                               | (L240)                  | isAdmin (L247)         | (Catalog)   |
├───────────────────────────────┼─────────────────────────┼────────────────────────┼─────────────┤
| /Substitutions/{id}           | allow read, write:      | allow read, write:     | Medium      |
| /Admin_Notifications/{id}     | if true; (L404, L408)   | if true; (L404, L408)  | (Audit Fake)|
├───────────────────────────────┼─────────────────────────┼────────────────────────┼─────────────┤
| /Lead_Registrations/{id}      | allow read, write:      | allow read, write:     | High        |
|                               | if true; (L416)         | if true; (L416)        | (PII Tamper)|
└───────────────────────────────┴─────────────────────────┴────────────────────────┴─────────────┘
```

---

## 3. Specific Vulnerability Analysis

### 1. Insecure Direct Object Reference (IDOR) & Broken Object-Level Authorization
- **Washer Detail Inspection (`/admin/washers/[id]`):**
  - **File Reference:** `src/app/admin/washers/[id]/page.tsx#L55-L100` (*Confirmed*)
  - The route accepts either an obfuscated token (`enc_...`) or a plain washer ID (`wsh_...`).
  - `decryptWasherId` (`src/lib/idSecurity.ts#L32-L53`) explicitly accepts plain unencrypted tokens.
  - The page queries Firestore directly (`fetchAllWashersFromFirestore()`) and displays the washer matching `wsh_xxx`.
  - There is no authorization check verifying whether the requesting user is the assigned supervisor for that washer. Any user can view all washers' contact details, society assignments, ratings, and performance metrics.
- **Customer Vehicle Wash Logs:**
  - **File Reference:** `firestore.rules#L353-L395` (*Confirmed*)
  - Because `match /Car_Owners/{ownerId}` and subcollections have `allow read: if true;`, any client can query `Car_Owners/{anyOwnerId}/Vehicles/{vehicleId}/Washes` and view any customer's daily car wash logs, vehicle damage notes, and parking locations.

---

### 2. OTP & Authentication Abuse
- **Mock OTP Bypass:**
  - **File Reference:** `src/components/modals/OnboardWasherModal.tsx#L110, L179` (*Confirmed*)
  - The washer onboarding modal utilizes a static verification code `4291` instead of issuing a real SMS challenge.
- **Unrestricted Phone OTP Triggers:**
  - **File Reference:** `src/lib/firebaseAuth.ts#L105-L140` (*Confirmed*)
  - While protected by client-side invisible reCAPTCHA, there is no server-side IP throttling on `/auth/login` to prevent botnets from triggering SMS OTP requests repeatedly, incurring high telecom verification costs on the Firebase account.
- **Unverified First-Time Washer Password Creation:**
  - **File Reference:** `src/app/washer/set-password/page.tsx#L60-L245` (*Confirmed*)
  - An attacker navigating to `/washer/set-password?email=washer@example.com` can set a password for any washer whose `passwordSet` flag is false, without receiving an email verification link or an SMS OTP on the washer's registered phone number.

---

### 3. Admin Panel Exposure & Missing Server-Side Middleware
- **Absence of Next.js Route Guards:**
  - **File Reference:** Repository root (*Confirmed: no `middleware.ts` exists*)
  - The Next.js framework renders admin pages (`/admin/dashboard`, `/admin/customers`, `/admin/washers`, `/admin/leads`, `/admin/societies`, `/admin/substitutions`, `/admin/payouts`, `/admin/analytics`, `/admin/profile-creation`) directly without server-side session checks.
- **Default Fallback Admin Identity:**
  - **File Reference:** `src/app/admin/dashboard/page.tsx#L34-L38` (*Confirmed*)
  - When an unauthenticated user opens `/admin/dashboard`, `currentAdminId` evaluates:
    ```typescript
    const currentAdminId = user?.uid || user?.id || localStorage.getItem('torque_admin_uid') || 'admin-lead-1';
    ```
  - The page defaults to `'admin-lead-1'`, queries Firestore, and renders live management metrics.
- **Client-Side Domain Restriction Bypass:**
  - **File Reference:** `src/app/admin/login/page.tsx#L41-L44` (*Confirmed*)
  - The requirement that admin emails must end with `@torquecare.in` is checked solely in browser JavaScript:
    ```typescript
    if (!cleanEmail.endsWith('@torquecare.in')) { setError('...'); return; }
    ```
  - An attacker sending authentication requests directly to Firebase Authentication or calling `signInWithEmailAndPassword` via browser devtools completely bypasses this check.

---

### 4. File Upload Handling & Storage Exposures
- **Base64 Direct Database Ingestion:**
  - **File Reference:** `src/components/modals/OnboardWasherModal.tsx#L146-L155`, `src/app/admin/profile-creation/page.tsx#L155-L170` (*Confirmed*)
  - Files are converted via `FileReader.readAsDataURL(file)` and written as raw base64 data URLs into Firestore documents.
  - Documents have a hard limit of 1MB in Firestore; large images risk write failures or inflate database size.
- **Lack of File Content / Magic-Byte Validation:**
  - The application only checks the browser-reported MIME type or extension. It does not inspect binary magic bytes to prevent polyglot file uploads.
- **EXIF Metadata Retention:**
  - Uploaded camera photos are not stripped of EXIF headers. Camera make, GPS coordinates (latitude and longitude), and capture timestamps remain embedded in the photo binary.
- **Cloud Storage Bucket Posture:**
  - **File Reference:** `firebase.json` (*Confirmed: no storage rules declared*)
  - `uploadWashPhotoToStorage` (`src/lib/firebaseService.ts#L1804`) relies on `getDownloadURL(storageRef)`, generating permanent publicly shareable URLs with token query parameters.

---

### 5. CORS, CSRF, and Security Headers Posture
- **CORS Posture:**
  - Next.js API routes (`/api/leads`) execute on the same origin by default. However, because `GET /api/leads` and `POST /api/leads` do not inspect the `Origin` or `Referer` headers, they can be invoked cross-origin or via headless CLI scripts.
- **CSRF Posture:**
  - No CSRF token validation exists for state-changing operations (`POST /api/leads`, `DELETE /api/leads`).
- **HTTP Security Headers:**
  - **File Reference:** `next.config.ts#L1-L8` (*Confirmed*)
  - `next.config.ts` declares empty configuration. The server does not emit:
    - `Content-Security-Policy` (CSP)
    - `Strict-Transport-Security` (HSTS)
    - `X-Frame-Options` (permits clickjacking in iframes)
    - `X-Content-Type-Options: nosniff`
    - `Referrer-Policy: strict-origin-when-cross-origin`
    - `Permissions-Policy` (geolocation, camera, microphone)

---

### 6. Sensitive Data in Logs, Error Messages, and URLs
- **Console Log Exposure:**
  - `src/lib/firebaseService.ts` contains numerous instances of `console.log` and `console.error` dumping document IDs, error objects, and user data:
    - Line 2567: `console.log('Cleaned up stray admin document from Car_Owners:', docId);`
    - Line 2575: `console.error('Error saving area manager to Firestore:', error);`
    - Line 122: `console.error('Washer Firebase Auth login error:', authErr);`
- **Sensitive Data in URLs:**
  - `src/app/auth/verify/page.tsx#L38-L39`: Full mobile phone numbers and roles are passed in query strings: `/auth/verify?role=owner&phone=+919876543210`. This leaks user phone numbers into browser histories, server access logs, and referrer headers.
  - `src/app/washer/set-password/page.tsx#L105`: Washer email addresses are passed in plain query strings: `/washer/set-password?email=...`.
- **Client-Side `localStorage` Storage:**
  - Plain unencrypted JSON objects containing user profile, name, phone, washer IDs, and admin IDs are written to browser `localStorage` (`torque_user`, `torque_admin_uid`, `torque_washer_id`). Any cross-site script (XSS) can immediately dump this data.
