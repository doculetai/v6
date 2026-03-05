import { z } from 'zod';

type InitiateTransferResult =
  | { success: true; transferCode: string; paystackReference: string }
  | { success: false; error: string };

const paystackTransferResponseSchema = z.object({
  status: z.boolean().optional(),
  data: z
    .object({
      transfer_code: z.string().optional(),
      reference: z.string().optional(),
    })
    .optional(),
  message: z.string().optional(),
});

export async function initiatePaystackTransfer(params: {
  amountKobo: number;
  recipientCode: string;
  reference: string;
}): Promise<InitiateTransferResult> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) return { success: false, error: 'Missing PAYSTACK_SECRET_KEY' };

  const res = await fetch('https://api.paystack.co/transfer', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source: 'balance',
      amount: params.amountKobo,
      recipient: params.recipientCode,
      reference: params.reference,
      reason: 'Doculet sponsorship disbursement',
    }),
  });

  const parsed = paystackTransferResponseSchema.safeParse(await res.json());

  if (!parsed.success || !parsed.data.data?.transfer_code) {
    const msg = parsed.success
      ? (parsed.data.message ?? 'Paystack transfer failed')
      : 'Paystack response parse failed';
    return { success: false, error: msg };
  }

  return {
    success: true,
    transferCode: parsed.data.data.transfer_code,
    paystackReference: parsed.data.data.reference ?? params.reference,
  };
}
