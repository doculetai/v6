// Partial mapping of Nigerian bank names (from Mono) to Paystack bank codes
const BANK_CODE_MAP: Record<string, string> = {
  'access bank': '044',
  'zenith bank': '057',
  'gtbank': '058',
  'guaranty trust bank': '058',
  'first bank': '011',
  'first bank of nigeria': '011',
  'uba': '033',
  'united bank for africa': '033',
  'stanbic ibtc': '221',
  'stanbic ibtc bank': '221',
  'union bank': '032',
  'fidelity bank': '070',
  'sterling bank': '232',
  'wema bank': '035',
  'keystone bank': '082',
  'polaris bank': '076',
  'ecobank': '050',
  'opay': '999992',
  'palmpay': '999991',
  'moniepoint': '50515',
  'kuda': '50211',
};

export function getBankCode(bankName: string): string | null {
  return BANK_CODE_MAP[bankName.toLowerCase().trim()] ?? null;
}
