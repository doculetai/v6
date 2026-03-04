# Commercial Beta Launch — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Wire real Dojah KYC, Mono bank verification, and Paystack disbursements; add error boundaries, emails, agent referral URL, and a minimal landing page — making Doculet ready for a closed paid beta.

**Architecture:** Three parallel tracks (Track A: Identity, Track B: Payments, Track C: Polish) each implemented via sequential tasks. Tracks A and B are independent and can be dispatched to separate subagents simultaneously. Track C tasks are also mostly independent.

**Tech Stack:** Next.js 16 App Router, tRPC v11, Drizzle ORM, Supabase PostgreSQL, Resend (email), Dojah (KYC), Mono (bank), Paystack (payments), Tailwind CSS 4, shadcn/ui.

**Key file conventions:**
- tRPC server procedures: `src/server/routers/[router].ts`
- DB schema: `src/db/schema/[table].ts` — add columns then run `npx drizzle-kit push`
- DB queries: `src/db/queries/[domain].ts`
- Webhook route handlers: `src/app/api/webhooks/[provider]/route.ts`
- Email functions: `src/lib/email/send-[name]-email.ts`
- Email templates: `src/lib/email/templates/[name]-email.tsx`
- Copy strings: `src/config/copy/[role].ts` — never hardcode in JSX
- Page client components: `src/app/dashboard/[role]/[page]/[page]-page-client.tsx`
- Environment variables: read via `process.env.VAR_NAME` — never import from a config object

---

## TRACK A — Identity

---

### Task A1: Wire real Dojah API call in `startDojahIdentityCheck`

**Context:** `src/server/routers/student-verification.procedures.ts` line ~135 creates a fake UUID instead of calling Dojah. We need to call the real Dojah REST API synchronously, store the real `referenceId` Dojah returns, and keep the record in `pending` status until the webhook confirms.

**Dojah API details:**
- BVN: `GET https://api.dojah.io/api/v1/kyc/bvn?bvn={number}`
- NIN: `GET https://api.dojah.io/api/v1/kyc/nin?nin={number}`
- Passport: `GET https://api.dojah.io/api/v1/kyc/passport?passport={number}&country=NG`
- Headers: `AppId: process.env.DOJAH_APP_ID`, `Authorization: process.env.DOJAH_PRIVATE_KEY`
- Response on success: `{ entity: { reference_id: "dojah-xxx" } }`
- Response on failure: `{ error: "message" }` with non-2xx status

**Files:**
- Modify: `src/server/routers/student-verification.procedures.ts` (the `startDojahIdentityCheck` mutation, ~line 130)

**Step 1: Add the Dojah API call helper**

Add this function directly above the `verificationProcedures` export in `student-verification.procedures.ts`:

```typescript
async function callDojahKyc(
  identityType: 'bvn' | 'nin' | 'passport',
  identityNumber: string,
): Promise<string> {
  const appId = process.env.DOJAH_APP_ID;
  const privateKey = process.env.DOJAH_PRIVATE_KEY;

  if (!appId || !privateKey) {
    throw new Error('Missing DOJAH_APP_ID or DOJAH_PRIVATE_KEY');
  }

  const queryParam = identityType === 'passport' ? 'passport' : identityType;
  const url =
    identityType === 'passport'
      ? `https://api.dojah.io/api/v1/kyc/passport?passport=${identityNumber}&country=NG`
      : `https://api.dojah.io/api/v1/kyc/${identityType}?${queryParam}=${identityNumber}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      AppId: appId,
      Authorization: privateKey,
      Accept: 'application/json',
    },
  });

  const body = (await response.json()) as {
    entity?: { reference_id?: string };
    error?: string;
  };

  if (!response.ok || body.error) {
    throw new Error(body.error ?? `Dojah API error: ${response.status}`);
  }

  const referenceId = body.entity?.reference_id;
  if (!referenceId) {
    throw new Error('Dojah returned no reference_id');
  }

  return referenceId;
}
```

**Step 2: Replace the fake UUID in `startDojahIdentityCheck` mutation**

Replace the existing mutation body (lines ~133–148) with:

```typescript
startDojahIdentityCheck: roleProcedure('student')
  .input(startDojahIdentityCheckInputSchema)
  .output(startDojahIdentityCheckOutputSchema)
  .mutation(async ({ ctx, input }) => {
    try {
      const referenceId = await callDojahKyc(input.identityType, input.identityNumber);

      const record = await startDojahIdentityCheck(ctx.db, {
        userId: ctx.user.id,
        tier: input.tier,
        referenceId,
      });

      return { referenceId: record.referenceId, tier: input.tier, status: 'pending' };
    } catch (error) {
      captureException(error, {
        tags: { router: 'student', procedure: 'startDojahIdentityCheck', role: 'student' },
        extra: { tier: input.tier, identityType: input.identityType },
      });

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Unable to start identity verification. Check your details and try again.',
      });
    }
  }),
```

**Step 3: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 4: Commit**

```bash
git add src/server/routers/student-verification.procedures.ts
git commit -m "feat(kyc): wire real Dojah API call in startDojahIdentityCheck"
```

---

### Task A2: Dojah webhook handler

**Context:** Dojah sends an async POST to our webhook URL when identity verification completes. We need to receive it, verify the HMAC signature, and update the `kyc_verifications` record from `pending` to `verified` or `failed`. Also update `student_profiles.kycStatus`.

**Dojah webhook details:**
- Dojah sends `X-Dojah-Signature` header = HMAC-SHA512 of raw request body using `DOJAH_WEBHOOK_SECRET`
- Payload example:
  ```json
  {
    "event": "kyc.bvn.lookup",
    "data": {
      "reference_id": "dojah-xxx",
      "status": "successful"
    }
  }
  ```
- `status` values: `"successful"` = verified, `"failed"` = failed

**Files:**
- Create: `src/app/api/webhooks/dojah/route.ts`
- Create: `src/db/queries/dojah-webhook.ts`

**Step 1: Create the DB query helper**

Create `src/db/queries/dojah-webhook.ts`:

```typescript
import { eq } from 'drizzle-orm';

import type { DbClient } from '@/db';
import { kycVerifications, studentProfiles } from '@/db/schema';

export async function processDojahWebhook(
  db: DbClient,
  referenceId: string,
  status: 'verified' | 'failed',
): Promise<void> {
  const [record] = await db
    .select()
    .from(kycVerifications)
    .where(eq(kycVerifications.referenceId, referenceId))
    .limit(1);

  if (!record) return; // idempotent — unknown reference, ignore

  if (record.status !== 'pending') return; // already processed

  await db
    .update(kycVerifications)
    .set({
      status,
      verifiedAt: status === 'verified' ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(kycVerifications.id, record.id));

  // Sync student profile kycStatus
  await db
    .update(studentProfiles)
    .set({
      kycStatus: status === 'verified' ? 'verified' : 'failed',
      updatedAt: new Date(),
    })
    .where(eq(studentProfiles.userId, record.userId));
}
```

