# Doculet.ai — Authoritative Product Brief
## MANDATORY READING — Every agent must read this before writing a single line of code.

---

## The One-Line Summary

**Doculet verifies Nigerian bank statements — via PDF upload or live API — and stamps them with a trusted seal that US universities require for international student financial clearance.**

---

## What This Product Is NOT

- NOT a visa application tool — Doculet is NOT about the US Embassy or visa process
- NOT a money transfer platform
- NOT a loan or investment product
- NOT a generic document management tool
- NOT a work with NYSC documents — NYSC is irrelevant to Doculet

---

## The Three Customers and Their Pain Points

### 1. The University (PRIMARY customer — they drive adoption)

**Who**: US university admissions and financial clearance offices handling international applicants from Nigeria and Africa.

**Their pain points**:
- Receive hundreds of Nigerian bank statement PDFs per cycle — no way to tell real from fake
- Students submit photoshopped statements, round-tripped deposits, inflated balances
- Staff spend hours on manual verification emails back and forth with students
- Some students make it far into the process before the financial hold-up derails them
- No standardised way to verify African bank accounts — it's a black box
- Risk: enrolling a student who can't actually pay, then chasing unpaid tuition

**What Doculet gives them**:
- A single source of truth: if the student has a Doculet certificate, their finances are verified
- A public URL they can check in seconds — no emailing students
- A standardised Tier system (1/2/3) they can set policy around ("we accept Tier 3 only")
- Confidence: Doculet stands behind the verification

**The university's dashboard** (for B2B partnered universities):
- See all Nigerian applicants at their school who have Doculet certificates
- Review application pipeline (pending → under review → approved → enrolled)
- Quickly verify any student's certificate
- Bulk actions for batch processing
- Export applicant data for their own systems

**University relationship**: Two models:
1. **Public verification**: Any university can verify a certificate via the public URL — no signup needed
2. **B2B dashboard**: Universities that sign a contract with Doculet get a full dashboard. Billed in USD.
**Universities can proactively invite students** via a unique link. Students can also self-register and then select their university.

---

### 2. The Student (end user — goes through the journey)

**Who**: Nigerian student who has been admitted (or is applying) to a US university and needs to prove financial standing for the university's financial clearance process. Some students may be based outside Nigeria (UK, US, Canada, etc.).

**Their pain points**:
- University told them they need "proof of funds" — they don't know what format is accepted
- Getting a bank statement from GTBank is easy but getting the university to TRUST it is hard
- Back-and-forth emails with the admissions office asking "is my statement acceptable?"
- Sponsor (parent) might be the one with the money — need a way to involve them
- Anxiety: "I have the money but I can't prove it in a way the university accepts"

**What Doculet gives them**:
- A clear, guided process to get their finances verified
- A shareable certificate the university WILL accept
- Status tracking so they know exactly where they are in the process
- Confidence: "My funds are verified. I can move forward."

**The student's full journey**:
1. **Onboarding wizard** (4 steps): Welcome → Select university → Enter funding amount (from I-20) → Invite sponsor or proceed alone
2. **KYC**: BVN verification + NIN OR Passport (student chooses from the start) + ID document photo + face match selfie (all via Dojah)
3. **Bank verification**: Upload PDF from their bank OR connect via Mono (live)
4. **Upload supporting docs**: Admission letter, any additional evidence
5. **Pay verification fee**: ₦25,000–₦50,000 via Paystack (paid AFTER documents submitted, BEFORE admin reviews)
6. **Admin review**: Doculet team reviews everything
7. **Certificate issued**: Tier 1/2/3 certificate with public URL, PDF download, QR code
8. **Share with university**: Student shares URL, sends PDF, or triggers Doculet to email the university directly

**Diaspora students**: Students based outside Nigeria (UK, US, Canada) can use Doculet. Their primary bank must be Nigerian. They can upload a foreign bank statement as supplementary evidence alongside their Nigerian bank verification.

**Multiple universities**: Student can share their certificate with multiple universities. Certificate is not tied to one school.

---

### 3. The Sponsor (enabler — makes the student's certificate stronger)

**Who**: The person or company actually funding the student — parent, guardian, relative, employer, NGO, scholarship body.

**Relationship types**: Parent, Guardian, Relative (uncle/aunt/sibling), Corporate/Institutional (employer, NGO, scholarship).

**Their pain points**:
- Their bank statement is what actually shows the money, but no one has verified it
- Banks give official-looking statements but universities don't know which Nigerian banks to trust
- Corporate sponsors need a way to formally document their sponsorship commitment

**What Doculet gives them**:
- A way to formally verify THEIR bank statement
- Their verification strengthens the student's certificate (required for Tier 3)
- Affidavit signing to formalise the commitment

**Sponsor bank verification**:
- Sponsor can upload PDF bank statement (same flow as student)
- If sponsor has a foreign bank account (e.g., Nigerian in the UK with a UK bank): they can upload the foreign bank statement
- One sponsor per student application

