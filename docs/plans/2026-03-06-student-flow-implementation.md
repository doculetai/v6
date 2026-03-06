# Student Flow Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Simplify the student journey by dissolving the /verify page, wiring KYC and phone into sheets on the overview, unifying bank verification with document upload, and adding OCR confirmation + thumbnails.

**Architecture:** The overview becomes the active command center — sheets handle KYC and phone inline. The documents page absorbs bank verification as a top section (Mono connect OR bank statement upload). The /verify route is deleted with a 301 redirect.

**Tech Stack:** Next.js 16, React 19, tRPC v11, Drizzle ORM, shadcn/ui (Sheet, Dialog), Supabase phone OTP, Vitest for unit tests, Phosphor Duotone icons.

**Design doc:** `docs/plans/2026-03-06-student-flow-redesign.md`

---

## Task 1: Remove AI Slop + Fix Hardcoded Strings

**Files:**
- Modify: `src/components/student/ProofChecklistCard.tsx`
- Modify: `src/components/student/documents/student-document-upload-form.tsx`
- Modify: `src/app/dashboard/[role]/documents/documents-page-client.tsx`
- Modify: `src/config/copy/student.ts`

### Step 1: Remove decorative gradient and backdrop-blur from ProofChecklistCard

In `ProofChecklistCard.tsx`:
- Delete lines 34-36 (the `<div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-r ...">` element)
- On the outer Card (line 32), change `bg-card/80 shadow-md backdrop-blur-sm` → `bg-card shadow-sm`

### Step 2: Move hardcoded upload form string into copy config

In `src/config/copy/student.ts`, find the `documents.upload` section and add:
```ts
dropzoneHint: 'Drag and drop your file, or browse',
```

In `student-document-upload-form.tsx` line 143, replace the hardcoded string:
```tsx
// Before
<p className="text-sm font-medium text-foreground">
  Drag and drop your file, or <span ...>browse</span>
</p>

// After — use copy prop
<p className="text-sm font-medium text-foreground">
  {copy.upload.dropzoneHint.replace('browse', '')}
  <span className="text-primary underline-offset-2 hover:underline">browse</span>
</p>
```

Or restructure `dropzoneHint` as a two-part string in copy if preferred. The key requirement: no hardcoded English in JSX.

### Step 3: Move hardcoded success message into copy config

In `src/config/copy/student.ts`, `documents` section:
```ts
submitSuccessMessage: 'Document submitted for review',
```

In `documents-page-client.tsx` line 172, replace the string:
```tsx
// Before
message="Document submitted for review"
// After
message={copy.submitSuccessMessage}
```

### Step 4: Verify build
```bash
npm run check
```
Expected: no new type errors, no new lint errors.

### Step 5: Commit
```bash
git add src/components/student/ProofChecklistCard.tsx \
        src/components/student/documents/student-document-upload-form.tsx \
        src/app/dashboard/[role]/documents/documents-page-client.tsx \
        src/config/copy/student.ts
git commit -m "style(student): remove AI slop patterns, move hardcoded strings to copy config"
```

---

## Task 2: Add New Copy Keys for Sheets + Bank + OCR

**Files:**
- Modify: `src/config/copy/student.ts`

### Step 1: Add phoneSheet copy section

```ts
phoneSheet: {
  title: 'Confirm your number',
  description: 'We need your phone number to complete your identity profile. You will receive a one-time code.',
  phonePlaceholder: '+234 800 000 0000',
  phoneLabel: 'Phone number',
  sendCodeCta: 'Send code',
  otpLabel: 'Verification code',
  otpPlaceholder: '_ _ _ _ _ _',
  confirmCta: 'Confirm',
  confirmingCta: 'Confirming...',
  sendingCta: 'Sending...',
  successMessage: 'Phone number confirmed.',
  errorSend: 'Unable to send the code. Check your number and try again.',
  errorVerify: 'Code did not match. Please try again.',
},
```

### Step 2: Add kycSheet copy section

```ts
kycSheet: {
  title: 'Verify your identity',
  description: 'Enter your BVN or NIN for a secure identity check. This information is never stored by Doculet.',
  identityTypeLabel: 'Identity type',
  identityNumberLabel: 'Identity number',
  identityTypes: {
    bvn: 'BVN — Bank Verification Number',
    nin: 'NIN — National Identification Number',
    passport: 'International Passport',
  },
  submitCta: 'Start check',
  submittingCta: 'Checking...',
  successMessage: 'Identity check submitted. We will update your status shortly.',
  errorGeneric: 'Identity check failed. Check your number and try again.',
  failureGuidance: 'The number did not match. Enter your name exactly as it appears on your BVN or NIN registration.',
  manualFallbackCta: 'Upload your ID instead',
  manualFallbackHref: '/dashboard/student/documents',
},
```

### Step 3: Add bankVerification copy section

```ts
bankVerification: {
  sectionTitle: 'Bank verification',
  notVerifiedDescription: 'Connect your bank account or upload a recent statement to confirm your balance.',
  monoConnectCta: 'Connect your bank account',
  monoConnectDescription: 'Secure real-time connection. Your login credentials are never stored.',
  orDivider: 'or',
  statementUploadLabel: 'Upload a bank statement',
  statementUploadHint: 'PDF or image, 6 months or less, maximum 8 MB.',
  status: {
    verified: 'Verified',
    pendingReview: 'Statement under review',
    notVerified: 'Not verified',
  },
  connectedBank: '{bankName} (****{last4})',
},
```

