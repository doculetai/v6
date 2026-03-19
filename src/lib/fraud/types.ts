/** Core types for the fraud detection engine. All checkers are pure functions. */

/** A single transaction row extracted from a bank statement. */
export type TransactionRow = {
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  /** Running balance after this transaction, if available. */
  balance?: number;
};

/** Extracted fields from a bank statement OCR run. */
export type StatementExtraction = {
  accountHolder: string;
  accountNumber: string;
  bankName: string;
  openingBalance: number;
  closingBalance: number;
  totalCredits: number;
  totalDebits: number;
  statementPeriod: { from: string; to: string };
  currency: string;
  transactions: TransactionRow[];
};

/** Input to the balance analyzer. */
export type BalanceAnalysisInput = {
  openingBalance: number;
  closingBalance: number;
  totalCredits: number;
  totalDebits: number;
  transactions: TransactionRow[];
  statementPeriod: { from: string; to: string };
};

export type BalanceAnalysisResult = {
  balanceEquation: { pass: boolean; discrepancy: number };
  runningBalance: { pass: boolean; failingRowIndices: number[] };
  roundNumbers: { flagged: boolean; percentage: number };
  suspiciousDeposits: { flagged: boolean; indices: number[] };
  missingDays: { flagged: boolean; maxConsecutiveGap: number };
  recentLargeDeposit: { flagged: boolean; amount: number | null; percentOfClosing: number };
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
};

/** Result of the transaction patterns analysis. */
export type TransactionPatternResult = {
  score: number;
  flagged: boolean;
  details: {
    narrationQuality: number;
    amountVariety: number;
    frequency: number;
    temporalSpread: number;
  };
};

/** Result of cross-referencing account details against known formats. */
export type CrossReferenceResult = {
  accountFormatValid: boolean;
  nubanChecksumValid: boolean | null;
  bankValid: boolean;
  overallPass: boolean;
  details: string[];
};

/** Flags fed into the risk scorer from all fraud checks. */
export type FraudFlags = {
  balanceEquationFailed: boolean;
  runningBalanceFailed: boolean;
  roundNumbersFlagged: boolean;
  suspiciousDepositsFlagged: boolean;
  missingDaysFlagged: boolean;
  recentLargeDepositFlagged: boolean;
  duplicateDetected: boolean;
  crossStudentDuplicate: boolean;
  documentAgeFailed: boolean;
  transactionPatternSuspicious: boolean;
  balanceToIncomeSuspicious: boolean;
  pdfMetadataFlagged: boolean;
  oddHoursTransactionsFlagged: boolean;
  thresholdSkirtingFlagged: boolean;
  periodOverlapFlagged: boolean;
  uploadVelocityFlagged: boolean;
  narrationInconsistencyFlagged: boolean;
};

export type RiskCategory = 'low' | 'medium' | 'high' | 'critical';
export type AutoDecision = 'approve' | 'review' | 'reject';

export type RiskScore = {
  score: number;
  category: RiskCategory;
  decision: AutoDecision;
  breakdown: {
    confidencePenalty: number;
    fraudPenalty: number;
    agreementPenalty: number;
  };
};

/** Multi-provider consensus result. */
export type ConsensusResult = {
  agreed: boolean;
  compositeConfidence: number;
  criticalDisagreements: number;
  fieldConfidences: Record<string, number>;
  decision: AutoDecision;
};

/** Provider extraction with confidence. */
export type ProviderExtraction = {
  provider: string;
  confidence: number;
  fields: Partial<StatementExtraction>;
  processingTimeMs: number;
};
