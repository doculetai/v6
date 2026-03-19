'use client';

import { forwardRef, useState } from 'react';
import { Eye, EyeSlash } from '@/components/icons';

import { Input } from '@/components/ui/input';
import { primitivesCopy } from '@/config/copy/primitives';
import { cn } from '@/lib/utils';

export interface PasswordInputProps
  extends Omit<React.ComponentProps<typeof Input>, 'type'> {}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={visible ? 'text' : 'password'}
          className={cn('pr-12', className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className={cn(
            'absolute right-1 top-1/2 -translate-y-1/2 inline-flex items-center justify-center',
            'size-9 rounded-md text-muted-foreground hover:text-foreground',
            'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          )}
          aria-label={visible ? primitivesCopy.aria.hidePassword : primitivesCopy.aria.showPassword}
          aria-pressed={visible}
        >
          {visible ? <EyeSlash weight="duotone" className="size-4" /> : <Eye weight="duotone" className="size-4" />}
        </button>
      </div>
    );
  },
);

PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
