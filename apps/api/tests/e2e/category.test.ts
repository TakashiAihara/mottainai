import { serve } from '@hono/node-server';
import { trpcServer } from '@hono/trpc-server';
import { Hono } from 'hono';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createContext } from '../../src/trpc/context';
import { appRouter } from '../../src/trpc/router';
import { createTestClient } from '../helpers/trpc-client';
import { closeTestDatabase, setupTestDatabase } from '../helpers/db';

describe('Category E2E Tests', () => {
  let server: ReturnType<typeof serve>;
  let client: ReturnType<typeof createTestClient>;
  let db: ReturnType<typeof setupTestDatabase>;
  const port = 3002;

  beforeAll(() => {
    db = setupTestDatabase();

    const app = new Hono();

    app.use(
      '/trpc/*',
      trpcServer({
        router: appRouter,
        createContext: async (opts) => {
          return {
            db,
            req: opts.req,
          };
        },
      }),
    );

    server = serve({
      fetch: app.fetch,
      port,
    });

    client = createTestClient(`http://localhost:${port}/trpc`);
  });

  afterAll(() => {
    server.close();
    closeTestDatabase();
  });

  beforeEach(() => {
    db.delete(db._.fullSchema.inventoryItems).execute();
    db.delete(db._.fullSchema.categories).execute();
  });

  describe('Category CRUD Operations', () => {
    it('should create a new category', async () => {
      const category = await client.category.create.mutate({
        name: '食品',
        description: '食品カテゴリー',
      });

      expect(category).toMatchObject({
        name: '食品',
        description: '食品カテゴリー',
      });
      expect(category.id).toBeDefined();
    });

    it('should list all categories', async () => {
      await client.category.create.mutate({
        name: '食品',
      });

      await client.category.create.mutate({
        name: '飲料',
      });

      const categories = await client.category.list.query();

      expect(categories).toHaveLength(2);
      expect(categories[0].name).toBe('食品');
      expect(categories[1].name).toBe('飲料');
    });

    it('should delete category', async () => {
      const created = await client.category.create.mutate({
        name: '食品',
      });

      const result = await client.category.delete.mutate({ id: created.id });

      expect(result.success).toBe(true);

      const categories = await client.category.list.query();
      expect(categories).toHaveLength(0);
    });

    it('should create inventory item with category', async () => {
      const category = await client.category.create.mutate({
        name: '食品',
      });

      const item = await client.inventory.create.mutate({
        janCode: '4901234567890',
        name: 'テスト商品',
        quantity: 10,
        price: 1000,
        categoryId: category.id,
      });

      expect(item.categoryId).toBe(category.id);
    });
  });
});
