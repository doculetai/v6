import type { NewDisbursementFormValues } from '@/components/sponsor/disbursement-form-schema';
import type {
  SponsorDisbursement,
  SponsorDisbursementStudent,
} from '@/components/sponsor/disbursement-types';

export const sponsorDisbursementStudentsFixture: SponsorDisbursementStudent[] = [
  {
    sponsorshipId: '2cabf42b-d2a5-4edc-b20d-9fd57e3075cb',
    studentId: '14995363-2414-4f5c-82b3-df2634e31ff9',
    studentEmail: 'ada.okafor@studentmail.com',
    studentDisplayName: 'Ada Okafor',
  },
  {
    sponsorshipId: 'f885e367-7b25-4321-a8f0-b11fda8fe2ff',
    studentId: '9ae1f232-6d06-4a63-a6c6-291f458e4b4b',
    studentEmail: 'chioma.nwachukwu@studentmail.com',
    studentDisplayName: 'Chioma Nwachukwu',
  },
];

export const sponsorDisbursementsFixture: SponsorDisbursement[] = [
  {
    id: '95485ac6-b4c4-4d66-b104-b3b6d490e078',
    sponsorshipId: sponsorDisbursementStudentsFixture[0]!.sponsorshipId,
    amountKobo: 320_000_000,
    status: 'completed',
    paystackReference: 'DOC-PSK-20260304001',
    scheduledAt: '2026-03-01T09:00:00.000Z',
    updatedAt: '2026-03-01T09:05:00.000Z',
    createdAt: '2026-03-01T08:58:00.000Z',
    disbursedAt: '2026-03-01T09:05:00.000Z',
    studentId: sponsorDisbursementStudentsFixture[0]!.studentId,
    studentEmail: sponsorDisbursementStudentsFixture[0]!.studentEmail,
    studentDisplayName: sponsorDisbursementStudentsFixture[0]!.studentDisplayName,
  },
  {
    id: 'e7e6af39-c220-4ea8-9c2f-5849ff2d0e86',
    sponsorshipId: sponsorDisbursementStudentsFixture[1]!.sponsorshipId,
    amountKobo: 150_000_000,
    status: 'processing',
    paystackReference: 'DOC-PSK-20260304002',
    scheduledAt: '2026-03-03T10:30:00.000Z',
    updatedAt: '2026-03-03T10:32:00.000Z',
    createdAt: '2026-03-03T10:20:00.000Z',
    disbursedAt: null,
    studentId: sponsorDisbursementStudentsFixture[1]!.studentId,
    studentEmail: sponsorDisbursementStudentsFixture[1]!.studentEmail,
    studentDisplayName: sponsorDisbursementStudentsFixture[1]!.studentDisplayName,
  },
  {
    id: '9124f9f3-e3a5-4f2f-a724-783573cd1bb2',
    sponsorshipId: sponsorDisbursementStudentsFixture[0]!.sponsorshipId,
    amountKobo: 110_000_000,
    status: 'failed',
    paystackReference: 'DOC-PSK-20260304003',
    scheduledAt: '2026-03-04T11:00:00.000Z',
    updatedAt: '2026-03-04T11:03:00.000Z',
    createdAt: '2026-03-04T10:55:00.000Z',
    disbursedAt: null,
    studentId: sponsorDisbursementStudentsFixture[0]!.studentId,
    studentEmail: sponsorDisbursementStudentsFixture[0]!.studentEmail,
    studentDisplayName: sponsorDisbursementStudentsFixture[0]!.studentDisplayName,
  },
];

export const newDisbursementFormFixture: NewDisbursementFormValues = {
  sponsorshipId: sponsorDisbursementStudentsFixture[0]!.sponsorshipId,
  amountNaira: '2,000,000',
  note: 'First semester tuition transfer',
  scheduleType: 'later',
  scheduledAt: '2099-12-01T08:30',
};
