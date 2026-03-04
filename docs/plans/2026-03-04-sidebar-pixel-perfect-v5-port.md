# Sidebar Pixel-Perfect V5 Port — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make V6 sidebar a pixel-perfect match of V5's sidebar — same layout, spacing, component anatomy, and interactive behaviour.

**Architecture:** Break the monolithic `Sidebar.tsx` into focused sub-components mirroring V5's file structure. Extend V6 `NavConfig` type with `quickAction`. Port each sub-component with exact V5 classes.

**Tech Stack:** React 19, Next.js 16 App Router, Tailwind CSS 4, Lucide icons, Radix UI (via `radix-ui` unified package), `next-themes`.

---

## V5 vs V6 Visual Diff — Every Pixel

### Shell layout
| Detail | V5 | V6 current | Fix needed |
|---|---|---|---|
| Outer wrapper | `flex h-screen overflow-hidden` | ✅ already fixed | none |
| Sidebar `aside` | `hidden md:flex flex-col border-r border-border/50 bg-muted/60 shadow-md dark:bg-card` | missing `shadow-md`, uses `bg-card/80 backdrop-blur-xl` | replace background |
| Width collapsed | `w-16` | ✅ | none |
| Width expanded | `w-60` | ✅ | none |
| Width transition | `transition-[width] duration-200 ease-out` | ✅ | none |

### Top section
| Detail | V5 | V6 current | Fix needed |
|---|---|---|---|
| Top wrapper | `shrink-0 flex flex-col gap-1.5 pb-2 pt-3` | `h-16 flex items-center` | full rebuild |
| Logo (expanded) | `px-4`, height 28px, `showText` | `px-3`, height 32px | fix padding/size |
| Logo (collapsed) | `px-3 flex justify-center`, shield 28px | shield 36px centered | fix size |
| **RoleIndicator** | icon badge + role name below logo | ❌ MISSING | add component |
| **QuickAction CTA** | `h-10 rounded-lg bg-primary` full-width button | ❌ MISSING | add component |

### Nav items
| Detail | V5 | V6 current | Fix needed |
|---|---|---|---|
| Item height | `h-8` (32px fixed) | ✅ already h-8 | none |
| Left accent bar | `absolute left-0 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-primary` | ✅ already present | none |
| Active bg | `bg-primary/15 font-semibold` | ✅ | none |
| Hover bg | `hover:bg-muted/50` | ✅ | none |
| Icon scale | `group-hover:scale-110 motion-reduce:...` | ✅ | none |
| Gap between items | `gap-0.5` | ✅ | none |
| Group label | collapsible button `text-xs font-semibold uppercase tracking-wider` | ✅ already collapsible | none |
| Collapsed group separator | `border-t border-border/50` (hr) | ✅ | none |

### Bottom section
| Detail | V5 | V6 current | Fix needed |
|---|---|---|---|
| Bottom wrapper | `shrink-0 flex flex-col gap-1.5 border-t border-border/50 pt-2` | ✅ close | fine-tune |
| **SidebarToggle** | `ChevronLeft/Right` + label text, `min-h-[44px]` | `PanelLeftClose` icon only | replace icon + add label |
| **SidebarUserCard** | avatar + name + email + `MoreVertical` dropdown (theme + logout) | simple avatar + name + logout btn | add dropdown |
| **SidebarFooter** | `v1.0.0 · Status · Active` with green dot | ❌ MISSING | add component |

---

## Task 1: Extend NavConfig with `quickAction`

**Files:**
- Modify: `src/config/nav/types.ts`
- Modify: `src/config/nav/student.ts`
- Modify: `src/config/nav/sponsor.ts`
- Modify: `src/config/nav/university.ts`
- Modify: `src/config/nav/admin.ts`
- Modify: `src/config/nav/agent.ts`
- Modify: `src/config/nav/partner.ts`

**Step 1: Add `quickAction` to NavConfig type**

In `src/config/nav/types.ts`, add to `NavConfig`:
```ts
export type NavQuickAction = {
  label: string;
  icon: LucideIcon;
  href: string;
};

export type NavConfig = {
  groups: NavGroup[];
  items: NavItem[];
  quickAction: NavQuickAction;
};
```

**Step 2: Add quickAction to each role nav config**

`src/config/nav/student.ts` — add after items array:
```ts
import { ArrowRight, ... } from 'lucide-react';
// ...
quickAction: {
  label: 'Continue application',
  icon: ArrowRight,
  href: '/dashboard/student/schools',
},
```

