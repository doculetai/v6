import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
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
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';

import { SessionManagementDemo } from './SessionManagementDemo';
import { Code, Section } from './_helpers';

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
