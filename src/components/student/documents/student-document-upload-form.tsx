'use client';

import { UploadCloud } from 'lucide-react';
import { useState } from 'react';
import { Controller, type UseFormReturn } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { StudentCopy } from '@/config/copy/student';

import type {
  DocumentUploadFormInputValues,
  DocumentUploadFormValues,
} from './document-upload-form-schema';

type StudentDocumentUploadFormProps = {
  copy: StudentCopy['documents'];
  form: UseFormReturn<DocumentUploadFormInputValues, unknown, DocumentUploadFormValues>;
  fileInputKey: string;
  isUploading: boolean;
  onSubmit: (values: DocumentUploadFormValues) => void;
};

export function StudentDocumentUploadForm({
  copy,
  form,
  fileInputKey,
  isUploading,
  onSubmit,
}: StudentDocumentUploadFormProps) {
  const [isDragging, setIsDragging] = useState(false);
  const selectedFile = form.watch('file');
  const documentTypeError = form.formState.errors.documentType?.message;
  const fileError = form.formState.errors.file?.message;
  const uploadError = form.formState.errors.root?.message;

  return (
    <Card className="border-border bg-card/95 shadow-sm backdrop-blur dark:border-border dark:bg-card/95">
      <CardHeader className="space-y-2">
        <CardTitle className="text-xl text-card-foreground dark:text-card-foreground md:text-2xl">
          {copy.upload.title}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground dark:text-muted-foreground">
          {copy.upload.description}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <Label htmlFor="document-type">{copy.upload.documentTypeLabel}</Label>
            <Controller
              control={form.control}
              name="documentType"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value ?? ''}>
                  <SelectTrigger
                    id="document-type"
                    className="h-11 w-full bg-background dark:bg-background"
                    aria-invalid={Boolean(documentTypeError)}
                  >
                    <SelectValue placeholder={copy.upload.documentTypeHint} />
                  </SelectTrigger>
                  <SelectContent>
                    {copy.typeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {documentTypeError ? (
              <p className="text-sm text-destructive dark:text-destructive" role="alert">
                {documentTypeError}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="document-file">{copy.upload.fileLabel}</Label>
            {/* Hidden native input — label click triggers it */}
            <input
              key={fileInputKey}
              id="document-file"
              type="file"
              className="sr-only"
              accept={copy.upload.fileAccept}
              aria-invalid={Boolean(fileError)}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  form.setValue('file', file, { shouldTouch: true, shouldValidate: true });
                  return;
                }
                form.resetField('file');
              }}
            />
            {/* Styled dropzone */}
            <label
              htmlFor="document-file"
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) form.setValue('file', file, { shouldTouch: true, shouldValidate: true });
              }}
              className={cn(
                'flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors duration-150',
                isDragging
                  ? 'border-primary bg-primary/5'
                  : selectedFile
                    ? 'border-primary/40 bg-primary/5'
                    : 'border-border bg-background/60 hover:border-primary/40 hover:bg-primary/5',
              )}
            >
              <UploadCloud
                className={cn('size-8 transition-colors', selectedFile ? 'text-primary' : 'text-muted-foreground')}
                aria-hidden="true"
              />
              {selectedFile ? (
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {`${(selectedFile.size / 1024 / 1024).toFixed(2)} MB — click to change`}
                  </p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground">
                    Drag and drop your file, or <span className="text-primary underline-offset-2 hover:underline">browse</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{copy.upload.fileHelp}</p>
                </div>
              )}
            </label>

            {fileError ? (
              <p className="text-sm text-destructive dark:text-destructive" role="alert">
                {fileError}
              </p>
            ) : null}
          </div>

          {uploadError ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive dark:border-destructive/30 dark:bg-destructive/15 dark:text-destructive">
              {uploadError}
            </p>
          ) : null}

          <Button type="submit" className="min-h-11 w-full md:w-auto" disabled={isUploading}>
            {isUploading ? copy.upload.submitUploading : copy.upload.submitIdle}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
