import { buildAuctionTools } from './Auction/AuctionTools';
import { buildCatalogTools } from './Catalog/CatalogTools';
import { AIContext } from '../ContextEngine/ContextEngine';

export class ToolRegistry {
  
  /**
   * Assembles all tools available to the LLM based on the current context and permissions.
   */
  static getToolsForContext(context: AIContext) {
    
    const auctionTools = buildAuctionTools(context);
    const catalogTools = buildCatalogTools(context);
    
    // In a real implementation, you would selectively omit tools 
    // the user doesn't have permission for, so the LLM doesn't even see them.
    
    return {
      ...auctionTools,
      ...catalogTools,
    };
  }
}
