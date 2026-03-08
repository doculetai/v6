import type { UniversityOverviewOutput } from '@/server/routers/university';

export const universityOverviewFixture: UniversityOverviewOutput = {
  totalPrograms: 8,
  enrolledStudents: 47,
  pendingApplications: 12,
  totalStudents: 47,
};

export const universityOverviewEmptyFixture: UniversityOverviewOutput = {
  totalPrograms: 0,
  enrolledStudents: 0,
  pendingApplications: 0,
  totalStudents: 0,
};
