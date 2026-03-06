# Student Flow Redesign — Design Document

**Date:** 2026-03-06
**Status:** Approved
**Scope:** Simplify and unify the student identity, bank, and document journey

---

## Problem Statement

The student user flow has five structural issues:

1. `/verify` page forces students to understand KYC tiers and select them manually — an internal concept exposed as UI
2. Bank statement upload and bank connection live on a different page from documents, creating false separation (a bank statement IS bank verification)
3. Phone collection (Tier 1) is invisible during onboarding — students discover it has never been collected only when hitting a wall on verify
4. Document list shows text rows with no thumbnails; no OCR confirmation after upload; student has no feedback that the right document was submitted
5. Proof checklist items are read-only status — no action links to fix incomplete steps

---

## Design Decisions

### 1. Delete `/verify`

The verify page is removed entirely. All verification actions move to contextual surfaces.

- `/dashboard/student/verify` — deleted (301 redirect to `/dashboard/student`)
- `verify/page.tsx`, `verify-page-client.tsx`, `verify/error.tsx` — deleted
- Student nav config entry for verify — removed
- `NEXT_ACTIONS.identity` href in `src/lib/journey/student.ts` — updated (see below)

### 2. Phone Verification — First-Visit Sheet on Overview

**Trigger:** On overview mount, if `student.tier1Complete === false`, auto-open `PhoneVerificationSheet`.
**Behaviour:** Non-dismissable. Student must confirm or come back (journey stage remains incomplete either way).

Flow:
```
Overview mounts
  → check tier1Complete
  → if false: open PhoneVerificationSheet
       ├─ Phone input (+234 prefix)
       ├─ [Send code] → OTP input appears
       ├─ [Confirm code]
       └─ On success: invalidate getVerificationStatus, close sheet, JourneyProgress updates
```

**New tRPC procedures:**
- `student.sendPhoneOtp({ phone: string })` — sends OTP via Dojah or Supabase phone auth
- `student.verifyPhoneOtp({ phone: string, otp: string })` — verifies and marks Tier 1 complete

### 3. KYC Identity Verification — Sheet from Overview

**Trigger:** "Continue verification" CTA on `JourneyProgress` (when stage = identity, current).
**Sheet:** `KycIdentitySheet`

Form fields:
- Identity type: BVN / NIN / Passport (single select, no tier selector — server resolves tier)
- Identity number: text input

**Server change:** `startDojahIdentityCheck` procedure auto-selects tier based on current student state:
- Tier 1 complete, Tier 2 not started → submit as Tier 2
- Tier 2 complete, Tier 3 not started → submit as Tier 3
- Both complete → no-op / already done

On failure (attempt 1): warm guidance message in sheet
On failure (attempt 3+): sheet surfaces "Upload your ID instead" → links to `/dashboard/student/documents?type=government_id`

### 4. Bank Verification + Documents — Unified on `/documents`

Bank verification moves to the top of the documents page as a dedicated section. Bank statement upload is **not** in the general document type dropdown — it lives only in this section.

#### `BankVerificationSection` layout:

```
BANK VERIFICATION
  Status: [Not verified / Under review / Verified]

  Option A: Connect bank account (Mono)
    [Connect your bank account]

  ── or ──

  Option B: Upload a bank statement
    [Dropzone — type pre-selected as bank_statement, non-editable]

  On Mono connected OR statement under review/approved:
    → Section collapses to "Verified via Mono" or "Statement under review" chip
```

**Status resolution:**
- `not_verified`: neither Mono connected nor any bank_statement document
- `pending_review`: `bank_statement` document exists with status = pending
- `verified`: Mono connected OR bank_statement document with status = approved

#### Supporting documents section (below bank):

- Upload form identical to current, but `bank_statement` removed from type options
- Document list with thumbnails (see below)

### 5. OCR Summary Card — Post-Upload

After the upload progress reaches `submitted` stage, display an OCR summary card above the document list:

```
┌─────────────────────────────────────────────────────┐
│ [Thumbnail]   Bank Statement                        │
│               Jan – Mar 2026                        │
│               ₦ 2,450,000                           │
│               Adaeze Okafor                         │
│                                    Submitted ✓      │
└─────────────────────────────────────────────────────┘
```

**Graceful degradation:** If OCR returns no fields, show only filename + "Submitted for review" — no empty field labels.

**New tRPC output:** `uploadDocument` response extended with optional `ocrSummary: { name, amountFormatted, dateRange } | null`.

Dismissable after 5s or on manual close.

### 6. Document List Thumbnails

Each row in `StudentDocumentList` gets a left-aligned thumbnail:
- Image files (JPEG/PNG): `<img src={signedUrl} />` at 40×48px (portrait ratio)
- PDF: `<FileText>` icon with page count if available
- Signed URL fetched lazily on list render (existing `getDocumentSignedUrl` mutation)
- No layout change — thumbnail occupies 48px left slot, text content adjusts

### 7. Proof Checklist — Actionable Pending Items

`ChecklistItem` renders a "Complete →" link when `complete === false`:

| Checklist item | Pending link target |
|---|---|
| kyc | `/dashboard/student` (opens KYC sheet via query param `?action=verify`) |
| school | `/dashboard/student/schools` |
| bank | `/dashboard/student/documents#bank` |
| documents | `/dashboard/student/documents` |
| sponsor | `/dashboard/student` (sponsor invite card on overview) |

Completed items: no link rendered.

---

## Component Inventory

### New components
- `src/components/student/PhoneVerificationSheet.tsx`
- `src/components/student/KycIdentitySheet.tsx`
- `src/components/student/BankVerificationSection.tsx`
- `src/components/student/documents/OcrSummaryCard.tsx`

### Modified components
- `src/app/dashboard/[role]/_components/student-overview.tsx` — adds sheet triggers, reads `?action=` query param
- `src/app/dashboard/[role]/documents/documents-page-client.tsx` — adds BankVerificationSection, OcrSummaryCard, removes bank_statement from dropdown
- `src/components/student/documents/student-document-list.tsx` — adds thumbnail column
- `src/components/student/ProofChecklistCard.tsx` — adds action links to pending items
- `src/lib/journey/student.ts` — updates NEXT_ACTIONS.identity and NEXT_ACTIONS.bank hrefs
- `src/config/nav/` — removes verify entry from student nav
- `src/server/routers/student.ts` — auto-tier resolution in startDojahIdentityCheck, extended uploadDocument response, new phone OTP procedures
- `src/config/copy/student.ts` — new copy keys for sheets, bank section, OCR card

### Deleted files
- `src/app/dashboard/[role]/verify/verify-page-client.tsx`
- `src/app/dashboard/[role]/verify/page.tsx`
- `src/app/dashboard/[role]/verify/error.tsx`

---

## Anti-Patterns Resolved

- Remove `backdrop-blur-sm` from `ProofChecklistCard` and `StudentDocumentList`
- Remove `bg-gradient-to-r from-primary/20...` decorative div from `ProofChecklistCard`
- Move all hardcoded strings (`"Drag and drop your file, or browse"`, `"Document submitted for review"`) to copy config

---

## Out of Scope

- Inngest job queue for OCR processing (current sync OCR retained)
- Document pagination (deferred)
- Bank statement expiry / renewal flow
- Manual KYC review admin flow (unchanged)
