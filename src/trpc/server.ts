import 'server-only';

import { cache } from 'react';
import { createCallerFactory } from '@/server/trpc';

import { createTRPCContext } from '@/server/context';
import { appRouter } from '@/server/root';

const createCaller = createCallerFactory(appRouter);

export const api = cache(async () => {
  const context = await createTRPCContext();
  return createCaller(context);
});
