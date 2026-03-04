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
import { Code, DataTableShellDemo, Section } from './_helpers';

export function DesignDisplaySections() {
  return (
    <>
      <div className="border-t border-border/40" />

      {/* ── Display Primitives ── */}
      <Section id="primitives-display" title="Display Primitives">
        <div className="space-y-10">
          <div className="space-y-3">
            <p className="font-medium text-foreground">StatusBadge</p>
            <Code>{`import { StatusBadge } from '@/components/ui/status-badge'`}</Code>
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-5">
              <StatusBadge status="pending" />
              <StatusBadge status="verified" />
              <StatusBadge status="rejected" />
              <StatusBadge status="attention" />
              <StatusBadge status="expired" />
              <StatusBadge status="verified" size="sm" />
              <StatusBadge status="verified" size="lg" />
            </div>
          </div>

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

          <div className="space-y-3">
            <p className="font-medium text-foreground">MoneyValue</p>
            <Code>{`import { MoneyValue } from '@/components/ui/money-value'`}</Code>
            <div className="flex flex-wrap items-baseline gap-6 rounded-xl border border-border bg-card p-5">
              <MoneyValue amountMinor={150000} display="full" />
              <MoneyValue amountMinor={2500000} display="full" />
              <MoneyValue amountMinor={10000000} display="compact" />
              <MoneyValue amountMinor={150000} showCode={false} />
            </div>
          </div>

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

          <div className="space-y-3">
            <p className="font-medium text-foreground">MaskedValue</p>
            <Code>{`import { MaskedValue } from '@/components/ui/masked-value'`}</Code>
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
              <MaskedValue value="1234567890123456" label="Card number" />
              <MaskedValue value="08123456789" label="Phone" />
              <MaskedValue value="admin@doculet.ai" />
            </div>
          </div>

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
    </>
  );
}
