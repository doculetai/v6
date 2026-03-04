import { z } from 'zod';

import {
  maxDocumentUploadSizeBytes,
  supportedDocumentMimeTypes,
  type StudentDocumentType,
  studentDocumentTypeValues,
} from '@/lib/documents';

type UploadValidationCopy = {
  documentTypeRequired: string;
  fileRequired: string;
  fileTypeInvalid: string;
  fileTooLarge: string;
};

export function createDocumentUploadFormSchema(validationCopy: UploadValidationCopy) {
  return z.object({
    documentType: z
      .union([z.enum(studentDocumentTypeValues), z.literal('')])
      .refine(
        (value): value is StudentDocumentType => value !== '',
        validationCopy.documentTypeRequired,
      ),
    file: z
      .custom<File>((value) => value instanceof File && value.size > 0, {
        message: validationCopy.fileRequired,
      })
      .refine((file) => {
        return supportedDocumentMimeTypes.includes(file.type as (typeof supportedDocumentMimeTypes)[number]);
      }, validationCopy.fileTypeInvalid)
      .refine((file) => file.size <= maxDocumentUploadSizeBytes, validationCopy.fileTooLarge),
  });
}

export type DocumentUploadFormInputValues = z.input<
  ReturnType<typeof createDocumentUploadFormSchema>
>;

export type DocumentUploadFormValues = z.output<
  ReturnType<typeof createDocumentUploadFormSchema>
>;
