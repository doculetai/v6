'use client';

import { useState } from 'react';

import { AdminStudentRecordSheet } from '@/components/admin/AdminStudentRecordSheet';
import { adminCopy } from '@/config/copy/admin';

type User = {
  id: string;
  email: string | null;
  role: string | null;
  onboardingComplete: boolean;
  createdAt: Date;
};

type Props = {
  data: { users: User[]; total: number } | null;
  copy: typeof adminCopy.users;
};

const ROLE_KEYS = ['student', 'sponsor', 'university', 'admin', 'agent', 'partner'] as const;
type RoleKey = typeof ROLE_KEYS[number];

function isRoleKey(value: string | null): value is RoleKey {
  return value !== null && (ROLE_KEYS as readonly string[]).includes(value);
}

function RoleBadge({ role, copy }: { role: string | null; copy: typeof adminCopy.users.roles }) {
  const label = isRoleKey(role) ? copy[role] : (role ?? '—');
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-card px-2.5 py-0.5 text-xs font-medium text-foreground">
      {label}
    </span>
  );
}

export function UsersPageClient({ data, copy }: Props) {
  const [recordStudentId, setRecordStudentId] = useState<string | null>(null);

  if (data === null) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <p className="text-sm font-medium text-foreground">{copy.error.title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{copy.error.description}</p>
      </div>
    );
  }

  function handleRowClick(user: User) {
    if (user.role === 'student') {
      setRecordStudentId(user.id);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <input
          type="search"
          placeholder={copy.search.inputHint}
          className="h-10 w-full max-w-sm rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          aria-label={copy.search.inputHint}
        />
        <span className="text-xs text-muted-foreground">
          {copy.search.totalCount(data.total)}
        </span>
      </div>

      {data.users.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <p className="text-sm font-medium text-foreground">{copy.empty.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{copy.empty.description}</p>
        </div>
      ) : (
        <>
          {/* Desktop table — hidden below md */}
          <div className="hidden md:block rounded-xl border border-border bg-card overflow-hidden">
            <div role="row" className="flex gap-4 border-b border-border px-5 py-3">
              <p role="columnheader" className="flex-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">{copy.table.email}</p>
              <p role="columnheader" className="flex-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">{copy.table.role}</p>
              <p role="columnheader" className="flex-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">{copy.table.status}</p>
              <p role="columnheader" className="flex-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">{copy.table.joined}</p>
              <p role="columnheader" className="w-24 text-xs font-medium text-muted-foreground uppercase tracking-wide">{copy.table.action}</p>
            </div>
            <ul role="list">
              {data.users.map((user, idx) => (
                <li
                  key={user.id}
                  role="row"
                  className={`flex gap-4 px-5 py-4 ${idx < data.users.length - 1 ? 'border-b border-border' : ''}`}
                >
                  <p className="flex-1 truncate text-sm text-foreground">{user.email ?? '—'}</p>
                  <div className="flex-1"><RoleBadge role={user.role} copy={copy.roles} /></div>
                  <p className="flex-1 text-sm text-foreground">
                    {user.onboardingComplete ? copy.statusLabels.active : copy.statusLabels.pending}
                  </p>
                  <p className="flex-1 text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                  <div className="w-24">
                    {user.role === 'student' && (
                      <button
                        type="button"
                        onClick={() => handleRowClick(user)}
                        className="text-xs font-medium text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {adminCopy.studentRecord.viewRecord}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Mobile cards — shown below md */}
          <ul role="list" className="md:hidden space-y-3">
            {data.users.map((user) => (
              <li key={user.id} className="rounded-xl border border-border bg-card px-4 py-4 space-y-2">
                <p className="truncate text-sm font-medium text-foreground">{user.email ?? '—'}</p>
                <div className="flex items-center gap-2">
                  <RoleBadge role={user.role} copy={copy.roles} />
                  <span className="text-xs text-muted-foreground">
                    {user.onboardingComplete ? copy.statusLabels.active : copy.statusLabels.pending}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {copy.table.joined}: {new Date(user.createdAt).toLocaleDateString()}
                </p>
                {user.role === 'student' && (
                  <button
                    type="button"
                    onClick={() => handleRowClick(user)}
                    className="text-xs font-medium text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {adminCopy.studentRecord.viewRecord}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      <AdminStudentRecordSheet
        studentId={recordStudentId}
        onClose={() => setRecordStudentId(null)}
      />
    </div>
  );
}
