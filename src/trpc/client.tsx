import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import type { inferRouterOutputs } from '@trpc/server';
import superjson from 'superjson';

import type { AppRouter } from '@/server/root';

export const trpc = createTRPCReact<AppRouter>();

export const browserTrpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      transformer: superjson,
      url: '/api/trpc',
    }),
  ],
});

export type RouterOutputs = inferRouterOutputs<AppRouter>;
