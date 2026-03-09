'use client';

import { Clock } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { uiPrimitives } from '@/config/copy/primitives/ui';

type SessionTimeoutSheetProps = {
  open: boolean;
  remainingSeconds: number;
  onDismiss: () => void;
  onSignOut: () => void;
};

export function SessionTimeoutSheet({
  open,
  remainingSeconds,
  onDismiss,
  onSignOut,
}: SessionTimeoutSheetProps) {
  const copy = uiPrimitives.sessionTimeout;

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onDismiss()}>
      <SheetContent side="bottom" className="mx-auto max-w-md rounded-t-2xl">
        <SheetHeader className="text-left">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
            <Clock size={20} weight="duotone" className="text-warning" />
          </div>
          <SheetTitle>{copy.title}</SheetTitle>
          <p className="text-sm text-muted-foreground">
            {copy.body(remainingSeconds)}
          </p>
        </SheetHeader>
        <div className="mt-6 flex flex-col gap-2">
          <Button onClick={onDismiss} className="w-full min-h-11">
            {copy.dismiss}
          </Button>
          <Button
            variant="outline"
            className="w-full min-h-11"
            onClick={onSignOut}
          >
            {copy.signOut}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
