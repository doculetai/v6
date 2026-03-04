# Doculet.ai — Visual Standards Checklist

> Every page built must pass ALL items before PR merge.
> Reviewer: check each box. Any unchecked item = PR blocked.

---

## Accessibility & Structure

- [ ] **Page has h1 heading** — one per page, wrapped in proper `<h1>` or aria-equivalent. Subheadings use `<h2>`, `<h3>` in order. No skipping levels.
- [ ] **Keyboard navigation works** — all interactive elements reachable via Tab. Focus order is logical (top-to-bottom, left-to-right). No keyboard traps.
- [ ] **Focus rings visible** — all interactive elements show `focus-visible` ring on keyboard focus. Ring uses `ring-ring` semantic token.
- [ ] **WCAG 2.1 AA contrast** — all text meets 4.5:1 contrast ratio against background. Large text (18px+ bold or 24px+) meets 3:1. Check in both light and dark mode.
- [ ] **Aria labels on icons** — icon-only buttons have `aria-label`. Decorative icons have `aria-hidden="true"`. Status badges have descriptive text for screen readers.
- [ ] **Touch targets** — all interactive elements are minimum 44x44px touch target (WCAG 2.2). On mobile, buttons/links have adequate spacing.

## States

- [ ] **Loading state** — skeleton loader that matches the exact shape of final content. Cards show card-shaped skeletons. Lists show list-row skeletons. Numbers show number-width rectangles. Never a generic spinner.
- [ ] **Empty state** — illustration (or icon) + title + description + primary CTA button. Title explains what belongs here. Description tells user how to populate it. CTA is the next action. Examples:
  - "No documents uploaded yet" + "Upload your first document to start building your proof." + [Upload Document]
  - NOT "No data found" or "Nothing here"
- [ ] **Error state** — error message (human-readable, not stack trace) + retry button + "Contact support" link. Each section can error independently. Uses `error.tsx` boundary per route segment.
- [ ] **Populated state** — real data wired via tRPC. No mock data, no placeholder arrays, no `Array(5).fill()`.

## Mobile & Responsive

- [ ] **Mobile-first** — default styles target 375px. Breakpoints added with `sm:`, `md:`, `lg:` for larger.
- [ ] **No horizontal scroll** — at any viewport width (375px, 390px, 768px, 1024px, 1440px). Test by resizing browser.
- [ ] **Tables → cards on mobile** — data tables render as stacked cards below `md:` breakpoint. Each card shows key info with clear labels.
- [ ] **Modals → full-screen on mobile** — dialogs/sheets use `max-sm:h-full max-sm:w-full` or equivalent full-screen treatment below `sm:`.
- [ ] **Touch targets 44px min** — all buttons, links, checkboxes, and interactive elements meet 44x44px minimum on touch devices.
- [ ] **Tested at 5 widths** — 375px, 390px, 768px, 1024px, 1440px. No layout breaks at any width.

## Dark Mode

- [ ] **All colors use semantic tokens** — `bg-background`, `text-foreground`, `bg-primary`, `text-primary-foreground`, `bg-muted`, `text-muted-foreground`, etc. Never raw Tailwind colors (`bg-blue-500`).
- [ ] **Dark mode tested** — toggle dark mode and verify: all text readable, all backgrounds appropriate, no white flashes, images/illustrations adapt or have appropriate contrast.
- [ ] **`dark:` variants on everything** — every background color, text color, border color, and shadow that differs in dark mode has an explicit `dark:` variant.
- [ ] **Globals has custom variant** — `@custom-variant dark (&:where(.dark, .dark *));` is present in globals.css.

## Copy & Content

- [ ] **All copy from `src/config/copy/`** — no hardcoded strings in JSX. All headings, descriptions, labels, buttons, error messages, empty states, tooltips imported from role-specific copy config.
- [ ] **No placeholder text** — "TODO", "Lorem ipsum", "Coming soon", "Test", "Placeholder" are bugs. Every string must be real, context-appropriate copy.
- [ ] **Nigerian context** — amounts in ₦ (₦2,400,000), timestamps in WAT (March 4, 2026 at 14:32 WAT), phone numbers +234, identity BVN/NIN, bank names (GTBank, Access, Zenith).
- [ ] **Real example names** — Nigerian names only: Kemi Adesanya, Chukwuemeka Okafor, Adaeze Nwosu. Never John Doe, Jane Smith, Test User.

## Design System Compliance