`src/config/nav/sponsor.ts`:
```ts
import { ClipboardCheck, ... } from 'lucide-react';
quickAction: {
  label: 'Review requests',
  icon: ClipboardCheck,
  href: '/dashboard/sponsor/students',
},
```

`src/config/nav/university.ts`:
```ts
import { ListChecks, ... } from 'lucide-react';
quickAction: {
  label: 'Review queue',
  icon: ListChecks,
  href: '/dashboard/university/pipeline',
},
```

`src/config/nav/admin.ts`:
```ts
import { ClipboardCheck, ... } from 'lucide-react';
quickAction: {
  label: 'Review queue',
  icon: ClipboardCheck,
  href: '/dashboard/admin/operations',
},
```

`src/config/nav/agent.ts`:
```ts
import { UserPlus, ... } from 'lucide-react';
quickAction: {
  label: 'Invite student',
  icon: UserPlus,
  href: '/dashboard/agent/students',
},
```

`src/config/nav/partner.ts`:
```ts
import { FileText, ... } from 'lucide-react';
quickAction: {
  label: 'View students',
  icon: FileText,
  href: '/dashboard/partner/students',
},
```

**Step 3: TypeScript check**
Run: `npx tsc --noEmit`
Expected: no errors

**Step 4: Commit**
```bash
git add src/config/nav/
git commit -m "feat(nav): add quickAction to NavConfig type and all 6 role configs"
```

---

## Task 2: Create `SidebarQuickAction` sub-component

**Files:**
- Create: `src/components/layout/sidebar/SidebarQuickAction.tsx`

**Step 1: Write the component**

```tsx
// src/components/layout/sidebar/SidebarQuickAction.tsx
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

type SidebarQuickActionProps = {
  label: string;
  icon: LucideIcon;
  href: string;
  isCollapsed: boolean;
};

export function SidebarQuickAction({ label, icon: Icon, href, isCollapsed }: SidebarQuickActionProps) {
  if (isCollapsed) {
    return (
      <div className="px-3 py-1">
        <Link
          href={href}
          title={label}
          aria-label={label}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Icon className="h-5 w-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="px-3 py-1">
      <Link
        href={href}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Icon className="h-5 w-5" />
        {label}
      </Link>
    </div>
  );
}
```

**Step 2: TypeScript check**
Run: `npx tsc --noEmit`
Expected: no errors

---

## Task 3: Create `RoleIndicator` sub-component

**Files:**
- Create: `src/components/layout/sidebar/RoleIndicator.tsx`

**Step 1: Write the component**

```tsx
// src/components/layout/sidebar/RoleIndicator.tsx
import {
  Briefcase, Building2, GraduationCap, HeartHandshake, Shield, Users,
  type LucideIcon,
} from 'lucide-react';
import type { DashboardRole } from '@/config/roles';
import { roleDisplayNames } from '@/config/copy/dashboard-shell';

const roleIcons: Record<DashboardRole, LucideIcon> = {
  student: GraduationCap,
  sponsor: HeartHandshake,
  university: Building2,
  admin: Shield,
  agent: Users,
  partner: Briefcase,
};

type RoleIndicatorProps = {
  role: DashboardRole;
  isCollapsed: boolean;
};

export function RoleIndicator({ role, isCollapsed }: RoleIndicatorProps) {
  const Icon = roleIcons[role];
  const label = roleDisplayNames[role];

  if (isCollapsed) {
    return (
      <div className="flex justify-center px-2 py-0.5" title={label}>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground/80">
          <Icon className="h-4 w-4" />
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 border-b border-border/30 px-4 py-2 dark:border-border/20">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground/80">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="truncate text-xs font-medium text-foreground/80 dark:text-foreground/70">
        {label}
      </span>
    </div>
  );
}
```

**Step 2: TypeScript check**
Run: `npx tsc --noEmit`
Expected: no errors

---

## Task 4: Create `SidebarToggle` sub-component

V5 uses `ChevronLeft` (expanded→collapse) / `ChevronRight` (collapsed→expand) with label text.

**Files:**
- Create: `src/components/layout/sidebar/SidebarToggle.tsx`

**Step 1: Write the component**

