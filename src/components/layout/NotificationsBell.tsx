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
          'relative rounded-lg p-[6px] text-muted-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          className,
        )}
      >
        <Bell weight="duotone" className="size-[18px]" aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            className="absolute right-1 top-1 h-2 w-2 rounded-full border-2 border-background"
            style={{ backgroundColor: 'var(--role-accent)' }}
            aria-hidden="true"
          />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[340px] overflow-hidden rounded-2xl border border-border p-0 shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-2">
            <Bell weight="duotone" className="size-3.5 text-muted-foreground" aria-hidden="true" />
            <span className="text-[13px] font-semibold text-foreground">{copy.title}</span>
            {unreadCount > 0 && (
              <span
                className="flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
                style={{ backgroundColor: 'var(--role-accent)' }}
              >
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAll}
              className="text-[11px] font-medium transition-opacity hover:opacity-70"
              style={{ color: 'var(--role-accent)' }}
            >
              {copy.markAllRead}
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-[min(55vh,380px)] overflow-y-auto">
          {list.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-8">
              <Bell weight="duotone" className="size-6 text-muted-foreground/40" aria-hidden="true" />
              <p className="text-center text-sm text-muted-foreground">{copy.empty}</p>
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.key}>
                <div className="sticky top-0 z-10 border-b border-border/40 bg-popover/95 px-4 pb-1.5 pt-3 backdrop-blur-sm">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/60">
                    {copy.categoryGroups[group.key]}
                  </span>
                </div>
                {group.items.map((n) => {
                  const href = getNotificationLink(
                    n.type,
                    n.metaJson as Record<string, unknown> | null,
                    role,
                  );
                  const isUnread = !n.readAt;
                  return (
                    <DropdownMenuItem
                      key={n.id}
                      asChild
                      className="p-0 rounded-none data-[highlighted]:bg-transparent data-[highlighted]:text-inherit"
                    >
                      <Link
                        href={href}
                        onClick={() =>
                          isUnread &&
                          markRead.mutate(
                            { id: n.id },
                            { onSettled: () => utils.notifications.invalidate() },
                          )
                        }
                        className={cn(
                          'relative flex w-full items-start gap-3 border-b border-border/40 py-3 pl-4 pr-4 text-[13px] text-foreground transition-colors last:border-0 hover:bg-accent/50',
                          isUnread && 'bg-[color-mix(in_srgb,var(--role-accent)_6%,transparent)]',
                        )}
                      >
                        {/* Role-accent left border for unread */}
                        {isUnread && (
                          <span
                            className="absolute inset-y-0 left-0 w-[3px] rounded-r-full"
                            style={{ backgroundColor: 'var(--role-accent)' }}
                            aria-hidden="true"
                          />
                        )}
                        <div className="mt-0.5 shrink-0">
                          {getNotificationIcon(n.type)}
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <div className="flex items-start justify-between gap-2">
                            <span className={cn('truncate text-[13px]', isUnread ? 'font-semibold text-foreground' : 'font-medium text-foreground/80')}>
                              {n.title}
                            </span>
                            <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground/60">
                              {getRelativeTime(n.createdAt)}
                            </span>
                          </div>
                          {n.body && (
                            <span className="line-clamp-2 text-xs text-muted-foreground">
                              {n.body}
                            </span>
                          )}
                        </div>
                        {/* Unread dot (right side) */}
                        {isUnread && (
                          <span
                            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{ backgroundColor: 'var(--role-accent)' }}
                            aria-hidden="true"
                          />
                        )}
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
