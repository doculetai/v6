# V6 Full Product Completion Design

**Goal:** Complete all 6 role dashboards so every persona has functional, data-backed pages matching V5 quality.

**Architecture:** Each page follows the established pattern: async Server Component page (data fetch) → Client Component wrapper (state + mutations) → role-specific components in `src/components/[role]/`. Copy in `src/config/copy/[role].ts`. tRPC procedures in `src/server/routers/[role].ts`.

**Tech Stack:** Next.js 16 App Router, tRPC v11, Drizzle ORM, Tailwind CSS 4, shadcn/ui, Zod, Lucide icons.

---

## Current State

| Persona | % Done | Real Pages | Missing Pages |
|---------|--------|-----------|----------------|
| Student | 100% | schools, verify, documents, proof, onboarding | — |
| Sponsor | 16% | home (stub card) | home real data, students, disbursements, transactions, kyc, settings |
| University | 20% | overview (metrics) | pipeline, students, documents, settings |
| Admin | 16% | operations | analytics, users, risk, settings |
| Agent | 8% | settings (partial) | home, students, activity, commissions, actions |
| Partner | 33% | students list | home real data, analytics, api-keys, branding, settings |

---

## Schema Additions Required

### 1. `universityProfiles` table
Links university user → school. Without this, university can't scope their queue/students to their institution.

