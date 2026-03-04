# Doculet.ai — Comprehensive Product & UX Context

> **Every build agent MUST read this document before writing any code.**
> This is the single source of truth for product logic, user journeys, states, cross-persona handoffs, and Nigerian context.

---

## 1. What Doculet Is

Doculet.ai is a **Nigerian bank statement verification platform** for Nigerian students applying to US universities or seeking F-1/J-1 visas.

**The core problem**: US universities and the US Embassy don't trust Nigerian bank statements (easily faked via Photoshop, round-tripped deposits, inflated balances). Doculet verifies real-time bank data via Mono API, performs KYC via Dojah, and issues a cryptographically-signed Proof of Funds Certificate that US institutions accept.

**The core value**: A bank statement without the Doculet seal = just a PDF (untrusted). With the seal = independently verified. Universities accept it because Doculet does the hard verification work they cannot do from the US.

### What Doculet Is NOT
- NOT a visa application tool (not about the US Embassy process)
- NOT a money transfer platform (we verify, we don't move money)
- NOT a loan or investment product
- NOT a generic document management tool

---

## 2. The Three Customers

### 2a. The University (PRIMARY customer — drives adoption)
US university admissions and financial clearance offices handling Nigerian/African applicants. They receive hundreds of Nigerian bank statement PDFs per cycle with no way to distinguish real from fake. Doculet gives them a single URL to verify any student's finances in seconds.

### 2b. The Student (end user — goes through the journey)
Nigerian student admitted to (or applying to) a US university who needs to prove financial standing. They have the money but can't prove it in a format the university trusts. Doculet gives them a clear, guided process ending in a shareable Tier 1/2/3 certificate.

### 2c. The Sponsor (enabler — strengthens the certificate)
The parent, guardian, relative, employer, or NGO actually funding the student. Their bank statement shows the money. Doculet verifies THEIR bank too, making the student's certificate stronger (required for Tier 3).

---

## 3. Verification Tiers

| Tier | What's Complete | Visual | Acceptance |
|------|----------------|--------|------------|
| **Tier 1** | Student identity verified (BVN + NIN) | Gray badge | Baseline only |
| **Tier 2** | Identity + student's own bank statement verified | Blue badge | Many schools accept |
| **Tier 3** | Identity + bank + sponsor verified + documents reviewed by admin | Green badge with shield | Top-tier universities, US Embassy |

The product constantly pushes every user toward Tier 3.

---

## 4. The Full Student Journey (Step by Step)

### Stage 1: Signup & Onboarding
1. Student creates account (email/password via Supabase Auth)
2. Role is set to `student` in profiles table
3. Redirected to **onboarding wizard** (4 steps):
   - **Welcome**: Greeting with full name, "Let's get your proof of funds"
   - **Select School/Program**: Search US universities, pick target school → creates `applications` record
   - **Funding Type**: Choose how to verify funds (bank link, statement upload, sponsor, self-fund, scholarship)
   - **Action**: Summary + "Go to Dashboard" CTA
4. On completion: `student_trust_state` created with `stage: not_started`
5. **Gate**: Students without completed onboarding always redirect to `/student/onboarding`

### Stage 2: Identity Verification (KYC)
Located at `/student/verify`. Three identity methods:

**BVN (Bank Verification Number)**:
- Input: 11 digits exactly (validated client + server)
- Verification: Instant via Dojah API
- Creates `identity_verifications` record with `identity_type: bvn`
- Status flow: `pending` → `verified` | `failed`
- On success: Name match score computed, DOB extracted
- Trust points: 20 pts (BVN verified) + 4 pts (name match)

**NIN (National Identity Number)**:
- Input: 11 digits exactly
- Verification: Instant via Dojah API
- Creates `identity_verifications` record with `identity_type: nin`
- Trust points: 6 pts

**Passport**:
- Manual upload (JPG/PNG/PDF, max 10MB)
- Stored in Supabase Storage: `documents/{user_id}/passport/`
- Status: uploaded → pending admin review
- NOT instant verification (requires admin)

**States the student sees**:
- Not started: "Verify your identity to begin" + BVN/NIN input fields
- Pending: "Verification in progress..." (rare — Dojah is near-instant)
- Verified: Green checkmark + "Identity verified via [BVN/NIN]" + masked number (****1234)
- Failed: Red alert + failure reason + "Try again" button + max retry guidance
- Expired: Warning banner + "Re-verify" CTA

### Stage 3: Bank Linking
Two paths, same outcome:

**Path A: Live Bank Connection (Mono)**
1. Student clicks "Connect Bank"
2. Mono SDK widget opens (in-app modal)
3. Student selects their bank (GTBank, Access, Zenith, First Bank, UBA, etc.)
4. Student enters online banking credentials (handled by Mono, not us)
5. Mono returns auth code
6. Backend exchanges code for account details via Mono API
7. Creates `bank_connections` record (status: active) and `bank_accounts` record
8. Real-time balance pulled automatically
9. Student sees: bank name + masked account number + balance in ₦
10. Trust points: 20 pts (bank linked) + 3 pts (balance meets requirement) + 2 pts (6-month history)

**Path B: Bank Statement PDF Upload**
1. Student downloads official statement from their bank (branch or internet banking)
2. Uploads PDF to Doculet
3. Stored in Supabase Storage
4. OCR extracts: balance, transactions, account holder name, bank name
5. System verifies PDF against known bank statement templates
6. Detects tampering, inconsistencies, round-tripped deposits
7. Cross-checks account holder name against BVN
8. Creates `documents` record with `type: bank_statement`
9. Goes to admin review queue

**Mono widget states**:
- Loading: Skeleton shimmer while widget initializes
- Bank selection: Grid of Nigerian bank logos
- Credential entry: Bank-specific login form (Mono handles this)
- Processing: "Connecting your account..."
- Success: "Bank connected! Balance: ₦X,XXX,XXX"
- Failed: "Connection failed. Try again." + error reason
- Expired (75-day threshold): "Your bank connection is expiring. Reconnect."

### Stage 4: Document Upload
Located at `/student/documents`. 11 document types:

| Type | Required? | Purpose |
|------|-----------|---------|
| Bank Statement | Yes (if not Mono-linked) | Proves available balance |
| Admission Letter | Recommended | Proves university acceptance |
| Tuition Invoice | Recommended | Establishes required amount |
| Passport | Yes (for cert) | Identity document |
| Visa | No | Supporting evidence |
| Transcript | No | Academic record |
| Tax Return | No | Income source evidence |
| Sponsor Letter | If sponsored | Formal sponsorship commitment |
| Certificate/Diploma | No | Academic qualification |
| Scholarship Letter | If scholarship | Award documentation |
| Other | No | Any supporting document |

**Upload flow**:
1. Student clicks "Upload Document" → selects type from dropdown
2. File picker: PDF/JPG/PNG, max 10MB per file
3. Upload to Supabase Storage via tRPC mutation
4. Creates `documents` record: `verification_status: pending`
5. Appears in admin review queue

**Document status progression**:
```
pending → scanning → verified (counted toward proof)
         → needs_review (flagged for manual review)
         → rejected (not counted, student can re-upload)
```

**What student sees per document**:
- Pending: Amber badge "Pending Review"
- Scanning: Blue spinner "Being processed"
- Verified: Green badge "Approved" + AI confidence score
- Needs Review: Yellow badge "Under Review"
- Rejected: Red badge "Rejected" + rejection reason + "Re-upload" button

### Stage 5: Sponsor Invitation
Located on `/student/verify` page, sponsor section.

1. Student enters sponsor details: name + email + relationship + optional message
2. Creates `sponsorships` record: `status: pending`, `invite_token` generated
3. Email sent to sponsor via Resend with invitation link
4. Student sees: sponsor name + "Invited" badge + date sent
5. Invite expires in 7 days (trigger: `expire_old_invites()`)

**Sponsorship status progression**:
```
pending → invited (email sent) → accepted (sponsor clicked link)
  → signed (sponsor completed KYC + signed affidavit) → verified
OR → rejected (sponsor declined)
OR → expired (7 days elapsed)
OR → cancelled (student cancelled)
```

**What student sees**:
- Pending: "Invitation sent to [name] on [date]" + "Resend" button
- Accepted: "Sponsor has accepted! Awaiting their verification."
- Signed: Green badge "Sponsor Verified" + ₦ amount committed
- Rejected: "Sponsor declined" + option to invite someone else
- Expired: "Invitation expired" + "Resend" button

### Stage 6: Certificate Readiness & Generation
Located at `/student/proof`.

**Readiness checklist** (all must be true for Tier 3):
1. Identity verified (BVN or NIN = verified)
2. School selected (has active application)
3. Funding sufficient (verified amount >= required amount)
4. Documents uploaded (at least 1 supporting document approved)
5. Sponsor verified (optional for Tier 2, required for Tier 3)

**Certificate generation flow**:
1. Student sees readiness % and checklist
2. When ready, "Generate Certificate" button becomes active
3. On click: system collects all funding sources, computes verified amount in USD
4. Certificate created with:
   - Student name, school, program, required amount
   - Funding source breakdown (label, amount, type, verified flag)
   - Issuance date + expiration date (typically 90 days, configurable)
   - Unique certificate number: `POF-YYYY-XXXXXXXX`
   - QR code for verification URL
5. Stored in `certificates` table with status `active`
6. PDF generated and stored in Supabase Storage
7. `student_trust_state.stage` → `sealed`

**Certificate states**:
- Active: Valid, shareable (green badge)
- Expiring Soon: <14 days until expiry (amber warning)
- Expired: Past expiration date (red, needs renewal ₦40,000)
- Revoked: Admin-revoked, non-recoverable (red, contact support)

### Stage 7: Certificate Sharing
Located on `/student/proof` page, share section.

1. Student clicks "Share Certificate"
2. Enters: recipient name + email + optional expiry + optional max views
3. Creates `certificate_share_links` record with unique 32-char hex token
4. Public URL generated: `/certificate/[token]`
5. Student can copy URL, share via email, or show QR code
6. View count tracked per share link
7. Student can revoke any share link

**What the public verification page shows** (`/certificate/[token]`):
- Doculet logo + seal
- Student name + university + program
- Verification tier (1/2/3) with badge
- Verified funding amount (₦ and USD equivalent)
- Funding source breakdown
- Certificate number
- Issue date + expiration date
- QR code (self-referential)
- "Verify Another Certificate" CTA
- No authentication required

---

## 5. Trust Score System (100 Points)

```
IDENTITY (30 points max):
  BVN verified via Dojah .................. 20 pts
  Name match confirmed .................... 4 pts
  NIN provided ............................ 6 pts

BANKING (25 points max):
  Bank account linked via Mono ............ 20 pts
  Balance meets required amount ........... 3 pts
  6-month history available ............... 2 pts

DOCUMENTS (20 points max):
  Admission letter uploaded ............... 6 pts
  OCR extracted and confirmed ............. 4 pts
  Tuition invoice uploaded ................ 4 pts
  Scholarship letter uploaded ............. 6 pts

SPONSORS (25 points max):
  Sponsor verified ........................ 15 pts
  Commitment signed ....................... 10 pts
```

Trust score displayed as percentage on student dashboard: `trustScore / 100 * 100%`

### Trust Stages (Linear Progression)
```
not_started → building → ready → sealed → shared
```
- `not_started`: Fresh account, no actions taken
- `building`: Has at least 1 funding source or document
- `ready`: Meets all 4 requirements (identity, school, funding, docs)
- `sealed`: Certificate generated
- `shared`: Certificate shared with at least 1 recipient

### Verification Seal Levels (5-tier progression)
| Level | Name | Visual | Criteria |
|-------|------|--------|----------|
| 0 | Unverified | Dashed gray border | No evidence submitted |
| 1 | Self-Reported | Amber border | Student entered data manually |
| 2 | API-Verified | Blue border | At least 1 source verified via API (Mono/Dojah) |
| 3 | Reviewed | Purple border | Admin has reviewed complete package |
| 4 | Doculet-Sealed | Emerald border + amber ring | Fully verified and certified |

---

## 6. Every Screen in Every Role (Inventory)

### 6a. Student Dashboard

| Route | Page | Purpose | Data Shown | Actions | Empty State |
|-------|------|---------|-----------|---------|-------------|
| `/student` | Home | Progress overview | Trust score, funded amount vs goal, pipeline stages, recent activity, certificate status | Navigate to sections | "Welcome! Let's start building your proof of funds." + CTA to onboarding |
| `/student/onboarding` | Onboarding Wizard | First-run setup | Full name, school search, funding type options | Complete 4-step wizard | N/A (always has content) |
| `/student/schools` | Schools | Program selection | Favorite schools, primary application, similar programs, COA | Search, favorite, apply, compare | "Find your school" + search bar |
| `/student/verify` | Verification Hub | KYC + Bank + Sponsors | Trust breakdown (4 categories), bank accounts with balance, identity status, sponsorships | Add bank, verify identity, invite sponsor | "Start verifying to build your trust score" |
| `/student/documents` | Documents | Upload & track | Document list with status badges, type, upload date, AI confidence | Upload, view, re-upload rejected | "Upload your first document" + type selector |
| `/student/proof` | Proof & Certificate | Certificate management | Readiness checklist, certificate status, share links, funding breakdown | Generate certificate, share, revoke | "Complete your verification to generate a certificate" |
| `/student/support` | Support | Help tickets | Ticket list (subject, status, date) | Create ticket, add replies | "No support tickets yet" + "Create Ticket" CTA |
| `/student/settings` | Settings | Account management | Profile info, sessions, activity log, notification prefs | Update profile, manage notifications | N/A (always has profile data) |

### 6b. Sponsor Dashboard

| Route | Page | Purpose | Data Shown | Actions | Empty State |
|-------|------|---------|-----------|---------|-------------|
| `/sponsor` | Home | Overview | Verification badge, 4 KPIs (students, committed ₦, certificates, pending), student list with progress, activity | Navigate sections | "Welcome! Accept a student invitation to get started." |
| `/sponsor/students` | Students | Manage students | Invitations tab (pending), Active tab (accepted/signed), summary counts | View details, resend invites | "No students yet. Waiting for an invitation." |
| `/sponsor/students/[id]` | Student Detail | Individual student | Student header, sponsorship details, commitment list, activity timeline | Update commitment, add notes | N/A (always has student data) |
| `/sponsor/commitments` | Commitments | Financial pledges | Commitment list (student, amount ₦/USD, status, dates), total committed | View details, sign commitments | "No commitments yet." |
| `/sponsor/verify` | Verification | Sponsor KYC | 3 verification cards (Identity, Banking, Statement), status per card, expiry warnings | Complete verification steps | "Complete your verification to support students." |
| `/sponsor/documents` | Documents | Uploaded docs | Document grid with verification status | Download, view details | "No documents uploaded." |
| `/sponsor/impact` | Impact | Contribution summary | Total contributed, students helped, certificates generated | View student impact | "Your impact will show here after your first sponsorship." |

**Sponsor types** (different copy variants):
- **Individual** (parent/guardian): Personal tone, "My Student" labels
- **Corporate**: Formal tone, "Portfolio" labels, extra CAC document step in KYC

### 6c. University Dashboard

| Route | Page | Purpose | Data Shown | Actions | Empty State |
|-------|------|---------|-----------|---------|-------------|
| `/university` | Home | Overview | Pipeline stats (total/submitted/reviewing/verified), next student to review, at-risk count, activity, approaching deadlines | Navigate sections | "No students connected yet. Import or invite students." |
| `/university/pipeline` | Pipeline | Application review | Kanban board (6 columns), student cards with tier badge/funding/SLA, team assignments | Drag between statuses, assign, filter | "No applications in pipeline." |
| `/university/queue` | Review Queue | Priority actions | Prioritized list with SLA hours left, evidence completion %, document pass/fail | Click to review, prioritize | "All caught up! No students need review." |
| `/university/students` | Student List | All students | Name, email, program, status, connected date | Click to view detail | "No students connected." |
| `/university/students/[id]` | Student Detail | Individual review | Header, verification step, SLA countdown, evidence grid, reviewer notes, checklist | Approve/reject, add notes, flag fraud | N/A |
| `/university/programs` | Programs | Program management | Program cards (name, level, fees, requirements, student count, verification rate) | View, edit programs | "No programs configured." |
| `/university/reports` | Reports | Analytics | KPIs, conversion funnel, program breakdowns, trends | View breakdowns | "Reports will populate as students flow through." |
| `/university/team` | Team | Staff management | Active members, pending invitations | Invite, remove, change role | "Invite your first team member." |
| `/university/import` | Import | Bulk student add | CSV upload wizard | Upload, map columns, preview, confirm | N/A (wizard starts empty) |

**University Kanban Columns**:
```
Invited → Awaiting Proof → Proof Received → Under Review → Verified → Insufficient
```

**Badge types on student cards**:
- Auto-Verified (green): API path completed
- Info Requested (amber): Missing documents/info
- Funding Changed (blue): Balance updated since last check
- Cert Expiring (red): Certificate approaching expiry
- Updated (purple): New information added

### 6d. Admin Dashboard

| Route | Page | Purpose | Data Shown | Actions |
|-------|------|---------|-----------|---------|
| `/admin` | Home | Platform overview | 4 KPIs (reviews, fraud flags, active users, system health), audit log, activity feed | Navigate to tools |
| `/admin/queue` | Review Queue | Document/identity review | Queue items with type/priority/SLA/assignee | Assign, change priority, review |
| `/admin/documents` | Document Browser | All uploaded docs | Search/filter by status/type, preview thumbnails, AI confidence | Verify, reject, override |
| `/admin/statement-review` | Statement Review | Deep analysis tool | 3-panel: upload/mode, document preview, AI decision/actions | OCR pipeline, checklist, approve/reject/flag/escalate |
| `/admin/users` | User Management | All platform users | User table (name, email, role, status, dates) | Search, suspend/unsuspend, impersonate |
| `/admin/fraud` | Fraud Detection | Risk management | Case list (ID, student, reason, risk score 0-100, status) | Investigate, clear, escalate, suspend |
| `/admin/payments` | Payments | Transaction management | Payment table (date, student, amount ₦, status, gateway) | View details, refund |
| `/admin/audit` | Audit Log | Activity trail | Log table (timestamp, user, action, resource, details) | Search, filter, export |
| `/admin/system` | System Health | Infrastructure | Integration status (Supabase/Dojah/Mono/Paystack/Resend), uptime, latency, errors | View incidents |

**Admin Review Types**: Identity Verification, Bank Verification, Document Review, Sponsor Attestation, Certificate Generation
**Review Statuses**: Pending, In Review, Approved, Rejected, Escalated
**Review Priorities**: Normal (48h SLA), High (24h SLA), Urgent (4h SLA)

**Evidence Viewer panels** (in statement review):
- Bank Evidence: account name, institution, balance ₦/USD, last transaction, account age, statement period
- Identity Evidence: verification method, name on record, DOB, match score, photo
- Document Evidence: label, file type, size, upload date, school/program names, previous versions
- Sponsor Evidence: sponsor name/email, KYC status, pledge amount ₦/USD, relationship, attestation date

### 6e. Agent Dashboard

| Route | Page | Purpose | Data Shown | Actions | Empty State |
|-------|------|---------|-----------|---------|-------------|
| `/agent` | Home | Overview | 4 KPIs (students referred, active commissions, pending, total earnings ₦), pipeline by stage, activity | Navigate sections | "Start referring students to earn commissions." |
| `/agent/students` | Students | Caseload | Student grid (name, email, status, school, linked date, last activity) | View progress, resend invite | "No students linked yet." |
| `/agent/invites` | Invites | Invite management | Pending invitations, invite link with agent code, status per student | Copy link, resend | "Send your first invite." |
| `/agent/bulk-invite` | Bulk Invite | Mass invitations | CSV upload + email list wizard | Paste emails, customize message, send | N/A (wizard) |
| `/agent/earnings` | Earnings | Commission tracking | Ledger (date, student, amount ₦, status pending/paid), summary totals | View details, request payout, filter | "Commissions will appear as students complete verification." |
| `/agent/sponsors` | Sponsors | Sponsor relationships | (Stub — future feature) | N/A | "Coming soon." |

**Agent pipeline stages**: invited → linked → verified → funded → certified
**Commission trigger**: Student completes verification milestone → commission auto-created
**Agent visibility restriction**: "Financial details are not visible to agents"

### 6f. Partner Dashboard

| Route | Page | Purpose | Data Shown | Actions | Empty State |
|-------|------|---------|-----------|---------|-------------|
| `/partner` | Home | Overview | 4 KPIs (active programs, applications, approved, total disbursed ₦), program grid, pending apps, activity | Navigate sections | "Create your first program to start receiving applications." |
| `/partner/programs` | Programs | Program management | Program list (name, status, spots, applications, dates, eligibility) | Create, edit, close/reopen | "No programs yet." |
| `/partner/applications` | Applications | Student review | Application table (student, school, program, status, trust score %, date) | Approve/reject, request info, filter | "No applications received." |
| `/partner/disbursements` | Disbursements | Payment tracking | Ledger (student, program, amount ₦, status, reference, bank details masked) | View details, retry failed | "No disbursements yet." |
| `/partner/compliance` | Compliance | Org verification | Checklist (org verification, program eligibility, status indicators) | Complete pending items | "Complete compliance to enable disbursements." |

**Partner org types**: NGO, Foundation, Corporate, Government, Educational
**Partner Kanban columns**: Submitted → Under Review → Approved → Disbursed → Rejected
**Disbursement statuses**: Pending → Processing → Completed → Failed → Cancelled

### 6g. Shared Pages (All Roles)

| Route | Page | Purpose |
|-------|------|---------|
| `/[role]/messages` | Messages | In-app messaging between personas |
| `/[role]/notifications` | Notifications | Notification center with type badges |
| `/[role]/settings` | Settings | Role-specific settings redirect |
| `/certificate/[token]` | Public Verification | Public certificate check (no auth) |
| `/sponsor/invite` | Sponsor Invite Landing | Public page for sponsor to accept invitation |

---

## 7. Cross-Persona Handoffs

### 7a. Student Uploads Document → Admin Reviews

```
Student uploads document
  → documents record created (status: pending)
  → admin_review_queue record created (type: document_review, status: pending)
  → Student sees: "Pending Review" amber badge on document card

Admin opens review queue
  → Sees document in queue with priority + SLA
  → Opens document in evidence viewer
  → Approves / Rejects / Requests Info

  IF approved:
    → documents.verification_status = "verified"
    → Student receives notification
    → Student sees: "Approved" green badge
    → Trust score recalculated (+4-6 pts depending on type)

  IF rejected:
    → documents.verification_status = "rejected"
    → rejection_reason stored
    → Student receives notification with reason
    → Student sees: "Rejected" red badge + reason + "Re-upload" button

  IF needs_info:
    → documents.verification_status = "needs_review"
    → info request message stored
    → Student notified
    → Student sees: "Action Required" amber badge + message
```

**V5 Gap**: Admin status update had no event/notification dispatch. Listeners not registered globally. V6 must wire notifications.

### 7b. Student Invites Sponsor → Sponsor Joins

```
Student enters sponsor email + name + relationship
  → sponsorships record created (status: pending, invite_token generated)
  → Email sent to sponsor via Resend (template: sponsor_invite)
  → Student sees: "Invited" badge + date + "Resend" option

Sponsor clicks email link → /sponsor/invite?token=[token]
  → Invite landing page validates token + expiry
  → Shows: student name, school, avatar, invitation message
  → "Accept Sponsorship" CTA
  → On accept: sponsorships.status = "accepted"
  → If sponsor has no account: signup flow → then redirect back
  → If sponsor has account: login → link sponsorship

Student sees: "Sponsor accepted! Awaiting their verification."

Sponsor completes KYC (identity + bank + statement):
  → identity_verifications, bank_connections created
  → On all 3 complete: sponsorships.status = "signed" (after affidavit)

Student sees: "Sponsor Verified" green badge + committed amount ₦
  → Trust score updated (+15-25 pts)
```

**V5 Gap**: Invite landing read wrong table (`sponsor_invites` instead of `sponsorships`). Student invite writes `sponsorships`. Token model inconsistent. V6 must unify.

### 7c. Admin Reviews Everything → Issues Certificate

```
Admin reviews identity verification → approves
Admin reviews bank verification → approves
Admin reviews uploaded documents → approves
Admin reviews sponsor attestation → approves

When all criteria met:
  → admin_review_queue item: type=certificate_generation, status=pending
  → Admin clicks "Issue Certificate"
  → Certificate generated with funding breakdown
  → certificates record created (status: active)
  → student_trust_state.stage = "sealed"
  → Student notified: "Your Tier [X] certificate is ready!"
  → Student sees: certificate on /proof page with "Share" CTA
```

### 7d. University Verifies Certificate

```
University admissions officer receives student's certificate URL
  → Opens /certificate/[token] (no auth required)
  → Sees: student name, school, program, tier badge, funding amount, breakdown
  → Validates certificate is active + not expired
  → certificate_views record created (logs IP hash, user agent, referrer)

University pipeline:
  → Student card moves to "Verified" column
  → pof_verifications record updated: status = "approved"
  → University can mark student as "Enrolled"
```

**V5 Gap**: Public certificate token lookup was not implemented (returned null). Share-link expiry/max-access not enforced. V6 must implement fully.

### 7e. Agent Helps Student → Earns Commission

```
Agent invites student (email or agent code)
  → agent_students relationship created
  → Student signs up with agent code → linked automatically

Agent monitors student progress:
  → Sees pipeline stages: invited → linked → verified → funded → certified
  → Can send reminders, add notes

Student reaches milestone (verification/certificate):
  → Commission record auto-created in commissions table
  → Agent sees: new earning in /agent/earnings
  → Status: pending → paid (on payout)
```

**V5 Gap**: No commission creation path on verification/certificate completion. Commission table was read-only in app code. V6 must implement auto-creation.

### 7f. Student → University Application Sync

```
Student selects school on /student/schools
  → applications record created (status: draft/submitted)
  → University sees student appear in pipeline (Kanban)

University reviews:
  → pof_verifications created for this application
  → Reviewer approves/rejects/requests info
  → applications.status updated

Student should see updated status on /student/schools
```

**V5 Gap**: University decisions only updated `uni_students` table. Student UI reads `applications` table and never received pipeline decision sync. V6 must propagate status both ways.

---

## 8. Nigerian Context (Copy & UX Rules)

### Currency
- **Always ₦ (Naira)** as primary display: `₦2,400,000`
- Format: `₦` prefix + comma-separated thousands: `₦48,200,000`
- USD equivalent shown as secondary: `₦48,200,000 (≈ $30,125 USD)`
- Exchange rate from `exchange_rates` table, with freshness indicator
- Amounts stored as integers in kobo (divide by 100 for display)
- NEVER show `$` as primary currency for Nigerian accounts

### Identity
- **BVN** (Bank Verification Number): Exactly 11 digits, numeric only. Issued by any Nigerian bank. Verified via Dojah → Central Bank of Nigeria data.
- **NIN** (National Identity Number): Exactly 11 digits, numeric only. Issued by NIMC (National Identity Management Commission). Verified via Dojah.
- Both are **mandatory inputs** — validate on client (11 digits, numeric) AND server
- Display as masked: `****1234` (show last 4 only)

### Banks
Major Nigerian banks (all supported via Mono):
GTBank, Access Bank, Zenith Bank, First Bank of Nigeria, UBA (United Bank for Africa), Stanbic IBTC, Polaris Bank, Ecobank, Fidelity Bank, Wema Bank, Sterling Bank, Union Bank, FCMB, Keystone Bank, Heritage Bank

### Timezone
- **WAT (West Africa Time, UTC+1)** — always append "WAT" to timestamps
- Format: "March 4, 2026 at 14:32 WAT"
- 24-hour time format preferred
- Relative timestamps: "3 hours ago", "2 days ago" (for recent activity)

### Phone Numbers
- Country code: +234
- Local format: 080XXXXXXXX, 081XXXXXXXX, 090XXXXXXXX, 091XXXXXXXX
- International format: +234 80X XXX XXXX

### Names
Use realistic Nigerian names in all examples and test data:
- Kemi Adesanya, Chukwuemeka Okafor, Adaeze Nwosu, Olumide Adeyemi, Ngozi Eze
- Sponsor names: Mrs. Funke Adesanya, Chief Emeka Okafor, FundEd Corporation
- NEVER: John Smith, Jane Doe, Test User, Lorem Ipsum

### States & Cities
Lagos, Abuja (FCT), Port Harcourt (Rivers), Ibadan (Oyo), Kano, Enugu, Benin City (Edo), Warri (Delta), Calabar (Cross River), Jos (Plateau)

### Regulatory
- **NDPR** (Nigeria Data Protection Regulation) — data consent required
- **CBN** (Central Bank of Nigeria) — BVN verification authority
- **NIMC** — NIN issuing authority
- **CAC** (Corporate Affairs Commission) — for corporate sponsor verification

### Payment
- **Paystack** — payment gateway for certificate fees
- Certificate generation fee: ₦80,000
- Certificate renewal fee: ₦40,000
- Amount sent to Paystack in kobo (multiply by 100): ₦80,000 = 8,000,000 kobo

---

## 9. V5 Gaps to Fix in V6

### P0 — Blocks Core Journey
1. **Trust score formula mismatch**: Home shows 0% while Verify shows 4/100 — different calculation paths. V6: single `computeTrustScore()` function used everywhere.
2. **Public certificate token lookup broken**: `/certificate/[token]` returns null — the core sharing feature doesn't work. V6: implement `record_share_access(token)` with proper validation.
3. **Funding/banking step ID mismatch**: Proof completion logic uses `banking` in some places and `funding` in others. V6: standardize on `funding` throughout.
4. **"Generate Certificate" CTA missing**: No button to actually trigger certificate generation on the proof page. V6: wire the CTA to `certificates.generate` mutation.

### P1 — Major Flow Breaks
5. **Sponsor invite token model inconsistency**: Invite landing reads `sponsor_invites` but student writes to `sponsorships`. V6: unify on `sponsorships` table only.
6. **Admin document review has no notification dispatch**: Admin approves/rejects but student is never notified. V6: wire notification creation on every review decision.
7. **University pipeline decisions don't sync to student**: `uni_students` status updates but `applications` table (which student reads) is never updated. V6: bidirectional status sync.
8. **Exchange rate NGN→USD not displayed**: Verify page should show USD equivalent but doesn't. V6: show conversion with freshness indicator.
9. **No document OCR results shown to student**: System extracts data but never shows it. V6: display extraction summary on document card.
10. **No audit trail / activity log on student Home**: Activity feed is empty. V6: populate from `audit_logs` or synthesize from domain events.
11. **Agent commission not auto-created**: Commission table is read-only — no creation path on student milestones. V6: implement idempotent commission generation.

### P2 — Missing Features
12. **No document thumbnail/preview**: Documents show as text cards only. V6: generate thumbnails for PDFs/images.
13. **No document replace/update action**: Student can't replace a rejected document. V6: add "Replace" button on rejected docs that creates new `document_versions` entry.
14. **No document status explanation tooltips**: Status badges have no context. V6: add tooltip explaining what each status means.
15. **School selection not persisting across sessions**: Returning students lose their school selection. V6: persist in `applications` table.
16. **No certificate preview before generation**: Student can't see what the certificate will look like. V6: add preview on readiness page.
17. **No payment history visible**: Payment section always shows empty state. V6: wire to `payments` table.
18. **Share-link expiry/max-access not enforced**: Anyone with the URL can access forever. V6: enforce expiry date and max access count.
19. **Email templates not centralized in copy config**: Transactional emails use hardcoded strings. V6: centralize in `src/config/copy/emails.ts`.

### P3 — Polish
20. **Files over 400 lines**: `schools-page-parts.tsx` (526), `proof-page-client.tsx` (457), `document-card.tsx` (426). V6: split into smaller components.
21. **Inconsistent copy config keys**: Split between `student.ts`, `student-surface.ts`, `v2.ts`. V6: consolidate per role.
22. **Hardcoded fallback text in verify page**: Should come from copy config. V6: eliminate all hardcoded strings.
23. **No SMS/WhatsApp messaging**: Only email for notifications. V6: add SMS via provider for critical alerts.

---

## 10. Database Schema Summary

### Core Tables (35 total)

**Auth & Identity**: `profiles`, `identity_verifications`
**Banking**: `bank_connections`, `bank_accounts`, `bank_statements`
**Documents**: `documents`, `document_versions`
**Trust & Certs**: `student_trust_state`, `certificates`, `certificate_share_links`, `certificate_views`
**Sponsorships**: `sponsorships`
**Schools**: `universities`, `programs`, `applications`
**University Admin**: `uni_members`, `pof_verifications`
**Admin Portal**: `admin_review_queue`, `fraud_analyses`, `feature_flags`, `admin_settings`
**Partner**: `partner_organizations`, `partner_programs`, `program_applications`, `disbursements`
**Messaging**: `conversations`, `conversation_participants`, `messages`, `message_attachments`, `support_tickets`
**Audit**: `audit_logs`, `notification_preferences`
**Infrastructure**: `job_queue`, `exchange_rates`, `tenants`, `countries`, `tenant_countries`

### Key Status Enums
- **profiles.role**: student, sponsor, university, admin, agent, partner
- **profiles.status**: active, pending, suspended
- **identity_verifications.status**: pending, verified, failed
- **bank_connections.status**: active, revoked, error, pending, expired
- **documents.verification_status**: pending, auto_accepted, under_review, verified, rejected
- **sponsorships.status**: pending, invited, accepted, signed, rejected, expired, cancelled
- **applications.status**: draft, submitted, verified, rejected
- **certificates (computed)**: active, expired, revoked, expiring_soon
- **admin_review_queue.status**: pending, in_review, approved, rejected, info_requested, escalated
- **fraud_analyses.risk_level**: low, medium, high
- **pof_verifications.status**: pending, in_review, approved, rejected, conditional

### Key Relationships
- `profiles.id` → `auth.users.id` (1:1)
- `bank_connections.user_id` → `profiles.id` (many:1)
- `bank_accounts.bank_connection_id` → `bank_connections.id` (many:1)
- `documents.user_id` → `profiles.id` (many:1)
- `sponsorships.student_id` → `profiles.id` (many:1)
- `sponsorships.sponsor_id` → `profiles.id` (many:1, optional)
- `applications.student_id` → `profiles.id` (many:1)
- `applications.program_id` → `programs.id` (many:1)
- `certificates.user_id` → `profiles.id` (many:1)
- `certificates.application_id` → `applications.id` (many:1)
- `certificate_share_links.certificate_id` → `certificates.id` (many:1)
- `pof_verifications.application_id` → `applications.id` (1:1)
- `uni_members.university_id` → `universities.id` (many:1)

---

## 11. Integration Providers

| Provider | Purpose | Used By | Key |
|----------|---------|---------|-----|
| **Mono** | Bank account linking + real-time balance | Student + Sponsor | `MONO_SECRET_KEY`, `NEXT_PUBLIC_MONO_PUBLIC_KEY` |
| **Dojah** | Identity verification (BVN/NIN) | Student + Sponsor | `DOJAH_APP_ID`, `DOJAH_SECRET_KEY` |
| **Paystack** | Payment processing (certificate fees) | Student | `PAYSTACK_SECRET_KEY`, `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` |
| **Resend** | Transactional email delivery | All roles | `RESEND_API_KEY` |
| **Supabase** | Auth, database, storage, Realtime | All | `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| **Sentry** | Error tracking & monitoring | All | `SENTRY_DSN` |

### Mono Widget Integration
- Opens as in-app modal, NOT redirect
- Returns auth code on success
- Backend exchanges code for account details
- Stores: accountId, bankName, accountNumber, balance
- Connection expires after ~90 days (75-day warning threshold)
- Supported currencies: NGN (primary), GHS, KES, ZAR, EGP, USD

### Dojah Widget Integration
- Near-instant verification (synchronous response)
- Returns: verified yes/no + extracted names + DOB
- Provider: Central Bank of Nigeria data (for BVN)
- Never store full BVN/NIN — only hash (SHA-256)

### Paystack Payment Flow
1. Initialize transaction: email + amount (kobo) + reference + callback URL
2. Customer redirected to Paystack checkout
3. On success: verify transaction server-side
4. Create audit log entry
5. Amount in kobo: ₦80,000 = 8,000,000 kobo

---

## 12. Build Rules for All Agents (20 Rules)

### Copy & Content
1. **Never use placeholder copy** — all copy must use real Nigerian context. Use names like "Kemi Adesanya" and "GTBank", amounts like "₦2,400,000", not "John Doe" or "$1000".
2. **All strings from `src/config/copy/[role].ts`** — NEVER hardcode text in JSX. Even error messages, button labels, and tooltips must come from the centralized copy config.
3. **All amounts in ₦ (Naira)** — formatted as ₦2,400,000 with comma separators. Show USD equivalent as secondary only: "(≈ $1,500 USD)". Never display `$` as the primary currency.
4. **All timestamps in WAT** — format: "March 4, 2026 at 14:32 WAT". Use relative for recent ("3 hours ago"), absolute for historical.

### Visual & States
5. **Never show a blank screen** — every async operation needs a skeleton loader that matches the shape of the final content. Cards show card-shaped skeletons. Lists show list-shaped skeletons.
6. **Every page has 4 states** — loading (skeleton), empty (illustration + title + description + CTA), error (message + retry button + support link), populated (real data).
7. **Always show verification tier badges** — Tier 1 = gray badge, Tier 2 = blue badge, Tier 3 = green badge with shield icon. These appear on student cards, certificates, and pipeline views.
8. **Status badges are color-coded and consistent** — pending = amber, verified/approved = green, rejected = red, in review = blue, expired = gray, escalated = purple.

### Validation & Data
9. **BVN is always 11 digits, NIN is always 11 digits** — validate client-side (numeric, length=11) AND server-side. Show inline error: "BVN must be exactly 11 digits".
10. **Phone numbers are +234 format** — validate Nigerian phone format. Display formatted: +234 80X XXX XXXX.
11. **Amounts stored in kobo (integer)** — display in Naira (divide by 100). NEVER store amounts as floats.
12. **Never use mock data** — all queries go through tRPC to real Supabase. Test with typed fixtures in `tests/fixtures/`, never `vi.mock()` or `jest.mock()`.

### Architecture & Patterns
13. **Server Components by default** — only add `'use client'` when the component needs interactivity (forms, state, effects). Data fetching happens in server components.
14. **Page pattern: server page → client wrapper → sub-components** — `page.tsx` fetches data, passes props to `*-page-client.tsx`, which handles interactions.
15. **Max 400 lines per file** — if a component exceeds this, extract sub-components. No exceptions.
16. **Every form: Zod schema + react-hook-form + tRPC mutation** — inline errors (not toasts). Show field-level validation messages.

### Cross-Persona
17. **Every user action that affects another role must create a notification** — document upload → admin queue entry + notification. Sponsor acceptance → student notification. Admin decision → student notification.
18. **Status changes must propagate bidirectionally** — when admin approves a document, both the `documents` table AND the student-facing UI must reflect the change. No orphaned status updates.

### Security & Privacy
19. **Never display full BVN/NIN/account numbers** — always mask: `****1234`. Only store hashed values (SHA-256) in the database.
20. **All PII access must be logged** — when an admin views sensitive data (BVN, bank details, phone), create an `audit_logs` entry with justification.

---

## 13. Notification Types

| Type | Trigger | Recipients | Channel |
|------|---------|-----------|---------|
| `verification_progress` | Identity/bank verification status change | Student | In-app + Email |
| `document_reviewed` | Admin approves/rejects document | Student | In-app + Email |
| `sponsor_invited` | Student invites sponsor | Sponsor | Email |
| `sponsor_accepted` | Sponsor accepts invitation | Student | In-app + Email |
| `sponsor_verified` | Sponsor completes KYC | Student | In-app + Email |
| `certificate_issued` | Certificate generated | Student | In-app + Email |
| `certificate_expiring` | Certificate <14 days to expiry | Student | In-app + Email |
| `share_link_viewed` | Someone viewed shared certificate | Student | In-app |
| `application_status` | University updates application status | Student | In-app + Email |
| `review_assigned` | Admin assigned a review item | Admin | In-app |
| `fraud_flagged` | System detects fraud risk | Admin | In-app + Email |
| `system_health` | Integration degradation/outage | Admin | In-app + Email |
| `commission_earned` | Student milestone → agent earns | Agent | In-app + Email |
| `bank_expiring` | Mono connection approaching 75-day limit | Student/Sponsor | In-app + Email |

---

## 14. Celebration Milestones

The student journey includes 8 celebration moments (show confetti or encouraging UI):

1. **profile_complete**: "Your profile is set up! Let's verify your identity."
2. **identity_verified**: "Identity verified! You're off to a great start."
3. **first_bank_linked**: "Bank connected! We can see your real balance now."
4. **first_document**: "First document uploaded! Keep going."
5. **first_sponsor**: "Sponsor invited! They'll strengthen your proof."
6. **funding_50**: "Halfway there! 50% of your funding target verified."
7. **funding_100**: "Amazing! 100% of your funding is verified."
8. **certificate_issued**: "Your certificate is ready! Share it with your university."

---

## 15. Email Templates

| Template | Trigger | Recipient | Key Content |
|----------|---------|-----------|-------------|
| `welcome` | Account creation | New user | Welcome + next steps |
| `sponsor_invite` | Student invites sponsor | Sponsor email | Student name + school + accept CTA |
| `verification_approved` | Admin approves verification | Student | "Your [type] has been verified" |
| `verification_rejected` | Admin rejects verification | Student | Reason + re-upload CTA |
| `certificate_ready` | Certificate generated | Student | Certificate number + share CTA |
| `certificate_expiring` | 14 days before expiry | Student | Renewal CTA + amount (₦40,000) |
| `sponsor_accepted` | Sponsor accepts invite | Student | "Your sponsor has joined" |
| `bank_expiring` | 75 days after Mono connect | Student/Sponsor | Reconnect CTA |
| `weekly_digest` | Weekly cron | All active users | Summary of week's activity |
| `nudge_incomplete` | 3 days after last activity | Incomplete students | "Continue your verification" |

---

## 16. Feature Flags

| Flag | Default | Purpose |
|------|---------|---------|
| `allow_signups` | true | Enable/disable new registrations |
| `allow_sponsor_invites` | true | Enable/disable sponsor invitation flow |
| `allow_certificate_generation` | true | Enable/disable certificate creation |
| `maintenance_mode` | false | Show maintenance page to all users |
| `show_trust_score` | true | Show/hide trust score on student dashboard |
| `allow_document_upload` | true | Enable/disable document uploads |
| `allow_bank_connection` | true | Enable/disable Mono bank linking |
| `require_kyc` | true | Require identity verification before certificate |

---

## 17. Admin Configuration Defaults

| Setting | Default | Category |
|---------|---------|----------|
| Max file size | 10MB | transaction_limit |
| Max sponsor amount | $500,000 | transaction_limit |
| Certificate validity | 90 days | transaction_limit |
| Invite expiry | 7 days | transaction_limit |
| Max sponsors per student | 10 | transaction_limit |
| Session timeout | 30 minutes | general |
| Exchange rate source | exchangerate-api | general |
