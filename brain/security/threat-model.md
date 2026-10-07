# Torque Care — Threat Model

**Audit Date:** October 7, 2026  
**Audited Commit Hash:** `b07fabc019ec452e175ba29302ace6862fbceec8`  
**System Type:** PWA / Serverless Direct-to-Firestore Architecture  
**Primary Threat Profile:** Mass PII Leakage, Identity Theft via Aadhaar, Vehicle Stalking, and Administrative Compromise  

---

## 1. System Overview & Core Assets

Torque Care manages daily morning vehicle washing operations across apartment complexes and gated societies in India. The application processes and retains high-sensitivity personal identifiers and operational telemetry across three core groups:

```
┌────────────────────────────────────────────────────────────────────────┐
|                               ASSET MATRIX                             |
├─────────────────────┬──────────────────────────────────────────────────┤
| Asset Class         | Details & Sensitive Elements                     |
├─────────────────────┼──────────────────────────────────────────────────┤
| Class 1: UIDAI /    | - 12-digit Aadhaar Number (Washers & Admins)     |
| Identity Data       | - Aadhaar Card Photo Scans (Base64 / Data URLs)  |
| (HIGHEST SENSITIVITY| - KYC Verification Status & Police Clear records|
├─────────────────────┼──────────────────────────────────────────────────┤
| Class 2: Customer   | - Phone Number + Complete Physical Address       |
| Triad Identifier    | - Vehicle Registration / License Plate Number    |
| (HIGHEST SENSITIVITY| - Parking Bay Slot & Basement Location          |
|                     | - Customer Full Name & Alternate Contact         |
├─────────────────────┼──────────────────────────────────────────────────┤
| Class 3: Washer     | - Field Partner Mobile Phone & Email             |
| Financial & Auth    | - Bank Account Number & IFSC / UPI ID            |
|                     | - Plaintext Account Passwords in Database        |
|                     | - Daily Payouts & Assigned Society Routes        |
├─────────────────────┼──────────────────────────────────────────────────┤
| Class 4: Admin &    | - Area Manager Authentication Tokens             |
| Control Plane       | - Admin Full Name, Email, & Mobile Number        |
|                     | - Administrative Society Allocation Permissions  |
├─────────────────────┼──────────────────────────────────────────────────┤
| Class 5: Telemetry  | - GPS Geofence Coordinates (Latitude/Longitude)  |
| & Operational Proof | - Before/After Vehicle Cleaning Proof Photos     |
|                     | - Empty Bay In-Service Dispute Photos            |
|                     | - Customer Digital Signatures                    |
└─────────────────────┴──────────────────────────────────────────────────┘
```

---

## 2. Trust Boundaries

```
                 UNTRUSTED EXTERNAL NETWORK
                             │
     [ Anonymous Web Users / Attackers / Script Bots ]
                             │
═════════════════════════════╪═════════════════════════════════ [Trust Boundary 1: Edge / Web]
                             │
                     Next.js Frontend
                 (Runs inside User Browser)
             ┌───────────────┴───────────────┐
             │                               │
             ▼                               ▼
   Next.js API Handler              Browser Firebase SDK
   (/api/leads/route.ts)            (Direct WebSockets / REST)
             │                               │
═════════════╪═══════════════════════════════╪═════════════════ [Trust Boundary 2: Cloud Firestore]
             │                               │
             │                      Cloud Firestore
             │               (Subject to firestore.rules)
             │                ┌──────────────┼──────────────┐
             │                ▼              ▼              ▼
             │           Washers       Car_Owners    area_managers
             │
═════════════╪═════════════════════════════════════════════════ [Trust Boundary 3: External Integrations]
             ▼
   Google Apps Script Webhook
   (Google Sheets Spreadsheets)
```

1. **Trust Boundary 1 (Web Browser vs Next.js Server & APIs):**
   - Untrusted internet users interact with Next.js client pages and `/api/leads`.
   - Any client-side logic (JavaScript guards, route redirects, form validation) can be modified or completely bypassed by an attacker using browser devtools, `curl`, or custom scripts.
