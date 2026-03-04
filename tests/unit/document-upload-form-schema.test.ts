import { studentCopy } from '@/config/copy/student';

import { createDocumentUploadFormSchema } from '@/components/student/documents/document-upload-form-schema';

import { studentDocumentFixtures } from '../fixtures/student-documents';

describe('createDocumentUploadFormSchema', () => {
  const schema = createDocumentUploadFormSchema(studentCopy.documents.validation);

  it('accepts a valid document upload payload', () => {
    const result = schema.safeParse({
      documentType: studentDocumentFixtures.validDocumentType,
      file: studentDocumentFixtures.validPdfFile,
    });

    expect(result.success).toBe(true);
  });

  it('rejects when document type is missing', () => {
    const result = schema.safeParse({
      documentType: '',
      file: studentDocumentFixtures.validPdfFile,
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        studentCopy.documents.validation.documentTypeRequired,
      );
    }
  });

  it('rejects unsupported mime types', () => {
    const result = schema.safeParse({
      documentType: studentDocumentFixtures.validDocumentType,
      file: studentDocumentFixtures.invalidMimeFile,
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        studentCopy.documents.validation.fileTypeInvalid,
      );
    }
  });

  it('rejects files larger than 8MB', () => {
    const result = schema.safeParse({
      documentType: studentDocumentFixtures.validDocumentType,
      file: studentDocumentFixtures.oversizedPdfFile,
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        studentCopy.documents.validation.fileTooLarge,
      );
    }
  });
});
