import type { Metadata } from 'next';

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
import { ActivityTimeline } from '@/components/ui/activity-timeline';
import { DataTableShell } from '@/components/ui/data-table-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { FilterBar } from '@/components/ui/filter-bar';
import { MaskedValue } from '@/components/ui/masked-value';
import { MetricCard } from '@/components/ui/metric-card';
import { MoneyValue } from '@/components/ui/money-value';
import { PageHeader } from '@/components/ui/page-header';
import { PipelineStepper } from '@/components/ui/pipeline-stepper';
import { StatusBadge } from '@/components/ui/status-badge';
import { SurfacePanel } from '@/components/ui/surface-panel';
import { TimestampLabel } from '@/components/ui/timestamp-label';

import { SessionManagementDemo } from './SessionManagementDemo';
import { SidebarPreviews } from './SidebarPreviews';

export const metadata: Metadata = {
  title: 'Design System — Doculet V6',
  robots: { index: false, follow: false },
};

// Color tokens to display
const colorTokens = [
  { name: 'background', label: 'Background' },
  { name: 'foreground', label: 'Foreground', dark: true },
  { name: 'card', label: 'Card' },
  { name: 'primary', label: 'Primary' },
  { name: 'primary-foreground', label: 'Primary Fg', dark: true },
  { name: 'secondary', label: 'Secondary' },
  { name: 'muted', label: 'Muted' },
  { name: 'muted-foreground', label: 'Muted Fg', dark: true },
  { name: 'accent', label: 'Accent' },
  { name: 'border', label: 'Border' },
  { name: 'destructive', label: 'Destructive' },
  { name: 'color-success', label: 'Success' },
  { name: 'color-warning', label: 'Warning' },
  { name: 'ring', label: 'Ring' },
];

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

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="space-y-5 scroll-mt-8">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        <a href={`#${id}`} className="text-sm text-muted-foreground hover:text-foreground">#</a>
      </div>
      {children}
    </section>
  );
}

function Code({ children }: { children: string }) {
  return (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
      {children}
    </code>
  );
}

type DemoRow = { id: string; name: string; school: string; status: string; amount: number }

const DEMO_COLUMNS: ReadonlyArray<import('@/components/ui/data-table-shell').DataTableColumn<DemoRow>> = [
  { key: 'name', header: 'Name' },
  { key: 'school', header: 'School' },
  {
    key: 'status',
    header: 'Status',
    cell: (row) => <StatusBadge status={row.status as 'verified' | 'pending'} />,
  },
  {
    key: 'amount',
    header: 'Amount',
    cell: (row) => <MoneyValue amountMinor={row.amount} />,
  },
]

const DEMO_ROWS: DemoRow[] = [
  { id: '1', name: 'Kemi Adesanya', school: 'University of Lagos', status: 'verified', amount: 1500000 },
  { id: '2', name: 'Emeka Obi', school: 'Covenant University', status: 'pending', amount: 750000 },
  { id: '3', name: 'Amara Nwosu', school: 'Ahmadu Bello University', status: 'verified', amount: 2000000 },
]

function DataTableShellDemo() {
  return <DataTableShell columns={DEMO_COLUMNS} rows={DEMO_ROWS} />
}

