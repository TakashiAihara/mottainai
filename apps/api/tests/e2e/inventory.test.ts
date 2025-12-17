import { serve } from '@hono/node-server';
import { trpcServer } from '@hono/trpc-server';
import { Hono } from 'hono';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createContext } from '../../src/trpc/context';
import { appRouter } from '../../src/trpc/router';
import { createTestClient } from '../helpers/trpc-client';
import { closeTestDatabase, setupTestDatabase } from '../helpers/db';

describe('Inventory E2E Tests', () => {
  let server: ReturnType<typeof serve>;
  let client: ReturnType<typeof createTestClient>;
  let db: ReturnType<typeof setupTestDatabase>;
  const port = 3001;

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

  describe('Inventory CRUD Operations', () => {
    it('should create a new inventory item', async () => {
      const item = await client.inventory.create.mutate({
        janCode: '4901234567890',
        name: 'テスト商品',
        description: 'これはテスト商品です',
        quantity: 10,
        price: 1000,
      });

      expect(item).toMatchObject({
        janCode: '4901234567890',
        name: 'テスト商品',
        description: 'これはテスト商品です',
        quantity: 10,
        price: 1000,
      });
      expect(item.id).toBeDefined();
    });

    it('should list all inventory items', async () => {
      await client.inventory.create.mutate({
        janCode: '4901234567890',
        name: '商品1',
        quantity: 10,
        price: 1000,
      });

      await client.inventory.create.mutate({
        janCode: '4901234567891',
        name: '商品2',
        quantity: 20,
        price: 2000,
      });

      const items = await client.inventory.list.query();

      expect(items).toHaveLength(2);
      expect(items[0].name).toBe('商品1');
      expect(items[1].name).toBe('商品2');
    });

    it('should get inventory item by JAN code', async () => {
      const created = await client.inventory.create.mutate({
        janCode: '4901234567890',
        name: 'テスト商品',
        quantity: 10,
        price: 1000,
      });

      const item = await client.inventory.getByJanCode.query({
        janCode: '4901234567890',
      });

      expect(item).toMatchObject({
        id: created.id,
        janCode: '4901234567890',
        name: 'テスト商品',
      });
    });

    it('should get inventory item by ID', async () => {
      const created = await client.inventory.create.mutate({
        janCode: '4901234567890',
        name: 'テスト商品',
        quantity: 10,
        price: 1000,
      });

      const item = await client.inventory.getById.query({ id: created.id });

      expect(item).toMatchObject({
        id: created.id,
        janCode: '4901234567890',
        name: 'テスト商品',
      });
    });

    it('should update inventory item', async () => {
      const created = await client.inventory.create.mutate({
        janCode: '4901234567890',
        name: 'テスト商品',
        quantity: 10,
        price: 1000,
      });

      const updated = await client.inventory.update.mutate({
        id: created.id,
        name: '更新された商品',
        price: 2000,
      });

      expect(updated.name).toBe('更新された商品');
      expect(updated.price).toBe(2000);
      expect(updated.quantity).toBe(10);
    });

    it('should update quantity with delta', async () => {
      const created = await client.inventory.create.mutate({
        janCode: '4901234567890',
        name: 'テスト商品',
        quantity: 10,
        price: 1000,
      });

      const increased = await client.inventory.updateQuantity.mutate({
        id: created.id,
        delta: 5,
      });

      expect(increased.quantity).toBe(15);

      const decreased = await client.inventory.updateQuantity.mutate({
        id: created.id,
        delta: -3,
      });

      expect(decreased.quantity).toBe(12);
    });

    it('should not allow negative quantity', async () => {
      const created = await client.inventory.create.mutate({
        janCode: '4901234567890',
        name: 'テスト商品',
        quantity: 5,
        price: 1000,
      });

      const result = await client.inventory.updateQuantity.mutate({
        id: created.id,
        delta: -10,
      });

      expect(result.quantity).toBe(0);
    });

    it('should delete inventory item', async () => {
      const created = await client.inventory.create.mutate({
        janCode: '4901234567890',
        name: 'テスト商品',
        quantity: 10,
        price: 1000,
      });

      const result = await client.inventory.delete.mutate({ id: created.id });

      expect(result.success).toBe(true);

      const items = await client.inventory.list.query();
      expect(items).toHaveLength(0);
    });

    it('should validate JAN code format', async () => {
      await expect(
        client.inventory.create.mutate({
          janCode: '123',
          name: 'テスト商品',
          quantity: 10,
          price: 1000,
        }),
      ).rejects.toThrow();
    });

    it('should enforce unique JAN code', async () => {
      await client.inventory.create.mutate({
        janCode: '4901234567890',
        name: '商品1',
        quantity: 10,
        price: 1000,
      });

      await expect(
        client.inventory.create.mutate({
          janCode: '4901234567890',
          name: '商品2',
          quantity: 20,
          price: 2000,
        }),
      ).rejects.toThrow();
    });
  });
});
