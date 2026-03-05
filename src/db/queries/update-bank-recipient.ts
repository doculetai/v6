import { eq } from 'drizzle-orm';
import type { DrizzleDB } from '@/db';
import { bankAccounts } from '@/db/schema';

export async function updateBankRecipientCode(
  db: DrizzleDB,
  monoAccountId: string,
  recipientCode: string,
): Promise<void> {
  await db
    .update(bankAccounts)
    .set({ paystackRecipientCode: recipientCode, updatedAt: new Date() })
    .where(eq(bankAccounts.monoAccountId, monoAccountId));
}
