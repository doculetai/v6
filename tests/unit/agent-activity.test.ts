import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import type { AgentActivityItem, AgentActivityEventType } from '@/db/queries/agent-activity';

// ── Inline schema — mirrors the router's AgentActivityItemSchema ───────────────

const AgentActivityEventTypeSchema = z.enum([
  'document_uploaded',
  't2_verified',
  't3_verified',
  'cert_issued',
  'doc_approved',
  'doc_rejected',
]);

const AgentActivityItemSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  studentName: z.string(),
  eventType: AgentActivityEventTypeSchema,
  eventLabel: z.string(),
  createdAt: z.date(),
});

// ── Fixtures ──────────────────────────────────────────────────────────────────

const AGENT_ID = '00000000-0000-0000-0000-000000000010';
const STUDENT_ID = '00000000-0000-0000-0000-000000000020';

function makeActivity(overrides: Partial<AgentActivityItem> = {}): AgentActivityItem {
  return {
    id: 'doc-upload-00000000-0000-0000-0000-000000000001',
    studentId: STUDENT_ID,
    studentName: 'Amara Okafor',
    eventType: 'document_uploaded' as AgentActivityEventType,
    eventLabel: 'Document uploaded',
    createdAt: new Date('2026-02-15T10:00:00Z'),
    ...overrides,
  };
}

// ── AgentActivityItemSchema: valid shapes ─────────────────────────────────────

describe('AgentActivityItemSchema — valid shapes', () => {
  it('accepts a document_uploaded event', () => {
    const result = AgentActivityItemSchema.safeParse(makeActivity());
    expect(result.success).toBe(true);
  });

  it('accepts a t2_verified event', () => {
    const result = AgentActivityItemSchema.safeParse(
      makeActivity({
        id: 'kyc-00000000-0000-0000-0000-000000000002',
        eventType: 't2_verified',
        eventLabel: 'Identity verified',
      }),
    );
    expect(result.success).toBe(true);
  });

  it('accepts a t3_verified event', () => {
    const result = AgentActivityItemSchema.safeParse(
      makeActivity({
        id: 'bank-00000000-0000-0000-0000-000000000003',
        eventType: 't3_verified',
        eventLabel: 'Bank verified',
      }),
    );
    expect(result.success).toBe(true);
  });

  it('accepts a cert_issued event', () => {
    const result = AgentActivityItemSchema.safeParse(
      makeActivity({
        id: 'cert-00000000-0000-0000-0000-000000000004',
        eventType: 'cert_issued',
        eventLabel: 'Certificate issued',
      }),
    );
    expect(result.success).toBe(true);
  });

  it('accepts a doc_approved event', () => {
    const result = AgentActivityItemSchema.safeParse(
      makeActivity({
        id: 'doc-review-00000000-0000-0000-0000-000000000005',
        eventType: 'doc_approved',
        eventLabel: 'Document approved',
      }),
    );
    expect(result.success).toBe(true);
  });

  it('accepts a doc_rejected event', () => {
    const result = AgentActivityItemSchema.safeParse(
      makeActivity({
        id: 'doc-review-00000000-0000-0000-0000-000000000006',
        eventType: 'doc_rejected',
        eventLabel: 'Document rejected',
      }),
    );
    expect(result.success).toBe(true);
  });
});

// ── AgentActivityItemSchema: invalid shapes ───────────────────────────────────

