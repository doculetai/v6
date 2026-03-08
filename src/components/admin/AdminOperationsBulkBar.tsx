import { CheckCircle, Info, X, XCircle } from '@/components/icons';

import { Button } from '@/components/ui/button';
import { adminCopy } from '@/config/copy/admin';

interface AdminOperationsBulkBarProps {
  count: number;
  onApprove: () => void;
  onReject: () => void;
  onRequestInfo: () => void;
  onClear: () => void;
  isLoading?: boolean;
}

export function AdminOperationsBulkBar({
  count,
  onApprove,
  onReject,
  onRequestInfo,
  onClear,
  isLoading = false,
}: AdminOperationsBulkBarProps) {
  const copy = adminCopy.operations.bulkBar;

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 mx-auto max-w-2xl px-4 lg:bottom-6">
      <div className="flex flex-col items-stretch gap-2 rounded-xl border border-border bg-card shadow-lg sm:flex-row sm:items-center sm:justify-between sm:gap-3 p-3">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
            {count}
          </span>
          <span className="text-sm font-medium text-foreground dark:text-foreground">
            {copy.selected}
          </span>
          <button
            type="button"
            onClick={onClear}
            aria-label={copy.clearSelection}
            className="ml-1 min-h-[44px] rounded-md p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X size={16} weight="duotone" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onRequestInfo}
            disabled={isLoading}
            className="min-h-11 flex-1 sm:flex-none"
          >
            <Info size={16} weight="duotone" className="mr-1.5" />
            {copy.requestInfo}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={onReject}
            disabled={isLoading}
            className="min-h-11 flex-1 sm:flex-none"
          >
            <XCircle size={16} weight="duotone" className="mr-1.5" />
            {copy.reject}
          </Button>
          <Button
            size="sm"
            onClick={onApprove}
            disabled={isLoading}
            className="min-h-11 flex-1 sm:flex-none"
          >
            <CheckCircle size={16} weight="duotone" className="mr-1.5" />
            {copy.approve}
          </Button>
        </div>
      </div>
    </div>
  );
}
