'use client';

import { useState } from 'react';

import { Sidebar } from '@/components/layout/Sidebar';
import type { DashboardRole } from '@/config/roles';
import { dashboardRoles } from '@/config/roles';

export function SidebarPreviews() {
  const [activeRole, setActiveRole] = useState<DashboardRole>('student');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {dashboardRoles.map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => setActiveRole(role)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
              activeRole === role
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            {role}
          </button>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {/* Expanded */}
        <div className="overflow-hidden rounded-xl border border-border">
          <p className="border-b border-border/60 bg-muted/30 px-3 py-2 text-xs font-medium text-muted-foreground">
            Expanded (240px)
          </p>
          <div className="h-[32.5rem]">
            <Sidebar role={activeRole} currentPath={`/dashboard/${activeRole}`} />
          </div>
        </div>
        {/* Collapsed */}
        <div className="overflow-hidden rounded-xl border border-border">
          <p className="border-b border-border/60 bg-muted/30 px-3 py-2 text-xs font-medium text-muted-foreground">
            Collapsed (64px)
          </p>
          <div className="h-[32.5rem]">
            <Sidebar
              role={activeRole}
              currentPath={`/dashboard/${activeRole}`}
              defaultCollapsed
            />
          </div>
        </div>
      </div>
    </div>
  );
}
