/**
 * Cross-reference checker — validates account number format (NUBAN) and bank name.
 * Pure function. Nigerian NUBAN is 10 digits with a checksum algorithm.
 */

import type { CrossReferenceResult } from './types';

/** Known Nigerian bank codes (CBN-assigned, 3-digit). Subset of most common. */
const BANK_CODES: Record<string, string> = {
  '044': 'Access Bank',
  '023': 'Citibank Nigeria',
  '063': 'Diamond Bank',
  '050': 'Ecobank Nigeria',
  '084': 'Enterprise Bank',
  '070': 'Fidelity Bank',
  '011': 'First Bank of Nigeria',
  '214': 'First City Monument Bank',
  '058': 'Guaranty Trust Bank',
  '030': 'Heritage Banking Company',
  '301': 'Jaiz Bank',
  '082': 'Keystone Bank',
  '526': 'Parallex Bank',
  '076': 'Polaris Bank',
  '101': 'Providus Bank',
  '221': 'Stanbic IBTC Bank',
  '068': 'Standard Chartered',
  '232': 'Sterling Bank',
  '100': 'Suntrust Bank',
  '032': 'Union Bank of Nigeria',
  '033': 'United Bank for Africa',
  '215': 'Unity Bank',
  '035': 'Wema Bank',
  '057': 'Zenith Bank',
};

/** All known bank names (lowercase) for fuzzy matching. */
const KNOWN_BANK_NAMES = new Set(
  Object.values(BANK_CODES).map((n) => n.toLowerCase()),
);

/** NUBAN checksum weights. */
const NUBAN_WEIGHTS = [3, 7, 3, 3, 7, 3, 3, 7, 3];

/**
 * Validate NUBAN checksum.
 * NUBAN = 3-digit bank code + 9-digit serial + 1 check digit = 10-digit account number.
 * The check digit: (10 - (sum(bank_code_digits + serial_digits * weights) mod 10)) mod 10.
 */
function validateNubanChecksum(bankCode: string, accountNumber: string): boolean | null {
  if (!/^\d{3}$/.test(bankCode) || !/^\d{10}$/.test(accountNumber)) {
    return null; // Can't validate — wrong format
  }

  const combined = bankCode + accountNumber.slice(0, 9);
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(combined[i], 10) * NUBAN_WEIGHTS[i];
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(accountNumber[9], 10);
}

/** Try to find a bank code by name (fuzzy). */
function findBankCode(bankName: string): string | null {
  const lower = bankName.toLowerCase().trim();
  for (const [code, name] of Object.entries(BANK_CODES)) {
    if (lower.includes(name.toLowerCase()) || name.toLowerCase().includes(lower)) {
      return code;
    }
  }
  return null;
}

/** Cross-reference account details against known formats. Pure function. */
export function crossReferenceAccount(
  accountNumber: string,
  bankName: string,
): CrossReferenceResult {
  const details: string[] = [];

  // Check account number format (should be exactly 10 digits for Nigerian accounts)
  const accountFormatValid = /^\d{10}$/.test(accountNumber.trim());
  if (!accountFormatValid) {
    details.push(`Account number "${accountNumber}" is not 10 digits`);
  }

  // Check bank name against known list
  const bankValid = KNOWN_BANK_NAMES.has(bankName.toLowerCase().trim()) ||
    findBankCode(bankName) !== null;
  if (!bankValid) {
    details.push(`Bank "${bankName}" not recognized in known Nigerian banks`);
  }

  // NUBAN checksum validation
  let nubanChecksumValid: boolean | null = null;
  if (accountFormatValid && bankValid) {
    const bankCode = findBankCode(bankName);
    if (bankCode) {
      nubanChecksumValid = validateNubanChecksum(bankCode, accountNumber.trim());
      if (nubanChecksumValid === false) {
        details.push('NUBAN checksum failed — account number may be invalid');
      }
    } else {
      details.push('Could not determine bank code for NUBAN validation');
    }
  }

  const overallPass = accountFormatValid && bankValid && nubanChecksumValid !== false;

  return { accountFormatValid, nubanChecksumValid, bankValid, overallPass, details };
}
