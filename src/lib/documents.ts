export const studentDocumentTypeValues = [
  'passport',
  'bank_statement',
  'offer_letter',
  'affidavit',
  'cac',
] as const;

export type StudentDocumentType = (typeof studentDocumentTypeValues)[number];

export const studentDocumentStatusValues = [
  'pending',
  'approved',
  'rejected',
  'more_info_requested',
] as const;

export type StudentDocumentStatus = (typeof studentDocumentStatusValues)[number];

export const supportedDocumentMimeTypes = [
  'application/pdf',
  'image/png',
  'image/jpeg',
] as const;

export type SupportedDocumentMimeType = (typeof supportedDocumentMimeTypes)[number];

export const maxDocumentUploadSizeBytes = 8 * 1024 * 1024;
