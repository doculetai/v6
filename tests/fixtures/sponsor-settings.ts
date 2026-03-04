import type {
  SponsorNotificationSettings,
  SponsorProfileInput,
} from '@/server/routers/sponsor.schemas';

export const individualSponsorProfileFixture: SponsorProfileInput = {
  fullName: 'Amaka Okafor',
  email: 'amaka.okafor@example.com',
  phoneNumber: '+2348012345678',
  relationshipToStudent: 'parent',
  sponsorType: 'individual',
  companyName: '',
  cacNumber: '',
  directorBvn: '',
};

export const corporateSponsorProfileFixture: SponsorProfileInput = {
  fullName: 'Chinedu Eze',
  email: 'finance@sunrisedirect.ng',
  phoneNumber: '+2348034567890',
  relationshipToStudent: 'corporate',
  sponsorType: 'corporate',
  companyName: 'Sunrise Direct Limited',
  cacNumber: 'RC-4829001',
  directorBvn: '12345678901',
};

export const sponsorNotificationSettingsFixture: SponsorNotificationSettings = {
  emailFundingUpdates: true,
  emailVerificationUpdates: true,
  emailSecurityAlerts: true,
};
