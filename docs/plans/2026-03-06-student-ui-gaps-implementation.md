# Student UI Gaps — Full Premium Upgrade Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade all four student journey pages (onboarding, verify, proof, documents) to the Premium Institutional direction, fix all IA blueprint gaps A/B/C/K for the student role, and eliminate all hardcoded copy and raw `<select>` elements.

**Architecture:** Trust stage is computed server-side in `layout.tsx` via a lightweight tRPC endpoint, passed as props through `DashboardShell` → `Sidebar`, and applied as nav disabled state + smart QuickAction. Page-level changes are surgical: replace selects, add PageHeader breadcrumbs, add celebration/success states, fix hardcoded strings.

**Tech Stack:** Next.js 16 App Router, tRPC v11, Drizzle ORM, shadcn/ui (`<Select>`), Vitest, Tailwind CSS 4, Phosphor Duotone icons, Zod.

**Design doc:** `docs/plans/2026-03-06-student-ui-gaps-design.md`

---

## Task 1: Add copy strings to student copy config

**Files:**
- Modify: `src/config/copy/student.ts`

**Step 1: Add verify section strings**

In `src/config/copy/student.ts`, inside the `verify.bankSection` object (after `connectedLabel`), add:

```typescript
uploadAlternativeCta: "Upload a bank statement instead",
orDivider: "or",
connectMonoCta: "Connect your bank account",
```

Inside `verify.kycSection.dojahForm`, add tier option labels:

```typescript
tierOptions: {
  tier2: "Tier 2",
  tier3: "Tier 3",
},
```

**Step 2: Add onboarding celebration strings**

In `src/config/copy/student.ts`, inside `onboardingWizard.steps.action` (this lives in `student-onboarding.copy.ts` — check the import), add:

```typescript
nextStepCta: "Begin your verification",
overviewCta: "Go to your overview",
```

Check where `onboardingCopy.steps.action` lives:

```bash
grep -rn "steps.action\|action.completeCta" src/config/copy/ --include="*.ts" | head -10
```

**Step 3: Add documents all-approved strings**

In `src/config/copy/student.ts`, inside the `documents` object, add:

```typescript
allApproved: {
  heading: "All documents approved",
  body: "Your supporting documents have been verified. Your proof of funds is ready to review.",
  cta: "View your proof status",
},
```

**Step 4: Verify no TypeScript errors**

```bash
npx tsc --noEmit 2>&1 | grep "copy/student"
```

Expected: no output (no errors).

**Step 5: Commit**

```bash
git add src/config/copy/student.ts
git commit -m "feat(copy): add verify, onboarding, documents copy strings for premium upgrade"
```

---

## Task 2: Write and test the trust stage pure function

**Files:**
- Create: `src/lib/student-trust-stage.ts`
- Create: `tests/unit/student-trust-stage.test.ts`

**Step 1: Write the failing tests**

Create `tests/unit/student-trust-stage.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import { computeStudentTrustStage, getStudentQuickAction } from '@/lib/student-trust-stage';

describe('computeStudentTrustStage', () => {
  it('returns 0 when onboarding is not complete', () => {
    expect(computeStudentTrustStage({
      onboardingComplete: false,
      kycComplete: false,
      schoolComplete: false,
      bankComplete: false,
      sponsorComplete: false,
      documentsComplete: false,
      certificateIssued: false,
    })).toBe(0);
  });

  it('returns 1 when onboarding complete but checklist incomplete', () => {
    expect(computeStudentTrustStage({
      onboardingComplete: true,
      kycComplete: true,
      schoolComplete: true,
      bankComplete: false,
      sponsorComplete: false,
      documentsComplete: false,
      certificateIssued: false,
    })).toBe(1);
  });

  it('returns 2 when all checklist complete but no certificate', () => {
    expect(computeStudentTrustStage({
      onboardingComplete: true,
      kycComplete: true,
      schoolComplete: true,
      bankComplete: true,
      sponsorComplete: true,
      documentsComplete: true,
      certificateIssued: false,
    })).toBe(2);
  });

  it('returns 3 when certificate is issued', () => {
    expect(computeStudentTrustStage({
      onboardingComplete: true,
      kycComplete: true,
      schoolComplete: true,
      bankComplete: true,
      sponsorComplete: true,
      documentsComplete: true,
      certificateIssued: true,
    })).toBe(3);
  });
});

describe('getStudentQuickAction', () => {
  it('stage 0: points to onboarding', () => {
    const qa = getStudentQuickAction(0);
    expect(qa.href).toBe('/dashboard/student/onboarding');
    expect(qa.label).toBe('Set up your application');
  });

  it('stage 1: points to verify', () => {
    const qa = getStudentQuickAction(1);
    expect(qa.href).toBe('/dashboard/student/verify');
  });

  it('stage 2: points to proof', () => {
    const qa = getStudentQuickAction(2);
    expect(qa.href).toBe('/dashboard/student/proof');
  });

  it('stage 3: points to proof (share)', () => {
    const qa = getStudentQuickAction(3);
    expect(qa.href).toBe('/dashboard/student/proof');
    expect(qa.label).toBe('Share your certificate');
  });
});
```

