import { redirect } from 'next/navigation';

import { createTRPCContext } from '@/server/context';

export async function redirectIfAuthenticated() {
  const ctx = await createTRPCContext();
  const userId = ctx.session?.user.id;

  if (userId) {
    const profile = await ctx.db.query.profiles.findFirst({
      where: (table, { eq }) => eq(table.userId, userId),
    });

    if (profile) {
      redirect(`/dashboard/${profile.role}`);
    }
  }
}
