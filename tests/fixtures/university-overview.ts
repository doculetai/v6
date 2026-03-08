import type { UniversityOverviewOutput } from '@/server/routers/university';

export const universityOverviewFixture: UniversityOverviewOutput = {
  totalPrograms: 8,
  enrolledStudents: 47,
  pendingApplications: 12,
  totalStudents: 47,
  certsIssued: 12,
  avgProofTargetKobo: 300000000,
  programs: [
    { id: 'prog-1', name: 'Computer Science BSc', enrolledCount: 14, certsIssued: 5, tuitionAmount: 300000000 },
    { id: 'prog-2', name: 'Medicine MBBS', enrolledCount: 8, certsIssued: 3, tuitionAmount: 500000000 },
    { id: 'prog-3', name: 'Law LLB', enrolledCount: 12, certsIssued: 2, tuitionAmount: 350000000 },
  ],
};

export const universityOverviewEmptyFixture: UniversityOverviewOutput = {
  totalPrograms: 0,
  enrolledStudents: 0,
  pendingApplications: 0,
  totalStudents: 0,
  certsIssued: 0,
  avgProofTargetKobo: 0,
  programs: [],
};