2. **Trust Boundary 2 (Web Browser Client vs Firebase Cloud Services):**
   - Because Torque Care does not use a backend server for 95% of operations, the browser client speaks directly to Google Cloud Firestore, Firebase Authentication, and Firebase Storage using public API keys in `src/lib/firebase.ts`.
   - Security at this boundary relies entirely on `firestore.rules`.
3. **Trust Boundary 3 (Application Server vs Third-Party Services):**
   - Server-side route handler `/api/leads/route.ts` communicates outbound with Google Apps Script Webhooks.
   - Payloads contain plain customer names, phone numbers, vehicle plates, and addresses.
4. **Trust Boundary 4 (Browser Runtime vs Local Storage):**
   - Authentication states (`torque_logged_in`, `torque_user`, `torque_admin_uid`, `torque_washer_id`) are persisted directly to HTML5 `localStorage`. Any script running on the origin (or XSS) has full read/write access.

---

## 3. Threat Actors

| Actor | Access Level | Motivation | Capabilities |
| :--- | :--- | :--- | :--- |
| **Anonymous Internet User** | Public Web, no credentials | Data scraping, extortion, mass harvesting | Can probe `/api/leads`, inspect public Firestore collections, scrape public assets. |
| **Prospective Lead** | Unauthenticated, submits interest form | Legitimate service inquiry | Submits name, phone, license plate, society. |
| **Authenticated Customer** | Possesses valid phone OTP session | Access personal car wash log & subscription | May attempt IDOR to view neighbors' vehicles, home addresses, or tamper with wash status. |
| **Washer Partner** | Authenticated via phone OTP or email/password | View daily route, log photos, view earnings | May attempt to view other washers' earnings, or escalate privileges to modify route assignments. |
| **Area Manager / Admin** | Access to `/admin/*` operations | Manage society routes, onboard washers, oversee billing | Full access to washers and customers in the UI. |
| **Compromised Admin Account** | High privilege, compromised credentials | Espionage, competitive theft, identity extortion | Can dump complete customer vehicle registries, bulk export leads, view all Aadhaar documents. |
| **Malicious Insider / Rogue Contractor** | Direct access to code or operational databases | Financial gain, competitive intelligence | Can extract plaintext passwords, unmasked Aadhaar scans, and sell customer car location data. |
| **Third-Party Services** | Google Apps Script, Firebase infrastructure | Service fulfillment | Receives forwarded PII data over network channels. |

---

## 4. Entry Points

1. **`POST /api/leads`** (`src/app/api/leads/route.ts#L5`): Ingestion of customer name, phone, car license plate, society, district, city, state.
2. **`GET /api/leads` & `GET /api/leads?format=csv`** (`src/app/api/leads/route.ts#L164`): Retrieval and mass CSV download of all captured customer leads.
3. **`DELETE /api/leads?id=...`** (`src/app/api/leads/route.ts#L273`): Unauthenticated deletion of customer lead documents.
4. **Direct Firestore Collection `Washers`** (`firestore.rules#L122`): Client SDK queries to `Washers/{washerId}`.
5. **Direct Firestore Collection `washer_directory`** (`firestore.rules#L172`): Client SDK queries to `washer_directory/{washerId}`.
6. **Direct Firestore Collection `Car_Owners`** (`firestore.rules#L340`): Client SDK queries to `Car_Owners/{ownerId}` and subcollections `Vehicles`, `Washes`.
7. **Direct Firestore Collection `area_managers`** (`firestore.rules#L99`): Client SDK writes to `area_managers/{managerId}`.
8. **Direct Firestore Collection `Lead_Registrations`** (`firestore.rules#L415`): Client SDK queries and writes to leads collection.
9. **Direct Firestore Collections `Substitutions` & `Admin_Notifications`** (`firestore.rules#L403-L408`): Supervisor delegation and audit records.
10. **Customer & Admin Auth Route `GET /auth/verify`** (`src/app/auth/verify/page.tsx#L39`): Parameterized role and phone verification.
11. **Washer Password Setup Route `GET /washer/set-password`** (`src/app/washer/set-password/page.tsx#L66`): Email-driven first-time password setup.
12. **Admin Portal Routes `GET /admin/*`** (`src/app/admin/*`): Unauthenticated client-rendered management pages.