**Corporate sponsor extra requirements**:
- CAC registration document (Corporate Affairs Commission — proof company is registered in Nigeria)
- Official sponsorship letter on company letterhead
- Director's BVN verification

---

## The Verification Paths (Both Are Core)

### Path A — PDF Bank Statement Upload (Primary)
Student or sponsor gets their official bank statement from their bank (branch or internet banking) and uploads the PDF. This is NOT a fallback — it is the primary path for many users.

Doculet:
- Runs OCR to extract balance, transactions, account holder name
- Verifies the PDF against known bank statement templates (GTBank, Access, Zenith, etc.)
- Detects tampering, inconsistencies, round-tripped deposits
- Cross-checks account holder name against BVN
- **Stamps with the Doculet seal**

### Path B — Live Bank Connection (Mono)
Student or sponsor connects their bank account live via the Mono widget. Doculet pulls real-time transactions and balance directly. More convenient, same result.

**If Mono fails or bank is unsupported**: App automatically falls back to PDF upload with a clear explanation. No dead end.

**Both paths produce the same outcome: a Doculet-verified statement.**

---

## The Doculet Seal — The Core Value

A bank statement without the Doculet seal = just a PDF (untrusted).
A bank statement with the Doculet seal = independently verified by Doculet.

The seal guarantees:
- The document is authentic and unmodified
- The balance is real (fraud checks passed)
- The account holder's identity is verified (BVN matched)
- A regulated entity (Doculet) stands behind it

Universities accept the seal because Doculet does the hard verification work they cannot do themselves.

---

## Verification Tiers

| Tier | What's Complete | University Policy |
|------|----------------|-------------------|
| **Tier 1** | Student identity verified (BVN + NIN/Passport) | Baseline only |
| **Tier 2** | Identity + student's own bank statement verified | Many schools accept |
| **Tier 3** | Identity + bank + sponsor verified + all documents reviewed by admin | Top-tier universities, stricter admissions |

The product constantly pushes every user toward Tier 3.

**Insufficient funds warning**: If a student's balance appears to be below what their university requires, Doculet shows a warning ("Your balance may not meet your university's requirements") but still processes the application. The university makes the final call on whether the amount is sufficient.

---

## The Certificate

**What appears on the certificate**:
- Student's full name + photo
- Verified bank balance (in ₦, formatted as ₦2,400,000)
- Verification tier (1/2/3) with the Doculet authenticated seal
- Issue date, expiry date (6 months from issue), unique certificate reference ID

**Certificate sharing methods** (all four supported):
1. Public URL — permanent link anyone can visit to view and verify
2. PDF download — student downloads and attaches to emails / uploads to university portals
3. QR code — shows on screen or prints; university scans to verify instantly
4. Doculet direct email — student triggers "Send to university" from their dashboard; Doculet emails the certificate directly

**Certificate validity**: 6 months. After expiry, student must re-submit from scratch (new application, re-upload all documents).

**Certificate analytics**: Student can see every time a university or institution verified their certificate ("MIT verified your certificate on March 4, 2026 at 14:32 WAT").

---

## Application Statuses (Full State Machine)

```
draft → submitted → under_review → approved → certificate_issued
                        ↓
                    rejected (admin rejects with reason; student re-submits)
                        ↓
                  action_required (admin sends back: "please re-upload bank statement")
                        ↓
                    expired (after 6 months; student must start new application)
```

---

## Admin Review Process

When an application is in `under_review`, the admin team performs:
1. **PDF authenticity check** — PDF matches known bank templates, no evidence of tampering
2. **BVN name cross-check** — Account holder name on statement exactly matches BVN name
3. **Round-trip deposit detection** — Flag large deposits that arrived and left within 30 days
4. **Full document review** — Admission letter, identity documents, sponsor documents all reviewed

**Admin can override automated flags** — with a full audit trail (name, timestamp, reason).

**Admin analytics dashboard**:
- Pipeline counts: submitted, under review, approved, rejected
- Fraud detection stats: flagged applications, override rate
- Revenue: total fees collected, monthly trend
- University breakdown: which schools have the most applicants

---

## Pricing and Payment

**Student fee**: ₦25,000–₦50,000 paid via Paystack.
**Timing**: Student pays AFTER submitting all documents and BEFORE admin review is triggered.
**Agent exception**: Agents can bypass payment (waive or pay on behalf of student).

**University subscription**: B2B subscription. Billed in USD (for US universities). Billed in ₦ (for other regions).

---

## Security and Session Management (CRITICAL — Must Be Visible in UI)