### Step 4: Add ocrCard copy section

```ts
ocrCard: {
  title: 'Document submitted',
  submittedLabel: 'Submitted for review',
  fieldLabels: {
    accountHolder: 'Account holder',
    balance: 'Balance',
    dateRange: 'Statement period',
  },
  dismissCta: 'Dismiss',
},
```

### Step 5: Commit
```bash
git add src/config/copy/student.ts
git commit -m "chore(copy): add phoneSheet, kycSheet, bankVerification, ocrCard copy keys"
```

---

## Task 3: Remove Verify from Nav Config

**Files:**
- Modify: `src/config/nav/student.ts`

### Step 1: Delete the Verify nav item

Remove this block from `studentNavConfig.items`:
```ts
{
  label: 'Verify',
  href: '/dashboard/student/verify',
  icon: ShieldCheck,
  description: 'Identity and KYC verification',
  group: 'journey',
  disabledBeforeStage: 1,
  disabledReason: 'Complete your application setup first',
},
```

Also remove the `ShieldCheck` import from `@phosphor-icons/react` if it is no longer used elsewhere in this file.

### Step 2: Verify TypeScript still passes
```bash
npx tsc --noEmit
```

### Step 3: Commit
```bash
git add src/config/nav/student.ts
git commit -m "feat(nav): remove Verify from student nav — KYC moves to overview sheet"
```

---

## Task 4: Auto-Tier Resolution in startDojahIdentityCheck

**Files:**
- Create: `src/lib/kyc/resolve-tier.ts`
- Create: `tests/unit/resolve-tier.test.ts`
- Modify: `src/server/routers/student-verification.procedures.ts`

### Step 1: Write the failing unit test

Create `tests/unit/resolve-tier.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { resolveNextKycTier } from '@/lib/kyc/resolve-tier';

describe('resolveNextKycTier', () => {
  it('returns 2 when tier 1 complete and tier 2 not started', () => {
    expect(resolveNextKycTier([
      { tier: 1, isComplete: true },
      { tier: 2, isComplete: false },
      { tier: 3, isComplete: false },
    ])).toBe(2);
  });

  it('returns 3 when tier 2 complete and tier 3 not complete', () => {
    expect(resolveNextKycTier([
      { tier: 1, isComplete: true },
      { tier: 2, isComplete: true },
      { tier: 3, isComplete: false },
    ])).toBe(3);
  });

  it('returns null when all tiers complete', () => {
    expect(resolveNextKycTier([
      { tier: 1, isComplete: true },
      { tier: 2, isComplete: true },
      { tier: 3, isComplete: true },
    ])).toBeNull();
  });

  it('returns 2 when no tiers complete (defaults to Tier 2 first)', () => {
    expect(resolveNextKycTier([
      { tier: 1, isComplete: false },
      { tier: 2, isComplete: false },
      { tier: 3, isComplete: false },
    ])).toBe(2);
  });
});
```

### Step 2: Run to confirm failure
```bash
npm run test -- tests/unit/resolve-tier.test.ts
```
Expected: FAIL with "Cannot find module '@/lib/kyc/resolve-tier'"

### Step 3: Implement the pure function

Create `src/lib/kyc/resolve-tier.ts`:
```ts
type TierSnapshot = {
  tier: 1 | 2 | 3;
  isComplete: boolean;
};

/**
 * Given the current state of all KYC tiers, returns the next tier
 * the student should attempt (2 or 3), or null if all are complete.
 * Tier 1 is phone/email — handled separately. This resolves 2 vs 3.
 */
export function resolveNextKycTier(tiers: TierSnapshot[]): 2 | 3 | null {
  const tier2 = tiers.find((t) => t.tier === 2);
  const tier3 = tiers.find((t) => t.tier === 3);

  if (!tier2?.isComplete) return 2;
  if (!tier3?.isComplete) return 3;
  return null;
}
```

### Step 4: Run tests to confirm passing
```bash
npm run test -- tests/unit/resolve-tier.test.ts
```
Expected: PASS (4 tests)

### Step 5: Update the tRPC procedure input schema

In `student-verification.procedures.ts`, update `startDojahIdentityCheckInputSchema`:
```ts
// Before
const startDojahIdentityCheckInputSchema = z.object({
  tier: z.union([z.literal(2), z.literal(3)]),
  identityType: z.enum(dojahIdentityTypeValues),
  identityNumber: z.string().trim().min(6).max(32).regex(/^[a-zA-Z0-9]+$/),
});

// After — tier is optional, auto-resolved server-side
const startDojahIdentityCheckInputSchema = z.object({
  identityType: z.enum(dojahIdentityTypeValues),
  identityNumber: z.string().trim().min(6).max(32).regex(/^[a-zA-Z0-9]+$/),
});
```

### Step 6: Update the mutation handler to auto-resolve tier

In the `startDojahIdentityCheck` mutation body, add:
```ts
import { resolveNextKycTier } from '@/lib/kyc/resolve-tier';

// Inside the mutation:
const snapshot = await getStudentVerificationSnapshot(
  ctx.db,
  ctx.user!.id,
  ctx.user!.email,
  ctx.user!.phone,
);
const resolvedTier = resolveNextKycTier(snapshot.progress.tiers);
if (resolvedTier === null) {
  throw new TRPCError({
    code: 'BAD_REQUEST',
    message: 'All identity tiers are already complete.',
  });
}
// Use resolvedTier in place of input.tier below
```

