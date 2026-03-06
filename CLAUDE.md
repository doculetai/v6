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

### Token Quick-Reference (for design consistency)
- **Border-radius:** sm=8px, md/DEFAULT=16px, lg=24px, full=9999px
- **Typography scale:** caption 12px/16px, body 14px/20px, heading-3 16px/20px, heading-2 20px/24px
- **Shadows:** sm (badges/inline) → default (cards/dropdowns) → md (modals) → lg (sidesheets) → overlay (full-screen)
- **Icon sizes:** nav=24px, inline=20px, small=16px — Phosphor Duotone only, weight="duotone" always
- **Role accents:** Student #2B39A3, Sponsor #15803D, University #0369A1, Admin #C2410C, Agent #6D28D9, Partner #0F766E
