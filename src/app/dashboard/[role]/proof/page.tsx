import { TRPCError } from '@trpc/server';
import type { inferRouterOutputs } from '@trpc/server';
import { notFound, redirect } from 'next/navigation';

import { studentCopy } from '@/config/copy/student';
import type { AppRouter } from '@/server/root';
import { api } from '@/trpc/server';

import { ProofPageClient } from './proof-page-client';

type DashboardProofPageProps = {
  params: Promise<{ role: string }>;
};

type StudentProofData = inferRouterOutputs<AppRouter>['student']['getProofCertificate'];

export default async function DashboardProofPage({ params }: DashboardProofPageProps) {
  const { role } = await params;

  if (role !== 'student') {
    notFound();
  }

  const caller = await api();
  let initialData: StudentProofData;

  try {
    initialData = await caller.student.getProofCertificate();
  } catch (error) {
    if (error instanceof TRPCError && error.code === 'UNAUTHORIZED') {
      redirect('/login');
    }

    throw new Error(studentCopy.proof.states.errorTitle);
  }

  async function generateProofShareLinkAction() {
    'use server';

    const actionCaller = await api();
    return actionCaller.student.generateProofShareLink();
  }

  return (
    <>
      <h1 className="sr-only">{studentCopy.proof.title}</h1>
      <ProofPageClient
        initialData={initialData}
        generateProofShareLinkAction={generateProofShareLinkAction}
      />
    </>
  );
}
