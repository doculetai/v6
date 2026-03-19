import { z } from 'zod';

/** Zod schema for Paystack transfer verify response */
const paystackTransferDataSchema = z.object({
  amount: z.number(),
  currency: z.string(),
  status: z.string(),
  reference: z.string(),
  recipient: z
    .object({
      name: z.string().optional(),
      recipient_code: z.string().optional(),
    })
    .optional(),
  transfer_code: z.string().optional(),
  reason: z.string().optional(),
  updated_at: z.string().optional(),
});

const paystackVerifyTransferResponseSchema = z.object({
  status: z.boolean(),
  message: z.string().optional(),
  data: paystackTransferDataSchema.optional(),
});

export type PaystackTransferData = z.infer<typeof paystackTransferDataSchema>;

export type PaystackTransferResult =
  | {
      success: true;
      status: 'success' | 'failed' | 'reversed' | 'pending' | 'processing';
      data: PaystackTransferData;
    }
  | { success: false; error: string };

/**
 * Paystack transfer status values mapped to our reconciliation categories.
 * - success → completed disbursement
 * - failed / reversed → failed disbursement
 * - pending / processing → still in progress, skip
 */
const COMPLETED_STATUSES = new Set(['success']);
const FAILED_STATUSES = new Set(['failed', 'reversed']);
const PENDING_STATUSES = new Set(['pending', 'processing', 'otp']);

function normalizeStatus(
  raw: string,
): 'success' | 'failed' | 'reversed' | 'pending' | 'processing' {
  const lower = raw.toLowerCase();
  if (COMPLETED_STATUSES.has(lower)) return 'success';
  if (lower === 'reversed') return 'reversed';
  if (FAILED_STATUSES.has(lower)) return 'failed';
  if (PENDING_STATUSES.has(lower)) return 'processing';
  // Unknown status — treat as pending/processing to avoid false positives
  return 'pending';
}

/**
 * Verify a Paystack transfer by reference.
 * Uses GET https://api.paystack.co/transfer/verify/{reference}
 */
export async function fetchPaystackTransfer(
  reference: string,
): Promise<PaystackTransferResult> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return { success: false, error: 'Missing PAYSTACK_SECRET_KEY' };
  }

  if (!reference.trim()) {
    return { success: false, error: 'Empty reference provided' };
  }

  let res: Response;
  try {
    res = await fetch(
      `https://api.paystack.co/transfer/verify/${encodeURIComponent(reference)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Network request failed';
    return { success: false, error: `Paystack network error: ${message}` };
  }

  if (!res.ok) {
    return {
      success: false,
      error: `Paystack API returned ${res.status}: ${res.statusText}`,
    };
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    return { success: false, error: 'Failed to parse Paystack JSON response' };
  }

  const parsed = paystackVerifyTransferResponseSchema.safeParse(json);

  if (!parsed.success) {
    return {
      success: false,
      error: `Paystack response validation failed: ${parsed.error.message}`,
    };
  }

  if (!parsed.data.status || !parsed.data.data) {
    return {
      success: false,
      error: parsed.data.message ?? 'Paystack transfer verify returned no data',
    };
  }

  return {
    success: true,
    status: normalizeStatus(parsed.data.data.status),
    data: parsed.data.data,
  };
}
