# Torque Care — Prioritized Security Remediation Checklist

**Audit Date:** October 7, 2026  
**Audited Commit Hash:** `b07fabc019ec452e175ba29302ace6862fbceec8`  
**Effort Metric:**  
- **S (Small):** Under 1 day (< 8 hours)  
- **M (Medium):** 2 to 3 days  
- **L (Large):** 1 to 2 weeks  

---

## 1. Quick Wins (< 1 Day Remediations)

These high-impact fixes can be implemented immediately in under a day without architectural refactoring, eliminating the most catastrophic exposure vectors:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
|                                              QUICK WINS MATRIX                                              |
├──────┬──────────────────────────────────┬─────────────────────────────┬────────┬────────────────────────────┤
| #    | Remediation Action               | Target File & Line          | Effort | Immediate Impact           |
├──────┼──────────────────────────────────┼─────────────────────────────┼────────┼────────────────────────────┤
| QW-1 | Delete Unauthenticated GET &     | src/app/api/leads/route.ts  | S      | Stops instant mass         |
|      | DELETE handlers on /api/leads    | Lines 164–297               | (1 hr) | download & deletion of PII |
├──────┼──────────────────────────────────┼─────────────────────────────┼────────┼────────────────────────────┤
| QW-2 | Remove 'allow create: if isOwner'| firestore.rules             | S      | Closes database-wide       |
|      | on /area_managers collection     | Line 106                    | (30 m) | privilege escalation bug   |
├──────┼──────────────────────────────────┼─────────────────────────────┼────────┼────────────────────────────┤
| QW-3 | Eliminate 'allow read/update:    | firestore.rules             | S      | Prevents world-scraping    |
|      | if true' on /Washers             | Lines 129, 145              | (1 hr) | of washer Aadhaar & phone  |
├──────┼──────────────────────────────────┼─────────────────────────────┼────────┼────────────────────────────┤
| QW-4 | Stop writing plaintext passwords | src/lib/firebaseService.ts  | S      | Halts ongoing credential   |
|      | to Firestore Washers collection  | Lines 1174, 1193            | (1 hr) | exposure in database       |
├──────┼──────────────────────────────────┼─────────────────────────────┼────────┼────────────────────────────┤
| QW-5 | Remove hardcoded test OTP '4291' | OnboardWasherModal.tsx      | S      | Stops unauthorized mock    |
|      | from washer onboarding modal     | Lines 110, 179              | (30 m) | partner onboarding         |
├──────┼──────────────────────────────────┼─────────────────────────────┼────────┼────────────────────────────┤
| QW-6 | Remove '?role=admin' assignment  | src/app/auth/verify/page.tsx| S      | Blocks query-param admin   |
|      | branch in Phone Auth callback    | Lines 219–255               | (1 hr) | role spoofing              |
├──────┼──────────────────────────────────┼─────────────────────────────┼────────┼────────────────────────────┤
| QW-7 | Add HTTP Security Headers in     | next.config.ts              | S      | Mitigates clickjacking     |
|      | next.config.ts (HSTS, CSP, Frame)| Lines 1–8                   | (2 hr) | and MIME-sniffing vectors  |
└──────┴──────────────────────────────────┴─────────────────────────────┴────────┴────────────────────────────┘
```

---

## 2. Prioritized Action Matrix

### Priority 0: Critical Severity (Address Immediately)

#### [SEC-01] Eliminate Database-Wide Privilege Escalation in `firestore.rules`
- **Confidence:** Confirmed
- **File Reference:** `firestore.rules#L106`
- **Finding:** `match /area_managers/{managerId}` allows `create: if isOwner(managerId)`. Because `isAdmin()` and `isAreaManager()` evaluate `exists(/databases/$(database)/documents/area_managers/$(request.auth.uid))`, any authenticated user (e.g. customer) can create an `area_managers` document for themselves and immediately gain database-wide administrative privileges.
- **Recommended Fix:**
  Change Line 106 to:
  ```javascript
  allow create: if isSuperAdmin();
  ```
  Ensure Area Manager documents can only be created by an authenticated Super Admin using Firebase Custom Auth Claims (`request.auth.token.role == 'super_admin'`).
- **Effort Estimate:** **S** (30 minutes)

---