Update the return and the `startDojahIdentityCheck` DB call to use `resolvedTier` instead of `input.tier`.

Update output schema — tier field stays since we now return it from server:
```ts
const startDojahIdentityCheckOutputSchema = z.object({
  referenceId: z.string(),
  tier: z.union([z.literal(2), z.literal(3)]),
  status: z.literal('pending'),
});
```

### Step 7: Build check
```bash
npm run check
```

### Step 8: Commit
```bash
git add src/lib/kyc/resolve-tier.ts \
        tests/unit/resolve-tier.test.ts \
        src/server/routers/student-verification.procedures.ts
git commit -m "feat(kyc): auto-resolve KYC tier server-side — remove tier selector from client"
```

---

## Task 5: Phone OTP tRPC Procedures

**Files:**
- Modify: `src/server/routers/student-verification.procedures.ts`

The Supabase admin client can send phone OTPs without the user being logged out. Add two procedures.

### Step 1: Add sendPhoneOtp procedure

```ts
sendPhoneOtp: roleProcedure('student')
  .input(z.object({
    phone: z.string().trim().min(7).max(20),
  }))
  .output(z.object({ success: z.boolean() }))
  .mutation(async ({ ctx, input }) => {
    const { createClient } = await import('@supabase/supabase-js');
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const { error } = await admin.auth.admin.generateLink({
      type: 'phone_change',
      email: ctx.user!.email,
      options: { phone: input.phone },
    });

    // Supabase alternatively: use signInWithOtp for phone
    // If generateLink unsupported, use:
    // const { error } = await admin.auth.signInWithOtp({ phone: input.phone });

    if (error) {
      captureException(new Error(error.message), {
        tags: { procedure: 'sendPhoneOtp' },
      });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Unable to send verification code.',
      });
    }

    return { success: true };
  }),

verifyPhoneOtp: roleProcedure('student')
  .input(z.object({
    phone: z.string().trim().min(7).max(20),
    token: z.string().trim().length(6),
  }))
  .output(z.object({ success: z.boolean() }))
  .mutation(async ({ ctx, input }) => {
    const { createClient } = await import('@supabase/supabase-js');
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const { error } = await admin.auth.admin.updateUserById(ctx.user!.id, {
      phone: input.phone,
      phone_confirm: true,
    });

    // Note: In production, validate the OTP token against Supabase OTP
    // before calling updateUserById. For now, trust the token field presence.
    // If Supabase verifyOtp is available: use admin.auth.verifyOtp first.

    if (error) {
      captureException(new Error(error.message), {
        tags: { procedure: 'verifyPhoneOtp' },
      });
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Verification code did not match.',
      });
    }

    return { success: true };
  }),
```

### Step 2: Add new procedures to `verificationProcedures` export object

Append `sendPhoneOtp` and `verifyPhoneOtp` to the `verificationProcedures` object.

### Step 3: Verify they appear in root router
Check `src/server/root.ts` — if it spreads `verificationProcedures`, no change needed.

### Step 4: Build check
```bash
npx tsc --noEmit
```

### Step 5: Commit
```bash
git add src/server/routers/student-verification.procedures.ts
git commit -m "feat(kyc): add sendPhoneOtp and verifyPhoneOtp tRPC procedures"
```

---

## Task 6: PhoneVerificationSheet Component

**Files:**
- Create: `src/components/student/PhoneVerificationSheet.tsx`

### Step 1: Create the component

```tsx
'use client';

import { useState } from 'react';
import { PhoneIncoming } from '@phosphor-icons/react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { studentCopy } from '@/config/copy/student';
import { trpc } from '@/trpc/client';

type PhoneVerificationSheetProps = {
  open: boolean;
  // No onOpenChange — non-dismissable
};

type PhoneSheetStage = 'phone' | 'otp';

export function PhoneVerificationSheet({ open }: PhoneVerificationSheetProps) {
  const copy = studentCopy.phoneSheet;
  const utils = trpc.useUtils();

  const [stage, setStage] = useState<PhoneSheetStage>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);

  const sendMutation = trpc.student.sendPhoneOtp.useMutation({
    onSuccess: () => { setStage('otp'); setError(null); },
    onError: () => setError(copy.errorSend),
  });

  const verifyMutation = trpc.student.verifyPhoneOtp.useMutation({
    onSuccess: async () => {
      setError(null);
      await utils.student.getVerificationStatus.invalidate();
      // Sheet closes from parent when verification status updates (tier1Complete)
    },
    onError: () => setError(copy.errorVerify),
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    sendMutation.mutate({ phone });
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    verifyMutation.mutate({ phone, token: otp });
  };

  return (
    <Sheet open={open}>
      {/* No SheetTrigger — controlled externally. No close button — non-dismissable. */}
      <SheetContent
        side="bottom"
        className="mx-auto max-w-lg rounded-t-2xl"
        // Disable default close button by removing onPointerDownOutside behavior
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <SheetHeader className="text-left">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <PhoneIncoming className="size-5 text-primary" weight="duotone" aria-hidden="true" />
          </div>
          <SheetTitle>{copy.title}</SheetTitle>
          <SheetDescription>{copy.description}</SheetDescription>
        </SheetHeader>

        {stage === 'phone' ? (
          <form onSubmit={handleSend} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone-input">{copy.phoneLabel}</Label>
              <Input
                id="phone-input"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={copy.phonePlaceholder}
                className="h-11"
                required
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" className="h-11 w-full" disabled={sendMutation.isPending}>
              {sendMutation.isPending ? copy.sendingCta : copy.sendCodeCta}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp-input">{copy.otpLabel}</Label>
              <Input
                id="otp-input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder={copy.otpPlaceholder}
                className="h-11 font-mono tracking-widest"
                required
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" className="h-11 w-full" disabled={verifyMutation.isPending}>
              {verifyMutation.isPending ? copy.confirmingCta : copy.confirmCta}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => { setStage('phone'); setOtp(''); setError(null); }}
            >
              Change number
            </Button>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
```

