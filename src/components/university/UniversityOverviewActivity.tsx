import type { ActivityTimelineItem, ActivityTone } from '@/components/ui/activity-timeline';
import { ActivityTimeline } from '@/components/ui/activity-timeline';
import { universityCopy } from '@/config/copy/university';

type DocumentStatus = 'pending' | 'approved' | 'rejected' | 'more_info_requested';

interface RecentDocumentItem {
  id: string;
  status: DocumentStatus;
  type: string;
  createdAt: string;
}

interface UniversityOverviewActivityProps {
  items: RecentDocumentItem[];
}

const toneMap: Record<DocumentStatus, ActivityTone> = {
  pending: 'neutral',
  approved: 'success',
  rejected: 'error',
  more_info_requested: 'warning',
};

const copy = universityCopy.overview.activity;

function toTimelineItem(doc: RecentDocumentItem): ActivityTimelineItem {
  return {
    id: doc.id,
    title: copy.eventTitles[doc.status] ?? doc.status,
    description: copy.documentTypes[doc.type] ?? doc.type,
    timestamp: doc.createdAt,
    tone: toneMap[doc.status],
  };
}

export function UniversityOverviewActivity({ items }: UniversityOverviewActivityProps) {
  return (
    <section aria-labelledby="activity-heading">
      <h2
        id="activity-heading"
        className="mb-4 text-sm font-semibold text-foreground"
      >
        {copy.sectionTitle}
      </h2>
      <ActivityTimeline
        items={items.map(toTimelineItem)}
        emptyLabel={copy.emptyLabel}
      />
    </section>
  );
}
