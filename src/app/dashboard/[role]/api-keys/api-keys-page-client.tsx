'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';

import { CreateKeyDialog } from '@/components/partner/CreateKeyDialog';
import { RevokeKeyDialog } from '@/components/partner/RevokeKeyDialog';
import { Button } from '@/components/ui/button';
import { DataTableShell } from '@/components/ui/data-table-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { TimestampLabel } from '@/components/ui/timestamp-label';
import { partnerCopy } from '@/config/copy/partner';
import { trpc } from '@/trpc/client';

const copy = partnerCopy.apiKeys;

type ApiKey = {
  id: string;
  name: string;
  environment: string;
  keyPrefix: string;
  scopes: string[];
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
};

interface ApiKeysPageClientProps {
  initialKeys: ApiKey[];
}

export function ApiKeysPageClient({ initialKeys }: ApiKeysPageClientProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [revokeTargetId, setRevokeTargetId] = useState<string | null>(null);

  const { data: keys, refetch } = trpc.partner.listApiKeys.useQuery(undefined, {
    initialData: initialKeys,
    refetchOnMount: false,
  });

  const createMutation = trpc.partner.createApiKey.useMutation({
    onSuccess: () => { void refetch(); },
  });

  const revokeMutation = trpc.partner.revokeApiKey.useMutation({
    onSuccess: () => {
      setRevokeTargetId(null);
      void refetch();
    },
  });

  const columns = [
    {
      key: 'name' as const,
      header: copy.table.name,
      cell: (row: ApiKey) => (
        <span className="font-medium text-foreground">{row.name}</span>
      ),
    },
    {
      key: 'environment' as const,
      header: copy.table.environment,
      cell: (row: ApiKey) => (
        <span className="text-sm capitalize text-muted-foreground">{row.environment}</span>
      ),
    },
    {
      key: 'keyPrefix' as const,
      header: copy.table.key,
      cell: (row: ApiKey) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.keyPrefix}
          {'•'.repeat(8)}
        </span>
      ),
    },
    {
      key: 'lastUsedAt' as const,
      header: copy.table.lastUsed,
      cell: (row: ApiKey) =>
        row.lastUsedAt ? (
          <TimestampLabel value={row.lastUsedAt} mode="relative" />
        ) : (
          <span className="text-sm text-muted-foreground/60">—</span>
        ),
    },
    {
      key: 'createdAt' as const,
      header: copy.table.created,
      cell: (row: ApiKey) => <TimestampLabel value={row.createdAt} mode="absolute" />,
    },
    {
      key: 'revokedAt' as const,
      header: copy.table.status,
      cell: (row: ApiKey) =>
        row.revokedAt ? (
          <StatusBadge status="rejected" label={copy.statusLabels.revoked} size="sm" />
        ) : (
          <StatusBadge status="verified" label={copy.statusLabels.active} size="sm" />
        ),
    },
    {
      key: 'id' as const,
      header: copy.table.action,
      cell: (row: ApiKey) => (
        <Button
          variant="ghost"
          size="sm"
          disabled={row.revokedAt !== null}
          onClick={() => setRevokeTargetId(row.id)}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none"
        >
          {copy.actions.revoke}
        </Button>
      ),
    },
  ] as const;

  const activeKeys = keys ?? initialKeys;

  return (
    <div className="space-y-6">
      <PageHeader
        title={copy.title}
        subtitle={copy.subtitle}
        actions={
          <Button onClick={() => setCreateOpen(true)} className="min-h-11">
            <Plus className="size-5" aria-hidden="true" />
            {copy.createKey.cta}
          </Button>
        }
      />

      {activeKeys.length === 0 ? (
        <EmptyState
          heading={copy.empty.title}
          body={copy.empty.description}
          action={{ label: copy.empty.cta, onClick: () => setCreateOpen(true) }}
        />
      ) : (
        <DataTableShell
          columns={columns}
          rows={activeKeys}
        />
      )}

      <CreateKeyDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => { /* data refreshed via refetch in mutation onSuccess */ }}
        onSubmit={(values) => createMutation.mutateAsync(values)}
      />

      <RevokeKeyDialog
        open={revokeTargetId !== null}
        onOpenChange={(open) => { if (!open) setRevokeTargetId(null); }}
        onConfirm={() => {
          if (revokeTargetId) {
            revokeMutation.mutate({ keyId: revokeTargetId });
          }
        }}
        isPending={revokeMutation.isPending}
      />
    </div>
  );
}
