# Torque Care — Security Architecture & Threat Analysis Dossier

**Audit Date:** October 7, 2026  
**Audited Commit Hash:** `b07fabc019ec452e175ba29302ace6862fbceec8`  
**Application Context:** Torque Care (Daily-morning doorstep automotive care & cleaning network in India)  
**Target Entities:** Customers (Vehicle Owners), Washers (Field Service Partners), and Area Managers / Admins  
**Primary Regulatory Frameworks:** India Digital Personal Data Protection (DPDP) Act 2023, Aadhaar Act 2016 & Regulations, CERT-In Cyber Security Directions  

---

## 1. Documentation Index

This dossier comprises seven structured security documents based strictly on the actual codebase, configuration, and data flows of the Torque Care project:

| Document | Purpose & Summary |
| :--- | :--- |
| **[`threat-model.md`](./threat-model.md)** | Architectural assets, trust boundaries, actor classification, STRIDE threat analysis, concrete attack scenarios, risk scoring (Likelihood × Impact), existing controls, and structural gaps. |
| **[`secrets.md`](./secrets.md)** | Complete inventory of credentials, cryptographic keys, test OTPs, API keys, and environment variables; `.gitignore` and git history audits; rotation & exposure risks. |
| **[`attack-surface.md`](./attack-surface.md)** | Exhaustive analysis of all HTTP endpoints, direct Firestore client access surfaces, client routing vectors, IDOR vulnerabilities, CORS/CSRF postures, file upload handling, and telemetry leakages. |
| **[`access-control.md`](./access-control.md)** | Evaluation of role definitions (client vs server), privilege escalation pathways, multi-tenancy boundaries, admin session handling, bulk export capabilities, and audit trail integrity. |
| **[`data-protection.md`](./data-protection.md)** | Personal data inventory for Customers, Washers, and Admins; Aadhaar handling & storage compliance; photo/EXIF metadata exposure; third-party disclosures; and compliance gap analysis under India's DPDP Act 2023. |
| **[`security-checklist.md`](./security-checklist.md)** | Prioritized technical remediation matrix (Critical down to Low) with exact file/line citations, specific code remediation designs, effort estimates (S/M/L), and immediate "Quick Wins" (<1 day). |
| **[`README.md`](./README.md)** | *(This document)* Overview, audit scope, executive summary, methodology, and step-by-step instructions for refreshing this security audit. |

---

## 2. Audit Scope & Coverage

The security evaluation conducted across the Torque Care repository encompassed:
1. **Frontend Architecture & Client Security:**
   - Framework: Next.js 16.3.6 (App Router), React 19.2.8, Tailwind CSS v4.
   - Client-side state stores (`useStore` in `src/lib/store.tsx`, React Context, `localStorage`).
   - Browser navigation guards and UI-level role checks across customer, washer, and admin pages.
2. **Backend & API Layer:**
   - Server Route Handlers (`src/app/api/leads/route.ts`).
   - Middleware presence and route interception (`middleware.ts` evaluation).
   - Server-side token validation and session decoding.
3. **Database & Storage Rules:**
   - Active Firestore Rules (`firestore.rules` referenced by `firebase.json`).
   - Rule inheritance, wildcard matches, role check functions (`isAdmin`, `isAreaManager`, `isOwner`, `isSuperAdmin`).
   - Firebase Storage configuration and Cloud Storage bucket security postures.
4. **Identity & Authentication Flows:**
   - Firebase Phone Authentication (`src/lib/firebaseAuth.ts`) and SMS OTP handling.
   - Washer email/password creation and authentication (`src/app/washer/login/page.tsx`, `src/app/washer/set-password/page.tsx`).
   - Admin credential validation (`src/app/admin/login/page.tsx`).
5. **Sensitive Identity Data Flows (High Sensitivity):**
   - **Aadhaar Data:** Ingestion, validation, masking, format transformation, and persistence across Washers and Area Managers (`OnboardWasherModal.tsx`, `AdminProfileCreationPage.tsx`, `firebaseService.ts`).
   - **Customer Triad (Phone + Address + Vehicle Plate):** Ingestion in lead capture, signups, vehicle management, and daily route stop assignments (`LeadRegistrationModal.tsx`, `signup/page.tsx`, `types.ts`).
