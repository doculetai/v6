# V6 Full Product Completion Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete all 6 role dashboards (sponsor, university, admin, agent, partner) so every persona has functional, data-backed pages — ~20 missing pages, ~30 tRPC procedures, 3 new DB tables.

**Architecture:** Server Component pages fetch data via `await api()` caller, pass to Client Component wrappers for interactivity. Role components live in `src/components/[role]/`. Copy in `src/config/copy/[role].ts`. DB schema in `src/db/schema/`. Drizzle ORM for queries, Zod for validation.

**Tech Stack:** Next.js 16 App Router, tRPC v11, Drizzle ORM, Supabase (PostgreSQL), Tailwind CSS 4, shadcn/ui (new-york), Lucide icons, Zod.

**Key files to know:**
- `src/server/trpc.ts` — `roleProcedure(role)` factory, `protectedProcedure`, `createTRPCRouter`
- `src/server/root.ts` — registers all routers
- `src/db/schema/index.ts` — re-exports all schema
- `src/trpc/server.ts` — `api()` server caller
- `src/app/dashboard/[role]/layout.tsx` — wraps all pages in DashboardShell + Suspense
- Pattern: `page.tsx` calls `await api()` → passes data to `*-page-client.tsx`

---

## PHASE 1 — Schema Additions

### Task 1: Add universityProfiles, agentStudentAssignments, agentCommissions tables

**Files:**
- Create: `src/db/schema/university.ts`
- Create: `src/db/schema/agent-assignments.ts`
- Modify: `src/db/schema/index.ts`

**Step 1: Create university schema**

```typescript
// src/db/schema/university.ts
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { schools } from './students';

export const universityProfiles = pgTable('university_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  schoolId: uuid('school_id').references(() => schools.id, { onDelete: 'set null' }),
  organizationName: text('organization_name'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const universityProfilesRelations = relations(universityProfiles, ({ one }) => ({
  user: one(users, { fields: [universityProfiles.userId], references: [users.id] }),
  school: one(schools, { fields: [universityProfiles.schoolId], references: [schools.id] }),
}));
```

**Step 2: Create agent assignments + commissions schema**

```typescript
// src/db/schema/agent-assignments.ts
import { pgEnum, pgTable, integer, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { sponsorships } from './sponsorships';

export const agentCommissionStatusEnum = pgEnum('agent_commission_status', [
  'pending', 'processing', 'paid', 'cancelled',
]);

export const agentStudentAssignments = pgTable('agent_student_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  studentId: uuid('student_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  assignedAt: timestamp('assigned_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => [unique().on(t.agentId, t.studentId)]);

export const agentCommissions = pgTable('agent_commissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sponsorshipId: uuid('sponsorship_id').references(() => sponsorships.id, { onDelete: 'cascade' }),
  amountKobo: integer('amount_kobo').notNull(),
  currency: text('currency').notNull().default('NGN'),
  status: agentCommissionStatusEnum('status').notNull().default('pending'),
  description: text('description'),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const agentStudentAssignmentsRelations = relations(agentStudentAssignments, ({ one }) => ({
  agent: one(users, { fields: [agentStudentAssignments.agentId], references: [users.id] }),
  student: one(users, { fields: [agentStudentAssignments.studentId], references: [users.id] }),
}));

export const agentCommissionsRelations = relations(agentCommissions, ({ one }) => ({
  agent: one(users, { fields: [agentCommissions.agentId], references: [users.id] }),
  sponsorship: one(sponsorships, { fields: [agentCommissions.sponsorshipId], references: [sponsorships.id] }),
}));
```

**Step 3: Update schema index**

Add these exports to `src/db/schema/index.ts`:
```typescript
export * from './university';
export * from './agent-assignments';
```

**Step 4: Push migrations**
```bash
cd /Users/gm/v6
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54402/postgres" npx drizzle-kit push
```
Expected: "All migrations applied."

**Step 5: Seed test data via Supabase REST**

Run a seed script to create:
- `university_profiles` row for sarah.chen's userId → schoolId of "University of Lagos"
- `agent_student_assignments` rows: agent1 → kemi

```bash
# Get IDs first
curl -s "http://127.0.0.1:54401/rest/v1/users?email=eq.sarah.chen@doculet.test&select=id" \
  -H "apikey: $ANON_KEY" | jq '.[0].id'
```

Then insert via REST or directly via psql.