**Step 2: Check how DbClient type is exported**

Run: `grep -r "export type DbClient\|export.*DbClient" src/db/`

Use whatever type is exported (likely `typeof db` or a named export from `src/db/index.ts`).

**Step 3: Create the webhook route handler**

Create `src/app/api/webhooks/dojah/route.ts`:

```typescript
import { captureException } from '@sentry/nextjs';
import { createHmac } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/db';
import { processDojahWebhook } from '@/db/queries/dojah-webhook';

function verifyDojahSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.DOJAH_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = createHmac('sha512', secret).update(rawBody).digest('hex');
  return expected === signature;
}

type DojahWebhookPayload = {
  event?: string;
  data?: {
    reference_id?: string;
    status?: string;
  };
};

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-dojah-signature') ?? '';

  if (!verifyDojahSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: DojahWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as DojahWebhookPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const referenceId = payload.data?.reference_id;
  const rawStatus = payload.data?.status;

  if (!referenceId || !rawStatus) {
    return NextResponse.json({ received: true }); // ignore unrecognised events
  }

  const status = rawStatus === 'successful' ? 'verified' : 'failed';

  try {
    await processDojahWebhook(db, referenceId, status);
  } catch (error) {
    captureException(error, { tags: { webhook: 'dojah' } });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
```

**Step 4: Check DbClient import path**

Open `src/db/index.ts` and confirm the export. Adjust the import in `dojah-webhook.ts` and `route.ts` if the path differs.

**Step 5: Run TypeScript check**

```bash
npx tsc --noEmit
```

**Step 6: Commit**

```bash
git add src/app/api/webhooks/dojah/route.ts src/db/queries/dojah-webhook.ts
git commit -m "feat(kyc): add Dojah webhook handler with HMAC verification"
```

---

### Task A3: Wire real Mono bank account verification

**Context:** `connectMonoBankAccount` in `student-verification.procedures.ts` currently accepts any `monoAccountId` string without calling Mono. We need to exchange the `code` returned by the Mono widget for a real account ID, then verify account details.

**Mono API details:**
- Exchange code: `POST https://api.withmono.com/v2/accounts/auth` body: `{ "code": "{mono_code}" }` — Header: `mono-sec-key: process.env.MONO_SECRET_KEY` — Returns: `{ "id": "accountId" }`
- Get account: `GET https://api.withmono.com/v2/accounts/{accountId}` — Returns: `{ "account": { "name": "...", "accountNumber": "...", "institution": { "name": "..." } } }`

**Note:** The current UI sends `monoAccountId` (the code from the Mono widget) to the backend. We'll treat the incoming `monoAccountId` as the Mono `code` and exchange it for a real account ID internally.

**Files:**
- Modify: `src/server/routers/student-verification.procedures.ts` (the `connectMonoBankAccount` mutation)

**Step 1: Add Mono API helper**

Add above `verificationProcedures` in `student-verification.procedures.ts`:

```typescript
type MonoAccountDetails = {
  monoAccountId: string;
  accountNumber: string;
  bankName: string;
};

async function exchangeMonoCodeAndVerify(monoCode: string): Promise<MonoAccountDetails> {
  const secretKey = process.env.MONO_SECRET_KEY;
  if (!secretKey) throw new Error('Missing MONO_SECRET_KEY');

  // Step 1: exchange code for account ID
  const authRes = await fetch('https://api.withmono.com/v2/accounts/auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'mono-sec-key': secretKey,
    },
    body: JSON.stringify({ code: monoCode }),
  });

  const authBody = (await authRes.json()) as { id?: string; message?: string };
  if (!authRes.ok || !authBody.id) {
    throw new Error(authBody.message ?? 'Mono auth exchange failed');
  }

  const accountId = authBody.id;

  // Step 2: get account details
  const accountRes = await fetch(`https://api.withmono.com/v2/accounts/${accountId}`, {
    headers: { 'mono-sec-key': secretKey },
  });

  const accountBody = (await accountRes.json()) as {
    account?: { name?: string; accountNumber?: string; institution?: { name?: string } };
    message?: string;
  };

  if (!accountRes.ok || !accountBody.account) {
    throw new Error(accountBody.message ?? 'Mono account fetch failed');
  }

  const account = accountBody.account;

  return {
    monoAccountId: accountId,
    accountNumber: account.accountNumber ?? '',
    bankName: account.institution?.name ?? account.name ?? 'Unknown Bank',
  };
}
```

**Step 2: Replace `connectMonoBankAccount` mutation body**

Replace the mutation body to use the helper:

```typescript
connectMonoBankAccount: roleProcedure('student')
  .input(connectMonoBankAccountInputSchema)
  .output(connectMonoBankAccountOutputSchema)
  .mutation(async ({ ctx, input }) => {
    try {
      // input.monoAccountId is the code from the Mono widget
      const verified = await exchangeMonoCodeAndVerify(input.monoAccountId);

      const linkedAccount = await connectMonoAccount(ctx.db, {
        userId: ctx.user.id,
        monoAccountId: verified.monoAccountId,
        bankName: verified.bankName,
        accountNumber: verified.accountNumber,
      });

      return {
        bankName: linkedAccount.bankName,
        accountNumberMasked: `****${linkedAccount.accountNumber.slice(-4)}`,
        monoAccountId: linkedAccount.monoAccountId,
        linkedAt: linkedAccount.linkedAt,
      };
    } catch (error) {
      captureException(error, {
        tags: { router: 'student', procedure: 'connectMonoBankAccount', role: 'student' },
      });

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Unable to connect bank account. Please try again.',
      });
    }
  }),
