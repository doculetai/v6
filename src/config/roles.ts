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