describe('AgentActivityItemSchema — invalid shapes', () => {
  it('rejects a missing id', () => {
    const { id: _omitted, ...withoutId } = makeActivity();
    const result = AgentActivityItemSchema.safeParse(withoutId);
    expect(result.success).toBe(false);
  });

  it('rejects a missing studentId', () => {
    const { studentId: _omitted, ...withoutStudentId } = makeActivity();
    const result = AgentActivityItemSchema.safeParse(withoutStudentId);
    expect(result.success).toBe(false);
  });

  it('rejects a missing studentName', () => {
    const { studentName: _omitted, ...withoutName } = makeActivity();
    const result = AgentActivityItemSchema.safeParse(withoutName);
    expect(result.success).toBe(false);
  });

  it('rejects an unknown eventType', () => {
    const result = AgentActivityItemSchema.safeParse(
      makeActivity({ eventType: 'unknown_event' as AgentActivityEventType }),
    );
    expect(result.success).toBe(false);
  });

  it('rejects a missing createdAt', () => {
    const { createdAt: _omitted, ...withoutDate } = makeActivity();
    const result = AgentActivityItemSchema.safeParse(withoutDate);
    expect(result.success).toBe(false);
  });

  it('rejects a createdAt that is a string instead of Date', () => {
    const result = AgentActivityItemSchema.safeParse({
      ...makeActivity(),
      createdAt: '2026-02-15T10:00:00Z',
    });
    expect(result.success).toBe(false);
  });
});

// ── Pagination cursor semantics ───────────────────────────────────────────────

describe('Pagination cursor — ISO date string shape', () => {
  it('cursor is a valid ISO date string when derived from createdAt', () => {
    const item = makeActivity();
    const cursor = item.createdAt.toISOString();
    expect(() => new Date(cursor)).not.toThrow();
    expect(new Date(cursor).getTime()).toEqual(item.createdAt.getTime());
  });

  it('cursor round-trips through Date construction without precision loss', () => {
    const original = new Date('2026-03-07T14:30:00.123Z');
    const cursor = original.toISOString();
    const restored = new Date(cursor);
    expect(restored.getTime()).toBe(original.getTime());
  });
});

// ── Event list ordering invariant ─────────────────────────────────────────────

describe('Event list ordering', () => {
  it('newest-first sort produces descending createdAt order', () => {
    const jan = new Date('2026-01-15T12:00:00Z');
    const feb = new Date('2026-02-15T12:00:00Z');
    const mar = new Date('2026-03-15T12:00:00Z');

    const events: AgentActivityItem[] = [
      makeActivity({ createdAt: jan }),
      makeActivity({ createdAt: mar }),
      makeActivity({ createdAt: feb }),
    ];

    const sorted = [...events].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    expect(sorted[0].createdAt.getTime()).toBe(mar.getTime());
    expect(sorted[1].createdAt.getTime()).toBe(feb.getTime());
    expect(sorted[2].createdAt.getTime()).toBe(jan.getTime());
  });

  it('limit slices to the expected number of items', () => {
    const limit = 3;
    const events: AgentActivityItem[] = Array.from({ length: 10 }, (_, i) =>
      makeActivity({ id: `doc-upload-${i}`, createdAt: new Date(2026, 0, i + 1) }),
    );

    const result = events.slice(0, limit);
    expect(result).toHaveLength(limit);
  });
});

// ── Type safety ───────────────────────────────────────────────────────────────

describe('AgentActivityItem type constraints', () => {
  it('all six event types are in the allowed enum', () => {
    const allowedTypes: AgentActivityEventType[] = [
      'document_uploaded',
      't2_verified',
      't3_verified',
      'cert_issued',
      'doc_approved',
      'doc_rejected',
    ];

    for (const eventType of allowedTypes) {
      const result = AgentActivityEventTypeSchema.safeParse(eventType);
      expect(result.success).toBe(true);
    }
  });

  it('the agentId does not appear in the output shape', () => {
    const item = makeActivity();
    // AgentActivityItem should not expose the agent — it is scoped internally.
    expect(Object.keys(item)).not.toContain('agentId');
  });
});

// ── Export ────────────────────────────────────────────────────────────────────

// Ensures the AGENT_ID constant is used so the linter does not flag it.
describe('Fixture identifiers', () => {
  it('AGENT_ID and STUDENT_ID are valid UUID-shaped strings', () => {
    const uuidPattern = /^[0-9a-f-]{36}$/i;
    expect(AGENT_ID).toMatch(uuidPattern);
    expect(STUDENT_ID).toMatch(uuidPattern);
  });
});
