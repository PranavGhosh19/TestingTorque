# Torque Care — Secrets & Credential Management Analysis

**Audit Date:** October 7, 2026  
**Audited Commit Hash:** `b07fabc019ec452e175ba29302ace6862fbceec8`  
**Compliance Standard:** Principle of Least Privilege, Non-Disclosure of Secrets, Secure Credential Rotation  

> [!IMPORTANT]
> In accordance with security protocol, this document discloses zero actual API keys, private tokens, passwords, or live cryptographic key values. It catalogs secret locations, credential types, exposure vectors, and rotation runbooks.

---

## 1. Secrets Inventory & Classification

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
|                                     SECRETS INVENTORY                                       |
├─────────────────────┬──────────────────────────┬────────────────────────────┬───────────────┤
| Secret Identifier   | Location in Codebase     | Type & Storage Form        | Risk Severity |
├─────────────────────┼──────────────────────────┼────────────────────────────┼───────────────┤
| 1. Firebase Client  | src/lib/firebase.ts:8    | Google API Key             | Low/Medium    |
|    Browser Config   | scripts/migrate_washes:5 | (Hardcoded in public code) | (Config Open) |
├─────────────────────┼──────────────────────────┼────────────────────────────┼───────────────┤
| 2. URL XOR Cipher   | src/lib/idSecurity.ts:6  | Symmetric Encryption Key   | High          |
|    Key (Washer IDs) |                          | (Hardcoded plaintext str)  | (Trivial Brk) |
├─────────────────────┼──────────────────────────┼────────────────────────────┼───────────────┤
| 3. Mock Onboarding  | OnboardWasherModal:110   | 4-digit Test OTP Bypass    | High          |
|    Phone OTP        | OnboardWasherModal:179   | (Hardcoded in client code) | (Bypass Auth) |
├─────────────────────┼──────────────────────────┼────────────────────────────┼───────────────┤
| 4. Google Sheets    | .env.example:3           | HTTP Webhook URL           | Medium        |
|    Webhook URL      | src/app/api/leads:65     | (Environment Variable / DB)| (Spam Ingress)|
├─────────────────────┼──────────────────────────┼────────────────────────────┼───────────────┤
| 5. Washer Partner   | firebaseService.ts:1174  | User Account Passwords     | CRITICAL      |
|    Passwords        | firebaseService.ts:1193  | (Plaintext in Firestore)   | (Mass Leak)   |
├─────────────────────┼──────────────────────────┼────────────────────────────┼───────────────┤
| 6. Storage Media    | firebaseService.ts:1804  | Long-lived Download URLs   | Medium        |
|    Access Tokens    |                          | (Public Firebase Token)    | (Unauth View) |
└─────────────────────┴──────────────────────────┴────────────────────────────┴───────────────┘
```

---

## 2. In-Depth Analysis of Individual Secrets

### 1. Firebase Web Client Configuration & API Key
- **Locations:**
  - `src/lib/firebase.ts` Lines 8–14 (*Confirmed*)
  - `scripts/migrate_washes.mjs` Lines 4–11 (*Confirmed*)
- **Type:** Google Cloud API Key, Firebase Project ID (`cargoflow-j35du`), Auth Domain, Messaging Sender ID, and Web App ID.
- **Exposure Mechanism:**
  - The configuration object is checked into source code and bundled into client-side JavaScript shipped to every browser visitor.
  - In `scripts/migrate_washes.mjs`, the configuration is embedded in a standalone Node.js migration script.
- **Risk Assessment:**
  - Firebase API keys are designed to be public client identifiers; however, their security depends **100% on Firebase Security Rules**.
  - Because `firestore.rules` currently permits world-readable access on `Washers` and `Car_Owners`, and allows self-service privilege escalation on `area_managers`, possessing this API key and project ID allows an anonymous attacker to execute read and write operations against production databases.
- **Exposure Risk:** **HIGH** (amplified by open Firestore rules).

---

### 2. Washer ID XOR Symmetric Encryption Key
- **Location:**
  - `src/lib/idSecurity.ts` Line 6 (*Confirmed*)
- **Type:** Symmetric obfuscation string used to "encrypt" internal washer IDs in URLs (e.g. converting `wsh_1791234769370` into `enc_331c...`).
- **Exposure Mechanism:**
  - Declared as a module-level constant string in TypeScript and bundled into client JavaScript.
  - The encryption algorithm (Lines 18–21) is a single-byte cyclic XOR cipher:
    ```typescript
    const code = id.charCodeAt(i) ^ WASHER_SECRET_KEY.charCodeAt(i % WASHER_SECRET_KEY.length);
    ```
- **Risk Assessment:**
  - Any attacker inspecting the JavaScript bundle can extract the key in seconds.
  - Even without the key, because the plaintext prefix `wsh_` is known and constant, a known-plaintext attack recovers the first 4 characters of the key immediately.
  - The function `decryptWasherId` (Lines 35–37) falls back to decoding unencrypted IDs if the prefix `enc_` is absent, allowing attackers to bypass the cipher entirely by submitting raw IDs.
- **Exposure Risk:** **HIGH** (Provides false sense of security; zero cryptographic protection).

---

### 3. Hardcoded Test OTP Code in Washer Onboarding Modal
- **Locations:**
  - `src/components/modals/OnboardWasherModal.tsx` Line 110 (*Confirmed*): Initial state `const [phoneOtp, setPhoneOtp] = useState(['4', '2', '9', '1']);`
  - `src/components/modals/OnboardWasherModal.tsx` Line 179 (*Confirmed*): Error instruction `'Invalid OTP code. Use test code 4291'`
- **Type:** Static 4-digit verification code.
- **Exposure Mechanism:**
  - Hardcoded directly into the React component source code and error messages.
- **Risk Assessment:**
  - The onboarding workflow permits field partners to be marked as "Phone Verified" without sending an actual SMS or verifying carrier identity.
  - If an untrusted actor accesses this interface, they can onboard arbitrary phone numbers without the owner of that phone number ever being notified or verifying consent.
- **Exposure Risk:** **HIGH**.

---

### 4. Google Sheets Webhook Deployment URL
- **Locations:**
  - `.env.example` Line 3 (*Confirmed*)
  - `src/app/api/leads/route.ts` Line 65 (*Confirmed*)
  - `GOOGLE_SHEETS_SETUP.md` Line 3 (*Confirmed*)
  - Firestore fallback: `doc(db, 'System_Settings', 'integrations')` Line 70 (*Confirmed*)
- **Type:** Google Apps Script Web App Endpoint URL (`https://script.google.com/macros/s/.../exec`).
- **Exposure Mechanism:**
  - Loaded server-side via `process.env.GOOGLE_SHEETS_WEBHOOK_URL` in the Next.js API route.
  - Also falls back to `process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL`, which if defined in `.env.local`, would bundle the URL directly into client-side JavaScript.
  - Can also be read from the unauthenticated Firestore collection `System_Settings/integrations`.