#### [SEC-02] Restrict or Remove Unauthenticated `GET` and `DELETE` on `/api/leads`
- **Confidence:** Confirmed
- **File Reference:** `src/app/api/leads/route.ts#L164-L297`
- **Finding:** `GET /api/leads` and `GET /api/leads?format=csv` return complete customer personal details (Full Name, Phone, Car Plate, Society, City, State) to anyone on the internet with zero authentication. `DELETE /api/leads` permits unauthenticated record deletion.
- **Recommended Fix:**
  1. Remove `GET` and `DELETE` from the public API route handler.
  2. Implement an authenticated Next.js Server Action or secure API route checking a verified Firebase Admin session cookie:
     ```typescript
     import { verifyAdminSession } from '@/lib/serverAuth';
     export async function GET(req: NextRequest) {
       const session = await verifyAdminSession(req);
       if (!session || session.role !== 'admin') {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
       }
       // proceed with authenticated query
     }
     ```
- **Effort Estimate:** **S** (1 hour)

---

#### [SEC-03] Lock Down `Washers` and `washer_directory` World-Read/Write in Firestore
- **Confidence:** Confirmed
- **File Reference:** `firestore.rules#L129, L145, L184, L200`
- **Finding:** `Washers` and `washer_directory` have `allow read: if true;` and `allow update: if true;`. An unauthenticated attacker can dump all field partners' full names, unmasked Aadhaar numbers, phone numbers, bank details, and plaintext passwords, or overwrite records.
- **Recommended Fix:**
  Update rules to restrict read access:
  ```javascript
  match /Washers/{washerId} {
    // Only the washer themselves or an authorized manager can read
    allow read: if isAuthenticated() && (request.auth.uid == washerId || isAdmin());
    allow create, update, delete: if isAdmin() || isSuperAdmin();
  }

  match /washer_directory/{washerId} {
    // Public directory should only contain non-sensitive fields
    allow read: if true;
    allow write: if isAdmin() || isSuperAdmin();
  }
  ```
  Ensure sensitive fields (`aadhaarNumber`, `password`, `bank_account_last4`) are never mirrored to `washer_directory`.
- **Effort Estimate:** **S** (1–2 hours)

---

#### [SEC-04] Purge Plaintext Password Storage in Firestore
- **Confidence:** Confirmed
- **File Reference:** `src/lib/firebaseService.ts#L1174, L1193, L1246-L1265`
- **Finding:** `setWasherPasswordInFirestore` saves passwords as plaintext strings into `Washers` and `washer_directory`. Client-side authentication in `verifyWasherPasswordInFirestore` compares passwords using `storedPassword !== passwordAttempt` in browser JavaScript.
- **Recommended Fix:**
  1. Stop writing `password` to Firestore entirely.
  2. Authenticate washers exclusively via Firebase Authentication's native `signInWithEmailAndPassword`, which uses secure server-side scrypt password hashing.
  3. Execute a one-time migration script to delete the `password` field from all existing documents in `Washers` and `washer_directory`.
- **Effort Estimate:** **S** (2 hours)

---

#### [SEC-05] Remove URL-Based Admin Role Spoofing in `/auth/verify`
- **Confidence:** Confirmed
- **File Reference:** `src/app/auth/verify/page.tsx#L219-L255`
- **Finding:** If a user passes `?role=admin` in the URL query string when verifying Phone Auth OTP, the client code assigns the user `role: 'admin'`, names them `'Vikram Malhotra (Ops Lead)'`, stores `role: 'admin'` in `localStorage`, and routes them to `/admin/dashboard`.
- **Recommended Fix:**
  Delete the `else if (roleParam === 'admin')` block. Admin accounts must never be provisioned or activated through client-supplied query parameters. Admin identity must be verified by querying a pre-authorized admin whitelist in Firestore or via custom claims on the server.
- **Effort Estimate:** **S** (1 hour)

---

### Priority 1: High Severity (Remediate in Sprint 1)

