/**
 * Composes all fraud checkers into a single runFraudChecks function.
 * Maps OcrOutput to FraudFlags for the risk scorer.
 */

import type { OcrOutput } from '../ocr/types';
import type { FraudFlags, StatementExtraction } from './types';
import { analyzeBalance } from './balance-analyzer';
import { checkDocumentAge } from './document-age';
import { analyzeTransactionPatterns } from './transaction-patterns';
import { checkNarrationConsistency } from './narration-consistency';

function withDefaults(fields: Partial<StatementExtraction>): StatementExtraction {
  const period = fields.statementPeriod ?? {
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    to: new Date().toISOString().slice(0, 10),
  };
  const transactions = fields.transactions ?? [];
  return {
    accountHolder: fields.accountHolder ?? '',
    accountNumber: fields.accountNumber ?? '',
    bankName: fields.bankName ?? '',
    openingBalance: fields.openingBalance ?? 0,
    closingBalance: fields.closingBalance ?? 0,
    totalCredits: fields.totalCredits ?? 0,
    totalDebits: fields.totalDebits ?? 0,
    statementPeriod: period,
    currency: fields.currency ?? 'NGN',
    transactions,
  };
}

/** Run all fraud checks on extraction. Returns FraudFlags for risk scoring. */
export async function runFraudChecksFromExtraction(extraction: OcrOutput): Promise<FraudFlags> {
  const full = withDefaults(extraction.fields);

  const balanceResult = analyzeBalance({
    openingBalance: full.openingBalance,
    closingBalance: full.closingBalance,
    totalCredits: full.totalCredits,
    totalDebits: full.totalDebits,
    statementPeriod: full.statementPeriod,
    transactions: full.transactions,
  });

  const periodEnd = full.statementPeriod?.to ?? new Date().toISOString().slice(0, 10);
  const docAgeResult = checkDocumentAge(periodEnd);

  const txPatternResult = analyzeTransactionPatterns(
    full.transactions,
    full.statementPeriod,
  );
  const narrationResult = checkNarrationConsistency(full.transactions);

  return {
    balanceEquationFailed: !balanceResult.balanceEquation.pass,
    runningBalanceFailed: !balanceResult.runningBalance.pass,
    roundNumbersFlagged: balanceResult.roundNumbers.flagged,
    suspiciousDepositsFlagged: balanceResult.suspiciousDeposits.flagged,
    missingDaysFlagged: balanceResult.missingDays.flagged,
    recentLargeDepositFlagged: balanceResult.recentLargeDeposit.flagged,
    duplicateDetected: false,
    crossStudentDuplicate: false,
    documentAgeFailed: docAgeResult.flagged,
    transactionPatternSuspicious: txPatternResult.flagged,
    balanceToIncomeSuspicious: false,
    pdfMetadataFlagged: false,
    oddHoursTransactionsFlagged: false,
    thresholdSkirtingFlagged: false,
    periodOverlapFlagged: false,
    uploadVelocityFlagged: false,
    narrationInconsistencyFlagged: narrationResult.flagged,
  };
}
