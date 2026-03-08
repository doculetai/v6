'use client';

import {
  Bell,
  Certificate,
  CheckCircle,
  EnvelopeSimple,
  FileText,
  Money,
  ShieldWarning,
  UsersThree,
  Warning,
} from '@/components/icons';
import Link from 'next/link';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { dashboardShellCopy } from '@/config/copy/dashboard-shell';
import { cn } from '@/lib/utils';
import { trpc } from '@/trpc/client';

function getNotificationLink(
  type: string,
  meta: Record<string, unknown> | null,
  role: string,
): string {
  if (type === 'kyc_reminder' && meta?.reason === 'bank_expiry') {
    return `/dashboard/${role}/documents#bank`;
  }
  if (type === 'kyc_reminder' || type === 'kyc_approved' || type === 'kyc_failed') {
    return `/dashboard/${role}/verification`;
  }
  if (type === 'doc_approved' || type === 'doc_rejected' || type === 'doc_more_info') {
    return `/dashboard/${role}/documents`;
  }
  if (type === 'cert_issued' || type === 'cert_expiry_soon' || type === 'cert_expired') {
    return `/dashboard/${role}/proof`;
  }
  if (type === 'disbursement_success' || type === 'disbursement_failed') {
    return `/dashboard/${role}/disbursements`;
  }
  if (
    type === 'invite' ||
    type === 'invite_accepted' ||
    type === 'invite_rejected' ||
    type === 'sponsor_committed' ||
    type === 'sponsor_paused' ||
    type === 'sponsor_withdrawn'
  ) {
    return `/dashboard/${role}/students`;
  }
  return `/dashboard/${role}`;
}

function getNotificationIcon(type: string) {
  if (type === 'doc_approved') {
    return <CheckCircle className="size-4 shrink-0 text-primary" weight="duotone" aria-hidden="true" />;
  }
  if (type === 'doc_rejected' || type === 'doc_more_info') {
    return <Warning className="size-4 shrink-0 text-warning" weight="duotone" aria-hidden="true" />;
  }
  if (type === 'kyc_approved') {
    return <CheckCircle className="size-4 shrink-0 text-primary" weight="duotone" aria-hidden="true" />;
  }
  if (type === 'kyc_failed') {
    return <ShieldWarning className="size-4 shrink-0 text-destructive" weight="duotone" aria-hidden="true" />;
  }
  if (type === 'cert_issued') {
    return <Certificate className="size-4 shrink-0 text-primary" weight="duotone" aria-hidden="true" />;
  }
  if (type === 'cert_expiry_soon') {
    return <Certificate className="size-4 shrink-0 text-warning" weight="duotone" aria-hidden="true" />;
  }
  if (type === 'cert_expired') {
    return <Certificate className="size-4 shrink-0 text-destructive" weight="duotone" aria-hidden="true" />;
  }
  if (type === 'sponsor_committed') {
    return <UsersThree className="size-4 shrink-0 text-primary" weight="duotone" aria-hidden="true" />;
  }
  if (type === 'sponsor_paused' || type === 'sponsor_withdrawn') {
    return <UsersThree className="size-4 shrink-0 text-warning" weight="duotone" aria-hidden="true" />;
  }
  if (type === 'disbursement_success') {
    return <Money className="size-4 shrink-0 text-primary" weight="duotone" aria-hidden="true" />;
  }
  if (type === 'disbursement_failed') {
    return <Money className="size-4 shrink-0 text-destructive" weight="duotone" aria-hidden="true" />;
  }
  if (type === 'kyc_reminder') {
    return <ShieldWarning className="size-4 shrink-0 text-warning" weight="duotone" aria-hidden="true" />;
  }
  if (type === 'invite' || type === 'invite_accepted' || type === 'invite_rejected') {
    return <UsersThree className="size-4 shrink-0 text-muted-foreground" weight="duotone" aria-hidden="true" />;
  }
  if (type === 'system') {
    return <EnvelopeSimple className="size-4 shrink-0 text-muted-foreground" weight="duotone" aria-hidden="true" />;
  }
  return <FileText className="size-4 shrink-0 text-muted-foreground" weight="duotone" aria-hidden="true" />;
}

type NotificationCategory = keyof typeof copy.categoryGroups;

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  category: string | null;
  readAt: Date | null;
  createdAt: Date;
  metaJson: unknown;
};

