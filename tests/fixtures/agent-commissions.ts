import type { agentCommissions, agentProfiles } from '@/db/schema';

type AgentProfile = typeof agentProfiles.$inferSelect;
type AgentCommission = typeof agentCommissions.$inferSelect;

export const testAgentProfile: AgentProfile = {
  id: 'a1b2c3d4-0000-0000-0000-000000000001',
  userId: 'u1b2c3d4-0000-0000-0000-000000000001',
  referralCode: 'AGENT-TEST-001',
  createdAt: new Date('2025-01-01T00:00:00Z'),
  updatedAt: new Date('2025-01-01T00:00:00Z'),
};

export const testAgentCommissions: AgentCommission[] = [
  {
    id: 'c1000000-0000-0000-0000-000000000001',
    agentProfileId: testAgentProfile.id,
    studentId: 's1000000-0000-0000-0000-000000000001',
    studentName: 'Adaeze Okonkwo',
    universityName: 'University of Illinois Urbana-Champaign',
    tier: 3,
    eventType: 'certificateIssued',
    amountKobo: 1500000,
    status: 'paid',
    paidAt: new Date('2025-02-15T10:00:00Z'),
    createdAt: new Date('2025-02-14T09:00:00Z'),
    updatedAt: new Date('2025-02-15T10:00:00Z'),
  },
  {
    id: 'c1000000-0000-0000-0000-000000000002',
    agentProfileId: testAgentProfile.id,
    studentId: 's1000000-0000-0000-0000-000000000002',
    studentName: 'Emeka Nwosu',
    universityName: 'Georgia Institute of Technology',
    tier: 2,
    eventType: 'sponsorCommitted',
    amountKobo: 750000,
    status: 'processing',
    paidAt: null,
    createdAt: new Date('2025-03-01T11:00:00Z'),
    updatedAt: new Date('2025-03-01T11:00:00Z'),
  },
  {
    id: 'c1000000-0000-0000-0000-000000000003',
    agentProfileId: testAgentProfile.id,
    studentId: 's1000000-0000-0000-0000-000000000003',
    studentName: 'Ngozi Eze',
    universityName: 'Ohio State University',
    tier: 1,
    eventType: 'kycComplete',
    amountKobo: 250000,
    status: 'pending',
    paidAt: null,
    createdAt: new Date('2025-03-03T08:30:00Z'),
    updatedAt: new Date('2025-03-03T08:30:00Z'),
  },
];