---

## 5. STRIDE Threat Analysis

| Threat Category | Component / Flow | Attack Vector & Manifestation | Code Reference |
| :--- | :--- | :--- | :--- |
| **Spoofing** | Authentication (`/auth/verify`) | An attacker initiates Phone Auth, supplies their own phone number, but appends `?role=admin` to the URL. The client executes `syncAuthUserToFirestore` with `role: 'admin'`, granting immediate admin access. | `src/app/auth/verify/page.tsx#L220-L248` |
| **Spoofing** | Washer Login (`/washer/set-password`) | An attacker accesses `/washer/set-password?email=target@example.com` for any onboarded washer who has not yet logged in. The attacker sets their own password and claims the washer's account. | `src/app/washer/set-password/page.tsx#L101-L210` |
| **Tampering** | Customer Records (`Car_Owners`) | An attacker connects to Firestore and writes arbitrary vehicle license plates, modifies customer flat numbers, or wipes subscription records due to open write rules. | `firestore.rules#L344` |
| **Tampering** | Washer Data (`Washers`) | An attacker updates any washer document in Firestore to alter assigned societies, change payout bank details, or overwrite passwords due to `allow update: if true`. | `firestore.rules#L145` |
| **Repudiation** | Lead Deletion (`/api/leads`) | Any actor can call `DELETE /api/leads?id=lead_123`. The deletion soft-deletes the record in Firestore with no authentication, no identity check, and no audit trail of who issued the deletion. | `src/app/api/leads/route.ts#L273-L297` |
| **Repudiation** | Audit Logs (`Substitutions`) | Washer substitution and supervisor activity logs stored in `Substitutions` and `Admin_Notifications` have `allow write: if true;`, permitting rogue actors to erase or forge delegation records. | `firestore.rules#L404-L408` |
| **Information Disclosure** | Lead PII API (`GET /api/leads`) | Unauthenticated GET request dumps the complete customer database: Full Name, Phone, Car Plate, Society, District, City, State in JSON or CSV. | `src/app/api/leads/route.ts#L164-L260` |
| **Information Disclosure** | Washer Aadhaar & Passwords | World-readable `Washers` and `washer_directory` Firestore collections leak unmasked 12-digit Aadhaar numbers, phone numbers, and plaintext passwords. | `firestore.rules#L129, L184`, `firebaseService.ts#L1174` |
| **Information Disclosure** | Customer Location & Vehicles | World-readable `Car_Owners` leaks residential society, flat number, vehicle plate, car make/model, parking bay slot, and GPS coordinates. | `firestore.rules#L342, L355, L393` |
| **Denial of Service** | Lead Flooding (`POST /api/leads`) | Lack of IP rate limiting or CAPTCHA allows botnets to flood Firestore with fake leads and exhaust Google Apps Script webhook execution quotas. | `src/app/api/leads/route.ts#L5` |
| **Denial of Service** | Storage & DB Exhaustion | Base64-encoded photo files (up to 5MB each) uploaded directly into Firestore documents consume Firestore document size limits (1MB maximum) and storage quotas. | `AdminProfileCreationPage.tsx#L158-L168` |
| **Elevation of Privilege** | Admin Self-Registration | Any authenticated user creates a document under `area_managers/{auth.uid}`. Because `firestore.rules` allows `isOwner(managerId)` to create, and grants admin rights to anyone with a doc in `area_managers`, any user escalates to database-wide Admin. | `firestore.rules#L53, L65, L106` |
| **Elevation of Privilege** | Admin Panel Route Access | Visiting `/admin/dashboard` or `/admin/customers` directly in the browser bypasses login and falls back to default admin identity `'admin-lead-1'`, executing queries against Firestore. | `src/app/admin/dashboard/page.tsx#L34-L38` |

---

