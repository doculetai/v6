'use client';

import { AlertTriangle, CheckCircle2, GraduationCap, MapPin } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { FilterBar } from '@/components/ui/filter-bar';
import { MoneyValue } from '@/components/ui/money-value';
import { studentCopy } from '@/config/copy/student';
import { cn } from '@/lib/utils';
import type { RouterOutputs } from '@/trpc/client';
import { trpc } from '@/trpc/client';

type ListSchoolsOutput = RouterOutputs['student']['listSchools'];
type StudentSchoolSelection = RouterOutputs['student']['getStudentSchoolSelection'];
type SchoolItem = ListSchoolsOutput[number];
type ProgramItem = SchoolItem['programs'][number];

type SchoolsPageClientProps = {
  initialSchools: ListSchoolsOutput;
  initialSelection: StudentSchoolSelection;
};

type FeedbackState =
  | {
      kind: 'success' | 'error';
      message: string;
    }
  | null;

const PREVIEW_PROGRAM_COUNT = 3;
const copy = studentCopy.schools;

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0] ?? '')
    .join('')
    .toUpperCase();
}

type ProgramRowProps = {
  program: ProgramItem;
  schoolId: string;
  isSelected: boolean;
  isPending: boolean;
  onApply: (schoolId: string, programId: string) => void;
};

