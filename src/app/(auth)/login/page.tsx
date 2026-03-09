import type { Metadata } from 'next';

import { authCopy } from '@/config/copy/auth';
import { redirectIfAuthenticated } from '@/lib/auth/redirect-if-authenticated';

import { LoginPageClient } from './login-page-client';

export const metadata: Metadata = {
  title: authCopy.login.title,
  description: authCopy.login.description,
  openGraph: {
    title: authCopy.login.title,
    description: authCopy.login.description,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: authCopy.login.title,
    description: authCopy.login.description,
  },
};

export default async function LoginPage() {
  await redirectIfAuthenticated();
  return (
    <>
      <h1 className="sr-only">{authCopy.login.title}</h1>
      <LoginPageClient />
    </>
  );
}
