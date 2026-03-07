# Platform Completion — Master Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Close all 300 missing/incomplete user flows across all 6 roles (student, sponsor, university, admin, agent, partner).

**Architecture:** 12 work packages executed in dependency order. Backend-first per package (tRPC procedures → Drizzle queries → UI components → page wiring → copy config). Tests use typed fixtures in `tests/fixtures/`, never mocks.

**Tech Stack:** Next.js 16, React 19, tRPC v11, Drizzle ORM, Tailwind 4, shadcn/ui new-york, Supabase auth/storage, Vitest, Phosphor Duotone icons.

**Key conventions:**
- Dashboard pages: `PageShell / Section / Grid / Stack / PageHeader` — no raw divs with mx-auto
- All copy: `src/config/copy/` — never hardcoded in JSX
- No `any`, no `@ts-ignore`, no mocks
- Commit format: `type(scope): message` — no Co-Authored-By lines
- Icons: Phosphor Duotone only, `weight="duotone"`, nav=24px inline=20px small=16px
- No emojis anywhere
- Max 400 lines per file — split if larger

---

## Work Package 1 — Sponsor Loop Completion

**Why first:** Sponsor can commit but never un-commit. Student overview shows no invite card. Core broken loop affecting most students.

**Existing:** `StudentSponsorInviteCard` component exists but is NOT wired into overview. `listSponsorInvites` + `cancelSponsorInvite` exist in `student-invites.procedures.ts`. `respondToInvite` exists in `sponsor.ts`.

**Missing:** `withdrawCommitment` in sponsor.ts, `resendSponsorInvite` in student-invites.procedures.ts, sponsor committed/withdrawn state cards on overview, invite pending card on overview.

---

### Task 1: Add `resendSponsorInvite` procedure

**Files:**
- Modify: `src/server/routers/student-invites.procedures.ts`

**Step 1: Write the failing test**

```ts
// tests/unit/student-invites.test.ts
import { describe, it, expect } from 'vitest';
import { sponsorInviteFixture } from '../fixtures/sponsor-invites';

describe('resendSponsorInvite', () => {
  it('returns the invite id when invite is pending', () => {
    const invite = sponsorInviteFixture({ status: 'pending' });
    expect(invite.status).toBe('pending');
    expect(invite.id).toBeTruthy();
  });
});
```

**Step 2: Run test**
```bash
npm run test -- tests/unit/student-invites.test.ts
```

**Step 3: Create fixture**

```ts
// tests/fixtures/sponsor-invites.ts
export function sponsorInviteFixture(overrides: Partial<{
  id: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  inviteeEmail: string;
  studentId: string;
}> = {}) {
  return {
    id: overrides.id ?? 'invite-test-001',
    status: overrides.status ?? 'pending',
    inviteeEmail: overrides.inviteeEmail ?? 'sponsor@example.com',
    studentId: overrides.studentId ?? 'student-test-001',
    createdAt: new Date('2026-03-01'),
    updatedAt: new Date('2026-03-01'),
  };
}
```

**Step 4: Add procedure to `student-invites.procedures.ts`**

Find the `cancelSponsorInvite` procedure and add after it:

```ts
resendSponsorInvite: roleProcedure('student')
  .input(z.object({ inviteId: z.string().uuid() }))
  .output(z.object({ inviteId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const invite = await ctx.db.query.sponsorInvitations.findFirst({
      where: (t, { and, eq: eqFn }) =>
        and(eqFn(t.id, input.inviteId), eqFn(t.studentId, ctx.user.id)),
    });
    if (!invite) throw new TRPCError({ code: 'NOT_FOUND', message: 'Invitation not found.' });
    if (invite.status !== 'pending') {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Only pending invitations can be resent.',
      });
    }
    await sendSponsorInviteEmail({
      toEmail: invite.inviteeEmail,
      studentId: ctx.user.id,
      inviteId: invite.id,
    });
    return { inviteId: invite.id };
  }),
```

**Step 5: Run tests**
```bash
npm run test -- tests/unit/student-invites.test.ts
npm run typecheck
```

**Step 6: Commit**
```bash
git add src/server/routers/student-invites.procedures.ts tests/fixtures/sponsor-invites.ts tests/unit/student-invites.test.ts
git commit -m "feat(student): add resendSponsorInvite tRPC procedure"
```

---

### Task 2: Add `withdrawCommitment` to sponsor router

**Files:**
- Modify: `src/server/routers/sponsor.ts`
- Modify: `src/db/schema/sponsorships.ts` (check for `withdrawn` status value)

**Step 1: Check sponsorship schema for status enum**

Read `src/db/schema/sponsorships.ts` — find the status column. If it lacks `'withdrawn'`, add it:

```ts
// In sponsorships table definition, status column:
status: text('status')
  .$type<'pending' | 'active' | 'withdrawn' | 'fulfilled'>()
  .notNull()
  .default('pending'),
```

If adding to enum: run `npm run db:generate` to create migration.

**Step 2: Add procedure to `sponsor.ts`** (after `listCommitments`):

```ts
withdrawCommitment: roleProcedure('sponsor')
  .input(z.object({ sponsorshipId: z.string().uuid() }))
  .output(z.void())
  .mutation(async ({ ctx, input }) => {
    const sponsorship = await ctx.db.query.sponsorships.findFirst({
      where: (t, { and, eq: eqFn }) =>
        and(eqFn(t.id, input.sponsorshipId), eqFn(t.sponsorId, ctx.user.id)),
      with: { student: { columns: { id: true, email: true } } },
    });
    if (!sponsorship) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Commitment not found.' });
    }
    if (sponsorship.status === 'fulfilled') {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Commitments cannot be withdrawn after a certificate has been issued.',
      });
    }
    if (sponsorship.status === 'withdrawn') {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Already withdrawn.' });
    }
    await ctx.db
      .update(sponsorships)
      .set({ status: 'withdrawn', updatedAt: new Date() })
      .where(eq(sponsorships.id, input.sponsorshipId));

    // Notify student via email + in-app notification
    if (sponsorship.student?.email) {
      await sendSponsorshipStatusEmail({
        toEmail: sponsorship.student.email,
        studentId: sponsorship.studentId,
        status: 'withdrawn',
        sponsorName: null, // look up from profile if needed
      });
    }
    await createNotification(ctx.db, {
      userId: sponsorship.studentId,
      type: 'sponsor',
      title: 'Sponsor commitment withdrawn',
      body: 'A sponsor has withdrawn their commitment. Update your funding type.',
    });
  }),
```

