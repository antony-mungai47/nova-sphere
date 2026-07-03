export class MemoryEngine {
  
  /**
   * Short-lived commerce memory.
   * In a real implementation, this reads/writes to Redis with a TTL of ~24 hours.
   * Memory tracks user affinities discovered during the chat.
   */
  static async extractAffinities(messages: {role: string, content: string}[]): Promise<string[]> {
    const affinities: string[] = [];
    const text = messages.map(m => m.content).join(' ').toLowerCase();
    
    // Naive extraction for demonstration. 
    // In reality, you'd run a cheap LLM extraction or NLP keyword pass here.
    if (text.includes('watch') || text.includes('rolex')) affinities.push('luxury_watches');
    if (text.includes('gaming') || text.includes('laptop')) affinities.push('gaming_hardware');
    
    return affinities;
  }
}