**Step 6: Commit**
```bash
git add src/db/schema/university.ts src/db/schema/agent-assignments.ts src/db/schema/index.ts
git commit -m "feat(db): add universityProfiles, agentStudentAssignments, agentCommissions tables"
```

---

## PHASE 2 — tRPC Procedures

### Task 2: Sponsor router — full procedures

**Files:**
- Modify: `src/server/routers/sponsor.ts`

**Add these procedures** (replace/extend the existing file):

```typescript
// KEEP existing listPendingInvites + respondToInvite
// ADD:

getSponsorOverview: roleProcedure('sponsor')
  .output(z.object({
    totalCommittedKobo: z.number(),
    activeStudents: z.number(),
    pendingInvites: z.number(),
    nextDisbursement: z.date().nullable(),
    recentStudents: z.array(z.object({
      studentId: z.string(),
      studentEmail: z.string().nullable(),
      amountKobo: z.number(),
      status: z.enum(['pending', 'active', 'completed', 'cancelled']),
      createdAt: z.date(),
    })).max(3),
  }))
  .query(async ({ ctx }) => {
    // Query sponsorships where sponsorId = ctx.user.id
    // Query disbursements via sponsorships
    // Query sponsorshipInvites for pending count
  }),

listSponsoredStudents: roleProcedure('sponsor')
  .output(z.array(z.object({
    id: z.string(),
    studentId: z.string(),
    studentEmail: z.string().nullable(),
    amountKobo: z.number(),
    currency: z.string(),
    status: z.enum(['pending', 'active', 'completed', 'cancelled']),
    disbursementCount: z.number(),
    createdAt: z.date(),
  })))
  .query(async ({ ctx }) => { /* query sponsorships + join users for email */ }),

listDisbursements: roleProcedure('sponsor')
  .output(z.array(z.object({
    id: z.string(),
    amountKobo: z.number(),
    currency: z.string(),
    scheduledAt: z.date(),
    disbursedAt: z.date().nullable(),
    status: z.enum(['scheduled', 'processing', 'disbursed', 'failed']),
    studentEmail: z.string().nullable(),
    paystackReference: z.string().nullable(),
  })))
  .query(async ({ ctx }) => { /* join disbursements → sponsorships → users */ }),

getSponsorKycStatus: roleProcedure('sponsor')
  .output(z.object({
    sponsorType: z.enum(['individual', 'corporate', 'self']),
    kycStatus: z.enum(['not_started', 'pending', 'verified', 'failed']),
    companyName: z.string().nullable(),
  }))
  .query(async ({ ctx }) => { /* query sponsorProfiles */ }),

getSponsorSettings: roleProcedure('sponsor')
  .output(z.object({
    sponsorType: z.enum(['individual', 'corporate', 'self']),
    companyName: z.string().nullable(),
    kycStatus: z.enum(['not_started', 'pending', 'verified', 'failed']),
  }))
  .query(async ({ ctx }) => { /* query sponsorProfiles */ }),

updateSponsorProfile: roleProcedure('sponsor')
  .input(z.object({
    sponsorType: z.enum(['individual', 'corporate', 'self']).optional(),
    companyName: z.string().max(120).nullable().optional(),
  }))
  .mutation(async ({ ctx, input }) => { /* upsert sponsorProfiles */ }),
```

### Task 3: University router — full procedures

**Files:**
- Modify: `src/server/routers/university.ts`

**Add these procedures:**

