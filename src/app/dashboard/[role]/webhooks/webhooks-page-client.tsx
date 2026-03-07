'use client';

import { Fragment, useState } from 'react';

import { ArrowsClockwise, Check, Trash, Warning } from '@/components/icons';
import { Stack } from '@/components/layout/content-primitives';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { partnerCopy } from '@/config/copy/partner';
import { cn } from '@/lib/utils';
import { trpc } from '@/trpc/client';

const copy = partnerCopy.webhooks;

const WEBHOOK_EVENTS = ['cert_issued', 'doc_approved', 'doc_rejected', 'kyc_complete'] as const;
type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

type WebhookConfig = {
  id: string;
  url: string;
  events: WebhookEvent[];
  description: string | null;
  enabled: boolean;
  createdAt: Date;
};

type Props = {
  initialWebhooks: WebhookConfig[];
};

export function WebhooksPageClient({ initialWebhooks }: Props) {
  const [showRegister, setShowRegister] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; statusCode: number | null }>>({});

  const { data: webhooks = initialWebhooks, refetch } = trpc.partnerWebhooks.listWebhooks.useQuery(
    undefined,
    { initialData: initialWebhooks },
  );

  const deleteMutation = trpc.partnerWebhooks.deleteWebhook.useMutation({
    onSuccess: () => {
      setDeleteTarget(null);
      void refetch();
    },
  });

  const testMutation = trpc.partnerWebhooks.sendTestDelivery.useMutation({
    onSuccess: (data, variables) => {
      setTestResults((prev) => ({ ...prev, [variables.webhookId]: data }));
    },
  });

  const handleTest = (webhookId: string) => {
    setTestResults((prev) => {
      const next = { ...prev };
      delete next[webhookId];
      return next;
    });
    testMutation.mutate({ webhookId });
  };

  return (
    <Stack gap="md">
      <div className="flex justify-end">
        <Button onClick={() => setShowRegister(true)}>{copy.registerCta}</Button>
      </div>

      {webhooks.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm font-medium text-foreground">{copy.empty.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{copy.empty.description}</p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-3 text-left font-medium">{copy.table.url}</th>
                <th className="px-4 py-3 text-left font-medium">{copy.table.events}</th>
                <th className="px-4 py-3 text-left font-medium">{copy.table.status}</th>
                <th className="px-4 py-3 text-left font-medium">{copy.table.created}</th>
                <th className="px-4 py-3 text-right font-medium">{copy.table.actions}</th>
              </tr>
            </thead>
            <tbody>
              {webhooks.map((webhook) => (
                <Fragment key={webhook.id}>
                  <tr
                    className="border-b last:border-0 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedId(expandedId === webhook.id ? null : webhook.id)}
                  >
                    <td className="px-4 py-3 font-mono text-xs truncate max-w-[260px]">{webhook.url}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {webhook.events.map((ev) => (
                          <Badge key={ev} variant="secondary" className="text-[10px]">
                            {copy.events[ev as WebhookEvent] ?? ev}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={webhook.enabled ? 'default' : 'outline'}>
                        {webhook.enabled ? copy.status.enabled : copy.status.disabled}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(webhook.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className="flex items-center justify-end gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {testResults[webhook.id] !== undefined && (
                          <span
                            className={cn(
                              'text-xs font-medium',
                              testResults[webhook.id].success ? 'text-success' : 'text-destructive',
                            )}
                          >
                            {testResults[webhook.id].success
                              ? copy.testDelivery.success(testResults[webhook.id].statusCode ?? 200)
                              : copy.testDelivery.failure}
                          </span>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTest(webhook.id)}
                          disabled={testMutation.isPending}
                        >
                          <ArrowsClockwise weight="duotone" className="size-4 mr-1.5" aria-hidden="true" />
                          {copy.testDelivery.cta}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(webhook.id)}
                        >
                          <Trash weight="duotone" className="size-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === webhook.id && (
                    <tr>
                      <td colSpan={5} className="bg-muted/20 px-4 py-3">
                        <WebhookDeliveryLog webhookId={webhook.id} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <RegisterWebhookDialog
        open={showRegister}
        onOpenChange={setShowRegister}
        onSuccess={() => void refetch()}
      />

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{copy.deleteDialog.title}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{copy.deleteDialog.description}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              {copy.deleteDialog.cancel}
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleteTarget && deleteMutation.mutate({ webhookId: deleteTarget })}
            >
              {deleteMutation.isPending ? copy.deleteDialog.deleting : copy.deleteDialog.confirmCta}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Stack>
  );
}

function RegisterWebhookDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSuccess: () => void;
}) {
  const [url, setUrl] = useState('');
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [description, setDescription] = useState('');
  const [issuedSecret, setIssuedSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const mutation = trpc.partnerWebhooks.registerWebhook.useMutation({
    onSuccess: (data) => {
      setIssuedSecret(data.secret);
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || events.length === 0) return;
    mutation.mutate({ url, events, description: description || undefined });
  };

  const handleClose = () => {
    setUrl('');
    setEvents([]);
    setDescription('');
    setIssuedSecret(null);
    setCopied(false);
    onOpenChange(false);
  };

  const toggleEvent = (ev: WebhookEvent) => {
    setEvents((prev) =>
      prev.includes(ev) ? prev.filter((e) => e !== ev) : [...prev, ev],
    );
  };

  const handleCopy = () => {
    if (issuedSecret) {
      void navigator.clipboard.writeText(issuedSecret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{copy.registerDialog.title}</DialogTitle>
        </DialogHeader>
        {issuedSecret ? (
          <Stack gap="sm">
            <div className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 p-3">
              <Warning weight="duotone" className="size-4 shrink-0 mt-0.5 text-warning" aria-hidden="true" />
              <p className="text-sm font-medium text-warning">{copy.registerDialog.secretNote}</p>
            </div>
            <Label>{copy.registerDialog.secretLabel}</Label>
            <div className="flex gap-2">
              <Input readOnly value={issuedSecret} className="font-mono text-xs" />
              <Button size="sm" variant="outline" onClick={handleCopy}>
                {copied ? (
                  <Check weight="duotone" className="size-4" aria-hidden="true" />
                ) : (
                  copy.testDelivery.done
                )}
              </Button>
            </div>
            <Button onClick={handleClose}>{copy.testDelivery.done}</Button>
          </Stack>
        ) : (
          <form onSubmit={handleSubmit}>
            <Stack gap="sm">
              <div>
                <Label htmlFor="webhook-url">{copy.registerDialog.urlLabel}</Label>
                <Input
                  id="webhook-url"
                  type="url"
                  placeholder={copy.registerDialog.urlPlaceholder}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>{copy.registerDialog.eventsLabel}</Label>
                <div className="mt-2 space-y-2">
                  {WEBHOOK_EVENTS.map((ev) => (
                    <div key={ev} className="flex items-center gap-2">
                      <Checkbox
                        id={`event-${ev}`}
                        checked={events.includes(ev)}
                        onCheckedChange={() => toggleEvent(ev)}
                      />
                      <Label htmlFor={`event-${ev}`} className="font-normal cursor-pointer">
                        {copy.events[ev]}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="webhook-desc">{copy.registerDialog.descriptionLabel}</Label>
                <Input
                  id="webhook-desc"
                  placeholder={copy.registerDialog.descriptionPlaceholder}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={mutation.isPending || events.length === 0 || !url}
                >
                  {mutation.isPending
                    ? copy.registerDialog.submitting
                    : copy.registerDialog.submitCta}
                </Button>
              </DialogFooter>
            </Stack>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function WebhookDeliveryLog({ webhookId }: { webhookId: string }) {
  const deliveriesCopy = copy.deliveries;
  const { data: deliveries = [] } = trpc.partnerWebhooks.listDeliveries.useQuery({ webhookId });

  if (deliveries.length === 0) {
    return <p className="text-xs text-muted-foreground py-2">{deliveriesCopy.empty}</p>;
  }

  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
        {deliveriesCopy.title}
      </p>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-muted-foreground">
            <th className="text-left pb-1 font-medium">{deliveriesCopy.table.event}</th>
            <th className="text-left pb-1 font-medium">{deliveriesCopy.table.status}</th>
            <th className="text-left pb-1 font-medium">{deliveriesCopy.table.httpStatus}</th>
            <th className="text-left pb-1 font-medium">{deliveriesCopy.table.attempts}</th>
            <th className="text-left pb-1 font-medium">{deliveriesCopy.table.date}</th>
          </tr>
        </thead>
        <tbody>
          {deliveries.map((d) => (
            <tr key={d.id} className="border-t border-border/50">
              <td className="py-1 font-mono">{d.eventType}</td>
              <td className="py-1">
                <span
                  className={cn(
                    'text-[10px] font-medium',
                    d.status === 'delivered'
                      ? 'text-success'
                      : d.status === 'failed'
                        ? 'text-destructive'
                        : 'text-muted-foreground',
                  )}
                >
                  {d.status}
                </span>
              </td>
              <td className="py-1">{d.responseStatus ?? '\u2014'}</td>
              <td className="py-1">{d.attempts}</td>
              <td className="py-1 text-muted-foreground">
                {new Date(d.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
