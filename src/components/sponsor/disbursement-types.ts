export const disbursementStatuses = [
  'pending',
  'processing',
  'completed',
  'failed',
] as const;

export type DisbursementStatus = (typeof disbursementStatuses)[number];

export const disbursementFilters = ['all', 'pending', 'completed', 'failed'] as const;
export type DisbursementFilter = (typeof disbursementFilters)[number];

export interface SponsorDisbursement {
  id: string;
  sponsorshipId: string;
  amountKobo: number;
  status: DisbursementStatus;
  paystackReference: string | null;
  scheduledAt: string;
  updatedAt: string;
  createdAt: string;
  disbursedAt: string | null;
  studentId: string;
  studentEmail: string;
  studentDisplayName: string;
}

export interface SponsorDisbursementStudent {
  sponsorshipId: string;
  studentId: string;
  studentEmail: string;
  studentDisplayName: string;
}