**Step 3: Run typecheck**
```bash
npm run typecheck
```

**Step 4: Commit**
```bash
git add src/server/routers/sponsor.ts src/db/schema/sponsorships.ts
git commit -m "feat(sponsor): add withdrawCommitment procedure with student notification"
```

---

### Task 3: Wire `StudentSponsorInviteCard` into student overview

**Files:**
- Read: `src/app/dashboard/[role]/_components/student-overview.tsx`
- Modify: `src/app/dashboard/[role]/_components/student-overview.tsx`
- Read: `src/components/student/StudentSponsorInviteCard.tsx` (already exists)

**Step 1: Read current overview** to find where to insert the card (after journey tracker, before stats or in a dedicated section).

**Step 2: Add the card** — only shown when `fundingType !== 'self'` and `sponsorInvites.length === 0` (no committed sponsor yet):

```tsx
// In student-overview.tsx, import at top:
import { StudentSponsorInviteCard } from '@/components/student/StudentSponsorInviteCard';

// In JSX, add a Section for sponsor parallel flow:
{data.fundingType === 'sponsor' && (
  <Section>
    <StudentSponsorInviteCard />
  </Section>
)}
```

**Step 3: Commit**
```bash
git add src/app/dashboard/[role]/_components/student-overview.tsx
git commit -m "feat(student): wire sponsor invite card into overview"
```

---

### Task 4: Sponsor committed state card on student overview

**Files:**
- Create: `src/components/student/SponsorCommittedCard.tsx`
- Create: `src/components/student/SponsorWithdrawnCard.tsx`
- Modify: `src/app/dashboard/[role]/_components/student-overview.tsx`
- Modify: `src/config/copy/student.ts`

**Step 1: Add copy keys** to `src/config/copy/student.ts` in the `sponsorInvite` section:

```ts
sponsorCommitted: {
  title: 'Sponsor committed',
  amountLabel: 'Committed amount',
  typeLabel: 'Funding type',
},
sponsorWithdrawn: {
  title: 'Sponsor withdrew commitment',
  desc: 'has withdrawn their commitment. Update your funding type to continue.',
  cta: 'Update funding type',
},
```

**Step 2: Create `SponsorCommittedCard.tsx`**

```tsx
// src/components/student/SponsorCommittedCard.tsx
import { CheckCircle } from '@phosphor-icons/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { studentCopy } from '@/config/copy/student';
import { formatCurrency } from '@/lib/utils';

type Props = {
  sponsorName: string;
  amountKobo: number;
  currency: string;
  fundingTypeLabel: string;
};

export function SponsorCommittedCard({ sponsorName, amountKobo, currency, fundingTypeLabel }: Props) {
  const copy = studentCopy.sponsorCommitted;
  return (
    <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/30">
      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        <CheckCircle weight="duotone" className="size-5 text-green-600 dark:text-green-400" aria-hidden="true" />
        <CardTitle className="text-base">{sponsorName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-sm text-muted-foreground">
        <p>
          <span className="font-medium text-foreground font-mono">
            {formatCurrency(amountKobo, currency)}
          </span>{' '}
          {copy.amountLabel.toLowerCase()}
        </p>
        <p>{fundingTypeLabel}</p>
      </CardContent>
    </Card>
  );
}
```

**Step 3: Create `SponsorWithdrawnCard.tsx`**

```tsx
// src/components/student/SponsorWithdrawnCard.tsx
import Link from 'next/link';
import { Warning } from '@phosphor-icons/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { studentCopy } from '@/config/copy/student';
import { routes } from '@/config/routes';

type Props = { sponsorName: string };

export function SponsorWithdrawnCard({ sponsorName }: Props) {
  const copy = studentCopy.sponsorWithdrawn;
  return (
    <Card className="border-destructive/40 bg-destructive/5">
      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        <Warning weight="duotone" className="size-5 text-destructive" aria-hidden="true" />
        <CardTitle className="text-base text-destructive">{copy.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {sponsorName} {copy.desc}
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href={routes.dashboard.student.setup}>{copy.cta}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
```

**Step 4: Wire both cards into overview** — check `data.sponsorships` for committed/withdrawn sponsors:

```tsx
// After sponsor invite card section:
{data.committedSponsors?.map((s) => (
  <SponsorCommittedCard
    key={s.id}
    sponsorName={s.sponsorName}
    amountKobo={s.amountKobo}
    currency={s.currency}
    fundingTypeLabel={s.fundingTypeLabel}
  />
))}
{data.withdrawnSponsors?.map((s) => (
  <SponsorWithdrawnCard key={s.id} sponsorName={s.sponsorName} />
))}
```

**Step 5: Extend `getStudentOverview` tRPC output** to include `committedSponsors` and `withdrawnSponsors` arrays.

**Step 6: Commit**
```bash
git add src/components/student/SponsorCommittedCard.tsx src/components/student/SponsorWithdrawnCard.tsx src/app/dashboard/[role]/_components/student-overview.tsx src/config/copy/student.ts
git commit -m "feat(student): sponsor committed and withdrawn state cards on overview"
```

---

## Work Package 2 — Student Anxiety Peak States

**Why second:** These are the states 60-70% of real students will hit. If these are wrong, trust breaks on first use.

**Key principle from CLAUDE.md:** Error/failure states — matter-of-fact + precise. Pattern: `[What failed] · [Why] · [What to do]`. Never apologetic. Admin rejection notes shown **verbatim** — no paraphrasing.

---

### Task 5: T2 failure card with precise reason in VerificationTierCard