```

**Step 3: Run TypeScript check**

```bash
npx tsc --noEmit
```

**Step 4: Commit**

```bash
git add src/server/routers/student-verification.procedures.ts
git commit -m "feat(kyc): wire real Mono account verification on bank link"
```

---

### Task A4: Unlock KYC Tier 2 and Tier 3 buttons

**Context:** `src/app/dashboard/[role]/kyc/kyc-page-client.tsx` has Tier 2 (line ~136) and Tier 3 (line ~164) buttons hardcoded as `disabled` with "Coming soon" text. These need to open a form/modal for identity number input and call `trpc.student.startDojahIdentityCheck`.

**Files:**
- Modify: `src/app/dashboard/[role]/kyc/kyc-page-client.tsx`

**Step 1: Read the full file first**

```bash
cat src/app/dashboard/\[role\]/kyc/kyc-page-client.tsx
```

Identify:
- Where `comingSoon` string is used
- The component's existing props interface
- Whether it already imports tRPC client

**Step 2: Add identity check form state and mutation**

At the top of the `KycTierCard` component (or create a new `StartKycModal` component), add:

```typescript
const [showForm, setShowForm] = useState(false);
const [identityType, setIdentityType] = useState<'bvn' | 'nin' | 'passport'>('bvn');
const [identityNumber, setIdentityNumber] = useState('');
const [error, setError] = useState<string | null>(null);

const startCheck = trpc.student.startDojahIdentityCheck.useMutation({
  onSuccess: () => {
    setShowForm(false);
    // The parent will refetch via router.refresh() or invalidate
  },
  onError: (err) => {
    setError(err.message);
  },
});
```

**Step 3: Replace the disabled button sections**

For both Tier 2 and Tier 3 sections, replace:
```tsx
<Button size="sm" disabled title={comingSoon} className="min-h-9">
  {startCta}
</Button>
<p className="mt-1.5 text-xs text-muted-foreground">{comingSoon}</p>
```

With:
```tsx
{showForm ? (
  <div className="mt-3 space-y-3">
    <select
      value={identityType}
      onChange={(e) => setIdentityType(e.target.value as 'bvn' | 'nin' | 'passport')}
      className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
    >
      <option value="bvn">BVN</option>
      <option value="nin">NIN</option>
      <option value="passport">International Passport</option>
    </select>
    <input
      type="text"
      value={identityNumber}
      onChange={(e) => setIdentityNumber(e.target.value)}
      placeholder={identityType === 'bvn' ? '11-digit BVN' : identityType === 'nin' ? 'NIN' : 'Passport number'}
      className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
    />
    {error ? <p className="text-sm text-destructive">{error}</p> : null}
    <div className="flex gap-2">
      <Button
        size="sm"
        className="min-h-9"
        disabled={startCheck.isPending || identityNumber.length < 6}
        onClick={() => {
          setError(null);
          startCheck.mutate({ tier: tierIndex === 1 ? 2 : 3, identityType, identityNumber });
        }}
      >
        {startCheck.isPending ? 'Submitting…' : 'Submit'}
      </Button>
      <Button size="sm" variant="outline" className="min-h-9" onClick={() => setShowForm(false)}>
        Cancel
      </Button>
    </div>
  </div>
) : (
  <Button
    size="sm"
    className={cn('min-h-9', isFailed && 'mt-1')}
    onClick={() => { setError(null); setShowForm(true); }}
  >
    {isFailed ? retryLabel : startCta}
  </Button>
)}
```

**Step 4: Import trpc client at top of file**

```typescript
import { trpc } from '@/trpc/client';
```

**Step 5: Run TypeScript check**

```bash
npx tsc --noEmit
```

**Step 6: Commit**

```bash
git add src/app/dashboard/\[role\]/kyc/kyc-page-client.tsx
git commit -m "feat(kyc): unlock Tier 2 and Tier 3 KYC buttons with identity form"
```

---

## TRACK B — Payments

---

### Task B1: Add `paystackRecipientCode` to `bankAccounts` schema

**Context:** Before Paystack can transfer funds to a student, we need a Paystack Transfer Recipient code linked to their bank account. We'll add this as a nullable column to `bank_accounts`.

**Files:**
- Modify: `src/db/schema/students.ts` (add column to `bankAccounts`)

**Step 1: Add the column**

In `bankAccounts` pgTable definition in `src/db/schema/students.ts`, add after `monoAccountId`:

```typescript
paystackRecipientCode: text('paystack_recipient_code'),
```

**Step 2: Push schema to database**

```bash
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54402/postgres" npx drizzle-kit push
```

Expected: `[✓] Changes applied`

**Step 3: Commit**

```bash
git add src/db/schema/students.ts
git commit -m "feat(payments): add paystackRecipientCode column to bank_accounts"
```

---

### Task B2: Create Paystack recipient after bank link

**Context:** When a student successfully links their bank account (Mono), we should immediately create a Paystack Transfer Recipient so the sponsor can pay them later. Add this call inside `connectMonoBankAccount` after the `connectMonoAccount` DB write.

**Paystack Recipient API:**
- `POST https://api.paystack.co/transferrecipient`
- Headers: `Authorization: Bearer process.env.PAYSTACK_SECRET_KEY`
- Body: `{ "type": "nuban", "name": accountHolderName, "account_number": accountNumber, "bank_code": bankCode, "currency": "NGN" }`
- Returns: `{ "data": { "recipient_code": "RCP_xxx" } }`

**Problem:** Paystack needs a `bank_code` (e.g. `"044"` for Access Bank), but Mono returns a bank name string. We need a mapping. Add a minimal mapping of the 10 most common Nigerian banks.

**Files:**
- Create: `src/lib/paystack/bank-codes.ts`
- Create: `src/lib/paystack/create-recipient.ts`
- Modify: `src/server/routers/student-verification.procedures.ts` (call after DB save in `connectMonoBankAccount`)
- Create: `src/db/queries/update-bank-recipient.ts`

**Step 1: Create bank code mapping**

Create `src/lib/paystack/bank-codes.ts`:

```typescript
// Partial mapping of Nigerian bank names (from Mono) to Paystack bank codes
// Full list: https://api.paystack.co/bank?currency=NGN
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
```

**Step 2: Create Paystack recipient helper**

Create `src/lib/paystack/create-recipient.ts`:

```typescript
type CreateRecipientParams = {
  name: string;
  accountNumber: string;
  bankName: string;
};

type CreateRecipientResult =
  | { success: true; recipientCode: string }
  | { success: false; error: string };

export async function createPaystackRecipient(
  params: CreateRecipientParams,
): Promise<CreateRecipientResult> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) return { success: false, error: 'Missing PAYSTACK_SECRET_KEY' };

  const { getBankCode } = await import('./bank-codes');
  const bankCode = getBankCode(params.bankName);

  if (!bankCode) {
    // Log unknown bank but don't block the bank link — recipient can be created later
    return { success: false, error: `Unknown bank code for: ${params.bankName}` };
  }

  const res = await fetch('https://api.paystack.co/transferrecipient', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'nuban',
      name: params.name,
      account_number: params.accountNumber,
      bank_code: bankCode,
      currency: 'NGN',
    }),
  });

  const body = (await res.json()) as {
    status?: boolean;
    data?: { recipient_code?: string };
    message?: string;
  };

  if (!res.ok || !body.data?.recipient_code) {
    return { success: false, error: body.message ?? 'Paystack recipient creation failed' };
  }

  return { success: true, recipientCode: body.data.recipient_code };
}
```

