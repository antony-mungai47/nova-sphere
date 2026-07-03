import { MetricsEngine } from '../Operations/MetricsEngine';
import { RateLimitEngine } from './RateLimitEngine';
import { IdempotencyEngine } from './IdempotencyEngine';

export class APIGatewayEngine {
  /**
   * Applies Security Headers (Helmet Principles) and CORS policy
   */
  private static applySecurityHeaders(res: any) {
    if (res && res.setHeader) {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Access-Control-Allow-Origin', 'https://www.novasphere.com');
    }
  }

  /**
   * Orchestrates incoming requests (Routing, Auth, Rate Limit, Idempotency).
   * Contains NO business logic.
   */
  static async handleRequest(req: any, res: any, route: string, version: string): Promise<any> {
    const start = Date.now();
    try {
      this.applySecurityHeaders(res);

      // 1. Versioning
      if (!['v1', 'v2', 'partner', 'internal'].includes(version)) {
        throw new Error('Unsupported API Version');
      }

      // 2. Authentication & API Key Validation (Scaffolded)
      const clientId = req.headers['x-api-key'] || req.ip || 'anonymous';
      const tier = req.headers['x-api-key'] ? 'Partner' : 'Anonymous';

      // 3. Rate Limiting
      await RateLimitEngine.checkLimit(clientId, tier);

      // 4. Idempotency (For POST/PUT/PATCH)
      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const idempotencyKey = req.headers['idempotency-key'];
        if (idempotencyKey) {
          await IdempotencyEngine.check(idempotencyKey, clientId);
        }
      }

      // 5. Routing to internal engines (Scaffolded)
      const response = { status: 'success', data: 'Routed to internal engine' };

      // 6. Metrics & Logging
      MetricsEngine.recordLatency(`api.${version}.${route}`, Date.now() - start);
      return response;
      
    } catch (error: any) {
      MetricsEngine.incrementCounter(`api.${version}.errors`);
      throw error;
    }
  }
}
