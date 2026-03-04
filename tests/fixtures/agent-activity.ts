import type { agentActivityLogs } from '@/db/schema';

type AgentActivityLog = typeof agentActivityLogs.$inferSelect;

const AGENT_PROFILE_ID = '00000000-0000-0000-0000-000000000001';
const STUDENT_PROFILE_ID = '00000000-0000-0000-0000-000000000002';

const now = new Date('2026-03-04T12:00:00.000Z');

function minutesAgo(n: number): Date {
  return new Date(now.getTime() - n * 60 * 1000);
}

export const agentActivityLogFixtures: AgentActivityLog[] = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    agentId: AGENT_PROFILE_ID,
    studentId: STUDENT_PROFILE_ID,
    actionType: 'claimed_student',
    details: 'Claimed Amara Okafor — Lagos',
    createdAt: minutesAgo(5),
    updatedAt: minutesAgo(5),
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    agentId: AGENT_PROFILE_ID,
    studentId: STUDENT_PROFILE_ID,
    actionType: 'sent_reminder',
    details: 'Reminder to upload bank statement',
    createdAt: minutesAgo(90),
    updatedAt: minutesAgo(90),
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    agentId: AGENT_PROFILE_ID,
    studentId: STUDENT_PROFILE_ID,
    actionType: 'reviewed_document',
    details: 'Reviewed Guaranty Trust Bank statement',
    createdAt: minutesAgo(180),
    updatedAt: minutesAgo(180),
  },
  {
    id: '10000000-0000-0000-0000-000000000004',
    agentId: AGENT_PROFILE_ID,
    studentId: null,
    actionType: 'flagged_issue',
    details: 'Statement balance below Tier 2 threshold',
    createdAt: minutesAgo(360),
    updatedAt: minutesAgo(360),
  },
];
