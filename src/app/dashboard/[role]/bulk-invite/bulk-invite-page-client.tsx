'use client';

import { useCallback, useState } from 'react';
import { CheckCircle, PaperPlaneTilt, WarningCircle } from '@/components/icons';

import { Button } from '@/components/ui/button';
import { Grid } from '@/components/layout/content-primitives';
import type { agentCopy } from '@/config/copy/agent';
import { cn } from '@/lib/utils';
import { trpc } from '@/trpc/client';

// ── Types ─────────────────────────────────────────────────────────────────────

type Props = {
  copy: typeof agentCopy.bulkInvite;
};

type FormState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; sentCount: number; failedEmails: string[] }
  | { status: 'error'; message: string };

// ── Helpers ───────────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseAndValidateEmails(
  raw: string,
  copy: Props['copy'],
): { valid: true; emails: string[] } | { valid: false; error: string } {
  const lines = raw
    .split(/[\n,;]+/)
    .map((line) => line.trim().toLowerCase())
    .filter(Boolean);

  if (lines.length === 0) {
    return { valid: false, error: copy.validation.noEmails };
  }

  if (lines.length > copy.maxEmails) {
    return { valid: false, error: copy.validation.tooMany };
  }

  const seen = new Set<string>();
  for (const email of lines) {
    if (!EMAIL_REGEX.test(email)) {
      return { valid: false, error: copy.validation.invalidEmail(email) };
    }
    if (seen.has(email)) {
      return { valid: false, error: copy.validation.duplicateEmail(email) };
    }
    seen.add(email);
  }

  return { valid: true, emails: lines };
}

// ── Component ─────────────────────────────────────────────────────────────────

export function BulkInvitePageClient({ copy }: Props) {
  const [rawText, setRawText] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>({ status: 'idle' });

  const bulkInviteMutation = trpc.agent.bulkInviteStudents.useMutation();

  const handleSubmit = useCallback(async () => {
    setValidationError(null);

    const result = parseAndValidateEmails(rawText, copy);
    if (!result.valid) {
      setValidationError(result.error);
      return;
    }

    setFormState({ status: 'submitting' });

    try {
      const response = await bulkInviteMutation.mutateAsync({
        emails: result.emails,
      });
      setFormState({
        status: 'success',
        sentCount: response.sentCount,
        failedEmails: response.failedEmails,
      });
      setRawText('');
    } catch {
      setFormState({
        status: 'error',
        message: copy.error.description,
      });
    }
  }, [rawText, copy, bulkInviteMutation]);

  const isSubmitting = formState.status === 'submitting';

  return (
    <div className="space-y-6">
      {/* Success banner + result summary */}
      {formState.status === 'success' && (
        <>
          <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <CheckCircle weight="duotone" size={20} className="mt-0.5 shrink-0 text-primary" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">{copy.success.title}</p>
              <p className="text-sm text-muted-foreground">
                {copy.success.description(formState.sentCount)}
              </p>
              {formState.failedEmails.length > 0 && (
                <p className="text-sm text-destructive">
                  {`Failed: ${formState.failedEmails.join(', ')}`}
                </p>
              )}
            </div>
          </div>
          <Grid cols={3} gap="sm">
            <div className="rounded-lg border border-border bg-card px-4 py-3 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {copy.result.processed}
              </p>
              <p className="mt-1 font-mono text-xl font-bold text-foreground">
                {formState.sentCount + formState.failedEmails.length}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card px-4 py-3 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {copy.result.successful}
              </p>
              <p className="mt-1 font-mono text-xl font-bold text-primary">
                {formState.sentCount}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card px-4 py-3 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {copy.result.failed}
              </p>
              <p className={cn(
                'mt-1 font-mono text-xl font-bold',
                formState.failedEmails.length > 0 ? 'text-destructive' : 'text-foreground',
              )}>
                {formState.failedEmails.length}
              </p>
            </div>
          </Grid>
        </>
      )}

      {/* Error banner */}
      {formState.status === 'error' && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <WarningCircle weight="duotone" size={20} className="mt-0.5 shrink-0 text-destructive" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">{copy.error.title}</p>
            <p className="text-sm text-muted-foreground">{formState.message}</p>
          </div>
        </div>
      )}

      {/* Textarea */}
      <div className="space-y-2">
        <textarea
          value={rawText}
          onChange={(e) => {
            setRawText(e.target.value);
            setValidationError(null);
          }}
          placeholder={copy.placeholder}
          rows={8}
          disabled={isSubmitting}
          className={cn(
            'w-full rounded-lg border bg-background px-4 py-3 text-sm text-foreground',
            'placeholder:text-muted-foreground/60',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
            validationError
              ? 'border-destructive focus-visible:ring-destructive'
              : 'border-border',
          )}
        />
        {validationError && (
          <p className="text-sm text-destructive">{validationError}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {`Maximum ${copy.maxEmails} emails per batch. One email per line.`}
        </p>
      </div>

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || rawText.trim().length === 0}
        className="gap-2"
      >
        <PaperPlaneTilt weight="duotone" size={16} />
        {isSubmitting ? copy.submittingLabel : copy.submitLabel}
      </Button>
    </div>
  );
}
