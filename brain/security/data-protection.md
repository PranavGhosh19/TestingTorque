# Torque Care — Data Protection & Privacy Compliance Assessment

**Audit Date:** October 7, 2026  
**Audited Commit Hash:** `b07fabc019ec452e175ba29302ace6862fbceec8`  
**Applicable Legal Frameworks:** India Digital Personal Data Protection (DPDP) Act 2023, Aadhaar Act 2016 & Aadhaar Authentication Regulations, IT Act 2000 (SPDI Rules 2011)  

---

## 1. Comprehensive Personal Data Inventory

Torque Care collects and persists personal identifiers across three distinct stakeholder groups. Below is an inventory mapping every field, storage location, access permissions, encryption posture, retention policy, and deletion path:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
|                                                    PERSONAL DATA INVENTORY                                                       |
├───────────────┬────────────────────────────┬─────────────────────────────┬──────────────────────────┬──────────────┬─────────────┤
| Data Subject  | Field Name & Description   | Storage Location            | Access Control in Rules  | Encryption   | Deletion    |
├───────────────┼────────────────────────────┼─────────────────────────────┼──────────────────────────┼──────────────┼─────────────┤
| **CUSTOMER**  | Full Name (`fullName`)     | Lead_Registrations/{id}     | allow read: if true;     | Google At-   | None        |
|               |                            | Car_Owners/{id}             | allow read: if true;     | Rest only    | (No UI path)|
├───────────────┼────────────────────────────┼─────────────────────────────┼──────────────────────────┼──────────────┼─────────────┤
| **CUSTOMER**  | Mobile Phone (`phone`)     | Lead_Registrations,         | allow read: if true;     | None at app  | None        |
|               | (Primary Contact)          | Car_Owners, RouteStop       | (World-readable)         | layer        |             |
├───────────────┼────────────────────────────┼─────────────────────────────┼──────────────────────────┼──────────────┼─────────────┤
| **CUSTOMER**  | Vehicle Number Plate       | Car_Owners/{id}/Vehicles/   | allow read: if true;     | None at app  | None        |
|               | (e.g. KA 01 MJ 1234)       | Lead_Registrations, Washes  | (World-readable)         | layer        |             |
├───────────────┼────────────────────────────┼─────────────────────────────┼──────────────────────────┼──────────────┼─────────────┤
| **CUSTOMER**  | Complete Residential Addr  | Car_Owners/{id}             | allow read: if true;     | Plaintext    | None        |
|               | (Society, Wing, Flat No.)  | Lead_Registrations          | (World-readable)         |              |             |
├───────────────┼────────────────────────────┼─────────────────────────────┼──────────────────────────┼──────────────┼─────────────┤
| **CUSTOMER**  | Parking Bay Slot Location  | Car_Owners/.../Vehicles/{id}| allow read: if true;     | Plaintext    | None        |
|               | (e.g. Basement 1, Bay 42)  | RouteStop, Washes           |                          |              |             |
├───────────────┼────────────────────────────┼─────────────────────────────┼──────────────────────────┼──────────────┼─────────────┤
| **CUSTOMER**  | Wash Proof Photos & GPS    | Washes/{washId}             | allow read: if true;     | Public token | None        |
|               | (Lat/Long, Time, Photos)   | Cloud Storage (proofs/)     |                          | URLs         |             |
├───────────────┼────────────────────────────┼─────────────────────────────┼──────────────────────────┼──────────────┼─────────────┤
| **WASHER**    | Full Name (`name`)         | Washers/{id},               | allow read: if true;     | Plaintext    | Soft-delete |
|               |                            | washer_directory/{id}       |                          |              | via Admin   |
├───────────────┼────────────────────────────┼─────────────────────────────┼──────────────────────────┼──────────────┼─────────────┤
| **WASHER**    | Mobile Phone (`phone`)     | Washers/{id},               | allow read: if true;     | Plaintext    | Soft-delete |
|               |                            | washer_directory/{id}       |                          |              |             |
├───────────────┼────────────────────────────┼─────────────────────────────┼──────────────────────────┼──────────────┼─────────────┤
| **WASHER**    | Official Email (`email`)   | Washers/{id}, Auth          | allow read: if true;     | Plaintext    | Soft-delete |
├───────────────┼────────────────────────────┼─────────────────────────────┼──────────────────────────┼──────────────┼─────────────┤
| **WASHER**    | 12-Digit Aadhaar Number    | Washers/{id}                | allow read: if true;     | UNENCRYPTED  | None        |
| (HIGH RISK)   | (Full unmasked UIDAI no.)  | `aadhaarNumber`             | (World-readable!)        | Plaintext    |             |
├───────────────┼────────────────────────────┼─────────────────────────────┼──────────────────────────┼──────────────┼─────────────┤
| **WASHER**    | Aadhaar Card Photo Scan    | Washers/{id}                | allow read: if true;     | UNENCRYPTED  | None        |
| (HIGH RISK)   | (Base64 data URL string)   | `aadhaarPhotoUrl`           | (World-readable!)        | Raw Base64   |             |
├───────────────┼────────────────────────────┼─────────────────────────────┼──────────────────────────┼──────────────┼─────────────┤
| **WASHER**    | Account Plaintext Password | Washers/{id},               | allow read: if true;     | UNENCRYPTED  | Purged on   |
| (CRITICAL)    | (`password` field)         | washer_directory/{id}       | (World-readable!)        | Plaintext    | 2nd setup   |
├───────────────┼────────────────────────────┼─────────────────────────────┼──────────────────────────┼──────────────┼─────────────┤
| **WASHER**    | Bank Account & UPI ID      | Washers/{id}                | allow read: if true;     | Plaintext    | None        |
├───────────────┼────────────────────────────┼─────────────────────────────┼──────────────────────────┼──────────────┼─────────────┤
| **ADMIN**     | Full Name (`fullName`)     | area_managers/{id}          | isOwner or isSuperAdmin  | Plaintext    | Super Admin |
├───────────────┼────────────────────────────┼─────────────────────────────┼──────────────────────────┼──────────────┼─────────────┤
| **ADMIN**     | Mobile Phone & Email       | area_managers/{id}          | isOwner or isSuperAdmin  | Plaintext    | Super Admin |
├───────────────┼────────────────────────────┼─────────────────────────────┼──────────────────────────┼──────────────┼─────────────┤
| **ADMIN**     | 12-Digit Aadhaar Number    | area_managers/{id}          | isOwner or isSuperAdmin  | UNENCRYPTED  | Super Admin |
| (HIGH RISK)   | (Full unmasked number)     | `aadhaarNumber`             |                          | Plaintext    |             |
├───────────────┼────────────────────────────┼─────────────────────────────┼──────────────────────────┼──────────────┼─────────────┤
| **ADMIN**     | Aadhaar Card Photo Scan    | area_managers/{id}          | isOwner or isSuperAdmin  | UNENCRYPTED  | Super Admin |
| (HIGH RISK)   | (Base64 data URL string)   | `aadhaarPhotoUrl`           |                          | Raw Base64   |             |
└───────────────┴────────────────────────────┴─────────────────────────────┴──────────────────────────┴──────────────┴─────────────┘
```

---

## 2. In-Depth Aadhaar Handling Audit

The Aadhaar Act 2016 and subsequent UIDAI circulars mandate that **no entity shall store the 12-digit Aadhaar number in plain text, nor require physical/digital copies of Aadhaar cards without masking the first 8 digits.**

### 1. Ingestion of Full 12-Digit Number
- **Files Cited:**
  - `src/components/modals/OnboardWasherModal.tsx#L122, L198` (*Confirmed*)
  - `src/app/admin/profile-creation/page.tsx#L150, L187` (*Confirmed*)
  - `src/lib/firebaseService.ts#L338-L343, L2551-L2554` (*Confirmed*)