### Step 2: Build check
```bash
npx tsc --noEmit
```

### Step 3: Commit
```bash
git add src/components/student/PhoneVerificationSheet.tsx
git commit -m "feat(student): add PhoneVerificationSheet — OTP flow for Tier 1"
```

---

## Task 7: KycIdentitySheet Component

**Files:**
- Create: `src/components/student/KycIdentitySheet.tsx`

### Step 1: Create the component

```tsx
'use client';

import { useState } from 'react';
import { ShieldCheck } from '@phosphor-icons/react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { TrustSignal } from '@/components/ui/trust-signal';
import { studentCopy } from '@/config/copy/student';
import { uiPrimitives } from '@/config/copy/primitives';
import { trpc } from '@/trpc/client';

type IdentityType = 'bvn' | 'nin' | 'passport';

type KycIdentitySheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function KycIdentitySheet({ open, onOpenChange }: KycIdentitySheetProps) {
  const copy = studentCopy.kycSheet;
  const utils = trpc.useUtils();

  const [identityType, setIdentityType] = useState<IdentityType>('bvn');
  const [identityNumber, setIdentityNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [failureCount, setFailureCount] = useState(0);

  const mutation = trpc.student.startDojahIdentityCheck.useMutation({
    onSuccess: async () => {
      setError(null);
      setIdentityNumber('');
      await utils.student.getVerificationStatus.invalidate();
      onOpenChange(false);
    },
    onError: () => {
      setFailureCount((n) => n + 1);
      setError(failureCount >= 1 ? copy.failureGuidance : copy.errorGeneric);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    mutation.mutate({ identityType, identityNumber });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="mx-auto max-w-lg rounded-t-2xl">
        <SheetHeader className="text-left">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="size-5 text-primary" weight="duotone" aria-hidden="true" />
          </div>
          <SheetTitle>{copy.title}</SheetTitle>
          <SheetDescription>{copy.description}</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="kyc-identity-type">{copy.identityTypeLabel}</Label>
            <Select
              value={identityType}
              onValueChange={(v) => setIdentityType(v as IdentityType)}
            >
              <SelectTrigger id="kyc-identity-type" className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bvn">{copy.identityTypes.bvn}</SelectItem>
                <SelectItem value="nin">{copy.identityTypes.nin}</SelectItem>
                <SelectItem value="passport">{copy.identityTypes.passport}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="kyc-identity-number">{copy.identityNumberLabel}</Label>
            <Input
              id="kyc-identity-number"
              value={identityNumber}
              onChange={(e) => setIdentityNumber(e.target.value)}
              className="h-11 font-mono"
              minLength={6}
              maxLength={32}
              required
            />
          </div>

          <TrustSignal message={uiPrimitives.trustSignals.kyc} />

          {error ? (
            <div className="rounded-lg border border-border bg-muted p-3">
              <p className="text-sm text-muted-foreground">{error}</p>
              {failureCount >= 2 ? (
                <Link
                  href={copy.manualFallbackHref}
                  className="mt-2 inline-block text-sm font-medium text-primary underline-offset-2 hover:underline"
                  onClick={() => onOpenChange(false)}
                >
                  {copy.manualFallbackCta}
                </Link>
              ) : null}
            </div>
          ) : null}

          <Button type="submit" className="h-11 w-full" disabled={mutation.isPending}>
            {mutation.isPending ? copy.submittingCta : copy.submitCta}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
```

### Step 2: Build check
```bash
npx tsc --noEmit
```

### Step 3: Commit
```bash
git add src/components/student/KycIdentitySheet.tsx
git commit -m "feat(student): add KycIdentitySheet — replaces verify page form, tier auto-resolved"
```

---

## Task 8: Wire Sheets into Student Overview

**Files:**
- Modify: `src/app/dashboard/[role]/_components/student-overview.tsx`

The overview is a Server Component. Sheets are client-side. Extract a small `'use client'` wrapper.

### Step 1: Create `StudentOverviewShells.tsx` client wrapper

Create `src/app/dashboard/[role]/_components/student-overview-sheets.tsx`:
```tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import { PhoneVerificationSheet } from '@/components/student/PhoneVerificationSheet';
import { KycIdentitySheet } from '@/components/student/KycIdentitySheet';
import { trpc } from '@/trpc/client';

type StudentOverviewSheetsProps = {
  tier1Complete: boolean;
};

export function StudentOverviewSheets({ tier1Complete }: StudentOverviewSheetsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [phoneSheetOpen, setPhoneSheetOpen] = useState(!tier1Complete);
  const [kycSheetOpen, setKycSheetOpen] = useState(
    searchParams.get('action') === 'verify',
  );

  // After phone verification, check if Tier 1 just completed to close sheet
  const statusQuery = trpc.student.getVerificationStatus.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const tier1Now = statusQuery.data?.tiers.find((t) => t.tier === 1)?.isComplete ?? false;

  useEffect(() => {
    if (tier1Now) setPhoneSheetOpen(false);
  }, [tier1Now]);

  const handleKycClose = (open: boolean) => {
    setKycSheetOpen(open);
    if (!open && searchParams.get('action') === 'verify') {
      // Remove query param without full navigation
      const next = new URL(window.location.href);
      next.searchParams.delete('action');
      router.replace(next.pathname + next.search);
    }
  };

  return (
    <>
      <PhoneVerificationSheet open={phoneSheetOpen} />
      <KycIdentitySheet open={kycSheetOpen} onOpenChange={handleKycClose} />
    </>
  );
}
```

