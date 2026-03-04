import { z } from 'zod';

import { sponsorCopy } from '@/config/copy/sponsor';

export const sponsorTypeSchema = z.enum(['individual', 'corporate']);
export const relationshipToStudentSchema = z.enum([
  'parent',
  'guardian',
  'relative',
  'corporate',
  'other',
]);

export const nigerianPhoneSchema = z
  .string()
  .regex(/^\+234[7-9]\d{9}$/, sponsorCopy.settings.validation.invalidPhone);

const companyNameSchema = z.union([
  z.string().trim().max(120, sponsorCopy.settings.validation.companyNameMax),
  z.literal(''),
  z.null(),
]);

const cacNumberSchema = z.union([
  z.string().trim().max(50, sponsorCopy.settings.validation.cacNumberMax),
  z.literal(''),
  z.null(),
]);

const directorBvnSchema = z.union([
  z.string().trim().regex(/^\d{11}$/, sponsorCopy.settings.validation.invalidBvn),
  z.literal(''),
  z.null(),
]);

export const sponsorProfileInputSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, sponsorCopy.settings.validation.nameMin)
      .max(120, sponsorCopy.settings.validation.nameMax),
    email: z.string().trim().email(sponsorCopy.settings.validation.invalidEmail),
    phoneNumber: nigerianPhoneSchema,
    relationshipToStudent: relationshipToStudentSchema,
    sponsorType: sponsorTypeSchema,
    companyName: companyNameSchema,
    cacNumber: cacNumberSchema,
    directorBvn: directorBvnSchema,
  })
  .superRefine((values, context) => {
    if (values.sponsorType !== 'corporate') {
      return;
    }

    if (!values.companyName) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: sponsorCopy.settings.validation.companyNameRequired,
        path: ['companyName'],
      });
    }

    if (!values.cacNumber) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: sponsorCopy.settings.validation.cacNumberRequired,
        path: ['cacNumber'],
      });
    }

    if (!values.directorBvn) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: sponsorCopy.settings.validation.directorBvnRequired,
        path: ['directorBvn'],
      });
    }
  });

export const sponsorProfileSchema = z.object({
  fullName: z.string(),
  email: z.string().email(),
  phoneNumber: z.string(),
  relationshipToStudent: relationshipToStudentSchema,
  sponsorType: sponsorTypeSchema,
  companyName: z.string().nullable(),
  cacNumber: z.string().nullable(),
  directorBvn: z.string().nullable(),
  lastLoginLocation: z.string().nullable(),
  hasSuspiciousLogin: z.boolean(),
  sessions: z.array(
    z.object({
      id: z.string(),
      browser: z.string(),
      deviceType: z.enum(['desktop', 'mobile', 'tablet', 'unknown']),
      location: z.string(),
      lastActive: z.string(),
      isCurrent: z.boolean(),
      ipAddress: z.string().nullable(),
    }),
  ),
});

export const sponsorNotificationSettingsSchema = z.object({
  emailFundingUpdates: z.boolean(),
  emailVerificationUpdates: z.boolean(),
  emailSecurityAlerts: z.boolean(),
});

export type SponsorProfileInput = z.infer<typeof sponsorProfileInputSchema>;
export type SponsorProfile = z.infer<typeof sponsorProfileSchema>;
export type SponsorNotificationSettings = z.infer<
  typeof sponsorNotificationSettingsSchema
>;
