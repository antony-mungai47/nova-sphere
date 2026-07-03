import { z } from 'zod';

export class APIContractValidator {
  /**
   * Zod-based single source of truth for API validation.
   * Can be used to automatically generate OpenAPI schemas.
   * VERSION: v1 (FROZEN)
   */
  static validate(schema: z.ZodTypeAny, data: any) {
    const result = schema.safeParse(data);
    if (!result.success) {
      throw new Error(`Contract Validation Failed: ${result.error.message}`);
    }
    return result.data;
  }
}

// Frozen Schema for Orders v1
export const CreateOrderSchemaV1 = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive()
  })),
  currency: z.string().length(3),
  shippingAddress: z.object({
    countryCode: z.string().length(2),
    city: z.string()
  })
}).strict(); // strict() enforces no extra fields for freeze
