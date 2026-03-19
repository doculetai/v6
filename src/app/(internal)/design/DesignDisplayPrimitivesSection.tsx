'use client';

import { Callout } from '@/components/ui/callout';
import { MaskedValue } from '@/components/ui/masked-value';
import { MetricCard } from '@/components/ui/metric-card';
import { MoneyValue } from '@/components/ui/money-value';
import { StatCard } from '@/components/ui/stat-card';
import { StatGrid } from '@/components/ui/stat-grid';
import { StatusBadge } from '@/components/ui/status-badge';
import { SurfacePanel } from '@/components/ui/surface-panel';
import { TimestampLabel } from '@/components/ui/timestamp-label';
import { TrustSignal } from '@/components/ui/trust-signal';

import { Code, Section } from './_helpers';
import { designLabCopy as c } from '@/config/copy/design-lab';

const now = new Date();
const threeMinutesAgo = new Date(now.getTime() - 3 * 60 * 1000);

export function DesignDisplayPrimitivesSection() {
  return (
    <>
      <div className="border-t border-border/40" />

      {/* ── Display Primitives ── */}
      <Section id="primitives-display" title={c.sections.displayPrimitives}>
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
                label={c.demo.metrics.totalDisbursed}
                value={<MoneyValue amountMinor={1500000} />}
                deltaValue="+12%"
                deltaLabel="vs last month"
                deltaDirection="up"
                timestamp={now.toISOString()}
              />
              <MetricCard
                label={c.demo.metrics.pendingReviews}
                value="34"
                deltaValue="-3"
                deltaLabel="since yesterday"
                deltaDirection="down"
              />
              <MetricCard label={c.demo.metrics.loadingState} value="" loading />
              <MetricCard label={c.demo.metrics.errorState} value="" error />
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
              <MaskedValue value="1234567890123456" label={c.demo.masked.cardNumber} />
              <MaskedValue value="08123456789" label={c.demo.masked.phone} />
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

          {/* StatCard + StatGrid */}
          <div className="space-y-3">
            <p className="font-medium text-foreground">StatCard + StatGrid</p>
            <Code>{`import { StatCard } from '@/components/ui/stat-card'; import { StatGrid } from '@/components/ui/stat-grid'`}</Code>
            <StatGrid columns={4}>
              <StatCard label={c.demo.metrics.totalFunded} value="₦ 4,250,000" fx="$2,780 USD" delta={{ value: '+12%', direction: 'up' }} mono />
              <StatCard label={c.demo.metrics.activeStudents} value="18" delta={{ value: '+3', direction: 'up' }} />
              <StatCard label={c.demo.metrics.pendingReviews} value="7" delta={{ value: '-2', direction: 'down' }} />
              <StatCard label={c.demo.metrics.disbursed} value="₦ 2,800,000" mono />
            </StatGrid>
          </div>

          {/* Callout */}
          <div className="space-y-3">
            <p className="font-medium text-foreground">Callout</p>
            <Code>{`import { Callout } from '@/components/ui/callout'`}</Code>
            <div className="space-y-3">
              <Callout variant="info">Your identity verification is under review. We will notify you once complete.</Callout>
              <Callout variant="warning">Your bank statement is missing the required 3-month balance history.</Callout>
              <Callout variant="success">Proof of funds certificate has been issued and is ready to download.</Callout>
              <Callout variant="error">Verification failed — BVN mismatch. Resubmit with correct NIN.</Callout>
            </div>
          </div>

          {/* TrustSignal */}
          <div className="space-y-3">
            <p className="font-medium text-foreground">TrustSignal</p>
            <Code>{`import { TrustSignal } from '@/components/ui/trust-signal'`}</Code>
            <div className="max-w-sm space-y-2">
              <TrustSignal message="Your documents are encrypted and stored securely. Only authorised reviewers can access them." />
              <TrustSignal message="Bank-grade 256-bit encryption. ISO 27001 compliant." />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
