# Student Journey Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the student dashboard navigation from a 6-item menu with a wizard-based onboarding and hidden verify page into a clean 6-item sidebar (Overview → Onboarding → Verification → Documents → Proof of Funds → Settings) where each page maps to a clear journey stage.

**Architecture:** Three layers of change — (1) nav config + routing, (2) new Verification page with 3 stacked tier cards, (3) student Overview page updates. The existing `KycIdentitySheet` and `PhoneVerificationSheet` components are reused on the new Verification page. The existing `/proof` page gets a fee-card state and a History tab. The `/onboarding` route is moved to `/setup`.

**Tech Stack:** Next.js App Router (Server Components + Client Components), tRPC server caller, Tailwind CSS 4, Phosphor Duotone icons, shadcn/ui, `src/config/copy/` for all strings.

---

## Pre-flight checks (run before starting)

```bash
cd /Users/gm/v6
npm run check            # must pass before touching anything
git status               # confirm clean working tree
```

---

### Task 1: Update student nav config

**What:** Replace current 6-item nav (with Schools, Support, quickAction) with new 6-item nav (Onboarding, Verification replace Schools/Support; remove quickAction).

**Files:**
- Modify: `src/config/nav/student.ts`

**Step 1: Write the updated nav config**

Replace the entire file:

```typescript
'use client';

import {
  House,
  ClipboardText,
  ShieldCheck,
  FileText,
  Trophy,
  Gear,
} from '@/components/icons';

import type { NavConfig } from './types';

export const studentNavConfig: NavConfig = {
  groups: [],
  items: [
    {
      label: 'Overview',
      href: '/dashboard/student',
      icon: House,
      description: 'Dashboard summary and next steps',
      isPrimary: true,
    },
    {
      label: 'Onboarding',
      href: '/dashboard/student/setup',
      icon: ClipboardText,
      description: 'Set up your school and funding type',
    },
    {
      label: 'Verification',
      href: '/dashboard/student/verification',
      icon: ShieldCheck,
      description: 'Verify your identity and bank account',
      disabledBeforeStage: 1,
      disabledReason: 'Complete your profile setup first',
    },
    {
      label: 'Documents',
      href: '/dashboard/student/documents',
      icon: FileText,
      description: 'Upload your bank statement',
      disabledBeforeStage: 1,
      disabledReason: 'Complete your profile setup first',
    },
    {
      label: 'Proof of Funds',
      href: '/dashboard/student/proof',
      icon: Trophy,
      description: 'View and share your certificate',
      isPrimary: true,
      disabledBeforeStage: 2,
      disabledReason: 'Complete verification and documents first',
    },
    {
      label: 'Settings',
      href: '/dashboard/student/settings',
      icon: Gear,
      description: 'Account and session settings',
    },
  ],
};

// Backward compat
export const studentNav = studentNavConfig.items;
```

**Step 2: Check icons exist**

```bash
grep -r "ClipboardText\|ShieldCheck" src/components/icons.ts 2>/dev/null || grep -r "ClipboardText\|ShieldCheck" src/components/icons/ 2>/dev/null | head -5
```

If `ClipboardText` or `ShieldCheck` are missing, add them to the icons barrel file (same pattern as existing entries).

**Step 3: Run layout check**

```bash
npm run check 2>&1 | grep -E "error|Error" | head -20
```

**Step 4: Commit**

```bash
git add src/config/nav/student.ts
git commit -m "feat(nav): redesign student sidebar — 6 items, remove Schools/Support/quickAction"
```

---

### Task 2: Create the student Setup page (`/setup`)

**What:** The old `/onboarding` wizard is replaced with a single-page form at `/setup`. The existing `/onboarding` route for students redirects to `/setup`. Sponsor and University onboarding are unaffected.

**Files:**
- Create: `src/app/dashboard/[role]/setup/page.tsx`
- Create: `src/app/dashboard/[role]/setup/setup-page-client.tsx`
- Create: `src/app/dashboard/[role]/setup/loading.tsx`
- Modify: `src/app/dashboard/[role]/onboarding/page.tsx` (student redirect only)

**Step 1: Understand the current onboarding data shape**

Read the existing client to understand what tRPC calls are used:

```bash
grep -n "trpc\|caller\|api\." src/app/dashboard/\[role\]/onboarding/onboarding-page-client.tsx | head -30
```

**Step 2: Create the loading skeleton**

