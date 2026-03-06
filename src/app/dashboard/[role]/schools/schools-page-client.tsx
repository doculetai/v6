'use client';

import { Warning, CheckCircle, GraduationCap, MapPin, Globe, Buildings } from '@phosphor-icons/react';
import { useMemo, useState } from 'react';

import { ActionSuccessBanner } from '@/components/ui/action-success-banner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Grid, PageShell, Stack } from '@/components/layout/content-primitives';
import { EmptyState } from '@/components/ui/empty-state';
import { MoneyValue } from '@/components/ui/money-value';
import { SearchAutosuggest } from '@/components/ui/search-autosuggest';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { studentCopy } from '@/config/copy/student';
import { primitivesCopy } from '@/config/copy/primitives';
import { US_STATES } from '@/config/us-states';
import { useDebounce } from '@/lib/hooks/use-debounce';
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

type CountryFilter = 'all' | 'United States' | 'Nigeria';

const PAGE_SIZE = 50;
const PREVIEW_PROGRAM_COUNT = 3;
const copy = studentCopy.schools;

const COUNTRY_FILTERS: { value: CountryFilter; label: string }[] = [
  { value: 'all', label: copy.filters.allCountries },
  { value: 'United States', label: copy.filters.unitedStates },
  { value: 'Nigeria', label: copy.filters.nigeria },
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0] ?? '')
    .join('')
    .toUpperCase();
}