**Files:**
- Read: `src/components/student/VerificationTierCard.tsx`
- Modify: `src/components/student/VerificationTierCard.tsx`
- Modify: `src/config/copy/student.ts` (or `src/config/copy/student-verification.copy.ts`)
- Modify: `src/server/routers/student-verification.procedures.ts` — ensure `kycFailureReason` is in output

**Step 1: Check what `kycFailureReason` the server currently exposes** in `getVerificationStatus`. Add it if missing:

```ts
// In getVerificationStatus output schema:
kycFailureReason: z.string().nullable(),
kycFailedAttempts: z.number(),
```

**Step 2: Add copy for T2 failure reasons** to copy config:

```ts
// src/config/copy/student-verification.copy.ts
t2Failure: {
  title: 'Identity check failed',
  reasons: {
    name_mismatch: 'Name on your ID does not match your signup name',
    nin_not_found: 'NIN could not be found in the database',
    bvn_not_found: 'BVN could not be found in the database',
    id_expired: 'Your ID document has expired',
    image_unclear: 'We could not read your ID document. Please upload a clear image.',
    attempts_exhausted: 'Maximum attempts reached. Contact support to continue.',
    default: 'Your identity could not be verified',
  },
  action: 'Correct and resubmit',
  attemptsLeft: (n: number) => `${n} attempt${n === 1 ? '' : 's'} remaining`,
},
t2ManualReview: {
  title: 'Identity under manual review',
  desc: 'Your submission has been received and is under review. You will be notified when complete.',
},
```

**Step 3: Update `VerificationTierCard`** — add failure and manual_review states:

```tsx
// In the T2 tier section, when status === 'failed':
{tier.status === 'failed' && (
  <div className="mt-3 rounded-md border border-destructive/40 bg-destructive/5 p-4">
    <p className="text-sm font-medium text-destructive">
      {copy.t2Failure.title} · {getFailureReason(tier.failureReason)} · {copy.t2Failure.action}
    </p>
    {tier.attemptsLeft > 0 && (
      <p className="mt-1 text-xs text-muted-foreground">
        {copy.t2Failure.attemptsLeft(tier.attemptsLeft)}
      </p>
    )}
    <Button size="sm" className="mt-3" onClick={onRetryKyc}>
      Resubmit identity
    </Button>
  </div>
)}

// When status === 'manual_review':
{tier.status === 'manual_review' && (
  <div className="mt-3 rounded-md border border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/30 p-4">
    <p className="text-sm text-amber-800 dark:text-amber-300">
      {copy.t2ManualReview.title}
    </p>
    <p className="mt-1 text-xs text-muted-foreground">{copy.t2ManualReview.desc}</p>
  </div>
)}
```

**Step 4: Run typecheck**
```bash
npm run typecheck
```

**Step 5: Commit**
```bash
git add src/components/student/VerificationTierCard.tsx src/config/copy/student-verification.copy.ts
git commit -m "feat(student): T2 failure card with precise reason and manual_review limbo state"
```

---

### Task 6: T3 bank statement rejection card with admin note verbatim

**Files:**
- Read: `src/components/student/BankVerificationSection.tsx`
- Modify: `src/components/student/BankVerificationSection.tsx`
- Modify: `src/config/copy/student.ts`

**Admin note shown verbatim** — exactly as typed. No paraphrasing. The student is an adult.

**Step 1: Extend BankVerificationSection** to handle `status === 'rejected'` with `rejectionNote`:

```tsx
// New status prop union:
type BankVerificationStatus =
  | 'not_verified'
  | 'pending_review'
  | 'verified'
  | 'rejected';

// Rejection card when status === 'rejected':
{status === 'rejected' && rejectionNote && (
  <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 space-y-3">
    <p className="text-sm font-medium text-destructive">
      Bank statement rejected · {rejectionNote}
    </p>
    <Button size="sm" variant="destructive" onClick={onResubmit}>
      Upload a new statement
    </Button>
  </div>
)}
```

**Step 2: Add copy keys** for rejection state.

**Step 3: Commit**
```bash
git add src/components/student/BankVerificationSection.tsx src/config/copy/student.ts
git commit -m "feat(student): T3 bank statement rejection card with admin note verbatim"
```

---

### Task 7: Document rejection card with admin note verbatim

**Files:**
- Read: `src/components/student/documents/student-document-list.tsx`
- Modify: `src/components/student/documents/student-document-list.tsx`

**Step 1: Ensure `rejectionReason` is in document row type.**

**Step 2: When `doc.status === 'rejected'`, render a rejection card below the doc row:**

```tsx
{doc.status === 'rejected' && (
  <div className="mt-2 rounded border border-destructive/40 bg-destructive/5 p-3 text-sm">
    <p className="font-medium text-destructive">Document rejected · {doc.rejectionReason}</p>
    <button
      className="mt-2 text-xs font-medium text-primary underline-offset-2 hover:underline"
      onClick={() => onResubmit(doc)}
    >
      Upload a replacement
    </button>
  </div>
)}
{doc.status === 'more_info_needed' && doc.adminNote && (
  <div className="mt-2 rounded border border-amber-200 bg-amber-50/50 p-3 text-sm dark:border-amber-800 dark:bg-amber-950/30">
    <p className="text-amber-800 dark:text-amber-300">{doc.adminNote}</p>
    <button
      className="mt-2 text-xs font-medium text-primary underline-offset-2 hover:underline"
      onClick={() => onResubmit(doc)}
    >
      Resubmit with the requested information
    </button>
  </div>
)}
```

**Step 3: Commit**
```bash
git commit -m "feat(student): document rejection card with admin note verbatim"
```

---

### Task 8: Under final review state on proof page

**Files:**
- Read: `src/app/dashboard/[role]/proof/proof-page-client.tsx`
- Modify: `src/app/dashboard/[role]/proof/proof-page-client.tsx`
- Modify: `src/config/copy/student.ts`

**Key design from CLAUDE.md:** No spinner, no ETA, no "Almost there!". Copy: "Under final review — your proof of funds package is complete. We are preparing your certificate." Journey tracker all green. No action.

