import type { Metadata } from 'next';

import { authCopy } from '@/config/copy/auth';
import { redirectIfAuthenticated } from '@/lib/auth/redirect-if-authenticated';

import { LoginPageClient } from './login-page-client';

export const metadata: Metadata = {
  title: authCopy.login.title,
};

export default async function LoginPage() {
  await redirectIfAuthenticated();
  return <LoginPageClient />;
}
