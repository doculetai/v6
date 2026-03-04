import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';

import { SessionManagementDemo } from './SessionManagementDemo';
import { Code, Section } from './_helpers';

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
