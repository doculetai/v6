# Doculet.ai V6 — Full Persona User Journey Plan

**Created:** 2026-03-04  
**Lenses:** Product Manager, Product Designer, UI Specialist, UX Specialist  
**Scope:** All 6 personas — Student, Sponsor, University, Admin, Agent, Partner

---

## Executive Summary

This plan unifies four perspectives (Product Manager, Product Designer, UI Specialist, UX Specialist) into a single coherent blueprint for every persona's journey on Doculet.ai V6. It defines routes, acceptance criteria, design tokens, UX patterns, trust signals, and cross-persona handoffs for the Nigerian bank statement verification platform.

---

## 1. Product Manager Perspective

### 1.1 Route & State Machines

| Persona | Route | Primary State Machine | Key Triggers |
|---------|-------|------------------------|--------------|
| Student | `/dashboard/student/*` | `student_trust_state.stage` (not_started → building → ready → sealed → shared) | Onboarding complete, KYC, bank link, doc approval, cert issued |
| Sponsor | `/dashboard/sponsor/*` | `sponsorships.status` (pending → invited → accepted → signed → verified) | Invite sent, sponsor accepts, KYC complete |
| University | `/dashboard/university/*` | Pipeline columns (Invited → Awaiting Proof → Proof Received → Under Review → Verified → Insufficient) | Document review, cert verified |
| Admin | `/dashboard/admin/*` | `admin_review_queue.status` (pending → in_review → approved/rejected) | Document/identity review actions |
| Agent | `/dashboard/agent/*` | Agent pipeline (invited → linked → verified → funded → certified) | Student assignment, commission earned |
| Partner | `/dashboard/partner/*` | Application status (Submitted → Under Review → Approved → Disbursed → Rejected) | API integration, student sync |

### 1.2 Acceptance Criteria Matrix (Per Persona)

**Student**
- [ ] Onboarding gates unauthenticated users; redirects to wizard until complete
- [ ] Trust score displays consistently (same formula in overview + verify)
- [ ] Document status propagates bidirectionally with admin decisions
- [ ] Certificate generation CTA visible when readiness = 100%
- [ ] Share link enforces expiry + max access count
- [ ] Every async operation: loading, empty, error states
- [ ] Edge cases: BVN failure retry, bank expiry warning, sponsor reject flow

**Sponsor**
- [ ] Pending invites tab with Accept/Decline; accepted moves to Active tab
- [ ] Disbursement status filter (All / Scheduled / Disbursed / Failed)
- [ ] KYC mirrors student 3-tier pattern (identity, bank, statement)
- [ ] Settings: sponsorType, companyName (corporate only)
- [ ] Empty states: no invites, no disbursements, KYC not started
- [ ] Edge cases: invite expired, multi-student sponsorship, corporate CAC

**University**
- [ ] Pipeline scoped to `universityProfiles.schoolId`
- [ ] Document queue shows pending from students at their school
- [ ] Approve/Reject document → notification to student
- [ ] Settings: organizationName editable, school read-only
- [ ] Empty states: no students, no pipeline, no documents
- [ ] Edge cases: student switches school, document re-upload after reject

**Admin**
- [ ] Operations queue: assign, priority, SLA display
- [ ] Analytics: platform-wide KPIs (users, sponsorships, disbursed, certificates)
- [ ] Users: search, role filter, pagination
- [ ] Risk: flags (repeated KYC failure, doc rejection, unverified + sponsorship)
- [ ] Settings: display-only profile
- [ ] Edge cases: impersonation, bulk actions, fraud escalation

**Agent**
- [ ] Overview: assigned students, pending commissions, total earned
- [ ] Students: card list from agentStudentAssignments
- [ ] Activity: timeline of assignments + commissions
- [ ] Commissions: status filter (pending/paid), payout request (disabled until threshold)
- [ ] Actions: referral link display, invite student CTA
- [ ] Edge cases: no students, commission auto-creation on student milestone

**Partner**
- [ ] Overview: total students, verified count, active API keys
- [ ] Analytics: enrollment trend, tier distribution (CSS-only charts)
- [ ] API Keys: create (scopes) → show raw key once, revoke with confirmation
- [ ] Branding: organizationName, brandColor, webhookUrl, live preview
- [ ] Settings: org profile + webhook
- [ ] Edge cases: key revocation, branding preview, empty analytics

### 1.3 Empty / Loading / Error States

