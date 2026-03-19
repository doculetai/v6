import { captureException } from '@sentry/nextjs';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/db';
import { users } from '@/db/schema';

const BUCKET = process.env.SUPABASE_DOCUMENTS_BUCKET ?? 'documents';

function getStorageClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const storage = getStorageClient();
  if (!storage) {
    return NextResponse.json(
      { error: 'Storage not configured' },
      { status: 500 },
    );
  }

  try {
  const validUserIds = new Set(
    (await db.select({ id: users.id }).from(users)).map((r) => r.id),
  );

  const { data: rootFiles } = await storage.storage
    .from(BUCKET)
    .list('', { limit: 1000 });

  if (!rootFiles?.length) {
    return NextResponse.json({ deleted: 0, orphans: [] });
  }

  const orphanUserIds: string[] = [];
  for (const item of rootFiles) {
    if (item.name && !validUserIds.has(item.name)) {
      orphanUserIds.push(item.name);
    }
  }

  let totalDeleted = 0;
  for (const userId of orphanUserIds) {
    const { data: files } = await storage.storage
      .from(BUCKET)
      .list(userId, { limit: 500 });

    if (!files?.length) continue;

    const paths = files
      .filter((f) => f.name)
      .map((f) => `${userId}/${f.name}`);

    const { error } = await storage.storage.from(BUCKET).remove(paths);
    if (!error) totalDeleted += paths.length;
  }

  return NextResponse.json({
    deleted: totalDeleted,
    orphanUserIds,
  });
  } catch (err) {
    captureException(err, { tags: { cron: 'cleanup-orphaned-documents' } });
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}
