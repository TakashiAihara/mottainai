import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { inventoryItems } from '../../db/schema';
import { publicProcedure, router } from '../index';

export const inventoryRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    const items = await ctx.db.select().from(inventoryItems);
    return items.map((item) => ({
      ...item,
      price: item.price / 100,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    }));
  }),

  getByJanCode: publicProcedure
    .input(z.object({ janCode: z.string().length(13) }))
    .query(async ({ ctx, input }) => {
      const item = await ctx.db
        .select()
        .from(inventoryItems)
        .where(eq(inventoryItems.janCode, input.janCode))
        .limit(1);

      if (item.length === 0) {
        return null;
      }

      return {
        ...item[0],
        price: item[0].price / 100,
        createdAt: new Date(item[0].createdAt),
        updatedAt: new Date(item[0].updatedAt),
      };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const item = await ctx.db
        .select()
        .from(inventoryItems)
        .where(eq(inventoryItems.id, input.id))
        .limit(1);

      if (item.length === 0) {
        return null;
      }

      return {
        ...item[0],
        price: item[0].price / 100,
        createdAt: new Date(item[0].createdAt),
        updatedAt: new Date(item[0].updatedAt),
      };
    }),

  create: publicProcedure
    .input(
      z.object({
        janCode: z.string().length(13).regex(/^\d{13}$/),
        name: z.string().min(1).max(255),
        description: z.string().max(1000).optional(),
        quantity: z.number().int().min(0),
        price: z.number().min(0),
        categoryId: z.string().uuid().optional(),
        imageUrl: z.string().url().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const id = crypto.randomUUID();
      await ctx.db.insert(inventoryItems).values({
        id,
        janCode: input.janCode,
        name: input.name,
        description: input.description,
        quantity: input.quantity,
        price: Math.round(input.price * 100),
        categoryId: input.categoryId,
        imageUrl: input.imageUrl,
      });

      const [item] = await ctx.db
        .select()
        .from(inventoryItems)
        .where(eq(inventoryItems.id, id))
        .limit(1);

      return {
        ...item,
        price: item.price / 100,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      };
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().max(1000).optional(),
        quantity: z.number().int().min(0).optional(),
        price: z.number().min(0).optional(),
        categoryId: z.string().uuid().optional(),
        imageUrl: z.string().url().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      const updateData: Record<string, unknown> = {};

      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.quantity !== undefined) updateData.quantity = updates.quantity;
      if (updates.price !== undefined) updateData.price = Math.round(updates.price * 100);
      if (updates.categoryId !== undefined) updateData.categoryId = updates.categoryId;
      if (updates.imageUrl !== undefined) updateData.imageUrl = updates.imageUrl;

      await ctx.db.update(inventoryItems).set(updateData).where(eq(inventoryItems.id, id));

      const [item] = await ctx.db
        .select()
        .from(inventoryItems)
        .where(eq(inventoryItems.id, id))
        .limit(1);

      return {
        ...item,
        price: item.price / 100,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      };
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(inventoryItems).where(eq(inventoryItems.id, input.id));
      return { success: true };
    }),

  updateQuantity: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        delta: z.number().int(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [item] = await ctx.db
        .select()
        .from(inventoryItems)
        .where(eq(inventoryItems.id, input.id))
        .limit(1);

      if (!item) {
        throw new Error('Item not found');
      }

      const newQuantity = Math.max(0, item.quantity + input.delta);

      await ctx.db
        .update(inventoryItems)
        .set({ quantity: newQuantity })
        .where(eq(inventoryItems.id, input.id));

      const [updatedItem] = await ctx.db
        .select()
        .from(inventoryItems)
        .where(eq(inventoryItems.id, input.id))
        .limit(1);

      return {
        ...updatedItem,
        price: updatedItem.price / 100,
        createdAt: new Date(updatedItem.createdAt),
        updatedAt: new Date(updatedItem.updatedAt),
      };
    }),
});
