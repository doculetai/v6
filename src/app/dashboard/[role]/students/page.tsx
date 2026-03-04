import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { GraduationCap } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';

export const metadata: Metadata = {
  title: 'Students — Doculet',
};

type PageProps = { params: Promise<{ role: string }> };

const subtitles: Record<string, string> = {
  sponsor: 'Students you sponsor',
  university: 'Enrolled and admitted students',
  agent: 'Students you manage',
  partner: 'Students on your platform',
};

export default async function StudentsPage({ params }: PageProps) {
  const { role } = await params;

  if (!['sponsor', 'university', 'agent', 'partner'].includes(role)) {
    notFound();
  }

  const subtitle = (subtitles as Record<string, string>)[role] ?? '';

  return (
    <section className="space-y-8">
      <PageHeader title="Students" subtitle={subtitle} />
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card py-20 text-center">
        <GraduationCap className="size-10 text-muted-foreground/40" aria-hidden="true" />
        <p className="text-sm font-medium text-foreground">This page is being built</p>
        <p className="max-w-xs text-xs text-muted-foreground">
          Full functionality for <strong>Students</strong> is coming soon. Your navigation and layout are fully wired.
        </p>
      </div>
    </section>
  );
}