Every user's dashboard must show security information. This is a FINTECH product:
- **Last login location** (city, country): "Last login: Lagos, Nigeria on March 4, 2026 at 14:32 WAT"
- **Device info**: "Chrome on macOS"
- **All active sessions**: List with ability to revoke any session
- **Suspicious login alerts**: Risk-based detection:
  - Low risk (same country, new browser): Flag in UI with banner
  - High risk (new country): Block login + send email alert with revoke link

**IP tracking must be visible to the user** — not just logged in the background. Shown prominently in account/security settings.

---

## The 6 Roles (Technical)

| Role | Who | Dashboard Focus |
|------|-----|----------------|
| **Student** | Nigerian student | Onboarding, KYC, bank verification, document uploads, certificate, sharing |
| **Sponsor** | Parent/guardian/corporate | Their own KYC + bank verification, affidavit, corporate docs |
| **University** | US admissions officer | Applicant pipeline, certificate verification, bulk actions |
| **Admin** | Doculet internal team | Document review queue, fraud detection, certificate issuance, analytics |
| **Agent** | Field staff (internal) + accredited third-party agents | Manage student caseload, submit on behalf, communicate with admin |
| **Partner** | White-label API clients | API keys, usage analytics, webhook management |

**Agent assignment**: Agents see all students in their region who need assistance and claim them. Agents can submit documents on behalf, manage their caseload, communicate with admin, and bypass payment.

**Partner model**: API-only. Partners build their own UI and use Doculet's verification engine via API. Types: study abroad agencies, banks, EdTech platforms, any entity wanting to integrate verification.

---

## Notifications

| Event | Channel |
|-------|---------|
| Welcome on signup | Email (Resend) |
| Sponsor invitation | Email (Resend) |
| Application status changes | Email + In-app |
| Certificate issued | Email (with PDF + public URL) |
| Suspicious login | Email + In-app alert |
| Inactive application (day 3, 7, 14) | Reminder email |
| Certificate verified by university | In-app notification |

**Channels**: Email (Resend) + In-app notification bell + Push notifications. No SMS/WhatsApp.

---

## Nigerian Context (MANDATORY)

- **Currency**: ₦ (Naira) always — ₦2,400,000 format — never dollars in student-facing UI
- **BVN**: Bank Verification Number — exactly 11 digits — from any Nigerian bank
- **NIN**: National Identity Number — exactly 11 digits — from NIMC
- **Banks**: GTBank, Access Bank, Zenith Bank, First Bank, UBA, Stanbic, Polaris, Ecobank, Fidelity
- **Timezone**: WAT (West Africa Time, UTC+1) — "March 4, 2026 at 14:32 WAT"
- **Phone**: +234, local: 080XXXXXXXX or 090XXXXXXXX
- **States**: Lagos, Abuja, Port Harcourt, Ibadan, Kano, Enugu
- **CAC**: Corporate Affairs Commission (Nigerian company registration body)
- **NYSC**: National Youth Service Corps — NOT relevant to Doculet

---

## Copy Tone

Warm, confident, precise. Like a trusted advisor:
- "Your GTBank statement has been verified. Balance: ₦48,200,000."
- "Kemi, invite your parent or guardian to link their bank — this completes your Tier 3."
- "This student's Tier 3 certificate was issued on March 4, 2026. All checks passed."
- NEVER generic: "Document uploaded successfully." → INSTEAD: "Your bank statement is in review. We'll notify you within 24 hours."

---

## Compliance

- **NDPR**: Nigeria Data Protection Regulation compliance is required. Privacy policy, data consent on collection.

---

## Platform

- **V6**: Next.js web app (responsive — mobile-first, 375px baseline)
- **V7 (future)**: React Native mobile app reusing business logic from V6
- **Languages**: English only for now. i18n architecture in place for future Nigerian languages.
- **Dark mode**: Light mode default. User can toggle in settings.

---

## Marketing Site Pages (In Scope)

- **Homepage**: Hero + how it works + social proof (which universities accept Doculet)
- **Pricing page**: Transparent pricing — student fee + university subscription tiers

---

## Playwright Visual Audit Process (MANDATORY for All Agents)

Every page must be visually verified before moving on:
1. **After every page is built** — screenshot at 375px (mobile) + 1440px (desktop) before marking done
2. **Full wave audit** — at end of each wave, screenshot ALL pages in that wave
3. **Every PR** — Playwright screenshots run on every PR to catch regressions
4. Both mobile (375px) and desktop (1440px) for every single page

---

## What Agents Must NEVER Build

- US visa / US Embassy flows — not our scope
- Money movement / transfers — we verify, we don't move money
- Generic document uploads — every upload is typed, purposeful, explained
- Mocked or placeholder data — all data is real (Mono, Dojah, Supabase)
- Spinners — use skeletons that match the final content shape
- "No data found" — context-specific empty states with illustration + CTA
- Hardcoded copy — all strings from `src/config/copy/[role].ts`
- Emojis — NEVER use emoji characters anywhere in the UI. Only Lucide icons.
- NYSC references — not relevant to this product