**Step 1: Add copy key:**
```ts
// src/config/copy/student.ts, proof section:
underFinalReview: {
  heading: 'Under final review',
  desc: 'Your proof of funds package is complete. We are preparing your certificate.',
},
```

**Step 2: Add state detection** — `checklist.completedCount === checklist.totalCount && !certificate.issued`:

```tsx
const isUnderFinalReview =
  data.checklist.completedCount === data.checklist.totalCount &&
  !data.certificate.issued &&
  data.certificate.paymentStatus === 'paid';

// Render under-final-review state:
{isUnderFinalReview && (
  <Section>
    <div className="rounded-lg border border-border bg-card p-6 text-center space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {copy.underFinalReview.heading}
      </p>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
        {copy.underFinalReview.desc}
      </p>
    </div>
  </Section>
)}
```

**Step 3: Commit**
```bash
git commit -m "feat(student): under final review state on proof page — no spinner, no ETA"
```

---

### Task 9: Post-cert overview transformation

**Files:**
- Read: `src/app/dashboard/[role]/_components/student-overview.tsx`
- Modify: `src/app/dashboard/[role]/_components/student-overview.tsx`
- Modify: `src/config/copy/student.ts`

**Design:** H1 → "Your proof of funds is verified." Cert card elevated to top. Progress bar removed.

**Step 1: Add copy key:**
```ts
postCert: {
  heading: 'Your proof of funds is verified.',
},
```

**Step 2: Pass `certIssued: boolean` to overview component.**

**Step 3: Conditional H1 and layout:**
```tsx
<PageHeader
  eyebrow={copy.overview.eyebrow}
  title={certIssued ? copy.postCert.heading : greeting}
/>

{certIssued ? (
  <Section>
    {/* Cert card first */}
    <CertIssuedCard cert={data.certificate} />
    {/* Stats below — no progress tracker */}
    <Grid cols={3}>{statsCards}</Grid>
  </Section>
) : (
  <Section>
    <OnboardingProgressTracker ... />
    <Grid cols={3}>{statsCards}</Grid>
  </Section>
)}
```

**Step 4: Commit**
```bash
git commit -m "feat(student): post-cert overview — H1 change, cert card elevated, progress bar removed"
```

---

## Work Package 3 — Blocked State Card Pattern

**Why:** Used on 4+ nav items. Currently a dead click — student goes nowhere. This is disorienting.

**Design from CLAUDE.md:** All nav items always clickable. If prerequisite not met, page shows "blocked state card" with CTA to blocking step.

---

### Task 10: `BlockedStatePage` component

**Files:**
- Create: `src/components/ui/blocked-state-page.tsx`
- Modify: `src/config/copy/student.ts`

**Step 1: Write test**
```ts
// tests/unit/blocked-state-page.test.ts
import { describe, it, expect } from 'vitest';

describe('blocked state copy', () => {
  it('formats blocked copy correctly', () => {
    const copy = {
      title: 'Verification locked',
      reason: 'Complete your phone verification first',
      ctaLabel: 'Go to Verification',
    };
    expect(copy.title).toBeTruthy();
    expect(copy.reason).toBeTruthy();
  });
});
```

**Step 2: Create component:**

```tsx
// src/components/ui/blocked-state-page.tsx
import Link from 'next/link';
import { LockSimple } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { PageShell, Section } from '@/components/layout/content-primitives';
import { PageHeader } from '@/components/layout/page-header';

type BlockedStatePageProps = {
  pageTitle: string;
  eyebrow?: string;
  blockedTitle: string;
  blockedReason: string;
  ctaLabel: string;
  ctaHref: string;
};

export function BlockedStatePage({
  pageTitle,
  eyebrow,
  blockedTitle,
  blockedReason,
  ctaLabel,
  ctaHref,
}: BlockedStatePageProps) {
  return (
    <PageShell>
      <Section>
        <PageHeader eyebrow={eyebrow} title={pageTitle} />
      </Section>
      <Section>
        <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-card p-8 text-center max-w-md mx-auto">
          <LockSimple weight="duotone" className="size-8 text-muted-foreground" aria-hidden="true" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">{blockedTitle}</p>
            <p className="text-sm text-muted-foreground">{blockedReason}</p>
          </div>
          <Button asChild size="sm">
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
        </div>
      </Section>
    </PageShell>
  );
}
```

**Step 3: Add copy for blocked states:**
```ts
// src/config/copy/student.ts
blocked: {
  verification: {
    pageTitle: 'Verification',
    blockedTitle: 'Verification is locked',
    blockedReason: 'Complete your phone verification first.',
    ctaLabel: 'Go to Onboarding',
    ctaHref: routes.dashboard.student.setup,
  },
  documents: {
    pageTitle: 'Documents',
    blockedTitle: 'Documents are locked',
    blockedReason: 'Complete your identity verification first.',
    ctaLabel: 'Go to Verification',
    ctaHref: routes.dashboard.student.verification,
  },
  proof: {
    pageTitle: 'Proof of Funds',
    blockedTitle: 'Proof of Funds is locked',
    blockedReason: 'Complete verification and upload your documents first.',
    ctaLabel: 'Go to Documents',
    ctaHref: routes.dashboard.student.documents,
  },
},
```

**Step 4: Wire into page clients** — in `verification/page.tsx`, `documents/page.tsx`, `proof/page.tsx`, add a prerequisite check at the top of the Server Component and render `<BlockedStatePage>` if not met.

**Step 5: Commit**
```bash
git add src/components/ui/blocked-state-page.tsx src/config/copy/student.ts
git commit -m "feat(student): BlockedStatePage component and blocked state copy for verification, documents, proof"
```

---

### Task 11: Wire blocked states into page routes

**Files:**
- Read + Modify: `src/app/dashboard/[role]/verification/page.tsx`
- Read + Modify: `src/app/dashboard/[role]/documents/page.tsx`
- Read + Modify: `src/app/dashboard/[role]/proof/page.tsx`

For each page server component: check the prerequisite stage via `computeStudentJourney()`, if blocked render `<BlockedStatePage>` from the copy config.