## 6. Concrete Attack Scenarios & Risk Scoring

*Risk Severity Formula:* **Risk = Likelihood × Impact** (Critical / High / Medium / Low)

```
┌──────────────┬──────────────────┬─────────────────┬───────────────────┐
│ Likelihood   │ Low (1)          │ Medium (2)      │ High (3)          │
├──────────────┼──────────────────┼─────────────────┼───────────────────┤
│ High (3)     │ Medium Risk (3)  │ High Risk (6)   │ CRITICAL RISK (9) │
│ Medium (2)   │ Low Risk (2)     │ Medium Risk (4) │ High Risk (6)     │
│ Low (1)      │ Low Risk (1)     │ Low Risk (2)    │ Medium Risk (3)   │
└──────────────┴──────────────────┴─────────────────┴───────────────────┘
```

### Scenario 1: Database-Wide Privilege Escalation via `area_managers` Self-Registration
- **Actor:** Any registered customer or washer with a valid Phone Auth token.
- **Preconditions:** Authenticated session in Firebase Auth (easy via SMS OTP).
- **Execution:**
  1. Attacker calls `firebase.firestore().collection('area_managers').doc(auth.currentUser.uid).set({ fullName: 'Attacker', role: 'Area Manager' })`.
  2. `firestore.rules` Line 106 evaluates `allow create: if isOwner(managerId)`. Because `request.auth.uid == managerId`, write succeeds.
  3. `firestore.rules` Lines 53 & 65 evaluate `isAdmin()` and `isAreaManager()`. Both check `exists(/databases/$(database)/documents/area_managers/$(request.auth.uid))`.
  4. The attacker is now granted full administrative permissions across all Firestore collections.
- **Impact:** Critical (Complete database takeover).
- **Likelihood:** High (Trivial to execute with 2 lines of JavaScript).
- **Risk Severity:** **CRITICAL** (Score: 9/9)
- **Citations:** `firestore.rules` Lines 49-67, 106 (*Confirmed*).

---

### Scenario 2: Unauthenticated Exfiltration and Mass Deletion of Customer Leads
- **Actor:** Anonymous internet visitor / competitor / malicious bot.
- **Preconditions:** Internet connectivity to the web domain.
- **Execution:**
  1. Attacker executes: `curl https://torquecare.in/api/leads?format=csv -o customers.csv`.
  2. Endpoint executes `GET /api/leads` with zero authentication, queries `Lead_Registrations` and `Car_Owners`, and downloads a CSV of all customer names, phone numbers, vehicle license plates, societies, and districts.
  3. Attacker parses lead IDs from output and executes loop: `curl -X DELETE "https://torquecare.in/api/leads?id=lead_xxx"`, wiping out customer records.
- **Impact:** Critical (Mass PII breach under DPDP Act 2023, data destruction).
- **Likelihood:** High (Zero barriers, publicly exposed route).
- **Risk Severity:** **CRITICAL** (Score: 9/9)
- **Citations:** `src/app/api/leads/route.ts` Lines 164-297 (*Confirmed*).

---

### Scenario 3: Complete Harvesting of Washer Aadhaar, Phones, and Plaintext Passwords
- **Actor:** Anonymous attacker.
- **Preconditions:** Knowledge of Firebase Project ID (hardcoded in public client bundle).
- **Execution:**
  1. Attacker opens browser console or Node.js script using the public Firebase configuration from `src/lib/firebase.ts`.
  2. Attacker runs: `firebase.firestore().collection('Washers').get()`.
  3. Firestore rules Line 129 (`allow read: if true;`) executes.
  4. Attacker downloads every washer partner's full name, phone number, unmasked 12-digit Aadhaar number, base64 Aadhaar card scans, bank account details, and plaintext passwords saved by `setWasherPasswordInFirestore`.
- **Impact:** Critical (Severe identity theft, Aadhaar Act violation, financial theft).
- **Likelihood:** High (Direct client access with no authentication).
- **Risk Severity:** **CRITICAL** (Score: 9/9)
- **Citations:** `firestore.rules` Line 129, `src/lib/firebaseService.ts` Lines 1174, 1193 (*Confirmed*).

