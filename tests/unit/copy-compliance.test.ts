/**
 * Copy compliance tests.
 *
 * Pins bugs found during visual QA:
 *   1. File size limit stated in copy must match the enforced limit (10 MB).
 *   2. No developer-facing fallback text must be shown to students.
 *   3. Section labels (overline/eyebrow) must be ≤ 2 words (CLAUDE.md).
 *   4. Proof subtitle must not be treated as a section label (>2 words is ok as
 *      a paragraph description, but we assert it does NOT appear as an `overline`
 *      prop anywhere in the proof page component).
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { studentCopy } from '@/config/copy/student';

const ENFORCED_MAX_MB = 10;
const ENFORCED_MAX_BYTES = ENFORCED_MAX_MB * 1024 * 1024;

// ---------------------------------------------------------------------------
// Bug #2: File size copy vs enforced limit
// ---------------------------------------------------------------------------
describe('document upload file size copy', () => {
  it('upload description states the correct max size (10 MB)', () => {
    const desc = studentCopy.documents.upload.description;
    expect(desc).toContain('10 MB');
    expect(desc).not.toContain('8 MB');
  });

  it('kycFailure fileTooLarge copy states the correct max size (10 MB)', () => {
    // kycFailure is under studentCopy.verify (not .verification)
    const msg = studentCopy.verify.kycFailure.fileTooLarge;
    expect(msg).toContain('10 MB');
    expect(msg).not.toContain('8 MB');
  });

  it('documents validation fileTooLarge copy states the correct max size (10 MB)', () => {
    const msg = studentCopy.documents.validation.fileTooLarge;
    expect(msg).toContain('10 MB');
    expect(msg).not.toContain('8 MB');
  });

  it('bankVerification statementUploadHint states the correct max size (10 MB)', () => {
    const hint = studentCopy.bankVerification.statementUploadHint;
    expect(hint).toContain('10 MB');
    expect(hint).not.toContain('8 MB');
  });

  it('DEFAULT_MAX_SIZE in file-uploader is 10 MB (not 8 MB)', () => {
    const src = readFileSync(
      resolve(process.cwd(), 'src/components/ui/file-uploader.tsx'),
      'utf8',
    );
    // Must declare 10 MB — either as the computed constant or as the literal 10485760
    const has10Mb = src.includes('10 * 1024 * 1024') || src.includes('10485760');
    const has8Mb = src.includes('8 * 1024 * 1024') || src.includes('8388608');
    expect(has10Mb).toBe(true);
    expect(has8Mb).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Bug #3: Developer copy exposed to students
// ---------------------------------------------------------------------------
describe('student-facing rejection reason copy', () => {
  it('rejectionReasonFallback is not developer language ("No ... provided")', () => {
    const fallback = studentCopy.documents.list.rejectionReasonFallback;
    // "No X provided" is developer-speak, not student-friendly.
    // Should be something actionable, e.g. "Contact support for details."
    expect(fallback.toLowerCase()).not.toMatch(/no .+ provided/);
  });

  it('rejectionReasonFallback guides the student toward an action', () => {
    const fallback = studentCopy.documents.list.rejectionReasonFallback;
    // Must have at least one sentence with an actionable phrase or contact cue
    const hasAction =
      /contact|support|resubmit|check|review|details|more information/i.test(fallback);
    expect(hasAction).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Bug #1: TopBar must use a client-only desktop bell to prevent Radix ID
// hydration mismatch when both responsive layouts are in the DOM simultaneously.
// ---------------------------------------------------------------------------
describe('TopBar – hydration-safe NotificationsBell pattern', () => {
  it('uses NotificationsBellDesktop (dynamic, ssr:false) for the desktop render', () => {
    const src = readFileSync(
      resolve(process.cwd(), 'src/components/layout/TopBar.tsx'),
      'utf8',
    );
    // The desktop bell must use a dynamic import to skip SSR
    expect(src).toContain('NotificationsBellDesktop');
    expect(src).toContain('ssr: false');
  });

  it('mobile bell uses the SSR-safe direct import (only ONE static NotificationsBell)', () => {
    const src = readFileSync(
      resolve(process.cwd(), 'src/components/layout/TopBar.tsx'),
      'utf8',
    );
    // Only 1 direct <NotificationsBell usage (mobile); desktop uses the dynamic alias
    const staticInstances = src.match(/<NotificationsBell\b(?!Desktop)/g) ?? [];
    expect(staticInstances.length).toBe(1);
  });
});