**Step 3: Create DB query to update recipient code**

Create `src/db/queries/update-bank-recipient.ts`:

```typescript
import { eq } from 'drizzle-orm';

import type { DbClient } from '@/db';
import { bankAccounts } from '@/db/schema';

export async function updateBankRecipientCode(
  db: DbClient,
  monoAccountId: string,
  recipientCode: string,
): Promise<void> {
  await db
    .update(bankAccounts)
    .set({ paystackRecipientCode: recipientCode, updatedAt: new Date() })
    .where(eq(bankAccounts.monoAccountId, monoAccountId));
}
```

**Step 4: Call recipient creation after bank link in `connectMonoBankAccount`**

In `student-verification.procedures.ts`, after the `const linkedAccount = await connectMonoAccount(...)` line, add:

```typescript
// Fire-and-forget: create Paystack recipient (non-blocking, failures are logged)
createPaystackRecipient({
  name: verified.bankName,
  accountNumber: verified.accountNumber,
  bankName: verified.bankName,
}).then(async (result) => {
  if (result.success) {
    await updateBankRecipientCode(ctx.db, verified.monoAccountId, result.recipientCode);
  } else {
    captureException(new Error(`Paystack recipient creation failed: ${result.error}`), {
      tags: { domain: 'payments', operation: 'create-recipient' },
    });
  }
}).catch((err: unknown) => captureException(err));
```

Import at top of file:
```typescript
import { createPaystackRecipient } from '@/lib/paystack/create-recipient';
import { updateBankRecipientCode } from '@/db/queries/update-bank-recipient';
```

**Step 5: Run TypeScript check**

```bash
npx tsc --noEmit
```

**Step 6: Commit**

```bash
git add src/lib/paystack/ src/db/queries/update-bank-recipient.ts src/server/routers/student-verification.procedures.ts
git commit -m "feat(payments): create Paystack transfer recipient on bank account link"
```

---

### Task B3: Add `initiateDisbursement` tRPC procedure

**Context:** Sponsors need to trigger actual fund transfers. Add a `initiateDisbursement` mutation to the sponsor router that looks up the student's `paystackRecipientCode`, calls Paystack Transfer API, and updates the disbursement record to `processing`.

**Paystack Transfer API:**
- `POST https://api.paystack.co/transfer`
- Headers: `Authorization: Bearer PAYSTACK_SECRET_KEY`
- Body: `{ "source": "balance", "amount": amountKobo, "recipient": recipientCode, "reference": uniqueRef, "reason": "Doculet sponsorship disbursement" }`
- Returns: `{ "data": { "transfer_code": "TRF_xxx", "status": "otp" | "pending" } }`

**Files:**
- Create: `src/lib/paystack/initiate-transfer.ts`
- Modify: `src/server/routers/sponsor.ts` (add `initiateDisbursement` mutation)

**Step 1: Create transfer helper**

Create `src/lib/paystack/initiate-transfer.ts`:

```typescript
type InitiateTransferResult =
  | { success: true; transferCode: string; paystackReference: string }
  | { success: false; error: string };

export async function initiatePaystackTransfer(params: {
  amountKobo: number;
  recipientCode: string;
  reference: string;
}): Promise<InitiateTransferResult> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) return { success: false, error: 'Missing PAYSTACK_SECRET_KEY' };

  const res = await fetch('https://api.paystack.co/transfer', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source: 'balance',
      amount: params.amountKobo,
      recipient: params.recipientCode,
      reference: params.reference,
      reason: 'Doculet sponsorship disbursement',
    }),
  });

  const body = (await res.json()) as {
    status?: boolean;
    data?: { transfer_code?: string; reference?: string };
    message?: string;
  };

  if (!res.ok || !body.data?.transfer_code) {
    return { success: false, error: body.message ?? 'Paystack transfer failed' };
  }

  return {
    success: true,
    transferCode: body.data.transfer_code,
    paystackReference: body.data.reference ?? params.reference,
  };
}
```

**Step 2: Add mutation to sponsor router**

In `src/server/routers/sponsor.ts`, add this to the `sponsorRouter` object:

```typescript
initiateDisbursement: roleProcedure('sponsor')
  .input(z.object({ disbursementId: z.string().uuid() }))
  .output(z.object({ status: z.literal('processing'), paystackReference: z.string() }))
  .mutation(async ({ ctx, input }) => {
    // 1. Load disbursement and verify it belongs to this sponsor
    const [disbursement] = await ctx.db
      .select({
        id: disbursements.id,
        amountKobo: disbursements.amountKobo,
        status: disbursements.status,
        sponsorship: {
          sponsorId: sponsorships.sponsorId,
          studentId: sponsorships.studentId,
        },
      })
      .from(disbursements)
      .innerJoin(sponsorships, eq(disbursements.sponsorshipId, sponsorships.id))
      .where(eq(disbursements.id, input.disbursementId))
      .limit(1);

    if (!disbursement) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Disbursement not found.' });
    }
    if (disbursement.sponsorship.sponsorId !== ctx.user.id) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Not your disbursement.' });
    }
    if (disbursement.status !== 'scheduled') {
      throw new TRPCError({ code: 'PRECONDITION_FAILED', message: 'Disbursement is not in scheduled state.' });
    }

    // 2. Get student's Paystack recipient code
    const [bankAccount] = await ctx.db
      .select({ paystackRecipientCode: bankAccounts.paystackRecipientCode })
      .from(bankAccounts)
      .where(eq(bankAccounts.userId, disbursement.sponsorship.studentId))
      .orderBy(desc(bankAccounts.linkedAt))
      .limit(1);

    if (!bankAccount?.paystackRecipientCode) {
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message: 'Student has not linked a verified bank account.',
      });
    }

    // 3. Generate unique reference and call Paystack
    const reference = `DOCULET-${input.disbursementId}-${Date.now()}`;
    const transfer = await initiatePaystackTransfer({
      amountKobo: disbursement.amountKobo,
      recipientCode: bankAccount.paystackRecipientCode,
      reference,
    });

    if (!transfer.success) {
      captureException(new Error(`Paystack transfer failed: ${transfer.error}`), {
        tags: { domain: 'payments', disbursementId: input.disbursementId },
      });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Payment initiation failed. Please try again.',
      });
    }

    // 4. Update disbursement to processing
    await ctx.db
      .update(disbursements)
      .set({
        status: 'processing',
        paystackReference: transfer.paystackReference,
        updatedAt: new Date(),
      })
      .where(eq(disbursements.id, input.disbursementId));

    return { status: 'processing', paystackReference: transfer.paystackReference };
  }),
```

