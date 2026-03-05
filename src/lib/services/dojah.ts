import { z } from 'zod';

const dojahResponseSchema = z.object({
  entity: z.object({ reference_id: z.string() }).optional(),
  error: z.string().optional(),
});

/**
 * Calls the Dojah KYC API with the given identity type and number.
 * Returns the Dojah reference ID on success; throws on failure.
 *
 * Used by both student and sponsor KYC verification flows.
 */
export async function callDojahKyc(
  identityType: 'bvn' | 'nin' | 'passport',
  identityNumber: string,
): Promise<string> {
  const appId = process.env.DOJAH_APP_ID;
  const privateKey = process.env.DOJAH_PRIVATE_KEY;

  if (!appId || !privateKey) {
    throw new Error('Missing DOJAH_APP_ID or DOJAH_PRIVATE_KEY');
  }

  const base =
    identityType === 'passport'
      ? 'https://api.dojah.io/api/v1/kyc/passport'
      : `https://api.dojah.io/api/v1/kyc/${identityType}`;
  const params = new URLSearchParams();
  if (identityType === 'passport') {
    params.set('passport', identityNumber);
    params.set('country', 'NG');
  } else {
    params.set(identityType, identityNumber);
  }
  const url = `${base}?${params.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      AppId: appId,
      Authorization: privateKey,
      Accept: 'application/json',
    },
  });

  const parsed = dojahResponseSchema.safeParse(await response.json());
  if (!parsed.success || !response.ok) {
    const errorMsg = parsed.success ? parsed.data.error : undefined;
    throw new Error(errorMsg ?? `Dojah API error: ${response.status}`);
  }

  if (parsed.data.error) {
    throw new Error(parsed.data.error);
  }

  const referenceId = parsed.data.entity?.reference_id;
  if (!referenceId) {
    throw new Error('Dojah returned no reference_id');
  }

  return referenceId;
}
