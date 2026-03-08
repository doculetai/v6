import { desc, eq, and } from 'drizzle-orm';

import type { DrizzleDB } from '@/db';
import { exchangeRates } from '@/db/schema';

/** Common currency pairs for the platform (NGN base) */
const SUPPORTED_TARGETS = ['USD', 'GBP', 'EUR', 'CAD', 'AUD'] as const;
type SupportedCurrency = (typeof SUPPORTED_TARGETS)[number];

export interface ExchangeRate {
  baseCurrency: string;
  targetCurrency: string;
  /** Rate with 2-decimal precision stored as integer (e.g., 158950 = 1589.50) */
  rateX100: number;
  source: string;
  fetchedAt: Date;
}

/**
 * Get the latest exchange rate for a currency pair.
 * Returns null if no rate exists.
 */
export async function getExchangeRate(
  db: DrizzleDB,
  baseCurrency: string,
  targetCurrency: string,
): Promise<ExchangeRate | null> {
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
 * Get all latest exchange rates from NGN to supported currencies.
 */
export async function getLatestRates(db: DrizzleDB): Promise<Map<string, ExchangeRate>> {
  const rates = new Map<string, ExchangeRate>();

  for (const target of SUPPORTED_TARGETS) {
    const rate = await getExchangeRate(db, 'NGN', target);
    if (rate) rates.set(target, rate);
  }

  return rates;
}

/**
 * Convert an amount in kobo to a target currency using stored exchange rate.
 * Returns null if no exchange rate exists.
 */
export function convertKoboToForeign(
  amountKobo: number,
  rateX100: number,
): number {
  // amountKobo / 100 = NGN amount
  // NGN / rate = foreign amount
  // rate is stored as rateX100, so actual rate = rateX100 / 100
  const ngnAmount = amountKobo / 100;
  const rate = rateX100 / 100;
  return ngnAmount / rate;
}

/**
 * Format amount in kobo as NGN with optional foreign currency equivalent.
 * e.g., "NGN 75,000,000 (~USD 47,170)"
 */
export function formatDualCurrency(
  amountKobo: number,
  targetCurrency: string,
  rateX100: number | null,
): string {
  const ngnAmount = amountKobo / 100;
  const ngnFormatted = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    currencyDisplay: 'code',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(ngnAmount);

  if (!rateX100) return ngnFormatted;

  const foreignAmount = convertKoboToForeign(amountKobo, rateX100);
  const foreignFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: targetCurrency,
    currencyDisplay: 'code',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(foreignAmount);

  return `${ngnFormatted} (~${foreignFormatted})`;
}

/**
 * Format a compact dual-currency string for metric cards.
 * e.g., "N75M (~$47K)"
 */
export function formatDualCurrencyCompact(
  amountKobo: number,
  targetCurrency: string,
  rateX100: number | null,
): { ngn: string; foreign: string | null } {
  const naira = amountKobo / 100;
  let ngn: string;
  if (naira >= 1_000_000) ngn = `N${(naira / 1_000_000).toFixed(1)}M`;
  else if (naira >= 1_000) ngn = `N${(naira / 1_000).toFixed(0)}K`;
  else ngn = `N${naira.toLocaleString()}`;

  if (!rateX100) return { ngn, foreign: null };

  const foreignAmount = convertKoboToForeign(amountKobo, rateX100);
  const symbols: Record<string, string> = {
    USD: '$',
    GBP: '\u00a3',
    EUR: '\u20ac',
    CAD: 'C$',
    AUD: 'A$',
  };
  const symbol = symbols[targetCurrency] ?? targetCurrency;

  let foreign: string;
  if (foreignAmount >= 1_000_000) foreign = `${symbol}${(foreignAmount / 1_000_000).toFixed(1)}M`;
  else if (foreignAmount >= 1_000) foreign = `${symbol}${(foreignAmount / 1_000).toFixed(0)}K`;
  else foreign = `${symbol}${foreignAmount.toLocaleString()}`;

  return { ngn, foreign };
}

/**
 * Get the coverage percentage of funds against tuition.
 * tuitionAmountMinor is in the tuition's currency minor unit.
 */
export function calculateCoverage(
  fundsKobo: number,
  tuitionAmountMinor: number,
  tuitionCurrency: string,
  rateX100: number | null,
): number | null {
  if (tuitionCurrency === 'NGN') {
    // Both in same currency (kobo)
    return tuitionAmountMinor > 0 ? (fundsKobo / tuitionAmountMinor) * 100 : null;
  }

  if (!rateX100) return null;

  // Convert NGN funds to tuition currency
  const fundsInForeign = convertKoboToForeign(fundsKobo, rateX100);
  const tuitionInMajor = tuitionAmountMinor / 100;

  return tuitionInMajor > 0 ? (fundsInForeign / tuitionInMajor) * 100 : null;
}

/**
 * Check if exchange rate data is stale (older than 24 hours).
 */
export function isRateStale(fetchedAt: Date): boolean {
  const staleThresholdMs = 24 * 60 * 60 * 1000;
  return Date.now() - fetchedAt.getTime() > staleThresholdMs;
}

/**
 * Format a naira amount (whole NGN, not kobo) as a display string.
 * e.g., formatNGN(1500000) → "₦ 1,500,000"
 */
export function formatNGN(amountNgn: number): string {
  return `₦ ${amountNgn.toLocaleString('en-NG')}`;
}

/**
 * Format a naira amount (whole NGN, not kobo) as a USD equivalent string.
 * e.g., formatUSD(1500000, 0.00065) → "$975 USD"
 */
export function formatUSD(amountNgn: number, ngnToUsdRate: number): string {
  const usd = amountNgn * ngnToUsdRate;
  return `$${Math.round(usd).toLocaleString('en-US')} USD`;
}

/**
 * Format a naira amount (whole NGN, not kobo) as a dual-currency struct.
 * Returns { ngn: "₦ 1,500,000", usd: "$975 USD" } for display inline.
 */
export function formatNgnUsd(
  amountNgn: number,
  ngnToUsdRate: number,
): { ngn: string; usd: string } {
  return {
    ngn: formatNGN(amountNgn),
    usd: formatUSD(amountNgn, ngnToUsdRate),
  };
}

export { SUPPORTED_TARGETS, type SupportedCurrency };
