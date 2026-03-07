import type { DashboardRole } from '@/config/roles';

const DASHBOARD_BASE = '/dashboard';

function dashboardRoleRoot(role: DashboardRole): string {
  return `${DASHBOARD_BASE}/${role}`;
}

function dashboardRolePath(role: DashboardRole, segment?: string): string {
  if (!segment) {
    return dashboardRoleRoot(role);
  }

  return `${dashboardRoleRoot(role)}/${segment}`;
}

export const routes = {
  home: '/',
  auth: {
    login: '/login',
    signup: '/signup',
    forgotPassword: '/forgot-password',
    updatePassword: '/update-password',
  },
  marketing: {
    landing: '/',
    verify: '/verify',
    about: '/about',
    pricing: '/pricing',
    privacy: '/privacy',
    terms: '/terms',
    contact: '/contact',
    join: '/join',
    certificate: (token: string) => `/certificate/${encodeURIComponent(token)}`,
  },
  dashboard: {
    root: DASHBOARD_BASE,
    roleRoot: dashboardRoleRoot,
    rolePath: dashboardRolePath,
    student: {
      overview: dashboardRoleRoot('student'),
      setup: dashboardRolePath('student', 'setup'),
      onboarding: dashboardRolePath('student', 'onboarding'),
      schools: dashboardRolePath('student', 'schools'),
      verification: dashboardRolePath('student', 'verification'),
      documents: dashboardRolePath('student', 'documents'),
      documentsBank: `${dashboardRolePath('student', 'documents')}#bank`,
      proof: dashboardRolePath('student', 'proof'),
      sponsors: dashboardRolePath('student', 'sponsors'),
      settings: dashboardRolePath('student', 'settings'),
    },
    sponsor: {
      overview: dashboardRoleRoot('sponsor'),
      students: dashboardRolePath('sponsor', 'students'),
      transactions: dashboardRolePath('sponsor', 'transactions'),
      kyc: dashboardRolePath('sponsor', 'kyc'),
      disbursements: dashboardRolePath('sponsor', 'disbursements'),
      commitments: dashboardRolePath('sponsor', 'commitments'),
      settings: dashboardRolePath('sponsor', 'settings'),
    },
    university: {
      overview: dashboardRoleRoot('university'),
      pipeline: dashboardRolePath('university', 'pipeline'),
      students: dashboardRolePath('university', 'students'),
      programs: dashboardRolePath('university', 'programs'),
      settings: dashboardRolePath('university', 'settings'),
    },
    admin: {
      overview: dashboardRoleRoot('admin'),
      operations: dashboardRolePath('admin', 'operations'),
      analytics: dashboardRolePath('admin', 'analytics'),
      risk: dashboardRolePath('admin', 'risk'),
      users: dashboardRolePath('admin', 'users'),
      settings: dashboardRolePath('admin', 'settings'),
    },
    agent: {
      overview: dashboardRoleRoot('agent'),
      actions: dashboardRolePath('agent', 'actions'),
      bulkInvite: dashboardRolePath('agent', 'bulk-invite'),
      students: dashboardRolePath('agent', 'students'),
      commissions: dashboardRolePath('agent', 'commissions'),
      activity: dashboardRolePath('agent', 'activity'),
      settings: dashboardRolePath('agent', 'settings'),
    },
    partner: {
      overview: dashboardRoleRoot('partner'),
      students: dashboardRolePath('partner', 'students'),
      analytics: dashboardRolePath('partner', 'analytics'),
      apiKeys: dashboardRolePath('partner', 'api-keys'),
      branding: dashboardRolePath('partner', 'branding'),
      integrations: dashboardRolePath('partner', 'api-keys'),
      settings: dashboardRolePath('partner', 'settings'),
    },
  },
} as const;