Add these imports to `sponsor.ts`:
```typescript
import { desc, eq } from 'drizzle-orm';
import { bankAccounts } from '@/db/schema';
import { initiatePaystackTransfer } from '@/lib//paystack/initiate-transfer';
import { captureException } from '@sentry/nextjs';
```

**Step 3: Run TypeScript check**

```bash
npx tsc --noEmit
```

**Step 4: Commit**

```bash
git add src/lib/paystack/initiate-transfer.ts src/server/routers/sponsor.ts
git commit -m "feat(payments): add initiateDisbursement tRPC procedure with Paystack transfer"
```

---

### Task B4: Paystack webhook handler

**Context:** Paystack sends a POST to our webhook when a transfer completes or fails. Verify HMAC-SHA512 signature, then update disbursement status.

**Paystack webhook details:**
- Signature: `x-paystack-signature` header = HMAC-SHA512 of raw body with `PAYSTACK_SECRET_KEY`
- Events we care about: `transfer.success`, `transfer.failed`, `transfer.reversed`
- Payload: `{ "event": "transfer.success", "data": { "reference": "DOCULET-xxx", "status": "success" } }`

**Files:**
- Create: `src/app/api/webhooks/paystack/route.ts`
- Create: `src/db/queries/paystack-webhook.ts`

**Step 1: Create DB query**

Create `src/db/queries/paystack-webhook.ts`:

```typescript
import { eq } from 'drizzle-orm';

import type { DbClient } from '@/db';
import { disbursements } from '@/db/schema';

export async function processPaystackWebhook(
  db: DbClient,
  reference: string,
  event: 'transfer.success' | 'transfer.failed' | 'transfer.reversed',
): Promise<void> {
  const [record] = await db
    .select()
    .from(disbursements)
    .where(eq(disbursements.paystackReference, reference))
    .limit(1);

  if (!record) return; // unknown reference — ignore
  if (record.status === 'disbursed') return; // already processed

  const newStatus =
    event === 'transfer.success'
      ? 'disbursed'
      : 'failed';

  await db
    .update(disbursements)
    .set({
      status: newStatus,
      disbursedAt: event === 'transfer.success' ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(disbursements.id, record.id));
}
```

**Step 2: Create webhook route**

Create `src/app/api/webhooks/paystack/route.ts`:

```typescript
import { captureException } from '@sentry/nextjs';
import { createHmac } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/db';
import { processPaystackWebhook } from '@/db/queries/paystack-webhook';

function verifyPaystackSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return false;
  const expected = createHmac('sha512', secret).update(rawBody).digest('hex');
  return expected === signature;
}

type PaystackWebhookPayload = {
  event?: string;
  data?: { reference?: string };
};

const HANDLED_EVENTS = new Set(['transfer.success', 'transfer.failed', 'transfer.reversed']);

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-paystack-signature') ?? '';

  if (!verifyPaystackSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: PaystackWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as PaystackWebhookPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const event = payload.event;
  const reference = payload.data?.reference;

  if (!event || !HANDLED_EVENTS.has(event) || !reference) {
    return NextResponse.json({ received: true }); // ignore other events
  }

  try {
    await processPaystackWebhook(
      db,
      reference,
      event as 'transfer.success' | 'transfer.failed' | 'transfer.reversed',
    );
  } catch (error) {
    captureException(error, { tags: { webhook: 'paystack' } });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
```

**Step 3: Run TypeScript check**

```bash
npx tsc --noEmit
```

**Step 4: Commit**

```bash
git add src/app/api/webhooks/paystack/route.ts src/db/queries/paystack-webhook.ts
git commit -m "feat(payments): add Paystack webhook handler with HMAC verification"
```

---

### Task B5: Wire "Initiate payment" button in disbursements UI

**Context:** `disbursements-page-client.tsx` shows disbursements but has no "Pay" action. Add a button on `scheduled` disbursements that calls `trpc.sponsor.initiateDisbursement`.

**Files:**
- Modify: `src/app/dashboard/[role]/disbursements/disbursements-page-client.tsx`
- Modify: `src/config/copy/sponsor.ts` (add `disbursements.actions.pay`, `payingCta`, `paySuccess`, `payError`)

**Step 1: Add copy keys**

In `src/config/copy/sponsor.ts` inside `disbursements`, add:

```typescript
actions: {
  pay: 'Initiate payment',
  payingCta: 'Processing…',
  paySuccess: 'Payment initiated — funds on the way.',
  payError: 'Payment failed. Please try again.',
},
```

**Step 2: Add the Pay button to the client component**

In `disbursements-page-client.tsx`, add mutation and per-row Pay button:

```typescript
const initiateDisbursement = trpc.sponsor.initiateDisbursement.useMutation();
const [rowFeedback, setRowFeedback] = useState<Record<string, 'success' | 'error'>>({});

// In the row render for status === 'scheduled':
{disbursement.status === 'scheduled' ? (
  <div className="mt-2">
    {rowFeedback[disbursement.id] === 'success' ? (
      <p className="text-sm text-primary">{copy.actions.paySuccess}</p>
    ) : rowFeedback[disbursement.id] === 'error' ? (
      <p className="text-sm text-destructive">{copy.actions.payError}</p>
    ) : (
      <Button
        size="sm"
        className="min-h-9"
        disabled={initiateDisbursement.isPending}
        onClick={() => {
          initiateDisbursement.mutate(
            { disbursementId: disbursement.id },
            {
              onSuccess: () => setRowFeedback((f) => ({ ...f, [disbursement.id]: 'success' })),
              onError: () => setRowFeedback((f) => ({ ...f, [disbursement.id]: 'error' })),
            },
          );
        }}
      >
        {initiateDisbursement.isPending ? copy.actions.payingCta : copy.actions.pay}
      </Button>
    )}
  </div>
) : null}
```

Import at top:
```typescript
import { trpc } from '@/trpc/client';
```

**Step 3: Run TypeScript check**

```bash
npx tsc --noEmit
```

**Step 4: Commit**

```bash
git add src/app/dashboard/\[role\]/disbursements/disbursements-page-client.tsx src/config/copy/sponsor.ts
git commit -m "feat(payments): add Initiate Payment button to disbursements UI"
```

---

## TRACK C — Polish

---

### Task C1: Error boundaries — 16 missing pages