**Step 2: Run test to confirm it fails**

```bash
npx vitest run tests/unit/student-trust-stage.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/student-trust-stage'`.

**Step 3: Implement the module**

Create `src/lib/student-trust-stage.ts`:

```typescript
import { ArrowRight, Trophy } from '@phosphor-icons/react/dist/ssr';
import type { Icon } from '@phosphor-icons/react';

export type StudentTrustStage = 0 | 1 | 2 | 3;

export type StudentTrustStageInput = {
  onboardingComplete: boolean;
  kycComplete: boolean;
  schoolComplete: boolean;
  bankComplete: boolean;
  sponsorComplete: boolean;
  documentsComplete: boolean;
  certificateIssued: boolean;
};

export function computeStudentTrustStage(input: StudentTrustStageInput): StudentTrustStage {
  if (!input.onboardingComplete) return 0;
  if (input.certificateIssued) return 3;

  const allComplete =
    input.kycComplete &&
    input.schoolComplete &&
    input.bankComplete &&
    input.sponsorComplete &&
    input.documentsComplete;

  return allComplete ? 2 : 1;
}

type QuickAction = { label: string; href: string; icon: Icon };

export function getStudentQuickAction(stage: StudentTrustStage): QuickAction {
  switch (stage) {
    case 0:
      return { label: 'Set up your application', href: '/dashboard/student/onboarding', icon: ArrowRight };
    case 1:
      return { label: 'Continue your application', href: '/dashboard/student/verify', icon: ArrowRight };
    case 2:
      return { label: 'View your proof', href: '/dashboard/student/proof', icon: Trophy };
    case 3:
      return { label: 'Share your certificate', href: '/dashboard/student/proof', icon: Trophy };
  }
}
```

**Step 4: Run test to confirm it passes**

```bash
npx vitest run tests/unit/student-trust-stage.test.ts
```

Expected: PASS — all 7 tests green.

**Step 5: Commit**

```bash
git add src/lib/student-trust-stage.ts tests/unit/student-trust-stage.test.ts
git commit -m "feat(lib): add computeStudentTrustStage and getStudentQuickAction pure functions"
```

---

## Task 3: Write and test the student nav progressive disclosure logic

**Files:**
- Modify: `src/config/nav/student.ts`
- Modify: `src/config/nav/index.ts`
- Create: `tests/unit/student-nav-config.test.ts`

**Step 1: Write failing tests**

