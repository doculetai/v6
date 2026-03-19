import { captureException } from '@sentry/nextjs';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/db';
import { exchangeRates } from '@/db/schema';
import { SUPPORTED_TARGETS } from '@/lib/currency';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface OpenExchangeRatesResponse {
  rates: Record<string, number>;
  base: string;
  timestamp: number;
}

/**
 * Fetches daily exchange rates from Open Exchange Rates API.
 * Stores NGN→target pairs for all supported currencies.
 * Scheduled: once daily via Vercel Cron.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.OPEN_EXCHANGE_RATES_APP_ID;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'OPEN_EXCHANGE_RATES_APP_ID not configured' },
      { status: 500 },
    );
  }

  try {
    const response = await fetch(
      `https://openexchangerates.org/api/latest.json?app_id=${apiKey}&base=USD`,
    );

    if (!response.ok) {
      throw new Error(`Open Exchange Rates API returned ${response.status}`);
    }

    const data: OpenExchangeRatesResponse = await response.json();

    const ngnRate = data.rates['NGN'];
    if (!ngnRate) {
      throw new Error('NGN rate not found in API response');
    }

    const now = new Date();
    const insertRows = SUPPORTED_TARGETS.map((target) => {
      const targetRate = data.rates[target];
      if (!targetRate) return null;

      // NGN per 1 unit of target currency
      // e.g., if USD=1 and NGN=1589.5 → 1 USD = 1589.5 NGN → rateX100 = 158950
      const ngnPerTarget = ngnRate / targetRate;
      const rateX100 = Math.round(ngnPerTarget * 100);

      return {
        baseCurrency: 'NGN',
        targetCurrency: target,
        rateX100,
        source: 'openexchangerates',
        fetchedAt: now,
      };
    }).filter(Boolean) as Array<{
      baseCurrency: string;
      targetCurrency: string;
      rateX100: number;
      source: string;
      fetchedAt: Date;
    }>;

    if (insertRows.length > 0) {
      await db.insert(exchangeRates).values(insertRows);
    }

    return NextResponse.json({
      ok: true,
      ratesStored: insertRows.length,
      currencies: insertRows.map((r) => `${r.baseCurrency}/${r.targetCurrency}`),
    });
  } catch (err) {
    captureException(err, { tags: { cron: 'fetch-exchange-rates' } });
    return NextResponse.json(
      { error: 'Exchange rate fetch failed' },
      { status: 500 },
    );
  }
}