```tsx
// src/components/layout/sidebar/SidebarToggle.tsx
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type SidebarToggleProps = {
  isCollapsed: boolean;
  onToggle: () => void;
};

export function SidebarToggle({ isCollapsed, onToggle }: SidebarToggleProps) {
  const label = isCollapsed ? 'Expand sidebar' : 'Collapse sidebar';

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      className={cn(
        'flex min-h-[44px] items-center gap-2 rounded-md px-3 text-xs text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isCollapsed && 'w-full justify-center px-0',
      )}
    >
      {isCollapsed ? (
        <ChevronRight className="h-4 w-4" />
      ) : (
        <>
          <ChevronLeft className="h-4 w-4" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
```

---

## Task 5: Create `SidebarUserCard` sub-component

V5: avatar + full name + email + `MoreVertical` dropdown with theme toggle and sign out.

**Files:**
- Create: `src/components/layout/sidebar/SidebarUserCard.tsx`

**Step 1: Write the component**

```tsx
// src/components/layout/sidebar/SidebarUserCard.tsx
'use client';

import { LogOut, Moon, MoreVertical, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { DashboardRole } from '@/config/roles';
import { dashboardShellCopy, getFallbackUserName, roleDisplayNames } from '@/config/copy/dashboard-shell';

type SidebarUserCardProps = {
  role: DashboardRole;
  isCollapsed: boolean;
  onSignOut: () => void;
};

export function SidebarUserCard({ role, isCollapsed, onSignOut }: SidebarUserCardProps) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  const dropdownContent = (
    <DropdownMenuContent align={isCollapsed ? 'start' : 'end'} className="w-48">
      <DropdownMenuItem onClick={() => setTheme(isDark ? 'light' : 'dark')}>
        {isDark ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
        {isDark ? 'Light mode' : 'Dark mode'}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={onSignOut} className="text-destructive focus:text-destructive">
        <LogOut className="mr-2 h-4 w-4" />
        {dashboardShellCopy.sidebar.logoutLabel}
      </DropdownMenuItem>
    </DropdownMenuContent>
  );

  if (isCollapsed) {
    return (
      <div className="flex justify-center px-3 py-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="User menu"
              className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Avatar size="md">
                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                  {dashboardShellCopy.sidebar.avatarFallback}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          {dropdownContent}
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg px-4 py-2 transition-colors hover:bg-muted/30">
      <Avatar size="md">
        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
          {dashboardShellCopy.sidebar.avatarFallback}
        </AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-semibold text-foreground">
          {getFallbackUserName(role)}
        </span>
        <span className="truncate text-xs text-muted-foreground">
          {roleDisplayNames[role]}
        </span>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="User menu"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        {dropdownContent}
      </DropdownMenu>
    </div>
  );
}
```

---

## Task 6: Create `SidebarFooter` sub-component

V5: `v1.0.0 · Status · Active` — tiny footer line with green status dot.

**Files:**
- Create: `src/components/layout/sidebar/SidebarFooter.tsx`

**Step 1: Write the component**

```tsx
// src/components/layout/sidebar/SidebarFooter.tsx
type SidebarFooterProps = { isCollapsed: boolean };

export function SidebarFooter({ isCollapsed }: SidebarFooterProps) {
  if (isCollapsed) return null;

  return (
    <div className="flex items-center gap-3 border-t border-border/50 px-4 py-2 text-xs text-muted-foreground">
      <span>v2.0.0</span>
      <span className="text-primary">Status</span>
      <span className="ml-auto flex items-center gap-1">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary/60 dark:bg-primary/40" />
        Active
      </span>
    </div>
  );
}
```

---

## Task 7: Rewrite `Sidebar.tsx` with exact V5 structure

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`
- Keep: all existing imports for supabase/logout logic

**Step 1: Rewrite to exact V5 anatomy**

Full `Sidebar.tsx` replacement:

```tsx
'use client';

import { createBrowserClient } from '@supabase/ssr';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { dashboardShellCopy } from '@/config/copy/dashboard-shell';
import { getNavConfig } from '@/config/nav';
import type { NavItem } from '@/config/nav/types';
import type { DashboardRole } from '@/config/roles';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { RoleIndicator } from './sidebar/RoleIndicator';
import { SidebarFooter } from './sidebar/SidebarFooter';
import { SidebarQuickAction } from './sidebar/SidebarQuickAction';
import { SidebarToggle } from './sidebar/SidebarToggle';
import { SidebarUserCard } from './sidebar/SidebarUserCard';

type SidebarProps = {
  role: DashboardRole;
  currentPath: string;
  defaultCollapsed?: boolean;
};

function findBestMatch(items: NavItem[], currentPath: string): string | null {
  let best: NavItem | null = null;
  for (const item of items) {
    if (currentPath === item.href || currentPath.startsWith(`${item.href}/`)) {
      if (!best || item.href.length > best.href.length) best = item;
    }
  }
  return best?.href ?? null;
}