Create `tests/unit/student-nav-config.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import { getNavConfig } from '@/config/nav';

describe('getNavConfig student progressive disclosure', () => {
  it('stage 0: verify, documents, proof are disabled', () => {
    const nav = getNavConfig('student', { studentTrustStage: 0 });
    const verify = nav.items.find((i) => i.href.includes('/verify'));
    const docs = nav.items.find((i) => i.href.includes('/documents'));
    const proof = nav.items.find((i) => i.href.includes('/proof'));
    expect(verify?.disabled).toBe(true);
    expect(docs?.disabled).toBe(true);
    expect(proof?.disabled).toBe(true);
  });

  it('stage 1: only proof is disabled', () => {
    const nav = getNavConfig('student', { studentTrustStage: 1 });
    const verify = nav.items.find((i) => i.href.includes('/verify'));
    const docs = nav.items.find((i) => i.href.includes('/documents'));
    const proof = nav.items.find((i) => i.href.includes('/proof'));
    expect(verify?.disabled).toBeFalsy();
    expect(docs?.disabled).toBeFalsy();
    expect(proof?.disabled).toBe(true);
  });

  it('stage 2+: nothing is disabled', () => {
    const nav = getNavConfig('student', { studentTrustStage: 2 });
    const disabledItems = nav.items.filter((i) => i.disabled);
    expect(disabledItems).toHaveLength(0);
  });

  it('non-student roles: no effect from studentTrustStage', () => {
    const nav = getNavConfig('sponsor', { studentTrustStage: 0 });
    const disabledItems = nav.items.filter((i) => i.disabled);
    expect(disabledItems).toHaveLength(0);
  });
});
```

**Step 2: Run test to confirm it fails**

```bash
npx vitest run tests/unit/student-nav-config.test.ts
```

Expected: FAIL — `getNavConfig` doesn't accept a second parameter.

**Step 3: Add `disabledBeforeStage` to NavItem type**

In `src/config/nav/types.ts`, add to the `NavItem` type:

```typescript
disabledBeforeStage?: number;   // student progressive disclosure: disable until this trust stage
```

**Step 4: Add `disabledBeforeStage` to student nav items**

In `src/config/nav/student.ts`, update the relevant items:

```typescript
{
  label: 'Verify',
  href: '/dashboard/student/verify',
  icon: ShieldCheck,
  description: 'Identity and KYC verification',
  group: 'journey',
  disabledBeforeStage: 1,
  disabledReason: 'Complete your application setup first',
},
{
  label: 'Documents',
  href: '/dashboard/student/documents',
  icon: FileText,
  description: 'Upload and manage your documents',
  group: 'journey',
  disabledBeforeStage: 1,
  disabledReason: 'Complete your application setup first',
},
{
  label: 'Proof of Funds',
  href: '/dashboard/student/proof',
  icon: Trophy,
  description: 'View and share your certificate',
  group: 'credentials',
  isPrimary: true,
  disabledBeforeStage: 2,
  disabledReason: 'Complete verification and documents first',
},
```

**Step 5: Update `getNavConfig` to accept options and apply disabled state**

In `src/config/nav/index.ts`:

```typescript
import type { StudentTrustStage } from '@/lib/student-trust-stage';

type GetNavConfigOptions = {
  studentTrustStage?: StudentTrustStage;
};

export function getNavConfig(role: string, options: GetNavConfigOptions = {}): NavConfig {
  if (!isDashboardRole(role)) {
    return { groups: [], items: [], quickAction: { label: 'Home', icon: House, href: '/' } };
  }

  const config = navConfigByRole[role];

  // Apply progressive disclosure for student role
  if (role === 'student' && options.studentTrustStage !== undefined) {
    const stage = options.studentTrustStage;
    const items = config.items.map((item) => {
      if (item.disabledBeforeStage !== undefined && stage < item.disabledBeforeStage) {
        return { ...item, disabled: true };
      }
      return item;
    });
    return { ...config, items };
  }

  return config;
}
```

**Step 6: Run tests to confirm they pass**

```bash
npx vitest run tests/unit/student-nav-config.test.ts tests/unit/student-trust-stage.test.ts
```

Expected: all tests PASS.

**Step 7: Commit**

```bash
git add src/config/nav/types.ts src/config/nav/student.ts src/config/nav/index.ts tests/unit/student-nav-config.test.ts
git commit -m "feat(nav): student progressive disclosure — disable nav items by trust stage"
```

---

## Task 4: Add `getTrustStageData` tRPC endpoint

**Files:**
- Modify: `src/server/routers/student-onboarding.procedures.ts`

**Step 1: Add the endpoint**

Find the `onboardingProcedures` export in `src/server/routers/student-onboarding.procedures.ts`. Add a new procedure:

