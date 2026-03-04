import type { partnerStudents } from '@/db/schema';

type PartnerStudentInsert = typeof partnerStudents.$inferInsert;

const now = new Date('2026-03-04T10:00:00.000Z');

export const partnerStudentFixtures: PartnerStudentInsert[] = [
  {
    id: '11111111-0000-0000-0000-000000000001',
    partnerId: 'aaaaaaaa-0000-0000-0000-000000000001',
    studentId: 'cccccccc-0000-0000-0000-000000000001',
    tier: 3,
    verifiedAt: new Date('2026-02-15T08:30:00.000Z'),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: '11111111-0000-0000-0000-000000000002',
    partnerId: 'aaaaaaaa-0000-0000-0000-000000000001',
    studentId: 'cccccccc-0000-0000-0000-000000000002',
    tier: 2,
    verifiedAt: new Date('2026-02-20T14:15:00.000Z'),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: '11111111-0000-0000-0000-000000000003',
    partnerId: 'aaaaaaaa-0000-0000-0000-000000000001',
    studentId: 'cccccccc-0000-0000-0000-000000000003',
    tier: 1,
    verifiedAt: new Date('2026-03-01T09:45:00.000Z'),
    createdAt: now,
    updatedAt: now,
  },
];
