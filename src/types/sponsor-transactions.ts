import { z } from 'zod';

export const sponsorTransactionTypeValues = ['credit', 'debit', 'fee', 'refund'] as const;
export const sponsorTransactionFilterValues = ['all', 'credit', 'debit', 'fee'] as const;
export const sponsorTransactionStatusValues = ['successful', 'pending', 'failed', 'refunded'] as const;
export const sponsorTransactionSourceValues = [
  'disbursement',
  'paystack_charge',
  'paystack_fee',
  'paystack_refund',
  'paystack_credit',
] as const;

export const sponsorTransactionTypeSchema = z.enum(sponsorTransactionTypeValues);
export const sponsorTransactionFilterSchema = z.enum(sponsorTransactionFilterValues);
export const sponsorTransactionStatusSchema = z.enum(sponsorTransactionStatusValues);
export const sponsorTransactionSourceSchema = z.enum(sponsorTransactionSourceValues);

export const sponsorTransactionSchema = z.object({
  id: z.string().min(1),
  type: sponsorTransactionTypeSchema,
  status: sponsorTransactionStatusSchema,
  source: sponsorTransactionSourceSchema,
  amountKobo: z.number().int().nonnegative(),
  currency: z.string().length(3),
  reference: z.string().nullable(),
  description: z.string().nullable(),
  createdAt: z.string().datetime(),
});

export const sponsorTransactionSummarySchema = z.object({
  totalSpentKobo: z.number().int().nonnegative(),
  totalPendingKobo: z.number().int().nonnegative(),
  updatedAt: z.string().datetime(),
});

export type SponsorTransactionType = z.infer<typeof sponsorTransactionTypeSchema>;
export type SponsorTransactionFilter = z.infer<typeof sponsorTransactionFilterSchema>;
export type SponsorTransactionStatus = z.infer<typeof sponsorTransactionStatusSchema>;
export type SponsorTransactionSource = z.infer<typeof sponsorTransactionSourceSchema>;
export type SponsorTransaction = z.infer<typeof sponsorTransactionSchema>;
export type SponsorTransactionSummary = z.infer<typeof sponsorTransactionSummarySchema>;