6. **Third-Party Integrations & Data Ingress/Egress:**
   - Google Apps Script webhooks / Google Sheets lead automation (`GOOGLE_SHEETS_SETUP.md`, `api/leads/route.ts`).
   - Firebase Client SDK WebChannels (`src/lib/firebase.ts`).
7. **Source Control & Build Configurations:**
   - Git commit history, `.gitignore` rules, environment variables (`.env*`), and migration utility scripts (`scripts/migrate_washes.mjs`).

---

## 3. Executive Summary & Findings Scorecard

### Posture Overview
Torque Care operates as a Progressive Web Application (PWA) facilitating morning vehicle washing across residential societies in India. The current architecture relies primarily on direct client-to-Firestore communication using the Firebase Client Web SDK, without an intermediary backend application server or server-side Firebase Admin SDK.

While the user interface features sophisticated operational workflows (route planning, offline photo queuing, signature capture, and supervisor delegation), **the underlying security posture exhibits critical vulnerabilities that leave all customer personal information, washer records, Aadhaar numbers, and administrative controls completely exposed to unauthenticated internet actors.**

### Severity Distribution

| Severity | Count | Primary Impact Areas |
| :---: | :---: | :--- |
| **CRITICAL** | 5 | Database-wide privilege escalation, public unauthenticated PII exfiltration API, public Firestore reads of washer Aadhaar & plaintext passwords, query-param admin role spoofing, and first-time washer account takeover. |
| **HIGH** | 4 | Complete world-read/write access to customer vehicle plates, flat addresses & phone numbers; insecure client-side XOR ID obfuscation; absence of server-side admin panel route protection; lack of rate-limiting on lead creation. |
| **MEDIUM** | 5 | Ingestion of unmasked 12-digit Aadhaar into unencrypted database; photo uploads retaining unstripped EXIF GPS metadata; persistent storage of auth state in unencrypted `localStorage`; lack of CSRF/CORS header policy; client-side mock OTP bypass. |
| **LOW** | 3 | Missing security response headers (CSP, HSTS, X-Frame-Options); hardcoded client-side Firebase public configuration in source files; lack of structured audit log immutability. |

---

## 4. How to Refresh this Security Audit

To maintain an up-to-date security posture as the application evolves, developers and security reviewers should follow this standardized procedure:

### Step 1: Record Baseline Metadata
Check the latest Git commit hash and working tree status:
```bash
git rev-parse HEAD
git status --porcelain
```
Update the date and commit hash in `README.md` and related documents.

### Step 2: Audit Firestore Rules Changes
Compare current `firestore.rules` against the documented baseline:
```bash
git diff b07fabc019ec452e175ba29302ace6862fbceec8 firestore.rules firebase.json
```
Verify whether `allow read: if true;` or `allow update: if true;` clauses have been eliminated, and verify whether the `area_managers` self-registration privilege escalation bug has been patched.

### Step 3: Scan for Newly Introduced Endpoints & Secrets
Search for newly created Next.js server route handlers, server actions, or exposed credentials:
```bash
find src/app/api -type f
grep -rnE "(AIza[0-9A-Za-z-_]{35}|secret|password|bearer|key)" src/
```

### Step 4: Validate DPDP Act & Aadhaar Handling
Search for any new fields storing identity documents or unmasked Aadhaar numbers:
```bash
grep -rnEi "(aadhaar|pan_number|voter|license|bank_account)" src/
```
Verify whether first 8 digits are masked (`•••• •••• XXXX`) before any database write occurs.

### Step 5: Update the Security Checklist
Review completed items in [`security-checklist.md`](./security-checklist.md), verify the fix via manual inspection or unit test, and mark the status accordingly.

---

## 5. Confidence Levels Guide

Every security finding in this dossier is tagged with an explicit confidence level:
- **Confirmed:** Verified through direct source code inspection, explicit configuration directives, or executable logic flows.
- **Likely:** Follows standard architectural patterns in the codebase where code paths strongly indicate the vulnerability, but runtime environment details (e.g. cloud console rules not committed to git) may affect exploitability.
- **Needs verification:** An architectural risk or anomaly identified where external cloud configuration (such as production Firebase Console settings or Google Apps Script deployment permissions) is required to determine final real-world impact.
