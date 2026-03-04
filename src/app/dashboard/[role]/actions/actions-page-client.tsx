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
};

// ── Invite card ───────────────────────────────────────────────────────────────

function InviteCard({ copy }: { copy: Props['copy']['invite'] }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // Referral link is populated server-side in a real implementation.
    // For now we copy a placeholder so the UX is fully wired.
    void navigator.clipboard.writeText(copy.linkPlaceholder).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

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
              <p className="truncate text-sm text-muted-foreground">{copy.linkPlaceholder}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 min-h-9 gap-1.5"
              onClick={handleCopy}
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

export function ActionsPageClient({ copy }: Props) {
  return (
    <div className="space-y-6">
      <PageHeader title={copy.title} subtitle={copy.subtitle} />

      <div className="grid gap-4 md:grid-cols-2">
        <InviteCard copy={copy.invite} />
        <ComingSoonCard copy={copy.comingSoon} />
      </div>
    </div>
  );
}
