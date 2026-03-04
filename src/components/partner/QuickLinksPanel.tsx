import { BookOpen, Key, Send, LifeBuoy } from 'lucide-react';
import Link from 'next/link';

import { partnerCopy } from '@/config/copy/partner';
import { SurfacePanel } from '@/components/ui/surface-panel';

const links = [
  {
    href: 'https://docs.doculet.ai',
    label: partnerCopy.dashboard.quickLinks.docs,
    icon: BookOpen,
    external: true,
  },
  {
    href: '/dashboard/partner/api-keys',
    label: partnerCopy.dashboard.quickLinks.apiKeys,
    icon: Key,
    external: false,
  },
  {
    href: '/dashboard/partner/webhooks',
    label: partnerCopy.dashboard.quickLinks.webhooks,
    icon: Send,
    external: false,
  },
  {
    href: 'mailto:support@doculet.ai',
    label: partnerCopy.dashboard.quickLinks.support,
    icon: LifeBuoy,
    external: true,
  },
] as const;

export function QuickLinksPanel() {
  const copy = partnerCopy.dashboard.quickLinks;

  return (
    <SurfacePanel density="dense">
      <h2 className="mb-3 text-sm font-semibold text-foreground">{copy.title}</h2>
      <ul className="space-y-1">
        {links.map(({ href, label, icon: Icon, external }) => (
          <li key={href}>
            <Link
              href={href}
              target={external ? '_blank' : undefined}
              rel={external ? 'noopener noreferrer' : undefined}
              className="flex min-h-11 items-center gap-3 rounded-lg px-2 py-2 text-sm text-foreground transition-colors duration-150 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </SurfacePanel>
  );
}
