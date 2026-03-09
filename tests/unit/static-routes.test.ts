import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { execSync } from 'node:child_process';

function listFiles(command: string): string[] {
  const output = execSync(command, { encoding: 'utf8' }).trim();
  if (!output) {
    return [];
  }

  return output.split('\n').filter(Boolean);
}

function normalizeAppRoute(file: string): string {
  const withoutPrefix = file.replace(/^src\/app/, '');
  const withoutLeaf = withoutPrefix.replace(/\/(page|route)\.tsx?$/, '');
  const segments = withoutLeaf
    .split('/')
    .filter(Boolean)
    .filter((segment) => !(segment.startsWith('(') && segment.endsWith(')')));

  return segments.length === 0 ? '/' : `/${segments.join('/')}`;
}

function isRouteMatch(href: string, route: string): boolean {
  const hrefSegments = href.split('/').filter(Boolean);
  const routeSegments = route.split('/').filter(Boolean);

  if (hrefSegments.length !== routeSegments.length) {
    return false;
  }

  return routeSegments.every((segment, index) => {
    if (segment.startsWith('[') && segment.endsWith(']')) {
      return true;
    }

    return segment === hrefSegments[index];
  });
}

function collectInternalPaths(filePath: string): string[] {
  const content = readFileSync(filePath, 'utf8');
  const patterns = [
    /href\s*=\s*["'`]([^"'`]+)["'`]/g,
    /router\.push\(\s*["'`]([^"'`]+)["'`]/g,
  ];

  const paths = new Set<string>();

  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(content)) !== null) {
      const rawPath = match[1];
      if (!rawPath.startsWith('/')) {
        continue;
      }
      if (rawPath.includes('${')) {
        continue;
      }
      const cleanPath = rawPath.split('?')[0]?.split('#')[0] ?? rawPath;
      if (!cleanPath || cleanPath === '/' || cleanPath.startsWith('/api/')) {
        continue;
      }
      paths.add(cleanPath);
    }
  }

  return [...paths];
}

describe('internal route wiring', () => {
  it('every static internal UI path maps to a real app route', () => {
    const appFiles = listFiles("find src/app -name 'page.tsx' -o -name 'route.ts'");
    const knownRoutes = appFiles.map(normalizeAppRoute);

    const sourceFiles = listFiles("find src -type f \\( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' \\)");
    const internalPaths = sourceFiles
      .filter((file) => /\.(tsx?|jsx?)$/.test(file))
      .flatMap((file) => collectInternalPaths(join(process.cwd(), file)));

    const unresolved = [...new Set(internalPaths)]
      .filter((path) => !knownRoutes.some((route) => isRouteMatch(path, route)))
      .sort();

    expect(unresolved).toEqual([]);
  });
});