| State | Pattern | Copy Source |
|-------|---------|-------------|
| Loading | Skeleton matching content shape (cards, table rows, stat blocks) | `copy.primitives.loading` |
| Empty | Icon + heading + description + CTA (never "No data found") | `copy.[role].[page].empty` |
| Error | Message + retry button + support link | `copy.primitives.error` |

---

## 2. Product Designer Perspective

### 2.1 Design Tokens (Obsidian Blues)

- **Colors:** Semantic tokens only — `bg-background`, `text-foreground`, `bg-primary`, `text-muted-foreground`, `bg-destructive`, etc. No raw Tailwind colors.
- **Spacing:** xs(4px), sm(8px), md(16px), lg(24px), xl(32px)
- **Typography:** Responsive `text-sm md:text-base lg:text-lg`; no arbitrary pixels
- **Dark mode:** `@custom-variant dark (&:where(.dark, .dark *));` — all components must have `dark:` variants

### 2.2 Status Badge Spec

| Status | Token | Use Case |
|--------|-------|----------|
| pending | `bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400` | Invites, documents, KYC |
| verified/approved | `bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400` | KYC, documents, certs |
| rejected/failed | `bg-destructive/10 text-destructive` | Documents, KYC, disbursements |
| in_review | `bg-primary/10 text-primary` | Admin queue, documents |
| scheduled | `bg-primary/10 text-primary` | Disbursements |
| processing | `bg-amber-100 text-amber-700` | Disbursements |
| disbursed | `bg-emerald-100 text-emerald-700` | Disbursements |
| expired | `text-muted-foreground` | Invites, certs |

### 2.3 Icons (Lucide only)

| Size | Use | Example |
|------|-----|---------|
| 24px | Nav items | Home, Users, Settings |
| 20px | Inline with text | Badges, list items |
| 16px | Small badges, dense tables | Status indicators |

### 2.4 Layout Patterns

- **Overview pages:** Grid of stat cards (2x2 or 4 cols) + recent list
- **List pages:** Section → Container → Stack/Grid
- **Forms:** Stack with spacing-md between fields
- **Tables:** Responsive — cards on mobile, table on desktop

### 2.5 Per-Persona Visual Spec

| Persona | Primary Layout | Trust Element | CTA Style |
|---------|----------------|---------------|-----------|
| Student | Progress-focused; trust score prominent | Tier badge (1/2/3), seal levels | Warm, encouraging ("Complete verification") |
| Sponsor | KPI-driven; student cards | KYC status badge | Clear, professional ("Review requests") |
| University | Pipeline/queue-first | Document status, SLA | Efficient ("Review queue") |
| Admin | Operational dashboard | Risk severity, queue depth | Precise ("Assign review") |
| Agent | Caseload + earnings | Commission status | Helpful ("Invite student") |
| Partner | Metrics + integration | API key status | Business-oriented ("View students") |

---

## 3. UI Specialist Perspective

### 3.1 Aesthetic Direction (Fintech Trust)

- **Tone:** Luxury/Refined for trust-critical flows; Editorial for dashboards
- **Fonts:** IBM Plex (project standard) — no Inter, Roboto, Arial
- **Color rule:** 70% neutral, 20% primary, 10% accent
- **Depth:** Glass surfaces, subtle shadows; avoid flat solid backgrounds
- **Typography:** Dramatic size jumps (2x+) for hierarchy
- **Unforgettable element:** Verification tier badges + Doculet seal on certificates

### 3.2 Component Checklist (Every Page)

1. **Stat cards:** Amount in ₦ (comma-separated), currency code, optional trend
2. **Tables:** Sticky header on scroll, row hover, sort indicators where applicable
3. **Forms:** Inline validation, field-level errors, no toasts for validation
4. **Modals:** Full-screen on mobile (≤768px), centered on desktop
5. **Touch targets:** 44×44px minimum
6. **Focus rings:** `focus-visible` on all interactive elements

### 3.3 Responsive Breakpoints

- 375px, 390px (mobile default)
- 768px (tablet)
- 1024px (desktop)
- 1440px (large desktop)

**Tables → cards on mobile** — no horizontal scroll ever.

### 3.4 Copy Rules

- All strings from `src/config/copy/[role].ts`
- Nigerian context: ₦, WAT, BVN, NIN, Nigerian names in examples
- Never: Lorem ipsum, TODO, placeholder text

---

## 4. UX Specialist Perspective

### 4.1 Job-to-Be-Done by Persona

