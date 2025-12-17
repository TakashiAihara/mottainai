import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { categories } from '../../db/schema';
import { publicProcedure, router } from '../index';

export const categoryRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    const items = await ctx.db.select().from(categories);
    return items.map((item) => ({
      ...item,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    }));
  }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const id = crypto.randomUUID();
      await ctx.db.insert(categories).values({
        id,
        name: input.name,
        description: input.description,
      });

      const [item] = await ctx.db.select().from(categories).where(eq(categories.id, id)).limit(1);

      return {
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      };
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(categories).where(eq(categories.id, input.id));
      return { success: true };
    }),
});