---

### Scenario 4: Admin Role Impersonation via URL Query Parameter Manipulation
- **Actor:** Any user with a working mobile phone.
- **Preconditions:** Ability to receive SMS OTP.
- **Execution:**
  1. Attacker browses to `/auth/login`, enters their personal phone number.
  2. Before submitting OTP, attacker changes the browser URL to `/auth/verify?role=admin&phone=+91XXXXXXXXXX`.
  3. Attacker enters the legitimate OTP code.
  4. Client logic in `src/app/auth/verify/page.tsx` evaluates `if (roleParam === 'admin')` (Line 219), assigns the user `role: 'admin'`, assigns display name `'Vikram Malhotra (Ops Lead)'`, stores `role: 'admin'` in `localStorage`, and routes them to `/admin/dashboard`.
- **Impact:** Critical (Administrative console takeover).
- **Likelihood:** High (Requires only appending `?role=admin` to URL).
- **Risk Severity:** **CRITICAL** (Score: 9/9)
- **Citations:** `src/app/auth/verify/page.tsx` Lines 219-255 (*Confirmed*).

---

### Scenario 5: Unauthorized Washer Account Takeover via `/washer/set-password`
- **Actor:** Anonymous attacker or disgruntled partner.
- **Preconditions:** Knowing or scraping a washer's email address (accessible via Scenario 3).
- **Execution:**
  1. Attacker identifies a washer whose `passwordSet` flag is not yet true.
  2. Attacker visits `/washer/set-password?email=washer@example.com`.
  3. Page queries Firestore, verifies the record exists, and presents the password creation form with zero identity verification (no SMS OTP, no magic link).
  4. Attacker enters a new password. The client creates an account in Firebase Auth (`createUserWithEmailAndPassword`) and flags `passwordSet: true` in Firestore.
  5. The attacker gains exclusive control of the washer's portal and daily route.
- **Impact:** High (Unauthorized field account takeover, route sabotage).
- **Likelihood:** High (No verification step required).
- **Risk Severity:** **HIGH** (Score: 6/9)
- **Citations:** `src/app/washer/set-password/page.tsx` Lines 100-245 (*Confirmed*).

---

### Scenario 6: Customer Vehicle Stalking and Identity Harvesting via Public `Car_Owners` Rules
- **Actor:** Anonymous internet visitor.
- **Preconditions:** Firebase public config.
- **Execution:**
  1. Attacker queries `Car_Owners` collection and subcollections `Vehicles`, `Washes`.
  2. `firestore.rules` Lines 342, 355, 393 grant `allow read: if true;`.
  3. Attacker correlates vehicle registration numbers (e.g. `KA 01 MJ 1234`), customer names, exact residential societies, flat numbers, parking bay locations, and daily GPS timestamps from wash proof photos.
- **Impact:** High (Severe physical safety and stalking risks for car owners).
- **Likelihood:** High (No authentication needed).
- **Risk Severity:** **HIGH** (Score: 6/9)
- **Citations:** `firestore.rules` Lines 342, 355, 393 (*Confirmed*).

---

### Scenario 7: Unrestricted Denial of Service and Data Pollution on `/api/leads`
- **Actor:** Malicious script or competitor.
- **Preconditions:** Internet access.
- **Execution:**
  1. Attacker writes an automated script targeting `POST /api/leads`.
  2. Script sends 50,000 synthetic requests containing garbage vehicle plates and fake phone numbers.
  3. With no rate limiter, CAPTCHA, or WAF rule, the server processes every request, writing dual records into Firestore (`Lead_Registrations` and `Car_Owners`) and dispatching 50,000 requests to Google Apps Script.
  4. Firestore storage costs spike, Google Apps Script daily execution quota (20,000 requests) exhausts, and admin lead views become unusable.
- **Impact:** Medium (Operational disruption and service degradation).
- **Likelihood:** High (Trivial scriptable target).
- **Risk Severity:** **MEDIUM** (Score: 6/9)
- **Citations:** `src/app/api/leads/route.ts` Lines 5-160 (*Confirmed*).