```sql
university_profiles {
  id: uuid PK
  userId: uuid FK(users) UNIQUE cascade
  schoolId: uuid FK(schools) nullable cascade
  organizationName: text nullable
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 2. `agentStudentAssignments` table
Links agent → student for the cases/pipeline view.

```sql
agent_student_assignments {
  id: uuid PK
  agentId: uuid FK(users) cascade
  studentId: uuid FK(users) cascade
  assignedAt: timestamp default now()
  createdAt: timestamp
  UNIQUE(agentId, studentId)
}
```

### 3. `agentCommissions` table
Records commission events per agent.

```sql
agent_commissions {
  id: uuid PK
  agentId: uuid FK(users) cascade
  sponsorshipId: uuid FK(sponsorships) nullable cascade
  amountKobo: integer
  currency: text default 'NGN'
  status: enum['pending', 'processing', 'paid', 'cancelled'] default 'pending'
  description: text nullable
  paidAt: timestamp nullable
  createdAt: timestamp
  updatedAt: timestamp
}
```

---

## Per-Persona Design

### Sponsor

**Home overview** — pulls from `sponsorProfiles`, `sponsorships`, `disbursements`, `sponsorshipInvites`:
- Stat cards: Total Committed (sum amountKobo), Active Students (accepted sponsorships), Pending Invites, Next Disbursement date
- Recent students list (last 3 accepted)
- CTA: "Review pending requests"

**Students page** — 2 tabs: "Pending Invites" (accept/decline) + "Active Sponsorships":
- Pending: shows studentEmail, message, created date, Accept/Decline buttons
- Active: shows student email, amount, school, status badge, disbursement count

**Disbursements page** — list of all disbursements with status timeline:
- Table: amount, school, status (scheduled/processing/disbursed/failed), scheduledAt, disbursedAt
- Filter by status
- Empty state: "No disbursements scheduled yet"

**Transactions page** — same as disbursements but shows only completed ones:
- Download statement link
- Summary stats: total disbursed, average amount

**KYC page** — mirrors student verify pattern (3-tier KYC for sponsor):
- Tier 1: Email/phone (auto from auth)
- Tier 2: BVN/NIN via Dojah
- Tier 3: Passport + selfie

**Settings** — profile + notifications:
- sponsorType (individual/corporate/self)
- companyName (for corporate)
- KYC status display
- Notification toggles

---

### University

**Home** — already done (metrics + activity feed) ✅

**Pipeline page** — verification queue of students applying to their school:
- Student name (email), program, applied date, documents count, verification status
- Quick approve/flag actions

**Students page** — enrolled students:
- Filter by program
- Status: verified, pending, flagged
- Linked to their funding amount

**Documents page** — document review:
- Queue of pending documents from their students
- View + approve/reject actions (reuse admin operations pattern)

**Settings** — institution profile:
- organizationName, schoolId (read-only display)
- Notification preferences

---

### Admin

**Home** — redirect to `/dashboard/admin/operations` (it IS the home functionally)

**Analytics page** — platform-wide metrics:
- Total users by role
- Sponsorship volume (total committed NGN)
- Document review queue depth
- KYC completion rates
- Certificate issuance count

**Users page** — user management:
- Table: email, role, created date, status
- Search by email
- Role badge
- Quick actions: view profile

**Risk page** — compliance flags:
- Failed KYC attempts (repeated failures)
- Rejected documents (3+ rejections)
- Unverified accounts with active sponsorships
- Each flagged item shows: user, issue, date, severity

**Settings** — platform configuration:
- Admin profile (display)
- Notification preferences

---

### Agent

**Home** — cases summary:
- Stat cards: Assigned Students, Active (verified), Pending Commissions, Total Earned
- Recent student activity list
- Quick action CTA: "Invite a student"

**Students page** — assigned students:
- List from `agentStudentAssignments`
- Each: student email, school, verification tier, funding status
- Quick link: "View student journey"

**Activity page** — recent events feed:
- Document uploads, KYC completions, sponsorship acceptances for their students
- Timeline/feed layout

**Commissions page** — earnings:
- Stat cards: Pending payout, Paid this month, Total lifetime
- Commissions table: amount, student, date, status
- Request payout button (disabled until threshold)

**Actions page** — quick operations:
- "Invite student" form (email + message)
- Links to recently active students

---

### Partner

**Home** — integration performance:
- Stat cards: Total Students, Verified Students, API Calls (last 30 days if tracked), Active Keys
- Quick student table (last 5)

**Analytics page** — usage metrics:
- Student enrollment trend (by month)
- Verification tier distribution
- Partner-specific funnel metrics
- Empty state: "Connect your first student to see analytics"

**API Keys page** — key management:
- List: keyPrefix (key*****), scopes, created date, last used, status (active/revoked)
- Create key button → modal with scopes selector → shows key once
- Revoke key action

**Branding page** — white-label config:
- organizationName (editable)
- brandColor picker
- brandLogoUrl upload
- webhookUrl config
- Live preview of how partner label appears

**Settings** — org profile:
- organizationName, webhookUrl
- Notification preferences

---

## Settings Pattern (All Roles)

Every role settings page uses the same layout:
- **Profile section**: role-specific fields
- **Notifications section**: 4 toggles (same as agent pattern)
- **Account section**: email display (read-only, managed by Supabase Auth)

---

## Error + Empty States

Every list page:
- **Loading**: skeleton cards matching the list layout
- **Error**: "We couldn't load [feature]. Try again."
- **Empty**: icon + descriptive heading + CTA (not "No data found")

---

## Component Architecture

```
src/components/
  sponsor/
    SponsorStatCard.tsx
    SponsorStudentCard.tsx
    SponsorDisbursementRow.tsx
    SponsorKycTier.tsx
    sponsor-invite-list.tsx
    sponsor-sponsored-list.tsx
  university/
    UniversityPipelineRow.tsx
    UniversityStudentCard.tsx
    UniversityDocumentQueue.tsx
  admin/
    AdminAnalyticsCard.tsx
    AdminUserRow.tsx
    AdminRiskFlag.tsx
  agent/
    AgentStudentCard.tsx
    AgentCommissionRow.tsx
    AgentActivityFeed.tsx
  partner/
    PartnerApiKeyRow.tsx
    PartnerBrandingForm.tsx
    PartnerAnalyticsChart.tsx (simple, CSS-only sparkline)
```

---

## Implementation Order

**Phase 1 (Sequential, ~20 min)**: Schema + all tRPC procedures
- Add 3 new tables, push migrations, seed test data
- Implement all ~30 missing procedures

**Phase 2 (Parallel, ~40 min)**: All UI pages
- 5 parallel subagents, one per incomplete role
- Each builds: pages + client wrappers + components + copy

**Phase 3 (Sequential, ~10 min)**: Settings + QA
- Implement settings for remaining 5 roles
- TypeScript check + screenshot sweep

---

## Success Criteria

- All 6 roles can log in and see real, meaningful data on their home page
- All nav items lead to real pages (no "coming soon" text)
- Settings works for all 6 roles
- TypeScript strict mode passes (no errors)
- All pages render without error on desktop + mobile
- Copy centralized — no hardcoded strings in JSX
