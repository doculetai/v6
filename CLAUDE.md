# Doculet.ai V6 — Development Conventions

## Project Overview
Fintech/edtech platform connecting students, sponsors, and universities with proof-of-funds verification.
6 roles: student, sponsor, university, admin, agent, partner.

## Stack
Next.js 16, React 19, Supabase (auth + storage), Drizzle ORM, tRPC, Tailwind CSS 4, shadcn/ui (new-york), Sentry, Resend, Mono, Dojah, Paystack, Vitest, Playwright.

## Architecture

### File Structure
```
src/
  app/                        # Next.js App Router
    (auth)/                   # Auth routes (login, signup, reset)
    (marketing)/              # Public pages (landing, pricing)
    dashboard/                # Protected dashboard
      [role]/                 # Role-parameterized layout
    certificate/[token]/      # Public certificate verification
  components/
    ui/                       # shadcn/ui primitives
    layout/                   # Section, Container, Grid, Stack
    brand/                    # Brand-specific components
    [role]/                   # Role-specific components
  config/
    copy/                     # All UI strings per role
    nav/                      # Nav config per role
  db/
    schema/                   # Drizzle schema files (one per domain)
    queries/                  # Typed query functions using Drizzle
    index.ts                  # Drizzle client singleton
    migrate.ts                # Migration runner
  server/
    routers/                  # tRPC routers (one per domain)
    context.ts                # tRPC context (Drizzle + Supabase session)
    trpc.ts                   # tRPC init, middleware, procedures
    root.ts                   # Root router combining all routers
  lib/
    auth/                     # Supabase auth helpers
    email/                    # Resend + react-email templates
    hooks/                    # Custom React hooks
    utils/                    # Utility functions (cn, formatCurrency, etc.)
    types/                    # Shared TypeScript types
  trpc/
    client.tsx                # tRPC React client setup
    server.ts                 # tRPC server-side caller
tests/
  unit/                       # Vitest unit tests
  e2e/                        # Playwright E2E tests
  fixtures/                   # Typed test fixtures matching DB schema
```

### Key Patterns

**Server Components by default** — only `'use client'` when needed for interactivity

**Page pattern:**
```
page.tsx (Server, async) → fetches via tRPC server caller
  └─ *-page-client.tsx ('use client') → receives data as props, handles interactions
       └─ sub-components
```

**tRPC data fetching:**
```typescript
// Server Component (page.tsx)
const data = await api.student.getProfile();

// Client Component
const { data } = trpc.student.getProfile.useQuery();
const mutation = trpc.student.updateProfile.useMutation();
```

**Drizzle queries:**
```typescript
// src/db/queries/students.ts
export async function getStudentProfile(db: DrizzleDB, userId: string) {
  return db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
    with: { sponsorships: true, documents: true }
  });
}
```

**tRPC router:**
```typescript
// src/server/routers/student.ts
export const studentRouter = createTRPCRouter({
  getProfile: protectedProcedure
    .output(StudentProfileSchema)
    .query(async ({ ctx }) => {
      return getStudentProfile(ctx.db, ctx.session.user.id);
    }),
});
```

**Max 400 lines per file** — split when larger

## Design System

### Colors
- Obsidian Blues palette via CSS variables
- Semantic tokens only (`bg-background`, `text-foreground`, `bg-primary`)
- Never raw Tailwind colors
- Dark mode: `dark:` variants on everything
- `@custom-variant dark (&:where(.dark, .dark *));` MUST be in globals.css

### Typography
- Responsive: `text-sm md:text-base lg:text-lg`
- No arbitrary pixel sizes

### Spacing
- T-shirt sizes: xs(4px), sm(8px), md(16px), lg(24px), xl(32px)
- Use layout components, not raw `space-y-*`

### Layout Primitives (MANDATORY for dashboard)
- Dashboard pages (`src/app/dashboard/**`) MUST use content-primitives:
  - PageShell, Section, Container, Grid, Stack, PageHeader from `@/components/layout/content-primitives`
- NEVER use raw `<section className="mx-auto max-w-...">` or `<div className="grid grid-cols-...">` for page-level layout.
- Enforced by `npm run layout-check` and `scripts/swarm/layout-audit.sh`.

### Icons
- Phosphor Duotone only (`@phosphor-icons/react`) — no other icon libraries
- Always use `weight="duotone"` on icon JSX
- Nav: 24px, Inline: 20px, Small: 16px

## Coding Standards

### TypeScript
- Strict mode, no `any` types
- No `@ts-ignore`, `@ts-nocheck`, `eslint-disable`
- Proper interfaces for all data structures
- Zod schemas for all tRPC inputs/outputs

### tRPC Conventions
- One router per domain: `student.ts`, `sponsor.ts`, `university.ts`, `admin.ts`, `agent.ts`, `partner.ts`
- `publicProcedure` for unauthenticated endpoints
- `protectedProcedure` for authenticated (checks session)
- `roleProcedure('student')` for role-gated endpoints
- Input validated with Zod schemas
- Output typed with Zod schemas (never `any`)

### Drizzle Conventions
- Schema in `src/db/schema/` — one file per domain (e.g., `users.ts`, `documents.ts`)
- All relations declared in schema files
- Queries in `src/db/queries/` — pure functions, no side effects
- Never raw SQL unless absolutely necessary
- Always use `ctx.db` from tRPC context — never instantiate Drizzle directly in components

### Components
- Every async operation: loading + error + empty state
- Every form: Zod validation + react-hook-form + tRPC mutation
- Every page: `export const metadata` for SEO
- Every route segment: matching `error.tsx` boundary
- Every layout: `<Suspense>` wrapping async children
- All interactive elements: keyboard accessible with `focus-visible` rings
- WCAG 2.1 AA contrast minimum
- `cn()` utility for class merging

### Layout & Copy (MANDATORY)
- Dashboard layout: use PageShell, Section, Grid, Stack, PageHeader — never raw section/div with mx-auto max-w- or grid grid-cols-.
- All copy: from `src/config/copy/` or primitivesCopy — never hardcoded in JSX.

### No Mocks, No Stubs (MANDATORY)
- NEVER use `vi.mock()`, `jest.mock()`, `msw`, or any mocking library
- All test data: typed fixtures in `tests/fixtures/` matching real DB schema
- If code can't be tested without a mock → restructure the code
- Pure query functions in `src/db/queries/` are testable without mocks

### Images & Links
- `next/image` for all images
- `next/link` for internal navigation
- No inline styles

## Dev Scripts

- `npm run dev` — Next.js (Turbopack)
- `npm run check` — lint + typecheck + tests + layout-check (parallel)
- `npm run layout-check` — enforce content-primitives in dashboard (fails on raw layout patterns)
- `npm run design-check` — layout-audit + copy-audit (design framework enforcement)
- `npm run test` — Vitest unit tests
- `npm run test:e2e` — Playwright E2E
- `npm run db:generate` — Drizzle generate migrations
- `npm run db:migrate` — run migrations
- `npm run db:push` — push to Supabase
- `npm run db:studio` — Drizzle Studio

