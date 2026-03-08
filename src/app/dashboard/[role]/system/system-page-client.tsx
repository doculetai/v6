'use client';

import {
  CheckCircle,
  CloudArrowUp,
  Database,
  EnvelopeSimple,
  ShieldCheck,
} from '@/components/icons';

import { Grid, PageShell } from '@/components/layout/content-primitives';
import { MetricCard } from '@/components/ui/metric-card';
import { adminCopy } from '@/config/copy/admin';

type ServiceStatus = 'operational' | 'degraded' | 'down';

interface ServiceInfo {
  name: string;
  status: ServiceStatus;
  icon: React.ReactNode;
}

const healthCopy = adminCopy.dashboard.systemHealth;

const STATUS_STYLES: Record<ServiceStatus, string> = {
  operational: 'text-success',
  degraded: 'text-warning',
  down: 'text-destructive',
};

const STATUS_DOT: Record<ServiceStatus, string> = {
  operational: 'bg-success',
  degraded: 'bg-warning',
  down: 'bg-destructive',
};

function ServiceCard({ service }: { service: ServiceInfo }) {
  const statusLabel = healthCopy.status[service.status];
  const dotClass = STATUS_DOT[service.status];
  const textClass = STATUS_STYLES[service.status];

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-muted/60">
            {service.icon}
          </div>
          <p className="text-sm font-medium text-foreground">{service.name}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`inline-block size-2 rounded-full ${dotClass}`} />
          <span className={`text-xs font-medium ${textClass}`}>{statusLabel}</span>
        </div>
      </div>
    </div>
  );
}

export function SystemPageClient() {
  // Static health check — no tRPC call needed.
  // In production these would ping real health endpoints.
  const systemCopy = adminCopy.system;
  const services: ServiceInfo[] = [
    {
      name: systemCopy.serviceNames.database,
      status: 'operational',
      icon: <Database className="size-5 text-foreground" weight="duotone" aria-hidden="true" />,
    },
    {
      name: systemCopy.serviceNames.auth,
      status: 'operational',
      icon: <ShieldCheck className="size-5 text-foreground" weight="duotone" aria-hidden="true" />,
    },
    {
      name: systemCopy.serviceNames.storage,
      status: 'operational',
      icon: <CloudArrowUp className="size-5 text-foreground" weight="duotone" aria-hidden="true" />,
    },
    {
      name: systemCopy.serviceNames.email,
      status: 'operational',
      icon: <EnvelopeSimple className="size-5 text-foreground" weight="duotone" aria-hidden="true" />,
    },
  ];

  const operationalCount = services.filter((s) => s.status === 'operational').length;
  const degradedCount = services.filter((s) => s.status === 'degraded').length;
  const downCount = services.filter((s) => s.status === 'down').length;

  return (
    <PageShell>
      {/* Summary metrics */}
      <Grid cols={{ sm: 2, lg: 4 }} gap="sm">
        <MetricCard label={healthCopy.title} value={systemCopy.servicesCount(services.length)} />
        <MetricCard
          label={healthCopy.status.operational}
          value={operationalCount}
        />
        <MetricCard
          label={healthCopy.status.degraded}
          value={degradedCount}
        />
        <MetricCard
          label={healthCopy.status.down}
          value={downCount}
        />
      </Grid>

      {/* All services OK banner */}
      {operationalCount === services.length ? (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-5">
          <CheckCircle className="size-6 text-success" weight="duotone" aria-hidden="true" />
          <p className="text-sm font-medium text-foreground">
            {systemCopy.allServicesOk(healthCopy.status.operational)}
          </p>
        </div>
      ) : null}

      {/* Service cards */}
      <Grid cols={{ sm: 1, lg: 2 }} gap="sm">
        {services.map((service) => (
          <ServiceCard key={service.name} service={service} />
        ))}
      </Grid>

      {/* Additional service integrations */}
      <div className="space-y-3">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {systemCopy.thirdPartyIntegrations}
        </h2>
        <Grid cols={{ sm: 1, lg: 2 }} gap="sm">
          <MetricCard label={healthCopy.kycService} value={healthCopy.status.operational} />
          <MetricCard label={healthCopy.bankingService} value={healthCopy.status.operational} />
          <MetricCard label={healthCopy.paymentService} value={healthCopy.status.operational} />
          <MetricCard label={healthCopy.emailService} value={healthCopy.status.operational} />
        </Grid>
      </div>
    </PageShell>
  );
}
