import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ActivityTimeline } from '@/components/ui/activity-timeline';
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { CommitmentEvent } from '@/components/ui/commitment-timeline';
import { CommitmentTimeline } from '@/components/ui/commitment-timeline';
import { ControlToolbar } from '@/components/ui/control-toolbar';
import { DataTableShell } from '@/components/ui/data-table-shell';
import type { DisbursementStage } from '@/components/ui/disbursement-flow';
import { DisbursementFlow } from '@/components/ui/disbursement-flow';
import { EarningsPanel } from '@/components/ui/earnings-panel';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { FileUploader } from '@/components/ui/file-uploader';
import { FilterBar } from '@/components/ui/filter-bar';
import { IconAudit } from '@/components/ui/icon-audit';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MaskedValue } from '@/components/ui/masked-value';
import { MetricCard } from '@/components/ui/metric-card';
import { MoneyValue } from '@/components/ui/money-value';
import { PageHeader } from '@/components/ui/page-header';
import { PipelineStepper } from '@/components/ui/pipeline-stepper';
import { Progress } from '@/components/ui/progress';
import { StatusBadge } from '@/components/ui/status-badge';
import { SurfacePanel } from '@/components/ui/surface-panel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TimestampLabel } from '@/components/ui/timestamp-label';

import { SessionManagementDemo } from './SessionManagementDemo';
import { Code, DataTableShellDemo, Section } from './_helpers';

const now = new Date();
const threeMinutesAgo = new Date(now.getTime() - 3 * 60 * 1000);
const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

const demoCommitments: CommitmentEvent[] = [
  { id: 'c1', label: 'Initial sponsorship committed', amount: 500000, currency: 'NGN', date: threeDaysAgo.toISOString(), status: 'fulfilled' },
  { id: 'c2', label: 'Second tranche signed', amount: 750000, currency: 'NGN', date: oneDayAgo.toISOString(), status: 'active' },
  { id: 'c3', label: 'Top-up commitment created', amount: 250000, currency: 'NGN', date: twoHoursAgo.toISOString(), status: 'created' },
];

const demoDisbursementStage: DisbursementStage = 'cleared';