```tsx
// src/app/dashboard/[role]/verification/page.tsx (Server Component)
const journey = await api.student.getJourneyState();
if (journey.stages.onboarding.status !== 'complete') {
  return (
    <BlockedStatePage
      {...studentCopy.blocked.verification}
    />
  );
}
// ...rest of page
```

**Commit:**
```bash
git commit -m "feat(student): wire blocked state into verification, documents, proof pages"
```

---

## Work Package 4 — First Session + Phone Auto-Trigger

---

### Task 12: First session state on student overview

**Files:**
- Read: `src/app/dashboard/[role]/_components/student-overview.tsx`
- Create: `src/components/student/BeginApplicationCard.tsx`
- Modify: `src/config/copy/student.ts`

**Design:** All journey steps shown as "upcoming". Prominent "Begin your application" card above journey steps. No auto-redirect.

**Step 1: Add copy:**
```ts
firstSession: {
  heading: 'Begin your application',
  desc: 'Set up your school, program, and funding type to start your proof of funds journey.',
  cta: 'Get started',
},
```

**Step 2: Create `BeginApplicationCard.tsx`:**
```tsx
import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { studentCopy } from '@/config/copy/student';
import { routes } from '@/config/routes';

export function BeginApplicationCard() {
  const copy = studentCopy.firstSession;
  return (
    <Card className="border-primary/20 bg-primary/5 dark:border-primary/30">
      <CardHeader>
        <CardTitle>{copy.heading}</CardTitle>
        <CardDescription>{copy.desc}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <Link href={routes.dashboard.student.setup}>
            {copy.cta}
            <ArrowRight weight="duotone" className="ml-2 size-4" aria-hidden="true" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
```

**Step 3: Wire into overview** — show when `data.onboardingComplete === false`:
```tsx
{!data.onboardingComplete && (
  <Section>
    <BeginApplicationCard />
  </Section>
)}
```

**Commit:**
```bash
git add src/components/student/BeginApplicationCard.tsx
git commit -m "feat(student): first session Begin Application card on overview"
```

---

### Task 13: Phone verification auto-trigger on overview

**Files:**
- Read: `src/app/dashboard/[role]/_components/student-overview.tsx`
- Modify: `src/app/dashboard/[role]/_components/student-overview.tsx`

**Step 1: Add `PhoneVerificationSheet` and `KycIdentitySheet` to overview** — same pattern as `verification-page-client.tsx`:

```tsx
'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { PhoneVerificationSheet } from '@/components/student/PhoneVerificationSheet';
import { KycIdentitySheet } from '@/components/student/KycIdentitySheet';

// Inside component:
const searchParams = useSearchParams();
const [phoneOpen, setPhoneOpen] = useState(false);
const [kycOpen, setKycOpen] = useState(false);

// Auto-trigger: open phone sheet on mount if T1 not complete
useEffect(() => {
  if (!data.phoneVerified && data.onboardingComplete) {
    setPhoneOpen(true);
  }
}, [data.phoneVerified, data.onboardingComplete]);

// Open KYC sheet via ?action=verify
useEffect(() => {
  if (searchParams.get('action') === 'verify' && data.phoneVerified) {
    setKycOpen(true);
  }
}, [searchParams, data.phoneVerified]);
```

**Step 2: Render sheets at end of component JSX:**
```tsx
<PhoneVerificationSheet
  open={phoneOpen}
  onOpenChange={setPhoneOpen}
  onSuccess={() => { setPhoneOpen(false); /* invalidate queries */ }}
/>
<KycIdentitySheet
  open={kycOpen}
  onOpenChange={setKycOpen}
/>
```

**Step 3: Commit**
```bash
git commit -m "feat(student): phone verification auto-trigger on overview mount, ?action=verify opens KYC sheet"
```

---

## Work Package 5 — Certificate Sharing Sheet

---

### Task 14: `CertSharingSheet` component

**Files:**
- Create: `src/components/student/CertSharingSheet.tsx`
- Modify: `src/app/dashboard/[role]/proof/proof-page-client.tsx`
- Modify: `src/config/copy/student.ts`

**Design:** 4 share paths in priority order: (1) WhatsApp direct share — primary on mobile, (2) Copy verification URL, (3) Download PDF — primary on desktop, (4) Doculet sends to institution.

**Step 1: Add copy:**
```ts
certSharing: {
  title: 'Share your certificate',
  whatsapp: 'Share via WhatsApp',
  copyLink: 'Copy verification link',
  downloadPdf: 'Download PDF',
  sendEmail: 'Send to institution',
  linkCopied: 'Link copied',
},
```

