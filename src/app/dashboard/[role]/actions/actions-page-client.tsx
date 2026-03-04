'use client';

import { useState } from 'react';
import { Check, Copy, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import type { agentCopy } from '@/config/copy/agent';

// ── Types ─────────────────────────────────────────────────────────────────────

type Props = {
  copy: typeof agentCopy.actions;
  referralUrl: string | null;
};

// ── Invite card ───────────────────────────────────────────────────────────────

function InviteCard({
  copy,
  referralUrl,
}: {
  copy: Props['copy']['invite'];
  referralUrl: string | null;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (referralUrl === null) return;
    void navigator.clipboard.writeText(referralUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const isDisabled = referralUrl === null;

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground">
          {copy.heading}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{copy.description}</p>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">{copy.copyLinkLabel}</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex-1 rounded-md border border-border bg-muted/40 px-3 py-2">
              <p className="truncate text-sm text-muted-foreground">
                {referralUrl ?? copy.linkPlaceholder}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 min-h-9 gap-1.5"
              onClick={handleCopy}
              disabled={isDisabled}
              aria-label={copied ? copy.copied : copy.copyLinkCta}
            >
              {copied ? (
                <Check className="size-4 text-primary" aria-hidden="true" />
              ) : (
                <Copy className="size-4" aria-hidden="true" />
              )}
              <span>{copied ? copy.copied : copy.copyLinkCta}</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Coming soon card ──────────────────────────────────────────────────────────

function ComingSoonCard({ copy }: { copy: Props['copy']['comingSoon'] }) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Zap className="size-5 text-muted-foreground/60" aria-hidden="true" />
          <CardTitle className="text-base font-semibold text-foreground">
            {copy.heading}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{copy.description}</p>
      </CardContent>
    </Card>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ActionsPageClient({ copy, referralUrl }: Props) {
  return (
    <div className="space-y-6">
      <PageHeader title={copy.title} subtitle={copy.subtitle} />

      <div className="grid gap-4 md:grid-cols-2">
        <InviteCard copy={copy.invite} referralUrl={referralUrl} />
        <ComingSoonCard copy={copy.comingSoon} />
      </div>
    </div>
  );
}