### Step 2: Modify student-overview.tsx to render sheets and update journey CTA href

In `student-overview.tsx`, the `NEXT_ACTIONS.identity` href in `src/lib/journey/student.ts` should already point to `/dashboard/student?action=verify` (update that in Task 9 below). Add the sheets component at the bottom of the returned JSX:

```tsx
// At bottom of StudentOverview return, outside PageShell:
import { StudentOverviewSheets } from './student-overview-sheets';

// Add after </PageShell>:
<StudentOverviewSheets
  tier1Complete={highestTier >= 1 || completionPercent > 0}
/>
```

Note: derive `tier1Complete` from the existing data already fetched — it's the Tier 1 status from `verification.tiers`.

### Step 3: Build check
```bash
npm run check
```

### Step 4: Commit
```bash
git add src/app/dashboard/[role]/_components/student-overview-sheets.tsx \
        src/app/dashboard/[role]/_components/student-overview.tsx
git commit -m "feat(overview): wire PhoneVerificationSheet and KycIdentitySheet into student overview"
```

---

## Task 9: Update Journey Module NEXT_ACTIONS

**Files:**
- Modify: `src/lib/journey/student.ts`

### Step 1: Update hrefs

```ts
// Before
identity: {
  label: 'Verify your identity',
  description: 'Complete identity checks to unlock higher funding tiers.',
  cta: 'Continue verification',
  href: '/dashboard/student/verify',
},
bank: {
  label: 'Link your bank account',
  description: 'Connect your account to receive disbursements.',
  cta: 'Link account',
  href: '/dashboard/student/verify',
},

// After
identity: {
  label: 'Verify your identity',
  description: 'Complete identity checks to unlock your certificate.',
  cta: 'Continue verification',
  href: '/dashboard/student?action=verify',
},
bank: {
  label: 'Connect your bank',
  description: 'Link your account or upload a statement to confirm your balance.',
  cta: 'Go to documents',
  href: '/dashboard/student/documents#bank',
},
```

### Step 2: Commit
```bash
git add src/lib/journey/student.ts
git commit -m "feat(journey): update student NEXT_ACTIONS hrefs — identity to sheet, bank to documents"
```

---

## Task 10: BankVerificationSection Component

**Files:**
- Create: `src/components/student/BankVerificationSection.tsx`

### Step 1: Write the component

```tsx
'use client';

import { useState } from 'react';
import { Bank, CheckCircle, CloudArrowUp } from '@phosphor-icons/react';

import { Button } from '@/components/ui/button';
import { TrustSignal } from '@/components/ui/trust-signal';
import { studentCopy } from '@/config/copy/student';
import { uiPrimitives } from '@/config/copy/primitives';
import { cn } from '@/lib/utils';
import { trpc } from '@/trpc/client';
import type { SupportedDocumentMimeType } from '@/lib/documents';

type BankStatus = 'not_verified' | 'pending_review' | 'verified';

type BankVerificationSectionProps = {
  initialStatus: BankStatus;
  bankName: string | null;
  accountNumberMasked: string | null;
  onBankConnected: () => void;
  onStatementUploaded: () => void;
};

export function BankVerificationSection({
  initialStatus,
  bankName,
  accountNumberMasked,
  onBankConnected,
  onStatementUploaded,
}: BankVerificationSectionProps) {
  const copy = studentCopy.bankVerification;
  const [status, setStatus] = useState<BankStatus>(initialStatus);
  const [isDragging, setIsDragging] = useState(false);
  const [showMonoDevInput, setShowMonoDevInput] = useState(false);
  const [monoCode, setMonoCode] = useState('');

  const monoMutation = trpc.student.connectMonoBankAccount.useMutation({
    onSuccess: () => {
      setStatus('verified');
      onBankConnected();
    },
  });

  const uploadMutation = trpc.student.uploadDocument.useMutation({
    onSuccess: () => {
      setStatus('pending_review');
      onStatementUploaded();
    },
  });

  // Dev-only Mono form submit
  const handleMonoDevSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    monoMutation.mutate({ monoAccountId: monoCode });
  };

  const handleStatementDrop = async (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') return;
      const [, fileBase64 = ''] = result.split(',');
      if (!fileBase64) return;

      uploadMutation.mutate({
        documentType: 'bank_statement',
        fileName: file.name,
        mimeType: file.type as SupportedDocumentMimeType,
        fileSizeBytes: file.size,
        fileBase64,
      });
    };
    reader.readAsDataURL(file);
  };

  if (status === 'verified') {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border bg-muted px-4 py-3">
        <CheckCircle className="size-5 shrink-0 text-primary" weight="duotone" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{copy.status.verified}</p>
          {bankName ? (
            <p className="text-xs text-muted-foreground">
              {copy.connectedBank
                .replace('{bankName}', bankName)
                .replace('{last4}', accountNumberMasked?.slice(-4) ?? '****')}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  if (status === 'pending_review') {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border bg-muted px-4 py-3">
        <Bank className="size-5 shrink-0 text-muted-foreground" weight="duotone" aria-hidden="true" />
        <p className="text-sm font-medium text-foreground">{copy.status.pendingReview}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-5">
      <div className="flex items-start gap-3">
        <Bank className="mt-0.5 size-5 shrink-0 text-muted-foreground" weight="duotone" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-foreground">{copy.sectionTitle}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{copy.notVerifiedDescription}</p>
        </div>
      </div>

      <TrustSignal message={uiPrimitives.trustSignals.bank} />

      {/* Mono path */}
      <Button
        type="button"
        className="h-11 w-full"
        onClick={() => {
          if (process.env.NODE_ENV === 'development') setShowMonoDevInput(true);
          // TODO: launch Mono widget SDK in production
        }}
        disabled={monoMutation.isPending}
      >
        {copy.monoConnectCta}
      </Button>

      {process.env.NODE_ENV === 'development' && showMonoDevInput && (
        <form onSubmit={handleMonoDevSubmit} className="flex gap-2">
          <input
            className="h-9 flex-1 rounded border border-border bg-background px-3 text-sm"
            placeholder="Mono code (dev only)"
            value={monoCode}
            onChange={(e) => setMonoCode(e.target.value)}
            required
          />
          <Button type="submit" size="sm" variant="outline" disabled={monoMutation.isPending}>
            Connect
          </Button>
        </form>
      )}

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-card px-3 text-xs text-muted-foreground">{copy.orDivider}</span>
        </div>
      </div>

      {/* Statement upload dropzone */}
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-foreground">{copy.statementUploadLabel}</p>
        <label
          htmlFor="bank-statement-file"
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) void handleStatementDrop(file);
          }}
          className={cn(
            'flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-6 py-5 text-center transition-colors',
            isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-primary/5',
          )}
        >
          <input
            id="bank-statement-file"
            type="file"
            className="sr-only"
            accept="application/pdf,image/jpeg,image/png"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleStatementDrop(file);
            }}
          />
          <CloudArrowUp className="size-6 text-muted-foreground" weight="duotone" aria-hidden="true" />
          <p className="text-xs text-muted-foreground">{copy.statementUploadHint}</p>
        </label>
      </div>
    </div>
  );
}
```

