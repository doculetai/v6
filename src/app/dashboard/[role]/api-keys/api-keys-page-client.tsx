'use client';

import { useState } from 'react';

import { partnerCopy } from '@/config/copy/partner';
import { trpc } from '@/trpc/client';

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

const ALL_SCOPES = ['verificationsRead', 'certificatesRead', 'webhooksWrite', 'studentsRead'] as const;
type ScopeKey = (typeof ALL_SCOPES)[number];

export function ApiKeysPageClient({ initialKeys, copy }: Props) {
  const [keys, setKeys] = useState<ApiKey[]>(initialKeys);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [revokeConfirmId, setRevokeConfirmId] = useState<string | null>(null);
  const [selectedScopes, setSelectedScopes] = useState<ScopeKey[]>([]);
  const [copiedKey, setCopiedKey] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [environment, setEnvironment] = useState<'production' | 'sandbox'>('production');

  const createMutation = trpc.partner.createApiKey.useMutation({
    onSuccess(result) {
      setKeys((prev) => [
        { ...result, lastUsedAt: null, revokedAt: null, isActive: true },
        ...prev,
      ]);
      setCreatedKey(result.rawKey);
      setShowCreateDialog(false);
      setSelectedScopes([]);
      setKeyName('');
      setEnvironment('production');
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

  const activeKeys = keys.filter((k) => k.isActive);

  return (
    <section className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{copy.title}</h1>
          <p className="text-sm text-muted-foreground">{copy.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateDialog(true)}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {copy.createKey.cta}
        </button>
      </header>

      {/* Key list */}
      {activeKeys.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card py-16 text-center">
          <p className="text-sm font-medium text-foreground">{copy.empty.title}</p>
          <p className="max-w-xs text-xs text-muted-foreground">{copy.empty.description}</p>
          <button
            type="button"
            onClick={() => setShowCreateDialog(true)}
            className="mt-2 inline-flex h-9 items-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          key.isActive
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {key.isActive ? copy.statusLabels.active : copy.statusLabels.revoked}
                      </span>
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
                          className="text-xs font-medium text-destructive hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      key.isActive
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {key.isActive ? copy.statusLabels.active : copy.statusLabels.revoked}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {copy.table.created}: {key.createdAt.toLocaleDateString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {copy.table.lastUsed}: {key.lastUsedAt ? key.lastUsedAt.toLocaleDateString() : '—'}
                </p>
                {key.isActive && (
                  <button
                    type="button"
                    onClick={() => setRevokeConfirmId(key.id)}
                    className="mt-3 text-xs font-medium text-destructive hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {copy.actions.revoke}
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
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-foreground">{copy.createKey.title}</h2>

            <div className="mt-4 flex flex-col gap-4">
              {/* Key name */}
              <div>
                <label
                  htmlFor="keyName"
                  className="mb-1 block text-sm font-medium text-foreground"
                >
                  {copy.createKey.nameLabel}
                </label>
                <input
                  id="keyName"
                  type="text"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder={copy.createKey.nameHint}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              {/* Environment */}
              <div>
                <label
                  htmlFor="environment"
                  className="mb-1 block text-sm font-medium text-foreground"
                >
                  {copy.createKey.environmentLabel}
                </label>
                <select
                  id="environment"
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value as 'production' | 'sandbox')}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="production">{copy.createKey.environments.production}</option>
                  <option value="sandbox">{copy.createKey.environments.sandbox}</option>
                </select>
              </div>
            </div>

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
                  setKeyName('');
                  setEnvironment('production');
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
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-foreground">{copy.newKeyCreated.title}</h2>
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
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-foreground">{copy.revokeDialog.title}</h2>
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
    </section>
  );
}
