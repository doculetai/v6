'use client';

import { ActivityTimeline } from '@/components/ui/activity-timeline';
import { Badge } from '@/components/ui/badge';
import { FilterBar } from '@/components/ui/filter-bar';
import { MetricCard } from '@/components/ui/metric-card';
import { MoneyValue } from '@/components/ui/money-value';
import { PageHeader } from '@/components/ui/page-header';
import { PipelineStepper } from '@/components/ui/pipeline-stepper';
import { StatusBadge } from '@/components/ui/status-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { DataTableShellDemo, Section } from './_helpers';
import { designLabCopy as c } from '@/config/copy/design-lab';

const now = new Date();
const tenMinAgo = new Date(now.getTime() - 10 * 60 * 1000);
const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

export function CompositionExamples() {
  return (
    <Section id="compositions" title={c.sections.compositions}>
      <p className="max-w-prose text-sm text-muted-foreground">
        How components combine into real dashboard surfaces. These are the patterns
        developers should copy when building pages.
      </p>

      <div className="space-y-10 pt-2">
        {/* ── Dashboard Overview Surface ── */}
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
            Dashboard Overview
          </p>
          <div className="rounded-xl border border-border bg-card">
            <div className="border-b border-border/40 p-5">
              <PageHeader
                title={c.demo.overviewTitle}
                subtitle={c.demo.overviewSubtitle}
                badge={<StatusBadge status="verified" size="sm" />}
              />
            </div>
            <div className="grid gap-px bg-border/30 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-card p-4">
                <MetricCard
                  label={c.demo.metrics.totalFunded}
                  value={<MoneyValue amountMinor={4250000} />}
                  deltaValue="+12%"
                  deltaLabel="vs last month"
                  deltaDirection="up"
                />
              </div>
              <div className="bg-card p-4">
                <MetricCard
                  label={c.demo.metrics.activeStudents}
                  value="18"
                  deltaValue="+3"
                  deltaLabel="this week"
                  deltaDirection="up"
                />
              </div>
              <div className="bg-card p-4">
                <MetricCard
                  label={c.demo.metrics.pendingReviews}
                  value="7"
                  deltaValue="-2"
                  deltaLabel="since yesterday"
                  deltaDirection="down"
                />
              </div>
              <div className="bg-card p-4">
                <MetricCard
                  label={c.demo.metrics.disbursed}
                  value={<MoneyValue amountMinor={2800000} display="compact" />}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── List Page Surface ── */}
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
            List Page
          </p>
          <div className="space-y-0 rounded-xl border border-border bg-card">
            <div className="border-b border-border/40 p-5">
              <PageHeader
                title={c.demo.studentsTitle}
                subtitle={c.demo.studentsSubtitle}
                actions={
                  <Badge variant="secondary">42 total</Badge>
                }
              />
            </div>
            <div className="border-b border-border/40 px-5 py-3">
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
            <div>
              <DataTableShellDemo />
            </div>
          </div>
        </div>

        {/* ── Detail / Profile Surface ── */}
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
            Detail View
          </p>
          <div className="rounded-xl border border-border bg-card">
            <div className="border-b border-border/40 p-5">
              <PageHeader
                title={c.demo.profileName}
                subtitle={c.demo.profileSchool}
                badge={<StatusBadge status="verified" size="sm" />}
                meta="Applied 3 days ago"
              />
            </div>
            <div className="p-5">
              <Tabs defaultValue="journey">
                <TabsList>
                  <TabsTrigger value="journey">Journey</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>
                <TabsContent value="journey" className="mt-4">
                  <PipelineStepper
                    steps={[
                      { id: 's1', label: 'Identity verified', status: 'completed' },
                      { id: 's2', label: 'School enrolled', status: 'completed' },
                      { id: 's3', label: 'Documents uploaded', status: 'current' },
                      { id: 's4', label: 'Proof of funds', status: 'upcoming' },
                      { id: 's5', label: 'Disbursement', status: 'blocked' },
                    ]}
                  />
                </TabsContent>
                <TabsContent value="activity" className="mt-4">
                  <ActivityTimeline
                    items={[
                      { id: '1', title: 'Proof of funds verified', description: 'University of Lagos confirmed.', timestamp: tenMinAgo.toISOString(), tone: 'success' },
                      { id: '2', title: 'Document flagged', description: 'Admission letter requires re-upload.', timestamp: twoHoursAgo.toISOString(), tone: 'warning' },
                      { id: '3', title: 'Sponsorship scheduled', timestamp: oneDayAgo.toISOString(), tone: 'info' },
                    ]}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
