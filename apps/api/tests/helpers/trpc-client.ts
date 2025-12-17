import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../src/trpc/router';

export const createTestClient = (url: string) => {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url,
      }),
    ],
  });
};