function formatLocation(school: SchoolItem): string {
  const parts: string[] = [];
  if (school.city) parts.push(school.city);
  if (school.state) parts.push(school.state);
  if (parts.length > 0) return parts.join(', ');
  return school.country;
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
          ? 'border-primary bg-primary/10'
          : 'border-border bg-background/50 dark:bg-background/30',
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {program.name}
        </p>
        <p className="text-xs text-muted-foreground">
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
  const location = formatLocation(school);

  return (
    <Card className="flex h-full flex-col border-border bg-card/95 dark:bg-card/90">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary dark:bg-primary/20"
            aria-hidden="true"
          >
            {getInitials(school.name)}
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-base text-card-foreground">
              {school.name}
            </CardTitle>
            <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3 shrink-0" weight="duotone" aria-hidden="true" />
              <span className="truncate">{location}</span>
            </div>
          </div>
          {school.programs.length > 0 ? (
            <Badge variant="secondary" className="shrink-0 text-xs">
              {`${school.programs.length} ${school.programs.length === 1 ? 'program' : 'programs'}`}
            </Badge>
          ) : null}
        </div>

        {(school.accreditor || school.institutionType || school.websiteUrl) ? (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {school.institutionType ? (
              <Badge variant="outline" className="text-xs">
                <Buildings className="mr-1 size-3" weight="duotone" aria-hidden="true" />
                {copy.institutionTypes[school.institutionType as keyof typeof copy.institutionTypes] ?? school.institutionType}
              </Badge>
            ) : null}
            {school.accreditor ? (
              <Badge variant="outline" className="text-xs">
                <CheckCircle className="mr-1 size-3" weight="duotone" aria-hidden="true" />
                {school.accreditor}
              </Badge>
            ) : null}
            {school.websiteUrl ? (
              <a
                href={school.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none rounded"
              >
                <Globe className="size-3" weight="duotone" aria-hidden="true" />
                {copy.card.visitWebsite}
              </a>
            ) : null}
          </div>
        ) : null}
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
        ) : school.outOfStateTuition != null ? (
          <div className="rounded-lg border border-border bg-background/50 p-3 dark:bg-background/30">
            <p className="text-xs text-muted-foreground">{copy.card.estimatedTuition}</p>
            <p className="text-sm font-medium text-foreground font-mono">
              ${(school.outOfStateTuition / 100).toLocaleString('en-US')}
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            No programs listed yet.
          </p>
        )}

        {remainingCount > 0 ? (
          <p className="text-xs text-muted-foreground">
            {`+${remainingCount} more program${remainingCount === 1 ? '' : 's'}`}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function SchoolsPageClient({ initialSchools, initialSelection }: SchoolsPageClientProps) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 200);
  const [countryFilter, setCountryFilter] = useState<CountryFilter>('all');
  const [stateFilter, setStateFilter] = useState<string | undefined>(undefined);
  const [offset, setOffset] = useState(0);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(
    initialSelection.schoolId,
  );
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(
    initialSelection.programId,
  );
  const [pendingProgramId, setPendingProgramId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const utils = trpc.useUtils();

  const queryInput = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      country: countryFilter === 'all' ? undefined : countryFilter,
      state: stateFilter,
      limit: PAGE_SIZE,
      offset,
    }),
    [debouncedSearch, countryFilter, stateFilter, offset],
  );

  const schoolsQuery = trpc.student.listSchools.useQuery(queryInput, {
    initialData: offset === 0 && !debouncedSearch && countryFilter === 'all' && !stateFilter
      ? initialSchools
      : undefined,
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
  });

  const suggestions = useMemo(() => {
    if (!search || search.length < 2) return [];
    return (schoolsQuery.data ?? []).slice(0, 8).map((school) => ({
      id: school.id,
      label: school.name,
      detail: formatLocation(school),
    }));
  }, [schoolsQuery.data, search]);

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

  const handleApply = (schoolId: string, programId: string) => {
    setFeedback(null);
    setPendingProgramId(programId);
    applyMutation.mutate({ schoolId, programId });
  };

  const handleClearSearch = () => {
    setSearch('');
    setCountryFilter('all');
    setStateFilter(undefined);
    setOffset(0);
  };

  const handleCountryChange = (value: CountryFilter) => {
    setCountryFilter(value);
    setStateFilter(undefined);
    setOffset(0);
  };

  const handleStateChange = (value: string) => {
    setStateFilter(value === '__all__' ? undefined : value);
    setOffset(0);
  };

  const handleLoadMore = () => {
    setOffset((prev) => prev + PAGE_SIZE);
  };

  const schoolsData = schoolsQuery.data ?? [];
  const hasMore = schoolsData.length === PAGE_SIZE;

  return (
    <PageShell width="default">
      <Stack gap="md">
        <header className="space-y-2">
          <h2 className="text-3xl font-semibold text-foreground md:text-5xl">
            {copy.title}
          </h2>
          <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
            {copy.subtitle}
          </p>
        </header>

        <SearchAutosuggest
          query={search}
          onQueryChange={(v) => {
            setSearch(v);
            setOffset(0);
          }}
          suggestions={suggestions}
          isLoading={schoolsQuery.isFetching && search.length >= 2}
          placeholder={copy.searchHint}
          tabHint={primitivesCopy.searchAutosuggest.tabHint}
        />

        <div className="flex flex-wrap items-center gap-2">
          {COUNTRY_FILTERS.map((filter) => (
            <Button
              key={filter.value}
              type="button"
              size="sm"
              variant={countryFilter === filter.value ? 'default' : 'outline'}
              onClick={() => handleCountryChange(filter.value)}
              className="min-h-9 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {filter.label}
            </Button>
          ))}

          {countryFilter === 'United States' ? (
            <Select value={stateFilter ?? '__all__'} onValueChange={handleStateChange}>
              <SelectTrigger className="h-9 w-44">
                <SelectValue placeholder={copy.filters.statePlaceholder} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{copy.filters.statePlaceholder}</SelectItem>
                {US_STATES.map((s) => (
                  <SelectItem key={s.code} value={s.code}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
        </div>

        {feedback?.kind === 'success' ? (
          <ActionSuccessBanner
            message={feedback.message}
            nextAction={{
              label: studentCopy.nextSteps.postOnboarding.title,
              description: studentCopy.nextSteps.postOnboarding.body,
              cta: studentCopy.nextSteps.postOnboarding.cta,
              href: studentCopy.nextSteps.postOnboarding.href,
            }}
            onDismiss={() => setFeedback(null)}
          />
        ) : feedback?.kind === 'error' ? (
          <div
            role="alert"
            aria-live="polite"
            className="flex items-start gap-2 rounded-xl border px-4 py-3 border-destructive/30 bg-destructive/5 dark:border-destructive/40 dark:bg-destructive/10"
          >
            <Warning
              className="mt-0.5 size-5 shrink-0 text-destructive"
              weight="duotone"
              aria-hidden="true"
            />
            <p className="text-sm text-destructive">{feedback.message}</p>
          </div>
        ) : null}

        {schoolsData.length === 0 ? (
          <EmptyState
            heading={copy.empty.title}
            body={copy.empty.description}
            illustration={
              <GraduationCap className="size-16 text-muted-foreground/40" weight="duotone" aria-hidden="true" />
            }
            action={
              search || countryFilter !== 'all' || stateFilter
                ? {
                    label: copy.empty.cta,
                    onClick: handleClearSearch,
                  }
                : undefined
            }
          />
        ) : (
          <>
            <Grid cols={{ md: 2, lg: 3 }} gap="sm">
              {schoolsData.map((school) => (
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
            </Grid>

            {hasMore ? (
              <div className="flex justify-center pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={schoolsQuery.isFetching}
                  className="min-h-11 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {schoolsQuery.isFetching ? (
                    <span className="inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    copy.loadMore
                  )}
                </Button>
              </div>
            ) : null}
          </>
        )}
      </Stack>
    </PageShell>
  );
}
