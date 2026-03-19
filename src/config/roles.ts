export const dashboardRoles = [
  'student',
  'sponsor',
  'university',
  'admin',
  'agent',
  'partner',
] as const;

export type DashboardRole = (typeof dashboardRoles)[number];

export function isDashboardRole(role: string): role is DashboardRole {
  return dashboardRoles.includes(role as DashboardRole);
}

// ── Role accent colours — canonical source of truth ───────────────────────────
// Role-tinted sidebar: each user's dashboard feels uniquely theirs.
// Used in: Sidebar (nav active state), design tokens (ThemeShowcase), CSS vars.
export const ROLE_ACCENTS: Record<DashboardRole, { text: string; bg: string }> = {
  student:    { text: '#2B39A3', bg: 'rgba(43,57,163,0.12)'  },
  sponsor:    { text: '#15803D', bg: 'rgba(21,128,61,0.12)'  },
  university: { text: '#0369A1', bg: 'rgba(3,105,161,0.12)'  },
  admin:      { text: '#C2410C', bg: 'rgba(194,65,12,0.12)'  },
  agent:      { text: '#6D28D9', bg: 'rgba(109,40,217,0.12)' },
  partner:    { text: '#0F766E', bg: 'rgba(15,118,110,0.12)' },
};