function ProgramRow({ program, schoolId, isSelected, isPending, onApply }: ProgramRowProps) {
  return (
    <li
      className={cn(
        'flex flex-col gap-2 rounded-lg border p-3 transition-colors duration-150 sm:flex-row sm:items-center sm:justify-between',
        isSelected
          ? 'border-primary bg-primary/10 dark:border-primary dark:bg-primary/10'
          : 'border-border bg-background/50 dark:border-border dark:bg-background/30',
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground dark:text-foreground">
          {program.name}
        </p>
        <p className="text-xs text-muted-foreground dark:text-muted-foreground">
          {`${program.durationMonths} months`}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <MoneyValue amountMinor={program.tuitionAmount} display="compact" showCode />
        <Button
          type="button"
          size="sm"
          variant={isSelected ? 'default' : 'outline'}
          disabled={isPending}
          onClick={() => {
            onApply(schoolId, program.id);
          }}
          className="min-h-11 min-w-18 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-pressed={isSelected}
          aria-label={`${copy.card.apply} — ${program.name}`}
        >
          {isPending && isSelected ? (
            <span className="inline-block size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            copy.card.apply
          )}
        </Button>
      </div>
    </li>
  );
}

type SchoolCardProps = {
  school: SchoolItem;
  selectedProgramId: string | null;
  pendingProgramId: string | null;
  onApply: (schoolId: string, programId: string) => void;
};

function SchoolCard({ school, selectedProgramId, pendingProgramId, onApply }: SchoolCardProps) {
  const displayedPrograms = school.programs.slice(0, PREVIEW_PROGRAM_COUNT);
  const remainingCount = school.programs.length - PREVIEW_PROGRAM_COUNT;

  return (
    <Card className="flex h-full flex-col border-border bg-card/95 dark:border-border dark:bg-card/90">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary dark:bg-primary/20 dark:text-primary"
            aria-hidden="true"
          >
            {getInitials(school.name)}
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-base text-card-foreground dark:text-card-foreground">
              {school.name}
            </CardTitle>
            <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground dark:text-muted-foreground">
              <MapPin className="size-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{school.country}</span>
            </div>
          </div>
          <Badge variant="secondary" className="shrink-0 text-xs">
            {`${school.programs.length} ${school.programs.length === 1 ? 'program' : 'programs'}`}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3 pt-0">
        {displayedPrograms.length > 0 ? (
          <ul className="space-y-2" aria-label={`Programs at ${school.name}`}>
            {displayedPrograms.map((program) => (
              <ProgramRow
                key={program.id}
                program={program}
                schoolId={school.id}
                isSelected={selectedProgramId === program.id}
                isPending={pendingProgramId === program.id}
                onApply={onApply}
              />
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground dark:text-muted-foreground">
            No programs listed yet.
          </p>
        )}

        {remainingCount > 0 ? (
          <p className="text-xs text-muted-foreground dark:text-muted-foreground">
            {`+${remainingCount} more program${remainingCount === 1 ? '' : 's'}`}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function SchoolsPageClient({ initialSchools, initialSelection }: SchoolsPageClientProps) {
  const [search, setSearch] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(
    initialSelection.schoolId,
  );
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(
    initialSelection.programId,
  );
  const [pendingProgramId, setPendingProgramId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const utils = trpc.useUtils();

  const schoolsQuery = trpc.student.listSchools.useQuery(
    {},
    {
      initialData: initialSchools,
      refetchOnWindowFocus: false,
    },
  );

  const applyMutation = trpc.student.saveSchoolProgram.useMutation({
    onSuccess: async (_data, variables) => {
      setSelectedSchoolId(variables.schoolId);
      setSelectedProgramId(variables.programId);
      setPendingProgramId(null);
      setFeedback({
        kind: 'success',
        message: 'Program selected. Your funding target has been updated.',
      });
      await utils.student.getStudentSchoolSelection.invalidate();
      await utils.student.listSchools.invalidate();
    },
    onError: (error) => {
      setPendingProgramId(null);
      setFeedback({
        kind: 'error',
        message: error.message || 'Unable to select this program right now. Please try again.',
      });
    },
  });

  const filteredSchools = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return schoolsQuery.data;

    return schoolsQuery.data.filter(
      (school) =>
        school.name.toLowerCase().includes(term) || school.country.toLowerCase().includes(term),
    );
  }, [schoolsQuery.data, search]);

  const handleApply = (schoolId: string, programId: string) => {
    setFeedback(null);
    setPendingProgramId(programId);
    applyMutation.mutate({ schoolId, programId });
  };

  const handleClearSearch = () => {
    setSearch('');
  };

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6">
      <header className="space-y-2">
        <h2 className="text-3xl font-semibold text-foreground dark:text-foreground md:text-5xl">
          {copy.title}
        </h2>
        <p className="max-w-3xl text-sm text-muted-foreground dark:text-muted-foreground md:text-base">
          {copy.subtitle}
        </p>
      </header>

      <FilterBar
        query={search}
        queryPlaceholder={copy.searchHint}
        chips={[]}
        activeChip=""
        onQueryChange={setSearch}
      />

      {feedback ? (
        <div
          role="alert"
          aria-live="polite"
          className={cn(
            'flex items-start gap-2 rounded-xl border px-4 py-3',
            feedback.kind === 'error'
              ? 'border-destructive/30 bg-destructive/5 dark:border-destructive/40 dark:bg-destructive/10'
              : 'border-border bg-card/95 dark:border-border dark:bg-card/90',
          )}
        >
          {feedback.kind === 'error' ? (
            <AlertTriangle
              className="mt-0.5 size-5 shrink-0 text-destructive"
              aria-hidden="true"
            />
          ) : (
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
          )}
          <p
            className={cn(
              'text-sm',
              feedback.kind === 'error'
                ? 'text-destructive'
                : 'text-foreground dark:text-foreground',
            )}
          >
            {feedback.message}
          </p>
        </div>
      ) : null}

      {filteredSchools.length === 0 ? (
        <EmptyState
          heading={copy.empty.title}
          body={copy.empty.description}
          illustration={
            <GraduationCap className="size-16 text-muted-foreground/40" aria-hidden="true" />
          }
          action={
            search
              ? {
                  label: copy.empty.cta,
                  onClick: handleClearSearch,
                }
              : undefined
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSchools.map((school) => (
            <SchoolCard
              key={school.id}
              school={school}
              selectedProgramId={selectedSchoolId === school.id ? selectedProgramId : null}
              pendingProgramId={
                applyMutation.isPending && pendingProgramId
                  ? pendingProgramId
                  : null
              }
              onApply={handleApply}
            />
          ))}
        </div>
      )}
    </section>
  );
}