```typescript
// KEEP existing getOverview
// ADD:

getUniversityProfile: roleProcedure('university')
  .output(z.object({
    schoolId: z.string().nullable(),
    schoolName: z.string().nullable(),
    organizationName: z.string().nullable(),
  }))
  .query(async ({ ctx }) => {
    // query universityProfiles JOIN schools
  }),

getVerificationQueue: roleProcedure('university')
  .output(z.array(z.object({
    studentId: z.string(),
    studentEmail: z.string().nullable(),
    programName: z.string().nullable(),
    documentCount: z.number(),
    pendingDocumentCount: z.number(),
    kycStatus: z.enum(['not_started', 'pending', 'verified', 'failed']),
    createdAt: z.date(),
  })))
  .query(async ({ ctx }) => {
    // get universityProfile.schoolId
    // find studentProfiles WHERE schoolId matches
    // join documents count
  }),

listUniversityStudents: roleProcedure('university')
  .output(z.array(z.object({
    studentId: z.string(),
    studentEmail: z.string().nullable(),
    programName: z.string().nullable(),
    kycStatus: z.enum(['not_started', 'pending', 'verified', 'failed']),
    documentCount: z.number(),
    approvedDocumentCount: z.number(),
    enrolledAt: z.date(),
  })))
  .query(async ({ ctx }) => { /* same school filter, all students */ }),

getUniversityDocumentQueue: roleProcedure('university')
  .output(z.array(z.object({
    documentId: z.string(),
    studentId: z.string(),
    studentEmail: z.string().nullable(),
    documentType: z.enum(['passport','bank_statement','offer_letter','affidavit','cac']),
    status: z.enum(['pending','approved','rejected','more_info_requested']),
    createdAt: z.date(),
    storageUrl: z.string(),
  })))
  .query(async ({ ctx }) => {
    // get universityProfile.schoolId
    // find studentIds by schoolId
    // fetch their documents
  }),

updateUniversitySettings: roleProcedure('university')
  .input(z.object({ organizationName: z.string().max(120).optional() }))
  .mutation(async ({ ctx, input }) => { /* upsert universityProfiles */ }),
```

### Task 4: Admin router — analytics + users + risk

**Files:**
- Modify: `src/server/routers/admin.ts`

**Add:**

```typescript
// KEEP existing queue/stats/review procedures
// ADD:

getPlatformAnalytics: roleProcedure('admin')
  .output(z.object({
    totalUsers: z.number(),
    usersByRole: z.record(z.number()),
    totalSponsorships: z.number(),
    totalCommittedKobo: z.number(),
    totalDisbursedKobo: z.number(),
    pendingDocuments: z.number(),
    approvedDocuments: z.number(),
    issuedCertificates: z.number(),
    kycVerifiedStudents: z.number(),
  }))
  .query(async ({ ctx }) => { /* aggregate queries across all tables */ }),

listAllUsers: roleProcedure('admin')
  .input(z.object({
    search: z.string().optional(),
    role: z.enum(['student','sponsor','university','admin','agent','partner']).optional(),
    limit: z.number().int().min(1).max(100).default(50),
    offset: z.number().int().min(0).default(0),
  }))
  .output(z.object({
    users: z.array(z.object({
      id: z.string(),
      email: z.string().nullable(),
      role: z.enum(['student','sponsor','university','admin','agent','partner']).nullable(),
      onboardingComplete: z.boolean(),
      createdAt: z.date(),
    })),
    total: z.number(),
  }))
  .query(async ({ ctx, input }) => { /* query users JOIN profiles with search/filter */ }),

getRiskFlags: roleProcedure('admin')
  .output(z.array(z.object({
    type: z.enum(['repeated_kyc_failure', 'repeated_document_rejection', 'unverified_with_sponsorship']),
    userId: z.string(),
    userEmail: z.string().nullable(),
    severity: z.enum(['low', 'medium', 'high']),
    detail: z.string(),
    detectedAt: z.date(),
  })))
  .query(async ({ ctx }) => {
    // find users with 2+ failed KYC checks
    // find users with 3+ rejected documents
    // find sponsorships.active where student kycStatus != 'verified'
  }),
```

### Task 5: Agent router — overview + students + commissions

**Files:**
- Modify: `src/server/routers/agent.ts`

**Add:**

```typescript
// KEEP existing getSettings/updateProfile/updateNotifications
// ADD:

getAgentOverview: roleProcedure('agent')
  .output(z.object({
    totalAssignedStudents: z.number(),
    activeStudents: z.number(),
    pendingCommissionsKobo: z.number(),
    totalEarnedKobo: z.number(),
  }))
  .query(async ({ ctx }) => {
    // query agentStudentAssignments count
    // query agentCommissions totals
  }),

listAgentStudents: roleProcedure('agent')
  .output(z.array(z.object({
    assignmentId: z.string(),
    studentId: z.string(),
    studentEmail: z.string().nullable(),
    schoolName: z.string().nullable(),
    programName: z.string().nullable(),
    kycStatus: z.enum(['not_started','pending','verified','failed']),
    documentCount: z.number(),
    assignedAt: z.date(),
  })))
  .query(async ({ ctx }) => {
    // agentStudentAssignments WHERE agentId = ctx.user.id
    // join studentProfiles → schools → programs
  }),

listAgentCommissions: roleProcedure('agent')
  .output(z.array(z.object({
    id: z.string(),
    amountKobo: z.number(),
    currency: z.string(),
    status: z.enum(['pending','processing','paid','cancelled']),
    description: z.string().nullable(),
    paidAt: z.date().nullable(),
    createdAt: z.date(),
  })))
  .query(async ({ ctx }) => {
    // agentCommissions WHERE agentId = ctx.user.id
  }),
```