| Persona | JTBD | Primary Friction | UX Goal |
|---------|------|------------------|---------|
| Student | Secure proof-of-funds for university enrollment | Complexity of verification steps | Reduce anxiety; show clear progress; celebrate milestones |
| Sponsor | Fund student's education, track disbursements | Trust in platform; clarity of commitments | Build trust; transparent amounts and dates |
| University | Verify student funding status, approve enrollment | Volume of applicants; false positives | Efficient triage; clear SLA; quick approve/reject |
| Admin | Oversee platform health, resolve issues | Queue overload; fraud detection | Prioritization; clear severity; fast actions |
| Agent | Assist students/sponsors through process | Earning visibility; student follow-up | Motivate with commissions; easy invite flow |
| Partner | White-label for institutional clients | Integration complexity; ROI visibility | Self-service API; clear metrics; branding control |

### 4.2 Voice & Tone

| Persona | Voice | Example Headings |
|---------|-------|------------------|
| Student | Warm, encouraging, hopeful | "You're almost there!", "Let's verify your identity" |
| Sponsor | Trust-building, clear, professional | "Your sponsorship summary", "Review pending requests" |
| University | Efficient, authoritative | "Verification queue", "Review next student" |
| Admin | Operational, precise | "Review queue", "Risk flags" |
| Agent | Helpful, knowledgeable | "Your students", "Invite a student" |
| Partner | Business-oriented, ROI-focused | "Platform metrics", "API keys" |

### 4.3 Trust Signals (Fintech)

- **Amounts:** Exact ₦, comma-separated; USD equivalent secondary
- **Timestamps:** WAT, format "March 4, 2026 at 14:32 WAT"
- **Identity:** Verification tier badges (1/2/3), KYC status
- **Money flow:** Disbursement status, Paystack reference where applicable
- **Audit:** Activity feed, document status history
- **Security:** Never show full BVN/NIN; mask as `****1234`

### 4.4 Celebration Milestones (Student)

1. profile_complete  
2. identity_verified  
3. first_bank_linked  
4. first_document  
5. first_sponsor  
6. funding_50  
7. funding_100  
8. certificate_issued  

Show confetti or encouraging UI at these moments.

### 4.5 Cross-Persona Handoffs (Notification Triggers)

| Trigger | Recipient | Channel |
|---------|-----------|---------|
| Document reviewed | Student | In-app + Email |
| Sponsor invited | Sponsor | Email |
| Sponsor accepted | Student | In-app + Email |
| Sponsor verified | Student | In-app + Email |
| Certificate issued | Student | In-app + Email |
| Certificate expiring | Student | In-app + Email |
| Commission earned | Agent | In-app + Email |
| Review assigned | Admin | In-app |
| Application status changed | Student | In-app + Email |

---

## 5. Full Journey Maps (All 6 Personas)

### 5.1 Student Journey

```
Signup → Onboarding (4 steps) → Verify (KYC + Bank + Sponsors) → Documents → Proof → Share Certificate
         ↑                         ↑                              ↑           ↑
         Gate: redirect until      Trust score increases           Admin       Public URL
         complete                  Tier 1→2→3                      reviews     /certificate/[token]
```

**Routes:** Overview, Schools, Verify, Documents, Proof of Funds  
**Critical path:** Onboarding → Verify (BVN/NIN + Bank) → Documents approved → Certificate generated

### 5.2 Sponsor Journey

```
Invite received (email) → Accept → KYC (identity + bank + statement) → Signed → Track disbursements
                ↑                    ↑                                    ↑
                /sponsor/invite      Trust-building                       Students page
                token                Tier 1→2→3
```

**Routes:** Overview, Students (Pending + Active), Disbursements, Transactions, KYC, Settings  
**Critical path:** Accept invite → Complete KYC → Student sees "Sponsor Verified"

### 5.3 University Journey

```
Import/Connect students → Pipeline review → Document queue → Approve/Reject → Verified
         ↑                       ↑                ↑
         schoolId scope          Kanban           Approve/Reject
         (universityProfiles)    columns          → notify student
```

**Routes:** Overview, Pipeline, Students, Documents, Settings  
**Critical path:** See student in pipeline → Review documents → Approve → Student moves to Verified

### 5.4 Admin Journey

```
Login → Operations (review queue) → Document/Identity review → Approve/Reject
  ↑            ↑                            ↑
  Analytics    Assign, priority             Notify student
  Users        Risk flags
```

**Routes:** Overview (→ Operations), Operations, Analytics, Risk, Users, Settings  
**Critical path:** Queue item → Review → Approve/Reject → Notification to student

### 5.5 Agent Journey

