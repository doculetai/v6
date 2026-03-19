import { and, desc, eq, gt, isNull, lte, or } from 'drizzle-orm';

import type { DrizzleDB } from '@/db';
import { platformFeeConfig } from '@/db/schema';

export type PlatformFeeConfigRow = {
  id: string;
  feeType: 'percentage' | 'fixed';
  valueKobo: number;
  currency: string;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function listPlatformFeeConfig(db: DrizzleDB): Promise<PlatformFeeConfigRow[]> {
  const rows = await db
    .select()
    .from(platformFeeConfig)
    .orderBy(desc(platformFeeConfig.effectiveFrom), desc(platformFeeConfig.createdAt));
  return rows.map((r) => ({
    id: r.id,
    feeType: r.feeType as 'percentage' | 'fixed',
    valueKobo: r.valueKobo,
    currency: r.currency,
    effectiveFrom: r.effectiveFrom,
    effectiveTo: r.effectiveTo,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));
}

export async function createPlatformFeeConfig(
  db: DrizzleDB,
  input: {
    feeType: 'percentage' | 'fixed';
    valueKobo: number;
    currency: string;
    effectiveFrom?: Date;
  },
): Promise<PlatformFeeConfigRow> {
  const effectiveFrom = input.effectiveFrom ?? new Date();
  const [row] = await db
    .insert(platformFeeConfig)
    .values({
      feeType: input.feeType,
      valueKobo: input.valueKobo,
      currency: input.currency.toUpperCase(),
      effectiveFrom,
    })
    .returning();
  if (!row) throw new Error('Failed to create platform fee config');
  return {
    id: row.id,
    feeType: row.feeType as 'percentage' | 'fixed',
    valueKobo: row.valueKobo,
    currency: row.currency,
    effectiveFrom: row.effectiveFrom,
    effectiveTo: row.effectiveTo,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function updatePlatformFeeConfig(
  db: DrizzleDB,
  id: string,
  input: { valueKobo?: number; effectiveFrom?: Date },
): Promise<PlatformFeeConfigRow | null> {
  const [row] = await db
    .update(platformFeeConfig)
    .set({
      ...(input.valueKobo != null && { valueKobo: input.valueKobo }),
      ...(input.effectiveFrom != null && { effectiveFrom: input.effectiveFrom }),
      updatedAt: new Date(),
    })
    .where(eq(platformFeeConfig.id, id))
    .returning();
  if (!row) return null;
  return {
    id: row.id,
    feeType: row.feeType as 'percentage' | 'fixed',
    valueKobo: row.valueKobo,
    currency: row.currency,
    effectiveFrom: row.effectiveFrom,
    effectiveTo: row.effectiveTo,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/** End a fee config by setting effectiveTo. Does not delete; preserves audit trail. */
export async function endPlatformFeeConfig(
  db: DrizzleDB,
  id: string,
  effectiveTo: Date = new Date(),
): Promise<PlatformFeeConfigRow | null> {
  const [row] = await db
    .update(platformFeeConfig)
    .set({ effectiveTo, updatedAt: new Date() })
    .where(eq(platformFeeConfig.id, id))
    .returning();
  if (!row) return null;
  return {
    id: row.id,
    feeType: row.feeType as 'percentage' | 'fixed',
    valueKobo: row.valueKobo,
    currency: row.currency,
    effectiveFrom: row.effectiveFrom,
    effectiveTo: row.effectiveTo,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export type FeeConfig = {
  feeType: 'percentage' | 'fixed';
  valueKobo: number;
  currency: string;
};

export async function getActiveFeeConfig(
  db: DrizzleDB,
  currency: string,
): Promise<FeeConfig | null> {
  const now = new Date();
  const [row] = await db
    .select()
    .from(platformFeeConfig)
    .where(
      and(
        eq(platformFeeConfig.currency, currency),
        lte(platformFeeConfig.effectiveFrom, now),
        or(
          isNull(platformFeeConfig.effectiveTo),
          gt(platformFeeConfig.effectiveTo, now),
        ),
      ),
    )
    .orderBy(desc(platformFeeConfig.effectiveFrom))
    .limit(1);

  if (!row) return null;

  return {
    feeType: row.feeType as 'percentage' | 'fixed',
    valueKobo: row.valueKobo,
    currency: row.currency,
  };
}

/** Calculate fee in kobo. Returns 0 if no config or invalid. */
export function calculateFee(amountKobo: number, config: FeeConfig | null): number {
  if (!config || amountKobo <= 0) return 0;

  if (config.feeType === 'fixed') {
    return Math.min(config.valueKobo, amountKobo);
  }

  if (config.feeType === 'percentage') {
    const basisPoints = Math.min(config.valueKobo, 10000);
    return Math.floor((amountKobo * basisPoints) / 10_000);
  }

  return 0;
}
