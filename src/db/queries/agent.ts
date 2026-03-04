import type { DrizzleDB } from '../index';

export async function getAgentActivityLogs(db: DrizzleDB, agentId: string) {
  return db.query.agentActivityLogs.findMany({
    where: (table, { eq }) => eq(table.agentId, agentId),
    orderBy: (table, { desc }) => [desc(table.createdAt)],
    limit: 50,
  });
}