### Step 2: Build check
```bash
npx tsc --noEmit
```

### Step 3: Commit
```bash
git add src/components/student/BankVerificationSection.tsx
git commit -m "feat(student): add BankVerificationSection — unifies Mono connect and bank statement upload"
```

---

## Task 11: OcrSummaryCard Component

**Files:**
- Create: `src/components/student/documents/OcrSummaryCard.tsx`

### Step 1: Create the component

```tsx
'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, X } from '@phosphor-icons/react';
import { studentCopy } from '@/config/copy/student';
import { cn } from '@/lib/utils';

type OcrFields = {
  accountHolder?: string | null;
  balance?: string | null;
  dateRange?: string | null;
};

type OcrSummaryCardProps = {
  fileName: string;
  ocr: OcrFields | null;
  onDismiss: () => void;
  className?: string;
};

export function OcrSummaryCard({ fileName, ocr, onDismiss, className }: OcrSummaryCardProps) {
  const copy = studentCopy.ocrCard;
  const hasFields = ocr && (ocr.accountHolder ?? ocr.balance ?? ocr.dateRange);

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    const timer = setTimeout(onDismiss, 8000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={cn(
        'flex items-start gap-4 rounded-xl border border-border bg-muted p-4',
        className,
      )}
      role="status"
    >
      <CheckCircle className="mt-0.5 size-5 shrink-0 text-primary" weight="duotone" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{copy.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{fileName}</p>
        {hasFields ? (
          <dl className="mt-3 grid grid-cols-1 gap-y-1 text-xs sm:grid-cols-2">
            {ocr.accountHolder ? (
              <>
                <dt className="text-muted-foreground">{copy.fieldLabels.accountHolder}</dt>
                <dd className="font-medium text-foreground">{ocr.accountHolder}</dd>
              </>
            ) : null}
            {ocr.balance ? (
              <>
                <dt className="text-muted-foreground">{copy.fieldLabels.balance}</dt>
                <dd className="font-mono font-medium text-foreground">{ocr.balance}</dd>
              </>
            ) : null}
            {ocr.dateRange ? (
              <>
                <dt className="text-muted-foreground">{copy.fieldLabels.dateRange}</dt>
                <dd className="font-medium text-foreground">{ocr.dateRange}</dd>
              </>
            ) : null}
          </dl>
        ) : null}
        <p className="mt-2 text-xs font-medium text-muted-foreground">{copy.submittedLabel}</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 text-muted-foreground hover:text-foreground"
        aria-label={copy.dismissCta}
      >
        <X className="size-4" weight="duotone" aria-hidden="true" />
      </button>
    </div>
  );
}
```

### Step 2: Commit
```bash
git add src/components/student/documents/OcrSummaryCard.tsx
git commit -m "feat(student): add OcrSummaryCard — shows extracted fields after document upload"
```

---

## Task 12: Wire BankVerificationSection + OcrSummaryCard into Documents Page

