'use client';

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
  if (data === null) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{copy.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{copy.subtitle}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <p className="text-sm font-medium text-foreground">{copy.empty.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{copy.empty.description}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{copy.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{copy.subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="search"
          placeholder={copy.search.inputHint}
          className="h-10 w-full max-w-sm rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          aria-label={copy.search.inputHint}
        />
        <span className="text-xs text-muted-foreground">
          {data.total.toLocaleString()} total
        </span>
      </div>

      {data.users.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <p className="text-sm font-medium text-foreground">{copy.empty.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{copy.empty.description}</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-4 gap-4 border-b border-border px-5 py-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{copy.table.email}</p>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{copy.table.role}</p>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{copy.table.status}</p>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{copy.table.joined}</p>
          </div>
          <ul role="list">
            {data.users.map((user, idx) => (
              <li
                key={user.id}
                className={`grid grid-cols-4 gap-4 px-5 py-4 ${idx < data.users.length - 1 ? 'border-b border-border' : ''}`}
              >
                <p className="truncate text-sm text-foreground">{user.email ?? '—'}</p>
                <div>
                  <RoleBadge role={user.role} copy={copy.roles} />
                </div>
                <p className="text-sm text-foreground">
                  {user.onboardingComplete ? copy.statusLabels.active : copy.statusLabels.pending}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
