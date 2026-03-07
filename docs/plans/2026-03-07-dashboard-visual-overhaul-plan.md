# Dashboard Visual Overhaul — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current light sidebar with a dark institutional shell and upgrade stat cards, section headers, and table styles across all 6 role dashboards to match the "made." reference design using Doculet brand/role accent colors.

**Architecture:** Token-first — 6 CSS var changes in `globals.css` propagate the dark sidebar globally. Then targeted component updates: NavItemLink active state, new SparklineChart + SectionHeader UI primitives, upgraded StatCard in overview-shared.tsx, TableHead typography refinement. No new routes, no data model changes, no mock usage.

**Tech Stack:** Next.js 16, Tailwind 4 CSS vars, Recharts (already installed), Phosphor Duotone icons, shadcn/ui Card/Button primitives, Vitest for unit tests.

**Design doc:** `docs/plans/2026-03-07-dashboard-design-overhaul.md`

---

## Task 1: Dark Sidebar Tokens

**Files:**
- Modify: `src/app/globals.css` (`:root` block, lines ~114–126)

**Step 1: Open globals.css and locate the sidebar token block**

Find the comment `/* Sidebar — light/crisp with brand blue accents */` in `:root`.

**Step 2: Replace the 6 sidebar token values**

Find and replace these exact lines inside `:root`:
```css
/* Before */
--sidebar: #FDFCFA;
--sidebar-foreground: #0F172A;
--sidebar-primary: #2B39A3;
--sidebar-primary-foreground: #FFFFFF;
--sidebar-accent: #F1F5F9;
--sidebar-accent-foreground: #0F172A;
--sidebar-border: #E2E8F0;
--sidebar-ring: #2B39A3;
--sidebar-glass-bg: rgba(255, 255, 255, 0.97);

/* After */
--sidebar: #161A1D;
--sidebar-foreground: #F1F5F9;
--sidebar-primary: #2B39A3;
--sidebar-primary-foreground: #FFFFFF;
--sidebar-accent: rgba(255, 255, 255, 0.06);
--sidebar-accent-foreground: #F1F5F9;
--sidebar-border: rgba(255, 255, 255, 0.07);
--sidebar-ring: #93A6FF;
--sidebar-glass-bg: rgba(22, 26, 29, 0.95);
```

**Step 3: Verify typecheck passes**
```bash
npm run check
```
Expected: PASS (no TS errors; CSS vars are strings)

**Step 4: Commit**
```bash
git add src/app/globals.css
git commit -m "style: dark sidebar tokens — #161A1D shell, role accent preserved"
```

---

## Task 2: NavItemLink Active State on Dark Sidebar

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`

**Context:** The `NavItemLink` function (line ~384) renders active items with:
- `style`: `backgroundColor: 'var(--role-accent-bg)'` + `color: 'var(--role-accent)'`
- `className` active branch: `'font-semibold'`

On a dark sidebar, the role accent colors (e.g. student `#2B39A3`) are too dark to read as text. Switch to white text; keep the 4px left border as the sole role-accent signal.

**Step 1: Update the active `style` prop in `NavItemLink`**

Find (around line 427):
```tsx
style={isActive ? {
  backgroundColor: 'var(--role-accent-bg)',
  color: 'var(--role-accent)',
} : undefined}
```

Replace with:
```tsx
style={isActive ? {
  backgroundColor: 'rgba(255, 255, 255, 0.09)',
} : undefined}
```

**Step 2: Update the active `className` branch**

Find (around line 432):
```tsx
isActive
  ? 'font-semibold'
  : 'font-[450] text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground',
```

Replace with:
```tsx
isActive
  ? 'font-semibold text-sidebar-foreground'
  : 'font-[450] text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground',
```

**Step 3: Run check**
```bash
npm run check
```
Expected: PASS

**Step 4: Commit**
```bash
git add src/components/layout/Sidebar.tsx
git commit -m "style(sidebar): white text on dark active state, role accent in border only"
```

---

## Task 3: SparklineChart Component

**Files:**
- Create: `src/components/ui/sparkline.tsx`

**Context:** Recharts is already installed (used by `src/components/ui/area-chart.tsx`). This is a tiny `LineChart` with no axes, no tooltip, no labels — just a trend line.

**Step 1: Create the file**

