'use client';

import { useParams } from 'next/navigation';

import type { Breadcrumb } from '@/components/layout/page-header';
import { primitivesCopy } from '@/config/copy/primitives';
import { isDashboardRole } from '@/config/roles';
import { routes } from '@/config/routes';

/**
 * Returns standard dashboard breadcrumbs: [Overview → Current Page].
 * Uses route params to derive the role automatically.
 */
export function useDashboardBreadcrumbs(currentLabel: string): Breadcrumb[] {
  const params = useParams();
  const role = params.role as string;
  const overviewHref = isDashboardRole(role) ? routes.dashboard.roleRoot(role) : routes.home;

  return [
    { label: primitivesCopy.nav.overview, href: overviewHref },
    { label: currentLabel },
  ];
}