- **Implementation Reality:**
  - Both forms explicitly validate that the user supplies **exactly 12 numeric digits**:
    ```typescript
    if (aadhaarRaw.length !== 12) {
      setErrorMsg('Please enter a complete 12-digit Aadhaar number.');
      return;
    }
    ```
  - The raw 12 digits are saved directly into Firestore as `aadhaarNumber` and `aadhaar_number`.
  - There is zero masking of the first 8 digits (`•••• •••• 1234`) prior to database submission.
- **Violation:** Direct violation of UIDAI Circular No. 10 of 2017 and Aadhaar Authentication Regulations (Regulation 16A), which prohibit storage of raw Aadhaar numbers by non-AUA/KUA entities.

### 2. Full Aadhaar Card Photo Scans Stored as Base64 Data URLs
- **Files Cited:**
  - `src/components/modals/OnboardWasherModal.tsx#L149-L154` (*Confirmed*)
  - `src/app/admin/profile-creation/page.tsx#L163-L168` (*Confirmed*)
- **Implementation Reality:**
  - The file upload inputs use `FileReader.readAsDataURL(file)` to convert full photographic scans of physical Aadhaar cards into uncompressed data URL strings (`data:image/jpeg;base64,...`).
  - These strings are written directly into Firestore documents:
    ```typescript
    aadhaarPhotoUrl: reader.result as string
    ```
  - An image of an Aadhaar card contains the subject's full name, father/husband's name, date of birth, gender, full residential address, barcode/QR code, photograph, and unmasked 12-digit number.