```tsx
'use client';

import { Line, LineChart, ResponsiveContainer } from 'recharts';

interface SparklineChartProps {
  data: number[];
  color?: string;
  height?: number;
}

export function SparklineChart({
  data,
  color = 'var(--color-success)',
  height = 40,
}: SparklineChartProps) {
  const chartData = data.map((value, index) => ({ index, value }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

**Step 2: TypeScript check**
```bash
npx tsc --noEmit 2>&1 | head -30
```
Expected: No errors for the new file

**Step 3: Commit**
```bash
git add src/components/ui/sparkline.tsx
git commit -m "feat(ui): SparklineChart — tiny recharts trend line, no axes"
```

---

## Task 4: SectionHeader Component

**Files:**
- Create: `src/components/ui/section-header.tsx`

**Context:** Pages currently use ad-hoc `<div className="flex items-center justify-between ...">` for the "section title + right-side control" pattern. This component standardizes it.

**Step 1: Create the file**

```tsx
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ title, action, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between pb-3 border-b border-border mb-5', className)}>
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {action != null && (
        <div className="flex items-center gap-2">{action}</div>
      )}
    </div>
  );
}
```

**Step 2: TypeScript check**
```bash
npx tsc --noEmit 2>&1 | head -30
```
Expected: No errors

**Step 3: Commit**
```bash
git add src/components/ui/section-header.tsx
git commit -m "feat(ui): SectionHeader — title + optional right-side action slot"
```

---

## Task 5: Upgrade StatCard in overview-shared

**Files:**
- Modify: `src/app/dashboard/[role]/_components/overview-shared.tsx`

**Context:** The existing `StatCard` is used by all overview pages. It supports `label`, `value`, `sub`, `accent`, `href`. We're adding optional `trend` and `sparklineData` props. Existing callers are unchanged.

**Step 1: Add the new optional props to the type**

Find `export type StatCardProps = {` (line ~15) and update:

```tsx
import { ArrowDown, ArrowUp } from '@/components/icons';
import { SparklineChart } from '@/components/ui/sparkline';

export type StatCardTrend = {
  direction: 'up' | 'down' | 'neutral';
  value: string;
  label?: string;
};

export type StatCardProps = {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  href?: string;
  valueClassName?: string;
  trend?: StatCardTrend;
  sparklineData?: number[];
};
```

**Step 2: Update the StatCard render to show trend + sparkline**

Replace the existing `StatCard` function body with:

```tsx
export function StatCard({
  label, value, sub, accent, href, valueClassName, trend, sparklineData,
}: StatCardProps) {
  const TrendIcon = trend?.direction === 'up' ? ArrowUp : ArrowDown;
  const trendColor =
    trend?.direction === 'up'
      ? 'text-success'
      : trend?.direction === 'down'
        ? 'text-destructive'
        : 'text-muted-foreground';
  const sparklineColor =
    trend?.direction === 'up'
      ? 'var(--color-success)'
      : trend?.direction === 'down'
        ? 'var(--color-destructive)'
        : 'var(--color-muted-foreground)';

  const content = (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-border bg-card px-5 py-4 shadow-xs transition-shadow',
        href && 'hover:shadow-md hover:border-primary/20',
        accent && 'border-t-2 border-t-primary',
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>

      <div className="mt-2 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className={cn('font-mono text-xl font-semibold text-foreground', valueClassName)}>
            {value}
          </p>
          {trend != null && (
            <div className={cn('mt-1 flex items-center gap-1 text-xs font-medium', trendColor)}>
              <TrendIcon className="size-3.5" weight="duotone" aria-hidden="true" />
              <span>{trend.value}</span>
              <span className="font-normal text-muted-foreground">
                {trend.label ?? 'vs last month'}
              </span>
            </div>
          )}
          {sub != null && trend == null && (
            <p className="mt-1.5 text-xs text-muted-foreground">{sub}</p>
          )}
        </div>

        {sparklineData != null && sparklineData.length > 1 && (
          <div className="w-20 shrink-0">
            <SparklineChart data={sparklineData} color={sparklineColor} height={36} />
          </div>
        )}
      </div>

      {href && (
        <span className="absolute right-4 top-4 text-primary/70">
          <span className="sr-only">View</span>
          <ArrowRight className="size-3.5" weight="duotone" aria-hidden="true" />
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {content}
      </Link>
    );
  }

  return content;
}
```

**Step 3: Run check — verify no regressions in existing callers**
```bash
npm run check
```
Expected: PASS — `sub` is now optional so all existing usages still compile

**Step 4: Commit**
```bash
git add src/app/dashboard/\[role\]/_components/overview-shared.tsx
git commit -m "feat(overview): StatCard upgrade — optional trend indicator and sparkline"
```

---

## Task 6: TableHead Typography Refinement

**Files:**
- Modify: `src/components/ui/table.tsx`

**Context:** The `TableHead` already uses `text-xs uppercase tracking-wide text-muted-foreground`. Tighten the size to `text-[11px]` and use `tracking-[0.08em]` for precision.

**Step 1: Update `TableHead` className**

Find (line ~74):
```tsx
"h-10 px-3 text-left align-middle text-xs font-medium uppercase tracking-wide text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
```

Replace with:
```tsx
"h-10 px-3 text-left align-middle text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
```

**Step 2: Run check**
```bash
npm run check
```
Expected: PASS

**Step 3: Commit**
```bash
git add src/components/ui/table.tsx
git commit -m "style(ui/table): 11px semibold column headers, tighter tracking"
```

---

## Task 7: Admin Overview — Use SectionHeader

**Files:**
- Modify: `src/app/dashboard/[role]/_components/admin-overview.tsx`

**Context:** The admin overview has an ad-hoc `<div className="flex items-center justify-between border-b border-border px-5 py-3.5">` section header inside the recent-operations card. Replace it with `SectionHeader`. Also remove the outer Card div wrapper from the table section (table sits directly in the Section).

**Step 1: Add import for SectionHeader**

At the top of the file, add:
```tsx
import { SectionHeader } from '@/components/ui/section-header';
```

**Step 2: Replace the ad-hoc section header div (around line 108–120)**

Find:
```tsx
<div className="rounded-xl border border-border bg-card shadow-xs">
  <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
      {copy.recentOperations.heading}
    </p>
    <Link
      href={routes.dashboard.admin.operations}
      className="inline-flex items-center gap-1 text-[11px] font-medium text-primary/70 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
    >
      <span>{adminCopy.nav.documents}</span>
      <ArrowRight className="size-3" weight="duotone" aria-hidden="true" />
    </Link>
  </div>
```

Replace with:
```tsx
<div>
  <SectionHeader
    title={copy.recentOperations.heading}
    action={
      <Link
        href={routes.dashboard.admin.operations}
        className="inline-flex items-center gap-1 text-[11px] font-medium text-primary/70 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
      >
        <span>{adminCopy.nav.documents}</span>
        <ArrowRight className="size-3" weight="duotone" aria-hidden="true" />
      </Link>
    }
  />
```

**Step 3: Close the wrapper div correctly**

Find the closing `</div>` of the outer `rounded-xl border` wrapper and change it to just `</div>` (it was already there, just the opening tag changed above).

**Step 4: Run check**
```bash
npm run check
```
Expected: PASS

**Step 5: Commit**
```bash
git add src/app/dashboard/\[role\]/_components/admin-overview.tsx
git commit -m "style(admin/overview): SectionHeader replaces ad-hoc heading pattern"
```

---

## Task 8: Agent Overview — Use SectionHeader

**Files:**
- Modify: `src/app/dashboard/[role]/_components/agent-overview.tsx`

**Step 1: Read the file to find ad-hoc section header patterns**
```bash
grep -n "flex items-center justify-between" src/app/dashboard/\[role\]/_components/agent-overview.tsx
```

**Step 2: Import SectionHeader**
```tsx
import { SectionHeader } from '@/components/ui/section-header';
```

**Step 3: Replace each ad-hoc heading div with `<SectionHeader title="..." action={...} />`**

Follow the same pattern as Task 7.

**Step 4: Run check and commit**
```bash
npm run check
git add src/app/dashboard/\[role\]/_components/agent-overview.tsx
git commit -m "style(agent/overview): SectionHeader replaces ad-hoc heading pattern"
```

---

## Task 9: Final Verification

**Step 1: Run the full check suite**
```bash
npm run check
```
Expected: lint + typecheck + tests + layout-check all PASS

**Step 2: Visual spot-check (dev server)**
```bash
npm run dev
```
Open:
- `/dashboard/student` — dark sidebar, white text, left border on active item
- `/dashboard/admin` — dark sidebar with orange-red border on active items
- `/dashboard/agent` — dark sidebar with purple border
- Admin overview — SectionHeader on recent-operations section
- Any table page — 11px semibold uppercase column headers

**Step 3: Commit if any leftover fixes needed**
```bash
git add <changed files>
git commit -m "style: final polish from visual spot-check"
```

---

## What Was Intentionally Left Out

- **Sparkline data on admin/agent overview stat cards**: The tRPC procedures (`getOperationsStats`, etc.) return counts, not historical arrays. Adding sparklines there would require a new query. Out of scope for this visual overhaul — the `sparklineData` prop is ready when the backend supplies it.
- **TopBar**: User confirmed keep current height and content.
- **Dark mode `.dark` sidebar tokens**: Already dark (`#0D1F3C`). No change needed.
- **Mobile BottomNav**: No change.
- **Copy config changes**: No string changes needed for this visual overhaul.

---

## File Summary

| File | Action |
|------|--------|
| `src/app/globals.css` | Edit — 6 sidebar token values |
| `src/components/layout/Sidebar.tsx` | Edit — NavItemLink active state |
| `src/components/ui/sparkline.tsx` | Create |
| `src/components/ui/section-header.tsx` | Create |
| `src/app/dashboard/[role]/_components/overview-shared.tsx` | Edit — StatCard upgrade |
| `src/components/ui/table.tsx` | Edit — TableHead typography |
| `src/app/dashboard/[role]/_components/admin-overview.tsx` | Edit — SectionHeader |
| `src/app/dashboard/[role]/_components/agent-overview.tsx` | Edit — SectionHeader |