---

### Scenario 8: Customer Exact Location & Device Identification via Base64 EXIF Photos
- **Actor:** Anyone with access to wash photos (publicly readable in Firestore).
- **Preconditions:** Photos taken by washer smartphones.
- **Execution:**
  1. Washer uploads parking bay proof photo using `FileReader.readAsDataURL` on their phone.
  2. Modern mobile cameras embed EXIF metadata (exact GPS coordinates, camera model, lens metadata, and precise timestamp).
  3. Raw photo bytes are uploaded directly to Firebase Storage or Firestore documents without EXIF stripping.
  4. An attacker downloads the photo, parses EXIF headers, and extracts the exact physical coordinate of the vehicle inside the apartment complex.
- **Impact:** Medium (Physical location disclosure).
- **Likelihood:** Medium (Depends on mobile browser metadata retention).
- **Risk Severity:** **MEDIUM** (Score: 4/9)
- **Citations:** `src/components/modals/OnboardWasherModal.tsx` Line 151, `src/lib/firebaseService.ts` Line 1803 (*Likely*).

---

## 7. Existing Mitigations & Remaining Gaps

```
┌─────────────────────────────────┬─────────────────────────────────┐
│ Existing Mitigations in Code    │ Remaining Critical Gaps         │
├─────────────────────────────────┼─────────────────────────────────┤
│ 1. Firebase Phone Auth          │ - Client-side role spoofing via │
│    with reCAPTCHA verification   │   URL query param (?role=admin) │
│    for owner login              │ - Test OTP code 4291 hardcoded  │
│    (src/lib/firebaseAuth.ts)    │   in modal (OnboardWasherModal) │
├─────────────────────────────────┼─────────────────────────────────┤
│ 2. XOR ID Obfuscation           │ - Uses static hardcoded key     │
│    (src/lib/idSecurity.ts)      │   'TorqueCareSecureWasher2026Key│
│    hiding washer database IDs   │ - Trivial client-side XOR; does │
│    in URL address bars          │   not protect backend queries   │
├─────────────────────────────────┼─────────────────────────────────┤
│ 3. Firestore Rules Structure    │ - 'allow read: if true;' on     │
│    defining role helper         │   Washers and Car_Owners defeats│
│    functions (isAdmin, isOwner) │   all role separation           │
│    (firestore.rules)            │ - area_managers create bug      │
│                                 │   allows self-escalation        │
├─────────────────────────────────┼─────────────────────────────────┤
│ 4. Client-side Domain Check     │ - Checked only in browser form  │
│    requiring '@torquecare.in'   │   (src/app/admin/login/page.tsx)│
│    for admin email login        │ - Not enforced in Firebase Auth │
│                                 │   or Firestore rules            │
├─────────────────────────────────┼─────────────────────────────────┤
│ 5. UI Aadhaar Masking           │ - Masking occurs ONLY in React  │
│    displaying '•••• •••• 1234'  │   JSX rendering                 │
│    (admin/washers/[id]/page.tsx)│ - Full 12 digits stored raw     │
│                                 │   in plaintext in Firestore     │
└─────────────────────────────────┴─────────────────────────────────┘
```

---

## 8. Assumptions and Unknowns

1. **Firebase Console Rules Status (*Needs verification*):** This audit is based on `firestore.rules` and `firebase.json` present in the git repository. If differing rules were manually deployed directly via the Firebase Web Console, production behavior may diverge.
2. **Firebase Storage Console Rules (*Needs verification*):** `firebase.json` does not declare a `storage.rules` file. Unless configured directly in the Firebase Console, Cloud Storage buckets default to either private or legacy public read.
3. **Google Apps Script Access Controls (*Needs verification*):** `GOOGLE_SHEETS_SETUP.md` specifies deploying Apps Script as "Anyone" (anonymous access). If so deployed, anyone possessing the webhook URL can insert arbitrary rows into the company spreadsheet.
