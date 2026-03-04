'use client';

import { AlertTriangle } from 'lucide-react';

import { partnerCopy } from '@/config/copy/partner';

const { error } = partnerCopy.students;

export default function StudentsError() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <AlertTriangle className="size-10 text-muted-foreground" aria-hidden="true" />
      <div className="space-y-1">
        <p className="text-base font-medium text-foreground">{error.title}</p>
        <p className="text-sm text-muted-foreground">{error.description}</p>
      </div>
    </div>
  );
}
