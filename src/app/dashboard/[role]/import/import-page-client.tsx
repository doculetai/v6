'use client';

import { useState, useCallback } from 'react';
import {
  UploadSimple,
  EnvelopeSimple,
  CheckCircle,
  WarningCircle,
  Clock,
  Trash,
} from '@/components/icons';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { PageShell, Section, Stack } from '@/components/layout/content-primitives';
import { PageHeader } from '@/components/layout/page-header';
import { useDashboardBreadcrumbs } from '@/lib/hooks/useDashboardBreadcrumbs';
import { trpc } from '@/trpc/client';

type ImportCopy = {
  title: string;
  subtitle: string;
  instructions: string;
  emailAddressesLabel: string;
  parseEmailsCta: string;
  textareaPlaceholder: string;
  uploadLabel: string;
  previewTitle: string;
  previewDescription: string;
  emailCount: string;
  submitLabel: string;
  submittingLabel: string;
  success: string;
  error: string;
  invalidEmails: string;
  empty: { title: string; description: string };
};

type Props = {
  copy: ImportCopy;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseEmails(input: string): { valid: string[]; invalid: string[] } {
  const lines = input
    .split(/[\n,;]+/)
    .map((l) => l.trim().toLowerCase())
    .filter(Boolean);

  const valid: string[] = [];
  const invalid: string[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    if (seen.has(line)) continue;
    seen.add(line);
    if (EMAIL_REGEX.test(line)) {
      valid.push(line);
    } else {
      invalid.push(line);
    }
  }

  return { valid, invalid };
}

export function ImportPageClient({ copy }: Props) {
  const breadcrumbs = useDashboardBreadcrumbs(copy.title);
  const bulkImport = trpc.universityManagement.bulkImportStudents.useMutation({
    onSuccess: (result) => {
      toast.success(`${copy.success} (${result.sentCount} sent)`);
      if (result.failedCount > 0) {
        toast.error(`${result.failedCount} emails failed to send.`);
      }
      setRawInput('');
      setParsedEmails([]);
      setInvalidEntries([]);
    },
    onError: () => {
      toast.error(copy.error);
    },
  });

  const [rawInput, setRawInput] = useState('');
  const [parsedEmails, setParsedEmails] = useState<string[]>([]);
  const [invalidEntries, setInvalidEntries] = useState<string[]>([]);

  const handleParse = useCallback(() => {
    const { valid, invalid } = parseEmails(rawInput);
    setParsedEmails(valid);
    setInvalidEntries(invalid);
    if (invalid.length > 0) {
      toast.warning(copy.invalidEmails);
    }
  }, [rawInput, copy.invalidEmails]);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        // If CSV with header, try to find email column
        const lines = content.split('\n');
        if (lines.length > 0) {
          const header = lines[0].toLowerCase();
          const emailColIndex = header
            .split(',')
            .findIndex((col) => col.trim() === 'email');

          let emailLines: string[];
          if (emailColIndex >= 0) {
            // CSV with email column header
            emailLines = lines
              .slice(1)
              .map((line) => {
                const cols = line.split(',');
                return cols[emailColIndex]?.trim() ?? '';
              })
              .filter(Boolean);
          } else {
            // Plain text, one email per line
            emailLines = lines.map((l) => l.trim()).filter(Boolean);
          }

          const combined = rawInput
            ? rawInput + '\n' + emailLines.join('\n')
            : emailLines.join('\n');
          setRawInput(combined);

          const { valid, invalid } = parseEmails(combined);
          setParsedEmails(valid);
          setInvalidEntries(invalid);
          if (invalid.length > 0) {
            toast.warning(copy.invalidEmails);
          }
        }
      };
      reader.readAsText(file);
      // Reset file input
      e.target.value = '';
    },
    [rawInput, copy.invalidEmails],
  );

  const handleRemoveEmail = useCallback((emailToRemove: string) => {
    setParsedEmails((prev) => prev.filter((e) => e !== emailToRemove));
  }, []);

  const handleSubmit = () => {
    if (parsedEmails.length === 0) return;
    bulkImport.mutate({ emails: parsedEmails });
  };

  return (
    <PageShell width="wide">
      <Section>
        <Stack gap="md">
          <PageHeader title={copy.title} subtitle={copy.subtitle} breadcrumbs={breadcrumbs} />

          <div className="space-y-4 rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">{copy.instructions}</p>

            <div className="space-y-2">
              <Label htmlFor="email-input">{copy.emailAddressesLabel}</Label>
              <Textarea
                id="email-input"
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                placeholder={copy.textareaPlaceholder}
                rows={6}
                className="resize-none font-mono text-sm"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleParse}
                className="gap-1.5"
              >
                <EnvelopeSimple
                  className="size-4"
                  weight="duotone"
                  aria-hidden="true"
                />
                {copy.parseEmailsCta}
              </Button>

              <div className="relative">
                <Input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="absolute inset-0 cursor-pointer opacity-0"
                  aria-label={copy.uploadLabel}
                />
                <Button variant="outline" size="sm" className="gap-1.5" asChild>
                  <span>
                    <UploadSimple
                      className="size-4"
                      weight="duotone"
                      aria-hidden="true"
                    />
                    {copy.uploadLabel}
                  </span>
                </Button>
              </div>
            </div>
          </div>

          {invalidEntries.length > 0 && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
              <WarningCircle
                className="mt-0.5 size-4 shrink-0 text-destructive"
                weight="duotone"
                aria-hidden="true"
              />
              <div className="space-y-1">
                <p className="text-sm font-medium text-destructive">
                  {copy.invalidEmails}
                </p>
                <p className="text-xs text-muted-foreground">
                  {invalidEntries.join(', ')}
                </p>
              </div>
            </div>
          )}

          {parsedEmails.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground">
                  {copy.previewTitle}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {parsedEmails.length} {copy.emailCount}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {copy.previewDescription}
              </p>

              <div className="max-h-60 overflow-y-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-border">
                    {parsedEmails.map((email) => (
                      <tr
                        key={email}
                        className="bg-card transition-colors hover:bg-muted/30"
                      >
                        <td className="px-4 py-2 font-mono text-foreground">
                          {email}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="size-7 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveEmail(email)}
                          >
                            <Trash
                              className="size-3.5"
                              weight="duotone"
                              aria-hidden="true"
                            />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={bulkImport.isPending || parsedEmails.length === 0}
                className="gap-1.5"
              >
                {bulkImport.isPending ? (
                  <>
                    <Clock
                      className="size-4 animate-spin"
                      weight="duotone"
                      aria-hidden="true"
                    />
                    {copy.submittingLabel}
                  </>
                ) : (
                  <>
                    <CheckCircle
                      className="size-4"
                      weight="duotone"
                      aria-hidden="true"
                    />
                    {copy.submitLabel} ({parsedEmails.length})
                  </>
                )}
              </Button>
            </div>
          ) : (
            <EmptyState heading={copy.empty.title} body={copy.empty.description} />
          )}
        </Stack>
      </Section>
    </PageShell>
  );
}
