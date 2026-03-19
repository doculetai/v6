import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BlockedStateCard } from '@/components/ui/blocked-state-card';
import { Checkbox } from '@/components/ui/checkbox';
import type { CommitmentEvent } from '@/components/ui/commitment-timeline';
import { CommitmentTimeline } from '@/components/ui/commitment-timeline';
import { ControlToolbar } from '@/components/ui/control-toolbar';
import type { DisbursementStage } from '@/components/ui/disbursement-flow';
import { DisbursementFlow } from '@/components/ui/disbursement-flow';
import { EarningsPanel } from '@/components/ui/earnings-panel';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { FileUploader } from '@/components/ui/file-uploader';
import { IconAudit } from '@/components/ui/icon-audit';
import { JourneyProgress } from '@/components/ui/journey-progress';
import { PageHeader } from '@/components/ui/page-header';
import { RadioCardGroup, RadioCardItem } from '@/components/ui/radio-card-group';
import { SparklineChart } from '@/components/ui/sparkline';
import { StatusBadge } from '@/components/ui/status-badge';
import { UsageMeter } from '@/components/ui/usage-meter';

import { SessionManagementDemo } from './SessionManagementDemo';
import { Code, Section } from './_helpers';
import { designLabCopy as c } from '@/config/copy/design-lab';

const now = new Date();
const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

const demoCommitments: CommitmentEvent[] = [
  { id: 'c1', label: 'Initial sponsorship committed', amount: 500000, currency: 'NGN', date: threeDaysAgo.toISOString(), status: 'fulfilled' },
  { id: 'c2', label: 'Second tranche signed', amount: 750000, currency: 'NGN', date: oneDayAgo.toISOString(), status: 'active' },
  { id: 'c3', label: 'Top-up commitment created', amount: 250000, currency: 'NGN', date: twoHoursAgo.toISOString(), status: 'created' },
];

const demoDisbursementStage: DisbursementStage = 'cleared';