- **Violation:** Storing unmasked scanned copies of Aadhaar cards violates UIDAI directives prohibiting physical or digital storage of unmasked Aadhaar identity cards.

### 3. Public Accessibility of Washer Aadhaar Data
- **Files Cited:**
  - `firestore.rules#L129` (*Confirmed*)
- **Implementation Reality:**
  - Because `match /Washers/{washerId}` allows `read: if true;`, any unauthenticated person on the internet can read the `Washers` collection and download all washer partner Aadhaar numbers and photo scans.
- **Severity:** **CRITICAL**.

### 4. Necessity Evaluation
- **Is Aadhaar truly necessary for Torque Care operations?**
  - For service operations (washing cars), field workers require proof of background check and address verification.
  - However, storing raw Aadhaar numbers is legally hazardous. Under Indian law, private commercial entities should verify identity via Offline XML, DigiLocker, or government-approved Identity Verification APIs, and store only the **last 4 digits masked** or an **opaque reference token**.

---

## 3. Photo & Media Storage Audit

### 1. Proof of Wash & Empty Bay Photos
- **File Reference:** `src/lib/firebaseService.ts#L1794-L1810` (*Confirmed*)
- When a washer completes a wash, photos are uploaded via `uploadWashPhotoToStorage`:
  ```typescript
  const storageRef = ref(storage, `proofs/${washId}_${Date.now()}.jpg`);
  await uploadString(storageRef, dataUrlOrBase64, 'data_url');
  const downloadUrl = await getDownloadURL(storageRef);
  ```
- **Public URL Exposure:** `getDownloadURL` generates permanent public URLs with long-lived download tokens. These tokens do not expire.
- **Exclusivity Gaps:** The URLs are stored in `Car_Owners` subcollections where `allow read: if true;` enables anyone to scrape all vehicle photos.

### 2. EXIF Metadata Retention
- **File Reference:** `src/components/modals/OnboardWasherModal.tsx#L146-L155` (*Likely*)
- Photos captured on smartphones via the browser file picker contain EXIF header blocks:
  - GPS Latitude, Longitude, and Altitude.
  - Camera device model, serial, and software version.
  - Exact timestamp down to the second.
- Ingesting photos directly with `FileReader.readAsDataURL` does not scrub EXIF metadata.
- An attacker can parse EXIF headers from wash proof photos to obtain the precise physical parking coordinates of customer luxury vehicles inside private residential parking garages.

---

## 4. Third-Party Data Disclosures

Torque Care dispatches personal data across external third-party services:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
|                                    THIRD-PARTY DATA FLOWS                                        |
├─────────────────────┬──────────────────────────┬─────────────────────────────┬───────────────────┤
| Third-Party Vendor  | Integration Point        | Data Shared                 | Security Risk     |
├─────────────────────┼──────────────────────────┼─────────────────────────────┼───────────────────┤
| **Google Apps**     | src/app/api/leads:82     | Full Name, Phone (+91),     | HTTP POST payload |
| **Script / Sheets** | GOOGLE_SHEETS_SETUP.md   | Car Plate, Society, City,   | to unauthenticated|
|                     |                          | District, State, Timestamp  | Apps Script URL   |
├─────────────────────┼──────────────────────────┼─────────────────────────────┼───────────────────┤
| **Google Firebase** | src/lib/firebase.ts      | All Customer, Washer, Admin | Multi-tenant cloud|
| **(Firestore)**     | Cloud Firestore          | PII, Aadhaar, Passwords     | storage; open     |
|                     |                          |                             | firestore.rules   |
├─────────────────────┼──────────────────────────┼─────────────────────────────┼───────────────────┤
| **Google Firebase** | src/lib/firebaseAuth.ts  | Phone Numbers,              | Third-party SMS   |
| **(Phone Auth)**    | Identity Platform        | SMS OTP challenges          | aggregator routing|
└─────────────────────┴──────────────────────────┴─────────────────────────────┴───────────────────┘
```

1. **Google Apps Script Webhooks:**
   - Payloads containing customer phone numbers, names, and vehicle license plates are dispatched over public HTTPS to Google Apps Script.
   - If the script is deployed with "Anyone" execution access (recommended in `GOOGLE_SHEETS_SETUP.md#L3`), Google does not log caller identity, and the sheet itself is subject to Google Workspace administrative access.
