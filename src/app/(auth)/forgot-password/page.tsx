import type { Metadata } from 'next';

import { authCopy } from '@/config/copy/auth';
import { redirectIfAuthenticated } from '@/lib/auth/redirect-if-authenticated';

import { ForgotPasswordPageClient } from './forgot-password-page-client';

export const metadata: Metadata = {
  title: authCopy.forgotPassword.title,
  description: authCopy.forgotPassword.description,
  openGraph: {
    title: authCopy.forgotPassword.title,
    description: authCopy.forgotPassword.description,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: authCopy.forgotPassword.title,
    description: authCopy.forgotPassword.description,
  },
};

export default async function ForgotPasswordPage() {
  await redirectIfAuthenticated();
  return (
    <>
      <h1 className="sr-only">{authCopy.forgotPassword.title}</h1>
      <ForgotPasswordPageClient />
    </>
  );
}
