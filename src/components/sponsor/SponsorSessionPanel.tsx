'use client';

import { ShieldAlert, ShieldCheck } from 'lucide-react';

import {
  SessionManagement,
  type Session,
} from '@/components/ui/session-management';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { sponsorCopy } from '@/config/copy/sponsor';
import { cn } from '@/lib/utils';

type SponsorSessionPanelProps = {
  sessions: Session[];
  lastLoginLocation: string | null;
  hasSuspiciousLogin: boolean;
};

export function SponsorSessionPanel({
  sessions,
  lastLoginLocation,
  hasSuspiciousLogin,
}: SponsorSessionPanelProps) {
  return (
    <Card className="border-border/70 bg-card/90 shadow-sm backdrop-blur-sm dark:border-border/70 dark:bg-card/80">
      <CardHeader className="space-y-3">
        <CardTitle className="text-2xl text-card-foreground">
          {sponsorCopy.settings.sessions.title}
        </CardTitle>
        <CardDescription>{sponsorCopy.settings.sessions.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-lg border border-border/70 bg-background/60 p-4 dark:border-border/80 dark:bg-background/40">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {sponsorCopy.settings.sessions.lastLoginLabel}
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {lastLoginLocation ?? sponsorCopy.settings.sessions.noLastLoginFallback}
          </p>
        </div>

        <div
          className={cn(
            'rounded-lg border p-4',
            hasSuspiciousLogin
              ? 'border-destructive/40 bg-destructive/10 dark:bg-destructive/15'
              : 'border-primary/30 bg-primary/10 dark:bg-primary/15',
          )}
        >
          <div className="flex items-start gap-2">
            {hasSuspiciousLogin ? (
              <ShieldAlert className="size-4 text-destructive" aria-hidden="true" />
            ) : (
              <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
            )}
            <div>
              <p
                className={cn(
                  'text-sm font-medium',
                  hasSuspiciousLogin ? 'text-destructive' : 'text-primary',
                )}
              >
                {hasSuspiciousLogin
                  ? sponsorCopy.settings.sessions.alertStatusTitle
                  : sponsorCopy.settings.sessions.safeStatusTitle}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {hasSuspiciousLogin
                  ? sponsorCopy.settings.sessions.alertStatusDescription
                  : sponsorCopy.settings.sessions.safeStatusDescription}
              </p>
            </div>
          </div>
        </div>

        <SessionManagement sessions={sessions} showIpAddress />
      </CardContent>
    </Card>
  );
}
