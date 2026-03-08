'use client';

import { Eye, X } from '@/components/icons';

import { adminCopy } from '@/config/copy/admin';
import { trpc } from '@/trpc/client';
import { routes } from '@/config/routes';

interface ImpersonationBannerProps {
  /** When provided, renders a standalone banner driven by props (no tRPC query). */
  studentName?: string;
  onExit?: () => void;
}

/**
 * Yellow sticky banner shown when an admin is impersonating a user.
 *
 * Usage A — self-contained (queries tRPC internally):
 *   <ImpersonationBanner />
 *
 * Usage B — props-driven (for use inside DashboardShell impersonating slot):
 *   <ImpersonationBanner studentName="Emeka Okafor" onExit={handleExit} />
 */
export function ImpersonationBanner({ studentName, onExit }: ImpersonationBannerProps) {
  // Props-driven mode: render immediately with provided name/exit handler
  if (studentName !== undefined && onExit !== undefined) {
    return (
      <div className="sticky top-0 z-50 flex items-center justify-between bg-warning/20 border-b border-warning/40 px-4 py-2 text-sm font-semibold text-foreground">
        <span>{adminCopy.impersonation.banner(studentName)}</span>
        <button
          type="button"
          onClick={onExit}
          className="min-h-[44px] underline underline-offset-4 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {adminCopy.impersonation.exit}
        </button>
      </div>
    );
  }

  // Self-contained mode: queries tRPC for active impersonation state
  return <SelfContainedImpersonationBanner />;
}

function SelfContainedImpersonationBanner() {
  const { data: status } = trpc.adminImpersonation.getImpersonationStatus.useQuery(
    undefined,
    { refetchOnWindowFocus: false },
  );
  const utils = trpc.useUtils();
  const endMutation = trpc.adminImpersonation.endImpersonation.useMutation({
    onSuccess: () => {
      utils.adminImpersonation.getImpersonationStatus.invalidate();
      window.location.href = routes.dashboard.admin.users;
    },
  });

  if (!status?.active || !status.targetUserId) return null;

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between bg-warning/20 border-b border-warning/40 px-4 py-2 text-sm font-semibold text-foreground">
      <div className="flex items-center gap-2">
        <Eye size={18} weight="duotone" />
        <span>{adminCopy.impersonation.banner(status.targetRole ?? 'user')}</span>
      </div>
      <button
        type="button"
        onClick={() => endMutation.mutate()}
        disabled={endMutation.isPending}
        className="min-h-[44px] underline underline-offset-4 hover:no-underline disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X size={14} weight="duotone" className="mr-1 inline" />
        {adminCopy.impersonation.exit}
      </button>
    </div>
  );
}
