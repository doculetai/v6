import type { Metadata } from 'next';

import { authCopy } from '@/config/copy/auth';
import { redirectIfAuthenticated } from '@/lib/auth/redirect-if-authenticated';

import { SignupPageClient } from './signup-page-client';

export const metadata: Metadata = {
  title: authCopy.signup.title,
};

export default async function SignupPage() {
  await redirectIfAuthenticated();
  return (
    <>
      <h1 className="sr-only">{authCopy.signup.title}</h1>
      <SignupPageClient />
    </>
  );
}
