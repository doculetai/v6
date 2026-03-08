'use client';

import { useState } from 'react';

import { PageHeader, PageShell } from '@/components/layout/content-primitives';
import { partnerCopy } from '@/config/copy/partner';
import { trpc } from '@/trpc/client';

type Webhook = {
  id: string;
  url: string;
  events: string[];
  description: string | null;
  enabled: boolean;
  createdAt: Date | null;
};

type Props = {
  initialData: Webhook[];
};

const WEBHOOK_EVENTS = ['cert_issued', 'doc_approved', 'doc_rejected', 'kyc_complete'] as const;
type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

const copy = partnerCopy.webhooks;

export function WebhooksPageClient({ initialData }: Props) {
  const [webhooks, setWebhooks] = useState<Webhook[]>(initialData);

  // Register dialog state
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerUrl, setRegisterUrl] = useState('');
  const [registerEvents, setRegisterEvents] = useState<WebhookEvent[]>([]);
  const [registerDescription, setRegisterDescription] = useState('');
  const [urlError, setUrlError] = useState('');

  // Secret reveal state
  const [revealSecret, setRevealSecret] = useState<string | null>(null);
  const [secretCopied, setSecretCopied] = useState(false);

  // Delete confirm state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Test delivery result state (keyed by webhook id)
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; statusCode: number | null } | null>>({});

  const registerMutation = trpc.partnerWebhooks.registerWebhook.useMutation({
    onSuccess(result) {
      setWebhooks((prev) => [
        {
          id: result.id,
          url: registerUrl,
          events: registerEvents,
          description: registerDescription || null,
          enabled: true,
          createdAt: new Date(),
        },
        ...prev,
      ]);
      setRevealSecret(result.secret);
      closeRegisterDialog();
    },
  });

  const deleteMutation = trpc.partnerWebhooks.deleteWebhook.useMutation({
    onSuccess(_, vars) {
      setWebhooks((prev) => prev.filter((w) => w.id !== vars.webhookId));
      setDeleteId(null);
    },
  });

  const updateMutation = trpc.partnerWebhooks.updateWebhook.useMutation({
    onSuccess(_, vars) {
      setWebhooks((prev) =>
        prev.map((w) =>
          w.id === vars.webhookId ? { ...w, ...(vars.enabled !== undefined && { enabled: vars.enabled }) } : w,
        ),
      );
    },
  });

  const testMutation = trpc.partnerWebhooks.sendTestDelivery.useMutation({
    onSuccess(result, vars) {
      setTestResults((prev) => ({ ...prev, [vars.webhookId]: result }));
      setTimeout(() => {
        setTestResults((prev) => {
          const next = { ...prev };
          delete next[vars.webhookId];
          return next;
        });
      }, 6000);
    },
  });

  function closeRegisterDialog() {
    setRegisterOpen(false);
    setRegisterUrl('');
    setRegisterEvents([]);
    setRegisterDescription('');
    setUrlError('');
  }

  function toggleEvent(event: WebhookEvent) {
    setRegisterEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event],
    );
  }

  function handleRegisterSubmit() {
    if (!registerUrl.trim()) {
      setUrlError('Enter a valid URL.');
      return;
    }
    try {
      new URL(registerUrl.trim());
    } catch {
      setUrlError('Enter a valid URL starting with https://');
      return;
    }
    if (registerEvents.length === 0) return;
    setUrlError('');
    registerMutation.mutate({
      url: registerUrl.trim(),
      events: registerEvents,
      description: registerDescription.trim() || undefined,
    });
  }

  function handleCopySecret() {
    if (!revealSecret) return;
    void navigator.clipboard.writeText(revealSecret).then(() => {
      setSecretCopied(true);
      setTimeout(() => setSecretCopied(false), 2000);
    });
  }

  return (
    <PageShell>
      <PageHeader
        title={copy.title}
        description={copy.subtitle}
        actions={
          <button
            type="button"
            onClick={() => setRegisterOpen(true)}
            className="inline-flex h-11 min-w-[44px] items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {copy.registerCta}
          </button>
        }
      />

      {/* Webhook list */}
      {webhooks.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card py-16 text-center">
          <p className="text-sm font-medium text-foreground">{copy.empty.title}</p>
          <p className="max-w-xs text-xs text-muted-foreground">{copy.empty.description}</p>
          <button
            type="button"
            onClick={() => setRegisterOpen(true)}
            className="mt-2 inline-flex h-11 min-w-[44px] items-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                    {copy.table.url}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {copy.table.events}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {copy.table.status}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {copy.table.created}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {copy.table.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {webhooks.map((webhook) => {
                  const testResult = testResults[webhook.id];
                  return (
                    <tr key={webhook.id}>
                      <td className="px-4 py-3">
                        <span className="block max-w-[240px] truncate font-mono text-xs text-foreground">
                          {webhook.url}
                        </span>
                        {webhook.description && (
                          <span className="block text-xs text-muted-foreground">
                            {webhook.description}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {webhook.events.map((event) => (
                            <span
                              key={event}
                              className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                            >
                              {copy.eventLabels[event] ?? event}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            webhook.enabled
                              ? 'bg-primary/10 text-primary'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {webhook.enabled ? copy.statusLabels.enabled : copy.statusLabels.disabled}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {webhook.createdAt ? webhook.createdAt.toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-3">
                          {testResult !== undefined && testResult !== null && (
                            <span
                              className={`text-xs ${testResult.success ? 'text-primary' : 'text-destructive'}`}
                            >
                              {testResult.success
                                ? copy.testResult.success(testResult.statusCode ?? 200)
                                : copy.testResult.failure}
                            </span>
                          )}
                          <button
                            type="button"
                            disabled={testMutation.isPending && testMutation.variables?.webhookId === webhook.id}
                            onClick={() => testMutation.mutate({ webhookId: webhook.id })}
                            className="text-xs font-medium text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {testMutation.isPending && testMutation.variables?.webhookId === webhook.id
                              ? copy.actions.sendingTest
                              : copy.actions.sendTest}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              updateMutation.mutate({
                                webhookId: webhook.id,
                                enabled: !webhook.enabled,
                              })
                            }
                            className="text-xs font-medium text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {webhook.enabled ? copy.actions.disable : copy.actions.enable}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteId(webhook.id)}
                            className="text-xs font-medium text-destructive hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {copy.actions.delete}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {webhooks.map((webhook) => {
              const testResult = testResults[webhook.id];
              return (
                <div key={webhook.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="block max-w-[200px] truncate font-mono text-xs text-foreground">
                      {webhook.url}
                    </span>
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        webhook.enabled
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {webhook.enabled ? copy.statusLabels.enabled : copy.statusLabels.disabled}
                    </span>
                  </div>
                  {webhook.description && (
                    <p className="mt-1 text-xs text-muted-foreground">{webhook.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {webhook.events.map((event) => (
                      <span
                        key={event}
                        className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        {copy.eventLabels[event] ?? event}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {copy.table.created}:{' '}
                    {webhook.createdAt ? webhook.createdAt.toLocaleDateString() : '—'}
                  </p>
                  {testResult !== undefined && testResult !== null && (
                    <p className={`mt-1 text-xs ${testResult.success ? 'text-primary' : 'text-destructive'}`}>
                      {testResult.success
                        ? copy.testResult.success(testResult.statusCode ?? 200)
                        : copy.testResult.failure}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={testMutation.isPending && testMutation.variables?.webhookId === webhook.id}
                      onClick={() => testMutation.mutate({ webhookId: webhook.id })}
                      className="min-h-[44px] text-xs font-medium text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {testMutation.isPending && testMutation.variables?.webhookId === webhook.id
                        ? copy.actions.sendingTest
                        : copy.actions.sendTest}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateMutation.mutate({ webhookId: webhook.id, enabled: !webhook.enabled })
                      }
                      className="min-h-[44px] text-xs font-medium text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {webhook.enabled ? copy.actions.disable : copy.actions.enable}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteId(webhook.id)}
                      className="min-h-[44px] text-xs font-medium text-destructive hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {copy.actions.delete}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Register webhook dialog */}
      {registerOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm sm:items-center">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="register-webhook-title"
            className="w-full rounded-t-2xl border border-border bg-card p-6 shadow-xl sm:max-w-lg sm:rounded-xl"
          >
            <h2
              id="register-webhook-title"
              className="text-lg font-semibold text-foreground"
            >
              {copy.registerDialog.title}
            </h2>

            <div className="mt-4 space-y-4">
              {/* URL field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="webhook-url"
                  className="block text-sm font-medium text-foreground"
                >
                  {copy.registerDialog.urlLabel}
                </label>
                <input
                  id="webhook-url"
                  type="url"
                  value={registerUrl}
                  onChange={(e) => {
                    setRegisterUrl(e.target.value);
                    if (urlError) setUrlError('');
                  }}
                  placeholder={copy.registerDialog.urlPlaceholder}
                  aria-invalid={urlError ? 'true' : undefined}
                  aria-describedby={urlError ? 'webhook-url-error' : undefined}
                  className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[invalid=true]:border-destructive"
                />
                {urlError && (
                  <p id="webhook-url-error" role="alert" className="text-xs text-destructive">
                    {urlError}
                  </p>
                )}
              </div>

              {/* Events */}
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-foreground">
                  {copy.registerDialog.eventsLabel}
                </p>
                <div className="flex flex-col gap-2">
                  {WEBHOOK_EVENTS.map((event) => (
                    <label
                      key={event}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-background p-3 transition-colors hover:bg-muted"
                    >
                      <input
                        type="checkbox"
                        checked={registerEvents.includes(event)}
                        onChange={() => toggleEvent(event)}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-ring"
                      />
                      <span className="text-sm text-foreground">
                        {copy.eventLabels[event]}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label
                  htmlFor="webhook-description"
                  className="block text-sm font-medium text-foreground"
                >
                  {copy.registerDialog.descriptionLabel}
                </label>
                <input
                  id="webhook-description"
                  type="text"
                  value={registerDescription}
                  onChange={(e) => setRegisterDescription(e.target.value)}
                  placeholder={copy.registerDialog.descriptionPlaceholder}
                  maxLength={200}
                  className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeRegisterDialog}
                className="inline-flex h-11 min-w-[44px] items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {copy.registerDialog.cancelCta}
              </button>
              <button
                type="button"
                disabled={registerEvents.length === 0 || registerMutation.isPending}
                onClick={handleRegisterSubmit}
                className="inline-flex h-11 min-w-[44px] items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {registerMutation.isPending
                  ? copy.registerDialog.submittingCta
                  : copy.registerDialog.submitCta}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Secret reveal dialog */}
      {revealSecret !== null && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm sm:items-center">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="secret-reveal-title"
            className="w-full rounded-t-2xl border border-border bg-card p-6 shadow-xl sm:max-w-lg sm:rounded-xl"
          >
            <h2 id="secret-reveal-title" className="text-lg font-semibold text-foreground">
              {copy.secretReveal.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{copy.secretReveal.description}</p>

            <div className="mt-4 rounded-lg border border-border bg-muted p-3">
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                {copy.secretReveal.secretLabel}
              </p>
              <code className="block break-all font-mono text-xs text-foreground">
                {revealSecret}
              </code>
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCopySecret}
                className="inline-flex h-11 min-w-[44px] items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {secretCopied ? copy.secretReveal.copied : copy.secretReveal.copyCta}
              </button>
              <button
                type="button"
                onClick={() => {
                  setRevealSecret(null);
                  setSecretCopied(false);
                }}
                className="inline-flex h-11 min-w-[44px] items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {copy.secretReveal.doneCta}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm dialog */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm sm:items-center">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-webhook-title"
            className="w-full rounded-t-2xl border border-border bg-card p-6 shadow-xl sm:max-w-md sm:rounded-xl"
          >
            <h2 id="delete-webhook-title" className="text-lg font-semibold text-foreground">
              {copy.deleteDialog.title}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{copy.deleteDialog.description}</p>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="inline-flex h-11 min-w-[44px] items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {copy.deleteDialog.cancelCta}
              </button>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate({ webhookId: deleteId })}
                className="inline-flex h-11 min-w-[44px] items-center justify-center rounded-lg bg-destructive px-4 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {deleteMutation.isPending ? copy.actions.deleting : copy.deleteDialog.confirmCta}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
