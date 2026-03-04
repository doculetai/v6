import type { LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type OnboardingStateCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
};

export function OnboardingStateCard({
  title,
  description,
  icon: Icon,
  actionLabel,
  onAction,
  actionDisabled = false,
}: OnboardingStateCardProps) {
  return (
    <Card className="border-border bg-card dark:border-border dark:bg-card">
      <CardHeader className="space-y-3">
        <Icon className="size-5 text-muted-foreground dark:text-muted-foreground" aria-hidden="true" />
        <CardTitle className="text-xl text-card-foreground dark:text-card-foreground">{title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground dark:text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      {actionLabel && onAction ? (
        <CardContent>
          <Button
            type="button"
            onClick={onAction}
            disabled={actionDisabled}
            className="min-h-11 w-full sm:w-auto"
          >
            {actionLabel}
          </Button>
        </CardContent>
      ) : null}
    </Card>
  );
}
