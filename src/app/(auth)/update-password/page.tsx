import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { authCopy } from '@/config/copy/auth';
import { createTRPCContext } from '@/server/context';

import { UpdatePasswordPageClient } from './update-password-page-client';

export const metadata: Metadata = {
  title: authCopy.updatePassword.title,
  description: authCopy.updatePassword.description,
  openGraph: {
    title: authCopy.updatePassword.title,
    description: authCopy.updatePassword.description,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: authCopy.updatePassword.title,
    description: authCopy.updatePassword.description,
  },
};

export default async function UpdatePasswordPage() {
  const ctx = await createTRPCContext();

  if (!ctx.session?.user) {
    redirect(authCopy.routes.login);
  }

  return (
    <>
      <h1 className="sr-only">{authCopy.updatePassword.title}</h1>
      <UpdatePasswordPageClient />
    </>
  );
}
