export interface DocumentRow {
  id: string;
  type: 'passport' | 'bank_statement' | 'offer_letter' | 'affidavit' | 'cac';
  status: 'pending' | 'approved' | 'rejected' | 'more_info_requested';
  storageUrl: string;
  rejectionReason: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  studentEmail: string;
}

export interface DocumentStats {
  total: number;
  pending: number;
  approved: number;
  moreInfoRequested: number;
}
