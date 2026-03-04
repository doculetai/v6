import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { authCopy } from '@/config/copy/auth';
import { createTRPCContext } from '@/server/context';

import { ForgotPasswordPageClient } from './forgot-password-page-client';

export const metadata: Metadata = {
  title: authCopy.forgotPassword.title,
};

export default async function ForgotPasswordPage() {
  const ctx = await createTRPCContext();
  const userId = ctx.session?.user.id;

  if (userId) {
    const profile = await ctx.db.query.profiles.findFirst({
      where: (table, { eq }) => eq(table.userId, userId),
    });

    if (profile) {
      redirect(`/dashboard/${profile.role}`);
    }
  }

  return <ForgotPasswordPageClient />;
}