```typescript
getTrustStageData: roleProcedure('student')
  .output(
    z.object({
      onboardingComplete: z.boolean(),
      kycComplete: z.boolean(),
      schoolComplete: z.boolean(),
      bankComplete: z.boolean(),
      sponsorComplete: z.boolean(),
      documentsComplete: z.boolean(),
      certificateIssued: z.boolean(),
    })
  )
  .query(async ({ ctx }) => {
    const profile = ctx.profile;

    // Reuse the calculateProofChecklistStatus helper from proof procedures
    // by importing it, or inline a lightweight version:
    const [kycRow, bankRow, sponsorRow, docsRow, certRow] = await Promise.all([
      ctx.db.query.verificationRequests.findFirst({
        where: (t, { and: a, eq: e }) =>
          a(e(t.studentId, ctx.user!.id), e(t.status, 'verified')),
        columns: { id: true },
      }),
      ctx.db.query.studentProfiles.findFirst({
        where: (t, { eq: e }) => e(t.userId, ctx.user!.id),
        columns: { bankAccountVerified: true, selectedSchoolId: true },
      }),
      ctx.db.query.sponsorships.findFirst({
        where: (t, { and: a, eq: e }) =>
          a(e(t.studentId, ctx.user!.id), e(t.status, 'active')),
        columns: { id: true },
      }),
      ctx.db.query.documents.findFirst({
        where: (t, { and: a, eq: e }) =>
          a(e(t.studentId, ctx.user!.id), e(t.status, 'approved')),
        columns: { id: true },
      }),
      ctx.db.query.certificates.findFirst({
        where: (t, { and: a, eq: e }) =>
          a(e(t.studentId, ctx.user!.id), e(t.status, 'active')),
        columns: { id: true },
      }),
    ]);

    return {
      onboardingComplete: profile.onboardingComplete,
      kycComplete: !!kycRow,
      schoolComplete: !!bankRow?.selectedSchoolId,
      bankComplete: !!bankRow?.bankAccountVerified,
      sponsorComplete: !!sponsorRow,
      documentsComplete: !!docsRow,
      certificateIssued: !!certRow,
    };
  }),
```

**Step 2: Check the schema imports are available**

```bash
grep -n "verificationRequests\|studentProfiles\|sponsorships\|documents\|certificates" src/db/schema/index.ts | head -10
```

Adjust the import if any table name differs.

**Step 3: Run typecheck**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors.

**Step 4: Commit**

```bash
git add src/server/routers/student-onboarding.procedures.ts
git commit -m "feat(trpc): add getTrustStageData endpoint for student nav progressive disclosure"
```

---

## Task 5: Thread trust stage through layout → DashboardShell → Sidebar

**Files:**
- Modify: `src/app/dashboard/[role]/layout.tsx`
- Modify: `src/components/layout/DashboardShell.tsx`
- Modify: `src/components/layout/Sidebar.tsx`

**Step 1: Update layout.tsx to fetch trust stage for student**

Replace the current `layout.tsx` content:

```typescript
import { Suspense } from 'react';
import { notFound } from 'next/navigation';

import { DashboardShell } from '@/components/layout/DashboardShell';
import { DashboardSkeleton } from '@/components/layout/DashboardSkeleton';
import { isDashboardRole } from '@/config/roles';
import { computeStudentTrustStage, getStudentQuickAction } from '@/lib/student-trust-stage';
import type { StudentTrustStage } from '@/lib/student-trust-stage';
import { TRPCReactProvider } from '@/trpc/provider';
import { api } from '@/trpc/server';

type DashboardRoleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ role: string }>;
};

export default async function DashboardRoleLayout({
  children,
  params,
}: DashboardRoleLayoutProps) {
  const { role } = await params;

  if (!isDashboardRole(role)) {
    notFound();
  }

  let studentTrustStage: StudentTrustStage | undefined;

  if (role === 'student') {
    try {
      const trustData = await api.student.getTrustStageData();
      studentTrustStage = computeStudentTrustStage(trustData);
    } catch {
      // If fetch fails (e.g. profile not yet created), default to stage 0
      studentTrustStage = 0;
    }
  }

  return (
    <TRPCReactProvider>
      <DashboardShell role={role} studentTrustStage={studentTrustStage}>
        <Suspense fallback={<DashboardSkeleton />}>{children}</Suspense>
      </DashboardShell>
    </TRPCReactProvider>
  );
}
```