export function DesignLayoutPrimitives() {
  return (
    <>
      <div className="border-t border-border/40" />

      {/* ── Layout Primitives ── */}
      <Section id="primitives-layout" title={c.sections.layoutPrimitives}>
        <div className="space-y-10">
          <div className="space-y-3">
            <p className="font-medium text-foreground">PageHeader</p>
            <Code>{`import { PageHeader } from '@/components/ui/page-header'`}</Code>
            <div className="rounded-xl border border-border bg-card p-5">
              <PageHeader
                title={c.demo.dashboardTitle}
                subtitle={c.demo.dashboardSubtitle}
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
                  heading={c.demo.emptyDocs.heading}
                  body={c.demo.emptyDocs.body}
                  action={{ label: c.demo.emptyDocs.action, href: '#' }}
                />
              </div>
              <div className="rounded-xl border border-border bg-card">
                <EmptyState
                  heading={c.demo.emptySponsorships.heading}
                  body={c.demo.emptySponsorships.body}
                />
              </div>
            </div>
          </div>

          {/* BlockedStateCard */}
          <div className="space-y-3">
            <p className="font-medium text-foreground">BlockedStateCard</p>
            <Code>{`import { BlockedStateCard } from '@/components/ui/blocked-state-card'`}</Code>
            <div className="max-w-sm">
              <BlockedStateCard
                heading={c.demo.blockedVerification.heading}
                body={c.demo.blockedVerification.body}
                action={{ label: c.demo.blockedVerification.action, href: '#' }}
              />
            </div>
          </div>

          {/* JourneyProgress */}
          <div className="space-y-3">
            <p className="font-medium text-foreground">JourneyProgress</p>
            <Code>{`import { JourneyProgress } from '@/components/ui/journey-progress'`}</Code>
            <JourneyProgress
              stages={[
                { id: 'setup', label: 'Onboarding', status: 'completed' },
                { id: 'verify', label: 'Verification', status: 'completed' },
                { id: 'documents', label: 'Documents', status: 'current' },
                { id: 'proof', label: 'Proof of Funds', status: 'upcoming' },
              ]}
              nextAction={{
                label: 'Documents',
                description: 'Upload your bank statement and supporting documents.',
                cta: 'Upload documents',
                href: '#',
              }}
              allComplete={false}
              completionMessage={null}
            />
          </div>
        </div>
      </Section>

      <div className="border-t border-border/40" />

      {/* ── Form Controls ── */}
      <Section id="primitives-forms" title={c.sections.formControls}>
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

          {/* RadioCardGroup */}
          <div className="space-y-3">
            <p className="font-medium text-foreground">RadioCardGroup</p>
            <Code>{`import { RadioCardGroup, RadioCardItem } from '@/components/ui/radio-card-group'`}</Code>
            <div className="max-w-sm">
              <RadioCardGroup defaultValue="self">
                <RadioCardItem value="self" title={c.demo.sponsorType.self.title} description={c.demo.sponsorType.self.description} />
                <RadioCardItem value="family" title={c.demo.sponsorType.family.title} description={c.demo.sponsorType.family.description} />
                <RadioCardItem value="company" title={c.demo.sponsorType.corporate.title} description={c.demo.sponsorType.corporate.description} />
              </RadioCardGroup>
            </div>
          </div>

        </div>
      </Section>

      <div className="border-t border-border/40" />

      {/* ── Finance Primitives ── */}
      <Section id="primitives-finance" title={c.sections.financePrimitives}>
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
                  heading={c.demo.errorDocs.heading}
                  body={c.demo.errorDocs.body}
                  action={{ label: c.demo.errorDocs.action, onClick: () => {} }}
                />
              </div>
              <div className="rounded-xl border border-border bg-card">
                <ErrorState
                  heading={c.demo.errorPayment.heading}
                  body={c.demo.errorPayment.body}
                  action={{ label: c.demo.errorPayment.primaryAction, href: '#' }}
                  secondaryAction={{ label: c.demo.errorPayment.secondaryAction, href: '#' }}
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

          {/* UsageMeter */}
          <div className="space-y-3">
            <p className="font-medium text-foreground">UsageMeter</p>
            <Code>{`import { UsageMeter } from '@/components/ui/usage-meter'`}</Code>
            <div className="max-w-xs space-y-4 rounded-xl border border-border bg-card p-5">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">API calls today — 340 / 500</p>
                <UsageMeter used={340} limit={500} />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">High usage — 470 / 500</p>
                <UsageMeter used={470} limit={500} />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Low usage — 50 / 500</p>
                <UsageMeter used={50} limit={500} />
              </div>
            </div>
          </div>

          {/* SparklineChart */}
          <div className="space-y-3">
            <p className="font-medium text-foreground">SparklineChart</p>
            <Code>{`import { SparklineChart } from '@/components/ui/sparkline'`}</Code>
            <div className="flex flex-wrap gap-6 rounded-xl border border-border bg-card p-5">
              <div className="w-32 space-y-1">
                <p className="text-xs text-muted-foreground">Disbursements</p>
                <SparklineChart data={[10, 25, 18, 40, 35, 55, 48, 70]} />
              </div>
              <div className="w-32 space-y-1">
                <p className="text-xs text-muted-foreground">Active students</p>
                <SparklineChart data={[5, 8, 7, 12, 15, 14, 18, 20]} color="var(--color-primary-500)" />
              </div>
              <div className="w-32 space-y-1">
                <p className="text-xs text-muted-foreground">Rejections</p>
                <SparklineChart data={[3, 5, 2, 8, 4, 6, 3, 2]} color="var(--destructive)" />
              </div>
            </div>
          </div>

        </div>
      </Section>

      <div className="border-t border-border/40" />

      {/* ── Session Management ── */}
      <Section id="primitives-session" title={c.sections.sessionManagement}>
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
