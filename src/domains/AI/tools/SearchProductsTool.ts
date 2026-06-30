export const SearchProductsTool = {
  name: 'SearchProducts',
  description: 'Searches the catalog for products matching a query, category, or price range.',
  execute: async (args: { query: string; maxPrice?: number }) => {
    console.log(`[Tool:SearchProducts] Executing search for ${args.query}`);
    return { results: [] };
  }
};
