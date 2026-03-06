import { z } from 'zod';

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  SUPABASE_DOCUMENTS_BUCKET: z.string().default('documents'),
  SENTRY_DSN: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  MONO_SECRET_KEY: z.string().optional(),
  DOJAH_APP_ID: z.string().optional(),
  DOJAH_PRIVATE_KEY: z.string().optional(),
  PAYSTACK_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: z.string().optional(),
  CERTIFICATE_SHARE_SECRET: z.string().min(16, 'CERTIFICATE_SHARE_SECRET must be at least 16 chars'),
});

function validateEnv(): z.infer<typeof serverEnvSchema> {
  const parsed = serverEnvSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_DOCUMENTS_BUCKET: process.env.SUPABASE_DOCUMENTS_BUCKET,
    SENTRY_DSN: process.env.SENTRY_DSN,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    MONO_SECRET_KEY: process.env.MONO_SECRET_KEY,
    DOJAH_APP_ID: process.env.DOJAH_APP_ID,
    DOJAH_PRIVATE_KEY: process.env.DOJAH_PRIVATE_KEY,
    PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
    NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
    CERTIFICATE_SHARE_SECRET: process.env.CERTIFICATE_SHARE_SECRET,
  });

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid environment variables:\n${issues}`);
  }

  return parsed.data;
}

export const env = validateEnv();