- **Risk Assessment:**
  - Google Apps Script web apps deployed with execution access "Anyone" have no authentication header requirement.
  - If this URL leaks, any actor can spam rows directly into the company's internal Google Sheet, pollute records, or execute denial of service against Apps Script daily quota limits.
- **Exposure Risk:** **MEDIUM**.

---

### 5. Plaintext Washer Passwords Stored in Database Documents
- **Locations:**
  - `src/lib/firebaseService.ts` Line 1174 (*Confirmed*): `password: newPassword` saved to `Washers/{targetDocId}`
  - `src/lib/firebaseService.ts` Line 1193 (*Confirmed*): `password: newPassword` saved to `washer_directory/{targetDocId}`
  - `src/lib/firebaseService.ts` Line 1246 (*Confirmed*): `storedPassword = (washer as any).password;`
  - `src/lib/firebaseService.ts` Line 1258 (*Confirmed*): `if (storedPassword !== passwordAttempt)`
- **Type:** User authentication credentials in reversible plaintext.
- **Exposure Mechanism:**
  - Stored directly as plaintext string fields (`password`) inside Firestore documents.
  - Duplicated across two collections: `Washers` and `washer_directory`.
  - Both collections are world-readable via `firestore.rules` (Lines 129 and 184).
- **Risk Assessment:**
  - Passwords are never hashed (e.g. Argon2, bcrypt, or PBKDF2).
  - Anyone querying Firestore downloads all washer passwords in plaintext.
  - Passwords are also exposed in client-side memory and logged in console warnings if network errors occur.
- **Exposure Risk:** **CRITICAL**.

---

### 6. Firebase Storage Download URLs
- **Locations:**
  - `src/lib/firebaseService.ts` Line 1804 (*Confirmed*)
