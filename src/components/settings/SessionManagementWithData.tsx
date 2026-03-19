'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import type { Session } from '@/components/ui/session-management';
import { SessionManagement } from '@/components/ui/session-management';
import { primitivesCopy } from '@/config/copy/primitives';
import { trpc } from '@/trpc/client';

export function SessionManagementWithData() {
  const router = useRouter();
  const { data: sessions = [], isLoading } = trpc.sessions.list.useQuery();
  const revoke = trpc.sessions.revoke.useMutation({
    onSuccess: () => {
      void router.refresh();
      toast.success(primitivesCopy.sessionManagement.revoked);
    },
    onError: () => {
      toast.error(primitivesCopy.sessionManagement.revokeFailed);
    },
  });
  const revokeAll = trpc.sessions.revokeAllOthers.useMutation({
    onSuccess: () => {
      void router.refresh();
      toast.success(primitivesCopy.sessionManagement.revokedAll);
    },
    onError: () => {
      toast.error(primitivesCopy.sessionManagement.revokeFailed);
    },
  });

  const mapped: Session[] = sessions.map((s) => ({
    id: s.id,
    browser: s.browser,
    deviceType: s.deviceType,
    location: s.location,
    lastActive: s.lastActive,
    isCurrent: s.isCurrent,
    ipAddress: s.ipAddress,
  }));

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card p-5">
        <p className="text-sm text-muted-foreground">
          {primitivesCopy.sessionManagement.loading}
        </p>
      </div>
    );
  }

  return (
    <SessionManagement
      sessions={mapped}
      showIpAddress={false}
      onRevoke={(id) => revoke.mutate({ sessionId: id })}
      onRevokeAll={() => revokeAll.mutate()}
    />
  );
}
