import 'server-only';

import { cache } from 'react';

import { createTRPCContext } from '@/server/context';
import { appRouter } from '@/server/root';

export const api = cache(async () => {
  const context = await createTRPCContext();
  return appRouter.createCaller(context);
});