- **Type:** Firebase Storage download URL containing a long-lived security token (`alt=media&token=...`).
- **Exposure Mechanism:**
  - Stored inside `Washes` records and vehicle documents.
- **Risk Assessment:**
  - Once generated, these URLs are publicly accessible to anyone who obtains the link, without checking authentication or session expiration.
  - They do not expire unless revoked in the Firebase Console.
- **Exposure Risk:** **MEDIUM**.

---

## 3. Git History & `.gitignore` Coverage Audit

### `.gitignore` Coverage
An inspection of `.gitignore` at the repository root reveals:
```gitignore
# env files (can opt-in for committing if needed)
.env*
```
- **Strengths:** `.env*` correctly prevents standard files (`.env`, `.env.local`, `.env.production`) from being committed by default.
- **Deficiencies:**
  - Comment in Line 33 suggests developers can opt-in to committing env files.
  - No ignore rules exist for Firebase service account keys (`*.json`, `service-account*.json`, `firebase-adminsdk*.json`).
  - No ignore rules exist for `.pem`, `.key`, or `.cert` files other than `*.pem` (Line 25).

### Git History Audit
A historical audit of the git commit graph (`git log --stat` and commit history inspection):
1. **Commit `3695786` (Oct 7, 2026):**
   - Added `GOOGLE_SHEETS_SETUP.md` with template Google Apps Script code.
   - Added `.env.example` with placeholder `YOUR_APPS_SCRIPT_ID`. No live webhook secret was committed.
2. **Commit `09fa6c2` (Oct 6, 2026):**
   - Introduced washer password setup logic and added plaintext password fields into `firebaseService.ts`.
3. **Commit `29d7dfe` (Oct 6, 2026):**
   - Added `src/lib/idSecurity.ts` containing the hardcoded XOR key string.
4. **No Service Account Key Committed (*Confirmed*):**
   - No Google Cloud / Firebase Admin private service account JSON key has ever been committed to this repository.

---

## 4. Secret Rotation & Exposure Runbooks

### Runbook 1: Firebase API Key & Project Hardening
1. **Action:** Firebase API keys cannot be entirely hidden from browser clients in a PWA architecture; they must be constrained.
2. **Steps:**
   - In Google Cloud Console (`console.cloud.google.com`), navigate to **APIs & Services** → **Credentials**.
   - Select the browser key used in `src/lib/firebase.ts`.
   - Under **Application restrictions**, set **HTTP referrers (web sites)** and add authorized domains only (`torquecare.in`, `*.torquecare.in`, `localhost:3000`).
   - Under **API restrictions**, restrict key strictly to:
     - Identity Toolkit API (Firebase Authentication)
     - Cloud Firestore API
     - Cloud Storage for Firebase API
   - Remove access to all other Google Cloud APIs.

### Runbook 2: Deprecate XOR Cipher & Remove Hardcoded Key
1. **Action:** Completely remove `WASHER_SECRET_KEY` from client code.
2. **Steps:**
   - Obfuscating database IDs in URLs with client-side XOR does not provide security.
   - Replace XOR tokens with random opaque UUIDs (or ULIDs) or secure server-side HMAC tokens generated exclusively on a backend server.
   - Remove `WASHER_SECRET_KEY` from `src/lib/idSecurity.ts`.

### Runbook 3: Purge Plaintext Passwords from Firestore
1. **Action:** Immediately eliminate plaintext passwords from database collections.
2. **Steps:**
   - Execute a database cleanup script to delete the `password` field from all documents in `Washers` and `washer_directory`.
   - Update `setWasherPasswordInFirestore` to **never** write passwords to Firestore.
   - Delegate all password storage exclusively to Firebase Authentication (`createUserWithEmailAndPassword` or `updatePassword`), which stores passwords hashed using scrypt.

### Runbook 4: Google Sheets Webhook Secret Rotation
1. **Action:** Rotate Google Apps Script deployment URL.
2. **Steps:**
   - Open the Google Sheet → Extensions → Apps Script.
   - Create a **New Deployment** (generating a fresh URL) and archive/delete the old deployment.
   - Add the new URL strictly to `.env.local` as `GOOGLE_SHEETS_WEBHOOK_URL`.
   - Remove `NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL` references to prevent client bundling.
   - Delete any plain webhook URLs stored in `System_Settings/integrations`.
