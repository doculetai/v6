import * as React from 'react';

import { cn } from '@/lib/utils';

interface StatGridProps extends React.ComponentPropsWithoutRef<'div'> {
  /** Number of columns at md breakpoint. Default 4. */
  columns?: 2 | 3 | 4;
}

const colMap: Record<number, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-4',
};

function StatGrid({ columns = 4, className, children, ...props }: StatGridProps) {
  return (
    <div className={cn('grid gap-4', colMap[columns], className)} {...props}>
      {children}
    </div>
  );
}

export { StatGrid };
export type { StatGridProps };