### Task 6: Partner router — overview + analytics + API keys + branding + settings

**Files:**
- Modify: `src/server/routers/partner.ts`

**Add:**

```typescript
// KEEP existing listStudents
// ADD:

getPartnerOverview: roleProcedure('partner')
  .output(z.object({
    totalStudents: z.number(),
    verifiedStudents: z.number(),
    activeApiKeys: z.number(),
    organizationName: z.string(),
  }))
  .query(async ({ ctx }) => { /* aggregate from partnerStudents + partnerApiKeys */ }),

listApiKeys: roleProcedure('partner')
  .output(z.array(z.object({
    id: z.string(),
    keyPrefix: z.string(),
    scopes: z.array(z.string()),
    lastUsedAt: z.date().nullable(),
    revokedAt: z.date().nullable(),
    createdAt: z.date(),
    isActive: z.boolean(),
  })))
  .query(async ({ ctx }) => { /* partnerApiKeys WHERE partnerId = profile.id */ }),

createApiKey: roleProcedure('partner')
  .input(z.object({ scopes: z.array(z.string()).min(1) }))
  .output(z.object({
    id: z.string(),
    keyPrefix: z.string(),
    rawKey: z.string(), // shown once only
    scopes: z.array(z.string()),
    createdAt: z.date(),
  }))
  .mutation(async ({ ctx, input }) => {
    // generate random key, hash it, store hash+prefix
    // return raw key (only time it's shown)
  }),

revokeApiKey: roleProcedure('partner')
  .input(z.object({ keyId: z.string().uuid() }))
  .mutation(async ({ ctx, input }) => {
    // set revokedAt = now() WHERE id = keyId AND partnerId = profile.id
  }),

getPartnerBranding: roleProcedure('partner')
  .output(z.object({
    organizationName: z.string(),
    brandColor: z.string().nullable(),
    brandLogoUrl: z.string().nullable(),
    webhookUrl: z.string().nullable(),
  }))
  .query(async ({ ctx }) => { /* query partnerProfiles */ }),

updatePartnerBranding: roleProcedure('partner')
  .input(z.object({
    organizationName: z.string().min(2).max(120).optional(),
    brandColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable().optional(),
    webhookUrl: z.string().url().nullable().optional(),
  }))
  .mutation(async ({ ctx, input }) => { /* update partnerProfiles */ }),

getPartnerSettings: roleProcedure('partner')
  .output(z.object({
    organizationName: z.string(),
    webhookUrl: z.string().nullable(),
  }))
  .query(async ({ ctx }) => { /* query partnerProfiles */ }),

updatePartnerSettings: roleProcedure('partner')
  .input(z.object({
    organizationName: z.string().min(2).max(120).optional(),
    webhookUrl: z.string().url().nullable().optional(),
  }))
  .mutation(async ({ ctx, input }) => { /* update partnerProfiles */ }),
```

