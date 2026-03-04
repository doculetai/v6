import { TRPCError } from '@trpc/server';
import { AlertTriangle, Lock } from 'lucide-react';
import { notFound, redirect } from 'next/navigation';

import { PageHeader } from '@/components/ui/page-header';
import { SurfacePanel } from '@/components/ui/surface-panel';
import { universityCopy } from '@/config/copy/university';
import { isDashboardRole } from '@/config/roles';
import { api } from '@/trpc/server';

import { SettingsPageClient } from './settings-page-client';

export const metadata = {
  title: 'Settings — Doculet',
};

type PageProps = {
  params: Promise<{ role: string }>;
};

type FetchError = 'forbidden' | 'generic';

function ErrorCard({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ElementType;
  title: string;
  body: string;
}) {
  return (
    <section className="mx-auto w-full max-w-2xl space-y-4">
      <PageHeader
        title={universityCopy.settings.title}
        subtitle={universityCopy.settings.subtitle}
      />
      <SurfacePanel variant="default" density="comfortable">
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <Icon size={32} className="text-muted-foreground" aria-hidden="true" />
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{body}</p>
        </div>
      </SurfacePanel>
    </section>
  );
}

export default async function SettingsPage({ params }: PageProps) {
  const { role } = await params;

  if (!isDashboardRole(role) || role !== 'university') {
    notFound();
  }

  const copy = universityCopy.settings;

  // Fetch data only inside try — JSX is rendered outside
  let settings: Awaited<ReturnType<ReturnType<typeof api>['university']['getSettings']>> | null =
    null;
  let fetchError: FetchError | null = null;

  try {
    const caller = await api();
    settings = await caller.university.getSettings();
  } catch (error) {
    if (error instanceof TRPCError && error.code === 'UNAUTHORIZED') {
      redirect('/login');
    }
    fetchError =
      error instanceof TRPCError && error.code === 'FORBIDDEN' ? 'forbidden' : 'generic';
  }

  if (fetchError === 'forbidden') {
    return (
      <ErrorCard
        icon={Lock}
        title={copy.errors.forbidden}
        body="Sign in with a university account to access this page."
      />
    );
  }

  if (fetchError === 'generic' || !settings) {
    return (
      <ErrorCard
        icon={AlertTriangle}
        title={copy.errors.generic}
        body="Please refresh the page. If the problem persists, contact support."
      />
    );
  }

  return (
    <section className="mx-auto w-full max-w-2xl">
      <SettingsPageClient profile={settings.profile} session={settings.session} />
    </section>
  );
}
