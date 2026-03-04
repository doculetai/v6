import { maxDocumentUploadSizeBytes, type StudentDocumentType } from '@/lib/documents';

function createFileOfSize(size: number, name: string, type: string) {
  return new File([new Uint8Array(size)], name, { type });
}

export const studentDocumentFixtures = {
  validDocumentType: 'passport' as StudentDocumentType,
  validPdfFile: createFileOfSize(512, 'passport.pdf', 'application/pdf'),
  invalidMimeFile: createFileOfSize(512, 'passport.txt', 'text/plain'),
  oversizedPdfFile: createFileOfSize(
    maxDocumentUploadSizeBytes + 1,
    'oversized-passport.pdf',
    'application/pdf',
  ),
};