## Git Conventions
- Conventional commits: `type(scope): message`
- Types: feat, fix, chore, docs, test, refactor, style, perf
- No `Co-Authored-By` lines
- No `git add -A` — add specific files
- Pre-commit: `npm run check`

## Author
Goldmayo Daniel / doculet.ai — NO AI attribution anywhere

## Responsive Standards (MANDATORY)
- Mobile-first always — default styles mobile, sm:/md:/lg: for larger
- Test at: 375px, 390px, 768px, 1024px, 1440px
- Touch targets: 44×44px minimum
- No horizontal scroll ever
- Tables → cards on mobile
- Modals → full-screen on mobile

## Core Principles
- **Simplicity First**: minimum code for current task
- **No Laziness**: find root causes, no temporary fixes
- **Minimal Impact**: only touch what's necessary

## Feature Shipping Checklist (MANDATORY)

Every feature follows this skill sequence before merge:

| Stage | Skill | When |
|-------|-------|------|
| Before building | `/frontend-design` | Any new page or major UI |
| During development | `/audit` | After first working version |
| During development | `/clarify` | When copy feels vague or off-brand |
| During development | `/normalize` | After integrating with design system |
| Before merge | `/product-owner` | Required — GO verdict needed to ship |
| Final pass | `/polish` | Before opening PR |

**`/product-owner` is the merge gate.** It evaluates 9 lenses: persona fit, scope drift, copy compliance, role-awareness, trust signals, emotional goal, copy voice, visual quality, and user journey completeness. A NO-GO blocks the PR.

When `/product-owner` returns findings, use these impeccable skills to fix them:
- Copy Voice issues → `/clarify`
- Visual Quality issues → `/audit` then `/normalize`
- User Journey gaps → `/harden` or `/onboard`
- Persona Fit issues → `/clarify` + `/critique`
- Emotional Goal drift → `/delight` or `/distill`

---

## Design Context

### Users
6 roles using the platform for proof-of-funds verification in international education:
- **Student** — Anxious, hopeful. Job: prove they can afford their program. Context: Nigerian students preparing for university enrollment.
- **Sponsor** — Cautious, needs trust. Job: fund education and stay accountable. Sub-types: corporate (audit-first), parent (emotional), self-funded.
- **University** — Busy, needs bulk ops. Job: process applications efficiently.
- **Admin** — Methodical, risk-aware. Job: operate the platform safely.
- **Agent** — Entrepreneurial. Job: help students through the process.
- **Partner** — Technical, ROI-focused. Job: embed Doculet in their institution.

### Brand Personality
**Bold, Modern, Confident.** Nigerian-market fintech that feels like a trusted institution, not a startup experiment. Voice per persona: warm/encouraging (student), clear/professional (sponsor), efficient/authoritative (university). Obsidian Blues palette, Doculet seal on certificates.

### Emotional Goals
- **Confidence + Calm** when viewing status, balances, verification state
- **Progress + Achievement** when completing milestones, receiving certificates
- Both moods coexist: the interface celebrates forward motion while maintaining institutional composure