```typescript
// src/app/dashboard/[role]/setup/loading.tsx
import { PageShell, Section } from '@/components/layout/content-primitives';
import { Skeleton } from '@/components/ui/skeleton';

export default function SetupLoading() {
  return (
    <PageShell width="narrow">
      <Section>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-72 mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-10 w-32" />
        </div>
      </Section>
    </PageShell>
  );
}
```

**Step 3: Create the setup page client**

This is a single-page form with school selector (autosuggest) + funding type radio. When already complete, shows read-only summary + Edit button.

```typescript
// src/app/dashboard/[role]/setup/setup-page-client.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, PencilSimple } from '@/components/icons';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  PageShell,
  Section,
  PageHeader,
} from '@/components/layout/content-primitives';
import { RadioCardGroup } from '@/components/ui/radio-card-group';
import { studentSetupCopy } from '@/config/copy/student-setup.copy';
import { trpc } from '@/trpc/client';

// ------ Types ------

type School = { id: string; name: string; city: string };
type SchoolSelection = { schoolId: string; programId: string | null } | null;
type FundingType = 'self' | 'sponsor' | 'corporate';

type SetupPageClientProps = {
  schools: School[];
  initialSelection: SchoolSelection;
  initialFundingType: FundingType | null;
  isComplete: boolean;
};

// ------ Component ------

export function SetupPageClient({
  schools,
  initialSelection,
  initialFundingType,
  isComplete,
}: SetupPageClientProps) {
  const copy = studentSetupCopy;
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(!isComplete);
  const [schoolQuery, setSchoolQuery] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState(
    initialSelection?.schoolId ?? '',
  );
  const [fundingType, setFundingType] = useState<FundingType | null>(
    initialFundingType,
  );
  const [errors, setErrors] = useState<{ school?: string; funding?: string }>({});

  const saveSetup = trpc.student.saveSetup.useMutation({
    onSuccess: () => {
      setIsEditing(false);
      router.refresh();
    },
  });

  const filteredSchools = schools.filter((s) =>
    s.name.toLowerCase().includes(schoolQuery.toLowerCase()) ||
    s.city.toLowerCase().includes(schoolQuery.toLowerCase()),
  );

  const selectedSchool = schools.find((s) => s.id === selectedSchoolId) ?? null;

  function handleSubmit() {
    const newErrors: typeof errors = {};
    if (!selectedSchoolId) newErrors.school = copy.errors.schoolRequired;
    if (!fundingType) newErrors.funding = copy.errors.fundingRequired;
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    saveSetup.mutate({ schoolId: selectedSchoolId, fundingType: fundingType! });
  }

  // --- Read-only summary view ---
  if (isComplete && !isEditing) {
    return (
      <PageShell width="narrow">
        <Section>
          <PageHeader
            title={copy.title}
            description={copy.completedDescription}
          />
          <div className="mt-6 rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="size-5 text-primary" weight="duotone" aria-hidden="true" />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {copy.fields.school.label}
                </p>
                <p className="text-base font-semibold text-foreground mt-0.5">
                  {selectedSchool?.name ?? copy.fields.school.unknownPlaceholder}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="size-5 text-primary" weight="duotone" aria-hidden="true" />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {copy.fields.funding.label}
                </p>
                <p className="text-base font-semibold text-foreground mt-0.5">
                  {copy.fields.funding.labels[initialFundingType ?? 'self']}
                </p>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => setIsEditing(true)}
          >
            <PencilSimple className="size-4 mr-1.5" weight="duotone" aria-hidden="true" />
            {copy.editButton}
          </Button>
        </Section>
      </PageShell>
    );
  }

  // --- Editable form view ---
  return (
    <PageShell width="narrow">
      <Section>
        <PageHeader title={copy.title} description={copy.description} />

        <div className="mt-6 space-y-6">
          {/* School selector */}
          <div>
            <Label htmlFor="school-search">{copy.fields.school.label}</Label>
            <p className="text-sm text-muted-foreground mb-2">
              {copy.fields.school.hint}
            </p>
            <input
              id="school-search"
              type="text"
              value={schoolQuery || selectedSchool?.name || ''}
              onChange={(e) => {
                setSchoolQuery(e.target.value);
                setSelectedSchoolId('');
              }}
              placeholder={copy.fields.school.placeholder}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {schoolQuery && filteredSchools.length > 0 && !selectedSchoolId && (
              <ul className="mt-1 max-h-48 overflow-y-auto rounded-lg border border-border bg-card shadow-md">
                {filteredSchools.slice(0, 8).map((school) => (
                  <li key={school.id}>
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm hover:bg-muted focus-visible:bg-muted"
                      onClick={() => {
                        setSelectedSchoolId(school.id);
                        setSchoolQuery('');
                        setErrors((e) => ({ ...e, school: undefined }));
                      }}
                    >
                      <span className="font-medium">{school.name}</span>
                      <span className="text-muted-foreground ml-2">{school.city}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {errors.school && (
              <p className="mt-1 text-sm text-destructive">{errors.school}</p>
            )}
          </div>

          {/* Funding type */}
          <div>
            <Label>{copy.fields.funding.label}</Label>
            <p className="text-sm text-muted-foreground mb-3">
              {copy.fields.funding.hint}
            </p>
            <RadioCardGroup
              value={fundingType ?? ''}
              onValueChange={(v) => {
                setFundingType(v as FundingType);
                setErrors((e) => ({ ...e, funding: undefined }));
              }}
              options={[
                {
                  value: 'self',
                  label: copy.fields.funding.options.self.label,
                  description: copy.fields.funding.options.self.description,
                },
                {
                  value: 'sponsor',
                  label: copy.fields.funding.options.sponsor.label,
                  description: copy.fields.funding.options.sponsor.description,
                },
                {
                  value: 'corporate',
                  label: copy.fields.funding.options.corporate.label,
                  description: copy.fields.funding.options.corporate.description,
                },
              ]}
            />
            {errors.funding && (
              <p className="mt-1 text-sm text-destructive">{errors.funding}</p>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={saveSetup.isPending}
            className="w-full sm:w-auto"
          >
            {saveSetup.isPending ? copy.savingButton : copy.saveButton}
          </Button>

          {saveSetup.error && (
            <p className="text-sm text-destructive">{saveSetup.error.message}</p>
          )}
        </div>
      </Section>
    </PageShell>
  );
}
```