**Step 2: Update DashboardShell to accept and forward `studentTrustStage`**

In `src/components/layout/DashboardShell.tsx`, update the props type:

```typescript
import type { StudentTrustStage } from '@/lib/student-trust-stage';

type DashboardShellProps = {
  role: DashboardRole;
  children: React.ReactNode;
  className?: string;
  studentTrustStage?: StudentTrustStage;
};
```

Update the function signature and the `<Sidebar>` usage:

```typescript
export function DashboardShell({ role, children, className, studentTrustStage }: DashboardShellProps) {
  // ... existing code ...

  return (
    <div /* ... */>
      <aside className="hidden lg:flex lg:flex-none">
        <Sidebar role={role} currentPath={pathname} studentTrustStage={studentTrustStage} />
      </aside>
      {/* ... rest unchanged ... */}
    </div>
  );
}
```

**Step 3: Update Sidebar to accept `studentTrustStage` and apply it**

In `src/components/layout/Sidebar.tsx`:

Update `SidebarProps`:

```typescript
import type { StudentTrustStage } from '@/lib/student-trust-stage';
import { getStudentQuickAction } from '@/lib/student-trust-stage';

type SidebarProps = {
  role: DashboardRole;
  currentPath: string;
  defaultCollapsed?: boolean;
  forceVisible?: boolean;
  studentTrustStage?: StudentTrustStage;
};
```

Update the `Sidebar` function to use `getNavConfig` with the trust stage option and override the quickAction:

```typescript
export function Sidebar({ role, currentPath, defaultCollapsed = false, forceVisible = false, studentTrustStage }: SidebarProps) {
  const router = useRouter();
  const navConfig = getNavConfig(role, { studentTrustStage });

  // Override quickAction for student based on trust stage
  const quickAction =
    role === 'student' && studentTrustStage !== undefined
      ? getStudentQuickAction(studentTrustStage)
      : navConfig.quickAction;

  // ... rest of existing code ...
}
```

Then in the Sidebar JSX, replace `navConfig.quickAction.label`, `navConfig.quickAction.icon`, `navConfig.quickAction.href` with `quickAction.label`, `quickAction.icon`, `quickAction.href`.

**Step 4: TypeCheck**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no new errors.

**Step 5: Run layout check**

```bash
npm run layout-check 2>&1 | tail -10
```

Expected: PASS (no new violations).

**Step 6: Commit**

```bash
git add src/app/dashboard/[role]/layout.tsx src/components/layout/DashboardShell.tsx src/components/layout/Sidebar.tsx
git commit -m "feat(nav): thread student trust stage to sidebar — progressive disclosure + smart QuickAction"
```

---

## Task 6: Fix onboarding page — Select components + PageHeader + celebration

**Files:**
- Modify: `src/app/dashboard/[role]/onboarding/onboarding-page-client.tsx`

**Step 1: Add Select import**

Add to the imports at the top:

```typescript
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/layout/page-header';
```

Also confirm `onboardingCopy.steps.action.nextStepCta` and `overviewCta` exist (added in Task 1).

**Step 2: Add PageHeader inside the return, above `<OnboardingHero>`**

```tsx
<PageHeader
  title={onboardingCopy.title}
  description={onboardingCopy.subtitle}
  breadcrumbs={[
    { label: 'Overview', href: '/dashboard/student' },
    { label: 'Application Setup' },
  ]}
/>
```

Check what keys exist: `grep -n "title\|subtitle" src/config/copy/student-onboarding.copy.ts | head -10`

Use the correct key or add `title`/`subtitle` to the copy if missing.

**Step 3: Replace school `<select>` with shadcn Select**

Replace:

