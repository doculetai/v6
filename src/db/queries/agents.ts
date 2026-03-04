import { desc, eq } from 'drizzle-orm';

import type { DrizzleDB } from '../index';
import { agentCommissions, agentProfiles } from '../schema';

export async function getAgentCommissions(db: DrizzleDB, userId: string) {
  const profile = await db.query.agentProfiles.findFirst({
    where: eq(agentProfiles.userId, userId),
    with: {
      commissions: {
        orderBy: desc(agentCommissions.createdAt),
      },
    },
  });

  return profile?.commissions ?? [];
}
