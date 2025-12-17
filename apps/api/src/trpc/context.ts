import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { db } from '../db';

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  return {
    db,
    req: opts.req,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