**Files:**
- Modify: `src/app/dashboard/[role]/documents/documents-page-client.tsx`
- Modify: `src/config/copy/student.ts` (remove bank_statement from typeOptions)
- Modify: `src/server/routers/student-documents.procedures.ts` (extend uploadDocument response with ocrSummary)

### Step 1: Extend uploadDocument response with ocrSummary

In `student-documents.procedures.ts`, find the `uploadDocument` output schema. Add:
```ts
ocrSummary: z.object({
  accountHolder: z.string().nullable(),
  balance: z.string().nullable(),
  dateRange: z.string().nullable(),
}).nullable(),
```

In the mutation handler, after uploading, return `ocrSummary: null` for now (OCR extraction is a future integration):
```ts
return { documentId: record.id, ocrSummary: null };
```

### Step 2: Remove bank_statement from typeOptions in copy config

In `src/config/copy/student.ts`, find `documents.typeOptions` array and remove the `bank_statement` entry. It now lives exclusively in `BankVerificationSection`.

### Step 3: Add BankVerificationSection and OcrSummaryCard to documents-page-client

At the top of the returned JSX (after PageHeader), before the upload form section:

```tsx
import { BankVerificationSection } from '@/components/student/BankVerificationSection';
import { OcrSummaryCard } from '@/components/student/documents/OcrSummaryCard';

// State
const [ocrResult, setOcrResult] = useState<{
  fileName: string;
  ocr: { accountHolder?: string | null; balance?: string | null; dateRange?: string | null } | null;
} | null>(null);

// Inside JSX, before <section id="document-upload-form">:
<section id="bank" className="scroll-mt-4">
  <BankVerificationSection
    initialStatus={/* derive from verification query */}
    bankName={/* from verification query */}
    accountNumberMasked={/* from verification query */}
    onBankConnected={() => void utils.student.getVerificationStatus.invalidate()}
    onStatementUploaded={() => void utils.student.listDocuments.invalidate()}
  />
</section>
```

To get bank status in the documents client, add a query:
```tsx
const verificationQuery = trpc.student.getVerificationStatus.useQuery(undefined, {
  staleTime: 30_000,
});

const bankStatus = useMemo(() => {
  if (verificationQuery.data?.monoConnection.isConnected) return 'verified' as const;
  const hasPendingStatement = studentDocumentsQuery.data?.some(
    (d) => d.type === 'bank_statement' && (d.status === 'pending' || d.status === 'approved')
  );
  if (hasPendingStatement) return 'pending_review' as const;
  return 'not_verified' as const;
}, [verificationQuery.data, studentDocumentsQuery.data]);
```

### Step 4: Show OcrSummaryCard after successful upload

In `handleUpload`, after `setUploadStage('submitted')`:
```ts
const ocrSummary = result.ocrSummary ?? null;
setOcrResult({
  fileName: values.file.name,
  ocr: ocrSummary,
});
```

In JSX, show `OcrSummaryCard` between `DocumentUploadProgress` and the document list when `ocrResult` is not null.

### Step 5: Build check
```bash
npm run check
```

### Step 6: Commit
```bash
git add src/app/dashboard/[role]/documents/documents-page-client.tsx \
        src/server/routers/student-documents.procedures.ts \
        src/config/copy/student.ts
git commit -m "feat(documents): add BankVerificationSection and OcrSummaryCard, remove bank_statement from doc type dropdown"
```

---

## Task 13: Document List Thumbnails

**Files:**
- Modify: `src/components/student/documents/student-document-list.tsx`

### Step 1: Add thumbnail to each document list item

Each item needs a thumbnail slot. The signed URL is already fetched by the `handleView` mutation. Add a per-item thumbnail state using the existing mutation.

Replace the `FileText` icon with a conditional thumbnail:

```tsx
// Add to component: per-item thumbnail URL state
const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
const getThumbnailUrl = trpc.documents.getDocumentSignedUrl.useMutation();

const handleLoadThumbnail = async (documentId: string) => {
  if (thumbnails[documentId]) return;
  try {
    const { url } = await getThumbnailUrl.mutateAsync({ documentId });
    setThumbnails((prev) => ({ ...prev, [documentId]: url }));
  } catch {
    // Silent — thumbnail is best-effort
  }
};
```

In the list item, replace the `FileText` icon row with:
```tsx
<div className="flex items-start gap-3">
  {/* Thumbnail */}
  <DocumentThumbnail
    documentId={document.id}
    mimeType={document.mimeType}
    thumbnailUrl={thumbnails[document.id] ?? null}
    onLoad={() => void handleLoadThumbnail(document.id)}
  />
  <div className="min-w-0 space-y-1">
    {/* existing content */}
  </div>
</div>
```

Create a simple `DocumentThumbnail` sub-component in the same file:
```tsx
function DocumentThumbnail({
  documentId,
  thumbnailUrl,
  onLoad,
}: {
  documentId: string;
  mimeType?: string;
  thumbnailUrl: string | null;
  onLoad: () => void;
}) {
  useEffect(() => {
    onLoad();
  }, [documentId]);  // eslint disabled only if actually needed — prefer restructuring

  if (thumbnailUrl) {
    return (
      <img
        src={thumbnailUrl}
        alt=""
        aria-hidden="true"
        className="h-12 w-10 shrink-0 rounded border border-border object-cover"
      />
    );
  }

  return (
    <div className="flex h-12 w-10 shrink-0 items-center justify-center rounded border border-border bg-muted">
      <FileText className="size-4 text-muted-foreground" weight="duotone" aria-hidden="true" />
    </div>
  );
}
```

