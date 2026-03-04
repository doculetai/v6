import type { PipelineRow, PipelineStats } from "@/db/queries/university-pipeline"

export const pipelineRowsFixture: PipelineRow[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    studentId: "550e8400-e29b-41d4-a716-446655440002",
    studentEmail: "adaeze.okonkwo@gmail.com",
    program: "Master of Science in Computer Science",
    schoolName: "Massachusetts Institute of Technology",
    amountKobo: 25000000, // ₦250,000.00
    kycTier: 3,
    documentStatus: "pending",
    submittedAt: "2026-02-28T09:00:00.000Z",
    updatedAt: "2026-02-28T09:00:00.000Z",
    daysWaiting: 4,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    studentId: "550e8400-e29b-41d4-a716-446655440004",
    studentEmail: "chukwuemeka.eze@yahoo.com",
    program: "Master of Business Administration",
    schoolName: "Harvard Business School",
    amountKobo: 50000000, // ₦500,000.00
    kycTier: 2,
    documentStatus: "approved",
    submittedAt: "2026-02-20T10:30:00.000Z",
    updatedAt: "2026-02-22T14:00:00.000Z",
    daysWaiting: 2,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    studentId: "550e8400-e29b-41d4-a716-446655440006",
    studentEmail: "ngozi.ibrahim@outlook.com",
    program: "PhD in Biomedical Engineering",
    schoolName: "Johns Hopkins University",
    amountKobo: 32000000, // ₦320,000.00
    kycTier: 1,
    documentStatus: "rejected",
    submittedAt: "2026-02-15T08:00:00.000Z",
    updatedAt: "2026-02-17T11:00:00.000Z",
    daysWaiting: 0,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440007",
    studentId: "550e8400-e29b-41d4-a716-446655440008",
    studentEmail: "femi.adeyemi@gmail.com",
    program: "Master of Public Health",
    schoolName: "Columbia University",
    amountKobo: 18000000, // ₦180,000.00
    kycTier: 2,
    documentStatus: "more_info_requested",
    submittedAt: "2026-02-25T12:00:00.000Z",
    updatedAt: "2026-02-26T09:00:00.000Z",
    daysWaiting: 7,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440009",
    studentId: "550e8400-e29b-41d4-a716-446655440010",
    studentEmail: "blessing.nwosu@gmail.com",
    program: null,
    schoolName: null,
    amountKobo: 0,
    kycTier: null,
    documentStatus: "pending",
    submittedAt: "2026-03-01T07:00:00.000Z",
    updatedAt: "2026-03-01T07:00:00.000Z",
    daysWaiting: 3,
  },
]

export const pipelineStatsFixture: PipelineStats = {
  total: 5,
  pending: 2,
  approvedThisWeek: 1,
  avgDaysWaiting: 4,
}