**After all procedures, verify TypeScript:**
```bash
npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors.

**Commit:**
```bash
git add src/server/routers/
git commit -m "feat(api): add tRPC procedures for sponsor, university, admin, agent, partner"
```

---

## PHASE 3 — Role Overview Pages (Real Data)

### Task 7: Sponsor home page with real data

**Files:**
- Modify: `src/app/dashboard/[role]/page.tsx` (add SponsorOverview branch)
- Create: `src/components/sponsor/SponsorStatCard.tsx`

**Pattern** (matches StudentOverview in same file):
```tsx
// In page.tsx, add after StudentOverview:
async function SponsorOverview({ email, caller }: { email: string; caller: Awaited<ReturnType<typeof api>> }) {
  const [overviewResult] = await Promise.allSettled([caller.sponsor.getSponsorOverview()]);
  const overview = overviewResult.status === 'fulfilled' ? overviewResult.value : null;
  // Render: 4 stat cards (totalCommittedKobo / 100 NGN, activeStudents, pendingInvites, nextDisbursement)
  // Recent students list
  // CTA: "Review pending requests" → /dashboard/sponsor/students
}
// In DashboardRolePage, add branch:
if (role === 'sponsor' && sessionData.profileRole === 'sponsor') {
  return <SponsorOverview email={sessionData.email ?? ''} caller={caller} />;
}
```

### Task 8: Admin home page

**Files:**
- Modify: `src/app/dashboard/[role]/page.tsx`

Admin home redirects to operations:
```tsx
if (role === 'admin' && sessionData.profileRole === 'admin') {
  redirect('/dashboard/admin/operations');
}
```

### Task 9: Agent home page with real data

**Files:**
- Modify: `src/app/dashboard/[role]/page.tsx`

```tsx
async function AgentOverview({ email, caller }) {
  const [overviewResult] = await Promise.allSettled([caller.agent.getAgentOverview()]);
  // 4 stat cards: totalAssignedStudents, activeStudents, pendingCommissionsKobo, totalEarnedKobo
  // CTA: "View your students" → /dashboard/agent/students
}
```

### Task 10: Partner home page with real data

```tsx
async function PartnerOverview({ email, caller }) {
  const [overviewResult] = await Promise.allSettled([caller.partner.getPartnerOverview()]);
  // 3 stat cards: totalStudents, verifiedStudents, activeApiKeys
  // CTA: "View students" → /dashboard/partner/students
}
```

---

## PHASE 4 — Sponsor Pages

### Task 11: Sponsor students page

**Files:**
- Create: `src/app/dashboard/[role]/students/page.tsx` (modify existing stub if present)
- Create: `src/app/dashboard/[role]/students/students-page-client.tsx` (new sponsor branch OR modify existing)
- Create: `src/components/sponsor/sponsor-invite-list.tsx`
- Create: `src/components/sponsor/sponsor-students-list.tsx`

**Page pattern:**
```tsx
// page.tsx (Server)
export default async function StudentsPage({ params }) {
  const { role } = await params;
  if (role !== 'sponsor') { /* ... handle other roles */ }
  const caller = await api();
  const [invites, students] = await Promise.allSettled([
    caller.sponsor.listPendingInvites(),
    caller.sponsor.listSponsoredStudents(),
  ]);
  return <SponsorStudentsPageClient invites={...} students={...} copy={sponsorCopy.students} />;
}
```

**Client component — 2 tabs:**
- Tab "Pending" — `sponsor-invite-list.tsx`: card per invite with Accept/Decline buttons → `respondToInvite` mutation
- Tab "Sponsored" — `sponsor-students-list.tsx`: table rows with email, amount, status badge, disbursement count

**Copy** (in `src/config/copy/sponsor.ts`, the `studentDetail` section already has most needed strings):
- Page title: "Your students"
- Tab labels: "Pending requests", "Active sponsorships"
- Accept/Decline button labels
- Empty states for both tabs

### Task 12: Sponsor disbursements page

**Files:**
- Create: `src/app/dashboard/[role]/disbursements/page.tsx`
- Create: `src/app/dashboard/[role]/disbursements/disbursements-page-client.tsx`
- Create: `src/components/sponsor/sponsor-disbursement-row.tsx`
- Modify: `src/app/dashboard/[role]/disbursements/loading.tsx` (optional skeleton)

**Page:**
```tsx
// Server page fetches: caller.sponsor.listDisbursements()
// Client: table with status filter chips (All / Scheduled / Disbursed / Failed)
// Each row: amount formatted as ₦X,XXX, student email, status badge, scheduledAt, disbursedAt
// Empty state: "No disbursements scheduled yet. Accept a sponsorship to get started."
```

**Status badge colors** (using semantic tokens):
- scheduled → `bg-primary/10 text-primary`
- processing → `bg-yellow-100 text-yellow-700` (or `bg-warning/10 text-warning`)
- disbursed → `bg-green-100 text-green-700`
- failed → `bg-destructive/10 text-destructive`

### Task 13: Sponsor transactions page

**Files:**
- Create: `src/app/dashboard/[role]/transactions/page.tsx`
- Create: `src/app/dashboard/[role]/transactions/transactions-page-client.tsx`

**Page:** Reuses disbursements data but filtered to `status = 'disbursed'`. Shows:
- Summary: total disbursed, count
- Table: same as disbursements but only completed
- Empty state: "No completed transactions yet"

### Task 14: Sponsor KYC page

**Files:**
- Create: `src/app/dashboard/[role]/kyc/page.tsx`
- Create: `src/app/dashboard/[role]/kyc/kyc-page-client.tsx`

**Page:** 3-tier KYC status display (mirrors student verify pattern):
- Tier 1 (Starter): auto-verified from email auth → shows green checkmark
- Tier 2 (Standard): BVN/NIN → show current kycStatus, start check CTA if not started
- Tier 3 (Enhanced): Passport + selfie → show current status

**Data:** `caller.sponsor.getSponsorKycStatus()`

### Task 15: Sponsor settings page

**Files:**
- Create: `src/app/dashboard/[role]/settings/settings-page-client.tsx` (ADD sponsor branch, keep agent branch)

The existing `settings/page.tsx` shows `<SettingsPageClient role={role} copy={...} />`. The client checks `role` and renders appropriate form.

**Add sponsor branch:**
```tsx
// In SettingsPageClient or as separate SponsorSettings component
// Form: sponsorType radio (individual/corporate/self) + companyName (if corporate)
// Save → updateSponsorProfile mutation
// Shows KYC status (read-only)
// 4 notification toggles (same as agent pattern)
```

---

## PHASE 5 — University Pages

### Task 16: University pipeline page

**Files:**
- Create: `src/app/dashboard/[role]/pipeline/page.tsx`
- Create: `src/app/dashboard/[role]/pipeline/pipeline-page-client.tsx`
- Create: `src/components/university/university-pipeline-row.tsx`
- Create: `src/app/dashboard/[role]/pipeline/loading.tsx`
- Create: `src/app/dashboard/[role]/pipeline/error.tsx`

**Page:**
```tsx
// Fetches: caller.university.getVerificationQueue()
// Shows: table/list of students with columns:
//   Student email | Program | Documents | KYC status | Applied date | Action
// Status badge for KYC status
// Document count: "3/5 docs" with color (amber if incomplete, green if all)
// Empty state: "No students in your verification queue"
```

### Task 17: University students page

**Files:**
- Create: `src/app/dashboard/[role]/students/page.tsx` (university branch)

**Note:** The existing `/dashboard/[role]/students/page.tsx` needs to handle university role too.

**Page:**
```tsx
// Fetches: caller.university.listUniversityStudents()
// Table: student email, program, KYC status, document progress, enrolled date
// Filter: by program (dropdown)
// Empty state: "No students enrolled in your institution yet"
```

### Task 18: University documents page

**Files:**
- Create: `src/app/dashboard/[role]/documents/page.tsx` (university branch — the student documents page also uses this path!)

**CRITICAL:** `/dashboard/[role]/documents/page.tsx` is currently student-only. Need to add university branch:

```tsx
// page.tsx checks role:
if (role === 'university') {
  // Fetch: caller.university.getUniversityDocumentQueue()
  // Return: <UniversityDocumentsPageClient documents={...} />
}
// else: student documents (existing code)
```

**Client:** Table of documents pending review:
- Student email, document type badge, uploaded date, preview/download link, Approve/Reject buttons
- Reject shows reason input
- Reuse admin operations pattern for review actions

### Task 19: University settings page

Add university branch to settings page client:
- organizationName field (editable)
- School name (read-only, from their profile)
- Save → `updateUniversitySettings` mutation

---

## PHASE 6 — Admin Pages

### Task 20: Admin analytics page

**Files:**
- Create: `src/app/dashboard/[role]/analytics/page.tsx`
- Create: `src/app/dashboard/[role]/analytics/analytics-page-client.tsx`
- Create: `src/components/admin/admin-analytics-card.tsx`
- Create: `src/app/dashboard/[role]/analytics/loading.tsx`
- Create: `src/app/dashboard/[role]/analytics/error.tsx`

**Page:**
```tsx
// Fetches: caller.admin.getPlatformAnalytics()
// 3x3 grid of stat cards:
//   Row 1: Total Users, Total Sponsorships, Total Committed (NGN M)
//   Row 2: Total Disbursed, Pending Documents, KYC Verified Students
//   Row 3: Issued Certificates, Document Approval Rate, Platform Health
```

### Task 21: Admin users page

**Files:**
- Create: `src/app/dashboard/[role]/users/page.tsx` (REPLACE stub)
- Create: `src/app/dashboard/[role]/users/users-page-client.tsx`
- Create: `src/components/admin/admin-user-row.tsx`

**Page:**
```tsx
// Fetches: caller.admin.listAllUsers({ limit: 50 })
// Table: email, role badge, created date, onboarding status
// Search bar → re-fetches with search param
// Role filter pills
// Empty state (won't happen in prod but needed for code completeness)
```

### Task 22: Admin risk page

**Files:**
- Create: `src/app/dashboard/[role]/risk/page.tsx` (REPLACE stub)
- Create: `src/app/dashboard/[role]/risk/risk-page-client.tsx`
- Create: `src/components/admin/admin-risk-flag.tsx`

**Page:**
```tsx
// Fetches: caller.admin.getRiskFlags()
// List of risk flags with severity colors:
//   high → destructive badge
//   medium → amber/warning badge
//   low → muted badge
// Each flag: type label, user email, detail text, detected date
// Empty state: "No risk flags detected. Platform is healthy." with green checkmark
```

### Task 23: Admin settings page

Add admin branch to settings page client:
- Display-only profile info (email, role)
- 4 notification toggles
- No editable profile fields (admin managed elsewhere)

---

## PHASE 7 — Agent Pages

### Task 24: Agent home page (real data)

Already covered in Task 9 above (modifying `page.tsx` main file).

### Task 25: Agent students page

**Files:**
- Create/modify: `src/app/dashboard/[role]/students/page.tsx` (add agent branch)
- Create: `src/components/agent/agent-student-card.tsx`

**Page:**
```tsx
// role === 'agent': fetch caller.agent.listAgentStudents()
// Card list: student email, school + program, KYC status badge, document count, assigned date
// Empty state: "No students assigned yet. Share your referral link to get your first student."
// CTA → /dashboard/agent/actions
```

### Task 26: Agent commissions page

**Files:**
- Create: `src/app/dashboard/[role]/commissions/page.tsx`
- Create: `src/app/dashboard/[role]/commissions/commissions-page-client.tsx`
- Create: `src/components/agent/agent-commission-row.tsx`

**Page:**
```tsx
// Fetches: caller.agent.listAgentCommissions()
// Stat cards: Pending (sum pending), Paid this month (sum paid with paidAt in current month), Total earned
// Table: amount, description, status badge, paid date
// Empty state: "Commissions are paid when your students receive disbursements."
```

### Task 27: Agent activity page

**Files:**
- Create: `src/app/dashboard/[role]/activity/page.tsx`
- Create: `src/app/dashboard/[role]/activity/activity-page-client.tsx`

**Page (MVP — no dedicated DB table):**
```tsx
// Aggregate recent events from agent's data:
//   - Recent assignments (agentStudentAssignments.assignedAt)
//   - Recent commissions (agentCommissions.createdAt)
// Timeline/feed layout
// Each item: icon + text + date
// Empty state: "No activity yet. Assign your first student to get started."
```

### Task 28: Agent actions page

**Files:**
- Create: `src/app/dashboard/[role]/actions/page.tsx` (REPLACE stub)
- Create: `src/app/dashboard/[role]/actions/actions-page-client.tsx`

**Page:**
```tsx
// Quick action cards:
//   1. "Invite a student" — shows a referral link (agent's profile link)
//   2. "View your students" → link to /dashboard/agent/students
//   3. "Check commissions" → link to /dashboard/agent/commissions
// No mutations needed — just navigation + referral link display
```

---

## PHASE 8 — Partner Pages

### Task 29: Partner home page (real data)

Already covered in Task 10.

### Task 30: Partner analytics page

**Files:**
- Create: `src/app/dashboard/[role]/analytics/page.tsx` (note: admin also creates this — same file, different role branch!)

**IMPORTANT:** Both admin and partner have `/dashboard/[role]/analytics` — same file path, role-gated:

```tsx
// page.tsx:
if (role === 'admin') { /* admin analytics */ }
if (role === 'partner') {
  const [students] = await Promise.allSettled([caller.partner.listStudents()]);
  return <PartnerAnalyticsPageClient students={...} />;
}
```

**Partner analytics shows:**
- Student enrollment over time (group by month from partnerStudents.createdAt)
- Tier distribution (pie/bar: how many at tier 1, 2, 3)
- Verification rate (verified / total)
- No external charting library — use CSS-only bar chart (width: percentage tailwind)

### Task 31: Partner API keys page

**Files:**
- Create: `src/app/dashboard/[role]/api-keys/page.tsx` (REPLACE stub)
- Create: `src/app/dashboard/[role]/api-keys/api-keys-page-client.tsx`
- Create: `src/components/partner/partner-api-key-row.tsx`

**Page:**
```tsx
// Fetches: caller.partner.listApiKeys()
// Table: prefix (key_xxxxxxxx), scopes badges, created date, last used, status
// "Create API Key" button → opens Dialog with scope checkboxes (read:students, write:students)
//   → createApiKey mutation → shows rawKey in a code block with copy button (once only)
//   → warning: "Store this key now. You won't see it again."
// Revoke button per key row → confirmation dialog → revokeApiKey mutation
```

### Task 32: Partner branding page

**Files:**
- Create: `src/app/dashboard/[role]/branding/page.tsx` (REPLACE stub)
- Create: `src/app/dashboard/[role]/branding/branding-page-client.tsx`
- Create: `src/components/partner/partner-branding-form.tsx`

**Page:**
```tsx
// Fetches: caller.partner.getPartnerBranding()
// Form: organizationName (text input), brandColor (color picker using <input type="color">), webhookUrl (url input)
// Live preview: shows "Powered by [organizationName]" in brandColor
// Save → updatePartnerBranding mutation
```

### Task 33: Partner settings page

Add partner branch to settings page client:
- organizationName (text input)
- webhookUrl (url input)
- Save → updatePartnerSettings

---

## PHASE 9 — Settings for All Roles

### Task 34: Settings page for student, university, admin, sponsor, partner

**Files:**
- Modify: `src/app/dashboard/[role]/settings/settings-page-client.tsx`
- Modify: `src/app/dashboard/[role]/settings/page.tsx`

Current `settings/page.tsx` redirects non-agent roles to home. Replace with:
```tsx
// ALL roles now get real settings
// page.tsx: fetch role-specific settings data, pass to SettingsPageClient
// SettingsPageClient: renders role-specific form based on `role` prop
```

**Student settings:**
- Display email (read-only)
- School info (read-only, link to change)
- 4 notification toggles (but no DB backing yet → could store in localStorage or add notif table)
- For MVP: display-only "notification preferences coming soon" section

**University settings:** organizationName + school name (read-only) — from Task 19

**Admin settings:** display-only email + role

**Sponsor settings:** sponsorType + companyName — from Task 15

**Partner settings:** organizationName + webhookUrl — from Task 33

---

## PHASE 10 — QA & Verification

### Task 35: TypeScript strict check

```bash
cd /Users/gm/v6
npx tsc --noEmit 2>&1
```
Fix any errors before continuing.

### Task 36: Lint check

```bash
npm run lint 2>&1 | grep "error" | head -20
```

### Task 37: Screenshot all 6 personas

Run authenticated Playwright screenshots for all 6 role dashboards:
```bash
# Script: /Users/gm/v6/tmp/screenshot-all-roles.ts
```

### Task 38: Commit all completed work

```bash
git add -A
git commit -m "feat: complete all 6 role dashboards — sponsor, university, admin, agent, partner"
```

---

## Execution Notes for Subagents

**Critical patterns to follow:**
1. Every `page.tsx` is async Server Component — use `await api()` for data
2. Every client component file starts with `'use client'`
3. All strings in JSX come from copy config — never hardcoded
4. Use `cn()` for class merging (from `@/lib/utils`)
5. Use `Promise.allSettled()` for parallel data fetches
6. Empty states: icon + heading + description + CTA (never "No data found")
7. Loading states: use `loading.tsx` next to `page.tsx` with DashboardSkeleton or card skeletons
8. Error states: use `error.tsx` with try-again CTA

**Import paths:**
- `import { api } from '@/trpc/server'` (server-side caller)
- `import { useTRPC } from '@/trpc/client'` (client-side hook)
- `import { cn } from '@/lib/utils'`
- All UI from `@/components/ui/*`
- Copy from `@/config/copy/*`
- Icons from `lucide-react`

**Role-gating in pages:**
```tsx
// Always verify role before rendering role-specific data:
if (role !== 'sponsor') redirect(`/dashboard/${role}`);
```

**Existing similar pages to reference:**
- Student documents: `src/app/dashboard/[role]/documents/`
- Admin operations: `src/app/dashboard/[role]/operations/`
- Agent settings: `src/app/dashboard/[role]/settings/settings-page-client.tsx`
- Student overview: `src/app/dashboard/[role]/page.tsx` (StudentOverview function)
