export interface INotificationProvider {
  channel: string;
  send(userId: string, subject: string, body: string, metadata?: any): Promise<boolean>;
}

export class ProviderRegistry {
  private providers: Map<string, INotificationProvider> = new Map();

  register(provider: INotificationProvider) {
    this.providers.set(provider.channel, provider);
  }

  get(channel: string): INotificationProvider | undefined {
    return this.providers.get(channel);
  }
}

export const providerRegistry = new ProviderRegistry();