**Step 4: Create the setup page server component**

```typescript
// src/app/dashboard/[role]/setup/page.tsx
import { notFound } from 'next/navigation';
import { api } from '@/trpc/server';
import { SetupPageClient } from './setup-page-client';

export const metadata = { title: 'Set up your profile — Doculet' };

type Props = { params: Promise<{ role: string }> };

export default async function StudentSetupPage({ params }: Props) {
  const { role } = await params;
  if (role !== 'student') notFound();

  const caller = await api();
  const [schoolsResult, selectionResult, verificationResult] = await Promise.allSettled([
    caller.student.listSchools({}),
    caller.student.getStudentSchoolSelection(),
    caller.student.getVerificationStatus(),
  ]);

  const schools =
    schoolsResult.status === 'fulfilled'
      ? schoolsResult.value.map((s) => ({ id: s.id, name: s.name, city: s.city ?? '' }))
      : [];
  const selection =
    selectionResult.status === 'fulfilled' ? selectionResult.value : null;
  const verification =
    verificationResult.status === 'fulfilled' ? verificationResult.value : null;

  const isComplete = Boolean(selection?.schoolId);
  const fundingType = verification?.fundingType ?? null;

  return (
    <>
      <h1 className="sr-only">Set up your profile</h1>
      <SetupPageClient
        schools={schools}
        initialSelection={selection}
        initialFundingType={fundingType as 'self' | 'sponsor' | 'corporate' | null}
        isComplete={isComplete}
      />
    </>
  );
}
```

**Step 5: Add `saveSetup` tRPC procedure if it doesn't exist**

Check first:
```bash
grep -r "saveSetup\|saveStudentSetup" src/server/routers/ | head -5
```

If missing, add to `src/server/routers/student.ts`:
```typescript
saveSetup: roleProcedure('student')
  .input(z.object({
    schoolId: z.string().uuid(),
    fundingType: z.enum(['self', 'sponsor', 'corporate']),
  }))
  .mutation(async ({ ctx, input }) => {
    // Reuse the existing school selection + funding type update logic
    await saveStudentSetup(ctx.db, ctx.session.user.id, input);
    return { success: true };
  }),
```

**Step 6: Create copy config**