export function Sidebar({ role, currentPath, defaultCollapsed = false }: SidebarProps) {
  const router = useRouter();
  const navConfig = getNavConfig(role);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const activeHref = useMemo(
    () => findBestMatch(navConfig.items, currentPath),
    [navConfig.items, currentPath],
  );

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    return createBrowserClient(url, key);
  }, []);

  const handleLogout = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await supabase?.auth.signOut();
    } finally {
      router.push('/login');
      router.refresh();
      setIsSigningOut(false);
    }
  };

  const ungroupedItems = navConfig.items.filter((i) => !i.group);
  const groupedItems = navConfig.groups
    .map((group) => ({ group, items: navConfig.items.filter((i) => i.group === group.id) }))
    .filter((g) => g.items.length > 0);

  return (
    <TooltipProvider delayDuration={300}>
      <aside
        className={cn(
          'hidden md:flex flex-col border-r border-border/50 bg-muted/60 shadow-md print:hidden dark:bg-card',
          'transition-[width] duration-200 ease-out',
          isCollapsed ? 'w-16' : 'w-60',
        )}
      >
        {/* ── Top: Logo + RoleIndicator + QuickAction ── */}
        <div className="flex shrink-0 flex-col gap-1.5 pb-2 pt-3">
          {/* Logo */}
          <div className={cn('px-4', isCollapsed && 'flex justify-center px-3')}>
            <Link
              href={`/dashboard/${role}`}
              className="inline-flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={dashboardShellCopy.logoAlt}
            >
              {isCollapsed ? (
                <Image
                  src="/brand/logos/doculet-shield.svg"
                  alt="Doculet"
                  width={28}
                  height={28}
                  className="size-7"
                  priority
                />
              ) : (
                <>
                  <Image
                    src="/brand/logos/logo.svg"
                    alt={dashboardShellCopy.logoAlt}
                    width={120}
                    height={28}
                    priority
                    className="h-7 w-auto dark:hidden"
                  />
                  <Image
                    src="/brand/logos/logo-dark.svg"
                    alt={dashboardShellCopy.logoAlt}
                    width={120}
                    height={28}
                    priority
                    className="hidden h-7 w-auto dark:block"
                  />
                </>
              )}
            </Link>
          </div>

          <RoleIndicator role={role} isCollapsed={isCollapsed} />
          <SidebarQuickAction
            label={navConfig.quickAction.label}
            icon={navConfig.quickAction.icon}
            href={navConfig.quickAction.href}
            isCollapsed={isCollapsed}
          />
        </div>

        {/* ── Nav ── */}
        <nav
          aria-label={dashboardShellCopy.sidebar.navAriaLabel}
          className="flex-1 overflow-y-auto py-1"
        >
          {/* Ungrouped items */}
          {ungroupedItems.length > 0 && (
            <ul className="flex flex-col gap-0.5 px-3" role="list">
              {ungroupedItems.map((item) => (
                <li key={item.href}>
                  <NavItemLink item={item} isActive={activeHref === item.href} isCollapsed={isCollapsed} />
                </li>
              ))}
            </ul>
          )}

          {/* Grouped items */}
          {groupedItems.map(({ group, items }) => (
            <NavGroup key={group.id} label={group.label} items={items} activeHref={activeHref} isCollapsed={isCollapsed} />
          ))}
        </nav>

        {/* ── Bottom: Toggle + UserCard + Footer ── */}
        <div className="flex shrink-0 flex-col gap-1.5 border-t border-border/50 pt-2" data-testid="sidebar-bottom">
          <div className={cn('px-3', isCollapsed && 'px-2')}>
            <SidebarToggle isCollapsed={isCollapsed} onToggle={() => setIsCollapsed((v) => !v)} />
          </div>
          <SidebarUserCard role={role} isCollapsed={isCollapsed} onSignOut={handleLogout} />
          <SidebarFooter isCollapsed={isCollapsed} />
        </div>
      </aside>
    </TooltipProvider>
  );
}

// ── NavGroup ──────────────────────────────────────────────────────────────────
type NavGroupProps = {
  label: string;
  items: NavItem[];
  activeHref: string | null;
  isCollapsed: boolean;
};