#### [SEC-06] Enforce Strict Authorization Rules on `Car_Owners` and Vehicle Collections
- **Confidence:** Confirmed
- **File Reference:** `firestore.rules#L342, L344, L355, L357, L393`
- **Finding:** `Car_Owners` has `allow read: if true;` and `allow create, update: if true;`. Vehicle records and daily wash logs (`Washes`) are open to public read and write, permitting car stalking and tampering.
- **Recommended Fix:**
  Restrict access so customers can only access their own vehicle records:
  ```javascript
  match /Car_Owners/{ownerId} {
    allow read, update: if isAuthenticated() && (request.auth.uid == ownerId || isAdmin());
    allow create: if isAuthenticated() && request.auth.uid == ownerId;
    allow delete: if isAdmin() || isSuperAdmin();

    match /Vehicles/{vehicleId} {
      allow read, update: if isAuthenticated() && (request.auth.uid == ownerId || isAdmin() || isAssignedWasher(vehicleId));
      allow create: if isAuthenticated() && request.auth.uid == ownerId;
      allow delete: if isAdmin() || isSuperAdmin();

      match /Washes/{washId} {
        allow read: if isAuthenticated() && (request.auth.uid == ownerId || isAdmin() || isAssignedWasher(vehicleId));
        allow write: if isAuthenticated() && (isAssignedWasher(vehicleId) || isAdmin());
      }
    }
  }
  ```
- **Effort Estimate:** **M** (2 days)

---

#### [SEC-07] Implement Next.js Server-Side Middleware for Admin Route Protection
- **Confidence:** Confirmed
- **File Reference:** Repository Root (Missing `src/middleware.ts`)
- **Finding:** Admin pages (`/admin/*`) have no server-side route guards. Pages render in the browser and fall back to dummy admin identities (`admin-lead-1`).
- **Recommended Fix:**
  Create `src/middleware.ts` to intercept `/admin/*` routes. Validate the session cookie before rendering the page; if unauthenticated, issue a server HTTP 307 redirect to `/admin/login`:
  ```typescript
  import { NextResponse } from 'next/server';
  import type { NextRequest } from 'next/server';

  export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
      const session = request.cookies.get('torque_admin_session');
      if (!session) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    }
    return NextResponse.next();
  }

  export const config = {
    matcher: ['/admin/:path*'],
  };
  ```
- **Effort Estimate:** **M** (2 days)

---

#### [SEC-08] Secure First-Time Washer Password Creation Flow
- **Confidence:** Confirmed
- **File Reference:** `src/app/washer/set-password/page.tsx#L100-L245`
- **Finding:** Navigating to `/washer/set-password?email=target@example.com` allows an attacker to set the password for any washer whose `passwordSet` flag is false without any identity verification.
- **Recommended Fix:**
  Do not allow password setup solely based on an email parameter in the URL. Require the washer to verify their registered phone number via Firebase Phone SMS OTP before permitting password creation, or dispatch a secure Firebase Auth email action link (`sendSignInLinkToEmail`).
- **Effort Estimate:** **M** (2 days)

---

#### [SEC-09] Rate Limit and Add CAPTCHA on `POST /api/leads`
- **Confidence:** Confirmed
- **File Reference:** `src/app/api/leads/route.ts#L5-L35`
- **Finding:** Lack of IP rate limiting allows automated botnets to flood lead registrations, exhaust Google Apps Script quotas, and pollute customer databases.
- **Recommended Fix:**
  1. Integrate an in-memory or Redis-based rate limiter (e.g. `@upstash/ratelimit` or sliding-window IP limiter restricting submissions to 5 per IP per 10 minutes).
  2. Validate a reCAPTCHA v3 or Cloudflare Turnstile token server-side before writing to Firestore.
- **Effort Estimate:** **S** (1 day)

---

### Priority 2: Medium Severity (Remediate in Sprint 2)

#### [SEC-10] Enforce Mandatory Aadhaar Masking and Transition to Verified Offline KYC
- **Confidence:** Confirmed
- **File Reference:** `src/components/modals/OnboardWasherModal.tsx#L122, L198`, `src/app/admin/profile-creation/page.tsx#L150, L187`
- **Finding:** Full 12-digit Aadhaar numbers and raw image scans are collected and stored unencrypted in Firestore, violating UIDAI regulations and India's DPDP Act 2023.
- **Recommended Fix:**
  1. Mask the first 8 digits immediately upon ingestion. Store only the last 4 digits (`•••• •••• XXXX`) in the database.
  2. Cease storing full photographic scans of Aadhaar cards in Firestore base64.
  3. Replace manual Aadhaar photo collection with government-approved DigiLocker or offline XML verification where an opaque verification token is retained instead of identity documents.
- **Effort Estimate:** **M** (3 days)

---

