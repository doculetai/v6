import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Settings } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';

export const metadata: Metadata = {
  title: 'Settings — Doculet',
};

type PageProps = { params: Promise<{ role: string }> };

const subtitles: Record<string, string> = {
  sponsor: 'Profile and preferences',
  university: 'Institution settings',
  admin: 'Platform configuration',
  agent: 'Profile settings',
  partner: 'Partner settings',
};

export default async function SettingsPage({ params }: PageProps) {
  const { role } = await params;

  if (!['sponsor', 'university', 'admin', 'agent', 'partner'].includes(role)) {
    notFound();
  }

  const subtitle = (subtitles as Record<string, string>)[role] ?? '';

  return (
    <section className="space-y-8">
      <PageHeader title="Settings" subtitle={subtitle} />
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card py-20 text-center">
        <Settings className="size-10 text-muted-foreground/40" aria-hidden="true" />
        <p className="text-sm font-medium text-foreground">This page is being built</p>
        <p className="max-w-xs text-xs text-muted-foreground">
          Full functionality for <strong>Settings</strong> is coming soon. Your navigation and layout are fully wired.
        </p>
      </div>
    </section>
  );
}
