'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { DownloadSimple } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authPrimitives } from '@/config/copy/primitives/auth';
import { trpc } from '@/trpc/client';

const copy = authPrimitives.dataExport;

export function DataExportCard() {
  const [requested, setRequested] = useState(false);

  const mutation = trpc.account.requestDataExport.useMutation({
    onSuccess: () => {
      setRequested(true);
      toast.success(copy.success);
    },
    onError: () => {
      toast.error(copy.error);
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DownloadSimple weight="duotone" className="size-5 text-muted-foreground" aria-hidden="true" />
          {copy.title}
        </CardTitle>
        <CardDescription>{copy.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="outline"
          className="min-h-11"
          disabled={mutation.isPending || requested}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? copy.requesting : copy.button}
        </Button>
      </CardContent>
    </Card>
  );
}