**Context:** Only 6/22 dashboard pages have `error.tsx` files. The other 16 show raw Next.js error UI on crash. Use `commonErrors` from shared copy — these routes serve multiple roles so they can't use role-specific copy.

**Pattern from `overview/error.tsx`:** `'use client'`, imports `{ AlertTriangle }` + `{ Button }`, uses `useEffect` to log error, renders icon + message + retry button.

**Files to create** (all follow the same pattern):

`src/app/dashboard/[role]/[page]/error.tsx` for each of:
`actions`, `activity`, `analytics`, `api-keys`, `branding`, `commissions`, `disbursements`, `documents`, `kyc`, `onboarding`, `pipeline`, `risk`, `transactions`, `users`, `verify`

And `src/app/dashboard/[role]/error.tsx` (the root role redirect page).

**Step 1: Create a reusable error component pattern**

Create `src/app/dashboard/[role]/error.tsx` first (the simplest, root-level one):

```typescript
'use client';

import { AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { commonErrors } from '@/config/copy/shared';

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    console.error('[dashboard] page error:', error);
  }, [error]);

  return (
    <div className="flex min-h-96 flex-col items-center justify-center gap-4 text-center">
      <AlertTriangle className="size-10 text-destructive" aria-hidden="true" />
      <div className="space-y-1">
        <h1 className="text-lg font-semibold text-foreground">Something went wrong</h1>
        <p className="max-w-sm text-sm text-muted-foreground">{commonErrors.generic}</p>
      </div>
      <Button onClick={reset} variant="outline" className="min-h-11">
        Try again
      </Button>
    </div>
  );
}
```

**Step 2: Copy the same pattern to all 15 remaining pages**

Create the same file in each directory, changing only the `console.error` tag:
- `actions/error.tsx` → `'[dashboard/actions]'`
- `activity/error.tsx` → `'[dashboard/activity]'`
- `analytics/error.tsx` → `'[dashboard/analytics]'`
- `api-keys/error.tsx` → `'[dashboard/api-keys]'`
- `branding/error.tsx` → `'[dashboard/branding]'`
- `commissions/error.tsx` → `'[dashboard/commissions]'`
- `disbursements/error.tsx` → `'[dashboard/disbursements]'`
- `documents/error.tsx` → `'[dashboard/documents]'`
- `kyc/error.tsx` → `'[dashboard/kyc]'`
- `onboarding/error.tsx` → `'[dashboard/onboarding]'`
- `pipeline/error.tsx` → `'[dashboard/pipeline]'`
- `risk/error.tsx` → `'[dashboard/risk]'`
- `transactions/error.tsx` → `'[dashboard/transactions]'`
- `users/error.tsx` → `'[dashboard/users]'`
- `verify/error.tsx` → `'[dashboard/verify]'`

**Step 3: Run TypeScript check**

```bash
npx tsc --noEmit
```

**Step 4: Commit**

```bash
git add src/app/dashboard/\[role\]/*/error.tsx src/app/dashboard/\[role\]/error.tsx
git commit -m "feat(reliability): add error boundaries to all 16 missing dashboard pages"
```

---

### Task C2: Welcome and password reset email templates

**Context:** Only the sponsor invitation email exists. Signup succeeds but sends no welcome email. Password reset email uses Supabase's built-in email (not our branded Resend template).

**Pattern from `send-sponsor-invitation-email.ts`:** factory function, `getResendClient()`, `resend.emails.send()`, Sentry logging on error.

**Files:**
- Modify: `src/config/copy/email.ts` (add welcome + reset copy keys)
- Create: `src/lib/email/templates/welcome-email.tsx`
- Create: `src/lib/email/templates/password-reset-email.tsx`
- Create: `src/lib/email/send-welcome-email.ts`
- Create: `src/lib/email/send-password-reset-email.ts`
- Modify: Signup route / auth callback to call `sendWelcomeEmail` after user creation

**Step 1: Add copy**

In `src/config/copy/email.ts`, add:

```typescript
welcome: {
  subject: 'Welcome to Doculet — your proof-of-funds journey starts here',
  heading: 'Welcome to Doculet',
  body: 'Your account is ready. Complete your profile to start your proof-of-funds verification.',
  ctaLabel: 'Get started',
},
passwordReset: {
  subject: 'Reset your Doculet password',
  heading: 'Reset your password',
  body: 'Click the button below to set a new password. This link expires in 1 hour.',
  ctaLabel: 'Reset password',
  ignoreNote: 'If you did not request a password reset, you can safely ignore this email.',
},
```

**Step 2: Create welcome email template**

Create `src/lib/email/templates/welcome-email.tsx`:

```tsx
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text,
} from '@react-email/components';

type WelcomeEmailProps = {
  dashboardUrl: string;
};

export function WelcomeEmail({ dashboardUrl }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Doculet — your proof-of-funds journey starts here</Preview>
      <Body style={{ backgroundColor: '#f7f7fb', fontFamily: 'sans-serif' }}>
        <Container style={{ maxWidth: 560, margin: '0 auto', padding: '40px 20px' }}>
          <Heading style={{ color: '#14152a', fontSize: 24, marginBottom: 16 }}>
            Welcome to Doculet
          </Heading>
          <Text style={{ color: '#4a4d73', fontSize: 16, lineHeight: 1.5 }}>
            Your account is ready. Complete your profile to start your proof-of-funds verification.
          </Text>
          <Section style={{ marginTop: 24 }}>
            <Button
              href={dashboardUrl}
              style={{
                backgroundColor: '#000080',
                color: '#ffffff',
                padding: '12px 24px',
                borderRadius: 8,
                textDecoration: 'none',
                fontSize: 16,
              }}
            >
              Get started
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
```

**Step 3: Create send-welcome-email.ts**

Create `src/lib/email/send-welcome-email.ts` following the exact pattern of `send-sponsor-invitation-email.ts`:

```typescript
import { captureException } from '@sentry/nextjs';
import { Resend } from 'resend';

import { emailCopy } from '@/config/copy/email';
import { WelcomeEmail } from './templates/welcome-email';

const DEFAULT_FROM_EMAIL = 'Doculet <noreply@doculet.ai>';
const DEFAULT_APP_URL = 'https://app.doculet.ai';

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('Missing RESEND_API_KEY');
  return new Resend(apiKey);
}

export async function sendWelcomeEmail(toEmail: string, role: string): Promise<void> {
  const resend = getResendClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? DEFAULT_APP_URL;
  const dashboardUrl = `${appUrl}/dashboard/${role}`;

  try {
    const response = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? DEFAULT_FROM_EMAIL,
      to: toEmail,
      subject: emailCopy.welcome.subject,
      react: WelcomeEmail({ dashboardUrl }),
    });

    if (response.error) throw new Error(response.error.message);
  } catch (error) {
    captureException(error, {
      tags: { domain: 'auth', operation: 'send-welcome-email' },
      extra: { toEmail },
    });
    // Non-fatal: don't throw — signup succeeds even if email fails
  }
}
```

