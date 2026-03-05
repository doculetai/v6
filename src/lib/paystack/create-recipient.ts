import { z } from 'zod';
import { getBankCode } from './bank-codes';

type CreateRecipientParams = {
  name: string;
  accountNumber: string;
  bankName: string;
};

type CreateRecipientResult =
  | { success: true; recipientCode: string }
  | { success: false; error: string };

const paystackRecipientResponseSchema = z.object({
  status: z.boolean().optional(),
  data: z.object({ recipient_code: z.string() }).optional(),
  message: z.string().optional(),
});

export async function createPaystackRecipient(
  params: CreateRecipientParams,
): Promise<CreateRecipientResult> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) return { success: false, error: 'Missing PAYSTACK_SECRET_KEY' };

  const bankCode = getBankCode(params.bankName);
  if (!bankCode) {
    return { success: false, error: `Unknown bank code for: ${params.bankName}` };
  }

  const res = await fetch('https://api.paystack.co/transferrecipient', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'nuban',
      name: params.name,
      account_number: params.accountNumber,
      bank_code: bankCode,
      currency: 'NGN',
    }),
  });

  const parsed = paystackRecipientResponseSchema.safeParse(await res.json());
  if (!parsed.success || !res.ok || !parsed.data.data?.recipient_code) {
    const msg = parsed.success ? parsed.data.message : undefined;
    return { success: false, error: msg ?? 'Paystack recipient creation failed' };
  }

  return { success: true, recipientCode: parsed.data.data.recipient_code };
}
