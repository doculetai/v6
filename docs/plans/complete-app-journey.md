# Doculet.ai — Complete App Journey

**Version:** 1.0  
**Date:** 2026-03-04  
**Status:** Single source of truth for engineers, designers, and stakeholders

---

## Table of Contents

1. [Visitor to Certificate (Linear Flow)](#1-visitor-to-certificate-linear-flow)
2. [Full Route Inventory](#2-full-route-inventory)
3. [Auth and Onboarding Flow](#3-auth-and-onboarding-flow)
4. [Sidebar / Nav by Role](#4-sidebar--nav-by-role)
5. [Cross-Persona Handoff Pages](#5-cross-persona-handoff-pages)
6. [Navigation Links](#6-navigation-links)
7. [State-Dependent UI](#7-state-dependent-ui)
8. [UX Principles](#8-ux-principles)
9. [Brand Guidelines](#9-brand-guidelines)
10. [Nigerian Context](#10-nigerian-context)
11. [Per-Screen Deep Spec](#11-per-screen-deep-spec)

---

<!-- pagebreak -->

## 1. Visitor to Certificate (Linear Flow)

End-to-end sequence for a student from first visit to certificate shared.

| Step | Route | Purpose | Primary CTA | Next |
|------|-------|---------|-------------|------|
| 1 | `/` or `/(marketing)` | Landing | Sign up | `/signup` |
| 2 | `/signup` | Create account, choose role | Create account | Auth callback → `/auth/complete` |
| 3 | `/auth/complete` | Post-confirmation, ensure profile | — | `/dashboard/{role}` |
| 4 | `/dashboard/student` | Student home | — | Redirect to onboarding if `!onboardingComplete` |
| 5 | `/dashboard/student/onboarding` | 4-step wizard (Welcome, School, Funding, Action) | Complete onboarding | `/dashboard/student` |
| 6 | `/dashboard/student` | Overview, trust score, next steps | Continue application | `/dashboard/student/schools` |
| 7 | `/dashboard/student/schools` | Select school and program | Apply | `/dashboard/student/verify` |
| 8 | `/dashboard/student/verify` | KYC, bank link, sponsor invite | Verify identity / Connect bank | `/dashboard/student/documents` |
| 9 | `/dashboard/student/documents` | Upload documents | Upload document | `/dashboard/student/proof` |
| 10 | `/dashboard/student/proof` | Readiness checklist, certificate | Generate certificate | Share section |
| 11 | Share flow | Create share link | Share certificate | `/certificate/[token]` (public) |

**Returning user (login):** `/login` → `/dashboard/{role}`. Students with incomplete onboarding redirect to `/dashboard/student/onboarding`.

[Screenshot: Visitor to Certificate Flow]

---

<!-- pagebreak -->

## 2. Full Route Inventory

### 2.1 Public Routes

| Route | Purpose | Status | Primary CTA |
|-------|---------|--------|-------------|
| `/` | Root / marketing landing | Built | Sign up, Log in |
| `/(marketing)` | Marketing page | Built | Sign up |
| `/test-landing` | Test landing | Built | — |
| `/certificate/[token]` | Public certificate verification | Planned | Verify another certificate |
| `/about` | About Doculet | Planned | — |
| `/pricing` | Pricing | Planned | — |
| `/terms` | Terms of service | Planned | — |
| `/privacy` | Privacy policy | Planned | — |
| `/contact` | Contact | Planned | — |
| `/join/[slug]` | Partner join | Planned | — |
| `/invite/[token]` or `/sponsor/invite` | Sponsor invite landing | Planned | Accept sponsorship |

### 2.2 Auth Routes

| Route | Purpose | Status | Primary CTA |
|-------|---------|--------|-------------|
| `/login` | Sign in | Built | Log in |
| `/signup` | Create account (role in form) | Built | Create account |
| `/forgot-password` | Request password reset | Built | Send reset link |
| `/update-password` | Set new password (post-reset) | Built | Update password |
| `/auth/complete` | Post-auth, ensure profile | Built | — |
| `/select-role` | Choose role (v5 pattern) | Planned | — |

### 2.3 Dashboard Routes by Role

**Student** (base `/dashboard/student`)

| Route | Purpose | Status | Primary CTA |
|-------|---------|--------|-------------|
| `/` | Home / overview | Built | Continue application |
| `/onboarding` | 4-step wizard | Built | Complete onboarding |
| `/schools` | School/program selection | Built | Apply |
| `/verify` | KYC, bank, sponsors | Built | Verify identity |
| `/documents` | Document upload and tracking | Built | Upload document |
| `/proof` | Certificate readiness and sharing | Built | Generate certificate |
| `/support` | Help tickets | Planned | Create ticket |
| `/settings` | Profile and notifications | Built | Save |

**Sponsor** (base `/dashboard/sponsor`)

| Route | Purpose | Status | Primary CTA |
|-------|---------|--------|-------------|
| `/` | Overview | Built | Review requests |
| `/students` | Pending invites, active sponsorships | Built | Accept / Decline |
| `/students/[id]` | Student detail | Planned | — |
| `/disbursements` | Fund transfers | Built | — |
| `/transactions` | Transaction history | Built | — |
| `/kyc` | Sponsor KYC | Built | Start verification |
| `/commitments` | Financial pledges | Planned | Sign commitment |
| `/verify` | Sponsor verification | Planned | Complete verification |
| `/signing` | Sign affidavit | Planned | Sign |
| `/documents` | Uploaded docs | Planned | — |
| `/impact` | Contribution summary | Planned | — |
| `/settings` | Profile and preferences | Built | Save |

**University** (base `/dashboard/university`)

| Route | Purpose | Status | Primary CTA |
|-------|---------|--------|-------------|
| `/` | Overview | Built | Review queue |
| `/pipeline` | Applicant review pipeline | Built | — |
| `/students` | Student list | Built | — |
| `/students/[id]` | Student detail | Planned | Approve / Reject |
| `/documents` | Document review queue | Built | Approve / Reject |
| `/queue` | Review queue | Planned | — |
| `/programs` | Program management | Planned | — |
| `/reports` | Analytics | Planned | — |
| `/team` | Staff management | Planned | — |
| `/import` | Bulk student add | Planned | — |
| `/settings` | Institution settings | Built | Save |

**Admin** (base `/dashboard/admin`)

| Route | Purpose | Status | Primary CTA |
|-------|---------|--------|-------------|
| `/` | Overview (redirects to operations) | Built | — |
| `/operations` | Live operational activity | Built | Review queue |
| `/analytics` | Platform metrics | Built | — |
| `/risk` | Risk and compliance flags | Built | — |
| `/users` | User management | Built | Search |
| `/queue` | Review queue | Planned | — |
| `/documents` | Document browser | Planned | — |
| `/statement-review` | Deep analysis | Planned | — |
| `/fraud` | Fraud detection | Planned | — |
| `/payments` | Payments | Planned | — |
| `/audit` | Audit log | Planned | — |
| `/system` | System health | Planned | — |
| `/settings` | Platform configuration | Built | Save |

**Agent** (base `/dashboard/agent`)

| Route | Purpose | Status | Primary CTA |
|-------|---------|--------|-------------|
| `/` | Overview | Built | Invite student |
| `/students` | Caseload | Built | — |
| `/activity` | Recent events | Built | — |
| `/commissions` | Earnings | Built | — |
| `/actions` | Quick actions | Built | Invite student |
| `/invites` | Invite management | Planned | — |
| `/bulk-invite` | Mass invitations | Planned | — |
| `/sponsors` | Sponsor relationships | Planned | — |
| `/settings` | Profile | Built | Save |

**Partner** (base `/dashboard/partner`)

| Route | Purpose | Status | Primary CTA |
|-------|---------|--------|-------------|
| `/` | Overview | Built | View students |
| `/students` | Students on platform | Built | — |
| `/analytics` | Usage and conversion | Built | — |
| `/api-keys` | Integration keys | Built | Create API key |
| `/branding` | White-label customization | Built | Save |
| `/programs` | Program management | Planned | — |
| `/applications` | Student review | Planned | — |
| `/disbursements` | Payment tracking | Planned | — |
| `/compliance` | Org verification | Planned | — |
| `/settings` | Partner settings | Built | Save |

### 2.4 Shared Routes

| Route | Purpose | Status |
|-------|---------|--------|
| `/[role]/settings` | Role-specific settings | Built |
| `/[role]/messages` | In-app messaging | Planned |
| `/[role]/notifications` | Notification center | Planned |

---

<!-- pagebreak -->

## 3. Auth and Onboarding Flow

### 3.1 Auth Flow Diagram

```mermaid
flowchart TD
    Landing[/] --> Signup[signup]
    Landing --> Login[login]
    Signup -->|role in form| CreateProfile[createProfile]
    CreateProfile --> AuthComplete[auth/complete]
    AuthComplete -->|ensureProfile| Dashboard[dashboard/role]
    Login -->|session| Dashboard
    Dashboard -->|student, !onboardingComplete| Onboarding[dashboard/student/onboarding]
    Onboarding -->|complete| Dashboard
    Forgot[forgot-password] --> UpdatePwd[update-password]
    UpdatePwd --> Login
```

### 3.2 Redirect Chain

| Entry point | Condition | Redirect to |
|-------------|-----------|-------------|
| Signup success | Role in form, profile created | `/auth/complete` → `/dashboard/{role}` |
| Login success | Session + profile | `/dashboard/{profile.role}` |
| Student visits `/dashboard/student` | `!onboardingComplete` | `/dashboard/student/onboarding` |
| Onboarding complete | `onboardingComplete` set | `/dashboard/student` (home) |
| Admin visits `/dashboard/admin` | — | `/dashboard/admin/operations` |
| Unauthenticated visit to dashboard | No session | `/login` |

### 3.3 Onboarding Gate

Students without `onboardingComplete` are redirected from `/dashboard/student` to `/dashboard/student/onboarding`. Completion sets `onboardingComplete` on profile and advances to step 4 (Action/summary) with "Go to Dashboard" CTA.

---

<!-- pagebreak -->

## 4. Sidebar / Nav by Role

### Student

| Item | href | Group | Description |
|------|------|-------|-------------|
| Overview | `/dashboard/student` | — | Dashboard summary and next steps |
| Schools | `/dashboard/student/schools` | My Journey | Browse and apply to programs |
| Verify | `/dashboard/student/verify` | My Journey | Identity and KYC verification |
| Documents | `/dashboard/student/documents` | My Journey | Upload and manage documents |
| Proof of Funds | `/dashboard/student/proof` | Credentials | View and share certificate |

**Quick action:** "Continue application" → `/dashboard/student/schools`

### Sponsor

| Item | href | Group | Description |
|------|------|-------|-------------|
| Overview | `/dashboard/sponsor` | — | Funding summary and activity |
| Students | `/dashboard/sponsor/students` | Funding | Students you sponsor |
| Disbursements | `/dashboard/sponsor/disbursements` | Funding | Fund transfers and schedules |
| Transactions | `/dashboard/sponsor/transactions` | Funding | Full transaction history |
| KYC | `/dashboard/sponsor/kyc` | Account | Identity verification status |
| Settings | `/dashboard/sponsor/settings` | Account | Profile and preferences |

**Quick action:** "Review requests" → `/dashboard/sponsor/students`

### University

| Item | href | Group | Description |
|------|------|-------|-------------|
| Overview | `/dashboard/university` | — | Admissions summary |
| Pipeline | `/dashboard/university/pipeline` | Admissions | Applicant review pipeline |
| Students | `/dashboard/university/students` | Admissions | Enrolled and admitted students |
| Documents | `/dashboard/university/documents` | Admissions | Document review queue |
| Settings | `/dashboard/university/settings` | Account | Institution settings |

**Quick action:** "Review queue" → `/dashboard/university/pipeline`

### Admin

| Item | href | Group | Description |
|------|------|-------|-------------|
| Overview | `/dashboard/admin` | — | Platform health and metrics |
| Operations | `/dashboard/admin/operations` | Operations | Live operational activity |
| Analytics | `/dashboard/admin/analytics` | Operations | Business intelligence |
| Risk | `/dashboard/admin/risk` | Operations | Risk and compliance flags |
| Users | `/dashboard/admin/users` | System | Manage all users |
| Settings | `/dashboard/admin/settings` | System | Platform configuration |

**Quick action:** "Review queue" → `/dashboard/admin/operations`

### Agent

| Item | href | Group | Description |
|------|------|-------|-------------|
| Overview | `/dashboard/agent` | — | Pipeline and performance |
| Students | `/dashboard/agent/students` | My Work | Students you manage |
| Activity | `/dashboard/agent/activity` | My Work | Recent actions and events |
| Commissions | `/dashboard/agent/commissions` | My Work | Earnings and payouts |
| Quick Actions | `/dashboard/agent/actions` | My Work | Shortcuts and bulk operations |
| Settings | `/dashboard/agent/settings` | Account | Profile settings |

**Quick action:** "Invite student" → `/dashboard/agent/students`

### Partner

| Item | href | Group | Description |
|------|------|-------|-------------|
| Overview | `/dashboard/partner` | — | Platform metrics |
| Students | `/dashboard/partner/students` | Platform | Students on your platform |
| Analytics | `/dashboard/partner/analytics` | Platform | Usage and conversion data |
| API Keys | `/dashboard/partner/api-keys` | Developer | Manage integration keys |
| Branding | `/dashboard/partner/branding` | Developer | White-label customization |
| Settings | `/dashboard/partner/settings` | Account | Partner settings |

**Quick action:** "View students" → `/dashboard/partner/students`

---

<!-- pagebreak -->

## 5. Cross-Persona Handoff Pages

| Trigger | Recipient | Page | What they see |
|---------|-----------|------|---------------|
| Student invites sponsor | Sponsor | `/sponsor/invite` or `/invite/[token]` | Student name, school, message; Accept CTA |
| Sponsor accepts | Student | `/dashboard/student/verify` | "Sponsor accepted! Awaiting verification." |
| Sponsor completes KYC | Student | `/dashboard/student/verify` | "Sponsor Verified" badge, ₦ amount |
| Admin approves/rejects document | Student | `/dashboard/student/documents` | Approved green / Rejected red + reason |
| Certificate shared | University | `/certificate/[token]` (public) | Student name, tier, funding, seal |
| Student selects school | University | `/dashboard/university/pipeline` | Student in pipeline |
| Agent invites student | Student | Signup with agent code | Linked to agent |

---

## 6. Navigation Links

| Link text | From | To |
|-----------|------|-----|
| Continue application | Student home | `/dashboard/student/schools` |
| Review requests | Sponsor home | `/dashboard/sponsor/students` |
| Review queue | University/Admin home | Pipeline / Operations |
| Invite student | Agent home | `/dashboard/agent/students` |
| View students | Partner home | `/dashboard/partner/students` |
| View certificate | Proof page | Share section (same page) |
| Re-upload | Documents (rejected doc) | Upload modal |
| Generate certificate | Proof page | Certificate generation flow |

---

<!-- pagebreak -->

## 7. State-Dependent UI

| State | Condition | UI behavior |
|-------|-----------|-------------|
| Onboarding gate | `!onboardingComplete` (student) | Redirect to `/dashboard/student/onboarding` |
| Sponsor section on Verify | `fundingType === 'sponsor' \| 'corporate'` | Sponsor invite block visible |
| Sponsor section hidden | `fundingType === 'self'` | Sponsor block hidden (Tier 2 path) |
| Generate certificate enabled | Readiness checklist 100% (identity, school, funding, docs, sponsor if Tier 3) | Button active |
| Bank expiring banner | Mono connection &gt; 75 days | Amber banner on Verify: "Your bank connection is expiring. Reconnect." |
| Document rejected | `verification_status === 'rejected'` | Red badge, rejection reason, Re-upload CTA |

---

## 8. UX Principles

### 8.1 Voice and Tone per Persona

| Persona | Voice | Example |
|---------|-------|---------|
| Student | Warm, encouraging, hopeful | "You're almost there!", "Let's verify your identity" |
| Sponsor | Trust-building, clear, professional | "Your sponsorship summary", "Review pending requests" |
| University | Efficient, authoritative | "Verification queue", "Review next student" |
| Admin | Operational, precise | "Review queue", "Risk flags" |
| Agent | Helpful, knowledgeable | "Your students", "Invite a student" |
| Partner | Business-oriented, ROI-focused | "Platform metrics", "API keys" |

### 8.2 Interaction Patterns

- **Forms:** Zod validation + react-hook-form; field-level errors, no toasts for validation
- **Modals:** Full-screen on mobile (≤768px), centered on desktop
- **Loading:** Skeleton matching content shape (cards, table rows)
- **Empty states:** Icon + heading + description + CTA (never "No data found")
- **Error states:** Message + retry CTA + support link

### 8.3 Accessibility

- Keyboard navigable; `focus-visible` rings on all interactive elements
- WCAG 2.1 AA contrast
- ARIA labels where needed
- Touch targets: 44×44px minimum

### 8.4 Responsive

- Mobile-first; breakpoints: 375px, 390px, 768px, 1024px, 1440px
- Tables → cards on mobile
- No horizontal scroll

### 8.5 Trust Signals

- Amounts in ₦ (comma-separated); USD secondary
- Timestamps in WAT
- Verification tier badges (Tier 1/2/3)
- KYC status badges

---

<!-- pagebreak -->

## 9. Brand Guidelines

### 9.1 Visual System

- **Colors:** Obsidian Blues palette; semantic tokens only (`bg-background`, `text-foreground`, `bg-primary`)
- **Typography:** Responsive `text-sm md:text-base lg:text-lg`; IBM Plex
- **Spacing:** xs(4px), sm(8px), md(16px), lg(24px), xl(32px)
- **Dark mode:** `dark:` variants on all components

### 9.2 Logo Usage

- Doculet logo on marketing, dashboard shell, public certificate
- Seal on certificates (Doculet-Sealed = emerald border + amber ring)

### 9.3 Copy Voice

- No placeholder text (Lorem ipsum, TODO)
- Nigerian context: names, amounts, banks
- All copy from `src/config/copy/` — never hardcoded

### 9.4 Fintech Aesthetic

- Trust-forward, luxury/refined
- Not generic; avoid Inter/Roboto/Arial

### 9.5 Per-Persona Brand

- Student: hopeful, progress-oriented
- Sponsor: trustworthy, transparent
- University: authoritative, efficient

---

## 10. Nigerian Context

### Currency
- Primary: ₦ (Naira); format: `₦2,400,000` (comma-separated)
- Storage: kobo (integers)
- USD as secondary: `₦48,200,000 (≈ $30,125 USD)`

### Identity
- **BVN / NIN:** 11 digits, numeric; mask as `****1234`
- Verify via Dojah; never store full number

### Timestamps
- WAT (UTC+1); format: "March 4, 2026 at 14:32 WAT"
- Relative for recent: "3 hours ago"

### Names
- Use Nigerian names: Kemi Adesanya, Chukwuemeka Okafor
- Never: John Smith, Jane Doe

### Regulatory
- NDPR, CBN, NIMC, CAC (corporate sponsors)

### Payment
- Paystack; cert fee ₦80,000; renewal ₦40,000

---

<!-- pagebreak -->

## 11. Per-Screen Deep Spec

### 11.1 Student — Home

**Route:** `/dashboard/student`  
**Status:** Built

**Sections:**
- Trust score / progress
- Funded amount vs goal
- Next steps / journey spine
- Recent activity
- Certificate status

**Copy keys (samples):**
- `dashboardShellCopy.studentHome.title`: "Your proof journey"
- `studentHomeCopy.empty.cta`: "Start onboarding"

**UX:** Warm, encouraging; clear next CTA  
**Brand:** Trust score prominent; progress-focused  
**Error state:** High level — retry CTA  
[Screenshot: Student Home]

---

### 11.2 Student — Onboarding

**Route:** `/dashboard/student/onboarding`  
**Status:** Built

**Sections:**
- Step 1: Welcome
- Step 2: Select school and program
- Step 3: Funding type (self / sponsor / corporate)
- Step 4: Action summary + Complete

**Copy keys (samples):**
- `onboardingWizard.title`: "Build your proof-of-funds profile"
- `steps.welcome.cta`: "Start onboarding"
- `steps.action.completeCta`: "Complete onboarding"

**UX:** Guided wizard; progress indicator  
**Brand:** Trust signals (secure, audit, compliant)  
**Error state:** High level — retry CTA  
[Screenshot: Student Onboarding]

---

### 11.3 Student — Verify

**Route:** `/dashboard/student/verify`  
**Status:** Built

**Sections:**
- Trust / verification progress
- Identity (BVN/NIN/Passport)
- Bank (Mono connect or statement)
- Sponsor (if `fundingType` sponsor/corporate)

**Copy keys (samples):**
- `verify.title`: "Verify your identity"
- `kycSection.dojahForm.submitCta`: "Start Dojah check"
- `bankSection.connectCta`: "Connect bank account"

**UX:** Trust-forward; clear status per tier  
**Brand:** NGN amounts; masked BVN/NIN  
**Nigerian:** BVN/NIN 11 digits; ₦ for balance  
**Error state:** High level — retry CTA  
[Screenshot: Student Verify]

---

### 11.4 Student — Documents

**Route:** `/dashboard/student/documents`  
**Status:** Built

**Sections:**
- Upload CTA
- Document list (type, status, date)
- Upload modal (type selector, file picker)

**Copy keys (samples):**
- `documents.title`: "Your documents"
- `documents.uploadCta`: "Upload document"
- `documents.status.rejected`: "Rejected"
- `documents.list.rejectionReasonLabel`: "Rejection reason"

**UX:** Status badges (pending, approved, rejected); Re-upload on rejected  
**Brand:** Trust signals on approval  
**Error state:** High level — retry CTA  
[Screenshot: Student Documents]

---

### 11.5 Student — Proof

**Route:** `/dashboard/student/proof`  
**Status:** Built

**Sections:**
- Readiness checklist (KYC, bank, school, docs, sponsor)
- Progress %
- Generate certificate CTA (when ready)
- Share section (when cert exists)

**Copy keys (samples):**
- `proof.title`: "Proof certificate"
- `proof.progress.progressLabel`: "{completed} of {total} complete"
- `proof.progress.items.kyc.label`: "KYC verification"

**UX:** Clear checklist; celebrate when complete  
**Brand:** Doculet seal on certificate  
**Error state:** High level — retry CTA  
[Screenshot: Student Proof]

---

### 11.6 Sponsor — Home

**Route:** `/dashboard/sponsor`  
**Status:** Built

**Sections:**
- Stat cards (committed, students, pending, next disbursement)
- Recent students list
- CTA: Review requests

**Copy keys (samples):**
- `sponsorCopy.dashboard.overview.totalCommitted.label`: "Total Committed"
- `sponsorCopy.dashboard.overview.cta`: "Review requests"

**UX:** Trust-building; ₦ amounts  
**Brand:** Professional, clear  
**Error state:** High level  
[Screenshot: Sponsor Home]

---

### 11.7 Sponsor — Students

**Route:** `/dashboard/sponsor/students`  
**Status:** Built

**Sections:**
- Tabs: Pending invites, Active sponsorships
- Invite cards (Accept/Decline)
- Student table (email, amount, status)

**Copy keys (samples):**
- `sponsorCopy.students.title`: "Your students"
- `sponsorCopy.students.tabs.pending`: "Pending requests"
- `sponsorCopy.students.tabs.active`: "Active sponsorships"

**UX:** Clear actions; trust-forward  
**Brand:** Professional  
**Error state:** High level  
[Screenshot: Sponsor Students]

---

### 11.8 University — Pipeline

**Route:** `/dashboard/university/pipeline`  
**Status:** Built

**Sections:**
- Pipeline / queue of students
- Student cards (tier badge, program, docs count)
- Review actions

**Copy keys (samples):**
- `universityCopy.pipeline.title`: "Verification queue"

**UX:** Efficient; SLA visibility  
**Brand:** Authoritative  
**Error state:** High level  
[Screenshot: University Pipeline]

---

### 11.9 Admin — Operations

**Route:** `/dashboard/admin/operations`  
**Status:** Built

**Sections:**
- Review queue
- Queue items (type, priority, assignee)
- Review actions (approve, reject, request info)

**Copy keys (samples):**
- `adminCopy.operations.title`: "Operations"

**UX:** Operational; precise  
**Brand:** Trust-forward  
**Error state:** High level  
[Screenshot: Admin Operations]

---

### 11.10 Agent — Home

**Route:** `/dashboard/agent`  
**Status:** Built

**Sections:**
- Stat cards (students, commissions, earned)
- Recent activity
- CTA: Invite student

**Copy keys (samples):**
- `agentCopy.dashboard.overview.cta`: "Invite student"

**UX:** Helpful; motivating  
**Brand:** Knowledgeable  
**Error state:** High level  
[Screenshot: Agent Home]

---

### 11.11 Partner — Home

**Route:** `/dashboard/partner`  
**Status:** Built

**Sections:**
- Stat cards (students, verified, API keys)
- CTA: View students

**Copy keys (samples):**
- `partnerCopy.dashboard.overview.cta`: "View students"

**UX:** Business-oriented  
**Brand:** ROI-focused  
**Error state:** High level  
[Screenshot: Partner Home]

---

*Document ends. For implementation details, see [src/config/copy](src/config/copy), [src/config/nav](src/config/nav), and [.worktrees/partner-overview/.clawbot/PRODUCT-FULL.md](.worktrees/partner-overview/.clawbot/PRODUCT-FULL.md).*
