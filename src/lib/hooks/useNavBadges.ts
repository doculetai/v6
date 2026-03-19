'use client';

import { useMemo } from 'react';

import type { DashboardRole } from '@/config/roles';
import type { NavItem } from '@/config/nav/types';
import { trpc } from '@/trpc/client';
import { routes } from '@/config/routes';

const BADGE_STALE_TIME = 30_000;
const BADGE_REFETCH_INTERVAL = 60_000;

/**
 * Fetches live badge counts for the current role's nav items.
 * Returns a map of href → badge count that can be merged into nav config.
 */
export function useNavBadges(role: DashboardRole): Record<string, number> {
  // Student: pending documents count
  const studentDocsQuery = trpc.student.listDocuments.useQuery(undefined, {
    enabled: role === 'student',
    staleTime: BADGE_STALE_TIME,
    refetchInterval: BADGE_REFETCH_INTERVAL,
  });

  // Sponsor: pending invites
  const sponsorOverviewQuery = trpc.sponsor.getSponsorOverview.useQuery(undefined, {
    enabled: role === 'sponsor',
    staleTime: BADGE_STALE_TIME,
    refetchInterval: BADGE_REFETCH_INTERVAL,
  });

  // University: pending documents
  const universityOverviewQuery = trpc.university.getOverview.useQuery(undefined, {
    enabled: role === 'university',
    staleTime: BADGE_STALE_TIME,
    refetchInterval: BADGE_REFETCH_INTERVAL,
  });

  // Admin: pending operations + risk flags
  const adminStatsQuery = trpc.admin.getOperationsStats.useQuery(undefined, {
    enabled: role === 'admin',
    staleTime: BADGE_STALE_TIME,
    refetchInterval: BADGE_REFETCH_INTERVAL,
  });

  const adminRiskQuery = trpc.admin.getRiskFlags.useQuery(undefined, {
    enabled: role === 'admin',
    staleTime: BADGE_STALE_TIME,
    refetchInterval: BADGE_REFETCH_INTERVAL,
  });

  // Agent: pending commissions
  const agentOverviewQuery = trpc.agent.getAgentOverview.useQuery(undefined, {
    enabled: role === 'agent',
    staleTime: BADGE_STALE_TIME,
    refetchInterval: BADGE_REFETCH_INTERVAL,
  });

  return useMemo(() => {
    const badges: Record<string, number> = {};

    if (role === 'student' && studentDocsQuery.data) {
      const pending = studentDocsQuery.data.filter(
        (d) => d.status === 'pending',
      ).length;
      if (pending > 0) badges[routes.dashboard.student.documents] = pending;
    }

    if (role === 'sponsor' && sponsorOverviewQuery.data) {
      const count = sponsorOverviewQuery.data.pendingInvites;
      if (count > 0) badges[routes.dashboard.sponsor.students] = count;
    }

    if (role === 'university' && universityOverviewQuery.data) {
      const count = universityOverviewQuery.data.pendingApplications;
      if (count > 0) badges[routes.dashboard.university.pipeline] = count;
    }

    if (role === 'admin') {
      if (adminStatsQuery.data) {
        const count = adminStatsQuery.data.pending;
        if (count > 0) badges[routes.dashboard.admin.operations] = count;
      }
      if (adminRiskQuery.data) {
        const highSeverity = adminRiskQuery.data.filter(
          (f) => f.severity === 'high',
        ).length;
        if (highSeverity > 0) badges[routes.dashboard.admin.risk] = highSeverity;
      }
    }

    if (role === 'agent' && agentOverviewQuery.data) {
      if (agentOverviewQuery.data.pendingCommissionsKobo > 0) {
        badges[routes.dashboard.agent.commissions] = 1;
      }
    }

    return badges;
  }, [
    role,
    studentDocsQuery.data,
    sponsorOverviewQuery.data,
    universityOverviewQuery.data,
    adminStatsQuery.data,
    adminRiskQuery.data,
    agentOverviewQuery.data,
  ]);
}

/**
 * Merges live badge counts into a nav items array.
 */
export function applyBadges(items: NavItem[], badges: Record<string, number>): NavItem[] {
  if (Object.keys(badges).length === 0) return items;
  return items.map((item) => {
    const count = badges[item.href];
    if (count !== undefined && count > 0) {
      return { ...item, badge: count };
    }
    return item;
  });
}
