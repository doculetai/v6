/**
 * E2E seed script — creates Supabase Auth users + Drizzle data for E2E tests.
 * Idempotent: safe to run multiple times.
 *
 * Requires: DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *           E2E_STUDENT_EMAIL, E2E_STUDENT_PASSWORD
 *
 * Run: npx tsx scripts/seed-e2e.ts
 */

import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { createClient } from '@supabase/supabase-js';
import { eq } from 'drizzle-orm';

config({ path: '.env.local' });
config({ path: '.env' });

import * as schema from '../src/db/schema';
import { users, profiles, studentProfiles, schools, programs } from '../src/db/schema';

const DATABASE_URL = process.env.DATABASE_URL;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const E2E_STUDENT_EMAIL = process.env.E2E_STUDENT_EMAIL;
const E2E_STUDENT_PASSWORD = process.env.E2E_STUDENT_PASSWORD;

if (!DATABASE_URL || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

if (!E2E_STUDENT_EMAIL || !E2E_STUDENT_PASSWORD) {
  console.error('Missing E2E_STUDENT_EMAIL or E2E_STUDENT_PASSWORD. Set in .env.local');
  process.exit(1);
}

const db = drizzle(postgres(DATABASE_URL, { prepare: false }), { schema });
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function ensureSupabaseUser(email: string, password: string): Promise<string> {
  const { data: existing } = await supabaseAdmin.auth.admin.listUsers();
  const found = existing?.users?.find((u) => u.email === email);
  if (found) {
    return found.id;
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    throw new Error(`Supabase create user failed: ${error.message}`);
  }
  if (!data.user) {
    throw new Error('Supabase create user returned no user');
  }
  return data.user.id;
}

async function seedSchoolsAndPrograms(): Promise<{ schoolId: string; programId: string }> {
  const school = await db.query.schools.findFirst({
    where: eq(schools.name, 'University of Lagos'),
  });

  let schoolId: string;
  if (!school) {
    const [inserted] = await db.insert(schools).values({
      name: 'University of Lagos',
      country: 'NG',
    }).returning({ id: schools.id });
    if (!inserted) throw new Error('Could not create school');
    schoolId = inserted.id;
  } else {
    schoolId = school.id;
  }

  const program = await db.query.programs.findFirst({
    where: eq(programs.schoolId, schoolId),
  });

  let programId: string;
  if (!program) {
    const [inserted] = await db.insert(programs).values({
      schoolId,
      name: 'BSc Computer Science',
      tuitionAmount: 2_400_000_00,
      currency: 'NGN',
      durationMonths: 48,
    }).returning({ id: programs.id });
    if (!inserted) throw new Error('Could not create program');
    programId = inserted.id;
  } else {
    programId = program.id;
  }

  return { schoolId, programId };
}

async function seedDrizzleUser(
  authUserId: string,
  email: string,
  role: 'student' | 'sponsor' | 'university' | 'admin' | 'agent' | 'partner',
  onboardingComplete: boolean,
) {
  await db
    .insert(users)
    .values({ id: authUserId, email })
    .onConflictDoUpdate({
      target: users.id,
      set: { email },
    });

  await db
    .insert(profiles)
    .values({
      userId: authUserId,
      role,
      onboardingComplete,
    })
    .onConflictDoUpdate({
      target: profiles.userId,
      set: { role, onboardingComplete, updatedAt: new Date() },
    });
}

async function seedStudentProfile(
  userId: string,
  schoolId: string,
  programId: string,
  fundingType: 'self' | 'sponsor' | 'corporate',
) {
  await db
    .insert(studentProfiles)
    .values({
      userId,
      schoolId,
      programId,
      fundingType,
      kycStatus: 'verified',
      bankStatus: 'verified',
      onboardingStep: 4,
    })
    .onConflictDoUpdate({
      target: studentProfiles.userId,
      set: {
        schoolId,
        programId,
        fundingType,
        kycStatus: 'verified',
        bankStatus: 'verified',
        onboardingStep: 4,
        updatedAt: new Date(),
      },
    });
}

export async function runE2ESeed(): Promise<void> {
  const authUserId = await ensureSupabaseUser(E2E_STUDENT_EMAIL!, E2E_STUDENT_PASSWORD!);

  const { schoolId, programId } = await seedSchoolsAndPrograms();

  await seedDrizzleUser(authUserId, E2E_STUDENT_EMAIL!, 'student', true);
  await seedStudentProfile(authUserId, schoolId, programId, 'self');
}

async function main() {
  console.log('Seeding E2E data...');
  await runE2ESeed();
  console.log('E2E seed complete.');
}

if (process.argv[1]?.endsWith('seed-e2e.ts') || process.argv[1]?.includes('seed-e2e')) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
