import { z } from 'zod';

import { getAgentActivityLogs } from '@/db/queries/agent';
import { agentActivityActionTypes } from '@/db/schema';

import { createTRPCRouter, roleProcedure } from '../trpc';

const activityItemSchema = z.object({
  id: z.string(),
  actionType: z.enum(agentActivityActionTypes),
  details: z.string().nullable(),
  createdAt: z.string(),
});

const getActivityOutputSchema = z.object({
  items: z.array(activityItemSchema),
});

export const agentRouter = createTRPCRouter({
  getActivity: roleProcedure('agent')
    .output(getActivityOutputSchema)
    .query(async ({ ctx }) => {
      const logs = await getAgentActivityLogs(ctx.db, ctx.profile.id);

      return {
        items: logs.map((log) => ({
          id: log.id,
          actionType: log.actionType,
          details: log.details ?? null,
          createdAt: log.createdAt.toISOString(),
        })),
      };
    }),
});
