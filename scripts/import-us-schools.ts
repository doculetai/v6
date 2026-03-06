/**
 * Import US school data from the College Scorecard API (Dept of Education).
 *
 * Usage:
 *   COLLEGE_SCORECARD_API_KEY=<key> npx tsx scripts/import-us-schools.ts
 *
 * Get a free key at https://api.data.gov/signup
 */

import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { z } from 'zod';

config({ path: '.env.local' });
config({ path: '.env' });

import * as schema from '@/db/schema';

const { schools } = schema;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL in .env.local');
  process.exit(1);
}

const client = postgres(DATABASE_URL, { prepare: false, max: 1 });
const db = drizzle(client, { schema });

const API_KEY = process.env.COLLEGE_SCORECARD_API_KEY;
if (!API_KEY) {
  console.error('Missing COLLEGE_SCORECARD_API_KEY. Get one free at https://api.data.gov/signup');
  process.exit(1);
}

const BASE_URL = 'https://api.data.gov/ed/collegescorecard/v1/schools';
const PAGE_SIZE = 100;
const BATCH_SIZE = 50;
const DELAY_MS = 400;

const ownershipMap: Record<number, 'public' | 'private_nonprofit' | 'private_forprofit'> = {
  1: 'public',
  2: 'private_nonprofit',
  3: 'private_forprofit',
};

const scorecardSchoolSchema = z.object({
  id: z.number(),
  'school.name': z.string(),
  'school.city': z.string().nullable(),
  'school.state': z.string().nullable(),
  'school.zip': z.string().nullable(),
  'school.school_url': z.string().nullable(),
  'school.accreditor': z.string().nullable(),
  'school.ownership': z.number().nullable(),
  'latest.cost.tuition.out_of_state': z.number().nullable(),
  'latest.student.size': z.number().nullable(),
});

const scorecardResponseSchema = z.object({
  metadata: z.object({
    total: z.number(),
    page: z.number(),
    per_page: z.number(),
  }),
  results: z.array(scorecardSchoolSchema),
});

type ScorecardSchool = z.infer<typeof scorecardSchoolSchema>;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cleanUrl(url: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return `https://${trimmed}`;
}

async function fetchPage(page: number): Promise<z.infer<typeof scorecardResponseSchema>> {
  const params = new URLSearchParams({
    api_key: API_KEY!,
    'school.degrees_awarded.predominant': '2,3',
    fields: [
      'id',
      'school.name',
      'school.city',
      'school.state',
      'school.zip',
      'school.school_url',
      'school.accreditor',
      'school.ownership',
      'latest.cost.tuition.out_of_state',
      'latest.student.size',
    ].join(','),
    per_page: String(PAGE_SIZE),
    page: String(page),
    sort: 'school.name:asc',
  });

  const response = await fetch(`${BASE_URL}?${params}`);
  if (!response.ok) {
    throw new Error(`Scorecard API error: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  return scorecardResponseSchema.parse(json);
}

function toRow(school: ScorecardSchool) {
  const tuitionDollars = school['latest.cost.tuition.out_of_state'];
  return {
    name: school['school.name'],
    country: 'United States',
    city: school['school.city'] ?? null,
    state: school['school.state'] ?? null,
    zip: school['school.zip'] ?? null,
    websiteUrl: cleanUrl(school['school.school_url']),
    accreditor: school['school.accreditor'] ?? null,
    studentSize: school['latest.student.size'] ?? null,
    institutionType: school['school.ownership']
      ? (ownershipMap[school['school.ownership']] ?? null)
      : null,
    scorecardId: school.id,
    outOfStateTuition: tuitionDollars != null ? tuitionDollars * 100 : null,
    dataSource: 'college_scorecard' as const,
    updatedAt: new Date(),
  };
}

async function upsertBatch(rows: ReturnType<typeof toRow>[]) {
  if (rows.length === 0) return;

  await db
    .insert(schools)
    .values(rows)
    .onConflictDoUpdate({
      target: schools.scorecardId,
      set: {
        name: schools.name,
        city: schools.city,
        state: schools.state,
        zip: schools.zip,
        websiteUrl: schools.websiteUrl,
        accreditor: schools.accreditor,
        studentSize: schools.studentSize,
        institutionType: schools.institutionType,
        outOfStateTuition: schools.outOfStateTuition,
        dataSource: schools.dataSource,
        updatedAt: new Date(),
      },
    });
}

async function main() {
  console.log('Fetching page 0 to get total count...');
  const firstPage = await fetchPage(0);
  const total = firstPage.metadata.total;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  console.log(`Found ${total} institutions across ${totalPages} pages`);

  let imported = 0;
  let batch: ReturnType<typeof toRow>[] = [];

  for (let page = 0; page < totalPages; page++) {
    const data = page === 0 ? firstPage : await fetchPage(page);

    for (const school of data.results) {
      batch.push(toRow(school));

      if (batch.length >= BATCH_SIZE) {
        await upsertBatch(batch);
        imported += batch.length;
        batch = [];
      }
    }

    if (page < totalPages - 1) {
      await sleep(DELAY_MS);
    }

    const pct = Math.round(((page + 1) / totalPages) * 100);
    process.stdout.write(`\r  Page ${page + 1}/${totalPages} (${pct}%) — ${imported + batch.length} schools`);
  }

  if (batch.length > 0) {
    await upsertBatch(batch);
    imported += batch.length;
  }

  console.log(`\nImported ${imported} US institutions from College Scorecard`);
  await client.end();
}

main().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});