### Aesthetic Direction
- **Tone:** "Safe & in good hands" — bank-grade authority, warm not clinical. Like a private banker's portal, not a SaaS dashboard.
- **Reference:** Wise + Revolut (consumer fintech warmth, friendly, clear financial flows). Stripe Dashboard (clean, precise, credible) for data hierarchy.
- **Anti-reference:** Generic SaaS dashboards (cookie-cutter Bootstrap/template, flat gray-on-white monotony). Overly playful apps (rounded bubbly UI, gradients, emojis, cartoon illustrations). Veriff (clinical, sterile).
- **Colors:** Warm white `#FDFCFA` base. Brand blue `#2B39A3` (logo) as signature. Role-tinted active states (see Role Accents below). No pure white/black.
- **Role Accents (active nav colour per role):** Student `#2B39A3`, Sponsor `#15803D`, University `#0369A1`, Admin `#C2410C`, Agent `#6D28D9`, Partner `#0F766E`.
- **Typography:** IBM Plex Sans (UI primary — set globally). IBM Plex Mono (amounts, codes). IBM Plex Serif (certificates only). Section headers: 10-11px, ALL CAPS, tracked wide.
- **Sidebar:** Stripe-clean white with warm tint. Role accent only on active item (border + bg wash + text). Section labels muted gray. Logo at full 36px PNG, not icon substitute.
- **Unforgettable element:** Role-tinted sidebar (each user's dashboard feels uniquely theirs) + Doculet seal on certificates.
- **NO EMOJIS** — never in UI, copy, code comments, or commit messages. Zero tolerance.

### Design Principles
1. **Trust first** — Exact amounts in NGN, masked BVN/NIN, clear status badges. Every UI element should signal stability.
2. **Role-aware** — Each role has a distinct accent colour. The dashboard feels personalised without being chaotic.
3. **Persona-appropriate voice** — Copy from `config/copy/`; never hardcode.
4. **Precision over decoration** — No glassmorphism, no gradient text, no card grids. Clean lines, deliberate spacing.
5. **Layout primitives mandatory** — PageShell, Section, Grid, Stack, PageHeader; never raw mx-auto max-w-.
6. **Accessibility** — WCAG 2.1 AA, 44x44px touch targets, focus-visible rings.
7. **No emojis anywhere** — UI, copy configs, code, commits. The brand is institutional, not casual.

### State Vocabulary

**Error / failure states — matter-of-fact + precise:**
- State the failure, name the reason, name the required action. Never apologetic, never vague.
- Pattern: `[What failed] · [Why] · [What to do]` — e.g. "Verification failed · BVN mismatch · Resubmit with correct NIN."
- Tone: bank letter, not customer service apology. The student is an adult; give them information.
- Never use: "Something went wrong", "Oops", "Sorry about that", "We couldn't quite…"

**Success / milestone states — clear acknowledgment, not celebration:**
- Mark completion with a distinct visual transition: a status heading, a state card, a filled step indicator.
- Not a party (no confetti, no "Woohoo!"), not a whisper (not just a toast). A firm institutional "done."
- Certificate issued = dedicated success surface. Think: bank account opened confirmation, not startup confetti.
- Pattern: State the achievement plainly. "Your proof of funds certificate is ready." Then the action.

**Pending / review states — calm confidence:**
- "Under review" not "Waiting." "Processing" not "Hang tight."
- Conveys institutional process, not uncertainty. The student should feel held, not left hanging.

### Certificate Sharing (Nigerian mobile context)
Four sharing paths, in priority order:
1. **WhatsApp direct share** — primary CTA on mobile. Use `https://wa.me/?text=` intent with the verification URL. Most Nigerian students will use this first.
2. **Public verification URL** — shareable link any embassy or institution can open to confirm authenticity.
3. **Download PDF** — formal attachment for email or portal submission. Primary CTA on desktop.
4. **Doculet email** — Doculet sends the cert directly to the institution on the student's behalf.

Mobile cert page: WhatsApp share is the primary button. Desktop cert page: Download PDF is the primary button.

### Relational Sponsor Framing
Always use relational language — who is the funder to the student, not the payment mechanism.
- "I am paying for my education" (not "Self-funded")
- "Someone is sponsoring me" (not "Third-party sponsor")
- "A company is sponsoring me" (not "Corporate sponsor")

This applies to: onboarding wizard copy, summary cards, tRPC output display labels, and email templates.
Never expose structural terms (escrow, third-party, corporate) in student-facing UI.

### Journey Cohesion (mandatory for student dashboard)

All four journey surfaces must stay in sync at all times:

| Surface | Must derive from |
|---------|-----------------|
| Sidebar nav items | `src/lib/journey/student.ts` stage model |
| Overview progress tracker | Same stage model — never independent state |
| Quick action CTA | Next incomplete stage from the same model |
| Emails + notifications | Same stage `id` and `label` as the sidebar |

**The rule:** `src/lib/journey/student.ts` is the single source of truth.
- Stage IDs and labels are defined there — all other surfaces reference them, never redefine.
- A sidebar item exists because a journey stage exists. Not the other way around.
- The sidebar's active/completed/upcoming state = the stage's `status` field from `computeStudentJourney()`.
- The quick action CTA = `journeyState.nextAction` — same object, no duplicate logic.
- Email subject/body references the stage label directly from the stage model copy.

**Anti-patterns to catch in review:**
- Sidebar label that doesn't match a stage label → cohesion break
- Progress tracker showing different completion % than sidebar completed count → break
- CTA pointing to a different step than `journeyState.nextAction` → break
- Email saying "Step 3: Upload documents" when the stage is labelled "Documents" → break

### Banking Verification Path
Two equal options are presented upfront — student chooses based on preference:
- **Option A — Connect bank (Mono API):** Real-time balance pull. Instant result. Primary for students with supported banks.
- **Option B — Upload bank statement:** Student uploads PDF/image. OCR extracts balance and account info. Goes to admin review.

UI pattern: Side-by-side choice cards (not a dropdown, not a fallback message). Both options are first-class.
After OCR on Option B: show the student a preview of extracted data (name, account, balance) before submitting to admin. This is the "OCR review" step the user described.

### Student Notification Model
Three notification channels when admin approves/rejects a document or verification:
1. **In-app status badge** — document card or journey step updates its status on the student's next visit. Always present.
2. **Email** — transactional email: "[Document type] approved" or "[Document type] requires resubmission." Always sent.
3. **Notification bell** — sidebar/header bell icon shows unread count. Student can dismiss.

No WhatsApp notifications for review outcomes (only used for certificate sharing).

### First-Time Student Empty State
New students land on the Overview (no redirect to onboarding wizard).
- All journey steps shown as "upcoming" (locked visually but visible — they can see the full path ahead).
- A prominent "Get started" CTA block at the top, above the journey steps.
- The overview is the orientation surface. Students should understand what the platform does before being sent anywhere.
- Never auto-redirect a new user. Show them the destination first, then guide them.

### Review / Pending Copy
No stated SLA for admin review. Copy must not promise a timeline.
- Use: "Under review", "Your submission has been received", "We will be in touch"
- Never use: "within 24 hours", "within 2 business days", "shortly", "soon"
- The student should feel held, not given a false promise.

### UX & Interaction Patterns

**Scroll fatigue — tabs within page:**
- Long pages use tabs, not infinite scroll or accordions.
- Which pages use tabs: Documents (Embassy docs / Bank statement), Proof (Certificate / Share / History), Overview (Journey / Activity), Settings (Profile / Security / Notifications).
- Tab labels: short nouns, sentence case. No verbs ("Upload" → "Bank statement"). No truncation.

**Mobile navigation — bottom tab bar:**
- On mobile, the sidebar is hidden. Primary journey steps appear as bottom tabs (app-style).
- Bottom tabs: Overview, Documents, Banking, Proof, Settings. Support via floating button.
- Sidebar is desktop-only. Mobile = bottom bar. Never both at once.

**Sheet vs page on mobile:**
- Quick actions (phone verification, confirm choice, small forms) → bottom sheet.
- Multi-step flows (KYC, document upload, OCR review, banking setup) → full dedicated page.
- Rule: if it has more than 2 steps or requires a camera/file picker → full page.

**Document upload UX — all three patterns combined:**
1. Student selects file → thumbnail preview shown with filename.
2. Student reviews preview, then taps confirm to upload.
3. Upload starts: inline progress bar on the card.
4. For multi-document sections: a queue — student adds all files, reviews list, submits all at once.
- Never auto-upload on selection. Always preview + confirm.

**Page density — full context:**
- Each page shows the full picture: current status, history, next action, related context.
- Students should not need to visit multiple pages to understand their situation.
- One clear primary CTA per page. Supporting info below it.

**Loading states:**
- Page/section loading → skeleton placeholders (match the layout shape).
- Button/mutation loading → spinner inline in the button, button disabled.
- Never a full-page spinner. Never a blank white flash.

**Section labels (uppercase group headers):**
- Use sparingly — only when content below is a genuinely different type.
- Not every card group needs a label. Let typography hierarchy do the separation first.
- When used: 10–11px, ALL CAPS, tracked wide, muted-foreground colour.

**Locked/upcoming journey steps:**
- Visible but muted — reduced opacity. No lock icon. No tooltip explaining why it's locked.
- Students can see the full journey ahead from day one. Nothing hidden.
- Clicking a muted step → no action. It simply does not respond.

**Form validation:**
- Inline error below each field on blur (when user leaves the field) and on submit.
- Error message is precise: name the field, name the problem, name the fix. "School is required" → "Select a school to continue."
- No summary banner at the top. No toast for form errors.

**Step navigation within a journey page:**
- Every journey page has explicit Back and Continue/Next buttons.
- Sidebar also works for navigation (non-linear access).
- Back/Next are not wizards — they navigate between independent pages, not state machines.

**Amount display:**
- Always full NGN with naira symbol and commas: ₦ 1,500,000.
- Never abbreviated (no ₦ 1.5M, no 1500000).
- Use IBM Plex Mono for all monetary values.

**Document card display — two formats by context:**
- List view (default): file type icon + filename + status badge + upload date. One row per document.
- Featured/detail view: thumbnail preview card with status badge overlaid bottom-left.
- Status badges: pending (muted), approved (success), rejected (destructive). No custom colours.

**Breadcrumbs:**
- Only on deeply nested pages (e.g. document detail, individual sponsorship view).
- Top-level journey pages (Documents, Banking, Proof) do not need breadcrumbs — sidebar shows location.

**Animations:**
- Purposeful micro-interactions only. Navigation between pages is instant (no transition).
- What animates: step completion (stage fills in), status badge change (fade to new state), sheet open/close (slide).
- Duration: 150–200ms. Ease-out. Nothing loops. Nothing decorates.
- Respect `prefers-reduced-motion` — all animations off when set.

**Multi-application (application switcher):**
- Students can have multiple parallel applications (different schools, different sponsors).
- A switcher UI (dropdown or list) lets them navigate between applications.
- Each application has its own journey state, documents, and cert.
- Design implication: the URL and tRPC context must always carry an `applicationId`. Never assume one application per student.

**OCR review step (bank statement upload path):**
- After OCR processes the uploaded statement, student reviews four extracted fields before admin submission:
  1. Account name (must match their legal name)
  2. Account number
  3. Bank name
  4. Available / average balance
- Student can correct any field before confirming. If they correct, flag for admin attention.
- Only after student confirms → submission goes to admin queue.

**KYC failure handling:**
- On Dojah rejection: show the failure reason precisely (blurry ID, expired document, name mismatch, etc.).
- Do NOT offer immediate retry. Route directly to manual review queue.
- Copy: "[Reason]. Your verification has been referred for manual review. We will be in touch."
- Admin sees the failure reason + student's submitted images in the review queue.

**School / program change policy:**
- Student can change school and program at any time, as long as no sponsor has confirmed a commitment.
- Once a sponsor confirms → school selection is locked. Contact support to change.
- A change after onboarding resets the proof-of-funds target amount (re-derived from new program tuition).

**Help / Support access:**
- Floating help button, bottom-right corner, on every page.
- On click: opens a support sheet (not a new page, not a new tab).
- Sidebar Support nav item is removed. Floating button is the sole access point.

**Dark mode:**
- Light mode only for now. Dark mode tokens exist in the system but are not a current requirement.
- Do not add `dark:` variants to new components unless explicitly asked.

**Sidebar identity (student):**
- Initials avatar (circle with 1–2 initials) + full name + "Student" role badge.
- Avatar background: role accent colour (`#2B39A3` for student). Text: white.
- Position: top of sidebar, above nav items.

**Sponsor invite flow:**
- Student enters sponsor's name + email address in a form.
- Doculet sends a branded invite email. Sponsor clicks link, registers, and connects.
- Student sees invite status (sent / accepted / committed) on the overview sponsor card.

**Sponsor card (overview):**
- A dedicated card on the Overview page (not a separate nav page).
- Shows: sponsor name, sponsor type (relational label), committed amount in NGN, relationship status.
- Status vocabulary for sponsorship: Invited → Accepted → Committed → Released.

**Document status vocabulary (4 states — use exactly these labels):**
- `pending` — "Pending" — uploaded, in admin queue. Muted badge.
- `under_review` — "Under review" — admin has opened it. Warning/amber badge.
- `approved` — "Approved" — accepted. Success/green badge.
- `rejected` — "Rejected" — declined, resubmission required. Destructive/red badge.

**Rejection reason visibility:**
- Full admin note is shown verbatim on the student's document card.
- Show it in a clearly labelled block: "Reason:" followed by the admin's note.
- Copy pattern: "Rejected · [Admin reason] · Upload a replacement below."

**Document re-submission:**
- Replace in place. The rejected card shows the rejection reason + an "Upload replacement" button.
- Student uploads a new file from the same card. No navigation away, no delete-and-restart.
- After replacement: status returns to `pending`, rejection reason is archived (not deleted).

**Document empty state:**
- A dashed-border upload area: document type label, one-line description of what's needed, Upload button.
- Pattern per document type: "Admission letter · Official acceptance letter from your institution · [Upload]"
- Not a greyed-out list row. The dashed area is an explicit invitation to act.

**Activity feed content (Overview › Activity tab):**
Four event types, in reverse-chronological order:
- Document events: uploaded, approved, rejected (per document type).
- KYC milestones: phone verified, identity verified (each tier separately).
- Sponsor events: sponsor invited, sponsor accepted, sponsor committed funds.
- Certificate events: certificate issued, certificate shared.
- Each event: icon + label + relative timestamp. No avatar, no body text.

**Certificate visual content (all four elements present):**
1. Student full legal name + university name + program name.
2. Verified amount — `₦ 1,500,000` — in IBM Plex Mono, prominently sized.
3. Doculet official seal + issue date + unique certificate ID (for verification URL).
4. Sponsor name and relational type ("Sponsored by Emeka Obi · Family sponsor").
- Certificate is a styled printable surface (not a plain card). IBM Plex Serif for the title/name. Seal image asset, not icon.

**Mobile bottom tab bar (4 items, no overflow):**
- Tabs: Overview, Documents, Proof, Settings.
- Banking is accessed within the Documents tab (tab within Documents page), not a separate tab.
- Support via floating help button. No Support tab.
- Active tab: role accent (`#2B39A3`). Inactive: muted-foreground.

**Multi-application switcher:**
- A dedicated Applications page. Student navigates there to see all applications as cards.
- Each card: school name, program, current stage, status badge.
- To switch: tap the card. Context switches to that application.
- Current application shown in the sidebar header below the identity block (small label: "Application: University of Lagos").

**Notification bell (grouped by type):**
- Bell dropdown groups notifications into three sections: Documents, Sponsor, System.
- Each group has a "Mark all as read" action. Individual notifications are not individually dismissable.
- Notification row: icon + label + relative timestamp + unread dot.
- Clicking a notification navigates to the relevant page/section.

**Post-certificate dashboard state:**
- All journey steps show as completed in the sidebar and progress tracker.
- Proof page becomes the primary nav focus (visually elevated, not just an item).
- Quick action CTA changes to: "Share your certificate."
- Overview shows a persistent "certified" banner/hero card above stats — institutional acknowledgment, not a party.

**Date and timestamp formatting:**
- Events within the last 24 hours: relative — "2 hours ago", "yesterday at 14:32".
- Events older than 24 hours: absolute — "04 Mar 2026" (day-month-year, no time unless relevant).
- Never ISO format (2026-03-04) in student-facing UI. Use readable English date.
- Use IBM Plex Mono for dates shown alongside monetary values.

**Confirmation dialogs — required for exactly these 4 actions:**
1. Deleting an uploaded document.
2. Cancelling an outstanding sponsor invite.
3. Changing school or program after onboarding.
4. Logging out.
- All other destructive actions: act immediately, offer undo via toast if reversible.
- Dialog pattern: title + one-sentence consequence + Cancel + Confirm (destructive variant).

**Document requirements — university-configured:**
- Required document types vary by university. Each partner university configures their own list.
- The Documents page derives the required list from the student's selected school.
- Architecture implication: `student.listDocuments()` must join against university document requirements. No hardcoded document type list in the frontend.
- If a student has no school selected: show a prompt to select a school before documents can be managed.

**Session timeout UX:**
- Warning dialog appears 2 minutes before session expiry.
- Dialog: "Your session is about to expire. Continue?" with an Extend Session button.
- If ignored: redirect to login. Form state is lost (not persisted across session boundary).
- Auto-extend on activity is NOT used — hard expiry for security.

**Page-level error boundaries:**
- Only the failed section shows an error state — not the entire page.
- Error card: what failed (section name) + reason (if available) + Retry button.
- Other sections continue to show their loaded content.
- Never a full-page white error screen. Always partial recovery.

**Proof page — History tab (all four content types):**
1. Verification access log: who accessed the public cert URL, when, from where (if available).
2. Share events: WhatsApp share, PDF download, email sent, link copied — each timestamped.
3. Journey completion timeline: when each step completed (KYC on [date], docs approved on [date], cert issued on [date]).
4. Certificate validity / renewal info: expiry date if applicable, renewal instructions.

**Student Settings page scope (3 sections via tabs):**
- Profile tab: update email address (triggers re-verification flow).
- Security tab: change password or manage auth method.
- Notifications tab: toggle which events trigger email and/or bell notifications.
- Phone number is NOT in settings — it is managed via the KYC verification sheet in the journey.

**Document version history — all versions shown:**
- When a student re-uploads after rejection, all versions are visible in chronological order.
- Most recent version is at the top. Earlier rejected versions shown below, clearly labelled "Rejected — [date]".
- Student can see the full submission history per document type.

**Document requirements list (top of Documents page):**
- A clear requirements summary at the top of the Documents page before any upload area.
- Format: "Your university requires N documents. [doc type 1], [doc type 2], [doc type 3]."
- Each required document type becomes a separate upload target (dashed area or card) below.
- Requirements are sourced from the university config, not hardcoded.

**Overview primary CTA — mid-journey state:**
- A prominent banner above the stats section: "Continue your verification."
- Contains: current step name, one-line description of what's needed, one CTA button.
- This banner is the highest-priority element on the overview when the journey is incomplete.
- Disappears when all steps are complete (replaced by the certified banner).

**File upload constraints:**
- Bank statements and formal letters: PDF only. Reject image-only uploads for these types.
- Identity documents (ID cards, passport photos): JPG or PNG accepted.
- Max file size: 10MB per file.
- Max files per upload session: 5 files at once (queue pattern).
- Show file type and size validation errors inline before the upload starts.

**Feed and list pagination — page-based:**
- Activity feed, document history, and all long lists use numbered page pagination (1, 2, 3…).
- No infinite scroll. No "load more" button.
- Default page size: define per context (suggest 20 items). Always show total count.
- Page controls: previous / next arrows + current page number. No jump-to-page input needed.

**Trust signal placements (3 locations):**
1. Certificate page: Doculet seal (image asset), verification URL, certificate ID.
2. Banking and KYC steps: provider logos inline — "Secured by Mono", "Identity verification by Dojah".
3. Sidebar footer: subtle persistent note — encryption or regulatory reference. Small, muted. Never loud.
- Do not repeat trust signals throughout the dashboard. These 3 locations are the complete set.

**Touch gestures (mobile):**
- Swipe down to dismiss bottom sheets (standard iOS/Android pattern).
- Pull to refresh on the Overview page and Activity feed.
- Swipe left on a document card to reveal contextual actions: Delete / Replace.
- No other swipe gestures. No horizontal scroll carousels. No long-press menus.

**Logo click behavior:**
- Clicking the Doculet logo in the sidebar navigates to the student overview (dashboard home).
- Logo always acts as the "home" link. Never navigates to the marketing site from within the dashboard.

**Offline / connection lost:**
- A persistent top banner appears while offline: "You are offline. Changes may not save."
- Banner disappears automatically when connection is restored.
- tRPC calls that fail while offline show their normal inline error states (section-level, not page-level).

**Tooltip usage:**
- Tooltips appear only on icon-only buttons (no visible text label).
- If a button has a visible text label: no tooltip.
- Tooltip content: verb phrase describing the action. "Delete document", "Copy link", "Download PDF".
- Do not use tooltips for contextual help or explanations — use info text or description copy instead.

**Agent student management:**
- Agents have a Students list page: all assigned students shown as cards or table rows.
- Each student card: name, school, current journey stage, last activity date.
- Tap to open a student's journey summary — a read-only status view, not a full dashboard mirror.
- Agent cannot take actions on behalf of the student (no impersonation in agent role).

**Sponsor overview primary action:**
- Primary CTA: fund a student — initiates a Paystack payment flow for a specific sponsorship.
- Sponsor overview surfaces: student name, school, program, committed amount, payment status.
- The "Fund" button is the most prominent action. Everything else is context.

**Copy length rules (MANDATORY for student-facing UI):**
- Card descriptions: maximum 2 lines. If it needs more, the copy is wrong — rewrite it shorter.
- Banners and alert messages: maximum 1 line.
- Button labels: maximum 3 words. Prefer 1–2 words. "Upload document" not "Upload your document now".
- Section labels (uppercase headers): maximum 2 words.
- Page headings (H1): match the nav label exactly. No embellishment.

**Page headings — every page has an H1:**
- Every dashboard page has a visible H1 heading that matches its sidebar nav label exactly.
- Documents page → H1 "Documents". Proof page → H1 "Proof of Funds". Settings → H1 "Settings".
- This is both an accessibility requirement and a navigation anchor.

**Empty states — all roles:**
- Pattern: icon (Phosphor Duotone, 32px) + heading + one CTA button. Nothing more.
- Student role: "You have no documents yet. [Upload your first document]"
- Sponsor role: "No active students. [Fund a student]"
- University: "No pending applications. [Import students]"
- Admin: "Queue is clear." (no CTA — this is a success state, not an action state)
- Agent: "No students assigned. [Invite a student]"
- Never: lengthy explanations, illustrations, multi-CTA empty states, or humor.

**SCOPE BOUNDARY — proof of funds only (not a payments platform):**
- Doculet verifies and certifies that funds exist. It does NOT move, disburse, or commit money.
- There are no "disbursement" flows, "fund release" flows, or cash transfer UIs for students.
- Paystack is used only for: certificate processing fees (student pays Doculet for the cert).
- Sponsors do NOT transfer money through Doculet. They are linked as the source of funds, not the sender.
- Any language like "commit funds", "release payment", "disburse to student" — remove from UI copy entirely.

**Status badge accessibility:**
- Two signals only: colour + text label. The word is the primary signal; colour reinforces it.
- Pattern: `<Badge variant="success">Approved</Badge>` — no icon inside the badge.
- Ensure all badge background/text colour combinations meet WCAG AA contrast (4.5:1 minimum).

**Copy-to-clipboard confirmation:**
- Icon-only. The copy button icon changes to a checkmark (CheckCircle, Phosphor Duotone) for 2 seconds, then reverts.
- No toast. No sound. The button itself is the only feedback.
- Applies to: certificate ID, verification URL, invite link, account number.

**Sponsor document visibility:**
- Sponsors have read-only access to the student's uploaded documents and their statuses.
- Sponsor sees: document type, status badge, upload date. They cannot download or open the files.
- This read-only view builds trust — sponsor can see the process is real without accessing private documents.

**Certificate validity:**
- Certificates have an expiry date set per university program (linked to the program's enrollment deadline).
- The cert's validity window is configured by the university, not by Doculet.
- Proof History tab shows: expiry date + "Contact your university to renew" if expired.

**Profile avatar (two sources, combined):**
- If KYC (Dojah) has captured a verified face photo: use that as the avatar. No separate upload needed.
- If no KYC photo yet: show initials avatar (role-accent background, white initials).
- Students can optionally upload a profile photo in Settings > Profile — this overrides the initials but not the KYC photo.
- Priority order: KYC photo → uploaded photo → initials.

**Language / locale:**
- English only. No i18n infrastructure required.
- Copy lives in `src/config/copy/` — per-role, not per-language.
- Nigerian locale for formatting: ₦ (naira symbol), DD MMM YYYY dates, comma as thousands separator.

**University admin primary jobs (split equally):**
1. Queue review: process incoming student document submissions for their institution.
2. Programme management: configure which programs exist, their document requirements, tuition amounts, and cert validity windows.

**Admin primary jobs (split equally):**
1. Verification queue: review KYC escalations, document approvals/rejections, OCR corrections.
2. Platform operations: monitor transaction health, fraud signals, API usage, platform fees.

**Badge counters — 4 locations:**
- Bell icon in sidebar header: unread notification count.
- Sidebar nav items: contextual count for pending actions (e.g. "Documents" shows (2) if 2 are under review).
- Mobile bottom tab bar: same badge counts as sidebar equivalents.
- Page H1 area: inline count in heading context — "Documents · 2 pending" — not inside the H1 text itself.

**Admin queue ordering:**
- FIFO — oldest submission first. No priority scoring, no urgency flagging.
- Admin works through the queue in submission order. Simple, fair, auditable.
- Admin can filter (by type, status, date range) but cannot reorder. Filter narrows; it doesn't prioritise.

**Partner dashboard primary view:**
- Two panels: API health + student pipeline summary.
- API health: requests this period, quota used, error rate, billing estimate.
- Student pipeline: students started, completed each stage, certificate issued — conversion funnel view.

**Self-funded student journey (branching):**
- Self-funded students skip the sponsor invite step. Banking replaces it.
- Their journey: Onboarding → Select school → Identity (KYC) → Banking → Documents → Proof.
- Banking step: both Mono API connection and document upload are offered as equal options (same as sponsored banking step).
- Architecture implication: `STAGE_ORDER` in `src/lib/journey/student.ts` must branch on `fundingType`. Self-funded = no `sponsor` stage, banking stage is present. Sponsored = `sponsor` stage present.
- Never show a self-funded student a "No sponsor" empty state. The banking step IS their funding proof.

**Tablet sidebar (768px – 1024px):**
- Collapsed by default: icons visible, labels hidden.
- Expands on hover (desktop pointer) or tap (touch tablet) to show full labels.
- Full sidebar width on expand: same as desktop. Returns to icon-only on mouse-out or tap-away.
- Transition: slide-expand, 150ms. Icon size stays at 24px in both states.

**Certificate PDF — server-generated:**
- Doculet generates the PDF server-side. Student taps "Download PDF", receives a file.
- PDF uses correct fonts: IBM Plex Serif for the certificate title/name, IBM Plex Sans for body, IBM Plex Mono for the amount.
- Doculet seal is an embedded image asset, not an SVG icon.
- Browser print (Ctrl+P) is not a supported path. No print stylesheet required.

**Admin queue actions (5 total):**
1. Approve — accept the submission. Student notified.
2. Reject — decline with a reason (shown verbatim to student). Student notified.
3. Flag for follow-up — hold without approving/rejecting. Internal note only. Student not notified.
4. Request additional document — structured request for a specific doc type. Student notified via email + bell.
5. Escalate to senior review — pass to another admin. Internal handoff only.
6. Approve with note — approve with an internal audit note attached. Note not shown to student.

**Global search / command palette:**
- Admin and agent roles only: Cmd+K opens a command palette.
- Searchable: student names, submission IDs, school names, navigate to any admin page.
- Students do not have global search. Per-page filters are sufficient for their use case.

**Corporate sponsor:**
- Not yet implemented. Personal sponsors only in current scope.
- Design for personal sponsors only. Do not create corporate-specific UI flows yet.
- "Corporate sponsor" type label exists as metadata but triggers no different UX path.

**Data export (Settings > Profile):**
- "Download my data" option in Settings > Profile tab.
- Triggers a server-side job. Student receives an email when the ZIP is ready (usually within minutes).
- ZIP contains: profile data, uploaded documents, verification history, activity log, certificate if issued.
- Not instant — show a "We're preparing your export" confirmation and send it via email link.

**Navigation guard (mid-upload):**
- If student navigates away while an upload is in progress: browser native `beforeunload` confirm dialog.
- No custom modal. The browser default is sufficient and requires no extra implementation.
- After upload completes successfully: navigation guard is removed immediately.

**KYC ID image visibility:**
- A thumbnail of the captured ID document is shown in the KYC status card after submission.
- Thumbnail is small (e.g. 80×52px), not fullscreen. Shows confirmation of what was captured.
- Thumbnail is shown permanently in the KYC status card (not just during review).

**Manual KYC review state (two surfaces):**
- Journey sidebar step: "Under review" badge (amber, same pattern as document under review).
- Verification page: a status card reading "Identity verification referred for manual review. We will be in touch." No action available.
- Both surfaces must agree — consistent status vocabulary.

**Account deletion:**
- Available in Settings > Security tab: "Delete account" — a prominent but non-primary action.
- Requires a confirmation flow: type "DELETE" to confirm. Then a final confirm button.
- Effect: all personal data removed, certificate invalidated, verification URL returns 404.
- Show a warning: "This action is permanent. Your proof-of-funds certificate will be invalidated."

**School deactivated mid-journey:**
- If a student's selected school is removed from the platform: they receive an email notification + an alert banner on their overview.
- The school selection step reverts to incomplete. Journey is paused at that step.
- Student must select a new school. All previously approved documents for the old school remain (not deleted).
- The alert banner persists on the overview until the student selects a new school.

**Verification tiers (3-tier model):**
- Tier 1: Phone verification — OTP to verified mobile number.
- Tier 2: Identity — Dojah KYC (ID document + face capture). Manual review on automated failure.
- Tier 3: Banking — Mono API connection OR bank statement upload. Both are equally valid paths.
- Each tier must be complete before the next is accessible.
- Journey sidebar shows tier progress, not a percentage.

**Multi-sponsor (multiple sponsors per application):**
- A student can invite multiple sponsors to one application.
- Each sponsor has their own invite card. Combined sponsor amounts contribute to the proof target.
- If one sponsor cancels: their contribution is removed, target recalculates, journey may pause if funds fall short.
- UI: each sponsor is a separate card on the overview. Not combined into one card.

**Sponsor invite expiry:**
- Invite links expire after 7 days.
- If expired: invite card shows "Invite expired" with a "Resend invite" action.
- Student is notified by email when a sponsor invite expires without being accepted.

**Certificate revocation:**
- Admin can revoke an issued certificate.
- Effect: certificate page shows a "Revoked" state. Public verification URL returns an invalid/revoked state.
- Downloaded PDF copies are not recalled — but the verification URL is the authoritative source.
- Student is notified by email when their certificate is revoked, with reason.

**Proof-of-funds target:**
- The target amount is set by the university per program — not necessarily the advertised tuition.
- Universities configure their own proof threshold (may include living expenses, fees, etc.).
- The target is shown to the student from the moment they select a school: "You need to prove ₦ X,XXX,XXX."
- If a student's school is changed, the target recalculates to the new program's threshold.

**Certificate issuance — manual admin trigger:**
- Certificates are NOT auto-issued. Admin must manually review the complete package and press "Issue certificate."
- Admin reviews: all documents approved + all verification tiers complete + proof target met + no active flags.
- On issuance: student is notified immediately (email + bell + cert page updates).
- Design implication: there is a "Ready to issue" queue in admin — students whose packages are complete but cert not yet issued.

**Mono bank connection failure — automatic fallback:**
- If Mono API fails or times out: student is automatically moved to the document upload path.
- No choice prompt. The system handles the failure silently and presents the upload option.
- A brief inline message explains: "Bank connection unavailable. Upload your bank statement instead."
- Student does not need to understand why Mono failed.

**Admin impersonation:**
- Admin can fully act on behalf of a student (not read-only).
- The impersonating admin sees an orange banner: "Impersonating [Student Name] — all actions are audit-logged."
- Student is NOT notified in real time. Student receives an email after the session ends: "An admin accessed your account on [date] to [action]."
- Every action taken during impersonation is written to the audit log.

**University bulk student import (3 methods):**
1. CSV upload: university downloads a template, fills in student name/email/program/enrollment date, uploads.
2. Manual entry: one student at a time via a form. For small cohorts.
3. API push: university SIS pushes records via the partner API. For technical integrations.
- All three result in the same student record. Method is a preference, not a capability gate.

**Agent commissions:**
- Managed entirely offline. No in-app commission tracking, no commissions page, no payment flows.
- Agents see their student pipeline (how many students, what stage) but no financial tracking.
- Do not build any commission, earnings, or payout UI for agents.

**Verification page identity:**
- Page title: "Verification" — H1 matches nav label exactly.
- URL slug: `/dashboard/student/verification`
- This page hosts the 3-tier verification journey: phone → identity → banking.
- Each tier is a section on the page, not a separate page.

**Sensitive data masking (BVN, NIN, account numbers):**
- Always masked: last 4 digits visible, rest replaced with asterisks.
- Display pattern: "BVN: ****4521", "NIN: *****3407", "Account: ****8821"
- Masking applies everywhere — overview cards, KYC status, settings. Never show full value post-submission.
- During the OCR review step only: full account number is shown briefly for student to confirm, then masked.

**Help / support — chat widget:**
- Floating help button opens a third-party chat widget (Intercom, Crisp, or equivalent).
- Not a custom modal. Not a FAQs sheet. The chat widget handles ticketing, FAQs, and live/async responses.
- Design implication: no custom support form or support page in the codebase. The widget is the support surface.

**Fraud detection UI (admin):**
- Every submission card in the admin queue shows a fraud risk score: Low / Medium / High.
- Colour-coded: Low = muted, Medium = warning/amber, High = destructive/red.
- High-risk submissions are visually prominent — not buried in the queue.
- Admin can still approve or reject a high-risk submission; the score is advisory, not blocking.

**Public certificate verification page:**
- URL: `/certificate/[token]` — publicly accessible, no login required.
- Displays the full certificate: same design as the student's cert view, but read-only.
- If revoked: shows a "Revoked" state replacing the cert content.
- If expired: shows the cert with an "Expired" overlay/banner.
- No Doculet account required to view. Designed for embassies and universities.

**Sponsor registration flow (from invite link):**
1. Sponsor clicks invite link → landing page explaining what Doculet is and who invited them.
2. Email + password signup (no OAuth).
3. Name + phone number form.
4. Sponsor profile confirmed → lands on their dashboard showing the student's proof request.
- Sponsor's onboarding is minimal and purposeful. No wizard. No journey steps.

**Expired certificate state:**
- Certificate page shows an "Expired" banner at the top of the cert.
- The cert content remains fully visible (student can still reference it).
- A renewal CTA is shown: "Renew certificate" — initiates a re-verification or re-issuance flow.
- Public verification URL shows the cert with an "Expired" indicator.

**KYC re-verification:**
- Student can resubmit KYC from the Verification page after a rejection or identity change.
- The Verification page shows the current tier status with a "Resubmit" action on failed/rejected tiers.
- Subject to attempt limits (enforced server-side, not in the UI).

**University programme management (3 methods):**
1. Self-serve form: University staff navigate to Programs page, add/edit programs via a form.
2. Doculet admin manages: universities request changes via support; Doculet admin makes updates.
3. CSV import: universities upload a programs CSV for batch creation and updates.
- All three are valid paths. The form is the primary self-serve option.

**Phone number display format:**
- International format throughout: "+234 801 234 5678"
- Applies to: sidebar identity, verification status, sponsor cards, activity feed, admin views.
- No local format (08xx). No normalisation to local on display.

**Certificate analytics (admin):**
- Admin can view verification access count and timestamps for any student's certificate.
- Shown on the student's record in the admin view: list of verification accesses with timestamp and (if available) requester context.
- This is the same data the student sees in their Proof History tab, with admin seeing all students.

**Sidebar quick action button — removed:**
- The sidebar quick action ("Continue application") is removed.
- The overview page's "Continue your verification" banner is the sole next-step CTA.
- Sidebar is navigation only — no embedded CTAs.
- This change also removes the `quickAction` field from `studentNavConfig`.

**Awaiting cert issuance state ("Under final review"):**
- When a student has completed all journey steps but admin hasn't issued the cert yet:
- Journey tracker: all steps show complete (green/filled).
- Proof page: shows "Under final review — your proof of funds package is complete. We are preparing your certificate."
- No action available for the student. No countdown. Calm, institutional holding state.
- Admin sees this student in the "Ready to issue" queue.

**Bank connection display (Verification page, Tier 3):**
- Shows: bank name + masked account number + verified balance + connection date.
- Pattern: "Access Bank · ****8821 · ₦ 2,450,000 verified · Connected 04 Mar 2026"
- Balance is shown in full — this is the proof amount, showing it is the whole point.
- For document-upload path: same display after OCR + admin approval. Balance is the admin-verified figure.

**Schools browse page:**
- A dedicated `/dashboard/student/schools` page with search + filter by country/program + select action.
- Students can browse all partner institutions before committing.
- Once a school is selected from this page, the selection is saved and reflected in the journey.
- This page is accessible from the sidebar nav and from the onboarding form's school selector.

**OCR failure — manual entry fallback:**
- If OCR cannot extract readable data: show a manual entry form with 4 fields (account name, account number, bank name, balance).
- Message above the form: "We could not read this document automatically. Enter your details below."
- Admin reviews all manually-entered submissions with extra scrutiny (flagged as manual in the queue).
- Student is not told admin will review it differently — just that they need to enter the details.

**Email branding:**
- Branded HTML emails: Doculet logo at top, warm white (#FDFCFA) background, brand blue (#2B39A3) accents.
- Font: IBM Plex Sans (web-safe fallback: Arial).
- Tone matches role: warm/encouraging for student emails, clear/professional for sponsor and university emails.
- All transactional emails include: student name, relevant action, a CTA button, and the Doculet footer.

**Onboarding — condensed to one page (no wizard):**
- The 4-step onboarding wizard is replaced by a single-page form.
- One screen: school selector + program selector + funding relationship selector.
- On submit: student is taken directly to their overview (journey now at stage 1).
- Design implication: `onboarding-page-client.tsx` is replaced entirely. No step state, no hero stepper, no multi-card layout.

**Proof target progress (Verification page):**
- A progress bar on the Verification page shows: "₦ 1,850,000 / ₦ 2,500,000 target"
- Bar fills proportionally. When target is met: bar fills completely, label changes to "Target met."
- Target is sourced from the university program config (set by university, not tuition amount necessarily).
- Shows combined total from all sponsors + self-funded banking.

**Admin platform analytics (4 metrics on overview):**
1. Verification queue: pending count + under review count + escalated count.
2. Student pipeline: funnel showing students at each journey stage platform-wide.
3. Certificates issued: count with a trend sparkline (today / this week / this month).
4. Fraud flags: high-risk submission count + recent alert list.

**University student roster:**
- A Students page in the university dashboard: full list of enrolled students.
- Columns: student name, program, current journey stage, document status, cert status.
- Filter by: program, stage, document status. Export to CSV.
- University sees all enrolled students — not just those in the review queue.

**Sponsor type labels (use exactly these strings):**
- Self-funded (no sponsor): "Self-funded"
- Individual/family sponsor: "Family sponsor"
- Company sponsor: "Corporate sponsor"
- On the certificate: "Self-funded" or "Sponsored by [Name] · Family sponsor" or "Sponsored by [Company] · Corporate sponsor"
- In the onboarding form: relational framing ("I am paying / Someone is sponsoring me / A company is sponsoring me") → maps to these labels on save.

**404 page (inside dashboard):**
- Full branded page: Doculet logo, "Page not found" heading, one-sentence message, "Go to Overview" button.
- Not a section-level error card. A dedicated page with the dashboard layout shell.
- No automatic redirect. Student sees the 404 page and must click to return.

**Replacing an approved document:**
- Blocked. Student sees: "This document is already approved. Contact support if you need to replace it."
- No upload action available on approved document cards.
- To replace: student must contact support. Admin processes the replacement manually.

**Admin student detail layout:**
- Two-column layout.
- Left column: student profile (name, contact, avatar, verification tier badges, fraud risk score, proof target progress).
- Right column: submission queue items (documents, KYC, banking — each as a reviewable card with approve/reject actions).
- Both columns scroll independently on longer records.

**SCOPE CORRECTION — document types:**
- Doculet does NOT handle embassy application documents. The platform is proof-of-funds only.
- The only document students upload is a bank statement (when using the document upload path instead of Mono API).
- CORRECTION: the Documents page tab design was previously noted as "Embassy docs / Bank statement tabs" — this is WRONG. The Documents page is the banking path only (bank statement upload + OCR review).
- Any copy, tab labels, or section headers referencing "embassy documents" must be removed.

**Redesigned student sidebar nav (6 items):**
```
Overview
Onboarding          ← single-page form: school + funding type
Verification        ← /dashboard/student/verification (T1 phone, T2 identity, T3 banking)
Documents           ← bank statement upload (only used when Mono API not available)
Proof of Funds      ← certificate: issue, share, history
Settings
```
- Schools browsing is accessible from the Onboarding page's school selector and from a linked /schools page.
- No separate "Schools" nav item — schools are part of the Onboarding step.
- Support: floating help button only — no nav item.

**Verification page — 3 stacked tier cards:**
- Three vertically-stacked cards. One per tier.
- Tier 1 (Phone): active by default on first visit. Subsequent tiers muted (reduced opacity) until previous is complete.
- Tier 2 (Identity): unlocks after T1 complete.
- Tier 3 (Banking): unlocks after T2 complete. Shows banking choice (Mono or upload) inside the card.
- Completed tier card: shows status + masked data summary (no action button). Collapsed but visible.
- Proof target progress bar appears above the tier cards: "₦ X / ₦ X target"

**Applications page layout:**
- Cards layout — one card per application.
- Each card: school name, program name, current journey stage badge, certificate status.
- "New application" button at the top.
- No table view. Cards even for many applications.

**School edit (from Overview):**
- An "Edit" icon/link on the school card on the Overview page opens a sheet.
- Sheet contains: school selector + program selector + confirm button.
- Same fields as the Onboarding page. Change only allowed if no sponsor has confirmed.
- On confirm: proof target recalculates to new program's threshold.

**Student name usage:**
- First name only in UI copy, greetings, page headers: "Welcome back, Kemi."
- Full legal name in formal contexts: certificate, account identity block in sidebar header, admin views.
- Legal name source: student enters at signup → KYC (Dojah) confirms and may update it.
- If KYC updates the name: notify student and prompt them to review.

**Staff account management:**
- Doculet super-admin invites staff (admin, university staff) via email. No self-signup anywhere.
- Staff receive an invite link, set up their account, and land on their role-appropriate dashboard.
- No in-app team management UI needed at this stage.

**Password reset flow:**
- Primary: email link — student enters email, receives a link, clicks it, sets new password on a Doculet page.
- Fallback: OTP to verified phone number — if email is inaccessible.
- Students can choose their reset path from the login screen.

**Settings IS the profile — no separate profile page:**
- There is no student profile page distinct from Settings.
- Settings > Profile tab contains all editable account details.
- Settings > Security tab: password, auth.
- Settings > Notifications tab: notification preferences.
- Settings > Profile tab also contains: "Download my data" and "Delete account" actions.

**Legal name source — dual:**
- Student enters full legal name during signup.
- KYC (Dojah) extracts the legal name from the ID document and may confirm or update it.
- If KYC name differs from signup name: flag for student review.

**Overall journey progress — overview progress bar only:**
- A progress bar appears at the top of the Overview page only. Not in the sidebar.
- No step counter ("3 of 6"). The bar communicates progress visually without counting.
- Sidebar communicates progress via filled/muted states on nav items — no redundant counter.

### Token Quick-Reference (for design consistency)
- **Border-radius:** sm=8px, md/DEFAULT=16px, lg=24px, full=9999px
- **Typography scale:** caption 12px/16px, body 14px/20px, heading-3 16px/20px, heading-2 20px/24px
- **Shadows:** sm (badges/inline) → default (cards/dropdowns) → md (modals) → lg (sidesheets) → overlay (full-screen)
- **Icon sizes:** nav=24px, inline=20px, small=16px — Phosphor Duotone only, weight="duotone" always
- **Role accents:** Student #2B39A3, Sponsor #15803D, University #0369A1, Admin #C2410C, Agent #6D28D9, Partner #0F766E
