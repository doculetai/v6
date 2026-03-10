/**
 * Layer C — Brand/design compliance (static analysis).
 * Scans source files for forbidden design patterns per CLAUDE.md.
 * Uses execSync with hardcoded args — no user input, no injection risk.
 */

import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

import { describe, it, expect } from 'vitest';

function listSrcFiles(): string[] {
  return execSync('find src -type f \\( -name "*.ts" -o -name "*.tsx" \\)', { encoding: 'utf8' })
    .trim().split('\n').filter(Boolean);
}

function listCopyFiles(): string[] {
  return execSync('find src/config/copy -type f -name "*.ts"', { encoding: 'utf8' })
    .trim().split('\n').filter(Boolean);
}

function concatFiles(files: string[]): string {
  return files.map((f) => readFileSync(f, 'utf8')).join('\n');
}

// CLAUDE.md: "ALWAYS bg-success/text-success — NEVER bg-emerald-*, bg-amber-*, text-green-*"
describe('status color tokens', () => {
  it('no raw green/emerald classes in source', () => {
    const src = concatFiles(listSrcFiles());
    const forbidden = [/\btext-green-\d+\b/, /\bbg-green-\d+\b/, /\btext-emerald-\d+\b/, /\bbg-emerald-\d+\b/];
    expect(forbidden.filter((re) => re.test(src)).map(String)).toEqual([]);
  });

  it('no raw amber/yellow classes in source', () => {
    const src = concatFiles(listSrcFiles());
    const forbidden = [/\btext-amber-\d+\b/, /\bbg-amber-\d+\b/, /\btext-yellow-\d+\b/, /\bbg-yellow-\d+\b/];
    expect(forbidden.filter((re) => re.test(src)).map(String)).toEqual([]);
  });

  it('no raw red classes (use text-destructive/bg-destructive)', () => {
    const src = concatFiles(listSrcFiles());
    const forbidden = [/\btext-red-\d+\b/, /\bbg-red-\d+\b/];
    expect(forbidden.filter((re) => re.test(src)).map(String)).toEqual([]);
  });
});

// CLAUDE.md: "Phosphor Duotone only — no other icon libraries"
describe('icon library compliance', () => {
  it('no lucide-react imports', () => {
    expect(/from ['"]lucide-react['"]/.test(concatFiles(listSrcFiles()))).toBe(false);
  });

  it('no @heroicons imports', () => {
    expect(/from ['"]@heroicons/.test(concatFiles(listSrcFiles()))).toBe(false);
  });

  it('no react-icons imports', () => {
    expect(/from ['"]react-icons/.test(concatFiles(listSrcFiles()))).toBe(false);
  });
});

// CLAUDE.md: "NO EMOJIS — never in UI, copy, code comments, or commit messages."
describe('no emoji in copy config', () => {
  it('no emoji characters in copy config files', () => {
    const src = concatFiles(listCopyFiles());
    const emojiRe = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{1FA00}-\u{1FA9F}]/u;
    expect(emojiRe.test(src)).toBe(false);
  });
});

// CLAUDE.md: "Copy length: section labels max 2 words"
describe('section label length', () => {
  it('no overline prop with more than 2 words', () => {
    const src = concatFiles(listSrcFiles());
    const matches = [...src.matchAll(/overline=["'`]([^"'`]+)["'`]/g)];
    const violations = matches
      .map((m) => m[1]?.trim() ?? '')
      .filter((label) => label.split(/\s+/).length > 2);
    expect(violations).toEqual([]);
  });
});

// CLAUDE.md role accents must come from CSS vars, not hardcoded hex in className strings
describe('no hardcoded role accent hex in className', () => {
  it('role accent hex values are not in className strings', () => {
    const src = concatFiles(listSrcFiles());
    // The 6 role accent hex codes from CLAUDE.md
    const accentHexes = ['2B39A3', '15803D', '0369A1', 'C2410C', '6D28D9', '0F766E'];
    const violations = accentHexes.filter((hex) =>
      new RegExp(`className[^>]*#${hex}`, 'i').test(src),
    );
    expect(violations).toEqual([]);
  });
});
