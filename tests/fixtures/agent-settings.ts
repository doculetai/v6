import type { agentProfiles } from '@/db/schema';

type AgentProfileRow = typeof agentProfiles.$inferSelect;

export const agentProfileFixture: AgentProfileRow = {
  id: '00000000-0000-0000-0000-000000000001',
  userId: '00000000-0000-0000-0000-000000000002',
  fullName: 'Aminu Bello',
  phoneNumber: '+2348012345678',
  region: 'Kano',
  accreditationNumber: 'DCL-AGT-2026-001',
  notifyNewStudent: true,
  notifyCommissionPaid: true,
  notifyStudentMilestone: false,
  notifyAccountSecurity: true,
  createdAt: new Date('2026-01-15T08:00:00Z'),
  updatedAt: new Date('2026-03-01T12:00:00Z'),
};

export const agentProfileNoDetailsFixture: AgentProfileRow = {
  id: '00000000-0000-0000-0000-000000000003',
  userId: '00000000-0000-0000-0000-000000000004',
  fullName: null,
  phoneNumber: null,
  region: null,
  accreditationNumber: null,
  notifyNewStudent: true,
  notifyCommissionPaid: true,
  notifyStudentMilestone: true,
  notifyAccountSecurity: true,
  createdAt: new Date('2026-03-01T08:00:00Z'),
  updatedAt: new Date('2026-03-01T08:00:00Z'),
};
