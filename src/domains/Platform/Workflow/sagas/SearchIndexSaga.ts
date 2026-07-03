import { inngest } from '@/lib/inngest/client';
import { SearchEngine } from '../../Intelligence/Search/SearchEngine';

export const searchIndexSaga = (inngest as any).createFunction(
  { id: 'search-index-saga', retries: 5 },
  { event: 'ProductPublished.v1' },
  async ({ event, step }: any) => {
    const { productId, tenantId } = event.data;

    await step.run('index-product-in-search', async () => {
      // In a real implementation we would fetch the product from Prisma
      // and shape the document for the search engine
      await SearchEngine.indexDocument(productId, { id: productId, tenantId });
    });
    
    return { success: true };
  }
);