2. **Missing Data Processing Agreements (DPA):**
   - Under the DPDP Act 2023, personal data shared with data processors requires a binding contract governing security safeguards and processing instructions. No DPA or third-party disclosure schedule is documented.

---

## 5. Compliance Analysis Against India's DPDP Act 2023

The Digital Personal Data Protection Act (DPDP Act) 2023 imposes strict fiduciary duties on entities processing digital personal data in India. Below is an audit of Torque Care's compliance posture across core statutory provisions:

### 1. Section 6: Notice & Consent
- **Requirement:** A Data Fiduciary must give a comprehensive, itemized notice in plain language describing the personal data sought, the specific purpose, how the individual may exercise their rights, and how to make a complaint.
- **Code Reality:**
  - Landing page lead modal (`src/components/modals/LeadRegistrationModal.tsx`): Has no consent notice, no privacy policy checkbox, and no link to terms of service.
  - Customer signup page (`src/app/auth/signup/page.tsx`): Ingests vehicle registration and home address without an affirmative consent checkbox.
  - Washer onboarding modal (`src/components/modals/OnboardWasherModal.tsx`): Captures Aadhaar without an Aadhaar Consent declaration.
- **Compliance Status:** **NON-COMPLIANT** (*Confirmed*).

### 2. Section 6(4): Withdrawal of Consent
- **Requirement:** The Data Principal must have the right to withdraw consent with the same ease with which consent was given.
- **Code Reality:**
  - No interface, settings page, or API route exists for a customer or washer to withdraw consent.
- **Compliance Status:** **NON-COMPLIANT** (*Confirmed*).

### 3. Section 7: Purpose Limitation & Data Minimization
- **Requirement:** Personal data must only be processed for the specific purpose for which it was collected.
- **Code Reality:**
  - Dual-writing lead data into `Car_Owners` collection prior to subscription confirmation creates shadow customer accounts without explicit subscription intent (`src/app/api/leads/route.ts#L129-L144`).
- **Compliance Status:** **PARTIALLY COMPLIANT** (*Confirmed*).

### 4. Section 8(5): Reasonable Security Safeguards
- **Requirement:** The Data Fiduciary must implement reasonable security safeguards to prevent personal data breach.
- **Code Reality:**
  - Storing plaintext washer passwords in Firestore (`firebaseService.ts#L1174`).
  - Permitting unauthenticated world-reads on `Washers` and `Car_Owners` (`firestore.rules#L129, L342`).
  - Allowing unauthenticated CSV download of all leads (`api/leads/route.ts#L164`).
- **Compliance Status:** **CRITICAL NON-COMPLIANCE** (*Confirmed*). Under Section 33 of the DPDP Act, failure to take reasonable security safeguards carries financial penalties up to **₹250 Crore (INR 2.5 Billion)**.

### 5. Section 8(6): Personal Data Breach Notification
- **Requirement:** In the event of a personal data breach, the Data Fiduciary must notify the Data Protection Board of India and each affected Data Principal.
- **Code Reality:**
  - Torque Care possesses no automated security incident detection, centralized access auditing, or breach notification mechanisms.
- **Compliance Status:** **NON-COMPLIANT** (*Confirmed*).

### 6. Section 11 & 12: Rights of Data Principal (Access, Correction, Erasure)
- **Requirement:** Data Principals have statutory rights to access summary of data, correct inaccuracies, and erase their personal data.
- **Code Reality:**
  - Customers have no self-serve account deletion or data export route.
  - The only deletion mechanism is `DELETE /api/leads`, which is unauthenticated and does not purge Firestore audit records or Google Sheets entries.
- **Compliance Status:** **NON-COMPLIANT** (*Confirmed*).

### 7. Section 12(1): Grievance Redressal Mechanism & Grievance Officer
- **Requirement:** The Data Fiduciary must publish the contact details of a Data Protection Officer or Grievance Officer in India who can resolve user complaints within statutory timelines.
- **Code Reality:**
  - No Grievance Officer name, email, or physical address is published on the marketing pages or within the app.
- **Compliance Status:** **NON-COMPLIANT** (*Confirmed*).