- [ ] **Icons: Lucide only** — no other icon libraries. Sizes: nav = 24px, inline = 20px, status/small = 16px.
- [ ] **Status badges: correct colors** — Tier 1 = gray, Tier 2 = blue, Tier 3 = green with shield. Status: pending = amber, approved = green, rejected = red, in review = blue, expired = gray, escalated = purple.
- [ ] **Typography responsive** — `text-sm md:text-base lg:text-lg` pattern. No arbitrary pixel sizes. No `text-[14px]`.
- [ ] **Spacing uses layout components** — Section, Container, Grid, Stack. T-shirt sizes: xs(4px), sm(8px), md(16px), lg(24px), xl(32px). Prefer layout components over raw `space-y-*`.
- [ ] **Images use `next/image`** — no `<img>` tags. All images optimized with width/height/alt. Internal links use `next/link`, not `<a>`.

## Forms

- [ ] **Zod validation + react-hook-form** — every form has a Zod schema defining validation rules. Connected to react-hook-form via resolver.
- [ ] **Inline field errors** — validation errors appear below the field, not as toast notifications. Red text with error icon.
- [ ] **BVN/NIN validated** — 11 digits exactly, numeric only. Inline error: "BVN must be exactly 11 digits".
- [ ] **Amount inputs** — ₦ prefix shown in input. Comma formatting on blur. Stored as integer kobo.
- [ ] **Submit button loading state** — button shows spinner + "Submitting..." during mutation. Disabled while loading.

## Data Wiring

- [ ] **Real data via tRPC** — all queries go through tRPC procedures to Supabase. No mock data, no `setTimeout` delays, no hardcoded arrays.
- [ ] **Server Component fetches** — page.tsx (server) fetches data, passes to client component. Client components receive data as props, not fetch on mount.
- [ ] **Mutations handle all states** — tRPC mutations show loading, handle success (toast/redirect), handle error (inline message + Sentry.captureException).
- [ ] **Notifications created** — actions that affect other roles create notification records. Document upload → admin queue. Admin decision → student notification.

## Performance

- [ ] **No unnecessary re-renders** — client components don't re-render the entire page on state changes. Use proper key props on lists.
- [ ] **Images optimized** — `next/image` with appropriate sizes. No massive unoptimized images.
- [ ] **Lazy loading** — heavy components (charts, maps, code editors) use `dynamic(() => import(...))` or `React.lazy`.
- [ ] **Bundle size** — no unnecessary dependencies added. Check if existing utils can solve the problem before adding a package.

## Security

- [ ] **No sensitive data in client** — BVN, NIN, full account numbers never sent to client components. Only masked values (`****1234`).
- [ ] **PII access logged** — admin viewing sensitive data creates audit log entry.
- [ ] **CSRF protection** — mutations use tRPC procedures with session validation. No GET requests that modify data.
- [ ] **Input sanitized** — user input properly escaped. No XSS vectors in rendered content.

---

## Quick Reference: Color Tokens

| Purpose | Light | Dark | Token |
|---------|-------|------|-------|
| Page background | White | Near-black | `bg-background` |
| Primary text | Near-black | White | `text-foreground` |
| Muted text | Gray | Light gray | `text-muted-foreground` |
| Card background | White | Dark gray | `bg-card` |
| Primary action | Brand blue | Brand blue | `bg-primary` |
| Destructive | Red | Red | `bg-destructive` |
| Success | Green | Green | Custom |
| Warning | Amber | Amber | Custom |
| Border | Light gray | Dark gray | `border` |

## Quick Reference: Tier Badge Styles

```
Tier 1 (Identity Only):
  bg-muted text-muted-foreground border-muted
  Icon: Shield (16px, gray)

Tier 2 (Identity + Bank):
  bg-blue-50 text-blue-700 border-blue-200
  dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800
  Icon: ShieldCheck (16px, blue)

Tier 3 (Full Verification):
  bg-green-50 text-green-700 border-green-200
  dark:bg-green-950 dark:text-green-300 dark:border-green-800
  Icon: ShieldCheck (16px, green) + checkmark overlay
```

## Quick Reference: Status Badge Styles

```
Pending:     bg-amber-50 text-amber-700  dark:bg-amber-950 dark:text-amber-300
Approved:    bg-green-50 text-green-700  dark:bg-green-950 dark:text-green-300
Rejected:    bg-red-50 text-red-700      dark:bg-red-950 dark:text-red-300
In Review:   bg-blue-50 text-blue-700    dark:bg-blue-950 dark:text-blue-300
Expired:     bg-muted text-muted-foreground
Escalated:   bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300
```

## Quick Reference: Skeleton Patterns

```
Stat Card:   Rectangle (h-8 w-24) + Rectangle (h-4 w-16) stacked
Table Row:   Circle (h-8 w-8) + Rectangle (h-4 flex-1) + Rectangle (h-4 w-20)
Card:        Rectangle (h-40 w-full rounded-lg)
Text Line:   Rectangle (h-4 w-[random 60-90%])
Badge:       Rectangle (h-5 w-16 rounded-full)
Avatar:      Circle (h-10 w-10)
```