```typescript
// src/config/copy/student-setup.copy.ts
export const studentSetupCopy = {
  title: 'Set up your profile',
  description: 'Choose your school and how you plan to fund your program.',
  completedDescription: 'Your profile is set up. Edit below if needed.',
  saveButton: 'Save and continue',
  savingButton: 'Saving…',
  editButton: 'Edit',
  fields: {
    school: {
      label: 'School',
      hint: 'Search by university name or city.',
      placeholder: 'Search schools…',
      unknownPlaceholder: 'School on file',
    },
    funding: {
      label: 'Funding type',
      hint: 'How are you funding your program?',
      labels: {
        self: 'Self-funded',
        sponsor: 'Family sponsor',
        corporate: 'Corporate sponsor',
      },
      options: {
        self: {
          label: 'Self-funded',
          description: 'I am paying for my own program.',
        },
        sponsor: {
          label: 'Family sponsor',
          description: 'Someone in my family is sponsoring me.',
        },
        corporate: {
          label: 'Corporate sponsor',
          description: 'A company is sponsoring me.',
        },
      },
    },
  },
  errors: {
    schoolRequired: 'Please select a school.',
    fundingRequired: 'Please select a funding type.',
  },
};
```

**Step 7: Redirect student onboarding route to /setup**

In `src/app/dashboard/[role]/onboarding/page.tsx`, add a student-specific redirect before the student render:

```typescript
// Inside OnboardingPage, after the auth/role checks, before the role branches:
if (role === 'student') {
  redirect(`/dashboard/student/setup`);
}
```

**Step 8: Run checks and commit**

```bash
npm run check 2>&1 | grep -E "error|Error" | head -20
git add src/app/dashboard/\[role\]/setup/ src/config/copy/student-setup.copy.ts src/app/dashboard/\[role\]/onboarding/page.tsx
git commit -m "feat(student): add /setup single-page onboarding form, redirect /onboarding to /setup"
```

---

### Task 3: Update the journey model

**What:** `src/lib/journey/student.ts` currently has `STAGE_ORDER = ['school', 'identity', 'documents', 'bank', 'proof']`. This needs to align with the new nav: onboarding, verification, documents, proof. Update stage IDs, completion logic, and next-action hrefs.

**Files:**
- Modify: `src/lib/journey/student.ts`
- Check: `src/lib/student-trust-stage.ts` (update quick action hrefs)
- Check: `tests/unit/student-trust-stage.test.ts`

**Step 1: Read the current tests**

```bash
cat tests/unit/student-trust-stage.test.ts
```

**Step 2: Update journey model**

```typescript
// src/lib/journey/student.ts
import type { JourneyNextAction, JourneyStageCopy, JourneyStageStatus, JourneyState } from './types';

interface StudentJourneyInput {
  onboardingComplete: boolean;   // school selected + funding type set
  verificationComplete: boolean; // all 3 tiers done
  documentsComplete: boolean;    // bank statement approved (if on doc upload path)
  proofReady: boolean;           // cert issued
}

const STAGE_ORDER = ['onboarding', 'verification', 'documents', 'proof'] as const;

const NEXT_ACTIONS: Record<string, JourneyNextAction> = {
  onboarding: {
    label: 'Set up your profile',
    description: 'Choose your school and how you plan to fund your program.',
    cta: 'Set up your profile',
    href: '/dashboard/student/setup',
  },
  verification: {
    label: 'Verify your identity',
    description: 'Confirm your phone, identity, and bank account.',
    cta: 'Continue verification',
    href: '/dashboard/student/verification',
  },
  documents: {
    label: 'Upload your bank statement',
    description: 'Upload a bank statement showing your available balance.',
    cta: 'Upload now',
    href: '/dashboard/student/documents',
  },
  proof: {
    label: 'View your certificate',
    description: 'Your application is complete. Review your proof-of-funds certificate.',
    cta: 'View certificate',
    href: '/dashboard/student/proof',
  },
};

function isStageComplete(stageId: string, data: StudentJourneyInput): boolean {
  switch (stageId) {
    case 'onboarding':
      return data.onboardingComplete;
    case 'verification':
      return data.verificationComplete;
    case 'documents':
      return data.documentsComplete;
    case 'proof':
      return data.proofReady;
    default:
      return false;
  }
}

export function computeStudentJourney(
  data: StudentJourneyInput,
  copy: JourneyStageCopy,
): JourneyState {
  let currentStageIndex = -1;
  let completedCount = 0;

  const stages = STAGE_ORDER.map((id, index) => {
    const completed = isStageComplete(id, data);
    let status: JourneyStageStatus;

    if (completed) {
      completedCount++;
      status = 'completed';
    } else if (currentStageIndex === -1) {
      currentStageIndex = index;
      status = 'current';
    } else {
      status = 'upcoming';
    }

    return { id, label: copy.stages[id] ?? id, status };
  });

  const allComplete = completedCount === STAGE_ORDER.length;
  const currentStageId = currentStageIndex >= 0 ? STAGE_ORDER[currentStageIndex] : null;
  const nextAction = currentStageId ? (NEXT_ACTIONS[currentStageId] ?? null) : null;

  return {
    stages,
    currentStageIndex,
    completedCount,
    totalCount: STAGE_ORDER.length,
    nextAction,
    allComplete,
    completionMessage: allComplete ? copy.completionMessage : null,
  };
}
```

