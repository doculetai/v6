import { z } from 'zod';

import {
  connectSponsorMono,
  getSponsorKycStatus,
  sponsorBankVerificationMethods,
  sponsorIdentityMethods,
  sponsorKycStatuses,
  sponsorSourceOfFundsTypes,
  sponsorTypes,
  sponsorVerificationStates,
  submitSponsorBankStatement,
  submitSponsorIdentity,
  submitSponsorSourceOfFunds,
} from '@/db/queries/sponsor-kyc';

import { createTRPCRouter, roleProcedure } from '../trpc';

const sponsorProcedure = roleProcedure('sponsor');

const sponsorKycStatusOutputSchema = z.object({
  sponsorType: z.enum(sponsorTypes),
  isCorporate: z.boolean(),
  kycStatus: z.enum(sponsorKycStatuses),
  tier: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  currentStep: z.number().int().min(1),
  identityMethod: z.enum(sponsorIdentityMethods).nullable(),
  identityStatus: z.enum(sponsorVerificationStates),
  hasIdentityNumber: z.boolean(),
  sourceOfFundsType: z.enum(sponsorSourceOfFundsTypes).nullable(),
  sourceOfFundsAmountNaira: z.number().int().positive().nullable(),
  bankVerificationMethod: z.enum(sponsorBankVerificationMethods).nullable(),
  bankStatus: z.enum(sponsorVerificationStates),
  hasBankStatement: z.boolean(),
  hasMonoConnection: z.boolean(),
  corporateStatus: z.enum(sponsorVerificationStates),
  hasCorporateDetails: z.boolean(),
  shouldOfferPdfFallback: z.boolean(),
  securitySignals: z.object({
    lastLoginLocation: z.string().nullable(),
    lastLoginDevice: z.string().nullable(),
    activeSessionCount: z.number().int().min(0),
    suspiciousLoginAlerts: z.number().int().min(0),
    lastUpdatedAtWAT: z.string(),
  }),
});

const identityInputSchema = z
  .object({
    identityMethod: z.enum(sponsorIdentityMethods),
    nin: z.string().trim().regex(/^\d{11}$/).optional(),
    passportNumber: z.string().trim().min(6).max(24).optional(),
  })
  .superRefine((value, context) => {
    if (value.identityMethod === 'nin' && !value.nin) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['nin'],
        message: 'NIN is required when NIN verification is selected.',
      });
    }
    if (value.identityMethod === 'passport' && !value.passportNumber) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['passportNumber'],
        message: 'Passport number is required when passport verification is selected.',
      });
    }
  });

const sourceOfFundsInputSchema = z
  .object({
    sponsorType: z.enum(sponsorTypes),
    sourceOfFundsType: z.enum(sponsorSourceOfFundsTypes),
    sourceOfFundsAmountNaira: z.number().int().positive(),
    cacRegistrationNumber: z.string().trim().min(8).max(30).optional(),
    directorBvn: z.string().trim().regex(/^\d{11}$/).optional(),
    sponsorshipLetterFileName: z.string().trim().min(3).max(120).optional(),
  })
  .superRefine((value, context) => {
    if (value.sponsorType !== 'corporate') {
      return;
    }

    if (!value.cacRegistrationNumber) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['cacRegistrationNumber'],
        message: 'CAC registration number is required for corporate sponsors.',
      });
    }
    if (!value.directorBvn) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['directorBvn'],
        message: 'Director BVN is required for corporate sponsors.',
      });
    }
    if (!value.sponsorshipLetterFileName) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['sponsorshipLetterFileName'],
        message: 'Sponsorship letter is required for corporate sponsors.',
      });
    }
  });

const bankStatementInputSchema = z.object({
  fileName: z.string().trim().min(3).max(120),
});

const connectMonoInputSchema = z.object({
  monoAccountId: z.string().trim().min(4).max(64),
  bankName: z.string().trim().min(2).max(80),
  accountNumber: z.string().trim().regex(/^\d{10}$/),
  shouldFail: z.boolean().optional(),
});

export const sponsorRouter = createTRPCRouter({
  getKycStatus: sponsorProcedure.output(sponsorKycStatusOutputSchema).query(async ({ ctx }) => {
    return getSponsorKycStatus(ctx.db, ctx.user.id);
  }),

  submitIdentity: sponsorProcedure
    .input(identityInputSchema)
    .output(sponsorKycStatusOutputSchema)
    .mutation(async ({ ctx, input }) => {
      return submitSponsorIdentity(ctx.db, {
        userId: ctx.user.id,
        identityMethod: input.identityMethod,
        nin: input.nin,
        passportNumber: input.passportNumber,
      });
    }),

  submitSourceOfFunds: sponsorProcedure
    .input(sourceOfFundsInputSchema)
    .output(sponsorKycStatusOutputSchema)
    .mutation(async ({ ctx, input }) => {
      return submitSponsorSourceOfFunds(ctx.db, {
        userId: ctx.user.id,
        sponsorType: input.sponsorType,
        sourceOfFundsType: input.sourceOfFundsType,
        sourceOfFundsAmountNaira: input.sourceOfFundsAmountNaira,
        cacRegistrationNumber: input.cacRegistrationNumber,
        directorBvn: input.directorBvn,
        sponsorshipLetterFileName: input.sponsorshipLetterFileName,
      });
    }),

  submitBankStatement: sponsorProcedure
    .input(bankStatementInputSchema)
    .output(sponsorKycStatusOutputSchema)
    .mutation(async ({ ctx, input }) => {
      return submitSponsorBankStatement(ctx.db, {
        userId: ctx.user.id,
        fileName: input.fileName,
      });
    }),

  connectMono: sponsorProcedure
    .input(connectMonoInputSchema)
    .output(
      z.object({
        snapshot: sponsorKycStatusOutputSchema,
        status: z.enum(['connected', 'failed']),
        fallbackToPdf: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return connectSponsorMono(ctx.db, {
        userId: ctx.user.id,
        monoAccountId: input.monoAccountId,
        bankName: input.bankName,
        accountNumber: input.accountNumber,
        shouldFail: input.shouldFail,
      });
    }),
});
