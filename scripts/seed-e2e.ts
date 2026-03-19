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
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

config({ path: '.env.local' });
config({ path: '.env' });

import * as schema from '../src/db/schema';
import { users, profiles, studentProfiles, schools, programs, universityProfiles, partnerProfiles } from '../src/db/schema';

const DATABASE_URL = process.env.DATABASE_URL;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const E2E_STUDENT_EMAIL = process.env.E2E_STUDENT_EMAIL;
const E2E_STUDENT_PASSWORD = process.env.E2E_STUDENT_PASSWORD;
const E2E_SPONSOR_EMAIL = process.env.E2E_SPONSOR_EMAIL;
const E2E_SPONSOR_PASSWORD = process.env.E2E_SPONSOR_PASSWORD;
const E2E_UNIVERSITY_EMAIL = process.env.E2E_UNIVERSITY_EMAIL;
const E2E_UNIVERSITY_PASSWORD = process.env.E2E_UNIVERSITY_PASSWORD;
const E2E_ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL;
const E2E_ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD;

if (!DATABASE_URL || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

if (!E2E_STUDENT_EMAIL || !E2E_STUDENT_PASSWORD) {
  console.error('Missing E2E_STUDENT_EMAIL or E2E_STUDENT_PASSWORD. Set in .env.local');
  process.exit(1);
}

if (
  !E2E_SPONSOR_EMAIL || !E2E_SPONSOR_PASSWORD ||
  !E2E_UNIVERSITY_EMAIL || !E2E_UNIVERSITY_PASSWORD ||
  !E2E_ADMIN_EMAIL || !E2E_ADMIN_PASSWORD
) {
  console.error(
    'Missing one or more E2E role credentials. Required: ' +
      'E2E_SPONSOR_EMAIL/PASSWORD, E2E_UNIVERSITY_EMAIL/PASSWORD, E2E_ADMIN_EMAIL/PASSWORD',
  );
  process.exit(1);
}

const sqlClient = postgres(DATABASE_URL, { prepare: false });
const db = drizzle(sqlClient, { schema });
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

/**
 * Upserts E2E ID env vars into .env.local so db helpers can pick them up.
 * Updates existing lines in-place; appends new ones at the end.
 */
function writeE2EIds(ids: Record<string, string>): void {
  const envPath = join(process.cwd(), '.env.local');
  let content = existsSync(envPath) ? readFileSync(envPath, 'utf-8') : '';

  for (const [key, value] of Object.entries(ids)) {
    const lineRegex = new RegExp(`^${key}=.*$`, 'm');
    if (lineRegex.test(content)) {
      content = content.replace(lineRegex, `${key}=${value}`);
    } else {
      content = content.endsWith('\n') ? content : content + '\n';
      content += `${key}=${value}\n`;
    }
  }

  writeFileSync(envPath, content);
  console.log('  Written E2E IDs to .env.local:', Object.keys(ids).join(', '));
}

async function seedPartnerProfile(userId: string): Promise<string> {
  await db
    .insert(partnerProfiles)
    .values({
      userId,
      organizationName: 'E2E Test Partner',
    })
    .onConflictDoUpdate({
      target: partnerProfiles.userId,
      set: { organizationName: 'E2E Test Partner', updatedAt: new Date() },
    });

  const profile = await db.query.partnerProfiles.findFirst({
    where: eq(partnerProfiles.userId, userId),
  });
  if (!profile) throw new Error('Could not create partner profile');
  return profile.id;
}

async function seedUniversityProfile(userId: string, schoolId: string) {
  await db
    .insert(universityProfiles)
    .values({
      userId,
      schoolId,
      organizationName: 'University of Lagos Admissions',
    })
    .onConflictDoUpdate({
      target: universityProfiles.userId,
      set: {
        schoolId,
        organizationName: 'University of Lagos Admissions',
        updatedAt: new Date(),
      },
    });
}

export async function runE2ESeed(): Promise<void> {
  const studentAuthUserId = await ensureSupabaseUser(E2E_STUDENT_EMAIL!, E2E_STUDENT_PASSWORD!);
  const sponsorAuthUserId = await ensureSupabaseUser(E2E_SPONSOR_EMAIL!, E2E_SPONSOR_PASSWORD!);
  const universityAuthUserId = await ensureSupabaseUser(E2E_UNIVERSITY_EMAIL!, E2E_UNIVERSITY_PASSWORD!);
  const adminAuthUserId = await ensureSupabaseUser(E2E_ADMIN_EMAIL!, E2E_ADMIN_PASSWORD!);

  const { schoolId, programId } = await seedSchoolsAndPrograms();

  await seedDrizzleUser(studentAuthUserId, E2E_STUDENT_EMAIL!, 'student', true);
  await seedStudentProfile(studentAuthUserId, schoolId, programId, 'self');
  await seedDrizzleUser(sponsorAuthUserId, E2E_SPONSOR_EMAIL!, 'sponsor', true);
  await seedDrizzleUser(universityAuthUserId, E2E_UNIVERSITY_EMAIL!, 'university', true);
  await seedUniversityProfile(universityAuthUserId, schoolId);
  await seedDrizzleUser(adminAuthUserId, E2E_ADMIN_EMAIL!, 'admin', true);

  const ids: Record<string, string> = {
    E2E_STUDENT_USER_ID: studentAuthUserId,
    E2E_SPONSOR_USER_ID: sponsorAuthUserId,
    E2E_UNIVERSITY_SCHOOL_ID: schoolId,
  };

  // Partner — optional: only seeded when credentials are present
  const partnerEmail = process.env.E2E_PARTNER_EMAIL;
  const partnerPassword = process.env.E2E_PARTNER_PASSWORD;
  if (partnerEmail && partnerPassword) {
    const partnerAuthUserId = await ensureSupabaseUser(partnerEmail, partnerPassword);
    await seedDrizzleUser(partnerAuthUserId, partnerEmail, 'partner', true);
    const partnerProfileId = await seedPartnerProfile(partnerAuthUserId);
    ids.E2E_PARTNER_PROFILE_ID = partnerProfileId;
  }

  writeE2EIds(ids);
}

async function main() {
  console.log('Seeding E2E data...');
  try {
    await runE2ESeed();
    console.log('E2E seed complete.');
  } finally {
    await sqlClient.end({ timeout: 5 });
  }
}

if (process.argv[1]?.endsWith('seed-e2e.ts') || process.argv[1]?.includes('seed-e2e')) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
