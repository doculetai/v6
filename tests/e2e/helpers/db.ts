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
  pipelineRuns,
  sponsorshipInvites,
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
  /** documents(bank_statement) status */
  documentStatus: 'none' | 'pending' | 'approved' | 'rejected' | 'more_info_requested';
  /** rejection reason when documentStatus='rejected' or 'more_info_requested' */
  rejectionReason?: string;
  /**
   * When true: inserts kycVerifications(tier=2, status='failed') so the
   * Verification page shows the T2 failed state with resubmit guidance.
   * Mutually exclusive with t2KycVerified.
   */
  t2KycFailed?: boolean;
  /**
   * When true: inserts a sponsorshipInvites(pending) row so the student
   * sees the "sponsor invite pending" state on Overview/Proof.
   */
  sponsorInvitePending?: boolean;
  /**
   * When true: inserts a documents(pending) row + pipelineRuns(completed) row
   * so the OCR review card is visible on the Documents page.
   * documentStatus is ignored when ocrReviewPending=true (document is always 'pending').
   */
  ocrReviewPending?: boolean;
  /** certificates.status='active' */
  certificateIssued: boolean;
}

/**
 * Remove all MFA factors for a user — used before/after MFA flow tests
 * to ensure a clean "not enrolled" state.
 */
export async function unenrollMfaFactors(userId: string): Promise<void> {
  const { db, client } = createDb();
  try {
    await db.execute(
      sql`DELETE FROM auth.mfa_challenges WHERE factor_id IN (
            SELECT id FROM auth.mfa_factors WHERE user_id = CAST(${userId} AS uuid)
          )`,
    );
    await db.execute(
      sql`DELETE FROM auth.mfa_factors WHERE user_id = CAST(${userId} AS uuid)`,
    );
  } finally {
    await client.end();
  }
}

export async function setStudentState(
  userId: string,
  state: StudentJourneyState,
): Promise<void> {
  if (state.t3BankVerified && !state.t2KycVerified) {
    throw new Error('setStudentState: t3BankVerified requires t2KycVerified');
  }
  if (state.t2KycFailed && state.t2KycVerified) {
    throw new Error('setStudentState: t2KycFailed and t2KycVerified are mutually exclusive');
  }

  const { db, client } = createDb();

  try {
    // --- 1. Clear all variable state ---
    await db.delete(certificates).where(eq(certificates.studentId, userId));
    await db.delete(documents).where(eq(documents.userId, userId));
    await db.delete(bankAccounts).where(eq(bankAccounts.userId, userId));
    await db.delete(kycVerifications).where(eq(kycVerifications.userId, userId));
    await db.delete(sponsorshipInvites).where(eq(sponsorshipInvites.studentId, userId));

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

    // --- 4b. T2 failed (mutually exclusive with t2KycVerified) ---
    if (state.t2KycFailed) {
      await db.insert(kycVerifications).values({
        userId,
        tier: 2,
        status: 'failed',
        provider: 'dojah',
        referenceId: `e2e_t2_fail_${crypto.randomUUID()}`,
        verifiedAt: null,
      });
      await db
        .update(studentProfiles)
        .set({ kycStatus: 'failed' })
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

    // --- 6. Document (and optional OCR pipeline run) ---
    if (state.ocrReviewPending) {
      // Insert pending document first, capture ID for the pipeline run FK
      const [doc] = await db
        .insert(documents)
        .values({
          userId,
          type: 'bank_statement',
          storageUrl: 'https://placeholder.doculet.ai/e2e/statement.pdf',
          status: 'pending',
          rejectionReason: null,
          reviewedAt: null,
        })
        .returning({ id: documents.id });

      await db.insert(pipelineRuns).values({
        documentId: doc.id,
        userId,
        status: 'completed',
        progress: 100,
        bankName: 'Zenith Bank',
        accountHolder: 'E2E Student',
        compositeScore: 75,
        riskCategory: 'low',
        autoDecision: 'review',
        consensusResult: {
          extractedName: 'E2E Student',
          extractedBalance: 1500000,
          accountNumber: '0123456789',
          bankName: 'Zenith Bank',
        },
      });
    } else if (state.documentStatus !== 'none') {
      await db.insert(documents).values({
        userId,
        type: 'bank_statement',
        storageUrl: 'https://placeholder.doculet.ai/e2e/statement.pdf',
        status: state.documentStatus,
        rejectionReason:
          state.documentStatus === 'rejected'
            ? (state.rejectionReason ??
              'Balance below required minimum. Resubmit with correct statement.')
            : state.documentStatus === 'more_info_requested'
              ? (state.rejectionReason ?? 'Please upload a clearer copy showing account name and balance.')
              : null,
        reviewedAt: state.documentStatus !== 'pending' ? new Date() : null,
      });
    }

    // --- 7. Sponsor invite pending (student invited a sponsor by email) ---
    if (state.sponsorInvitePending) {
      await db.insert(sponsorshipInvites).values({
        studentId: userId,
        inviteeEmail: 'e2e.sponsor.invite@test.doculet.ai',
        inviteeEmailNormalized: 'e2e.sponsor.invite@test.doculet.ai',
        status: 'pending',
        message: 'Please support my education.',
      });
    }

    // --- 9. Certificate ---
    if (state.certificateIssued) {
      await db.insert(certificates).values({
        studentId: userId,
        token: `e2e_cert_${crypto.randomUUID()}`,
        certCode: `E2E-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
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