```
Invite student → Student links (agent code) → Student verifies → Commission earned → Payout
       ↑                    ↑                        ↑                ↑
       Referral link        agentStudentAssignments  Milestone        agentCommissions
       /agent/actions       /agent/students          trigger          /agent/commissions
```

**Routes:** Overview, Students, Activity, Commissions, Quick Actions, Settings  
**Critical path:** Share link → Student signs up with code → Student certified → Commission created

### 5.6 Partner Journey

```
Onboard → Create API key → Sync students → Branding → Analytics
   ↑            ↑               ↑              ↑
   Partner      listApiKeys     partnerStudents  White-label
   profile      createApiKey    listStudents     config
```

**Routes:** Overview, Students, Analytics, API Keys, Branding, Settings  
**Critical path:** API key → Student data synced → Branding applied → Metrics visible

---

## 6. Route Inventory (Implementation Reference)

| Role | Route | Page | Status |
|------|-------|------|--------|
| Student | /dashboard/student | Overview | ✅ Done |
| Student | /dashboard/student/schools | Schools | ✅ Done |
| Student | /dashboard/student/verify | Verify | ✅ Done |
| Student | /dashboard/student/documents | Documents | ✅ Done |
| Student | /dashboard/student/proof | Proof of Funds | ✅ Done |
| Sponsor | /dashboard/sponsor | Overview | Stub → Real |
| Sponsor | /dashboard/sponsor/students | Students | Missing |
| Sponsor | /dashboard/sponsor/disbursements | Disbursements | Missing |
| Sponsor | /dashboard/sponsor/transactions | Transactions | Missing |
| Sponsor | /dashboard/sponsor/kyc | KYC | Missing |
| Sponsor | /dashboard/sponsor/settings | Settings | Missing |
| University | /dashboard/university | Overview | ✅ Done |
| University | /dashboard/university/pipeline | Pipeline | Missing |
| University | /dashboard/university/students | Students | Missing |
| University | /dashboard/university/documents | Documents | Missing |
| University | /dashboard/university/settings | Settings | Missing |
| Admin | /dashboard/admin | Overview | Redirect to Operations |
| Admin | /dashboard/admin/operations | Operations | ✅ Done |
| Admin | /dashboard/admin/analytics | Analytics | Missing |
| Admin | /dashboard/admin/risk | Risk | Missing |
| Admin | /dashboard/admin/users | Users | Missing |
| Admin | /dashboard/admin/settings | Settings | Missing |
| Agent | /dashboard/agent | Overview | Stub → Real |
| Agent | /dashboard/agent/students | Students | Missing |
| Agent | /dashboard/agent/activity | Activity | Missing |
| Agent | /dashboard/agent/commissions | Commissions | Missing |
| Agent | /dashboard/agent/actions | Quick Actions | Missing |
| Agent | /dashboard/agent/settings | Settings | Partial |
| Partner | /dashboard/partner | Overview | Stub → Real |
| Partner | /dashboard/partner/students | Students | ✅ Done |
| Partner | /dashboard/partner/analytics | Analytics | Missing |
| Partner | /dashboard/partner/api-keys | API Keys | Missing |
| Partner | /dashboard/partner/branding | Branding | Missing |
| Partner | /dashboard/partner/settings | Settings | Missing |

---

## 7. Implementation Order (PM Recommendation)

1. **Phase 1:** Schema + tRPC procedures (all roles)  
2. **Phase 2:** Role overview pages with real data (Sponsor, Agent, Partner)  
3. **Phase 3:** Sponsor pages (students, disbursements, transactions, KYC, settings)  
4. **Phase 4:** University pages (pipeline, students, documents, settings)  
5. **Phase 5:** Admin pages (analytics, users, risk, settings)  
6. **Phase 6:** Agent pages (students, activity, commissions, actions)  
7. **Phase 7:** Partner pages (analytics, api-keys, branding, settings)  
8. **Phase 8:** Settings for all roles + QA

---

## 8. Success Criteria (All Lenses)

- [ ] **PM:** Every nav item leads to a real page; acceptance criteria met; edge cases handled
- [ ] **Design:** Tokens applied consistently; status badges correct; layout patterns followed
- [ ] **UI:** Aesthetics gate passed; no generic fonts; 375px works; dark mode complete
- [ ] **UX:** Voice matches persona; trust signals visible; handoffs trigger notifications
- [ ] **Technical:** TypeScript strict; no mocks; copy from config; max 400 lines/file

---

*Document synthesized from Product Manager, Product Designer, UI Specialist, and UX Specialist perspectives for Doculet.ai V6.*
