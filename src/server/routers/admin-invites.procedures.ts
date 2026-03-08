import { createClient } from '@supabase/supabase-js';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { pendingRoleAssignments } from '@/db/schema';
import { insertAuditLog } from '@/db/queries/audit-log';

import { createTRPCRouter, roleProcedure } from '../trpc';

export const adminInvitesRouter = createTRPCRouter({
  generateInviteLink: roleProcedure('admin')
    .input(
      z.object({
        role: z.enum(['agent', 'partner', 'university']),
        email: z.string().email(),
      }),
    )
    .output(z.object({ inviteUrl: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !supabaseServiceRoleKey) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Server configuration error.',
        });
      }

      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: 'invite',
        email: input.email,
      });

      if (error || !data.properties?.action_link) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Could not generate invite link.',
        });
      }

      await ctx.db
        .insert(pendingRoleAssignments)
        .values({
          email: input.email,
          role: input.role,
          token: data.properties.hashed_token ?? '',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        })
        .onConflictDoUpdate({
          target: pendingRoleAssignments.email,
          set: {
            role: input.role,
            token: data.properties.hashed_token ?? '',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });

      await insertAuditLog(ctx.db, {
        actorId: ctx.user!.id,
        action: 'admin.generateInviteLink',
        entityType: 'invite',
        entityId: null,
        meta: { email: input.email, role: input.role },
        ip: ctx.ip ?? null,
        userAgent: ctx.userAgent ?? null,
      });

      return { inviteUrl: data.properties.action_link };
    }),
});
