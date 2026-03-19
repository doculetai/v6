import { routes } from '@/config/routes';
const roles = {
  student: 'Student',
  sponsor: 'Sponsor',
  university: 'University',
  agent: 'Agent',
  partner: 'Partner',
} as const;

export const authCopy = {
  brandAlt: 'Doculet.ai logo',
  routes: {
    login: routes.auth.login,
    signup: routes.auth.signup,
    forgotPassword: routes.auth.forgotPassword,
    updatePassword: routes.auth.updatePassword,
  },
  common: {
    emailLabel: 'Email address',
    emailHint: 'name@yourorganisation.com',
    passwordLabel: 'Password',
    passwordHint: 'Minimum 8 characters',
    confirmPasswordLabel: 'Confirm password',
    confirmPasswordHint: 'Re-enter your password',
    roleLabel: 'Role',
    submittingText: 'Processing...',
  },
  validation: {
    invalidEmail: 'Enter a valid email address.',
    passwordMin: 'Password must be at least 8 characters.',
    passwordsDoNotMatch: 'Passwords do not match.',
    roleRequired: 'Select your role.',
  },
  login: {
    title: 'Welcome back',
    description: 'Sign in to continue your Doculet.ai journey.',
    trustLabel: 'Secure sign-in',
    submitLabel: 'Sign in',
    genericError: 'We could not sign you in. Check your details and try again.',
    heroTagline: 'Proof of funds for every student.',
    heroSub: '',
    links: {
      noAccount: "Don't have an account?",
      signup: 'Create one',
      forgotPassword: 'Forgot password?',
    },
  },
  signup: {
    title: 'Create your account',
    description: 'Start your secure funding journey in minutes.',
    trustLabel: 'Secure account setup',
    submitLabel: 'Create account',
    genericError: 'Account creation failed. Check your details and try again.',
    successTitle: 'Check your email',
    successDescription: 'We sent a confirmation link. Confirm your email to continue.',
    links: {
      hasAccount: 'Already have an account?',
      login: 'Sign in',
    },
  },
  forgotPassword: {
    title: 'Reset your password',
    description: 'Enter your email and we will send a secure reset link.',
    trustLabel: 'Account recovery',
    submitLabel: 'Send reset link',
    genericError: 'Reset link not sent. Check the email address and try again.',
    successTitle: 'Reset link sent',
    successDescription: (email: string) => `Reset link sent to ${email}.`,
    links: {
      backToLogin: 'Back to sign in',
    },
  },
  updatePassword: {
    title: 'Set a new password',
    description: 'Use a strong password with at least 8 characters.',
    trustLabel: 'Password security',
    submitLabel: 'Update password',
    genericError: 'Password not updated. Try again.',
  },
  magicLink: {
    buttonLabel: 'Send sign-in link',
    inputPlaceholder: 'Enter your email address',
    successMessage: 'Check your email — a sign-in link is on its way.',
    errorMessage: 'Could not send sign-in link. Check the email address and try again.',
  },
  complete: {
    heading: 'Completing sign-in',
    loadingText: 'Finishing sign-in...',
    returnToSignIn: 'Return to sign in',
  },
  error: {
    backToLogin: 'Back to sign in',
  },
  layoutTrust: ['Verified', 'Encrypted', 'Shareable'],
  orContinueWith: 'or',
  roleOptions: roles,
} as const;

export type AuthRoleKey = keyof typeof roles;
