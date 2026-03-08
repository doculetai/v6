import { describe, it, expect } from 'vitest';
import { ROLE_ACCENTS } from '@/config/roles';

describe('ROLE_ACCENTS canonical source', () => {
  it('has an entry for every dashboard role', () => {
    const roles = ['student', 'sponsor', 'university', 'admin', 'agent', 'partner'] as const;
    for (const role of roles) {
      expect(ROLE_ACCENTS[role].text).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(ROLE_ACCENTS[role].bg).toMatch(/^rgba\(/);
    }
  });
});
