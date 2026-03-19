'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { studentCopy } from '@/config/copy/student';

type NavGuardSheetProps = {
  open: boolean;
  onStay: () => void;
  onLeave: () => void;
};

export function NavGuardSheet({ open, onStay, onLeave }: NavGuardSheetProps) {
  const copy = studentCopy.navGuard;

  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) onStay(); }}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader className="pb-4">
          <SheetTitle>{copy.title}</SheetTitle>
          <SheetDescription>{copy.body}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-3 pb-6 sm:flex-row-reverse">
          <Button
            type="button"
            className="min-h-11 w-full sm:w-auto"
            onClick={onStay}
          >
            {copy.stay}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="min-h-11 w-full sm:w-auto"
            onClick={onLeave}
          >
            {copy.leave}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
