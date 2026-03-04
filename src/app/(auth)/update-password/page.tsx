import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { authCopy } from '@/config/copy/auth';
import { createTRPCContext } from '@/server/context';

import { UpdatePasswordPageClient } from './update-password-page-client';

export const metadata: Metadata = {
  title: authCopy.updatePassword.title,
};

export default async function UpdatePasswordPage() {
  const ctx = await createTRPCContext();

  if (!ctx.session?.user) {
    redirect(authCopy.routes.login);
  }

  return <UpdatePasswordPageClient />;
}
