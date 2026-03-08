'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Callout } from '@/components/ui/callout';
import { PageHeader, PageShell } from '@/components/layout/content-primitives';
import { partnerCopy } from '@/config/copy/partner';
import { cn } from '@/lib/utils';
import { trpc } from '@/trpc/client';

const revokedCopy = partnerCopy.revoked;
const allRevokedCopy = partnerCopy.allKeysRevoked;
const usageCopy = partnerCopy.apiKeys.usage;
const keyLimitCopy = partnerCopy.keyLimit;

type ApiKey = {
  id: string;
  keyPrefix: string;
  scopes: string[];
  lastUsedAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
  isActive: boolean;
};

type Props = {
  initialKeys: ApiKey[];
  copy: typeof partnerCopy.apiKeys;
};

const ALL_SCOPES = ['students:read', 'students:write', 'certificates:read', 'certificates:verify'] as const;
type ScopeKey = (typeof ALL_SCOPES)[number];

export function ApiKeysPageClient({ initialKeys, copy }: Props) {
  const [keys, setKeys] = useState<ApiKey[]>(initialKeys);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [revokeConfirmId, setRevokeConfirmId] = useState<string | null>(null);
  const [selectedScopes, setSelectedScopes] = useState<ScopeKey[]>([]);
  const [copiedKey, setCopiedKey] = useState(false);

  const createMutation = trpc.partner.createApiKey.useMutation({
    onSuccess(result) {
      setKeys((prev) => [
        { ...result, lastUsedAt: null, revokedAt: null, isActive: true },
        ...prev,
      ]);
      setCreatedKey(result.rawKey);
      setShowCreateDialog(false);
      setSelectedScopes([]);
    },
  });

  const revokeMutation = trpc.partner.revokeApiKey.useMutation({
    onSuccess(_, vars) {
      setKeys((prev) =>
        prev.map((k) =>
          k.id === vars.keyId ? { ...k, isActive: false, revokedAt: new Date() } : k,
        ),
      );
      setRevokeConfirmId(null);
    },
  });

  const { data: usageData } = trpc.partner.getApiUsage.useQuery();

  const activeKeys = keys.filter((k) => k.isActive);
  const atLimit = activeKeys.length >= 3;
  const allRevoked = keys.length > 0 && activeKeys.length === 0;

  const [reinstateFeedback, setReinstateFeedback] = useState<string | null>(null);
  const reinstateMutation = trpc.partner.requestKeyReinstatement.useMutation({
    onSuccess() {
      setReinstateFeedback(revokedCopy.reinstateSuccess);
      setTimeout(() => setReinstateFeedback(null), 4000);
    },
  });

  function toggleScope(scope: ScopeKey) {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope],
    );
  }

  function handleCopyKey() {
    if (!createdKey) return;
    void navigator.clipboard.writeText(createdKey).then(() => {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    });
  }

  return (
    <PageShell>
      <PageHeader
        title={copy.title}
        subtitle={copy.subtitle}
        actions={
          atLimit ? undefined : (
            <Button onClick={() => setShowCreateDialog(true)}>
              {copy.createKey.cta}
            </Button>
          )
        }
      />

      {/* All-keys-revoked suspended banner */}
      {allRevoked && (
        <div
          role="alert"
          className="mb-4 flex flex-col gap-2 rounded-xl border border-destructive/30 bg-destructive/8 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-sm font-semibold text-destructive">{allRevokedCopy.banner}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{allRevokedCopy.body}</p>
          </div>
          <a
            href={allRevokedCopy.ctaHref}
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-destructive/40 bg-background px-4 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {allRevokedCopy.cta}
          </a>
        </div>
      )}

      {/* Key limit notice */}
      {atLimit && (
        <div className="mb-4">
          <Callout variant="warning">
            <span className="font-medium">{keyLimitCopy.heading}</span>
            {' '}
            {keyLimitCopy.body}
          </Callout>
        </div>
      )}

      {/* Inline usage meter */}
      {usageData && usageData.total > 0 && (
        <div className="mb-4 rounded-xl border border-border bg-card px-5 py-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {usageCopy.heading}
            </p>
            <p className="font-mono text-sm text-foreground">
              {usageData.total.toLocaleString()} {usageCopy.of} {usageData.dailyLimit.toLocaleString()} {usageCopy.requests}
            </p>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                usageData.total / usageData.dailyLimit >= 0.8
                  ? 'bg-warning'
                  : 'bg-primary',
              )}
              style={{ width: `${Math.min((usageData.total / usageData.dailyLimit) * 100, 100)}%` }}
            />
          </div>
          {usageData.total / usageData.dailyLimit >= 0.8 && (
            <p className="mt-1.5 text-xs font-medium text-warning">
              {usageCopy.warningThreshold}
            </p>
          )}
        </div>
      )}

      {/* Reinstatement feedback */}
      {reinstateFeedback && (
        <p role="status" className="mb-3 text-sm text-success">{reinstateFeedback}</p>
      )}

      {/* Key list */}
      {keys.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card py-16 text-center">
          <p className="text-sm font-medium text-foreground">{copy.empty.title}</p>
          <p className="max-w-xs text-xs text-muted-foreground">{copy.empty.description}</p>
          <button
            type="button"
            onClick={() => setShowCreateDialog(true)}
            className="mt-2 inline-flex min-h-[44px] items-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {copy.empty.cta}
          </button>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-border md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {copy.table.name}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {copy.table.status}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {copy.table.created}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {copy.table.lastUsed}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {copy.table.action}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {keys.map((key) => (
                  <tr key={key.id}>
                    <td className="px-4 py-3 font-mono text-sm text-foreground">
                      {key.keyPrefix}...
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                            key.isActive
                              ? 'bg-primary/10 text-primary'
                              : 'bg-destructive/10 text-destructive',
                          )}
                        >
                          {key.isActive ? copy.statusLabels.active : revokedCopy.keyBadge}
                        </span>
                        {!key.isActive && (
                          <button
                            type="button"
                            disabled={reinstateMutation.isPending}
                            onClick={() => reinstateMutation.mutate({ keyId: key.id })}
                            className="min-h-[44px] px-1 text-xs font-medium text-primary underline underline-offset-2 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {revokedCopy.reinstateAction}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {key.createdAt.toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {key.lastUsedAt ? key.lastUsedAt.toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {key.isActive && (
                        <button
                          type="button"
                          onClick={() => setRevokeConfirmId(key.id)}
                          className="min-h-[44px] px-2 text-xs font-medium text-destructive hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {copy.actions.revoke}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {keys.map((key) => (
              <div key={key.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-mono text-sm text-foreground">{key.keyPrefix}...</p>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                      key.isActive
                        ? 'bg-primary/10 text-primary'
                        : 'bg-destructive/10 text-destructive',
                    )}
                  >
                    {key.isActive ? copy.statusLabels.active : revokedCopy.keyBadge}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {copy.table.created}: {key.createdAt.toLocaleDateString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {copy.table.lastUsed}: {key.lastUsedAt ? key.lastUsedAt.toLocaleDateString() : '—'}
                </p>
                {key.isActive ? (
                  <button
                    type="button"
                    onClick={() => setRevokeConfirmId(key.id)}
                    className="mt-3 min-h-[44px] text-xs font-medium text-destructive hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {copy.actions.revoke}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={reinstateMutation.isPending}
                    onClick={() => reinstateMutation.mutate({ keyId: key.id })}
                    className="mt-3 min-h-[44px] text-xs font-medium text-primary underline underline-offset-2 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {revokedCopy.reinstateAction}
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Create key dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-key-dialog-title"
            className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl"
          >
            <h2 id="create-key-dialog-title" className="text-lg font-semibold text-foreground">{copy.createKey.title}</h2>

            <p className="mt-4 text-sm text-muted-foreground">{copy.createKey.scopesLabel}</p>

            <div className="mt-2 flex flex-col gap-2">
              {ALL_SCOPES.map((scope) => (
                <label
                  key={scope}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-background p-3 transition-colors hover:bg-muted"
                >
                  <input
                    type="checkbox"
                    checked={selectedScopes.includes(scope)}
                    onChange={() => toggleScope(scope)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-ring"
                  />
                  <span className="text-sm text-foreground">{copy.createKey.scopes[scope]}</span>
                </label>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowCreateDialog(false);
                  setSelectedScopes([]);
                }}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {copy.createKey.cancel}
              </button>
              <button
                type="button"
                disabled={selectedScopes.length === 0 || createMutation.isPending}
                onClick={() => createMutation.mutate({ scopes: [...selectedScopes] })}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {createMutation.isPending ? copy.createKey.creatingCta : copy.createKey.confirmCta}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Newly created key reveal */}
      {createdKey !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-key-dialog-title"
            className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl"
          >
            <h2 id="new-key-dialog-title" className="text-lg font-semibold text-foreground">{copy.newKeyCreated.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{copy.newKeyCreated.description}</p>

            <div className="mt-4 rounded-lg border border-border bg-muted p-3">
              <p className="mb-1 text-xs font-medium text-muted-foreground">{copy.newKeyCreated.copyLabel}</p>
              <code className="block break-all text-xs font-mono text-foreground">{createdKey}</code>
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCopyKey}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {copiedKey ? copy.newKeyCreated.copied : copy.newKeyCreated.copyCta}
              </button>
              <button
                type="button"
                onClick={() => setCreatedKey(null)}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {copy.newKeyCreated.doneCta}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revoke confirm dialog */}
      {revokeConfirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="revoke-dialog-title"
            className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl"
          >
            <h2 id="revoke-dialog-title" className="text-lg font-semibold text-foreground">{copy.revokeDialog.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{copy.revokeDialog.description}</p>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setRevokeConfirmId(null)}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {copy.revokeDialog.cancel}
              </button>
              <button
                type="button"
                disabled={revokeMutation.isPending}
                onClick={() => revokeMutation.mutate({ keyId: revokeConfirmId })}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-destructive px-4 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {revokeMutation.isPending ? copy.actions.revoking : copy.revokeDialog.confirmCta}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
