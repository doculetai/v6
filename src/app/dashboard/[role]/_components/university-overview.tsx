import {
  Buildings,
  Files,
  GraduationCap,
  Medal,
} from '@phosphor-icons/react/dist/ssr';

import {
  Grid,
  PageHeader,
  PageShell,
  Section,
  Stack,
} from '@/components/layout/content-primitives';
import { universityCopy } from '@/config/copy/university';
import { api } from '@/trpc/server';

import { StatCard } from './overview-shared';

type UniversityOverviewProps = {
  caller: Awaited<ReturnType<typeof api>>;
};

export async function UniversityOverview({ caller }: UniversityOverviewProps) {
  const copy = universityCopy.overview;

  const [overview, programsList, studentsWithCert] = await Promise.all([
    caller.university.getOverview().catch(() => null),
    caller.university.listUniversityPrograms().catch(() => [] as Awaited<ReturnType<typeof caller.university.listUniversityPrograms>>),
    caller.university.listUniversityStudentsWithCert({ programId: undefined }).catch(() => [] as Awaited<ReturnType<typeof caller.university.listUniversityStudentsWithCert>>),
  ]);

  const activePrograms = programsList.filter((p) => p.status === 'active');
  const totalStudents = overview?.totalStudents ?? 0;
  const docsPending = overview?.pendingCount ?? 0;
  const certsIssued = studentsWithCert.filter((s) => s.certificateId !== null).length;

  // Build a per-program cert count map from studentsWithCert
  const certCountByProgram = new Map<string, number>();
  for (const s of studentsWithCert) {
    if (s.programId && s.certificateId !== null) {
      certCountByProgram.set(s.programId, (certCountByProgram.get(s.programId) ?? 0) + 1);
    }
  }

  return (
    <PageShell width="wide">
      <Section>
        <Stack gap="md">
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
              {copy.eyebrow}
            </p>
            <PageHeader title={copy.title} />
          </div>

          <Grid cols={{ sm: 2, lg: 4 }} gap="md">
            <StatCard
              icon={<Buildings size={20} weight="duotone" aria-hidden="true" />}
              label={copy.stats.programs.label}
              value={String(activePrograms.length)}
              sub={copy.stats.programs.sub}
              accent={activePrograms.length > 0}
            />
            <StatCard
              icon={<GraduationCap size={20} weight="duotone" aria-hidden="true" />}
              label={copy.stats.students.label}
              value={String(totalStudents)}
              sub={copy.stats.students.sub}
              accent={totalStudents > 0}
            />
            <StatCard
              icon={<Medal size={20} weight="duotone" aria-hidden="true" />}
              label={copy.stats.certsIssued.label}
              value={String(certsIssued)}
              sub={copy.stats.certsIssued.sub}
              accent={certsIssued > 0}
            />
            <StatCard
              icon={<Files size={20} weight="duotone" aria-hidden="true" />}
              label={copy.stats.docsPending.label}
              value={String(docsPending)}
              sub={copy.stats.docsPending.sub}
              accent={docsPending > 0}
            />
          </Grid>

          <div className="rounded-xl border border-border bg-card px-5 py-5 shadow-xs">
            <p className="pb-3 text-[10.5px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
              {copy.activePrograms.heading}
            </p>
            {activePrograms.length > 0 ? (
              <div className="flex flex-col divide-y divide-border/50">
                {activePrograms.slice(0, 6).map((prog) => {
                  const programCerts = certCountByProgram.get(prog.id) ?? 0;
                  // Progress = certs issued / enrolled students (completion rate)
                  const pct =
                    prog.studentCount > 0
                      ? Math.min(100, Math.round((programCerts / prog.studentCount) * 100))
                      : 0;
                  return (
                    <div key={prog.id} className="py-3">
                      <div className="flex items-center justify-between pb-1.5">
                        <span className="text-sm font-medium text-foreground">
                          {prog.name}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {prog.studentCount} students &middot; {programCerts} certs
                        </span>
                      </div>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-border">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${pct}%` }}
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">
                {copy.activePrograms.empty}
              </p>
            )}
          </div>
        </Stack>
      </Section>
    </PageShell>
  );
}
