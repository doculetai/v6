import { TRPCError } from '@trpc/server';
import type { inferRouterOutputs } from '@trpc/server';
import { notFound, redirect } from 'next/navigation';

import type { AppRouter } from '@/server/root';
import { api } from '@/trpc/server';
import { TRPCReactProvider } from '@/trpc/client';

import { VerifyPageClient } from './verify-page-client';

type VerifyRolePageProps = {
  params: Promise<{ role: string }>;
};

type RouterOutput = inferRouterOutputs<AppRouter>;
type VerificationStatusOutput = RouterOutput['student']['getVerificationStatus'];

export default async function VerifyRolePage({ params }: VerifyRolePageProps) {
  const { role } = await params;

  if (role !== 'student') {
    notFound();
  }

  let initialData: VerificationStatusOutput;

  try {
    const caller = await api();
    initialData = await caller.student.getVerificationStatus();
  } catch (error) {
    if (error instanceof TRPCError && error.code === 'UNAUTHORIZED') {
      redirect('/login');
    }

    if (error instanceof TRPCError && error.code === 'FORBIDDEN') {
      notFound();
    }

    throw error;
  }

  return (
    <TRPCReactProvider>
      <VerifyPageClient initialData={initialData} />
    </TRPCReactProvider>
  );
}
