/**
 * E2E test personas — credentials from env for seeded users.
 * Used by auth setup and seed script. Never commit real credentials.
 */

const required = (key: string): string => {
  const v = process.env[key];
  if (!v) {
    throw new Error(
      `E2E: Missing env ${key}. Set it in .env.local for E2E runs. ` +
        `Example: ${key}=e2e-student@test.doculet.ai`,
    );
  }
  return v;
};

const optional = (key: string, fallback: string): string => process.env[key] ?? fallback;

/** Lazy so setup-only env isn't required for unauthenticated specs (auth, certificate). */
export const e2ePersonas = {
  get student() {
    return {
      email: required('E2E_STUDENT_EMAIL'),
      password: required('E2E_STUDENT_PASSWORD'),
    } as const;
  },
  /** Optional — required for disbursement.spec.ts. Set E2E_SPONSOR_EMAIL, E2E_SPONSOR_PASSWORD. */
  get sponsor() {
    const email = process.env.E2E_SPONSOR_EMAIL;
    const password = process.env.E2E_SPONSOR_PASSWORD;
    if (!email || !password) {
      throw new Error('E2E: Missing E2E_SPONSOR_EMAIL or E2E_SPONSOR_PASSWORD for sponsor auth.');
    }
    return { email, password } as const;
  },
  get hasSponsor() {
    return Boolean(process.env.E2E_SPONSOR_EMAIL && process.env.E2E_SPONSOR_PASSWORD);
  },
  /** Optional — required for university doc review E2E. Set E2E_UNIVERSITY_EMAIL, E2E_UNIVERSITY_PASSWORD. */
  get university() {
    const email = process.env.E2E_UNIVERSITY_EMAIL;
    const password = process.env.E2E_UNIVERSITY_PASSWORD;
    if (!email || !password) {
      throw new Error('E2E: Missing E2E_UNIVERSITY_EMAIL or E2E_UNIVERSITY_PASSWORD for university auth.');
    }
    return { email, password } as const;
  },
  get hasUniversity() {
    return Boolean(process.env.E2E_UNIVERSITY_EMAIL && process.env.E2E_UNIVERSITY_PASSWORD);
  },
  /** Required for admin ledger/platform-fee E2E. */
  get admin() {
    const email = process.env.E2E_ADMIN_EMAIL;
    const password = process.env.E2E_ADMIN_PASSWORD;
    if (!email || !password) {
      throw new Error('E2E: Missing E2E_ADMIN_EMAIL or E2E_ADMIN_PASSWORD for admin auth.');
    }
    return { email, password } as const;
  },
  get hasAdmin() {
    return Boolean(process.env.E2E_ADMIN_EMAIL && process.env.E2E_ADMIN_PASSWORD);
  },
  get agent() {
    const email = process.env.E2E_AGENT_EMAIL;
    const password = process.env.E2E_AGENT_PASSWORD;
    if (!email || !password) {
      throw new Error('E2E: Missing E2E_AGENT_EMAIL or E2E_AGENT_PASSWORD for agent auth.');
    }
    return { email, password } as const;
  },
  get hasAgent() {
    return Boolean(process.env.E2E_AGENT_EMAIL && process.env.E2E_AGENT_PASSWORD);
  },
  get partner() {
    const email = process.env.E2E_PARTNER_EMAIL;
    const password = process.env.E2E_PARTNER_PASSWORD;
    if (!email || !password) {
      throw new Error('E2E: Missing E2E_PARTNER_EMAIL or E2E_PARTNER_PASSWORD for partner auth.');
    }
    return { email, password } as const;
  },
  get hasPartner() {
    return Boolean(process.env.E2E_PARTNER_EMAIL && process.env.E2E_PARTNER_PASSWORD);
  },
};

export const e2eConfig = {
  baseUrl: optional('PLAYWRIGHT_BASE_URL', 'http://localhost:3000'),
  seedOnSetup: process.env.E2E_SEED_ON_SETUP !== 'false',
} as const;
