// Platform SDK Scaffold
export class NovaSphereClient {
  constructor(private apiKey: string, private baseUrl: string = 'https://api.novasphere.com/v1') {}

  async createOrder(payload: any) {
    // Scaffold: fetch(this.baseUrl + '/orders', { method: 'POST', body: JSON.stringify(payload) })
    console.log(`[NovaSphere SDK] Creating order...`);
  }
}
