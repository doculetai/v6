/**
 * Claude Vision OCR provider — extracts bank statement data via Anthropic API.
 * Ported from v5; v5 did not use Google Vision.
 * Requires ANTHROPIC_API_KEY.
 */

import Anthropic from '@anthropic-ai/sdk';
import type { StatementExtraction, TransactionRow } from '../../fraud/types';
import type { OcrInput, OcrOutput, OcrProvider } from '../types';

const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

const MODEL = 'claude-sonnet-4-5-20250929';

function getApiKey(): string {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY is not configured.');
  return key;
}

function parseDataUrlToBuffer(fileUrl: string): Buffer {
  const match = fileUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error('Invalid data URL');
  return Buffer.from(match[2], 'base64');
}

function resolveImageMediaType(
  mimeType: string,
): 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' {
  switch (mimeType) {
    case 'image/png':
      return 'image/png';
    case 'image/gif':
      return 'image/gif';
    case 'image/webp':
      return 'image/webp';
    default:
      return 'image/jpeg';
  }
}

const EXTRACTION_SYSTEM =
  `You are a bank statement analysis expert. Extract structured data from bank statement images/PDFs.

Return ONLY a valid JSON object:
{
  "accountHolder": "string",
  "accountNumber": "string",
  "bankName": "string",
  "openingBalance": number,
  "closingBalance": number,
  "totalCredits": number,
  "totalDebits": number,
  "statementPeriod": {"from": "YYYY-MM-DD", "to": "YYYY-MM-DD"},
  "currency": "string",
  "transactions": [{"date": "YYYY-MM-DD", "description": "string", "amount": number, "type": "credit"|"debit"}]
}

Rules:
- Normalize dates to YYYY-MM-DD. Strip currency symbols. Use empty string or 0 for missing values.`;

function mapStructuredToOcrOutput(parsed: Record<string, unknown>): OcrOutput['fields'] {
  const transactions = Array.isArray(parsed.transactions)
    ? (parsed.transactions as Array<Record<string, unknown>>).map((t) => ({
        date: String(t.date ?? ''),
        description: String(t.description ?? t.narration ?? ''),
        amount: typeof t.amount === 'number' ? t.amount : 0,
        type: (t.type === 'credit' ? 'credit' : 'debit') as 'credit' | 'debit',
      }))
    : [];

  const period = parsed.statementPeriod as { from?: string; to?: string } | undefined;
  const fields: Partial<StatementExtraction> = {
    accountHolder: String(parsed.accountHolder ?? '').trim() || undefined,
    accountNumber: String(parsed.accountNumber ?? '').trim() || undefined,
    bankName: String(parsed.bankName ?? '').trim() || undefined,
    openingBalance: typeof parsed.openingBalance === 'number' ? parsed.openingBalance : undefined,
    closingBalance: typeof parsed.closingBalance === 'number' ? parsed.closingBalance : undefined,
    totalCredits: typeof parsed.totalCredits === 'number' ? parsed.totalCredits : undefined,
    totalDebits: typeof parsed.totalDebits === 'number' ? parsed.totalDebits : undefined,
    statementPeriod:
      period?.from && period?.to
        ? { from: String(period.from), to: String(period.to) }
        : undefined,
    currency: String(parsed.currency ?? 'NGN').trim().toUpperCase() || 'NGN',
    transactions,
  };

  return fields;
}

function calculateConfidence(fields: Partial<StatementExtraction>): number {
  const required = [
    'accountHolder',
    'accountNumber',
    'bankName',
    'openingBalance',
    'closingBalance',
  ] as const;
  const found = required.filter((k) => {
    const v = fields[k];
    return v != null && v !== '';
  }).length;
  const fieldScore = found / required.length;
  const txnCount = fields.transactions?.length ?? 0;
  const txnScore = txnCount >= 3 ? 1 : txnCount / 3;
  return Number((fieldScore * 0.7 + txnScore * 0.3).toFixed(2));
}

export const claudeVisionProvider: OcrProvider = {
  id: 'claude-vision',
  name: 'Claude Vision',

  supportsFileType: (mimeType: string) => SUPPORTED_MIME_TYPES.includes(mimeType),

  costPerPage: 0.003,
  avgProcessingMs: 5000,

  extract: async (input: OcrInput): Promise<OcrOutput> => {
    const start = Date.now();
    getApiKey();

    const fileBuffer = parseDataUrlToBuffer(input.fileUrl);
    const base64Data = fileBuffer.toString('base64');

    const isPdf = input.mimeType === 'application/pdf';
    const contentBlocks: Anthropic.MessageCreateParams['messages'][0]['content'] = isPdf
      ? [
          { type: 'text' as const, text: 'Extract bank statement data from this PDF.' },
          {
            type: 'document' as const,
            source: {
              type: 'base64' as const,
              media_type: 'application/pdf' as const,
              data: base64Data,
            },
          },
        ]
      : [
          { type: 'text' as const, text: 'Extract bank statement data from this image.' },
          {
            type: 'image' as const,
            source: {
              type: 'base64' as const,
              media_type: resolveImageMediaType(input.mimeType),
              data: base64Data,
            },
          },
        ];

    const client = new Anthropic();

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 8192,
      system: EXTRACTION_SYSTEM,
      messages: [{ role: 'user', content: contentBlocks }],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    const text = textBlock?.type === 'text' ? textBlock.text : '';

    const jsonMatch = text.trim().match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        provider: 'claude-vision',
        confidence: 0,
        fields: {},
        transactions: [],
        processingTimeMs: Date.now() - start,
        error: 'Could not parse extraction JSON',
      };
    }

    try {
      const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
      const fields = mapStructuredToOcrOutput(parsed);
      const transactions: TransactionRow[] = (fields.transactions ?? []).map((t) => ({
        date: t.date,
        description: t.description,
        amount: t.amount,
        type: t.type,
        balance: t.balance,
      }));

      const confidence = calculateConfidence({ ...fields, transactions });

      return {
        provider: 'claude-vision',
        confidence,
        fields,
        transactions,
        rawText: text,
        processingTimeMs: Date.now() - start,
      };
    } catch (err) {
      return {
        provider: 'claude-vision',
        confidence: 0,
        fields: {},
        transactions: [],
        processingTimeMs: Date.now() - start,
        error: err instanceof Error ? err.message : 'Parse error',
      };
    }
  },
};
