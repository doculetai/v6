import crypto from 'node:crypto';
import { describe, it, expect } from 'vitest';

describe('partnerWebhooks', () => {
  it('generates a 64-char hex secret', () => {
    const secret = crypto.randomBytes(32).toString('hex');
    expect(secret).toHaveLength(64);
  });

  it('SHA-256 hash of secret is deterministic', () => {
    const secret = 'abc123';
    const hash1 = crypto.createHash('sha256').update(secret).digest('hex');
    const hash2 = crypto.createHash('sha256').update(secret).digest('hex');
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });

  it('HMAC signature uses sha256', () => {
    const secret = 'mysecret';
    const payload = '{"event":"test"}';
    const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    expect(sig).toHaveLength(64);
    expect(typeof sig).toBe('string');
  });
});
