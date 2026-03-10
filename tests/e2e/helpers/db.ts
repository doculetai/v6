/**
 * E2E DB state helper — direct Drizzle mutations for Layer B interaction specs.
 * Prereq: DATABASE_URL in .env.local, E2E_STUDENT_USER_ID set.
 * No mocks — real DB, same schema as production.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, sql } from 'drizzle-orm';
import * as schema from '../../../src/db/schema';
import { config } from 'dotenv';

config({ path: '.env.local' });
config({ path: '.env' });

const {
  profiles,
  studentProfiles,
  kycVerifications,
  bankAccounts,
  documents,
  certificates,
} = schema;

function createDb() {
  const client = postgres(process.env.DATABASE_URL!, { max: 1 });
  const db = drizzle(client, { schema });
  return { db, client };
}

export interface StudentJourneyState {
  /** profiles.onboarding_complete */
  onboardingComplete: boolean;
  /** auth.users.phone IS NOT NULL */
  t1PhoneVerified: boolean;
  /** kycVerifications tier=2 verified + studentProfiles.kycStatus='verified' */
  t2KycVerified: boolean;
  /** kycVerifications tier=3 verified + bankAccounts + studentProfiles.bankStatus='verified' */
  t3BankVerified: boolean;
  /**
   * documents(bank_statement) status. Note: 'more_info_requested' and 'expired'
   * are valid DB states but not currently seeded — extend interface if needed.
   */
  documentStatus: 'none' | 'pending' | 'approved' | 'rejected';
  /** rejection reason when documentStatus='rejected' */
  rejectionReason?: string;
  /** certificates.status='active' */
  certificateIssued: boolean;
}

export async function setStudentState(
  userId: string,
  state: StudentJourneyState,
): Promise<void> {
  if (state.t3BankVerified && !state.t2KycVerified) {
    throw new Error('setStudentState: t3BankVerified requires t2KycVerified');
  }

  const { db, client } = createDb();

  try {
    // --- 1. Clear all variable state ---
    await db.delete(certificates).where(eq(certificates.studentId, userId));
    await db.delete(documents).where(eq(documents.userId, userId));
    await db.delete(bankAccounts).where(eq(bankAccounts.userId, userId));
    await db.delete(kycVerifications).where(eq(kycVerifications.userId, userId));

    // --- 2. Reset profile fields ---
    await db
      .update(profiles)
      .set({ onboardingComplete: state.onboardingComplete })
      .where(eq(profiles.userId, userId));

    await db
      .update(studentProfiles)
      .set({ kycStatus: 'not_started', bankStatus: 'not_started' })
      .where(eq(studentProfiles.userId, userId));

    // --- 3. T1: phone (lives in auth.users, not in Drizzle users table) ---
    if (state.t1PhoneVerified) {
      await db.execute(
        sql`UPDATE auth.users SET phone = '+2348012345678', phone_confirmed_at = NOW() WHERE id = ${userId}::uuid`,
      );
    } else {
      await db.execute(
        sql`UPDATE auth.users SET phone = NULL, phone_confirmed_at = NULL WHERE id = ${userId}::uuid`,
      );
    }

    // --- 4. T2: KYC identity ---
    if (state.t2KycVerified) {
      await db.insert(kycVerifications).values({
        userId,
        tier: 2,
        status: 'verified',
        provider: 'dojah',
        referenceId: `e2e_t2_${crypto.randomUUID()}`,
        verifiedAt: new Date(),
      });
      await db
        .update(studentProfiles)
        .set({ kycStatus: 'verified' })
        .where(eq(studentProfiles.userId, userId));
    }

    // --- 5. T3: bank (requires BOTH kycVerifications tier=3 AND bankAccounts) ---
    if (state.t3BankVerified) {
      await db.insert(kycVerifications).values({
        userId,
        tier: 3,
        status: 'verified',
        provider: 'dojah',
        referenceId: `e2e_t3_${crypto.randomUUID()}`,
        verifiedAt: new Date(),
      });
      await db.insert(bankAccounts).values({
        userId,
        provider: 'mono',
        accountNumber: '0123456789',
        bankName: 'Zenith Bank',
        monoAccountId: `e2e_mono_${crypto.randomUUID()}`,
      });
      await db
        .update(studentProfiles)
        .set({ bankStatus: 'verified' })
        .where(eq(studentProfiles.userId, userId));
    }

    // --- 6. Document ---
    if (state.documentStatus !== 'none') {
      await db.insert(documents).values({
        userId,
        type: 'bank_statement',
        storageUrl: 'https://placeholder.doculet.ai/e2e/statement.pdf',
        status: state.documentStatus,
        rejectionReason:
          state.documentStatus === 'rejected'
            ? (state.rejectionReason ??
              'Balance below required minimum. Resubmit with correct statement.')
            : null,
        reviewedAt: state.documentStatus !== 'pending' ? new Date() : null,
      });
    }

    // --- 7. Certificate ---
    if (state.certificateIssued) {
      await db.insert(certificates).values({
        studentId: userId,
        token: `e2e_cert_${Date.now()}`,
        status: 'active',
        paymentStatus: 'paid',
        issuedAt: new Date(),
        metaJson: {
          studentName: 'E2E Student',
          schoolName: 'Test University',
          programName: 'Computer Science',
          amount: 1500000,
          currency: 'NGN',
        },
      });
    }
  } finally {
    await client.end();
  }
}
