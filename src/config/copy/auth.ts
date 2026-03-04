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
    login: '/login',
    signup: '/signup',
    forgotPassword: '/forgot-password',
    updatePassword: '/update-password',
  },
  common: {
    emailLabel: 'Email address',
    emailPlaceholder: 'name@yourorganisation.com',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Your secure password',
    confirmPasswordLabel: 'Confirm password',
    confirmPasswordPlaceholder: 'Type your password again',
    roleLabel: 'Role',
    submittingText: 'Please wait...',
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
    genericError: 'We could not create your account. Please try again.',
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
    genericError: 'We could not send a reset link. Please try again.',
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
    genericError: 'We could not update your password. Please try again.',
  },
  roleOptions: roles,
} as const;

export type AuthRoleKey = keyof typeof roles;