**Step 4: Find where signup completes and call sendWelcomeEmail**

Search for the signup route:
```bash
find src/app -name "route.ts" | xargs grep -l "signup\|register\|createUser" 2>/dev/null
grep -r "signUp\|createUser" src/app --include="*.ts" -l
```

Or check the auth server action:
```bash
find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "supabase.auth.signUp\|signInWithPassword" 2>/dev/null | head -5
```

Once found, import and call:
```typescript
import { sendWelcomeEmail } from '@/lib/email/send-welcome-email';
// After successful user creation:
await sendWelcomeEmail(email, role);
```

**Step 5: Run TypeScript check**

```bash
npx tsc --noEmit
```

**Step 6: Commit**

```bash
git add src/lib/email/ src/config/copy/email.ts
git commit -m "feat(email): add welcome email template and send on signup"
```

---

### Task C3: Disbursement confirmation email

**Context:** When a disbursement is initiated, send an email to both the sponsor (confirming payment sent) and the student (confirming funds incoming).

**Files:**
- Create: `src/lib/email/templates/disbursement-confirmation-email.tsx`
- Create: `src/lib/email/send-disbursement-confirmation-email.ts`
- Modify: `src/server/routers/sponsor.ts` (call after successful Paystack transfer in `initiateDisbursement`)

**Step 1: Add copy to email.ts**

```typescript
disbursementConfirmation: {
  sponsorSubject: 'Payment initiated — funds on the way to your student',
  studentSubject: 'Great news — your sponsor has sent funds',
  sponsorHeading: 'Payment initiated',
  studentHeading: 'Funds are on the way',
  sponsorBody: (amountFormatted: string) =>
    `You've successfully initiated a payment of ${amountFormatted}. Funds will arrive within 1–2 business days.`,
  studentBody: (amountFormatted: string) =>
    `Your sponsor has sent ${amountFormatted} to your bank account. Funds will arrive within 1–2 business days.`,
  ctaLabel: 'View dashboard',
},
```

**Step 2: Create the template (reuse WelcomeEmail structure)**

Create `src/lib/email/templates/disbursement-confirmation-email.tsx` with props:
- `role: 'sponsor' | 'student'`
- `amountFormatted: string` (e.g. "₦50,000")
- `dashboardUrl: string`

**Step 3: Create send helper**

Create `src/lib/email/send-disbursement-confirmation-email.ts` with:
```typescript
export async function sendDisbursementConfirmationEmail(params: {
  sponsorEmail: string;
  studentEmail: string;
  amountKobo: number;
}): Promise<void>
```

Use `formatNGN` from `@/lib/utils` to format the amount.

**Step 4: Call after Paystack transfer in sponsor.ts**

After `await ctx.db.update(disbursements).set({ status: 'processing' ... })`, add fire-and-forget:

```typescript
sendDisbursementConfirmationEmail({
  sponsorEmail: ctx.user.email ?? '',
  studentEmail: studentEmail, // fetch from sponsorship join
  amountKobo: disbursement.amountKobo,
}).catch((err: unknown) => captureException(err));
```

**Step 5: TypeScript check + commit**

```bash
npx tsc --noEmit
git add src/lib/email/ src/config/copy/email.ts src/server/routers/sponsor.ts
git commit -m "feat(email): add disbursement confirmation email for sponsor and student"
```

---

### Task C4: Agent referral URL

**Context:** `src/app/dashboard/[role]/actions/page.tsx` passes `referralUrl={null}` to `ActionsPageClient`. The copy button is disabled. Generate a real referral link using the agent's user ID.

**Files:**
- Modify: `src/app/dashboard/[role]/actions/page.tsx`

**Step 1: Read the page**

```bash
cat src/app/dashboard/\[role\]/actions/page.tsx
```

**Step 2: Generate the referral URL from agent's user ID**

Replace `referralUrl={null}` with:
```typescript
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.doculet.ai';
const referralUrl = `${appUrl}/signup?ref=${caller_userId}`;
```

Get `caller_userId` from the tRPC context or from the session. Example:
```typescript
const caller = await api();
// The session user ID is available via the auth session
// Check how other pages get the user ID — likely via ctx.user.id in the router
// For the server page, call a procedure that returns the agent's referral URL
const agentInfo = await caller.agent.getActionsInfo(); // or create this procedure
const referralUrl = `${appUrl}/signup?ref=${agentInfo.userId}`;
```

If there's no procedure returning `userId`, add a simple one to the agent router:
```typescript
getAgentId: roleProcedure('agent')
  .output(z.object({ agentId: z.string().uuid() }))
  .query(async ({ ctx }) => ({ agentId: ctx.user.id })),