#### [SEC-11] Strip EXIF Metadata from Photo Uploads
- **Confidence:** Likely
- **File Reference:** `src/components/modals/OnboardWasherModal.tsx#L146-L155`, `src/lib/firebaseService.ts#L1802`
- **Finding:** Uploaded camera photos retain embedded EXIF headers containing GPS coordinates of customer parking bays and camera device identifiers.
- **Recommended Fix:**
  Before uploading image data URLs, draw the image to an HTML5 Canvas and re-export as JPEG/WebP to strip all EXIF metadata:
  ```typescript
  function stripExif(file: File): Promise<Blob> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.85);
      };
      img.src = URL.createObjectURL(file);
    });
  }
  ```
- **Effort Estimate:** **S** (1 day)

---

#### [SEC-12] Deprecate Static XOR Cipher for Washer IDs
- **Confidence:** Confirmed
- **File Reference:** `src/lib/idSecurity.ts#L6-L53`
- **Finding:** `WASHER_SECRET_KEY = 'TorqueCareSecureWasher2026Key'` is hardcoded in client code and uses an easily breakable XOR cipher.
- **Recommended Fix:**
  Use non-sequential, non-guessable random UUIDv4 or ULID identifiers for washers. Do not rely on client-side obfuscation. Enforce authorization on the washer details route.
- **Effort Estimate:** **S** (1 day)

---

#### [SEC-13] Lock Down Audit Trail Collections in Firestore
- **Confidence:** Confirmed
- **File Reference:** `firestore.rules#L404, L408`
- **Finding:** `Substitutions` and `Admin_Notifications` permit world-writes (`allow write: if true;`), allowing rogue actors to delete or forge audit records.
- **Recommended Fix:**
  Restrict creation to authenticated users and completely deny updates and deletions:
  ```javascript
  match /Substitutions/{subId} {
    allow read: if isAuthenticated() && isAdmin();
    allow create: if isAuthenticated() && isAdmin();
    allow update, delete: if false; // Immutable audit trail
  }

  match /Admin_Notifications/{notifId} {
    allow read: if isAuthenticated() && isAdmin();
    allow create: if isAuthenticated();
    allow update, delete: if false; // Append-only notifications
  }
  ```
- **Effort Estimate:** **S** (30 minutes)

---

### Priority 3: Low Severity & Governance (Remediate in Sprint 3)

#### [SEC-14] Configure HTTP Security Response Headers
- **Confidence:** Confirmed
- **File Reference:** `next.config.ts#L1-L8`
- **Finding:** Absence of standard security headers leaves the site exposed to framing/clickjacking, cross-site scripting (XSS), and MIME-sniffing.
- **Recommended Fix:**
  Add custom headers in `next.config.ts`:
  ```typescript
  const nextConfig: NextConfig = {
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            { key: 'X-Frame-Options', value: 'DENY' },
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
            { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
            { key: 'Permissions-Policy', value: 'camera=(self), geolocation=(self), microphone=()' },
          ],
        },
      ];
    },
  };
  ```
- **Effort Estimate:** **S** (1 hour)

---

#### [SEC-15] Publish DPDP Act 2023 Consent Notices & Grievance Contact
- **Confidence:** Confirmed
- **File Reference:** `src/app/page.tsx`, `src/app/auth/signup/page.tsx`, `src/components/modals/LeadRegistrationModal.tsx`
- **Finding:** No formal privacy policy, DPDP Act consent declaration, or Grievance Officer details are published.
- **Recommended Fix:**
  1. Add an explicit consent notice and checkbox on the landing page lead registration modal and customer signup form.
  2. Publish a dedicated Privacy Policy page detailing personal data categories, purpose limitation, retention duration, and rights of Data Principals.
  3. Publish the name, physical address, and official email of the designated Grievance Officer in India.
- **Effort Estimate:** **M** (2 days)

---

#### [SEC-16] Audit Logging for Bulk Data Exports
- **Confidence:** Confirmed
- **File Reference:** `src/app/admin/leads/page.tsx#L108-L160`
- **Finding:** Clicking "Export to Excel" downloads all customer leads without generating an audit record.
- **Recommended Fix:**
  Record every bulk export event into an immutable `Audit_Logs` collection in Firestore, capturing the administrator's UID, timestamp, record count, and client IP address.
- **Effort Estimate:** **S** (1 day)