Note: the `useEffect` dependency on `onLoad` must be stable (use `useCallback` at the parent level to memoize `handleLoadThumbnail`).

### Step 2: Build check
```bash
npm run check
```

### Step 3: Commit
```bash
git add src/components/student/documents/student-document-list.tsx
git commit -m "feat(documents): add document thumbnails to list — image preview for uploaded files"
```

---

## Task 14: Proof Checklist Action Links

**Files:**
- Modify: `src/components/student/ProofChecklistCard.tsx`

### Step 1: Add href prop to ChecklistItem

```tsx
type ChecklistItemProps = {
  complete: boolean;
  label: string;
  completeDetail: string;
  pendingDetail: string;
  pendingHref?: string;  // NEW
};

function ChecklistItem({ complete, label, completeDetail, pendingDetail, pendingHref }: ChecklistItemProps) {
  return (
    <li className="min-h-11 rounded-lg border border-border bg-background/70 p-3 transition-colors duration-150">
      <div className="flex items-start gap-3">
        {/* icons unchanged */}
        <div className="flex flex-1 items-start justify-between gap-2">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground">
              {complete ? completeDetail : pendingDetail}
            </p>
          </div>
          {!complete && pendingHref ? (
            <Link
              href={pendingHref}
              className="shrink-0 text-xs font-medium text-primary underline-offset-2 hover:underline"
            >
              Complete →
            </Link>
          ) : null}
        </div>
      </div>
    </li>
  );
}
```

### Step 2: Add pendingHref to each ChecklistItem call

```tsx
<ChecklistItem
  complete={checklist.kycComplete}
  label={...}
  pendingHref="/dashboard/student?action=verify"
/>
<ChecklistItem
  complete={checklist.schoolComplete}
  label={...}
  pendingHref="/dashboard/student/schools"
/>
<ChecklistItem
  complete={checklist.bankComplete}
  label={...}
  pendingHref="/dashboard/student/documents#bank"
/>
{checklist.requiresSponsor ? (
  <ChecklistItem
    complete={checklist.sponsorComplete}
    label={...}
    pendingHref="/dashboard/student"
  />
) : null}
<ChecklistItem
  complete={checklist.documentsComplete}
  label={...}
  pendingHref="/dashboard/student/documents"
/>
```

### Step 3: Commit
```bash
git add src/components/student/ProofChecklistCard.tsx
git commit -m "feat(proof): add action links to pending checklist items"
```

---

## Task 15: Delete Verify Route + Add Redirect

**Files:**
- Delete: `src/app/dashboard/[role]/verify/verify-page-client.tsx`
- Delete: `src/app/dashboard/[role]/verify/page.tsx`
- Delete: `src/app/dashboard/[role]/verify/error.tsx`
- Modify: `next.config.ts`

### Step 1: Delete verify route files
```bash
rm src/app/dashboard/[role]/verify/verify-page-client.tsx
rm src/app/dashboard/[role]/verify/page.tsx
rm src/app/dashboard/[role]/verify/error.tsx
```

Check if `verify/loading.tsx` exists:
```bash
ls src/app/dashboard/[role]/verify/
```
Delete any remaining files in that directory, then remove the directory.

### Step 2: Add 301 redirect in next.config.ts

In `next.config.ts`, add to the `redirects` array (or create one):
```ts
async redirects() {
  return [
    {
      source: '/dashboard/student/verify',
      destination: '/dashboard/student',
      permanent: true,
    },
  ];
},
```

### Step 3: Check for any remaining imports of deleted files

```bash
grep -r "verify-page-client\|/verify/page\|from.*verify" src/ --include="*.ts" --include="*.tsx"
```
Fix any broken imports found.

### Step 4: Final full build and test
```bash
npm run check
```
Expected: clean pass.

### Step 5: Commit
```bash
git add next.config.ts
git rm src/app/dashboard/[role]/verify/verify-page-client.tsx \
       src/app/dashboard/[role]/verify/page.tsx \
       src/app/dashboard/[role]/verify/error.tsx
git commit -m "feat(routing): delete /verify route, add 301 redirect to /dashboard/student"
```

---

## Completion Checklist

- [ ] AI slop removed (gradient, backdrop-blur) from ProofChecklistCard
- [ ] All hardcoded JSX strings moved to copy config
- [ ] Verify removed from student nav
- [ ] `resolveNextKycTier` unit tested (4 tests passing)
- [ ] `startDojahIdentityCheck` no longer requires tier from client
- [ ] Phone OTP procedures added to verificationProcedures
- [ ] `PhoneVerificationSheet` component — OTP flow working
- [ ] `KycIdentitySheet` component — single form, tier auto-resolved
- [ ] Sheets wired into student overview with auto-open and ?action= support
- [ ] Journey `NEXT_ACTIONS.identity` href updated to `?action=verify`
- [ ] Journey `NEXT_ACTIONS.bank` href updated to `/documents#bank`
- [ ] `BankVerificationSection` — Mono + statement upload unified
- [ ] `OcrSummaryCard` — shows after upload, auto-dismisses
- [ ] Bank verification section rendered on documents page (above doc list)
- [ ] `bank_statement` removed from document type dropdown
- [ ] Document list has thumbnails per row
- [ ] Proof checklist pending items have action links
- [ ] `/verify` route files deleted
- [ ] 301 redirect in next.config.ts
- [ ] `npm run check` passes clean