export default function DesignPage() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sticky sidebar nav */}
      <aside className="sticky top-0 hidden h-screen w-48 shrink-0 overflow-y-auto border-r border-border/60 p-4 lg:block">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
          Sections
        </p>
        <nav className="space-y-1 text-sm">
          {[
            ['colors', 'Colors'],
            ['typography', 'Typography'],
            ['spacing', 'Spacing & Radius'],
            ['shadows', 'Shadows'],
            ['iconography', 'Iconography'],
            ['skeletons', 'Skeletons'],
            ['navigation', 'Navigation'],
            ['primitives-display', 'Display'],
            ['primitives-data', 'Data'],
            ['primitives-layout', 'Layout'],
            ['primitives-session', 'Session'],
          ].map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className="block rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {label}
            </a>
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
        <Section id="colors" title="Color Tokens">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {colorTokens.map((token) => (
              <div key={token.name} className="space-y-1.5">
                <div
                  className="h-14 w-full rounded-lg border border-border/60 shadow-sm"
                  style={{ background: `hsl(var(--${token.name}))` }}
                />
                <p className="text-xs font-medium text-foreground">{token.label}</p>
                <Code>{`--${token.name}`}</Code>
              </div>
            ))}
          </div>
        </Section>

        <div className="border-t border-border/40" />

        {/* ── Typography ── */}
        <Section id="typography" title="Typography">
          <div className="space-y-4 rounded-xl border border-border bg-card p-6">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Heading Scale</p>
              {(['text-4xl', 'text-3xl', 'text-2xl', 'text-xl', 'text-lg'] as const).map((size, i) => (
                <p key={size} className={`${size} font-bold text-foreground`}>
                  H{i + 1} — IBM Plex Sans {size}
                </p>
              ))}
            </div>
            <div className="border-t border-border/40 pt-4">
              <p className="text-xs text-muted-foreground">Body Sizes</p>
              <div className="mt-2 space-y-1">
                {(['text-sm', 'text-base', 'text-lg'] as const).map((size) => (
                  <p key={size} className={`${size} text-foreground`}>
                    {size} — The quick brown fox jumps over the lazy dog
                  </p>
                ))}
              </div>
            </div>
            <div className="border-t border-border/40 pt-4">
              <p className="text-xs text-muted-foreground">Font Weights</p>
              <div className="mt-2 flex flex-wrap gap-4">
                {(['font-normal', 'font-medium', 'font-semibold', 'font-bold'] as const).map((w) => (
                  <span key={w} className={`${w} text-base text-foreground`}>
                    {w.replace('font-', '')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <div className="border-t border-border/40" />

        {/* ── Spacing & Radius ── */}
        <Section id="spacing" title="Spacing & Radius">
          <div className="rounded-xl border border-border bg-card p-6 space-y-6">
            <div>
              <p className="mb-3 text-xs text-muted-foreground">Spacing (T-shirt sizes)</p>
              <div className="flex flex-wrap items-end gap-3">
                {[['xs', '4px', 'p-1'], ['sm', '8px', 'p-2'], ['md', '16px', 'p-4'], ['lg', '24px', 'p-6'], ['xl', '32px', 'p-8']] .map(([name, size, cls]) => (
                  <div key={name} className="flex flex-col items-center gap-1">
                    <div className={`bg-primary/20 rounded ${cls}`} />
                    <p className="text-xs text-muted-foreground">{name}</p>
                    <p className="text-[10px] text-muted-foreground/60">{size}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-border/40 pt-4">
              <p className="mb-3 text-xs text-muted-foreground">Border Radius</p>
              <div className="flex flex-wrap items-center gap-4">
                {[['sm', 'rounded-sm'], ['md', 'rounded-md'], ['lg', 'rounded-lg'], ['xl', 'rounded-xl'], ['2xl', 'rounded-2xl'], ['full', 'rounded-full']] .map(([name, cls]) => (
                  <div key={name} className="flex flex-col items-center gap-1.5">
                    <div className={`size-12 bg-primary/20 ${cls}`} />
                    <p className="text-xs text-muted-foreground">{name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <div className="border-t border-border/40" />

        {/* ── Shadows ── */}
        <Section id="shadows" title="Shadows">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {(['shadow-xs', 'shadow-sm', 'shadow', 'shadow-md', 'shadow-lg', 'shadow-xl'] as const).map((cls) => (
              <div
                key={cls}
                className={`${cls} flex h-20 items-center justify-center rounded-xl bg-card`}
              >
                <Code>{cls}</Code>
              </div>
            ))}
          </div>
        </Section>

        <div className="border-t border-border/40" />

        {/* ── Iconography ── */}
        <Section id="iconography" title="Iconography">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
              {Object.entries(ICON_SIZES).map(([name, cls]) => (
                <div key={name} className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
                  <span className={`bg-muted inline-block rounded ${cls}`} />
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
                      <p className="text-[10px] text-muted-foreground leading-tight">{name}</p>
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
          <SidebarPreviews />
        </Section>

        <div className="border-t border-border/40" />

        {/* ── Display Primitives ── */}
        <Section id="primitives-display" title="Display Primitives">
          <div className="space-y-10">

            {/* StatusBadge */}
            <div className="space-y-3">
              <p className="font-medium text-foreground">StatusBadge</p>
              <Code>{`import { StatusBadge } from '@/components/ui/status-badge'`}</Code>
              <div className="flex flex-wrap gap-3 items-center rounded-xl border border-border bg-card p-5">
                <StatusBadge status="pending" />
                <StatusBadge status="verified" />
                <StatusBadge status="rejected" />
                <StatusBadge status="attention" />
                <StatusBadge status="expired" />
                <StatusBadge status="verified" size="sm" />
                <StatusBadge status="verified" size="lg" />
              </div>
            </div>

            {/* MetricCard */}
            <div className="space-y-3">
              <p className="font-medium text-foreground">MetricCard</p>
              <Code>{`import { MetricCard } from '@/components/ui/metric-card'`}</Code>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                  label="Total Disbursed"
                  value={<MoneyValue amountMinor={1500000} />}
                  deltaValue="+12%"
                  deltaLabel="vs last month"
                  deltaDirection="up"
                  timestamp={new Date().toISOString()}
                />
                <MetricCard
                  label="Pending Reviews"
                  value="34"
                  deltaValue="-3"
                  deltaLabel="since yesterday"
                  deltaDirection="down"
                />
                <MetricCard label="Loading state" value="" loading />
                <MetricCard label="Error state" value="" error />
              </div>
            </div>

            {/* MoneyValue */}
            <div className="space-y-3">
              <p className="font-medium text-foreground">MoneyValue</p>
              <Code>{`import { MoneyValue } from '@/components/ui/money-value'`}</Code>
              <div className="flex flex-wrap gap-6 rounded-xl border border-border bg-card p-5 items-baseline">
                <MoneyValue amountMinor={150000} display="full" />
                <MoneyValue amountMinor={2500000} display="full" />
                <MoneyValue amountMinor={10000000} display="compact" />
                <MoneyValue amountMinor={150000} showCode={false} />
              </div>
            </div>

            {/* TimestampLabel */}
            <div className="space-y-3">
              <p className="font-medium text-foreground">TimestampLabel</p>
              <Code>{`import { TimestampLabel } from '@/components/ui/timestamp-label'`}</Code>
              <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5">
                <TimestampLabel value={new Date(Date.now() - 3 * 60 * 1000)} mode="relative" />
                <TimestampLabel value={new Date(Date.now() - 3 * 60 * 1000)} mode="absolute" />
                <TimestampLabel value={new Date(Date.now() - 3 * 60 * 1000)} mode="both" />
                <TimestampLabel value="not-a-date" />
              </div>
            </div>

            {/* MaskedValue */}
            <div className="space-y-3">
              <p className="font-medium text-foreground">MaskedValue</p>
              <Code>{`import { MaskedValue } from '@/components/ui/masked-value'`}</Code>
              <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
                <MaskedValue value="1234567890123456" label="Card number" />
                <MaskedValue value="08123456789" label="Phone" />
                <MaskedValue value="admin@doculet.ai" />
              </div>
            </div>

            {/* SurfacePanel */}
            <div className="space-y-3">
              <p className="font-medium text-foreground">SurfacePanel</p>
              <Code>{`import { SurfacePanel } from '@/components/ui/surface-panel'`}</Code>
              <div className="grid gap-4 sm:grid-cols-3">
                <SurfacePanel variant="default">
                  <p className="text-sm font-medium text-foreground">default</p>
                  <p className="text-xs text-muted-foreground">comfortable density</p>
                </SurfacePanel>
                <SurfacePanel variant="glass">
                  <p className="text-sm font-medium text-foreground">glass</p>
                  <p className="text-xs text-muted-foreground">backdrop-blur, white/70</p>
                </SurfacePanel>
                <SurfacePanel variant="elevated" density="compact">
                  <p className="text-sm font-medium text-foreground">elevated + compact</p>
                  <p className="text-xs text-muted-foreground">shadow-md, p-3</p>
                </SurfacePanel>
              </div>
            </div>

          </div>
        </Section>

        <div className="border-t border-border/40" />

        {/* ── Data Primitives ── */}
        <Section id="primitives-data" title="Data Primitives">
          <div className="space-y-10">

            {/* ActivityTimeline */}
            <div className="space-y-3">
              <p className="font-medium text-foreground">ActivityTimeline</p>
              <Code>{`import { ActivityTimeline } from '@/components/ui/activity-timeline'`}</Code>
              <ActivityTimeline
                items={[
                  {
                    id: '1',
                    title: 'Proof of funds verified',
                    description: 'University of Lagos confirmed the document.',
                    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
                    tone: 'success',
                  },
                  {
                    id: '2',
                    title: 'Document flagged for review',
                    description: 'Admission letter requires re-upload.',
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                    tone: 'warning',
                  },
                  {
                    id: '3',
                    title: 'Sponsorship disbursement scheduled',
                    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                    tone: 'info',
                  },
                  {
                    id: '4',
                    title: 'Identity verification submitted',
                    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                    tone: 'neutral',
                  },
                ]}
              />
            </div>

            {/* PipelineStepper */}
            <div className="space-y-3">
              <p className="font-medium text-foreground">PipelineStepper</p>
              <Code>{`import { PipelineStepper } from '@/components/ui/pipeline-stepper'`}</Code>
              <div className="rounded-xl border border-border bg-card p-5">
                <PipelineStepper
                  steps={[
                    { id: 's1', label: 'Identity verified', status: 'completed' },
                    { id: 's2', label: 'School enrolled', status: 'completed' },
                    { id: 's3', label: 'Documents uploaded', status: 'current' },
                    { id: 's4', label: 'Proof of funds issued', status: 'upcoming' },
                    { id: 's5', label: 'Disbursement', status: 'blocked' },
                  ]}
                />
              </div>
            </div>

            {/* FilterBar */}
            <div className="space-y-3">
              <p className="font-medium text-foreground">FilterBar</p>
              <Code>{`import { FilterBar } from '@/components/ui/filter-bar'`}</Code>
              <FilterBar
                query=""
                chips={[
                  { key: 'all', label: 'All', count: 42 },
                  { key: 'pending', label: 'Pending', count: 8 },
                  { key: 'verified', label: 'Verified', count: 31 },
                  { key: 'rejected', label: 'Rejected', count: 3 },
                ]}
                activeChip="all"
                queryPlaceholder="Search students..."
              />
            </div>

            {/* DataTableShell */}
            <div className="space-y-3">
              <p className="font-medium text-foreground">DataTableShell — table + mobile card fallback</p>
              <Code>{`import { DataTableShell } from '@/components/ui/data-table-shell'`}</Code>
              <DataTableShellDemo />
              <DataTableShell columns={[{ key: 'name', header: 'Name' }]} rows={[]} emptyLabel="No students found." />
              <DataTableShell columns={[{ key: 'name', header: 'Name' }]} rows={[]} loading />
            </div>

          </div>
        </Section>

        <div className="border-t border-border/40" />

        {/* ── Layout Primitives ── */}
        <Section id="primitives-layout" title="Layout Primitives">
          <div className="space-y-10">

            {/* PageHeader */}
            <div className="space-y-3">
              <p className="font-medium text-foreground">PageHeader</p>
              <Code>{`import { PageHeader } from '@/components/ui/page-header'`}</Code>
              <div className="rounded-xl border border-border bg-card p-5">
                <PageHeader
                  title="Student Dashboard"
                  subtitle="Manage your sponsorship applications and documents."
                  badge={<StatusBadge status="verified" size="sm" />}
                  meta="Last updated 3 minutes ago"
                  actions={
                    <button
                      type="button"
                      className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
                    >
                      Export
                    </button>
                  }
                />
              </div>
            </div>

            {/* EmptyState */}
            <div className="space-y-3">
              <p className="font-medium text-foreground">EmptyState</p>
              <Code>{`import { EmptyState } from '@/components/ui/empty-state'`}</Code>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-card">
                  <EmptyState
                    heading="No documents uploaded yet"
                    body="Upload your admission letter, school ID, and other required documents to proceed."
                    action={{ label: 'Upload your first document', href: '#' }}
                  />
                </div>
                <div className="rounded-xl border border-border bg-card">
                  <EmptyState
                    heading="No sponsorships found"
                    body="You have not received any sponsorship offers. Share your profile to attract sponsors."
                  />
                </div>
              </div>
            </div>

          </div>
        </Section>

        <div className="border-t border-border/40" />

        {/* ── Session Management ── */}
        <Section id="primitives-session" title="Session Management">
          <div className="space-y-3">
            <Code>{`import { SessionManagement } from '@/components/ui/session-management'`}</Code>
            <div className="max-w-xl">
              <SessionManagementDemo />
            </div>
          </div>
        </Section>
      </main>
    </div>
  );
}