```

Then in the page:
```typescript
const { agentId } = await caller.agent.getAgentId();
const referralUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.doculet.ai'}/signup?ref=${agentId}`;
```

**Step 3: Handle `?ref=` on signup**

In the signup route/action, after successful account creation, check for `ref` query param and create an agent-student assignment:

```typescript
const refAgentId = searchParams.get('ref');
if (refAgentId && newUserRole === 'student') {
  // Create assignment in agentStudentAssignments table
  await db.insert(agentStudentAssignments).values({
    agentId: refAgentId,
    studentId: newUserId,
  }).onConflictDoNothing();
}
```

**Step 4: TypeScript check + commit**

```bash
npx tsc --noEmit
git add src/app/dashboard/\[role\]/actions/page.tsx src/server/routers/agent.ts
git commit -m "feat(agent): generate real referral URL and wire signup ref tracking"
```

---

## TRACK D — Landing Page

---

### Task D1: Replace test-landing redirect with real landing page

**Context:** `src/app/(marketing)/page.tsx` redirects to `/test-landing`. Replace with a real one-page marketing site. All copy in `src/config/copy/marketing.ts` (create it). Store waitlist emails in `waitlist` table (create it).

**Files:**
- Create: `src/config/copy/marketing.ts`
- Create: `src/db/schema/waitlist.ts` + add export to `src/db/schema/index.ts`
- Modify: `src/app/(marketing)/page.tsx`

**Step 1: Add waitlist table to schema**

Create `src/db/schema/waitlist.ts`:

```typescript
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const waitlist = pgTable('waitlist', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

Add to `src/db/schema/index.ts`:
```typescript
export * from './waitlist';
```

Push schema:
```bash
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54402/postgres" npx drizzle-kit push
```

**Step 2: Add marketing copy**

Create `src/config/copy/marketing.ts`:

```typescript
export const marketingCopy = {
  nav: {
    signIn: 'Sign in',
    logoAlt: 'Doculet',
  },
  hero: {
    headline: 'Proof of funds,\nverified.',
    subheadline:
      'Doculet connects Nigerian students with sponsors and universities — with instant, bank-grade proof-of-funds documentation.',
    ctaLabel: 'Request early access',
  },
  howItWorks: {
    heading: 'How it works',
    steps: [
      { title: 'Student applies', description: 'Completes KYC and selects their university program.' },
      { title: 'Sponsor funds', description: 'Commits and disburses funds directly to the student.' },
      { title: 'Certificate issued', description: 'Student receives a shareable proof-of-funds certificate.' },
    ],
  },
  trust: {
    heading: 'Built for trust',
    signals: [
      'Bank-grade KYC via Dojah',
      'Real-time bank verification via Mono',
      'Instant payments via Paystack',
    ],
  },
  waitlist: {
    heading: 'Get early access',
    placeholder: 'Your email address',
    ctaLabel: 'Join the waitlist',
    successMessage: 'You\'re on the list — we\'ll be in touch.',
    errorMessage: 'Something went wrong. Please try again.',
    duplicateMessage: 'You\'re already on the list.',
  },
  footer: {
    contact: 'hello@doculet.ai',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    copyright: '© 2026 Doculet. All rights reserved.',
  },
} as const;
```

**Step 3: Create a waitlist API route**

Create `src/app/api/waitlist/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/db';
import { waitlist } from '@/db/schema';

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 422 });
  }

  try {
    await db.insert(waitlist).values({ email: parsed.data.email });
    return NextResponse.json({ success: true });
  } catch (error) {
    // Unique constraint = already on list
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('unique') || msg.includes('duplicate')) {
      return NextResponse.json({ error: 'duplicate' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

**Step 4: Replace the marketing page**

Replace `src/app/(marketing)/page.tsx` with a full landing page. Use `'use client'` only for the waitlist form section. Keep the outer page as a Server Component and extract just the form to a `WaitlistForm` client component.

Create `src/app/(marketing)/_components/waitlist-form.tsx`:

```tsx
'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { marketingCopy } from '@/config/copy/marketing';

const copy = marketingCopy.waitlist;

export function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error' | 'duplicate'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('loading');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.status === 409) { setState('duplicate'); return; }
      if (!res.ok) { setState('error'); return; }
      setState('success');
      setEmail('');
    } catch {
      setState('error');
    }
  };

  if (state === 'success') {
    return <p className="text-sm text-primary font-medium">{copy.successMessage}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={copy.placeholder}
        required
        className="h-11 flex-1 rounded-lg border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      />
      <Button type="submit" className="h-11 min-w-36" disabled={state === 'loading'}>
        {state === 'loading' ? 'Joining…' : copy.ctaLabel}
      </Button>
      {(state === 'error' || state === 'duplicate') && (
        <p className="text-sm text-destructive col-span-full">
          {state === 'duplicate' ? copy.duplicateMessage : copy.errorMessage}
        </p>
      )}
    </form>
  );
}
```

Replace `src/app/(marketing)/page.tsx`:

```tsx
import Link from 'next/link';

import { marketingCopy } from '@/config/copy/marketing';

import { WaitlistForm } from './_components/waitlist-form';

const copy = marketingCopy;

export default function MarketingHome() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <span className="text-xl font-bold text-primary">Doculet</span>
        <Link
          href="/login"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          {copy.nav.signIn}
        </Link>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center gap-6 px-6 py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-foreground max-w-2xl leading-tight whitespace-pre-line">
          {copy.hero.headline}
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl">
          {copy.hero.subheadline}
        </p>
        <WaitlistForm />
      </section>

      {/* How it works */}
      <section className="bg-card border-y border-border px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-semibold text-foreground text-center mb-10">
            {copy.howItWorks.heading}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {copy.howItWorks.steps.map((step, i) => (
              <div key={i} className="text-center space-y-2">
                <div className="mx-auto size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-2xl text-center space-y-4">
          <h2 className="text-xl font-semibold text-foreground">{copy.trust.heading}</h2>
          <ul className="flex flex-col sm:flex-row gap-4 justify-center">
            {copy.trust.signals.map((signal) => (
              <li key={signal} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="size-2 rounded-full bg-primary shrink-0" aria-hidden="true" />
                {signal}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 text-center text-xs text-muted-foreground space-y-2">
        <p>
          <a href={`mailto:${copy.footer.contact}`} className="hover:text-foreground transition-colors">
            {copy.footer.contact}
          </a>
          {' · '}
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            {copy.footer.privacy}
          </Link>
          {' · '}
          <Link href="/terms" className="hover:text-foreground transition-colors">
            {copy.footer.terms}
          </Link>
        </p>
        <p>{copy.footer.copyright}</p>
      </footer>
    </div>
  );
}
```

**Step 5: Run TypeScript check**

```bash
npx tsc --noEmit
```

**Step 6: Commit**

```bash
git add src/app/\(marketing\)/ src/config/copy/marketing.ts src/db/schema/waitlist.ts src/db/schema/index.ts src/app/api/waitlist/
git commit -m "feat(marketing): replace test redirect with real landing page and waitlist"
```

---

## Execution Order

Run as parallel tracks using subagent-driven-development:

| Phase | Track A | Track B | Track C |
|-------|---------|---------|---------|
| Week 1 | A1 → A2 → A3 → A4 | B1 → B2 → B3 → B4 → B5 | C1 → C2 |
| Week 2 | — | — | C3 → C4 → D1 |

Track A and Track B can be dispatched to separate subagents simultaneously (they touch different files). Track C runs in parallel. Track D runs last.

## Success Criteria

- [ ] `npx tsc --noEmit` passes with 0 errors
- [ ] `npm run build` passes
- [ ] Student can start KYC check — real Dojah API called, `referenceId` stored
- [ ] Dojah webhook received and updates student KYC status
- [ ] Student links bank — Mono code exchanged, account verified, Paystack recipient created
- [ ] Sponsor initiates disbursement — Paystack transfer called, disbursement moves to `processing`
- [ ] Paystack webhook received and moves disbursement to `disbursed`
- [ ] All 22 dashboard pages have `error.tsx`
- [ ] Welcome email arrives on signup
- [ ] `/` shows the landing page (not a redirect)
- [ ] Waitlist form stores emails to DB
