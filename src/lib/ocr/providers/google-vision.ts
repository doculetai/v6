/**
 * Google Cloud Vision OCR provider — extracts text from bank statement
 * images/PDFs via the Cloud Vision API, then parses structured fields.
 */

import type { StatementExtraction, TransactionRow } from '../../fraud/types';
import type { OcrInput, OcrOutput, OcrProvider } from '../types';

const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/tiff',
];

function getApiKey(): string {
  const key = process.env.GOOGLE_VISION_API_KEY;
  if (!key) throw new Error('GOOGLE_VISION_API_KEY is not configured.');
  return key;
}

async function callVisionApi(fileUrl: string, mimeType: string): Promise<string> {
  const apiKey = getApiKey();
  const endpoint = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

  // Fetch file content and convert to base64
  const fileResponse = await fetch(fileUrl);
  if (!fileResponse.ok) throw new Error(`Failed to fetch file: ${fileResponse.status}`);
  const fileBuffer = await fileResponse.arrayBuffer();
  const base64Content = Buffer.from(fileBuffer).toString('base64');

  const isPdf = mimeType === 'application/pdf';

  const body = isPdf
    ? {
        requests: [
          {
            inputConfig: { content: base64Content, mimeType: 'application/pdf' },
            features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
          },
        ],
      }
    : {
        requests: [
          {
            image: { content: base64Content },
            features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
          },
        ],
      };

  const apiEndpoint = isPdf
    ? `https://vision.googleapis.com/v1/files:annotate?key=${apiKey}`
    : endpoint;

  const response = await fetch(apiEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Vision API error: ${response.status} — ${errorText}`);
  }

  const data = (await response.json()) as {
    responses?: Array<{
      fullTextAnnotation?: { text?: string };
      error?: { message?: string };
    }>;
  };

  const firstResponse = data.responses?.[0];
  if (firstResponse?.error) {
    throw new Error(`Vision API error: ${firstResponse.error.message}`);
  }

  return firstResponse?.fullTextAnnotation?.text ?? '';
}

/**
 * Parse raw OCR text into structured statement fields.
 * Uses regex patterns common to Nigerian bank statements.
 */
function parseStatementText(rawText: string): Partial<StatementExtraction> {
  const fields: Partial<StatementExtraction> = {};
  const lines = rawText.split('\n').map((l) => l.trim());

  // Account holder — look for patterns like "Account Name: John Doe"
  const holderMatch = rawText.match(
    /(?:account\s*(?:name|holder|owner))\s*[:\-]?\s*([A-Z][A-Za-z\s.'-]{2,40})/i,
  );
  if (holderMatch) fields.accountHolder = holderMatch[1].trim();

  // Account number — 10-digit Nigerian account number
  const acctMatch = rawText.match(
    /(?:account\s*(?:no|number|#))\s*[:\-]?\s*(\d{10})/i,
  );
  if (acctMatch) fields.accountNumber = acctMatch[1];

  // Bank name
  const bankPatterns = [
    /(?:bank\s*(?:name)?)\s*[:\-]?\s*([A-Za-z\s]{3,30}(?:bank|plc|ltd))/i,
    /((?:GT|Access|First|Zenith|UBA|Sterling|Fidelity|FCMB|Union|Wema|Stanbic|Ecobank|Polaris|Keystone|Standard\s*Chartered)[A-Za-z\s]*(?:bank|plc)?)/i,
  ];
  for (const pattern of bankPatterns) {
    const match = rawText.match(pattern);
    if (match) {
      fields.bankName = match[1].trim();
      break;
    }
  }

  // Balances — look for opening and closing balance amounts
  const openingMatch = rawText.match(
    /(?:opening|beginning|brought?\s*f(?:or)?w(?:ard)?)\s*(?:balance)?\s*[:\-]?\s*[₦NGN\s]*([0-9,]+\.?\d{0,2})/i,
  );
  if (openingMatch) fields.openingBalance = parseAmount(openingMatch[1]);

  const closingMatch = rawText.match(
    /(?:closing|ending|carried?\s*f(?:or)?w(?:ard)?)\s*(?:balance)?\s*[:\-]?\s*[₦NGN\s]*([0-9,]+\.?\d{0,2})/i,
  );
  if (closingMatch) fields.closingBalance = parseAmount(closingMatch[1]);

  // Statement period
  const periodMatch = rawText.match(
    /(?:statement\s*(?:period|date)|period|from)\s*[:\-]?\s*(\d{1,2}[\s/\-.](?:\w{3,9}|\d{1,2})[\s/\-.]\d{2,4})\s*(?:to|[-–])\s*(\d{1,2}[\s/\-.](?:\w{3,9}|\d{1,2})[\s/\-.]\d{2,4})/i,
  );
  if (periodMatch) {
    fields.statementPeriod = {
      from: periodMatch[1],
      to: periodMatch[2],
    };
  }

  fields.currency = 'NGN';

  // Transactions — simple line-by-line extraction
  fields.transactions = parseTransactions(lines);

  // Total credits/debits
  const creditMatch = rawText.match(
    /(?:total\s*(?:credit|deposit|inflow)s?)\s*[:\-]?\s*[₦NGN\s]*([0-9,]+\.?\d{0,2})/i,
  );
  if (creditMatch) fields.totalCredits = parseAmount(creditMatch[1]);

  const debitMatch = rawText.match(
    /(?:total\s*(?:debit|withdrawal|outflow)s?)\s*[:\-]?\s*[₦NGN\s]*([0-9,]+\.?\d{0,2})/i,
  );
  if (debitMatch) fields.totalDebits = parseAmount(debitMatch[1]);

  return fields;
}

function parseAmount(value: string): number {
  return Number(value.replace(/,/g, '')) || 0;
}

function parseTransactions(lines: string[]): TransactionRow[] {
  const transactions: TransactionRow[] = [];
  // Pattern: date description amount (cr/dr or +/-)
  const txnPattern =
    /^(\d{1,2}[\s/\-.](?:\w{3,9}|\d{1,2})[\s/\-.]\d{2,4})\s+(.+?)\s+([0-9,]+\.?\d{0,2})\s*(cr(?:edit)?|dr|db|debit)?/i;

  for (const line of lines) {
    const match = line.match(txnPattern);
    if (match) {
      const type =
        match[4] && /^(cr|credit)/i.test(match[4]) ? 'credit' : 'debit';
      transactions.push({
        date: match[1],
        description: match[2].trim(),
        amount: parseAmount(match[3]),
        type,
      });
    }
  }

  return transactions;
}

function calculateConfidence(fields: Partial<StatementExtraction>): number {
  const required = [
    'accountHolder',
    'accountNumber',
    'bankName',
    'openingBalance',
    'closingBalance',
  ] as const;
  const found = required.filter(
    (k) => fields[k] != null && fields[k] !== '',
  ).length;
  const fieldScore = found / required.length;
  const txnScore =
    (fields.transactions?.length ?? 0) >= 3 ? 1 : (fields.transactions?.length ?? 0) / 3;
  return Number((fieldScore * 0.7 + txnScore * 0.3).toFixed(2));
}

export const googleVisionProvider: OcrProvider = {
  id: 'google-vision',
  name: 'Google Cloud Vision',

  supportsFileType: (mimeType: string) => SUPPORTED_MIME_TYPES.includes(mimeType),

  costPerPage: 0.0015,
  avgProcessingMs: 3000,

  extract: async (input: OcrInput): Promise<OcrOutput> => {
    const start = Date.now();
    try {
      const rawText = await callVisionApi(input.fileUrl, input.mimeType);
      const fields = parseStatementText(rawText);
      const confidence = calculateConfidence(fields);

      return {
        provider: 'google-vision',
        confidence,
        fields,
        transactions: fields.transactions ?? [],
        rawText,
        processingTimeMs: Date.now() - start,
      };
    } catch (error) {
      return {
        provider: 'google-vision',
        confidence: 0,
        fields: {},
        transactions: [],
        processingTimeMs: Date.now() - start,
        error: error instanceof Error ? error.message : 'Unknown OCR error',
      };
    }
  },
};
