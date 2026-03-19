'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { studentCopy } from '@/config/copy/student';

export type Application = {
  id: string;
  universityName: string;
  status: 'certified' | 'in_progress';
};

type ApplicationSwitcherProps = {
  applications: Application[];
  activeId: string;
  onSwitch: (id: string) => void;
};

export function ApplicationSwitcher({
  applications,
  activeId,
  onSwitch,
}: ApplicationSwitcherProps) {
  const copy = studentCopy.applicationSwitcher;

  return (
    <div className="px-3 py-2 space-y-1">
      <Label className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/50">
        {copy.label}
      </Label>
      <Select value={activeId} onValueChange={onSwitch}>
        <SelectTrigger className="h-9 w-full border-sidebar-border bg-sidebar text-sm text-sidebar-foreground">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {applications.map((app) => (
            <SelectItem key={app.id} value={app.id}>
              <span className="flex items-center gap-2">
                <span className="truncate">{app.universityName}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {app.status === 'certified'
                    ? copy.statuses.certified
                    : copy.statuses.in_progress}
                </span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
