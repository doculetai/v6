import type { Metadata } from 'next';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

import {
  CardGridSkeleton,
  DashboardOverviewSkeleton,
  DocumentListSkeleton,
  FormSkeleton,
  KanbanSkeleton,
  ProfileSkeleton,
  StatCardSkeleton,
  StatsRowSkeleton,
  StepperSkeleton,
  TableSkeleton,
  TimelineSkeleton,
} from '@/components/skeletons';
import { iconography, ICON_SIZES } from '@/config/iconography';

import { DesignDisplaySections } from './DesignDisplaySections';
import { SidebarPreviews } from './SidebarPreviews';
import {
  BordersShowcase,
  ColorsShowcase,
  CornersShowcase,
  ShadowsShowcase,
  TypographyShowcase,
} from './ThemeShowcase';
import { Code, Section } from './_helpers';

export const metadata: Metadata = {
  title: 'Design System — Doculet V6',
  robots: { index: false, follow: false },
};

const skeletons = [
  { label: 'StatCard', import: 'StatCardSkeleton', el: <StatCardSkeleton /> },
  { label: 'StatsRow', import: 'StatsRowSkeleton', el: <StatsRowSkeleton /> },
  { label: 'Table (5 rows, 4 cols)', import: 'TableSkeleton', el: <TableSkeleton rows={5} columns={4} /> },
  { label: 'Kanban (4 columns)', import: 'KanbanSkeleton', el: <KanbanSkeleton columns={4} /> },
  { label: 'CardGrid (6 cards)', import: 'CardGridSkeleton', el: <CardGridSkeleton count={6} columns={3} /> },
  { label: 'Profile', import: 'ProfileSkeleton', el: <ProfileSkeleton /> },
  { label: 'Timeline (5 items)', import: 'TimelineSkeleton', el: <TimelineSkeleton items={5} /> },
  { label: 'Stepper (4 steps)', import: 'StepperSkeleton', el: <StepperSkeleton steps={4} /> },
  { label: 'Form (5 fields)', import: 'FormSkeleton', el: <FormSkeleton fields={5} /> },
  { label: 'Dashboard Overview', import: 'DashboardOverviewSkeleton', el: <DashboardOverviewSkeleton /> },
  { label: 'Document List', import: 'DocumentListSkeleton', el: <DocumentListSkeleton items={4} /> },
] as const;

const NAV_SECTIONS = [
  ['colors', 'Colors'],
  ['typography', 'Typography'],
  ['spacing', 'Spacing'],
  ['corners', 'Corners'],
  ['borders', 'Borders'],
  ['shadows', 'Shadows'],
  ['iconography', 'Iconography'],
  ['skeletons', 'Skeletons'],
  ['navigation', 'Navigation'],
  ['primitives-interactive', 'Interactive'],
  ['primitives-forms', 'Form Controls'],
  ['primitives-finance', 'Finance'],
  ['primitives-display', 'Display'],
  ['primitives-data', 'Data'],
  ['primitives-layout', 'Layout'],
  ['primitives-session', 'Session'],
  ['compositions', 'Compositions'],
] as const;

export default function DesignPage() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sticky sidebar nav */}
      <aside className="sticky top-0 hidden h-screen w-48 shrink-0 overflow-y-auto border-r border-border/60 p-4 lg:block">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
          Sections
        </p>
        <nav className="space-y-1 text-sm">
          {NAV_SECTIONS.map(([id, label]) => (
            <Link
              key={id}
              href={`#${id}`}
              className="block rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="min-w-0 flex-1 space-y-16 p-6 pb-24 md:p-10">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">V6 Design System</h1>
          <p className="text-muted-foreground">
            Live showcase of all design tokens, components, and patterns. Internal use only.
          </p>
        </div>

        {/* ── Colors ── */}
        <ColorsShowcase />

        <div className="border-t border-border/40" />

        {/* ── Typography ── */}
        <TypographyShowcase />

        <div className="border-t border-border/40" />

        {/* ── Spacing ── */}
        <Section id="spacing" title="Spacing">
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="mb-3 text-xs text-muted-foreground">T-shirt sizes</p>
            <div className="flex flex-wrap items-end gap-3">
              {[['xs', '4px', 'p-1'], ['sm', '8px', 'p-2'], ['md', '16px', 'p-4'], ['lg', '24px', 'p-6'], ['xl', '32px', 'p-8']].map(([name, size, cls]) => (
                <div key={name} className="flex flex-col items-center gap-1">
                  <div className={`rounded bg-primary/20 ${cls}`} />
                  <p className="text-xs text-muted-foreground">{name}</p>
                  <p className="text-xs text-muted-foreground/60">{size}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <div className="border-t border-border/40" />

        {/* ── Corners ── */}
        <CornersShowcase />

        <div className="border-t border-border/40" />

        {/* ── Borders ── */}
        <BordersShowcase />

        <div className="border-t border-border/40" />

        {/* ── Shadows ── */}
        <ShadowsShowcase />

        <div className="border-t border-border/40" />

        {/* ── Iconography ── */}
        <Section id="iconography" title="Iconography">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
              {Object.entries(ICON_SIZES).map(([name, cls]) => (
                <div key={name} className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
                  <span className={`inline-block rounded bg-muted ${cls}`} />
                  <Code>{`ICON_SIZES.${name} = "${cls}"`}</Code>
                </div>
              ))}
            </div>
            {Object.entries(iconography).map(([category, icons]) => (
              <div key={category}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
                  {category}
                </p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                  {Object.entries(icons as Record<string, React.ElementType>).map(([name, Icon]) => (
                    <div
                      key={name}
                      className="flex flex-col items-center gap-1.5 rounded-lg border border-border bg-card p-3 text-center"
                    >
                      <Icon className="size-5 text-foreground" aria-hidden="true" />
                      <p className="text-xs leading-tight text-muted-foreground">{name}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <div className="border-t border-border/40" />

        {/* ── Skeletons ── */}
        <Section id="skeletons" title="Skeleton Components">
          <div className="space-y-8">
            {skeletons.map((s) => (
              <div key={s.import} className="space-y-3">
                <div className="flex items-center gap-3">
                  <p className="font-medium text-foreground">{s.label}</p>
                  <Code>{`import { ${s.import} } from '@/components/skeletons'`}</Code>
                </div>
                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  {s.el}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <div className="border-t border-border/40" />

        {/* ── Navigation ── */}
        <Section id="navigation" title="Navigation — Sidebar Preview">
          <div className="space-y-4">
            <SidebarPreviews />
            <div className="flex items-center justify-end">
              <Link
                href="/design/sidebar"
                className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Open full interactive sidebar lab →
              </Link>
            </div>
          </div>
        </Section>

        <DesignDisplaySections />
      </main>
    </div>
  );
}
