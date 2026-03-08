'use client';

import { useState, useCallback } from 'react';
import { EnvelopeSimple, GraduationCap } from '@/components/icons';

import { EmptyState } from '@/components/ui/empty-state';
import { universityCopy } from '@/config/copy/university';
import { cn } from '@/lib/utils';

type QueueItem = {
  studentId: string;
  studentEmail: string | null;
  programName: string | null;
  documentCount: number;
  pendingDocumentCount: number;
  kycStatus: 'not_started' | 'pending' | 'verified' | 'failed';
  createdAt: Date;
};

// ── Kanban column state ───────────────────────────────────────────────────────

type KanbanStatus = 'applied' | 'docs_submitted' | 'verified' | 'offer_issued' | 'enrolled';

type KanbanItem = QueueItem & { kanbanStatus: KanbanStatus };

function deriveKanbanStatus(item: QueueItem): KanbanStatus {
  if (item.kycStatus === 'verified') return 'verified';
  if (item.documentCount > 0 && item.pendingDocumentCount === 0) return 'docs_submitted';
  return 'applied';
}

const copy = universityCopy.pipeline;
const kanbanCopy = copy.kanban;

const COLUMNS: { key: KanbanStatus; label: string; draggable: boolean }[] = [
  { key: 'applied', label: kanbanCopy.columns.applied, draggable: false },
  { key: 'docs_submitted', label: kanbanCopy.columns.docsSubmitted, draggable: false },
  { key: 'verified', label: kanbanCopy.columns.verified, draggable: false },
  { key: 'offer_issued', label: kanbanCopy.columns.offerIssued, draggable: true },
  { key: 'enrolled', label: kanbanCopy.columns.enrolled, draggable: true },
];

// ── Kanban card ───────────────────────────────────────────────────────────────

const kycBadgeClass: Record<QueueItem['kycStatus'], string> = {
  verified: 'bg-primary/10 text-primary',
  pending: 'bg-warning/10 text-warning',
  failed: 'bg-destructive/10 text-destructive',
  not_started: 'bg-muted text-muted-foreground',
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function KanbanCard({
  item,
  draggable,
  onDragStart,
}: {
  item: KanbanItem;
  draggable: boolean;
  onDragStart: (studentId: string) => void;
}) {
  return (
    <div
      draggable={draggable}
      onDragStart={draggable ? () => onDragStart(item.studentId) : undefined}
      className={cn(
        'rounded-lg border border-border bg-card p-3 space-y-2 text-sm',
        draggable && 'cursor-grab active:cursor-grabbing',
      )}
      aria-label={item.studentEmail ?? 'Student card'}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <EnvelopeSimple className="size-3.5 shrink-0 text-muted-foreground" weight="duotone" aria-hidden="true" />
        <p className="truncate font-medium text-foreground text-xs">
          {item.studentEmail ?? '\u2014'}
        </p>
      </div>

      {item.programName ? (
        <div className="flex items-center gap-1.5 min-w-0">
          <GraduationCap className="size-3.5 shrink-0 text-muted-foreground" weight="duotone" aria-hidden="true" />
          <p className="truncate text-xs text-muted-foreground">{item.programName}</p>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            'inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium',
            kycBadgeClass[item.kycStatus],
          )}
        >
          {copy.kycLabels[item.kycStatus]}
        </span>
        <span className="text-[10px] text-muted-foreground">{formatDate(item.createdAt)}</span>
      </div>
    </div>
  );
}

// ── Kanban column ─────────────────────────────────────────────────────────────

function KanbanColumn({
  column,
  items,
  onDragStart,
  onDrop,
}: {
  column: (typeof COLUMNS)[number];
  items: KanbanItem[];
  onDragStart: (studentId: string) => void;
  onDrop: (targetStatus: KanbanStatus) => void;
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    if (!column.draggable) return;
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleDrop = (e: React.DragEvent) => {
    if (!column.draggable) return;
    e.preventDefault();
    setIsDragOver(false);
    onDrop(column.key);
  };

  return (
    <div
      className={cn(
        'flex min-w-[200px] max-w-[240px] shrink-0 flex-col rounded-xl border border-border bg-muted/30 p-2 transition-colors',
        isDragOver && 'border-primary/40 bg-primary/5',
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      aria-label={`${column.label} column`}
    >
      <div className="mb-2 flex items-center justify-between px-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {column.label}
        </p>
        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
          {items.length}
        </span>
      </div>

      {column.draggable && items.length === 0 ? (
        <div
          className={cn(
            'flex min-h-[64px] flex-1 items-center justify-center rounded-lg border-2 border-dashed border-border',
            isDragOver && 'border-primary/40',
          )}
        >
          <p className="text-[10px] text-muted-foreground">{kanbanCopy.dragHint}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <KanbanCard
              key={item.studentId}
              item={item}
              draggable={column.draggable}
              onDragStart={onDragStart}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

type Props = {
  queue: QueueItem[];
};

export function PipelinePageClient({ queue }: Props) {
  const [items, setItems] = useState<KanbanItem[]>(() =>
    queue.map((item) => ({ ...item, kanbanStatus: deriveKanbanStatus(item) })),
  );
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const handleDragStart = useCallback((studentId: string) => {
    setDraggingId(studentId);
  }, []);

  const handleDrop = useCallback(
    (targetStatus: KanbanStatus) => {
      if (!draggingId) return;
      setItems((prev) =>
        prev.map((item) =>
          item.studentId === draggingId ? { ...item, kanbanStatus: targetStatus } : item,
        ),
      );
      setDraggingId(null);
    },
    [draggingId],
  );

  if (queue.length === 0) {
    return (
      <EmptyState
        heading={copy.empty.title}
        body={copy.empty.description}
      />
    );
  }

  return (
    <div className="space-y-3">
      {/* Enrolled note */}
      <p className="text-xs text-muted-foreground">{kanbanCopy.enrolledNote}</p>

      {/* Kanban board */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.key}
              column={column}
              items={items.filter((item) => item.kanbanStatus === column.key)}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