**Step 3: Update student trust stage quick actions**

In `src/lib/student-trust-stage.ts`, update hrefs:

```typescript
case 0:
  return { label: 'Set up your profile', href: '/dashboard/student/setup' };
case 1:
  return { label: 'Continue verification', href: '/dashboard/student/verification' };
```

**Step 4: Update the student overview to pass new journey inputs**

In `src/app/dashboard/[role]/_components/student-overview.tsx`, the call to `computeStudentJourney` uses the old `StudentJourneyInput` shape. Update it to match the new interface:

```typescript
const journeyState = computeStudentJourney(
  {
    onboardingComplete: Boolean(schoolSelection?.schoolId),
    verificationComplete: completionPercent >= 100,
    documentsComplete: allDocsApproved,
    proofReady: /* check if cert is issued — add to data fetch if needed */ false,
  },
  copy.journey,
);
```

**Step 5: Update copy config for journey stages**

The `copy.journey.stages` object must have keys matching the new stage IDs. Find and update:

```bash
grep -r "journey" src/config/copy/dashboard-shell.ts | head -20
```

Add/update the `stages` object to include: `onboarding`, `verification`, `documents`, `proof`.

**Step 6: Run tests and fix**

```bash
npm run test -- tests/unit/student-trust-stage.test.ts
npm run test -- tests/unit/student-nav-config.test.ts
```

Fix any failing tests — they likely test old stage names or hrefs.

**Step 7: Commit**

```bash
git add src/lib/journey/student.ts src/lib/student-trust-stage.ts src/app/dashboard/\[role\]/_components/student-overview.tsx src/config/copy/
git commit -m "feat(journey): update student journey model — 4 stages aligned with new nav"
```

---

### Task 4: Create the Verification page

**What:** New page at `/dashboard/student/verification` with 3 stacked tier cards. T1 (phone verification), T2 (Dojah KYC), T3 (banking — equal Mono/upload choice). The existing `PhoneVerificationSheet` and `KycIdentitySheet` are opened from tier card CTAs. Phone verification sheet auto-opens if T1 is incomplete (same as current overview behaviour). Proof target progress bar above tiers.

**Files:**
- Create: `src/app/dashboard/[role]/verification/page.tsx`
- Create: `src/app/dashboard/[role]/verification/verification-page-client.tsx`
- Create: `src/app/dashboard/[role]/verification/loading.tsx`
- Create: `src/components/student/VerificationTierCard.tsx`

**Step 1: Create loading skeleton**

```typescript
// src/app/dashboard/[role]/verification/loading.tsx
import { PageShell, Section } from '@/components/layout/content-primitives';
import { Skeleton } from '@/components/ui/skeleton';

export default function VerificationLoading() {
  return (
    <PageShell width="narrow">
      <Section>
        <Skeleton className="h-8 w-56 mb-2" />
        <Skeleton className="h-2 w-full rounded-full mb-8" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl mb-4" />
        ))}
      </Section>
    </PageShell>
  );
}
```

**Step 2: Create the VerificationTierCard component**