function getRelativeTime(date: Date): string {
  const now = Date.now();
  const diffMs = now - new Date(date).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return copy.relativeTime.now;
  if (diffMin < 60) return copy.relativeTime.minutes(diffMin);
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return copy.relativeTime.hours(diffHr);
  const diffDays = Math.floor(diffHr / 24);
  return copy.relativeTime.days(diffDays);
}

/** Derive the CLAUDE.md category from type+category fields. */
function resolveCategory(n: NotificationItem): NotificationCategory {
  // Prefer the stored category if it maps to a known group
  if (n.category) {
    const stored = n.category.toLowerCase();
    if (stored === 'documents') return 'documents';
    if (stored === 'verification') return 'verification';
    if (stored === 'sponsor') return 'sponsor';
    if (stored === 'certificate') return 'certificate';
  }
  // Derive from notification type
  if (n.type === 'doc_approved' || n.type === 'doc_rejected' || n.type === 'doc_more_info') {
    return 'documents';
  }
  if (n.type === 'kyc_reminder' || n.type === 'kyc_approved' || n.type === 'kyc_failed') {
    return 'verification';
  }
  if (n.type === 'cert_issued' || n.type === 'cert_expiry_soon' || n.type === 'cert_expired') {
    return 'certificate';
  }
  if (
    n.type === 'invite' ||
    n.type === 'invite_accepted' ||
    n.type === 'invite_rejected' ||
    n.type === 'sponsor_committed' ||
    n.type === 'sponsor_paused' ||
    n.type === 'sponsor_withdrawn'
  ) {
    return 'sponsor';
  }
  return 'general';
}

const CATEGORY_ORDER: NotificationCategory[] = [
  'documents',
  'verification',
  'sponsor',
  'certificate',
  'general',
];

function groupByCategory(list: NotificationItem[]): {
  key: NotificationCategory;
  items: NotificationItem[];
}[] {
  const map = new Map<NotificationCategory, NotificationItem[]>();

  for (const n of list) {
    const key = resolveCategory(n);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(n);
  }

  return CATEGORY_ORDER.filter((key) => map.has(key)).map((key) => ({
    key,
    items: map.get(key)!,
  }));
}

type NotificationsBellProps = {
  role: string;
  className?: string;
};

const copy = dashboardShellCopy.notifications;

export function NotificationsBell({ role, className }: NotificationsBellProps) {
  const { data: list = [] } = trpc.notifications.list.useQuery({ limit: 20 });
  const { data: unreadCount = 0 } = trpc.notifications.unreadCount.useQuery();
  const markRead = trpc.notifications.markRead.useMutation();
  const utils = trpc.useUtils();

  const handleMarkAll = () => {
    markRead.mutate(
      { markAll: true },
      { onSettled: () => utils.notifications.invalidate() },
    );
  };

  const groups = groupByCategory(list as NotificationItem[]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={copy.ariaLabel}
        className={cn(
          'relative rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          className,
        )}
      >
        <Bell weight="duotone" className="size-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary"
            aria-hidden="true"
          />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 sm:w-80">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-sm font-medium">{copy.title}</span>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAll}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {copy.markAllRead}
            </button>
          )}
        </div>
        <div className="max-h-[min(50vh,360px)] overflow-y-auto">
          {list.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              {copy.empty}
            </p>
          ) : (
            groups.map((group) => (
              <div key={group.key}>
                <div className="sticky top-0 z-10 bg-popover px-3 py-1.5">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {copy.categoryGroups[group.key]}
                  </span>
                </div>
                {group.items.map((n) => {
                  const href = getNotificationLink(
                    n.type,
                    n.metaJson as Record<string, unknown> | null,
                    role,
                  );
                  return (
                    <DropdownMenuItem key={n.id} asChild>
                      <Link
                        href={href}
                        onClick={() =>
                          !n.readAt &&
                          markRead.mutate(
                            { id: n.id },
                            { onSettled: () => utils.notifications.invalidate() },
                          )
                        }
                        className={cn(
                          'flex items-start gap-2.5 px-3 py-2.5',
                          !n.readAt && 'bg-accent/50',
                        )}
                      >
                        <div className="mt-0.5">
                          {getNotificationIcon(n.type)}
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate font-medium">{n.title}</span>
                            <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
                              {getRelativeTime(n.createdAt)}
                            </span>
                          </div>
                          {n.body && (
                            <span className="line-clamp-2 text-xs text-muted-foreground">
                              {n.body}
                            </span>
                          )}
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
