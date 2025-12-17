import { serve } from '@hono/node-server';
import { trpcServer } from '@hono/trpc-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createContext } from './trpc/context';
import { appRouter } from './trpc/router';

const app = new Hono();

app.use('/*', cors());

app.use(
  '/trpc/*',
  trpcServer({
    router: appRouter,
    createContext,
  }),
);

app.get('/', (c) => {
  return c.json({ message: 'Mottainai Inventory API' });
});

const port = Number.parseInt(process.env.PORT || '3000', 10);
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
