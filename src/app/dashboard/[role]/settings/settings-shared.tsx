'use client';

import { useState } from 'react';
import { CheckCircle } from '@/components/icons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { primitivesCopy } from '@/config/copy/primitives';

export function FormErrorBanner({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive dark:border-destructive/40 dark:bg-destructive/15"
    >
      {message}
    </p>
  );
}

export function FormSuccessBanner({ message }: { message: string }) {
  return (
    <p
      role="status"
      className="flex items-center gap-1.5 rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground"
    >
      <CheckCircle weight="duotone" className="size-4 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

// ── Account deletion card ─────────────────────────────────────────────────────

const deletionCopy = primitivesCopy.accountDeletion;

export function AccountDeletionCard() {
  const [confirmValue, setConfirmValue] = useState('');
  const isConfirmed = confirmValue === 'DELETE';

  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-destructive">
          {deletionCopy.dialogTitle}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {deletionCopy.dialogBody}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="min-h-9">
              {deletionCopy.button}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{deletionCopy.dialogTitle}</AlertDialogTitle>
              <AlertDialogDescription>{deletionCopy.dialogBody}</AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-1.5 py-2">
              <p className="text-sm text-muted-foreground">{deletionCopy.typeToConfirm}</p>
              <Input
                value={confirmValue}
                onChange={(e) => setConfirmValue(e.target.value)}
                placeholder={deletionCopy.confirmPlaceholder}
                className="font-mono"
                autoComplete="off"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setConfirmValue('')}>
                {deletionCopy.cancel}
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={!isConfirmed}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
              >
                {deletionCopy.confirm}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