```tsx
<select
  id="schoolId"
  className="h-11 min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground dark:text-foreground"
  {...schoolProgramForm.register('schoolId', {
    onChange: () => schoolProgramForm.setValue('programId', '', { shouldValidate: true }),
  })}
>
  <option value="">{onboardingCopy.steps.schoolProgram.schoolPlaceholder}</option>
  {onboardingData.schools.map((school) => (
    <option key={school.id} value={school.id}>
      {school.name}
    </option>
  ))}
</select>
```

With:

```tsx
<Select
  value={schoolProgramForm.watch('schoolId')}
  onValueChange={(value) => {
    schoolProgramForm.setValue('schoolId', value, { shouldValidate: true });
    schoolProgramForm.setValue('programId', '', { shouldValidate: true });
  }}
>
  <SelectTrigger id="schoolId" className="h-11">
    <SelectValue placeholder={onboardingCopy.steps.schoolProgram.schoolPlaceholder} />
  </SelectTrigger>
  <SelectContent>
    {onboardingData.schools.map((school) => (
      <SelectItem key={school.id} value={school.id}>
        {school.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

**Step 4: Replace program `<select>` with shadcn Select**

```tsx
<Select
  value={schoolProgramForm.watch('programId')}
  onValueChange={(value) => {
    schoolProgramForm.setValue('programId', value, { shouldValidate: true });
  }}
  disabled={!selectedSchool || selectedSchool.programs.length === 0}
