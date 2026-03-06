import { describe, expect, it } from 'vitest';
import { getNavConfig } from '@/config/nav';

describe('getNavConfig student progressive disclosure', () => {
  it('stage 0: verify, documents, proof are disabled', () => {
    const nav = getNavConfig('student', { studentTrustStage: 0 });
    const verify = nav.items.find((i) => i.href.includes('/verify'));
    const docs = nav.items.find((i) => i.href.includes('/documents'));
    const proof = nav.items.find((i) => i.href.includes('/proof'));
    expect(verify?.disabled).toBe(true);
    expect(docs?.disabled).toBe(true);
    expect(proof?.disabled).toBe(true);
  });

  it('stage 1: only proof is disabled', () => {
    const nav = getNavConfig('student', { studentTrustStage: 1 });
    const verify = nav.items.find((i) => i.href.includes('/verify'));
    const docs = nav.items.find((i) => i.href.includes('/documents'));
    const proof = nav.items.find((i) => i.href.includes('/proof'));
    expect(verify?.disabled).toBeFalsy();
    expect(docs?.disabled).toBeFalsy();
    expect(proof?.disabled).toBe(true);
  });

  it('stage 2+: nothing is disabled', () => {
    const nav = getNavConfig('student', { studentTrustStage: 2 });
    const disabledItems = nav.items.filter((i) => i.disabled);
    expect(disabledItems).toHaveLength(0);
  });

  it('non-student roles: no effect from studentTrustStage', () => {
    const nav = getNavConfig('sponsor', { studentTrustStage: 0 });
    const disabledItems = nav.items.filter((i) => i.disabled);
    expect(disabledItems).toHaveLength(0);
  });
});
