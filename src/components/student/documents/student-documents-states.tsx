import { FileSearch, RotateCw, TriangleAlert } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { StudentCopy } from '@/config/copy/student';

type StudentDocumentsStatesCopy = StudentCopy['documents']['states'];

type StudentDocumentsErrorStateProps = {
  copy: StudentDocumentsStatesCopy;
  onRetry: () => void;
};

type StudentDocumentsStateProps = {
  copy: StudentDocumentsStatesCopy;
};

export function StudentDocumentsLoadingState({ copy }: StudentDocumentsStateProps) {
  return (
    <Card className="border-border bg-card/95 dark:border-border dark:bg-card/95">
      <CardHeader className="space-y-2">
        <CardTitle className="text-xl text-card-foreground dark:text-card-foreground">
          {copy.loadingTitle}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground dark:text-muted-foreground">
          {copy.loadingDescription}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <Skeleton className="h-20 w-full bg-muted dark:bg-muted" />
        <Skeleton className="h-20 w-full bg-muted dark:bg-muted" />
        <Skeleton className="h-20 w-full bg-muted dark:bg-muted" />
      </CardContent>
    </Card>
  );
}

export function StudentDocumentsErrorState({ copy, onRetry }: StudentDocumentsErrorStateProps) {
  return (
    <Card className="border-border bg-card/95 dark:border-border dark:bg-card/95">
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2">
          <TriangleAlert className="size-5 text-destructive dark:text-destructive" aria-hidden="true" />
          <CardTitle className="text-xl text-card-foreground dark:text-card-foreground">
            {copy.errorTitle}
          </CardTitle>
        </div>

        <CardDescription className="text-sm text-muted-foreground dark:text-muted-foreground">
          {copy.errorDescription}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Button type="button" onClick={onRetry} className="min-h-11 w-full gap-2 sm:w-auto">
          <RotateCw className="size-5" aria-hidden="true" />
          <span>{copy.retryCta}</span>
        </Button>
      </CardContent>
    </Card>
  );
}

export function StudentDocumentsEmptyState({ copy }: StudentDocumentsStateProps) {
  return (
    <Card className="border-border bg-card/95 dark:border-border dark:bg-card/95">
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2">
          <FileSearch
            className="size-5 text-muted-foreground dark:text-muted-foreground"
            aria-hidden="true"
          />
          <CardTitle className="text-xl text-card-foreground dark:text-card-foreground">
            {copy.emptyTitle}
          </CardTitle>
        </div>

        <CardDescription className="text-sm text-muted-foreground dark:text-muted-foreground">
          {copy.emptyDescription}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