>
  <SelectTrigger id="programId" className="h-11">
    <SelectValue placeholder={onboardingCopy.steps.schoolProgram.programPlaceholder} />
  </SelectTrigger>
  <SelectContent>
    {(selectedSchool?.programs ?? []).map((program) => (
      <SelectItem key={program.id} value={program.id}>
        {program.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

**Step 5: Add celebration state to step 4**

In the `currentStep >= 4` block, after the summary dl, replace the `onboardingData.onboardingComplete` button section:

```tsx
{onboardingData.onboardingComplete ? (
  <div className="flex flex-col items-start gap-4">
    <div className="flex items-center gap-2 text-primary">
      <CheckCircle className="size-7 shrink-0" weight="duotone" aria-hidden="true" />
      <p className="text-base font-semibold text-foreground">
        {onboardingCopy.steps.action.successTitle}
      </p>
    </div>
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button asChild className="min-h-11 w-full sm:w-auto">
        <Link href="/dashboard/student/verify">
          {onboardingCopy.steps.action.nextStepCta}
        </Link>
      </Button>
      <Button asChild variant="outline" className="min-h-11 w-full sm:w-auto">
        <Link href="/dashboard/student">
          {onboardingCopy.steps.action.overviewCta}
        </Link>
      </Button>
    </div>
  </div>
) : (
  // existing back + complete buttons (unchanged)
)}
```

**Step 6: TypeCheck**

```bash
npx tsc --noEmit 2>&1 | grep "onboarding"
```

Expected: no errors.

**Step 7: Commit**

```bash
git add src/app/dashboard/[role]/onboarding/onboarding-page-client.tsx
git commit -m "feat(student/onboarding): shadcn Select, PageHeader breadcrumbs, celebration CTA"
```

---

## Task 7: Fix verify page — Select + hardcoded copy + Mono CTA

**Files:**
- Modify: `src/app/dashboard/[role]/verify/verify-page-client.tsx`

**Step 1: Add Select import**

```typescript
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
```

**Step 2: Replace tier `<select>` with shadcn Select**

Replace:

```tsx
<select id="verify-tier" value={tier} onChange={...} className="...">
  <option value="2">Tier 2</option>
  <option value="3">Tier 3</option>
</select>
```

With:

```tsx
<Select value={String(tier)} onValueChange={(v) => setTier(v === '3' ? 3 : 2)}>
  <SelectTrigger id="verify-tier" className="h-10">
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="2">{copy.kycSection.dojahForm.tierOptions.tier2}</SelectItem>
    <SelectItem value="3">{copy.kycSection.dojahForm.tierOptions.tier3}</SelectItem>
  </SelectContent>
</Select>
```

**Step 3: Replace identity type `<select>` with shadcn Select**

Replace the identity type `<select>` with:

```tsx
<Select value={identityType} onValueChange={(v) => setIdentityType(v as IdentityType)}>
  <SelectTrigger id="identity-type" className="h-10">
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="bvn">{copy.kycSection.identityTypes.bvn}</SelectItem>
    <SelectItem value="nin">{copy.kycSection.identityTypes.nin}</SelectItem>
    <SelectItem value="passport">{copy.kycSection.identityTypes.passport}</SelectItem>
  </SelectContent>
</Select>
```

**Step 4: Replace hardcoded "or" divider**

```tsx
<span className="bg-card px-3 text-xs text-muted-foreground">{copy.bankSection.orDivider}</span>
```

**Step 5: Replace hardcoded "Upload a bank statement instead"**

```tsx
<Button asChild variant="outline" className="min-h-11 w-full">
  <Link href="/dashboard/student/documents">
    <FileText className="mr-2 size-4" weight="duotone" aria-hidden="true" />
    {copy.bankSection.uploadAlternativeCta}
  </Link>
</Button>
```

**Step 6: Replace raw Mono account ID input with a CTA button**

The current Mono form takes a raw account ID — not a real user flow. Replace with a CTA button that will trigger the Mono widget when wired up:

```tsx
{/* Bank connection form */}
<div className="space-y-3">
  <Button
    type="button"
    className="min-h-11 w-full"
    onClick={() => {
      // TODO: launch Mono widget when SDK is integrated
      // For now, fall back to the ID input in dev mode
      if (process.env.NODE_ENV === 'development') {
        setShowMonoDevInput(true);
      }
    }}
    disabled={monoMutation.isPending}
  >
    {copy.bankSection.connectMonoCta}
  </Button>

  {/* Dev-only fallback: raw Mono ID input */}
  {process.env.NODE_ENV === 'development' && showMonoDevInput && (
    <form className="space-y-3" onSubmit={handleMonoSubmit}>
      <Input
        id="mono-account-id"
        value={monoAccountId}
        onChange={(e) => setMonoAccountId(e.target.value)}
        placeholder={copy.bankSection.monoForm.monoAccountIdLabel}
        required
      />
      <Button type="submit" variant="outline" size="sm" disabled={monoMutation.isPending}>
        {copy.bankSection.monoForm.submitCta}
      </Button>
    </form>
  )}
</div>
```

Add `showMonoDevInput` to component state:

```typescript
const [showMonoDevInput, setShowMonoDevInput] = useState(false);
```

**Step 7: TypeCheck**

```bash
npx tsc --noEmit 2>&1 | grep "verify"
```

**Step 8: Commit**

```bash
git add src/app/dashboard/[role]/verify/verify-page-client.tsx
git commit -m "feat(student/verify): shadcn Select, fix hardcoded copy, Mono CTA button"
```

---

## Task 8: Fix proof page — PageHeader + premium certificate layout

**Files:**
- Modify: `src/app/dashboard/[role]/proof/proof-page-client.tsx`

**Step 1: Read the full file first**

```bash
cat -n src/app/dashboard/[role]/proof/proof-page-client.tsx
```

**Step 2: Add PageHeader import and breadcrumbs**

Add to imports:

```typescript
import { PageHeader } from '@/components/layout/page-header';
```

Inside the return (after the opening `<PageShell>`), add:

```tsx
<PageHeader
  title={studentCopy.proof.title}
  description={studentCopy.proof.subtitle}
  breadcrumbs={[
    { label: 'Overview', href: '/dashboard/student' },
    { label: 'Proof of Funds' },
  ]}
/>
```

Check what key `studentCopy.proof.title` is — run:

```bash
grep -n "proof:" src/config/copy/student.ts | head -5
```

**Step 3: Upgrade the certificate card (issued state)**

Find where `ProofCertificateCard` is rendered when `certificate.issued === true`. In that card, ensure:
- The card has `ring-1 ring-primary/20 shadow-lg` for a distinguished border
- The certificate title uses `font-serif` (IBM Plex Serif): `className="font-serif text-2xl ..."`
- Share CTA is a full-width primary Button as the first action

Check `src/components/student/ProofCertificateCard.tsx` to see its current implementation, then modify accordingly.

**Step 4: TypeCheck**

```bash
npx tsc --noEmit 2>&1 | grep "proof"
```

**Step 5: Commit**

```bash
git add src/app/dashboard/[role]/proof/proof-page-client.tsx src/components/student/ProofCertificateCard.tsx
git commit -m "feat(student/proof): PageHeader breadcrumbs, premium certificate card layout"
```

---

## Task 9: Fix documents page — PageHeader + all-approved banner

**Files:**
- Modify: `src/app/dashboard/[role]/documents/documents-page-client.tsx`

**Step 1: Read the full documents file**

```bash
cat -n src/app/dashboard/[role]/documents/documents-page-client.tsx
```

**Step 2: Add PageHeader import and breadcrumbs**

```typescript
import { PageHeader } from '@/components/layout/page-header';
import Link from 'next/link';
import { CheckCircle } from '@phosphor-icons/react';
```

Add PageHeader inside the return:

```tsx
<PageHeader
  title={studentCopy.documents.title}
  description={studentCopy.documents.subtitle}
  breadcrumbs={[
    { label: 'Overview', href: '/dashboard/student' },
    { label: 'Documents' },
  ]}
/>
```

**Step 3: Add all-approved banner**

Find where the document list is rendered. After the PageHeader and before the document list/upload form, add:

```tsx
{allApproved && documents.length > 0 && (
  <div className="flex items-start gap-3 rounded-xl border border-success/30 bg-success/5 p-4">
    <CheckCircle className="mt-0.5 size-5 shrink-0 text-success" weight="duotone" aria-hidden="true" />
    <div className="flex-1">
      <p className="text-sm font-semibold text-foreground">
        {studentCopy.documents.allApproved.heading}
      </p>
      <p className="mt-0.5 text-sm text-muted-foreground">
        {studentCopy.documents.allApproved.body}
      </p>
      <Button asChild variant="link" className="mt-1 h-auto p-0 text-sm text-primary">
        <Link href="/dashboard/student/proof">
          {studentCopy.documents.allApproved.cta}
        </Link>
      </Button>
    </div>
  </div>
)}
```

Compute `allApproved` from the documents query result:

```typescript
const allApproved = documentsQuery.data?.every((d) => d.status === 'approved') ?? false;
```

Read the actual query output shape first:

```bash
grep -n "status\|approved\|documentsQuery\|useQuery" src/app/dashboard/[role]/documents/documents-page-client.tsx | head -20
```

Adjust field access to match actual data shape.

**Step 4: TypeCheck**

```bash
npx tsc --noEmit 2>&1 | grep "documents"
```

**Step 5: Commit**

```bash
git add src/app/dashboard/[role]/documents/documents-page-client.tsx
git commit -m "feat(student/documents): PageHeader breadcrumbs, all-approved banner with proof CTA"
```

---

## Task 10: Final check and layout audit

**Step 1: Run full check**

```bash
npm run check 2>&1 | tail -30
```

Expected: PASS (lint + typecheck + tests + layout-check all green).

**Step 2: Run layout audit**

```bash
npm run layout-check 2>&1
```

Expected: no new violations.

**Step 3: Run all unit tests**

```bash
npx vitest run tests/unit/ 2>&1
```

Expected: all tests PASS including the new trust stage + nav config tests.

**Step 4: Fix any remaining issues**

If `npm run check` has errors, fix them. Do not skip or suppress. Diagnose root cause.

**Step 5: Commit any remaining fixes**

```bash
git add <changed files>
git commit -m "fix(student-ui): address check failures from full premium upgrade"
```

---

## Completion Checklist

- [ ] All 4 pages have PageHeader breadcrumbs (`Overview > X`)
- [ ] No raw `<select>` elements in onboarding or verify pages
- [ ] No hardcoded copy strings in student journey pages
- [ ] Onboarding success state shows "Begin your verification" → `/verify`
- [ ] Documents all-approved banner shows "View your proof status" → `/proof`
- [ ] Student nav: Verify + Documents disabled at stage 0, Proof disabled at stage < 2
- [ ] QuickAction href is context-aware by trust stage
- [ ] `npm run check` passes (all checks green)
- [ ] All unit tests pass
