/**
 * Embassy/visa requirements by destination country.
 * Used on the proof page to show students what their target embassy expects.
 */

export type EmbassyRequirement = {
  country: string;
  countryCode: string;
  visaType: string;
  minFundsUsd: number | null;
  minBalanceDays: number;
  requiredDocs: string[];
  notes: string;
};

export const embassyRequirements: EmbassyRequirement[] = [
  {
    country: 'United Kingdom',
    countryCode: 'GB',
    visaType: 'Student visa (Tier 4)',
    minFundsUsd: null,
    minBalanceDays: 28,
    requiredDocs: ['Bank statement', 'Offer letter (CAS)', 'Passport'],
    notes:
      'Funds must be held for at least 28 consecutive days. Amount depends on course location: GBP 1,334/month (London) or GBP 1,023/month (outside London) for up to 9 months, plus full tuition fees.',
  },
  {
    country: 'United States',
    countryCode: 'US',
    visaType: 'F-1 Student visa',
    minFundsUsd: null,
    minBalanceDays: 0,
    requiredDocs: ['Bank statement', 'I-20 form', 'Passport', 'Affidavit of support'],
    notes:
      'Must demonstrate ability to cover first year of tuition plus living expenses. Sponsor affidavit of support required if funded by a third party. No minimum holding period but recent statements preferred.',
  },
  {
    country: 'Canada',
    countryCode: 'CA',
    visaType: 'Study permit',
    minFundsUsd: 15_422,
    minBalanceDays: 0,
    requiredDocs: ['Bank statement', 'Letter of acceptance', 'Passport', 'Proof of tuition payment'],
    notes:
      'Must show CAD 20,635/year (approx. USD 15,422) for living expenses plus full tuition. GIC (Guaranteed Investment Certificate) of CAD 20,635 is an alternative proof for the Student Direct Stream.',
  },
  {
    country: 'Australia',
    countryCode: 'AU',
    visaType: 'Student visa (subclass 500)',
    minFundsUsd: 16_575,
    minBalanceDays: 0,
    requiredDocs: ['Bank statement', 'CoE (Confirmation of Enrolment)', 'Passport', 'OSHC'],
    notes:
      'Must show AUD 24,505/year (approx. USD 16,575) for living costs plus tuition and travel. Genuine Temporary Entrant (GTE) assessment applies.',
  },
  {
    country: 'Germany',
    countryCode: 'DE',
    visaType: 'Student visa',
    minFundsUsd: 12_860,
    minBalanceDays: 0,
    requiredDocs: ['Bank statement or blocked account', 'Admission letter', 'Passport', 'Health insurance'],
    notes:
      'Blocked account (Sperrkonto) of EUR 11,904/year (approx. USD 12,860) is the standard proof. Alternative: sponsor declaration (Verpflichtungserklaerung) from a German resident.',
  },
  {
    country: 'Ireland',
    countryCode: 'IE',
    visaType: 'Study visa',
    minFundsUsd: 7_000,
    minBalanceDays: 0,
    requiredDocs: ['Bank statement', 'Offer letter', 'Passport', 'Proof of fees paid'],
    notes:
      'Must show EUR 7,000 (approx. USD 7,560) immediately accessible plus evidence of tuition payment. Bank statements for the previous 6 months required.',
  },
  {
    country: 'France',
    countryCode: 'FR',
    visaType: 'Long-stay student visa (VLS-TS)',
    minFundsUsd: 8_100,
    minBalanceDays: 0,
    requiredDocs: ['Bank statement', 'Admission letter', 'Passport', 'Campus France attestation'],
    notes:
      'Must show EUR 615/month (approx. USD 8,100/year) for living costs. Campus France interview required for Nigerian students.',
  },
  {
    country: 'Netherlands',
    countryCode: 'NL',
    visaType: 'MVV + Residence permit',
    minFundsUsd: 12_350,
    minBalanceDays: 0,
    requiredDocs: ['Bank statement', 'Admission letter', 'Passport'],
    notes:
      'Must show EUR 11,400/year (approx. USD 12,350) for living expenses plus tuition. Proof can be bank statement, scholarship letter, or sponsor guarantee.',
  },
];

/** Look up requirements for a given country code (ISO 3166-1 alpha-2). */
export function getEmbassyRequirements(countryCode: string): EmbassyRequirement | undefined {
  return embassyRequirements.find((r) => r.countryCode === countryCode.toUpperCase());
}

/** Get all available country codes. */
export function getAvailableCountryCodes(): string[] {
  return embassyRequirements.map((r) => r.countryCode);
}