```typescript
// src/components/student/VerificationTierCard.tsx
import { CheckCircle, Lock } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type TierStatus = 'complete' | 'active' | 'upcoming' | 'manual_review';

type VerificationTierCardProps = {
  tier: 1 | 2 | 3;
  title: string;
  description: string;
  status: TierStatus;
  summaryLine?: string;      // shown when complete, e.g. "Phone ending in 1234"
  ctaLabel?: string;         // shown when active
  onCta?: () => void;
  manualReviewNote?: string; // shown when status === 'manual_review'
};

export function VerificationTierCard({
  tier,
  title,
  description,
  status,
  summaryLine,
  ctaLabel,
  onCta,
  manualReviewNote,
}: VerificationTierCardProps) {
  const isUpcoming = status === 'upcoming';
  const isComplete = status === 'complete';
  const isManualReview = status === 'manual_review';

  return (
    <div
      className={cn(
        'rounded-xl border bg-card p-5 transition-opacity',
        isUpcoming && 'opacity-50',
        isComplete && 'border-border',
        !isUpcoming && !isComplete && 'border-border ring-1 ring-primary/20',
      )}
    >
      <div className="flex items-start gap-4">
        {/* Tier number or check */}
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
            isComplete
              ? 'bg-primary/10 text-primary'
              : isUpcoming
                ? 'bg-muted text-muted-foreground'
                : 'bg-primary/10 text-primary',
          )}
        >
          {isComplete ? (
            <CheckCircle className="size-4" weight="duotone" aria-hidden="true" />
          ) : (
            <span>{tier}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{title}</p>

          {isComplete && summaryLine ? (
            <p className="text-sm text-muted-foreground mt-0.5">{summaryLine}</p>
          ) : isManualReview ? (
            <p className="text-sm text-muted-foreground mt-0.5">
              {manualReviewNote ?? 'Your identity is under manual review. We\'ll notify you when it\'s complete.'}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}

          {!isComplete && !isUpcoming && !isManualReview && ctaLabel && onCta && (
            <Button size="sm" className="mt-3" onClick={onCta}>
              {ctaLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Create the verification page client**

```typescript
// src/app/dashboard/[role]/verification/verification-page-client.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { KycIdentitySheet } from '@/components/student/KycIdentitySheet';
import { PhoneVerificationSheet } from '@/components/student/PhoneVerificationSheet';
import { VerificationTierCard } from '@/components/student/VerificationTierCard';
import {
  PageShell,
  Section,
  PageHeader,
} from '@/components/layout/content-primitives';
import { studentVerificationCopy } from '@/config/copy/student-verification.copy';
import { formatCurrency } from '@/lib/utils';
import { trpc } from '@/trpc/client';

type VerificationData = {
  phoneVerified: boolean;
  phoneLastFour: string | null;
  kycComplete: boolean;
  kycStatus: 'none' | 'pending' | 'verified' | 'failed' | 'manual_review';
  kycFailedAttempts: number;
  bankConnected: boolean;
  bankName: string | null;
  accountNumberMasked: string | null;
  completionPercent: number;
  proofTargetKobo: number | null;
  verifiedAmountKobo: number | null;
  fundingType: 'self' | 'sponsor' | 'corporate' | null;
};

type VerificationPageClientProps = {
  data: VerificationData;
};

