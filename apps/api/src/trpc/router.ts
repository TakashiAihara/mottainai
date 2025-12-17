import { router } from './index';
import { categoryRouter } from './routers/category';
import { inventoryRouter } from './routers/inventory';

export const appRouter = router({
  inventory: inventoryRouter,
  category: categoryRouter,
});

export type AppRouter = typeof appRouter;
