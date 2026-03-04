import { desc, eq } from 'drizzle-orm';

import type { DrizzleDB } from '@/db';
import { disbursements, sponsorships, webhookEvents } from '@/db/schema';
import type {
  SponsorTransaction,
  SponsorTransactionSource,
  SponsorTransactionStatus,
  SponsorTransactionSummary,
  SponsorTransactionType,
} from '@/types/sponsor-transactions';

const PAYSTACK_LIMIT = 300;

type WebhookStatus = (typeof webhookEvents.$inferSelect)['status'];
type DisbursementStatus = (typeof disbursements.$inferSelect)['status'];
type DisbursementTransactionRow = {
  id: string;
  amountKobo: number;
  scheduledAt: Date;
  disbursedAt: Date | null;
  status: DisbursementStatus;
  paystackReference: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const sponsorIdPaths: ReadonlyArray<ReadonlyArray<string>> = [
  ['sponsorId'],
  ['sponsor_id'],
  ['metadata', 'sponsorId'],
  ['metadata', 'sponsor_id'],
  ['metadata', 'userId'],
  ['metadata', 'user_id'],
  ['data', 'sponsorId'],
  ['data', 'sponsor_id'],
  ['data', 'metadata', 'sponsorId'],
  ['data', 'metadata', 'sponsor_id'],
  ['data', 'metadata', 'userId'],
  ['data', 'metadata', 'user_id'],
  ['data', 'customer', 'metadata', 'sponsorId'],
  ['data', 'customer', 'metadata', 'sponsor_id'],
];

const amountPaths: ReadonlyArray<ReadonlyArray<string>> = [
  ['data', 'amount'],
  ['amount'],
  ['data', 'requested_amount'],
  ['requested_amount'],
];

const feePaths: ReadonlyArray<ReadonlyArray<string>> = [
  ['data', 'fees'],
  ['fees'],
  ['data', 'fee'],
  ['fee'],
];

const referencePaths: ReadonlyArray<ReadonlyArray<string>> = [
  ['data', 'reference'],
  ['reference'],
  ['eventId'],
  ['data', 'id'],
  ['id'],
];

const currencyPaths: ReadonlyArray<ReadonlyArray<string>> = [
  ['data', 'currency'],
  ['currency'],
];

const timestampPaths: ReadonlyArray<ReadonlyArray<string>> = [
  ['data', 'paid_at'],
  ['data', 'created_at'],
  ['paid_at'],
  ['created_at'],
];

function toIsoString(value: Date | string | number | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function getPathValue(source: unknown, path: ReadonlyArray<string>): unknown {
  let current: unknown = source;

  for (const key of path) {
    const record = asRecord(current);
    if (!record) {
      return null;
    }

    current = record[key];
  }

  return current;
}

function getFirstString(source: unknown, paths: ReadonlyArray<ReadonlyArray<string>>): string | null {
  for (const path of paths) {
    const value = getPathValue(source, path);

    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

function toInteger(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.round(value));
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const normalized = Number(value);
    if (Number.isFinite(normalized)) {
      return Math.max(0, Math.round(normalized));
    }
  }

  return null;
}

function getFirstInteger(source: unknown, paths: ReadonlyArray<ReadonlyArray<string>>): number | null {
  for (const path of paths) {
    const value = getPathValue(source, path);
    const parsed = toInteger(value);

    if (parsed !== null) {
      return parsed;
    }
  }

  return null;
}

function mapDisbursementStatus(status: DisbursementStatus): SponsorTransactionStatus {
  if (status === 'disbursed') {
    return 'successful';
  }

  if (status === 'failed') {
    return 'failed';
  }

  return 'pending';
}

function mapDisbursementToTransaction(row: DisbursementTransactionRow): SponsorTransaction {
  const createdAt = toIsoString(row.disbursedAt ?? row.scheduledAt ?? row.createdAt) ?? new Date().toISOString();

  return {
    id: `disbursement_${row.id}`,
    type: 'debit',
    status: mapDisbursementStatus(row.status),
    source: 'disbursement',
    amountKobo: Math.max(0, row.amountKobo),
    currency: 'NGN',
    reference: row.paystackReference ?? row.id,
    description: null,
    createdAt,
  };
}

function deriveTransactionType(eventType: string): SponsorTransactionType {
  const normalized = eventType.toLowerCase();

  if (normalized.includes('refund')) {
    return 'refund';
  }

  if (normalized.includes('fee')) {
    return 'fee';
  }

  if (normalized.includes('charge') || normalized.includes('debit') || normalized.includes('transfer')) {
    return 'debit';
  }

  return 'credit';
}

function deriveTransactionSource(type: SponsorTransactionType): SponsorTransactionSource {
  if (type === 'debit') {
    return 'paystack_charge';
  }

  if (type === 'fee') {
    return 'paystack_fee';
  }

  if (type === 'refund') {
    return 'paystack_refund';
  }

  return 'paystack_credit';
}

function deriveTransactionStatus(
  eventType: string,
  payload: unknown,
  webhookStatus: WebhookStatus,
): SponsorTransactionStatus {
  const normalizedEvent = eventType.toLowerCase();
  const statusFromPayload = getFirstString(payload, [
    ['data', 'status'],
    ['status'],
    ['data', 'gateway_response'],
  ])?.toLowerCase();

  if (normalizedEvent.includes('refund')) {
    return 'refunded';
  }

  if (statusFromPayload?.includes('refund')) {
    return 'refunded';
  }

  if (
    statusFromPayload?.includes('success') ||
    statusFromPayload?.includes('completed') ||
    statusFromPayload?.includes('paid') ||
    statusFromPayload?.includes('disbursed')
  ) {
    return 'successful';
  }

  if (
    statusFromPayload?.includes('failed') ||
    statusFromPayload?.includes('error') ||
    statusFromPayload?.includes('abandon')
  ) {
    return 'failed';
  }

  if (webhookStatus === 'processed') {
    return 'successful';
  }

  if (webhookStatus === 'failed') {
    return 'failed';
  }

  return 'pending';
}

function mapWebhookToTransaction(
  event: typeof webhookEvents.$inferSelect,
  sponsorUserId: string,
): SponsorTransaction | null {
  const payload = event.payloadJson;
  const sponsorId = getFirstString(payload, sponsorIdPaths);

  if (sponsorId !== sponsorUserId) {
    return null;
  }

  const type = deriveTransactionType(event.eventType);
  const amountKobo =
    type === 'fee'
      ? getFirstInteger(payload, feePaths) ?? getFirstInteger(payload, amountPaths)
      : getFirstInteger(payload, amountPaths);

  if (amountKobo === null) {
    return null;
  }

  const reference = getFirstString(payload, referencePaths) ?? event.eventId;
  const currency = (getFirstString(payload, currencyPaths) ?? 'NGN').toUpperCase().slice(0, 3);
  const createdAt =
    toIsoString(getFirstString(payload, timestampPaths) ?? event.createdAt) ??
    new Date().toISOString();

  return {
    id: `paystack_${event.id}`,
    type,
    status: deriveTransactionStatus(event.eventType, payload, event.status),
    source: deriveTransactionSource(type),
    amountKobo,
    currency,
    reference,
    description: null,
    createdAt,
  };
}

function sortByNewest(transactions: readonly SponsorTransaction[]): SponsorTransaction[] {
  return [...transactions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function summarizeTransactions(transactions: readonly SponsorTransaction[]): SponsorTransactionSummary {
  let totalSpentKobo = 0;
  let totalPendingKobo = 0;

  for (const transaction of transactions) {
    const isOutflow = transaction.type === 'debit' || transaction.type === 'fee';

    if (isOutflow && transaction.status === 'successful') {
      totalSpentKobo += transaction.amountKobo;
      continue;
    }

    if (isOutflow && transaction.status === 'pending') {
      totalPendingKobo += transaction.amountKobo;
    }
  }

  return {
    totalSpentKobo,
    totalPendingKobo,
    updatedAt: new Date().toISOString(),
  };
}

async function getSponsorTransactions(
  db: DrizzleDB,
  sponsorUserId: string,
): Promise<SponsorTransaction[]> {
  const [disbursementRows, paystackRows] = await Promise.all([
    db
      .select({
        id: disbursements.id,
        amountKobo: disbursements.amountKobo,
        scheduledAt: disbursements.scheduledAt,
        disbursedAt: disbursements.disbursedAt,
        status: disbursements.status,
        paystackReference: disbursements.paystackReference,
        createdAt: disbursements.createdAt,
        updatedAt: disbursements.updatedAt,
      })
      .from(disbursements)
      .innerJoin(sponsorships, eq(disbursements.sponsorshipId, sponsorships.id))
      .where(eq(sponsorships.sponsorId, sponsorUserId))
      .orderBy(desc(disbursements.createdAt)),
    db.query.webhookEvents.findMany({
      where: (table) => eq(table.provider, 'paystack'),
      orderBy: (table, operators) => [operators.desc(table.createdAt)],
      limit: PAYSTACK_LIMIT,
    }),
  ]);

  const disbursementTransactions = disbursementRows.map((row) => mapDisbursementToTransaction(row));

  const paystackTransactions = paystackRows
    .map((event) => mapWebhookToTransaction(event, sponsorUserId))
    .filter((transaction): transaction is SponsorTransaction => Boolean(transaction));

  return sortByNewest([...disbursementTransactions, ...paystackTransactions]);
}

async function getSponsorTransactionSummary(
  db: DrizzleDB,
  sponsorUserId: string,
): Promise<SponsorTransactionSummary> {
  const transactions = await getSponsorTransactions(db, sponsorUserId);
  return summarizeTransactions(transactions);
}

export { getSponsorTransactions, getSponsorTransactionSummary, summarizeTransactions };
