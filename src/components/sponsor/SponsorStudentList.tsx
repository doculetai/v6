import { SponsorStudentCard, type SponsorStudentCardItem } from '@/components/sponsor/SponsorStudentCard';

type SponsorStudentListProps = {
  students: SponsorStudentCardItem[];
  removingSponsorshipId: string | null;
  onRemove: (sponsorshipId: string) => void;
};

export function SponsorStudentList({
  students,
  removingSponsorshipId,
  onRemove,
}: SponsorStudentListProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {students.map((student) => (
        <SponsorStudentCard
          key={student.sponsorshipId}
          student={student}
          isRemoving={removingSponsorshipId === student.sponsorshipId}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}