export function VerificationPageClient({ data }: VerificationPageClientProps) {
  const copy = studentVerificationCopy;
  const router = useRouter();
  const searchParams = useSearchParams();

  const [phoneOpen, setPhoneOpen] = useState(false);
  const [phoneDismissed, setPhoneDismissed] = useState(false);
  const [kycOpen, setKycOpen] = useState(false);

  // Auto-open phone sheet if T1 incomplete (on page load, unless dismissed)
  useEffect(() => {
    if (!data.phoneVerified && !phoneDismissed) {
      setPhoneOpen(true);
    }
  }, [data.phoneVerified, phoneDismissed]);

  // Open KYC sheet via ?action=verify
  useEffect(() => {
    if (searchParams.get('action') === 'verify' && data.phoneVerified) {
      setKycOpen(true);
    }
  }, [searchParams, data.phoneVerified]);

  const handlePhoneVerified = useCallback(() => {
    setPhoneOpen(false);
    router.refresh();
  }, [router]);

  const handleKycSuccess = useCallback(() => {
    setKycOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.delete('action');
    window.history.replaceState({}, '', url.pathname);
    router.refresh();
  }, [router]);

  // Derive tier statuses
  const t1Status = data.phoneVerified ? 'complete' : 'active';
  const t2Status: 'complete' | 'active' | 'upcoming' | 'manual_review' = !data.phoneVerified
    ? 'upcoming'
    : data.kycStatus === 'manual_review'
      ? 'manual_review'
      : data.kycComplete
        ? 'complete'
        : 'active';
  const t3Status: 'complete' | 'active' | 'upcoming' = !data.kycComplete
    ? 'upcoming'
    : data.bankConnected
      ? 'complete'
      : 'active';

  // Progress bar
  const hasTarget = data.proofTargetKobo != null && data.proofTargetKobo > 0;
  const targetLabel = hasTarget
    ? copy.proofTarget.label(
        formatCurrency((data.verifiedAmountKobo ?? 0) / 100),
        formatCurrency(data.proofTargetKobo! / 100),
      )
    : null;

  return (
    <PageShell width="narrow">
      <Section>
        <PageHeader title={copy.title} description={copy.description} />

        {/* Proof target progress bar */}
        {hasTarget && (
          <div className="mt-4 mb-6">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>{targetLabel}</span>
              <span>{data.completionPercent}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(data.completionPercent, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Tier cards */}
        <div className="space-y-4">
          <VerificationTierCard
            tier={1}
            title={copy.tier1.title}
            description={copy.tier1.description}
            status={t1Status}
            summaryLine={
              data.phoneVerified && data.phoneLastFour
                ? copy.tier1.completedSummary(data.phoneLastFour)
                : undefined
            }
            ctaLabel={copy.tier1.cta}
            onCta={() => setPhoneOpen(true)}
          />

          <VerificationTierCard
            tier={2}
            title={copy.tier2.title}
            description={copy.tier2.description}
            status={t2Status}
            summaryLine={data.kycComplete ? copy.tier2.completedSummary : undefined}
            ctaLabel={copy.tier2.cta}
            onCta={() => setKycOpen(true)}
          />

          <VerificationTierCard
            tier={3}
            title={copy.tier3.title}
            description={copy.tier3.description}
            status={t3Status}
            summaryLine={
              data.bankConnected && data.bankName && data.accountNumberMasked
                ? copy.tier3.completedSummary(data.bankName, data.accountNumberMasked)
                : undefined
            }
            ctaLabel={copy.tier3.cta}
            onCta={() => router.push('/dashboard/student/documents#bank')}
          />
        </div>
      </Section>

      {/* Sheets */}
      <PhoneVerificationSheet
        open={phoneOpen}
        onOpenChange={(open) => {
          setPhoneOpen(open);
          if (!open) setPhoneDismissed(true);
        }}
        onVerified={handlePhoneVerified}
      />
      <KycIdentitySheet
        open={kycOpen}
        onOpenChange={setKycOpen}
        onSuccess={handleKycSuccess}
        failedAttempts={data.kycFailedAttempts}
      />
    </PageShell>
  );
}
```

**Step 4: Create the verification page server component**

```typescript
// src/app/dashboard/[role]/verification/page.tsx
import { notFound } from 'next/navigation';
import { api } from '@/trpc/server';
import { VerificationPageClient } from './verification-page-client';

export const metadata = { title: 'Identity Verification — Doculet' };

type Props = { params: Promise<{ role: string }> };

export default async function VerificationPage({ params }: Props) {
  const { role } = await params;
  if (role !== 'student') notFound();

  const caller = await api();
  const verificationResult = await caller.student.getVerificationStatus().catch(() => null);

  const v = verificationResult;

  const t2Status = v?.kycFailedAttempts && v.kycFailedAttempts >= 3
    ? 'manual_review'
    : v?.tiers.find((t) => t.tier === 2)?.status === 'verified'
      ? 'verified'
      : 'pending';

  return (
    <>
      <h1 className="sr-only">Identity Verification</h1>
      <VerificationPageClient
        data={{
          phoneVerified: Boolean(v?.tiers.find((t) => t.tier === 1)?.isComplete),
          phoneLastFour: null, // phone last 4 not in current schema — add if needed
          kycComplete: Boolean(v?.tiers.find((t) => t.tier === 2)?.isComplete),
          kycStatus: t2Status as 'none' | 'pending' | 'verified' | 'failed' | 'manual_review',
          kycFailedAttempts: v?.kycFailedAttempts ?? 0,
          bankConnected: v?.monoConnection.isConnected ?? false,
          bankName: v?.monoConnection.bankName ?? null,
          accountNumberMasked: v?.monoConnection.accountNumberMasked ?? null,
          completionPercent: v?.completionPercent ?? 0,
          proofTargetKobo: null, // add to tRPC output if needed
          verifiedAmountKobo: null, // add to tRPC output if needed
          fundingType: v?.fundingType ?? null,
        }}
      />
    </>
  );
}
```

**Step 5: Create copy config**

```typescript
// src/config/copy/student-verification.copy.ts
export const studentVerificationCopy = {
  title: 'Identity Verification',
  description: 'Complete all three tiers to verify your proof of funds.',
  proofTarget: {
    label: (verified: string, target: string) => `${verified} of ${target} verified`,
  },
  tier1: {
    title: 'Phone verification',
    description: 'Confirm your mobile number to secure your account.',
    cta: 'Verify phone',
    completedSummary: (lastFour: string) => `Verified · Phone ending in ${lastFour}`,
  },
  tier2: {
    title: 'Identity verification',
    description: 'Confirm your identity using your BVN, NIN, or passport.',
    cta: 'Verify identity',
    completedSummary: 'Identity verified',
  },
  tier3: {
    title: 'Bank account',
    description: 'Connect your bank account or upload a bank statement to confirm your balance.',
    cta: 'Connect bank',
    completedSummary: (bankName: string, masked: string) => `${bankName} · ${masked}`,
  },
};
```

**Step 6: Run checks and commit**

```bash
npm run check 2>&1 | grep -E "error|Error" | head -20
git add src/app/dashboard/\[role\]/verification/ src/components/student/VerificationTierCard.tsx src/config/copy/student-verification.copy.ts
git commit -m "feat(verification): add /verification page with 3-tier card layout"
```

---

### Task 5: Remove phone+KYC auto-open from Overview

**What:** `StudentOverviewSheets` currently auto-opens the phone sheet on Overview load. With the new `/verification` page handling this, remove the auto-open behaviour from Overview. The Overview page no longer triggers sheets; students go to Verification for that.

**Files:**
- Modify: `src/app/dashboard/[role]/_components/student-overview-sheets.tsx`
- Modify: `src/app/dashboard/[role]/_components/student-overview.tsx`

**Step 1: Remove StudentOverviewSheets entirely**

In `student-overview.tsx`, delete the import and JSX for `<StudentOverviewSheets />`.

**Step 2: Remove the file (it's moved to the Verification page)**

```bash
git rm src/app/dashboard/\[role\]/_components/student-overview-sheets.tsx
```

**Step 3: Update Overview CTA**

The Overview page should show a "Set up your profile" CTA when onboarding is not complete, pointing to `/dashboard/student/setup`. Update the `StudentOverview` component's CTA logic.

**Step 4: Commit**

```bash
git add src/app/dashboard/\[role\]/_components/student-overview.tsx
git commit -m "feat(overview): remove auto-open KYC/phone sheets, update first CTA to /setup"
```

---

### Task 6: Update Overview page layout and CTA states

**What:** Three states on the Overview page need updating:
1. **Onboarding not complete** → "Set up your profile" banner/card at top, "Begin your application" CTA
2. **Journey in progress** → "Continue your verification" CTA pointing to `/verification`
3. **Cert issued** → "Your proof of funds is verified." heading, cert card elevated to top

**Files:**
- Modify: `src/app/dashboard/[role]/_components/student-overview.tsx`
- Modify: `src/config/copy/dashboard-shell.ts` (journey stage labels)

**Step 1: Check the current journey copy config**

```bash
grep -n "journey\|stages\|completionMessage" src/config/copy/dashboard-shell.ts | head -30
```

**Step 2: Update stage labels to match new 4-stage model**

The `copy.journey.stages` object must have keys: `onboarding`, `verification`, `documents`, `proof`.

Example update in `dashboard-shell.ts`:
```typescript
journey: {
  stages: {
    onboarding: 'Profile setup',
    verification: 'Verification',
    documents: 'Documents',
    proof: 'Certificate',
  },
  completionMessage: 'Your proof of funds is verified.',
},
```

**Step 3: Update the Overview's CTA banner**

Replace the existing CTA button/banner logic with a state-driven approach:
- Stage 0 (onboarding not done): Card with "Set up your profile" CTA → `/setup`
- Stage 1+ (in progress): Banner "Continue your verification" → `/verification`
- All complete: No CTA; cert card elevated

**Step 4: Run tests and commit**

```bash
npm run test -- tests/unit/
npm run check
git add src/app/dashboard/\[role\]/_components/student-overview.tsx src/config/copy/dashboard-shell.ts
git commit -m "feat(overview): update CTA states — setup, verification, cert-elevated"
```

---

### Task 7: Final layout check and test pass

**Step 1: Run all checks**

```bash
npm run check
```

**Step 2: Run layout audit**

```bash
npm run layout-check
```

**Step 3: Fix any remaining issues**

Common failures:
- Missing `PageShell`/`Section` wrapper on new pages → add them
- Hardcoded strings in JSX → move to copy config
- Wrong icon weight → add `weight="duotone"` to Phosphor icons

**Step 4: Final commit**

```bash
git add -p   # review all remaining changes
git commit -m "chore(student-journey): fix layout-check and copy-check violations"
```

---

## Execution options

**Plan saved to `docs/plans/2026-03-06-student-journey-redesign.md`.**

Two execution options:

**1. Subagent-Driven (this session)** — Fresh subagent per task, review between tasks, fast iteration. Uses `superpowers:subagent-driven-development`.

**2. Parallel Session (separate)** — Open a new session in this repo, invoke `superpowers:executing-plans` to run task-by-task with checkpoints.
