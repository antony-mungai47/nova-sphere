export interface IAIProvider {
  generateText(prompt: string, options?: any): Promise<string>;
  streamText(prompt: string, options?: any): any;
  callFunction(name: string, args: any): Promise<any>;
}
