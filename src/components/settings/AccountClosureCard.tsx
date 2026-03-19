'use client';

import { Trash } from '@/components/icons';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  AlertDialog,
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
import { authPrimitives } from '@/config/copy/primitives';
import { supabaseBrowserClient } from '@/lib/auth/browser-client';
import { trpc } from '@/trpc/client';
import { routes } from '@/config/routes';

const copy = authPrimitives.accountClosure;

export function AccountClosureCard() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const deactivate = trpc.account.deactivateAccount.useMutation({
    onSuccess: async () => {
      toast.success(copy.success);
      setOpen(false);
      await supabaseBrowserClient.auth.signOut();
      router.push(routes.auth.login);
      router.refresh();
    },
    onError: () => {
      toast.error(copy.error);
    },
  });

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trash weight="duotone" className="size-5 text-destructive" aria-hidden />
          {copy.title}
        </CardTitle>
        <CardDescription>{copy.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">{copy.button}</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{copy.confirmTitle}</AlertDialogTitle>
              <AlertDialogDescription>{copy.confirmBody}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deactivate.isPending}>
                {copy.cancel}
              </AlertDialogCancel>
              <Button
                variant="destructive"
                onClick={() => deactivate.mutate()}
                disabled={deactivate.isPending}
              >
                {deactivate.isPending ? '…' : copy.confirmButton}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
