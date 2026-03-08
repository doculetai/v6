import { and, desc, eq } from 'drizzle-orm';

import type { DrizzleDB } from '@/db';
import { exchangeRates } from '@/db/schema';

/** Fallback rate if no cached value exists: ~0.00065 USD per NGN (1 USD ≈ 1540 NGN) */
const FALLBACK_NGN_TO_USD = 0.00065;

/**
 * Get the latest exchange rate for a specific currency pair.
 */
export async function getLatestRate(
  db: DrizzleDB,
  baseCurrency: string,
  targetCurrency: string,
) {
  const [result] = await db
    .select()
    .from(exchangeRates)
    .where(
      and(
        eq(exchangeRates.baseCurrency, baseCurrency),
        eq(exchangeRates.targetCurrency, targetCurrency),
      ),
    )
    .orderBy(desc(exchangeRates.fetchedAt))
    .limit(1);

  return result ?? null;
}

/**
 * Get the latest rates for all supported target currencies from NGN.
 */
export async function getLatestNgnRates(db: DrizzleDB) {
  const targets = ['USD', 'GBP', 'EUR', 'CAD', 'AUD'] as const;
  const results: Record<string, { rateX100: number; fetchedAt: Date; source: string }> = {};

  for (const target of targets) {
    const rate = await getLatestRate(db, 'NGN', target);
    if (rate) {
      results[target] = {
        rateX100: rate.rateX100,
        fetchedAt: rate.fetchedAt,
        source: rate.source,
      };
    }
  }

  return results;
}

/**
 * Get the latest cached NGN→USD rate as a simple multiplier.
 * Returns ngnToUsd (e.g., 0.00065 means ₦1 = $0.00065).
 * Falls back to FALLBACK_NGN_TO_USD if no row exists.
 *
 * The schema stores rateX100 as NGN per 1 USD * 100
 * (e.g., 158950 = 1589.50 NGN per USD).
 * So ngnToUsd = 1 / (rateX100 / 100).
 */
export async function getCachedNgnToUsdRate(db: DrizzleDB): Promise<number> {
  const result = await getLatestRate(db, 'NGN', 'USD');
  if (!result) return FALLBACK_NGN_TO_USD;
  const ngnPerUsd = result.rateX100 / 100;
  return ngnPerUsd > 0 ? 1 / ngnPerUsd : FALLBACK_NGN_TO_USD;
}
