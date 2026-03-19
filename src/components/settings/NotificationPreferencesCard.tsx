'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { dashboardShellCopy } from '@/config/copy/dashboard-shell';
import { trpc } from '@/trpc/client';

export function NotificationPreferencesCard() {
  const { data: prefs = [] } = trpc.notifications.getPreferences.useQuery();
  const update = trpc.notifications.updatePreferences.useMutation();
  const utils = trpc.useUtils();

  const copy = dashboardShellCopy.notificationPreferences;
  const channelLabels: Record<string, string> = {
    email: copy.email,
    in_app: copy.inApp,
    push: copy.push,
  };

  const handleToggle = (channel: string, enabled: boolean) => {
    update.mutate(
      { channel: channel as 'email' | 'in_app' | 'push', enabled },
      { onSettled: () => utils.notifications.getPreferences.invalidate() },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.title}</CardTitle>
        <CardDescription>{copy.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {prefs.map((p) => (
          <div
            key={p.channel}
            className="flex items-center justify-between gap-4 rounded-lg border border-border/60 p-3"
          >
            <Label htmlFor={`pref-${p.channel}`} className="flex-1 cursor-pointer">
              {channelLabels[p.channel] ?? p.channel}
            </Label>
            <Switch
              id={`pref-${p.channel}`}
              checked={p.enabled}
              onCheckedChange={(checked) => handleToggle(p.channel, checked)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
