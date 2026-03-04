'use client';

import { AlertTriangle, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { universityCopy } from '@/config/copy/university';

const copy = universityCopy.students.error;

interface StudentsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function StudentsError({ reset }: StudentsErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <AlertTriangle
        className="size-12 text-muted-foreground/50"
        aria-hidden="true"
      />
      <h2 className="mt-4 text-base font-semibold text-foreground">{copy.heading}</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{copy.body}</p>
      <Button
        variant="outline"
        size="sm"
        className="mt-4"
        onClick={reset}
      >
        <RotateCcw className="mr-2 size-4" aria-hidden="true" />
        {copy.retryLabel}
      </Button>
    </div>
  );
}
