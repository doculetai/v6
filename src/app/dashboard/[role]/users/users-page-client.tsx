'use client';

import { useState } from 'react';

import { Prohibit } from '@/components/icons';
import { AdminStudentRecordSheet } from '@/components/admin/AdminStudentRecordSheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { DotsThreeVertical } from '@/components/icons';
import { adminCopy } from '@/config/copy/admin';
import { browserTrpcClient } from '@/trpc/client';

type User = {
  id: string;
  email: string | null;
  role: string | null;
  onboardingComplete: boolean;
  createdAt: Date;
  frozenAt: Date | null;
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

function FrozenBadge() {
  const freezeCopy = adminCopy.freeze;
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
      <Prohibit size={12} weight="duotone" />
      {freezeCopy.badge}
    </span>
  );
}

function StatusLabel({ user, copy }: { user: User; copy: typeof adminCopy.users }) {
  if (user.frozenAt) return <FrozenBadge />;
  return (
    <span className="text-sm text-foreground">
      {user.onboardingComplete ? copy.statusLabels.active : copy.statusLabels.pending}
    </span>
  );
}

export function UsersPageClient({ data, copy }: Props) {
  const [recordStudentId, setRecordStudentId] = useState<string | null>(null);
  const [freezeTarget, setFreezeTarget] = useState<User | null>(null);
  const [unfreezeTarget, setUnfreezeTarget] = useState<User | null>(null);
  const [localUsers, setLocalUsers] = useState<User[] | null>(data?.users ?? null);
  const [isFreezePending, setIsFreezePending] = useState(false);
  const freezeCopy = adminCopy.freeze;

  if (data === null || localUsers === null) {
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

  async function handleFreeze() {
    if (!freezeTarget) return;
    setIsFreezePending(true);
    try {
      await browserTrpcClient.admin.freezeAccount.mutate({ userId: freezeTarget.id });
      setLocalUsers((prev) =>
        (prev ?? []).map((u) =>
          u.id === freezeTarget.id ? { ...u, frozenAt: new Date() } : u,
        ),
      );
    } finally {
      setIsFreezePending(false);
      setFreezeTarget(null);
    }
  }

  async function handleUnfreeze() {
    if (!unfreezeTarget) return;
    setIsFreezePending(true);
    try {
      await browserTrpcClient.admin.unfreezeAccount.mutate({ userId: unfreezeTarget.id });
      setLocalUsers((prev) =>
        (prev ?? []).map((u) =>
          u.id === unfreezeTarget.id ? { ...u, frozenAt: null } : u,
        ),
      );
    } finally {
      setIsFreezePending(false);
      setUnfreezeTarget(null);
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

      {localUsers.length === 0 ? (
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
              <p role="columnheader" className="w-28 text-xs font-medium text-muted-foreground uppercase tracking-wide">{copy.table.action}</p>
            </div>
            <ul role="list">
              {localUsers.map((user, idx) => (
                <li
                  key={user.id}
                  role="row"
                  className={`flex items-center gap-4 px-5 py-4 ${idx < localUsers.length - 1 ? 'border-b border-border' : ''}`}
                >
                  <p className="flex-1 truncate text-sm text-foreground">{user.email ?? '\u2014'}</p>
                  <div className="flex-1"><RoleBadge role={user.role} copy={copy.roles} /></div>
                  <div className="flex-1"><StatusLabel user={user} copy={copy} /></div>
                  <p className="flex-1 text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                  <div className="w-28 flex items-center gap-1">
                    {user.role === 'student' && (
                      <button
                        type="button"
                        onClick={() => handleRowClick(user)}
                        className="text-xs font-medium text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {adminCopy.studentRecord.viewRecord}
                      </button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <DotsThreeVertical size={16} weight="duotone" />
                          <span className="sr-only">{copy.table.action}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {user.frozenAt ? (
                          <DropdownMenuItem onClick={() => setUnfreezeTarget(user)}>
                            {freezeCopy.unfreezeAction}
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setFreezeTarget(user)}
                          >
                            {freezeCopy.action}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Mobile cards — shown below md */}
          <ul role="list" className="md:hidden space-y-3">
            {localUsers.map((user) => (
              <li key={user.id} className="rounded-xl border border-border bg-card px-4 py-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm font-medium text-foreground">{user.email ?? '\u2014'}</p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <DotsThreeVertical size={16} weight="duotone" />
                        <span className="sr-only">{copy.table.action}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {user.frozenAt ? (
                        <DropdownMenuItem onClick={() => setUnfreezeTarget(user)}>
                          {freezeCopy.unfreezeAction}
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setFreezeTarget(user)}
                        >
                          {freezeCopy.action}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center gap-2">
                  <RoleBadge role={user.role} copy={copy.roles} />
                  <StatusLabel user={user} copy={copy} />
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

      {/* Freeze confirmation dialog */}
      <AlertDialog open={freezeTarget !== null} onOpenChange={(open) => !open && setFreezeTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{freezeCopy.confirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>{freezeCopy.confirmDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isFreezePending}>{freezeCopy.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleFreeze}
              disabled={isFreezePending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {freezeCopy.confirmCta}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unfreeze confirmation dialog */}
      <AlertDialog open={unfreezeTarget !== null} onOpenChange={(open) => !open && setUnfreezeTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{freezeCopy.unfreezeConfirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>{freezeCopy.unfreezeConfirmDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isFreezePending}>{freezeCopy.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnfreeze} disabled={isFreezePending}>
              {freezeCopy.unfreezeConfirmCta}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
