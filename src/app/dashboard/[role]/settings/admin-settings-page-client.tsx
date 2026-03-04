'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { adminCopy } from '@/config/copy/admin';

// ── Types ─────────────────────────────────────────────────────────────────────

type Props = {
  copy: typeof adminCopy.settings;
};

// ── Main export ───────────────────────────────────────────────────────────────

export function AdminSettingsPageClient({ copy }: Props) {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="space-y-1 border-b border-border pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {copy.title}
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">{copy.subtitle}</p>
      </div>

      {/* Security & compliance */}
      <Card className="border-border bg-card dark:border-border dark:bg-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-card-foreground">
            {copy.sections.security.title}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {copy.sections.security.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {copy.sections.security.comingSoon}
          </p>
        </CardContent>
      </Card>

      {/* System notifications */}
      <Card className="border-border bg-card dark:border-border dark:bg-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-card-foreground">
            {copy.sections.notifications.title}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {copy.sections.notifications.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {copy.sections.notifications.comingSoon}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
