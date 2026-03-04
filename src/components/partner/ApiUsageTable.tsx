import { partnerCopy } from '@/config/copy/partner';
import { EmptyState } from '@/components/ui/empty-state';

export function ApiUsageTable() {
  const copy = partnerCopy.dashboard.usage;

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-foreground">{copy.title}</h2>
      <EmptyState
        heading={copy.empty.title}
        body={copy.empty.description}
      />
    </div>
  );
}