**Step 2: Create `CertSharingSheet.tsx`:**
```tsx
'use client';
import { useState } from 'react';
import { WhatsappLogo, Link as LinkIcon, FilePdf, Envelope } from '@phosphor-icons/react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { studentCopy } from '@/config/copy/student';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  verificationUrl: string;
  pdfDownloadUrl: string;
  certId: string;
  onTrackShare: (method: 'whatsapp' | 'link' | 'download' | 'email') => void;
};

export function CertSharingSheet({ open, onOpenChange, verificationUrl, pdfDownloadUrl, certId, onTrackShare }: Props) {
  const copy = studentCopy.certSharing;
  const [copied, setCopied] = useState(false);

  const handleWhatsApp = () => {
    onTrackShare('whatsapp');
    const text = encodeURIComponent(`View my Proof of Funds Certificate: ${verificationUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(verificationUrl);
    onTrackShare('link');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    onTrackShare('download');
    window.open(pdfDownloadUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl pb-8">
        <SheetHeader className="mb-6">
          <SheetTitle>{copy.title}</SheetTitle>
        </SheetHeader>
        <div className="space-y-3">
          {/* WhatsApp — primary on mobile */}
          <Button
            className="w-full justify-start gap-3 md:hidden"
            variant="default"
            onClick={handleWhatsApp}
          >
            <WhatsappLogo weight="duotone" className="size-5" aria-hidden="true" />
            {copy.whatsapp}
          </Button>
          {/* Download PDF — primary on desktop */}
          <Button
            className="hidden w-full justify-start gap-3 md:flex"
            variant="default"
            onClick={handleDownload}
          >
            <FilePdf weight="duotone" className="size-5" aria-hidden="true" />
            {copy.downloadPdf}
          </Button>
          {/* Copy link */}
          <Button className="w-full justify-start gap-3" variant="outline" onClick={handleCopyLink}>
            <LinkIcon weight="duotone" className="size-5" aria-hidden="true" />
            {copied ? copy.linkCopied : copy.copyLink}
          </Button>
          {/* WhatsApp on desktop too */}
          <Button className="hidden w-full justify-start gap-3 md:flex" variant="outline" onClick={handleWhatsApp}>
            <WhatsappLogo weight="duotone" className="size-5" aria-hidden="true" />
            {copy.whatsapp}
          </Button>
          {/* Download on mobile */}
          <Button className="w-full justify-start gap-3 md:hidden" variant="outline" onClick={handleDownload}>
            <FilePdf weight="duotone" className="size-5" aria-hidden="true" />
            {copy.downloadPdf}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

**Step 3: Wire into `proof-page-client.tsx`** — replace current scattered share buttons with `<CertSharingSheet>`.

**Commit:**
```bash
git add src/components/student/CertSharingSheet.tsx
git commit -m "feat(student): CertSharingSheet — WhatsApp primary mobile, PDF primary desktop"
```

---

## Work Package 6 — Agent Backend Completion

**Why:** Agents have nav but no data. `listAgentStudents` and `listAgentCommissions` exist in `agent.ts` but no page clients use them. `requestPayout` and `getActivity` are missing entirely.

---

### Task 15: `agent.requestPayout` procedure

**Files:**
- Modify: `src/server/routers/agent.ts`

**Step 1: Write test**
```ts
// tests/unit/agent-payout.test.ts
import { describe, it, expect } from 'vitest';
import { agentCommissionFixture } from '../fixtures/agent-commissions';

describe('agent commission fixture', () => {
  it('has pending status and non-zero amount', () => {
    const c = agentCommissionFixture({ status: 'pending', amountKobo: 5000000 });
    expect(c.status).toBe('pending');
    expect(c.amountKobo).toBeGreaterThan(0);
  });
});
```

**Step 2: Create fixture:**
```ts
// tests/fixtures/agent-commissions.ts
export function agentCommissionFixture(overrides: Partial<{
  id: string;
  agentId: string;
  amountKobo: number;
  status: 'pending' | 'processing' | 'paid' | 'cancelled';
}> = {}) {
  return {
    id: overrides.id ?? 'commission-001',
    agentId: overrides.agentId ?? 'agent-001',
    amountKobo: overrides.amountKobo ?? 5000000,
    currency: 'NGN',
    status: overrides.status ?? 'pending',
    description: 'Commission for cert issuance',
    paidAt: null,
    createdAt: new Date('2026-03-01'),
  };
}
```

**Step 3: Add procedure to `agent.ts`** (after `listAgentCommissions`):

```ts
requestPayout: roleProcedure('agent')
  .output(z.object({ requestedAmountKobo: z.number() }))
  .mutation(async ({ ctx }) => {
    const pendingCommissions = await ctx.db.query.agentCommissions.findMany({
      where: (t, { and, eq: eqFn }) =>
        and(eqFn(t.agentId, ctx.user.id), eqFn(t.status, 'pending')),
    });
    const totalKobo = pendingCommissions.reduce((sum, c) => sum + c.amountKobo, 0);
    if (totalKobo === 0) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'No pending commissions to pay out.' });
    }
    // Mark as processing
    await ctx.db
      .update(agentCommissions)
      .set({ status: 'processing', updatedAt: new Date() })
      .where(
        and(
          eq(agentCommissions.agentId, ctx.user.id),
          eq(agentCommissions.status, 'pending'),
        ),
      );
    return { requestedAmountKobo: totalKobo };
  }),
```

**Commit:**
```bash
git commit -m "feat(agent): requestPayout procedure — marks pending commissions as processing"
```

---

### Task 16: `agent.getActivity` procedure

**Files:**
- Modify: `src/server/routers/agent.ts`

```ts
getActivity: roleProcedure('agent')
  .output(
    z.array(
      z.object({
        eventType: z.enum(['cert_issued', 'doc_approved', 'doc_rejected', 'kyc_complete', 'student_joined']),
        studentId: z.string(),
        studentEmail: z.string().nullable(),
        description: z.string(),
        occurredAt: z.date(),
      }),
    ),
  )
  .query(async ({ ctx }) => {
    const assignments = await ctx.db.query.agentStudentAssignments.findMany({
      where: (t, { eq: eqFn }) => eqFn(t.agentId, ctx.user.id),
      columns: { studentId: true },
    });
    if (assignments.length === 0) return [];

    const studentIds = assignments.map((a) => a.studentId);

    // Pull cert events + document events for assigned students
    const [certs, docs, users] = await Promise.all([
      ctx.db.query.certificates.findMany({
        where: (t, { inArray: inArrayFn }) => inArrayFn(t.studentId, studentIds),
        columns: { studentId: true, issuedAt: true, certificateId: true },
        orderBy: (t, { desc }) => [desc(t.issuedAt)],
        limit: 50,
      }),
      ctx.db.query.documents.findMany({
        where: (t, { and, inArray: inArrayFn, inArray: inAr, ne }) =>
          and(inArrayFn(t.userId, studentIds), ne(t.status, 'pending')),
        columns: { userId: true, status: true, documentType: true, updatedAt: true },
        orderBy: (t, { desc }) => [desc(t.updatedAt)],
        limit: 50,
      }),
      ctx.db.query.users.findMany({
        where: (t, { inArray: inArrayFn }) => inArrayFn(t.id, studentIds),
        columns: { id: true, email: true },
      }),
    ]);

    const emailMap = new Map(users.map((u) => [u.id, u.email]));

    const events: Array<{
      eventType: 'cert_issued' | 'doc_approved' | 'doc_rejected' | 'kyc_complete' | 'student_joined';
      studentId: string;
      studentEmail: string | null;
      description: string;
      occurredAt: Date;
    }> = [];

    for (const cert of certs) {
      events.push({
        eventType: 'cert_issued',
        studentId: cert.studentId,
        studentEmail: emailMap.get(cert.studentId) ?? null,
        description: `Certificate issued: ${cert.certificateId}`,
        occurredAt: cert.issuedAt,
      });
    }

    for (const doc of docs) {
      if (doc.status === 'approved') {
        events.push({
          eventType: 'doc_approved',
          studentId: doc.userId,
          studentEmail: emailMap.get(doc.userId) ?? null,
          description: `${doc.documentType} approved`,
          occurredAt: doc.updatedAt,
        });
      } else if (doc.status === 'rejected') {
        events.push({
          eventType: 'doc_rejected',
          studentId: doc.userId,
          studentEmail: emailMap.get(doc.userId) ?? null,
          description: `${doc.documentType} rejected`,
          occurredAt: doc.updatedAt,
        });
      }
    }

    return events.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime()).slice(0, 50);
  }),
```

**Commit:**
```bash
git commit -m "feat(agent): getActivity procedure — cert and document events for assigned students"
```

---

### Task 17: Wire agent students page client with real data

**Files:**
- Read: `src/app/dashboard/[role]/students/` (agent students page client)
- Modify the page client to use `trpc.agent.listAgentStudents.useQuery()`
- Read: `src/app/dashboard/[role]/activity/activity-page-client.tsx`
- Modify activity page client to use `trpc.agent.getActivity.useQuery()`
- Read: `src/app/dashboard/[role]/commissions/commissions-page-client.tsx`
- Modify to use `trpc.agent.listAgentCommissions.useQuery()` and `trpc.agent.requestPayout.useMutation()`

**Step 1: For each page client, read its current state — it likely has a loading/empty state with no real data.**

**Step 2: Replace placeholder content** with real tRPC queries. Follow the pattern from `documents-page-client.tsx`:
```tsx
const { data, isLoading } = trpc.agent.listAgentStudents.useQuery();
if (isLoading) return <LoadingState />;
if (!data || data.length === 0) return <EmptyState ... />;
```

**Commit:**
```bash
git commit -m "feat(agent): wire students, activity, commissions pages with real tRPC data"
```

---

## Work Package 7 — University Programs Page Wiring

**Backend exists** (`createUniversityProgram`, `updateProgram`, `deactivateProgram`, `exportStudents` in `university-management.ts`). UI needs to be wired.

---

### Task 18: Wire university programs page with real data

**Files:**
- Read: `src/app/dashboard/[role]/programs/` (programs page)
- Modify programs page client to use `trpc.universityManagement.listUniversityPrograms.useQuery()`
- Add create/edit program modal using `trpc.universityManagement.createUniversityProgram.useMutation()`
- Add deactivate using `trpc.universityManagement.deactivateProgram.useMutation()`

**Commit:**
```bash
git commit -m "feat(university): wire programs page with real tRPC data — list, create, edit, deactivate"
```

---

### Task 19: University student roster with cert ID + export

**Files:**
- Read: `src/app/dashboard/[role]/students/` (university students page)
- Modify to use `trpc.university.getVerificationQueue.useQuery()`
- Add cert ID column (extend `getVerificationQueue` output to include `certificateId`)
- Add filter by program dropdown
- Add "Export CSV" button using `trpc.universityManagement.exportStudents.useMutation()`

**Commit:**
```bash
git commit -m "feat(university): student roster with cert ID, program filter, CSV export"
```

---

## Work Package 8 — Notification Bell + Missing Email Templates

---

### Task 20: Bell grouped by type + mark all read

**Files:**
- Read: `src/components/layout/NotificationsBell.tsx`
- Modify to group notifications by type
- Add `trpc.account.markAllNotificationsRead.useMutation()` (add procedure if missing)

**Group order:** Documents → Verification → Sponsor → Certificate

```tsx
const grouped = {
  Certificate: notifications.filter(n => n.type === 'certificate'),
  Verification: notifications.filter(n => n.type === 'verification'),
  Documents: notifications.filter(n => n.type === 'document'),
  Sponsor: notifications.filter(n => n.type === 'sponsor'),
};
```

**Commit:**
```bash
git commit -m "feat(notifications): bell grouped by type, mark all read, dot badge on Proof nav"
```

---

### Task 21: Missing transactional email templates

**Files:**
- Create: `src/lib/email/templates/t2-failure-email.tsx`
- Create: `src/lib/email/templates/t3-rejected-email.tsx`
- Create: `src/lib/email/templates/under-final-review-email.tsx`
- Create corresponding `send-*.ts` files

Each template follows the existing pattern in `src/lib/email/templates/`. Subject line matches journey stage label exactly.

**T2 failure email subject:** "Your identity check requires attention"
**T3 rejected email subject:** "Your bank statement requires resubmission"
**Under final review email subject:** "Your proof of funds package is complete"

**Commit:**
```bash
git commit -m "feat(email): T2 failure, T3 rejected, under-final-review transactional templates"
```

---

## Work Package 9 — Admin Advanced Operations

---

### Task 22: Admin student full record view

**Files:**
- Read: `src/app/dashboard/[role]/operations/operations-page-client.tsx`
- Create: `src/components/admin/StudentRecordDrawer.tsx`
- Modify operations page to open drawer on student row click

**Drawer shows:** KYC status, all documents with status badges, sponsors, cert ID if issued, payment status.

**Commit:**
```bash
git commit -m "feat(admin): student record drawer on operations queue — full KYC, docs, cert view"
```

---

### Task 23: Admin "Request more info" action

**Files:**
- Read: `src/components/admin/AdminOperationsReviewDialog.tsx`
- Modify to add third action button: "Request more info"
- When clicked: text area for note → calls `trpc.admin.reviewDocument.mutate({ action: 'more_info', note })`

**Commit:**
```bash
git commit -m "feat(admin): request more info action on document review — note sent to student"
```

---

### Task 24: Cert-ready indicator on operations queue

**Files:**
- Modify: `src/components/admin/AdminOperationsTable.tsx`
- When student's `allDocsApproved && kycVerified && paymentPaid` — add green "Ready for cert" badge on student row
- Add "Issue certificate" button that calls `trpc.admin.issueCertificate.mutate({ studentId })`

**Commit:**
```bash
git commit -m "feat(admin): cert-ready indicator and issue certificate CTA on operations queue"
```

---

## Work Package 10 — Partner Webhook Configuration

---

### Task 25: Webhook registration procedures

**Files:**
- Create: `src/server/routers/partner-webhooks.procedures.ts`
- Modify: `src/server/root.ts` to add `partnerWebhooks` router
- Modify: `src/db/schema/webhook-deliveries.ts` — ensure `partnerWebhookConfigs` table exists

**Procedures:**
```ts
registerWebhook: roleProcedure('partner')
  .input(z.object({
    url: z.string().url(),
    events: z.array(z.enum(['cert_issued', 'doc_approved', 'doc_rejected', 'kyc_complete'])),
    description: z.string().max(200).optional(),
  }))
  .output(z.object({ id: z.string(), secret: z.string() }))
  // Generates HMAC secret, stores hashed version, returns plaintext secret ONCE

updateWebhook: roleProcedure('partner')
  .input(z.object({ webhookId: z.string().uuid(), url: z.string().url().optional(), enabled: z.boolean().optional() }))
  .output(z.void())

listWebhooks: roleProcedure('partner')
  .output(z.array(/* webhook config without secret */))

deleteWebhook: roleProcedure('partner')
  .input(z.object({ webhookId: z.string().uuid() }))
  .output(z.void())

sendTestDelivery: roleProcedure('partner')
  .input(z.object({ webhookId: z.string().uuid() }))
  .output(z.object({ statusCode: z.number().nullable(), success: z.boolean() }))

listDeliveries: roleProcedure('partner')
  .input(z.object({ webhookId: z.string().uuid() }))
  .output(z.array(/* delivery log rows */))
```

**Commit:**
```bash
git commit -m "feat(partner): webhook registration, delivery log, test delivery procedures"
```

---

### Task 26: Partner webhook UI

**Files:**
- Create: `src/app/dashboard/[role]/webhooks/` (new route)
- Add webhooks to partner nav config
- Create webhook list page client
- Create register webhook form
- Create delivery log table

**Commit:**
```bash
git commit -m "feat(partner): webhooks page — register, list, delivery log, test delivery"
```

---

## Work Package 11 — Settings: Security + Account

---

### Task 27: Active session list in Settings → Security

**Files:**
- Modify: `src/server/routers/account.ts` — add `listActiveSessions` query
- Modify: settings security page client — render session rows

```ts
listActiveSessions: protectedProcedure
  .output(z.array(z.object({
    sessionId: z.string(),
    device: z.string().nullable(),
    lastSeen: z.date(),
    current: z.boolean(),
  })))
  .query(async ({ ctx }) => {
    // Query Supabase auth.sessions for this user
    // ...
  })
```

**Commit:**
```bash
git commit -m "feat(settings): active session list with revoke in Security tab"
```

---

### Task 28: Download my data + Delete account

**Files:**
- Modify: `src/server/routers/account.ts` — add `requestDataExport` and `requestAccountDeletion`
- Modify: settings profile page client — add buttons

```ts
requestDataExport: protectedProcedure
  .output(z.void())
  // Queues export job, sends email when ready

requestAccountDeletion: protectedProcedure
  .input(z.object({ confirmationText: z.literal('DELETE') }))
  .output(z.void())
  // Soft-deletes account, 30-day grace period, sends confirmation email
```

**Commit:**
```bash
git commit -m "feat(settings): download my data and delete account in Profile tab"
```

---

## Work Package 12 — T3 OCR Gate + Mono Edge Cases

---

### Task 29: OCR review as mandatory confirmation gate

**Files:**
- Read: `src/components/student/OcrSummaryCard.tsx`
- Modify to be non-dismissable before confirmation
- Add "Confirm and submit" primary button and "Cancel — upload a different file" secondary

**Design:** Not a dismissable card. Student must explicitly confirm extracted data before submission proceeds. If OCR failed: 4 manual entry fields.

**Commit:**
```bash
git commit -m "feat(student): OCR review as mandatory confirmation gate — confirm before submit"
```

---

### Task 30: T3 Mono failed card with fallback

**Files:**
- Read: `src/components/student/BankVerificationSection.tsx`
- Modify to add `monoFailed` state card

```tsx
{monoFailed && (
  <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 space-y-3">
    <p className="text-sm font-medium text-destructive">
      Bank connection failed · {monoFailReason ?? 'Your bank could not be connected'} · Upload a statement instead
    </p>
    <Button size="sm" variant="outline" onClick={switchToUpload}>
      Upload a bank statement
    </Button>
  </div>
)}
```

**Commit:**
```bash
git commit -m "feat(student): T3 Mono failed card with fallback to upload"
```

---

## Execution Order

Run work packages in this strict order (each depends on the prior being stable):

1. WP1 — Sponsor loop (sponsor withdrawal + invite card on overview)
2. WP2 — Anxiety peak states (T2/T3/docs rejection + under review + post-cert)
3. WP3 — Blocked state card pattern
4. WP4 — First session + phone auto-trigger
5. WP5 — Certificate sharing sheet
6. WP6 — Agent backend completion
7. WP7 — University programs wiring
8. WP8 — Notifications bell + email templates
9. WP9 — Admin advanced operations
10. WP10 — Partner webhooks
11. WP11 — Settings security + account
12. WP12 — T3 OCR gate + Mono edge cases

After each WP: `npm run check` must pass before starting the next.

---

## Testing Baseline

Before starting WP1, run:
```bash
npm run test
npm run typecheck
```

Note any pre-existing failures so they are not attributed to this work.