function NavGroup({ label, items, activeHref, isCollapsed }: NavGroupProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { ChevronDown } = require('lucide-react'); // inline import to keep file self-contained

  if (isCollapsed) {
    return (
      <div className="mb-0.5 py-0.5">
        <div role="separator" className="mx-3 border-t border-border/50" />
        <ul className="mt-0.5 flex flex-col gap-0.5 px-3" role="list">
          {items.map((item) => (
            <li key={item.href}>
              <NavItemLink item={item} isActive={activeHref === item.href} isCollapsed={true} />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="mb-0.5 py-0.5">
      <button
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        className="flex w-full items-center justify-between px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded-md"
        aria-expanded={isOpen}
      >
        {label}
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', !isOpen && '-rotate-90')} />
      </button>
      <ul
        className={cn(
          'flex flex-col gap-0.5 overflow-hidden px-3 transition-all',
          isOpen ? 'max-h-[500px] opacity-100' : 'invisible max-h-0 opacity-0',
        )}
        role="list"
      >
        {items.map((item) => (
          <li key={item.href}>
            <NavItemLink item={item} isActive={activeHref === item.href} isCollapsed={false} />
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── NavItemLink ───────────────────────────────────────────────────────────────
type NavItemLinkProps = {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
};

function NavItemLink({ item, isActive, isCollapsed }: NavItemLinkProps) {
  const Icon = item.icon;

  const link = (
    <Link
      href={item.href}
      data-active={isActive}
      aria-current={isActive ? 'page' : undefined}
      title={isCollapsed ? item.label : undefined}
      className={cn(
        'group relative flex h-8 items-center gap-3 rounded-lg px-3 text-sm transition-colors duration-150',
        'hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isActive && 'bg-primary/15 font-semibold',
        isCollapsed && 'justify-center px-0',
      )}
    >
      {/* Left accent bar */}
      <span
        className={cn(
          'absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-primary transition-all duration-200',
          isActive ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0',
        )}
      />
      {/* Icon */}
      <span className="relative flex h-8 w-8 shrink-0 items-center justify-center transition-transform group-hover:scale-110 motion-reduce:group-hover:scale-100">
        <Icon className="h-5 w-5" aria-hidden="true" />
        {item.badge !== undefined && item.badge > 0 && isCollapsed && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
            {item.badge > 9 ? '9+' : item.badge}
          </span>
        )}
      </span>
      {/* Label */}
      {!isCollapsed && <span className="truncate">{item.label}</span>}
      {/* Badge expanded */}
      {item.badge !== undefined && item.badge > 0 && !isCollapsed && (
        <span className={cn('ml-auto flex items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground', item.badge > 9 ? 'h-5 min-w-5 px-1' : 'h-4 w-4')}>
          {item.badge > 99 ? '99+' : item.badge}
        </span>
      )}
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right" className="flex flex-col gap-0.5">
          <span className="font-medium">{item.label}</span>
          {item.description && <span className="text-xs text-muted-foreground">{item.description}</span>}
        </TooltipContent>
      </Tooltip>
    );
  }

  return link;
}
```

**Note:** Replace the `require('lucide-react')` inline with a proper import at the top. Move `ChevronDown` to the top-level imports.

**Step 2: TypeScript check**
Run: `npx tsc --noEmit`
Expected: no errors

**Step 3: Commit**
```bash
git add src/components/layout/
git commit -m "feat(sidebar): pixel-perfect V5 port — RoleIndicator, QuickAction, SidebarToggle, UserCard, Footer"
```

---

## Task 8: Verify in browser

1. Start dev server: `npm run dev`
2. Navigate to `http://localhost:3000/dashboard/student`
3. Check against V5 checklist:
   - [ ] Logo 28px, `px-4` left padding
   - [ ] RoleIndicator: role icon + "Student" text with `border-b`
   - [ ] QuickAction: full-width primary button `h-10`
   - [ ] Nav items: `h-8`, left accent bar, `bg-primary/15` active
   - [ ] Group labels: collapsible chevron
   - [ ] Bottom: ChevronLeft toggle with "Collapse sidebar" label
   - [ ] UserCard: avatar + name/email + MoreVertical dropdown
   - [ ] Footer: `v2.0.0 · Status · Active` with green dot
   - [ ] Collapsed: shield 28px, role icon badge, quick action circle, ChevronRight
   - [ ] Hover tooltips when collapsed
   - [ ] No scroll at any viewport ≥ 768px

4. Test dark mode toggle from UserCard dropdown
5. Test collapse/expand

**Step 4: Final commit**
```bash
git add -p
git commit -m "fix(sidebar): verify pixel-perfect V5 match complete"
```
