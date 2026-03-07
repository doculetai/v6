# Dashboard Visual Overhaul — Design Document
Date: 2026-03-07
Approach: B — Token layer + targeted component updates

## Reference
"made." dashboard design (dark sidebar, clean content sections, stat cards with sparklines,
borderless tables). Adapted to Doculet brand colors and role accent system.

## Scope
All 6 roles. Shell-level changes cascade globally via CSS vars.
~15 files total.

---

## 1. Design Tokens — Sidebar (globals.css)

Replace the current light sidebar with a near-black dark sidebar.
Role accent colors remain per-role; their expression changes (border only, not text color).

```css
/* New dark sidebar tokens — replaces existing :root values */
--sidebar:                  #161A1D;                   /* near-black warm dark */
--sidebar-foreground:       #F1F5F9;                   /* cool white text */
--sidebar-border:           rgba(255, 255, 255, 0.07); /* very subtle dividers */
--sidebar-accent:           rgba(255, 255, 255, 0.06); /* hover bg */
--sidebar-accent-foreground: #F1F5F9;
--sidebar-glass-bg:         rgba(22, 26, 29, 0.95);    /* mobile sheet bg */
```

All sidebar sub-components (RoleIndicator, SidebarUserCard, SidebarFooter,
SidebarToggle) use these tokens already — no JSX changes needed in those files.

---

## 2. Active Nav Item Style (Sidebar.tsx → NavItemLink)

### Current
- Background: `rgba(role-accent, 0.12)` wash
- Text color: `var(--role-accent)` (role color)
- Left border: 4px `var(--role-accent)`

### New (hybrid on dark)
- Background: `rgba(255, 255, 255, 0.09)` — slightly brighter than hover wash
- Text color: `#F1F5F9` (white) — role-colored text has poor contrast on dark bg
- Left border: 4px `var(--role-accent)` — **this is the sole role identity signal**

Inactive items: `text-sidebar-foreground/60` → white at 60% opacity.
Hover: `rgba(255,255,255,0.06)` bg, text white at 100%.

Changes: `NavItemLink` — update inline `style` and `className` for `isActive` branch.

---

## 3. SectionHeader Component (new — content-primitives or ui/)

### Pattern
```
[Bold section title]                    [optional right-side action]
```
Thin border-b below the row separates the header from the content below.

### Props
```typescript
interface SectionHeaderProps {
  title: string;
  action?: React.ReactNode;   // date picker, filter button, sort dropdown
  className?: string;
}
```

### Usage
```tsx
<SectionHeader title="Verification overview" action={<DateRangePicker />} />
```

Used on: admin overview, analytics pages, student overview, agent overview.
Replaces ad-hoc `<div className="flex items-center justify-between">` heading rows.

File: `src/components/ui/section-header.tsx`

---

## 4. SparklineChart Component (new)

### Description
Tiny recharts `LineChart` with no axes, no tooltip, no labels.
Renders a trend line only. Used inside StatCard.

### Props
```typescript
interface SparklineChartProps {
  data: number[];             // array of values, oldest → newest
  color?: string;             // line color, defaults to --success green
  height?: number;            // defaults to 40
}
```

### Implementation notes
- Use recharts `LineChart` + `Line` with `dot={false}`, `strokeWidth={1.5}`
- No `XAxis`, no `YAxis`, no `CartesianGrid`, no `Tooltip`
- `ResponsiveContainer` with `width="100%"` and fixed height
- Color: pass as `stroke` on `<Line>` — callers use `var(--success)` for positive,
  `var(--destructive)` for negative trend

File: `src/components/ui/sparkline.tsx`

---

## 5. StatCard Component (new)

### Description
Metric display card used on overview/analytics pages.
Large number + trend indicator + sparkline chart.

### Visual layout
```
┌──────────────────────────────────────┐
│ label (small, muted)           ···   │
│                                      │
│ ₦ 12,450,000           sparkline─╮  │
│ ▲ 23% vs last month          ───╯  │
└──────────────────────────────────────┘
```

### Props
```typescript
interface StatCardProps {
  label: string;
  value: string;              // pre-formatted (e.g. "₦ 12,450,000")
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;            // e.g. "23%"
    label?: string;           // defaults to "vs last month"
  };
  sparklineData?: number[];   // if omitted, sparkline not rendered
  action?: React.ReactNode;   // optional 3-dot menu
}
```

### Notes
- Amount: IBM Plex Mono (`font-mono`) for the value
- Trend up: `text-success` + ArrowUp icon; down: `text-destructive` + ArrowDown
- Sparkline: positioned absolute bottom-right of card, 80×40px
- No glassmorphism, no gradients — clean white card with `shadow-sm`

File: `src/components/ui/stat-card.tsx`

---

## 6. Table Style Update (table.tsx)

### Changes
- Remove outer border from default `Table` wrapper (was implicitly via Card wrapper on pages)
- `TableHeader` row: `border-b border-border` only (no top border, no full box)
- `TableHead` cells: `text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground`
  (already brand-aligned; enforce as default)
- `TableRow`: `border-b border-border last:border-0 hover:bg-muted/50 transition-colors`
- No horizontal padding change

On pages, tables now sit directly in a Section container — no Card wrapper around the table itself.

---

## 7. Page Content Background

Keep `--background: #FDFCFA` (Doculet warm white brand canvas).
Keep `--card: #FFFFFF` (white cards pop off warm canvas).

The contrast between warm-white background and pure-white cards is the page depth signal.
No change needed.

---

## Files Changed

| File | Type | Change |
|------|------|--------|
| `src/app/globals.css` | edit | 6 sidebar token values |
| `src/components/layout/Sidebar.tsx` | edit | NavItemLink active state style |
| `src/components/ui/section-header.tsx` | new | SectionHeader component |
| `src/components/ui/sparkline.tsx` | new | SparklineChart component |
| `src/components/ui/stat-card.tsx` | new | StatCard component |
| `src/components/ui/table.tsx` | edit | borderless row style defaults |

Pages that adopt StatCard + SectionHeader (in implementation plan, not listed here):
- `src/app/dashboard/[role]/overview/overview-page-client.tsx`
- `src/app/dashboard/[role]/_components/admin-overview.tsx`
- `src/app/dashboard/[role]/analytics/analytics-page-client.tsx`
- `src/app/dashboard/[role]/_components/agent-overview.tsx`

---

## Non-Goals (explicitly out of scope)

- TopBar: keep current height and structure
- Dark mode system: this is NOT a dark mode change — light mode defaults change
- Page routing or data: no changes
- Mobile BottomNav: no changes
- Icon library: Phosphor Duotone stays, same sizes

---

## Acceptance Criteria

1. All 6 role sidebars render with dark `#161A1D` background
2. Active nav item shows 4px role-accent left border + white text + subtle white wash
3. Inactive items are white at 60% opacity; hover lifts to 100% + slight bg wash
4. SectionHeader renders title + optional action in all overview/analytics pages
5. StatCard renders with number + trend + sparkline on overview pages
6. Tables render without outer card border; row separators only
7. `npm run check` passes (lint + typecheck + tests + layout-check)
