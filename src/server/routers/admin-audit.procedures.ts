import { z } from 'zod';

import { listAuditLog } from '@/db/queries/audit-log';

import { createTRPCRouter, roleProcedure } from '../trpc';

const auditLogRowSchema = z.object({
  id: z.string(),
  action: z.string(),
  entityType: z.string(),
  entityId: z.string().nullable(),
  meta: z.unknown(),
  ip: z.string().nullable(),
  actorEmail: z.string().nullable(),
  createdAt: z.date(),
});

export const adminAuditRouter = createTRPCRouter({
  listAuditLog: roleProcedure('admin')
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional().default(50),
        offset: z.number().min(0).optional().default(0),
        action: z.string().optional(),
        entityType: z.string().optional(),
      }),
    )
    .output(
      z.object({
        rows: z.array(auditLogRowSchema),
        total: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return listAuditLog(ctx.db, {
        limit: input.limit,
        offset: input.offset,
        action: input.action,
        entityType: input.entityType,
      });
    }),
});