export function DesignDisplaySections() {
  return (
    <>
      <div className="border-t border-border/40" />

      {/* ── Interactive Primitives ── */}
      <Section id="primitives-interactive" title="Interactive Primitives">
        <div className="space-y-10">

          {/* Button */}
          <div className="space-y-3">
            <p className="font-medium text-foreground">Button</p>
            <Code>{`import { Button } from '@/components/ui/button'`}</Code>
            <div className="space-y-4 rounded-xl border border-border bg-card p-5">
              <div>
                <p className="mb-2 text-xs text-muted-foreground">Variants</p>
                <div className="flex flex-wrap gap-2">
                  <Button>Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="link">Link</Button>
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs text-muted-foreground">Sizes</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="xs">XS</Button>
                  <Button size="sm">SM</Button>
                  <Button>Default</Button>
                  <Button size="lg">LG</Button>
                  <Button disabled>Disabled</Button>
                </div>
              </div>
            </div>
          </div>

          {/* Badge */}
          <div className="space-y-3">
            <p className="font-medium text-foreground">Badge</p>
            <Code>{`import { Badge } from '@/components/ui/badge'`}</Code>
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-5">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="ghost">Ghost</Badge>
            </div>
          </div>

          {/* Avatar */}
          <div className="space-y-3">
            <p className="font-medium text-foreground">Avatar</p>
            <Code>{`import { Avatar, AvatarFallback, AvatarGroup } from '@/components/ui/avatar'`}</Code>
            <div className="flex flex-wrap items-center gap-6 rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <Avatar size="sm"><AvatarFallback>KA</AvatarFallback></Avatar>
                <Avatar><AvatarFallback>OA</AvatarFallback></Avatar>
                <Avatar size="lg"><AvatarFallback>SC</AvatarFallback></Avatar>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">Group:</p>
                <AvatarGroup>
                  <Avatar><AvatarFallback className="bg-primary/10 text-primary">KA</AvatarFallback></Avatar>
                  <Avatar><AvatarFallback className="bg-primary/10 text-primary">OA</AvatarFallback></Avatar>
                  <Avatar><AvatarFallback className="bg-primary/10 text-primary">SC</AvatarFallback></Avatar>
                  <AvatarGroupCount>+5</AvatarGroupCount>
                </AvatarGroup>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-3">
            <p className="font-medium text-foreground">Progress</p>
            <Code>{`import { Progress } from '@/components/ui/progress'`}</Code>
            <div className="space-y-4 rounded-xl border border-border bg-card p-5">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Documents uploaded</span><span>4/5</span>
                </div>
                <Progress value={80} />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Verification tier</span><span>3/5</span>
                </div>
                <Progress value={60} />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Profile complete</span><span>25%</span>
                </div>
                <Progress value={25} />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="space-y-3">
            <p className="font-medium text-foreground">Tabs</p>
            <Code>{`import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'`}</Code>
            <div className="rounded-xl border border-border bg-card p-5">
              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="mt-4">
                  <p className="text-sm text-muted-foreground">Overview content — student funding summary, tier status.</p>
                </TabsContent>
                <TabsContent value="documents" className="mt-4">
                  <p className="text-sm text-muted-foreground">Documents content — uploaded files, status, actions.</p>
                </TabsContent>
                <TabsContent value="activity" className="mt-4">
                  <p className="text-sm text-muted-foreground">Activity content — timeline of recent actions.</p>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Input + Label */}
          <div className="space-y-3">
            <p className="font-medium text-foreground">Input + Label</p>
            <Code>{`import { Input } from '@/components/ui/input'; import { Label } from '@/components/ui/label'`}</Code>
            <div className="grid gap-4 rounded-xl border border-border bg-card p-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="email-demo">Email address</Label>
                <Input id="email-demo" type="email" placeholder="kemi@example.com" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone-demo">Phone number</Label>
                <Input id="phone-demo" type="tel" placeholder="+234 800 000 0000" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="disabled-demo">Disabled field</Label>
                <Input id="disabled-demo" disabled value="Cannot edit" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invalid-demo">Invalid state</Label>
                <Input id="invalid-demo" aria-invalid placeholder="Invalid input" className="border-destructive focus-visible:ring-destructive/20" />
              </div>
            </div>
          </div>

        </div>
      </Section>

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
                timestamp={now.toISOString()}
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
              <TimestampLabel value={threeMinutesAgo} mode="relative" />
              <TimestampLabel value={threeMinutesAgo} mode="absolute" />
              <TimestampLabel value={threeMinutesAgo} mode="both" />
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
                  timestamp: tenMinutesAgo.toISOString(),
                  tone: 'success',
                },
                {
                  id: '2',
                  title: 'Document flagged for review',
                  description: 'Admission letter requires re-upload.',
                  timestamp: twoHoursAgo.toISOString(),
                  tone: 'warning',
                },
                {
                  id: '3',
                  title: 'Sponsorship disbursement scheduled',
                  timestamp: oneDayAgo.toISOString(),
                  tone: 'info',
                },
                {
                  id: '4',
                  title: 'Identity verification submitted',
                  timestamp: threeDaysAgo.toISOString(),
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

      {/* ── Form Controls ── */}
      <Section id="primitives-forms" title="Form Controls">
        <div className="space-y-10">

          {/* Accordion */}
          <div className="space-y-3">
            <p className="font-medium text-foreground">Accordion</p>
            <Code>{`import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'`}</Code>
            <Accordion type="single" collapsible className="rounded-xl border border-border bg-card px-4">
              <AccordionItem value="identity">
                <AccordionTrigger>Identity Verification</AccordionTrigger>
                <AccordionContent>NIN, BVN, and passport verification. Tier 1 unlocks basic features. Tier 3 unlocks proof of funds.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="documents">
                <AccordionTrigger>Document Requirements</AccordionTrigger>
                <AccordionContent>Admission letter, school ID, and bank statement required. PDF or high-quality image. Max 10MB each.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="disbursement">
                <AccordionTrigger>Disbursement Process</AccordionTrigger>
                <AccordionContent>Funds are disbursed directly to the institution after proof of funds is verified and signed.</AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Checkbox */}
          <div className="space-y-3">
            <p className="font-medium text-foreground">Checkbox</p>
            <Code>{`import { Checkbox } from '@/components/ui/checkbox'`}</Code>
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground">
                <Checkbox defaultChecked id="cb1" />
                <span>I agree to the terms and conditions</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground">
                <Checkbox id="cb2" />
                <span>Receive disbursement notifications via email</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-muted-foreground">
                <Checkbox id="cb3" disabled />
                <span>Share data with partner institutions (disabled)</span>
              </label>
            </div>
          </div>

          {/* FileUploader */}
          <div className="space-y-3">
            <p className="font-medium text-foreground">FileUploader</p>
            <Code>{`import { FileUploader } from '@/components/ui/file-uploader'`}</Code>
            <div className="rounded-xl border border-border bg-card p-5">
              <FileUploader onUpload={() => {}} accept=".pdf,.jpg,.jpeg,.png" maxSize={10 * 1024 * 1024} />
            </div>
          </div>

          {/* ControlToolbar */}
          <div className="space-y-3">
            <p className="font-medium text-foreground">ControlToolbar</p>
            <Code>{`import { ControlToolbar } from '@/components/ui/control-toolbar'`}</Code>
            <ControlToolbar
              query=""
              onQueryChange={() => {}}
              sortOptions={[
                { value: 'name', label: 'Name A-Z' },
                { value: 'date', label: 'Date applied' },
                { value: 'status', label: 'Status' },
              ]}
              sortValue="name"
              onSortChange={() => {}}
            />
          </div>

        </div>
      </Section>

      <div className="border-t border-border/40" />

      {/* ── Finance Primitives ── */}
      <Section id="primitives-finance" title="Finance Primitives">
        <div className="space-y-10">

          {/* CommitmentTimeline */}
          <div className="space-y-3">
            <p className="font-medium text-foreground">CommitmentTimeline</p>
            <Code>{`import { CommitmentTimeline } from '@/components/ui/commitment-timeline'`}</Code>
            <div className="rounded-xl border border-border bg-card p-5">
              <CommitmentTimeline events={demoCommitments} />
            </div>
          </div>

          {/* DisbursementFlow */}
          <div className="space-y-3">
            <p className="font-medium text-foreground">DisbursementFlow</p>
            <Code>{`import { DisbursementFlow } from '@/components/ui/disbursement-flow'`}</Code>
            <div className="rounded-xl border border-border bg-card p-5">
              <DisbursementFlow currentStage={demoDisbursementStage} />
            </div>
          </div>

          {/* EarningsPanel */}
          <div className="space-y-3">
            <p className="font-medium text-foreground">EarningsPanel</p>
            <Code>{`import { EarningsPanel } from '@/components/ui/earnings-panel'`}</Code>
            <div className="max-w-sm">
              <EarningsPanel
                invitesSent={42}
                converted={18}
                pendingPayout={75000}
                totalPaidOut={320000}
                currency="NGN"
              />
            </div>
          </div>

          {/* ErrorState */}
          <div className="space-y-3">
            <p className="font-medium text-foreground">ErrorState</p>
            <Code>{`import { ErrorState } from '@/components/ui/error-state'`}</Code>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card">
                <ErrorState
                  heading="Failed to load documents"
                  body="There was a problem loading your documents. Please check your connection and try again."
                  action={{ label: 'Try again', onClick: () => {} }}
                />
              </div>
              <div className="rounded-xl border border-border bg-card">
                <ErrorState
                  heading="Payment failed"
                  body="Your payment could not be processed. Please update your payment method."
                  action={{ label: 'Update payment', href: '#' }}
                  secondaryAction={{ label: 'Contact support', href: '#' }}
                />
              </div>
            </div>
          </div>

          {/* IconAudit */}
          <div className="space-y-3">
            <p className="font-medium text-foreground">IconAudit</p>
            <Code>{`import { IconAudit } from '@/components/ui/icon-audit'`}</Code>
            <IconAudit size="md" />
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
